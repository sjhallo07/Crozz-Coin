import { Box, Callout, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * Sui Wallet Standard overview from https://docs.sui.io/standards/wallet-standard.
 */
export function WalletStandardInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Wallet Standard (Sui)</Heading>
      <Text size="2" color="gray" mb="3">
        Cross-chain wallet discovery & interaction contract. Implement via <code>@mysten/wallet-standard</code> types,
        expose standard features, and register your wallet so dApps can detect it automatically.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Core ideas</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Implement the <code>Wallet</code> interface (name, icon, chains, version) and register with <code>registerWallet()</code>.</Text></li>
          <li><Text size="2">Use <code>ReadonlyWalletAccount</code> to expose accounts with address, public key, supported chains/features.</Text></li>
          <li><Text size="2">Provide automatic account restoration on load; <code>accounts</code> should include previously authorized accounts.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Required features</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>Core</strong>: <code>standard:connect</code> (authorize accounts), <code>standard:events</code> (change events).</Text></li>
          <li><Text size="2"><strong>Transactions</strong>: <code>sui:signTransaction</code>, <code>sui:signAndExecuteTransaction</code> (plus legacy <code>signTransactionBlock</code> / <code>signAndExecuteTransactionBlock</code> for compatibility).</Text></li>
          <li><Text size="2"><strong>Personal message</strong>: <code>sui:signPersonalMessage</code>.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Accounts + authorization</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Expose <code>accounts</code> array (auto-filled on load if already authorized; empty on first visit).</Text></li>
          <li><Text size="2">Call <code>connect()</code> only when accounts are empty, revoked, or missing required chains/features.</Text></li>
          <li><Text size="2">Use <code>standard:disconnect</code> to revoke a dApp's access.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">dApp-side queries</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><code>getWallets().get()</code> returns discovered wallets; display <code>wallet.name</code> / <code>wallet.icon</code>.</Text></li>
          <li><Text size="2">Invoke features from <code>wallet.features</code>; check availability before calling.</Text></li>
          <li><Text size="2">Listen to <code>standard:events</code> <code>change</code> for chains/features/accounts updates; unsubscribe via returned function.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Suggested tx flow</Heading>
      <Box asChild>
        <ol style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Build transaction with <code>@mysten/sui</code> <code>SuiClient</code> / <code>Transaction</code>.</Text></li>
          <li><Text size="2">Sign via <code>sui:signTransaction</code> (returns bytes + signature) or use <code>signAndExecuteTransaction</code> to submit directly.</Text></li>
          <li><Text size="2">Optionally request effects/events/object/balance changes via options when executing.</Text></li>
        </ol>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Auto-restore authorized accounts on load; avoid relying on the soon-to-be-deprecated <code>silent</code> connect param. Keep features/chain lists consistent across wallet and accounts. See <Link href="https://github.com/wallet-standard/wallet-standard" target="_blank">Wallet Standard</Link> and <Link href="https://docs.sui.io/standards/wallet-standard" target="_blank">Sui docs</Link> for full spec.</Callout.Text>
      </Callout.Root>
    </Box>
  );
}
