import { Box, Callout, Flex, Grid, Heading, Link, Separator, Text } from "@radix-ui/themes";

const networks = [
  {
    name: "Mainnet",
    rpc: "https://fullnode.mainnet.sui.io:443",
    epoch: "~24h",
    persistence: "Data persisted (production)",
    tokens: "Real SUI/MIST (fiat value)",
    explorer: "https://suiscan.xyz/mainnet/home",
    notes: "Public production chain. Costs real fees.",
  },
  {
    name: "Testnet",
    rpc: "https://fullnode.testnet.sui.io:443",
    epoch: "~24h",
    persistence: "May be wiped occasionally (announced)",
    tokens: "Free test SUI/MIST (faucet)",
    explorer: "https://testnet.suivision.xyz/",
    notes: "Staging network for dapps; not durable storage.",
  },
  {
    name: "Devnet",
    rpc: "https://fullnode.devnet.sui.io:443",
    epoch: "~1h",
    persistence: "Wiped weekly per schedule",
    tokens: "Test tokens; unstable APIs",
    explorer: "https://suiscan.xyz/devnet/home",
    notes: "Early feature testing; unstable, not for new users.",
  },
  {
    name: "Localnet",
    rpc: "Local instance (custom)",
    epoch: "Configurable",
    persistence: "Configurable; your machine",
    tokens: "Mint locally via faucet",
    explorer: undefined,
    notes: "Run locally; fast iteration with unlimited faucet.",
  },
];

export function NetworksInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">Sui Networks & RPCs</Heading>
        <Text size="2" color="gray">Mainnet · Testnet · Devnet · Localnet</Text>
      </Flex>

      <Callout.Root color="blue" mb="3">
        <Callout.Icon>ℹ️</Callout.Icon>
        <Callout.Text>
          Sui exposes multiple networks. Full nodes provide read-only state and history; validator nodes sign and stake.
          Use production Mainnet for real value, Testnet for staging, Devnet for early features, and Localnet for rapid local dev.
        </Callout.Text>
      </Callout.Root>

      <Grid columns={{ initial: "1", md: "2" }} gap="3">
        {networks.map((net) => (
          <Box key={net.name} p="3" style={{ background: "var(--color-panel)", borderRadius: 8, border: "1px solid var(--gray-a4)" }}>
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">{net.name}</Heading>
              <Text size="1" color="gray">Epoch: {net.epoch}</Text>
            </Flex>
            <Separator my="2" size="4" />
            <Text weight="bold">RPC</Text>
            <Text size="2" color="gray">{net.rpc}</Text>
            <Text mt="2" weight="bold">Tokens</Text>
            <Text size="2" color="gray">{net.tokens}</Text>
            <Text mt="2" weight="bold">Persistence</Text>
            <Text size="2" color="gray">{net.persistence}</Text>
            {net.explorer && (
              <>
                <Text mt="2" weight="bold">Explorer</Text>
                <Link href={net.explorer} target="_blank" rel="noreferrer" color="blue" size="2">
                  {net.explorer}
                </Link>
              </>
            )}
            <Text mt="2" size="2" color="gray">{net.notes}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
