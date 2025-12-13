/**
 * Smart Contract Interaction Component
 * 
 * Demonstrates how to use useGreeting and useTokenCreator hooks
 * to interact with Move smart contracts on Sui
 */

// TODO: Implement hooks and update import path accordingly
// import { useGreeting, useTokenCreator } from '@/hooks/useSmartContracts';
const useGreeting = (_opts?: any) => ({
  loading: false,
  error: null as any,
  createGreeting: () => {},
  updateGreeting: (_id: string, _text: string) => {},
  transferOwnership: (_id: string, _owner: string) => {},
});
const useTokenCreator = (_opts?: any) => ({
  loading: false,
  error: null as any,
  createToken: (_payload: any) => {},
  pauseToken: (_configId: string) => {},
  unpauseToken: (_configId: string) => {},
  freezeAddress: (_configId: string, _addr: string) => {},
  unfreezeAddress: (_configId: string, _addr: string) => {},
  updateMetadata: (_metadataId: string, _name: string, _desc: string, _url: string) => {},
  lockMetadata: (_configId: string) => {},
});
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import styles from './SmartContractDemo.module.css';

export function SmartContractDemo() {
  const account = useCurrentAccount();
  const greeting = useGreeting({
    packageId: import.meta.env.VITE_GREETING_PACKAGE_ID || '',
  });
  const tokenCreator = useTokenCreator({
    packageId: import.meta.env.VITE_TOKEN_PACKAGE_ID || '',
  });

  // Greeting state
  const [greetingId, setGreetingId] = useState('');
  const [newGreetingText, setNewGreetingText] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [greetingTab, setGreetingTab] = useState<'create' | 'update' | 'transfer'>('create');

  // Token state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(6);
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenIconUrl, setTokenIconUrl] = useState('');
  const [configId, setConfigId] = useState('');
  const [addressToFreeze, setAddressToFreeze] = useState('');
  const [tokenTab, setTokenTab] = useState<'create' | 'manage' | 'metadata'>('create');

  if (!account) {
    return (
      <div className={styles.container}>
        <div className={styles.alert}>
          Please connect your wallet to interact with smart contracts
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Smart Contract Interaction Demo</h1>
      <p className={styles.subtitle}>
        Interact with Greeting and Token Creator modules on Sui
      </p>

      <div className={styles.grid}>
        {/* Greeting Section */}
        <section className={styles.section}>
          <h2>👋 Greeting Module</h2>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${greetingTab === 'create' ? styles.active : ''}`}
              onClick={() => setGreetingTab('create')}
            >
              Create
            </button>
            <button
              className={`${styles.tab} ${greetingTab === 'update' ? styles.active : ''}`}
              onClick={() => setGreetingTab('update')}
            >
              Update
            </button>
            <button
              className={`${styles.tab} ${greetingTab === 'transfer' ? styles.active : ''}`}
              onClick={() => setGreetingTab('transfer')}
            >
              Transfer
            </button>
          </div>

          <div className={styles.content}>
            {greetingTab === 'create' && (
              <div className={styles.formGroup}>
                <p className={styles.description}>
                  Create a new shared greeting initialized with "Hello world!"
                </p>
                <button
                  className={styles.button}
                  onClick={() => greeting.createGreeting()}
                  disabled={greeting.loading}
                >
                  {greeting.loading ? 'Creating...' : 'Create Greeting'}
                </button>
              </div>
            )}

            {greetingTab === 'update' && (
              <div className={styles.formGroup}>
                <p className={styles.description}>
                  Update greeting text (max 280 characters)
                </p>
                <input
                  type="text"
                  placeholder="Greeting ID"
                  value={greetingId}
                  onChange={(e) => setGreetingId(e.target.value)}
                  className={styles.input}
                />
                <textarea
                  placeholder="New greeting text (max 280 chars)"
                  value={newGreetingText}
                  onChange={(e) => setNewGreetingText(e.target.value.slice(0, 280))}
                  maxLength={280}
                  className={styles.textarea}
                />
                <div className={styles.charCount}>
                  {newGreetingText.length}/280 characters
                </div>
                <button
                  className={styles.button}
                  onClick={() => greeting.updateGreeting(greetingId, newGreetingText)}
                  disabled={greeting.loading || !greetingId || !newGreetingText}
                >
                  {greeting.loading ? 'Updating...' : 'Update Greeting'}
                </button>
              </div>
            )}

            {greetingTab === 'transfer' && (
              <div className={styles.formGroup}>
                <p className={styles.description}>
                  Transfer greeting ownership to another address
                </p>
                <input
                  type="text"
                  placeholder="Greeting ID"
                  value={greetingId}
                  onChange={(e) => setGreetingId(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="New owner address"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className={styles.input}
                />
                <button
                  className={styles.button}
                  onClick={() => greeting.transferOwnership(greetingId, newOwner)}
                  disabled={greeting.loading || !greetingId || !newOwner}
                >
                  {greeting.loading ? 'Transferring...' : 'Transfer Ownership'}
                </button>
              </div>
            )}

            {greeting.error && (
              <div className={styles.error}>
                Error: {greeting.error.message}
              </div>
            )}
          </div>
        </section>

        {/* Token Creator Section */}
        <section className={styles.section}>
          <h2>💰 Token Creator Module</h2>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tokenTab === 'create' ? styles.active : ''}`}
              onClick={() => setTokenTab('create')}
            >
              Create
            </button>
            <button
              className={`${styles.tab} ${tokenTab === 'manage' ? styles.active : ''}`}
              onClick={() => setTokenTab('manage')}
            >
              Manage
            </button>
            <button
              className={`${styles.tab} ${tokenTab === 'metadata' ? styles.active : ''}`}
              onClick={() => setTokenTab('metadata')}
            >
              Metadata
            </button>
          </div>

          <div className={styles.content}>
            {tokenTab === 'create' && (
              <div className={styles.formGroup}>
                <p className={styles.description}>
                  Create a new token with custom configuration
                </p>
                <input
                  type="text"
                  placeholder="Token Name (max 100 chars)"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value.slice(0, 100))}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Symbol (e.g., CROZ)"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().slice(0, 20))}
                  className={styles.input}
                />
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>Decimals (0-9)</label>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={tokenDecimals}
                      onChange={(e) => setTokenDecimals(parseInt(e.target.value) || 0)}
                      className={styles.input}
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Description (max 1000 chars)"
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value.slice(0, 1000))}
                  maxLength={1000}
                  className={styles.textarea}
                />
                <input
                  type="url"
                  placeholder="Icon URL"
                  value={tokenIconUrl}
                  onChange={(e) => setTokenIconUrl(e.target.value)}
                  className={styles.input}
                />
                <button
                  className={styles.button}
                  onClick={() =>
                    tokenCreator.createToken({
                      name: tokenName,
                      symbol: tokenSymbol,
                      decimals: tokenDecimals,
                      description: tokenDescription,
                      iconUrl: tokenIconUrl,
                      moduleName: tokenName.toLowerCase().replace(/\s/g, '_'),
                      initialSupply: 1000000,
                      isMintable: true,
                      isFreezable: true,
                      isPausable: true,
                      treasuryCapHolder: account.address,
                      supplyRecipient: account.address,
                    })
                  }
                  disabled={
                    tokenCreator.loading || !tokenName || !tokenSymbol || !tokenDescription
                  }
                >
                  {tokenCreator.loading ? 'Creating...' : 'Create Token'}
                </button>
              </div>
            )}

            {tokenTab === 'manage' && (
              <div className={styles.formGroup}>
                <p className={styles.description}>
                  Manage token pause/unpause and address freezing (admin only)
                </p>
                <input
                  type="text"
                  placeholder="Config ID"
                  value={configId}
                  onChange={(e) => setConfigId(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.buttonRow}>
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => tokenCreator.pauseToken(configId)}
                    disabled={tokenCreator.loading || !configId}
                  >
                    {tokenCreator.loading ? 'Processing...' : 'Pause Token'}
                  </button>
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => tokenCreator.unpauseToken(configId)}
                    disabled={tokenCreator.loading || !configId}
                  >
                    {tokenCreator.loading ? 'Processing...' : 'Unpause Token'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Address to freeze"
                  value={addressToFreeze}
                  onChange={(e) => setAddressToFreeze(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.buttonRow}>
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => tokenCreator.freezeAddress(configId, addressToFreeze)}
                    disabled={tokenCreator.loading || !configId || !addressToFreeze}
                  >
                    {tokenCreator.loading ? 'Processing...' : 'Freeze Address'}
                  </button>
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => tokenCreator.unfreezeAddress(configId, addressToFreeze)}
                    disabled={tokenCreator.loading || !configId || !addressToFreeze}
                  >
                    {tokenCreator.loading ? 'Processing...' : 'Unfreeze Address'}
                  </button>
                </div>
              </div>
            )}

            {tokenTab === 'metadata' && (
              <div className={styles.formGroup}>
                <p className={styles.description}>
                  Update token metadata (requires metadata to be mutable)
                </p>
                <input
                  type="text"
                  placeholder="Metadata ID"
                  value={configId}
                  onChange={(e) => setConfigId(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="New name"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className={styles.input}
                />
                <textarea
                  placeholder="New description"
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  className={styles.textarea}
                />
                <input
                  type="url"
                  placeholder="New icon URL"
                  value={tokenIconUrl}
                  onChange={(e) => setTokenIconUrl(e.target.value)}
                  className={styles.input}
                />
                <button
                  className={styles.button}
                  onClick={() =>
                    tokenCreator.updateMetadata(configId, tokenName, tokenDescription, tokenIconUrl)
                  }
                  disabled={
                    tokenCreator.loading || !configId || !tokenName || !tokenDescription
                  }
                >
                  {tokenCreator.loading ? 'Updating...' : 'Update Metadata'}
                </button>
                <button
                  className={`${styles.button} ${styles.warning}`}
                  onClick={() => tokenCreator.lockMetadata(configId)}
                  disabled={tokenCreator.loading || !configId}
                >
                  {tokenCreator.loading ? 'Locking...' : 'Lock Metadata (Permanent)'}
                </button>
              </div>
            )}

            {tokenCreator.error && (
              <div className={styles.error}>
                Error: {tokenCreator.error.message}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={styles.info}>
        <h3>ℹ️ Info</h3>
        <p>Connected Account: <code>{account.address.slice(0, 10)}...</code></p>
        <p>Set the following environment variables for smart contracts:</p>
        <code>REACT_APP_GREETING_PACKAGE_ID=your_greeting_package_id</code><br/>
        <code>REACT_APP_TOKEN_PACKAGE_ID=your_token_package_id</code>
      </div>
    </div>
  );
}

export default SmartContractDemo;
