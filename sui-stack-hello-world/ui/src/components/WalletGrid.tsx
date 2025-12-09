import { ConnectButton, useNetwork } from "@mysten/dapp-kit";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Link,
  Separator,
  Text,
} from "@radix-ui/themes";

const wallets = [
  {
    name: "Slush (web)",
    description: "Hosted Slush wallet experience (Wallet Standard v1).",
    link: "https://my.slush.app",
    tag: "Recommended",
  },
  {
    name: "Slush (extension)",
    description: "Mysten Labs' official extension wallet for Sui.",
    link: "https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
    tag: "Chrome / Chromium",
  },
  {
    name: "Suiet",
    description: "Popular Sui wallet with multisig and NFT support.",
    link: "https://suiet.app",
    tag: "Desktop & Mobile",
  },
  {
    name: "Ethos",
    description: "Sui wallet with in-app dApp browser and backups.",
    link: "https://www.ethoswallet.xyz",
    tag: "Desktop & Mobile",
  },
];

export function WalletGrid() {
  const { network, setNetwork } = useNetwork();

  const forceTestnet = () => {
    // Our dApp is configured for testnet; ensure provider uses it.
    setNetwork("testnet");
  };

  return (
    <Card
      mt="4"
      p="4"
      style={{ background: "var(--gray-a2)", borderRadius: 12, width: "100%" }}
    >
      <Flex justify="between" align="center" mb="3">
        <Heading size="4">Wallets & Network</Heading>
        <Badge color="green" variant="soft">Current network: {network}</Badge>
      </Flex>

      <Text size="2" color="gray" mb="3">
        Connect with your preferred Sui wallet. Slush web is supported out of the box, and you can switch networks with a single click.
      </Text>

      <Flex gap="3" wrap="wrap" align="center" mb="3">
        <ConnectButton />
        <Button variant="surface" onClick={forceTestnet}>
          Switch to Sui Testnet
        </Button>
      </Flex>

      <Separator my="3" size="4" />

      <Grid columns={{ initial: "1", md: "2" }} gap="3">
        {wallets.map((w) => (
          <Box
            key={w.name}
            p="3"
            style={{
              background: "var(--color-panel)",
              borderRadius: 10,
              border: "1px solid var(--gray-a4)",
            }}
          >
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">{w.name}</Heading>
              {w.tag && <Badge variant="soft" color="blue">{w.tag}</Badge>}
            </Flex>
            <Text size="2" color="gray" mb="2">{w.description}</Text>
            <Link href={w.link} target="_blank" rel="noreferrer" color="blue">
              Open {w.name}
            </Link>
          </Box>
        ))}
      </Grid>
    </Card>
  );
}
