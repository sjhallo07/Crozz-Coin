import { Box, Button, Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSuiClient } from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import { Network, Check, AlertCircle } from "lucide-react";

interface NetworkStatus {
  isConnected: boolean;
  network: string;
  nodeStatus: "healthy" | "unhealthy" | "unknown";
  rpcUrl: string;
}

export function TestnetStatus() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    network: "testnet",
    nodeStatus: "unknown",
    rpcUrl: "https://rpc.testnet.sui.io",
  });

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        // Get chain identifier to verify connection
        const chainId = await suiClient.getChainIdentifier();
        setStatus((prev) => ({
          ...prev,
          isConnected: true,
          nodeStatus: "healthy",
        }));
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          isConnected: false,
          nodeStatus: "unhealthy",
        }));
      }
    };

    checkNetwork();
  }, [suiClient]);

  const copyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address);
    }
  };

  const openFaucet = () => {
    window.open(
      "https://testnet.suifaucet.fun/",
      "_blank",
      "width=600,height=700",
    );
  };

  const openExplorer = () => {
    if (currentAccount?.address) {
      window.open(
        `https://testnet.suivision.xyz/account/${currentAccount.address}`,
        "_blank",
      );
    }
  };

  return (
    <Card style={{ padding: "24px", marginBottom: "16px" }}>
      <Flex direction="column" gap="3">
        {/* Network Status Header */}
        <Flex align="center" gap="2">
          <Network size={20} color="#22D3EE" />
          <Heading size="4">Testnet Connection</Heading>
        </Flex>

        {/* Connection Status */}
        <Box>
          <Flex align="center" gap="2">
            <Box
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: status.isConnected ? "#22C55E" : "#EF4444",
              }}
            />
            <Text size="2" weight="medium">
              {status.isConnected ? "Connected to Testnet" : "Disconnected"}
            </Text>
          </Flex>
          <Text size="1" color="gray" style={{ marginTop: "4px" }}>
            RPC: {status.rpcUrl}
          </Text>
        </Box>

        {/* Wallet Status */}
        <Box>
          <Text size="2" weight="medium" style={{ marginBottom: "8px" }}>
            Wallet Information
          </Text>
          {currentAccount ? (
            <Flex direction="column" gap="2">
              <Card style={{ padding: "12px", backgroundColor: "var(--gray-a2)" }}>
                <Flex direction="column" gap="2">
                  <Flex justify="between" align="center">
                    <Text size="1">
                      <strong>Address:</strong>
                    </Text>
                    <Button
                      size="1"
                      variant="soft"
                      onClick={copyAddress}
                      style={{ cursor: "pointer" }}
                    >
                      Copy
                    </Button>
                  </Flex>
                  <Text
                    size="1"
                    style={{
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                      color: "var(--cyan-11)",
                    }}
                  >
                    {currentAccount.address}
                  </Text>
                </Flex>
              </Card>

              {currentAccount.publicKey && (
                <Card style={{ padding: "12px", backgroundColor: "var(--gray-a2)" }}>
                  <Flex direction="column" gap="2">
                    <Text size="1">
                      <strong>Public Key:</strong>
                    </Text>
                    <Text
                      size="1"
                      style={{
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        fontSize: "10px",
                      }}
                    >
                      {currentAccount.publicKey}
                    </Text>
                  </Flex>
                </Card>
              )}

              <Flex gap="2">
                <Button
                  size="2"
                  onClick={openFaucet}
                  style={{ cursor: "pointer", flex: 1 }}
                >
                  Get Testnet SUI from Faucet
                </Button>
                <Button
                  size="2"
                  variant="soft"
                  onClick={openExplorer}
                  style={{ cursor: "pointer", flex: 1 }}
                >
                  View in Explorer
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex align="center" gap="2" style={{ color: "var(--orange-11)" }}>
              <AlertCircle size={16} />
              <Text size="2">No wallet connected - Click "Connect Wallet" above</Text>
            </Flex>
          )}
        </Box>

        {/* Quick Links */}
        <Box>
          <Text size="2" weight="medium" style={{ marginBottom: "8px" }}>
            Quick Links
          </Text>
          <Flex direction="column" gap="2">
            <Button
              size="1"
              variant="soft"
              onClick={() => window.open("https://testnet.suivision.xyz", "_blank")}
              style={{ cursor: "pointer", justifyContent: "flex-start" }}
            >
              📊 Sui Testnet Explorer
            </Button>
            <Button
              size="1"
              variant="soft"
              onClick={() =>
                window.open(
                  "https://docs.sui.io/guides/developer/getting-started",
                  "_blank",
                )
              }
              style={{ cursor: "pointer", justifyContent: "flex-start" }}
            >
              📚 Sui Development Guide
            </Button>
            <Button
              size="1"
              variant="soft"
              onClick={() =>
                window.open("https://testnet.suifaucet.fun/", "_blank")
              }
              style={{ cursor: "pointer", justifyContent: "flex-start" }}
            >
              💰 Testnet Faucet
            </Button>
            <Button
              size="1"
              variant="soft"
              onClick={() =>
                window.open(
                  "https://github.com/MystenLabs/sui/releases",
                  "_blank",
                )
              }
              style={{ cursor: "pointer", justifyContent: "flex-start" }}
            >
              🔧 Sui CLI Releases
            </Button>
          </Flex>
        </Box>

        {/* Status Indicators */}
        <Box
          style={{
            padding: "12px",
            backgroundColor: "var(--gray-a2)",
            borderRadius: "4px",
          }}
        >
          <Flex gap="4" direction="column">
            <Flex align="center" gap="2">
              <Check size={16} color="#22C55E" />
              <Text size="1">Testnet network configured</Text>
            </Flex>
            <Flex align="center" gap="2">
              {status.isConnected ? (
                <Check size={16} color="#22C55E" />
              ) : (
                <AlertCircle size={16} color="#EF4444" />
              )}
              <Text size="1">RPC connection {status.isConnected ? "active" : "inactive"}</Text>
            </Flex>
            <Flex align="center" gap="2">
              {currentAccount ? (
                <Check size={16} color="#22C55E" />
              ) : (
                <AlertCircle size={16} color="#FBBF24" />
              )}
              <Text size="1">
                Wallet {currentAccount ? "connected" : "not connected"}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}
