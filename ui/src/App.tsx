import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import
{
    ConnectButton,
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { ConfigNotice } from './components/ConfigNotice';
import { SectionHeader } from './components/SectionHeader';
import { StatCard } from './components/StatCard';
import { appConfig, isConfigured, typeConfig } from './lib/config';
import { formatTokenAmount, shortAddress, toBaseUnits } from './lib/format';

type MoveFields = Record<string, unknown>;

type SuiObjectData = {
    objectId?: string;
    content?: {
        dataType?: string;
        fields?: unknown;
    } | null;
};

type SuiTransactionBlockResponse = {
    digest: string;
};

type EventRow = {
    type: string;
    title: string;
    detail: string;
    digest: string;
    timestamp: string;
    timestampMs: number;
};

type OwnedObjectEntry = {
    data?: SuiObjectData | null;
};

type QueriedEvent = {
    id: { txDigest: string };
    parsedJson?: Record<string, unknown> | null;
    timestampMs?: string | null;
};

const comparisonRows = [
    {
        topic: 'Access control',
        ethereum: 'Ownable / AccessControl tied to addresses and mappings.',
        sui: 'Capability objects such as AdminCap grant rights by ownership.',
    },
    {
        topic: 'State model',
        ethereum: 'State lives inside the contract storage.',
        sui: 'State lives in owned and shared Move objects.',
    },
    {
        topic: 'Admin data',
        ethereum: 'Usually hidden in storage slots unless surfaced manually.',
        sui: 'TreasuryState is a first-class shared object readable by anyone.',
    },
    {
        topic: 'Composability',
        ethereum: 'Client usually triggers one contract call per action.',
        sui: 'Programmable Transaction Blocks compose multiple actions atomically.',
    },
    {
        topic: 'Event indexing',
        ethereum: 'Events are indexed mostly by topic.',
        sui: 'Events are indexed by sender, type, object IDs and timestamps.',
    },
];

function getFields(data?: SuiObjectData | null): MoveFields | null
{
    const content = data?.content as { dataType?: string; fields?: unknown } | undefined;
    if (content?.dataType !== 'moveObject' || !content.fields || typeof content.fields !== 'object' || Array.isArray(content.fields)) {
        return null;
    }

    return content.fields as MoveFields;
}

function toStringValue(value: unknown, fallback = '0'): string
{
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
        return String(value);
    }
    return fallback;
}

function toBool(value: unknown): boolean
{
    return value === true || value === 'true';
}

function formatTimestamp(value: string | null | undefined)
{
    if (!value) return 'Pending index';
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) return 'Pending index';
    return date.toLocaleString();
}

function toTimestampNumber(value: string | null | undefined)
{
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function App()
{
    const client = useSuiClient();
    const queryClient = useQueryClient();
    const currentAccount = useCurrentAccount();
    const currentAddress = currentAccount?.address;

    const [mintRecipient, setMintRecipient] = useState('');
    const [mintAmount, setMintAmount] = useState('');
    const [selectedCoinId, setSelectedCoinId] = useState('');
    const [nextAdmin, setNextAdmin] = useState('');
    const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

    const treasuryStateQuery = useQuery({
        queryKey: ['crozz-admin', 'treasury-state', appConfig.treasuryStateId, appConfig.network],
        enabled: !appConfig.treasuryStateId.includes('YOUR_TREASURY_STATE_ID'),
        queryFn: () =>
            client.getObject({
                id: appConfig.treasuryStateId,
                options: { showContent: true, showType: true, showOwner: true },
            }),
    });

    const adminCapsQuery = useQuery({
        queryKey: ['crozz-admin', 'admin-caps', currentAddress, appConfig.packageId],
        enabled: Boolean(currentAddress) && !appConfig.packageId.includes('YOUR_PACKAGE_ID'),
        queryFn: () =>
            client.getOwnedObjects({
                owner: currentAddress!,
                filter: { StructType: typeConfig.adminCapType },
                options: { showContent: true, showType: true, showOwner: true },
            }),
    });

    const treasuryCapsQuery = useQuery({
        queryKey: ['crozz-admin', 'treasury-caps', currentAddress, appConfig.coinType],
        enabled: Boolean(currentAddress) && !appConfig.coinType.includes('YOUR_PACKAGE_ID'),
        queryFn: () =>
            client.getOwnedObjects({
                owner: currentAddress!,
                filter: { StructType: typeConfig.treasuryCapType },
                options: { showContent: true, showType: true, showOwner: true },
            }),
    });

    const coinObjectsQuery = useQuery({
        queryKey: ['crozz-admin', 'coin-objects', currentAddress, appConfig.coinType],
        enabled: Boolean(currentAddress) && !appConfig.coinType.includes('YOUR_PACKAGE_ID'),
        queryFn: () =>
            client.getOwnedObjects({
                owner: currentAddress!,
                filter: { StructType: typeConfig.coinObjectType },
                options: { showContent: true, showType: true, showOwner: true },
            }),
    });

    const mintEventsQuery = useQuery({
        queryKey: ['crozz-admin', 'events', 'mint', appConfig.packageId],
        enabled: !appConfig.packageId.includes('YOUR_PACKAGE_ID'),
        queryFn: () =>
            client.queryEvents({
                query: { MoveEventType: typeConfig.mintEventType },
                limit: 6,
                order: 'descending',
            }),
    });

    const burnEventsQuery = useQuery({
        queryKey: ['crozz-admin', 'events', 'burn', appConfig.packageId],
        enabled: !appConfig.packageId.includes('YOUR_PACKAGE_ID'),
        queryFn: () =>
            client.queryEvents({
                query: { MoveEventType: typeConfig.burnEventType },
                limit: 6,
                order: 'descending',
            }),
    });

    const pauseEventsQuery = useQuery({
        queryKey: ['crozz-admin', 'events', 'pause', appConfig.packageId],
        enabled: !appConfig.packageId.includes('YOUR_PACKAGE_ID'),
        queryFn: () =>
            client.queryEvents({
                query: { MoveEventType: typeConfig.pauseEventType },
                limit: 6,
                order: 'descending',
            }),
    });

    const adminObjects = (adminCapsQuery.data?.data ?? []) as OwnedObjectEntry[];
    const treasuryCapObjects = (treasuryCapsQuery.data?.data ?? []) as OwnedObjectEntry[];
    const ownedCoinObjects = (coinObjectsQuery.data?.data ?? []) as OwnedObjectEntry[];

    const resolvedAdminCapId =
        adminObjects[0]?.data?.objectId ??
        (appConfig.adminCapId.includes('YOUR_ADMIN_CAP_ID') ? '' : appConfig.adminCapId);
    const resolvedTreasuryCapId =
        treasuryCapObjects[0]?.data?.objectId ??
        (appConfig.treasuryCapId.includes('YOUR_TREASURY_CAP_ID') ? '' : appConfig.treasuryCapId);

    const treasuryStateFields = getFields(treasuryStateQuery.data?.data);
    const isPaused = toBool(treasuryStateFields?.is_paused);
    const adminAddress = toStringValue(treasuryStateFields?.admin, '—');
    const totalMintedRaw = toStringValue(treasuryStateFields?.total_minted);
    const totalBurnedRaw = toStringValue(treasuryStateFields?.total_burned);
    const circulatingRaw = (BigInt(totalMintedRaw || '0') - BigInt(totalBurnedRaw || '0')).toString();

    const coinRows = useMemo(
        () =>
            ownedCoinObjects.map((item: OwnedObjectEntry) =>
            {
                const data = item.data;
                const fields = getFields(data);
                return {
                    id: data?.objectId ?? 'unknown',
                    balance: toStringValue(fields?.balance),
                };
            }),
        [ownedCoinObjects],
    );

    const walletBalanceRaw = coinRows.reduce<bigint>(
        (acc, coin: { id: string; balance: string }) => acc + BigInt(coin.balance || '0'),
        BigInt(0),
    );

    const recentEvents = useMemo(() =>
    {
        const mintRows = ((mintEventsQuery.data?.data ?? []) as QueriedEvent[]).map((event: QueriedEvent) =>
        {
            const parsed = (event.parsedJson ?? {}) as Record<string, unknown>;
            return {
                type: 'Mint',
                title: `Minted ${formatTokenAmount(toStringValue(parsed.amount), appConfig.tokenDecimals)} ${appConfig.tokenSymbol}`,
                detail: `Recipient ${shortAddress(toStringValue(parsed.recipient, '0x0'))}`,
                digest: event.id.txDigest,
                timestamp: formatTimestamp(event.timestampMs),
                timestampMs: toTimestampNumber(event.timestampMs),
            } satisfies EventRow;
        });

        const burnRows = ((burnEventsQuery.data?.data ?? []) as QueriedEvent[]).map((event: QueriedEvent) =>
        {
            const parsed = (event.parsedJson ?? {}) as Record<string, unknown>;
            return {
                type: 'Burn',
                title: `Burned ${formatTokenAmount(toStringValue(parsed.amount), appConfig.tokenDecimals)} ${appConfig.tokenSymbol}`,
                detail: `Total burned ${formatTokenAmount(toStringValue(parsed.total_burned), appConfig.tokenDecimals)} ${appConfig.tokenSymbol}`,
                digest: event.id.txDigest,
                timestamp: formatTimestamp(event.timestampMs),
                timestampMs: toTimestampNumber(event.timestampMs),
            } satisfies EventRow;
        });

        const pauseRows = ((pauseEventsQuery.data?.data ?? []) as QueriedEvent[]).map((event: QueriedEvent) =>
        {
            const parsed = (event.parsedJson ?? {}) as Record<string, unknown>;
            const paused = toBool(parsed.is_paused);
            return {
                type: 'Pause',
                title: paused ? 'Admin operations paused' : 'Admin operations resumed',
                detail: `Triggered by ${shortAddress(toStringValue(parsed.admin, '0x0'))}`,
                digest: event.id.txDigest,
                timestamp: formatTimestamp(event.timestampMs),
                timestampMs: toTimestampNumber(event.timestampMs),
            } satisfies EventRow;
        });

        return [...mintRows, ...burnRows, ...pauseRows].sort((a, b) => b.timestampMs - a.timestampMs).slice(0, 8);
    }, [burnEventsQuery.data?.data, mintEventsQuery.data?.data, pauseEventsQuery.data?.data]);

    const canRunAdminAction = Boolean(currentAddress && resolvedAdminCapId && resolvedTreasuryCapId && isConfigured);

    const txMutation = useSignAndExecuteTransaction<SuiTransactionBlockResponse>({
        execute: async ({ bytes, signature }) =>
            await client.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                    showRawEffects: true,
                },
            }),
    });

    const runAdminTransaction = (transaction: Transaction, successMessage: string) =>
    {
        setFeedback(null);
        txMutation.mutate(
            {
                transaction,
                chain: `sui:${appConfig.network}`,
            },
            {
                onSuccess: async (result) =>
                {
                    setFeedback({
                        kind: 'success',
                        message: `${successMessage} Digest: ${result.digest}`,
                    });
                    await queryClient.invalidateQueries({ queryKey: ['crozz-admin'] });
                },
                onError: (error) =>
                {
                    setFeedback({ kind: 'error', message: error.message });
                },
            },
        );
    };

    const onMint = () =>
    {
        try {
            const amount = toBaseUnits(mintAmount, appConfig.tokenDecimals);
            const recipient = mintRecipient.trim() || currentAddress;
            if (!recipient) throw new Error('Connect a wallet or enter a recipient address.');
            if (!resolvedAdminCapId || !resolvedTreasuryCapId) {
                throw new Error('AdminCap or TreasuryCap could not be resolved for this wallet.');
            }

            const tx = new Transaction();
            tx.moveCall({
                target: `${appConfig.packageId}::crozz_coin::mint`,
                arguments: [
                    tx.object(resolvedAdminCapId),
                    tx.object(resolvedTreasuryCapId),
                    tx.object(appConfig.treasuryStateId),
                    tx.pure.u64(amount),
                    tx.pure.address(recipient),
                ],
            });

            runAdminTransaction(tx, 'Mint transaction submitted.');
        } catch (error) {
            setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Mint failed.' });
        }
    };

    const onBurn = () =>
    {
        try {
            if (!selectedCoinId) throw new Error('Select a CROZZ coin object to burn.');
            if (!resolvedAdminCapId || !resolvedTreasuryCapId) {
                throw new Error('AdminCap or TreasuryCap could not be resolved for this wallet.');
            }

            const tx = new Transaction();
            tx.moveCall({
                target: `${appConfig.packageId}::crozz_coin::burn`,
                arguments: [
                    tx.object(resolvedAdminCapId),
                    tx.object(resolvedTreasuryCapId),
                    tx.object(appConfig.treasuryStateId),
                    tx.object(selectedCoinId),
                ],
            });

            runAdminTransaction(tx, 'Burn transaction submitted.');
        } catch (error) {
            setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Burn failed.' });
        }
    };

    const onTogglePause = () =>
    {
        try {
            if (!resolvedAdminCapId) throw new Error('AdminCap could not be resolved for this wallet.');

            const tx = new Transaction();
            tx.moveCall({
                target: `${appConfig.packageId}::crozz_coin::set_pause`,
                arguments: [
                    tx.object(resolvedAdminCapId),
                    tx.object(appConfig.treasuryStateId),
                    tx.pure.bool(!isPaused),
                ],
            });

            runAdminTransaction(tx, isPaused ? 'Admin operations resumed.' : 'Admin operations paused.');
        } catch (error) {
            setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Pause toggle failed.' });
        }
    };

    const onTransferAdmin = () =>
    {
        try {
            const newAdmin = nextAdmin.trim();
            if (!newAdmin) throw new Error('Enter the new admin address.');
            if (!resolvedAdminCapId) throw new Error('AdminCap could not be resolved for this wallet.');

            const tx = new Transaction();
            tx.moveCall({
                target: `${appConfig.packageId}::crozz_coin::transfer_admin`,
                arguments: [
                    tx.object(resolvedAdminCapId),
                    tx.object(appConfig.treasuryStateId),
                    tx.pure.address(newAdmin),
                ],
            });

            runAdminTransaction(tx, 'Admin capability transfer submitted.');
        } catch (error) {
            setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Admin transfer failed.' });
        }
    };

    return (
        <div className="app-shell">
            <section className="hero">
                <div className="panel hero-copy">
                    <span className="eyebrow">CROZZ COIN 2.0 · Admin Control Plane</span>
                    <h1>Operate the token the Sui way.</h1>
                    <p>
                        This dashboard connects a React admin frontend to your Move package, using
                        capability objects, shared state, and programmable transaction blocks instead of
                        Solidity-style contract storage assumptions.
                    </p>

                    <div className="hero-actions">
                        <a className="action-link" href="https://docs.sui.io/guides/developer/getting-started/app-frontends" target="_blank" rel="noreferrer">
                            Sui frontend guide
                        </a>
                        <a className="action-link" href="https://docs.sui.io/concepts/sui-for-ethereum" target="_blank" rel="noreferrer">
                            Ethereum → Sui concepts
                        </a>
                    </div>

                    <ConfigNotice />
                </div>

                <div className="panel hero-side">
                    <div className="logo-row">
                        <img src={appConfig.tokenIconUrl} alt="CROZZ logo" />
                        <div>
                            <strong>{appConfig.tokenSymbol} admin dashboard</strong>
                            <div className="muted">Network: {appConfig.network}</div>
                        </div>
                    </div>

                    <div className="wallet-box">
                        <div>
                            <div className="panel-label">Connected wallet</div>
                            <strong>{currentAddress ? shortAddress(currentAddress) : 'Not connected'}</strong>
                            <div className="panel-hint">Connect a Sui wallet to sign PTBs.</div>
                        </div>
                        <ConnectButton />
                    </div>

                    <div className={`status-chip ${isPaused ? '' : 'positive'}`}>
                        {isPaused ? 'Paused admin flow' : 'Admin flow active'}
                    </div>

                    <div className="pill-row">
                        <span className="pill">Package {shortAddress(appConfig.packageId)}</span>
                        <span className="pill">Coin {appConfig.tokenSymbol}</span>
                        <span className="pill">Decimals {appConfig.tokenDecimals}</span>
                    </div>
                </div>
            </section>

            <SectionHeader
                eyebrow="On-chain state"
                title="Visibility over owned and shared objects"
                description="Sui stores admin rights and state as objects, so the UI can inspect them directly instead of reverse-engineering storage slots."
            />

            <div className="metrics-grid">
                <StatCard
                    label="Total minted"
                    value={`${formatTokenAmount(totalMintedRaw, appConfig.tokenDecimals)} ${appConfig.tokenSymbol}`}
                    hint="Tracked in TreasuryState"
                />
                <StatCard
                    label="Total burned"
                    value={`${formatTokenAmount(totalBurnedRaw, appConfig.tokenDecimals)} ${appConfig.tokenSymbol}`}
                    hint="Tracked in TreasuryState"
                />
                <StatCard
                    label="Approx. circulating"
                    value={`${formatTokenAmount(circulatingRaw, appConfig.tokenDecimals)} ${appConfig.tokenSymbol}`}
                    hint="Minted minus burned"
                />
                <StatCard
                    label="Wallet CROZZ balance"
                    value={`${formatTokenAmount(walletBalanceRaw, appConfig.tokenDecimals)} ${appConfig.tokenSymbol}`}
                    hint="Summed from address-owned coin objects"
                />
            </div>

            <div className="card-grid" style={{ marginTop: 16 }}>
                <div className="panel content-panel">
                    <h3>Shared TreasuryState</h3>
                    <div className="kv-list">
                        <div className="kv-item">
                            <span>State object ID</span>
                            <code>{shortAddress(appConfig.treasuryStateId)}</code>
                        </div>
                        <div className="kv-item">
                            <span>Admin address</span>
                            <code>{shortAddress(adminAddress)}</code>
                        </div>
                        <div className="kv-item">
                            <span>TreasuryCap ID on record</span>
                            <code>{shortAddress(toStringValue(treasuryStateFields?.treasury_cap_id, '—'))}</code>
                        </div>
                        <div className="kv-item">
                            <span>Paused</span>
                            <strong>{isPaused ? 'Yes' : 'No'}</strong>
                        </div>
                        <div className="kv-item">
                            <span>Version</span>
                            <strong>{toStringValue(treasuryStateFields?.version, '—')}</strong>
                        </div>
                    </div>
                </div>

                <div className="panel content-panel">
                    <h3>Wallet-owned capability objects</h3>
                    <div className="info-grid">
                        <div className="summary-box">
                            <h4>AdminCap</h4>
                            <p>{resolvedAdminCapId ? shortAddress(resolvedAdminCapId) : 'Not found for this wallet'}</p>
                        </div>
                        <div className="summary-box">
                            <h4>TreasuryCap</h4>
                            <p>{resolvedTreasuryCapId ? shortAddress(resolvedTreasuryCapId) : 'Not found for this wallet'}</p>
                        </div>
                    </div>

                    <p className="small-note">
                        In Sui, capability objects are the primary access-control primitive. If the wallet does not own these objects, the admin PTBs will fail at the protocol level.
                    </p>
                </div>
            </div>

            <SectionHeader
                eyebrow="Admin PTBs"
                title="Mint, burn, pause, transfer admin"
                description="Each action is built client-side as a programmable transaction block and signed by the connected wallet."
            />

            <div className="dual-grid">
                <div className="panel content-panel">
                    <h3>Mint CROZZ</h3>
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="mint-recipient">Recipient address</label>
                            <input
                                id="mint-recipient"
                                value={mintRecipient}
                                onChange={(event) => setMintRecipient(event.target.value)}
                                placeholder={currentAddress || '0x...'}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="mint-amount">Amount</label>
                            <input
                                id="mint-amount"
                                value={mintAmount}
                                onChange={(event) => setMintAmount(event.target.value)}
                                placeholder="1000"
                            />
                        </div>
                        <button className="primary-button" onClick={onMint} disabled={!canRunAdminAction || txMutation.isPending}>
                            {txMutation.isPending ? 'Submitting…' : 'Mint tokens'}
                        </button>
                    </div>
                </div>

                <div className="panel content-panel">
                    <h3>Burn CROZZ</h3>
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="coin-object">Coin object</label>
                            <select
                                id="coin-object"
                                value={selectedCoinId}
                                onChange={(event) => setSelectedCoinId(event.target.value)}
                            >
                                <option value="">Select a CROZZ coin object</option>
                                {coinRows.map((coin: { id: string; balance: string }) => (
                                    <option key={coin.id} value={coin.id}>
                                        {shortAddress(coin.id)} · {formatTokenAmount(coin.balance, appConfig.tokenDecimals)} {appConfig.tokenSymbol}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="secondary-button" onClick={onBurn} disabled={!canRunAdminAction || txMutation.isPending}>
                            {txMutation.isPending ? 'Submitting…' : 'Burn selected coin'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="dual-grid" style={{ marginTop: 16 }}>
                <div className="panel content-panel">
                    <h3>Pause / resume admin flow</h3>
                    <p>
                        This toggles a shared-object flag. When paused, mint and burn abort before touching supply.
                    </p>
                    <div className="inline-actions">
                        <button className="secondary-button" onClick={onTogglePause} disabled={!canRunAdminAction || txMutation.isPending}>
                            {isPaused ? 'Resume admin operations' : 'Pause admin operations'}
                        </button>
                        <span className={`pill ${isPaused ? 'warning' : 'positive'}`}>{isPaused ? 'Paused' : 'Active'}</span>
                    </div>
                </div>

                <div className="panel content-panel">
                    <h3>Transfer AdminCap</h3>
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="next-admin">New admin address</label>
                            <input
                                id="next-admin"
                                value={nextAdmin}
                                onChange={(event) => setNextAdmin(event.target.value)}
                                placeholder="0x..."
                            />
                        </div>
                        <button className="secondary-button" onClick={onTransferAdmin} disabled={!resolvedAdminCapId || txMutation.isPending}>
                            {txMutation.isPending ? 'Submitting…' : 'Transfer AdminCap'}
                        </button>
                    </div>
                    <p className="small-note">This transfers the capability object itself, matching Sui’s recommended capability-based model.</p>
                </div>
            </div>

            {feedback ? (
                <div className="transaction-box" style={{ marginTop: 16 }}>
                    <strong className={feedback.kind === 'success' ? 'success-note' : 'error-note'}>{feedback.message}</strong>
                </div>
            ) : null}

            <SectionHeader
                eyebrow="Ethereum → Sui"
                title="What changed in the smart contract"
                description="These UI panels mirror the concepts in the Sui-for-Ethereum guide and the new features added to your Move package."
            />

            <div className="card-grid">
                <div className="panel content-panel">
                    <h3>Concept mapping</h3>
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Topic</th>
                                <th>Ethereum mindset</th>
                                <th>Sui implementation here</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonRows.map((row) => (
                                <tr key={row.topic}>
                                    <td><strong>{row.topic}</strong></td>
                                    <td>{row.ethereum}</td>
                                    <td>{row.sui}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="panel content-panel">
                    <h3>Features now exposed by the contract</h3>
                    <div className="kv-list">
                        <div className="kv-item">
                            <span>Capability object</span>
                            <strong>`AdminCap` gates admin-only actions.</strong>
                        </div>
                        <div className="kv-item">
                            <span>Shared object</span>
                            <strong>`TreasuryState` exposes admin, pause state, totals, and version.</strong>
                        </div>
                        <div className="kv-item">
                            <span>Events</span>
                            <strong>`MintEvent`, `BurnEvent`, `PauseEvent`, `AdminTransferredEvent`.</strong>
                        </div>
                        <div className="kv-item">
                            <span>PTB-friendly admin flow</span>
                            <strong>Mint, burn, pause, and transfer admin all execute through client-built PTBs.</strong>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                eyebrow="Activity"
                title="Recent on-chain events"
                description="The dashboard reads the custom Move events emitted by your package so operators can see what happened without scraping raw effects."
            />

            <div className="panel content-panel">
                {recentEvents.length ? (
                    <div className="kv-list">
                        {recentEvents.map((event) => (
                            <div key={`${event.type}-${event.digest}`} className="event-item">
                                <strong className="event-type">{event.type}</strong>
                                <strong>{event.title}</strong>
                                <span>{event.detail}</span>
                                <span className="mono">Digest {shortAddress(event.digest)}</span>
                                <span>{event.timestamp}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">No indexed events yet. Once you mint, burn, or pause, they will show up here.</div>
                )}
            </div>

            <p className="footer-note">
                Built for Sui object ownership, capability-based admin control, and PTB-driven operations.
            </p>
        </div>
    );
}