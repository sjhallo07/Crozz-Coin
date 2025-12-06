import { Box, Callout, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * Slush wallet overview and integration notes.
 */
export function SlushWalletInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Slush — A Sui wallet</Heading>
      <Text size="2" color="gray" mb="3">
        Mysten Labs' official Sui wallet (formerly Sui Wallet). Provides a browser extension and hosted web
        experience that speaks Wallet Standard v1 and supports full Sui feature coverage.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Key capabilities</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Detects dApps via Wallet Standard discovery and exposes previously authorized accounts on load.</Text></li>
          <li><Text size="2">Supports signing + execution flows (<code>sui:signTransaction</code>, <code>sui:signAndExecuteTransaction</code>, personal messages) with session persistence.</Text></li>
          <li><Text size="2">Runs as a Chrome/Chromium extension or hosted popup (<Link href="https://my.slush.app" target="_blank">my.slush.app</Link>) when extension is absent.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Connect flow in this dApp</Heading>
      <Box asChild>
        <ol style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Click <strong>Connect Wallet</strong>; Slush appears in the wallet picker (extension or hosted modal).</Text></li>
          <li><Text size="2">Approve the connection request. Previously authorized sessions are restored automatically.</Text></li>
          <li><Text size="2">Use the buttons below to call Sui Move functions; Slush prompts for each transaction or message signature.</Text></li>
        </ol>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Developer integration snippet</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Import <code>registerSlushWallet</code> from <code>@mysten/slush-wallet</code> and register once on app bootstrap.</Text></li>
          <li><Text size="2">Guard the call with <code>if (typeof window !== "undefined")</code> to avoid SSR build-time access to browser APIs.</Text></li>
          <li><Text size="2">A sample is implemented in <code>src/main.tsx</code> so Slush's hosted fallback is available when the extension is missing.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Slush metadata is fetched from <Link href="https://api.slush.app/api/wallet/metadata" target="_blank">api.slush.app</Link> after registration. Keep sessions scoped per browser profile—revoking access clears the local <code>slush:session</code> key and removes cached accounts.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
