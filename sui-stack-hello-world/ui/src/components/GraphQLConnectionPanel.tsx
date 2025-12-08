import { useState } from "react";
import { Box, Button, Card, Flex, Text, TextField, Badge, Callout } from "@radix-ui/themes";
import { useGraphQLContext } from "../contexts/GraphQLContext";
import { InfoCircledIcon } from "@radix-ui/react-icons";

const ENV_OPTIONS: Array<{ label: string; value: "devnet" | "testnet" | "mainnet" }> = [
  { label: "Devnet", value: "devnet" },
  { label: "Testnet", value: "testnet" },
  { label: "Mainnet", value: "mainnet" },
];

export function GraphQLConnectionPanel() {
  const {
    isConnected,
    environment,
    currentEndpoint,
    error,
    switchEnvironment,
    connectToEndpoint,
    disconnect,
  } = useGraphQLContext();

  const [selectedEnv, setSelectedEnv] = useState<"devnet" | "testnet" | "mainnet">(environment);
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const handleSwitchEnv = async () => {
    setIsBusy(true);
    try {
      await switchEnvironment(selectedEnv);
    } finally {
      setIsBusy(false);
    }
  };

  const handleCustomConnect = async () => {
    if (!customEndpoint.trim()) return;
    setIsBusy(true);
    try {
      await connectToEndpoint(customEndpoint.trim());
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Card size="3" style={{ marginBottom: "16px" }}>
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Badge color={isConnected ? "green" : "red"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Text weight="bold">GraphQL Connection</Text>
          </Flex>
          <Text size="2" color="gray">
            Env: <Text weight="bold">{environment}</Text>
          </Text>
        </Flex>

        <Flex gap="3" wrap="wrap">
          <Flex direction="column" gap="2" style={{ minWidth: 200 }}>
            <Text size="2" weight="bold">
              Environment
            </Text>
            <Flex gap="2" wrap="wrap">
              {ENV_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={selectedEnv === opt.value ? "solid" : "soft"}
                  color={selectedEnv === opt.value ? "blue" : "gray"}
                  onClick={() => setSelectedEnv(opt.value)}
                  disabled={isBusy}
                >
                  {opt.label}
                </Button>
              ))}
            </Flex>
            <Flex gap="2">
              <Button onClick={handleSwitchEnv} disabled={isBusy}>
                Connect {selectedEnv}
              </Button>
              {isConnected && (
                <Button variant="outline" color="red" onClick={handleDisconnect} disabled={isBusy}>
                  Disconnect
                </Button>
              )}
            </Flex>
          </Flex>

          <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 260 }}>
            <Text size="2" weight="bold">
              Custom Endpoint
            </Text>
            <TextField.Root
              placeholder="https://sui-testnet.mystenlabs.com/graphql"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              disabled={isBusy}
            />
            <Flex gap="2">
              <Button onClick={handleCustomConnect} disabled={isBusy || !customEndpoint.trim()}>
                Connect endpoint
              </Button>
              <Button variant="outline" color="gray" onClick={() => setCustomEndpoint("")} disabled={isBusy}>
                Clear
              </Button>
            </Flex>
            <Text size="1" color="gray">
              Must start with http:// or https://
            </Text>
          </Flex>
        </Flex>

        <Box>
          <Text size="2" weight="bold">
            Current Endpoint
          </Text>
          <Text size="2" color="gray">
            {currentEndpoint || "Not connected"}
          </Text>
        </Box>

        {error && (
          <Callout.Root color="red">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Card>
  );
}
