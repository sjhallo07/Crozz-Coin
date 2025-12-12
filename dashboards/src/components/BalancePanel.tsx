import { Box, Card, Flex, Heading, Text, Grid, Button } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function BalancePanel() {
  const currentAccount = useCurrentAccount();

  const mockBalances = [
    { coin: "SUI", amount: 1234.56, symbol: "SUI", icon: "◆" },
    { coin: "CROZZ", amount: 5000, symbol: "CROZZ", icon: "🪙" },
    { coin: "USDC", amount: 2500, symbol: "USDC", icon: "💵" },
  ];

  return (
    <Box>
      <Heading size="5" style={{ marginBottom: "2rem", color: "#e0e7ff" }}>
        Balance Manager
      </Heading>

      {currentAccount ? (
        <>
          <Card
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #2d1b69 100%)",
              border: "1px solid #3b3366",
              marginBottom: "2rem",
              padding: "1.5rem",
            }}
          >
            <Flex direction="column" gap="2">
              <Text size="1" style={{ color: "#a5b4fc" }}>
                Connected Wallet
              </Text>
              <Text
                size="2"
                style={{
                  fontFamily: "monospace",
                  color: "#e0e7ff",
                  wordBreak: "break-all",
                }}
              >
                {currentAccount.address}
              </Text>
            </Flex>
          </Card>

          <Heading size="4" style={{ marginBottom: "1rem", color: "#e0e7ff" }}>
            Your Balances
          </Heading>

          <Grid columns="1" gap="4">
            {mockBalances.map((balance) => (
              <Card
                key={balance.coin}
                style={{
                  background: "rgba(30, 27, 75, 0.5)",
                  border: "1px solid #3b3366",
                  padding: "1.5rem",
                }}
              >
                <Flex justify="between" align="center">
                  <Flex align="center" gap="3">
                    <Text size="6">{balance.icon}</Text>
                    <Flex direction="column" gap="1">
                      <Text size="3" style={{ fontWeight: "bold", color: "#e0e7ff" }}>
                        {balance.coin}
                      </Text>
                      <Text size="1" style={{ color: "#a5b4fc" }}>
                        {balance.symbol}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex direction="column" gap="1" align="end">
                    <Text size="4" style={{ fontWeight: "bold", color: "#e0e7ff" }}>
                      {balance.amount.toLocaleString()}
                    </Text>
                    <Button
                      size="1"
                      style={{
                        background: "rgba(139, 92, 246, 0.2)",
                        color: "#e0e7ff",
                        cursor: "pointer",
                      }}
                    >
                      Send
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Grid>
        </>
      ) : (
        <Card
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "#fca5a5" }}>
            Please connect your wallet to view balances
          </Text>
        </Card>
      )}
    </Box>
  );
}
