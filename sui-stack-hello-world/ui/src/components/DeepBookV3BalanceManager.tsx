import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Callout,
  Flex,
  Heading,
  Text,
  Badge,
} from "@radix-ui/themes";
import { InfoCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 BalanceManager Setup & Management
 * - Create/initialize BalanceManager
 * - Deposit/withdraw funds
 * - Query balance
 * - Manage trading capabilities
 */
export function DeepBookV3BalanceManager() {
  const [env, setEnv] = useState<"testnet" | "mainnet">("testnet");
  const [managerAddress, setManagerAddress] = useState("");
  const [tradeCap, setTradeCap] = useState("");
  const [coinType, setCoinType] = useState("SUI");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const coinOptions =
    env === "testnet"
      ? ["SUI", "DBUSDC", "DBUSDT", "DEEP"]
      : ["SUI", "USDC", "USDT", "WETH", "DEEP"];

  const handleCreateManager = async () => {
    setStatus("⏳ Creating BalanceManager...");
    setIsBusy(true);
    try {
      // Placeholder: In real usage, this calls DeepBookClient
      // const tx = new Transaction();
      // tx.add(dbClient.balanceManager.createAndShareBalanceManager());
      // const res = await suiClient.signAndExecuteTransaction({...});
      // Extract manager address from res.objectChanges
      setStatus("✅ BalanceManager created (placeholder - connect wallet for real execution)");
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDepositIntoManager = async () => {
    if (!managerAddress || !amount) {
      setStatus("❌ Manager address and amount required");
      return;
    }
    setStatus(`⏳ Depositing ${amount} ${coinType} into manager...`);
    setIsBusy(true);
    try {
      // Placeholder: In real usage, this calls DeepBookClient
      // dbClient.balanceManager.depositIntoManager(MANAGER_KEY, coinType, parseAmount)(tx);
      setStatus(`✅ Deposited ${amount} ${coinType} (placeholder - connect wallet for execution)`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleWithdrawAllFromManager = async () => {
    if (!managerAddress) {
      setStatus("❌ Manager address required");
      return;
    }
    setStatus(`⏳ Withdrawing all ${coinType} from manager...`);
    setIsBusy(true);
    try {
      // Placeholder: In real usage
      // dbClient.balanceManager.withdrawAllFromManager(MANAGER_KEY, coinType, userAddress)(tx);
      setStatus(`✅ Withdrew all ${coinType} (placeholder - connect wallet for execution)`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleQueryBalance = async () => {
    if (!managerAddress) {
      setStatus("❌ Manager address required");
      return;
    }
    setStatus(`⏳ Querying balance...`);
    setIsBusy(true);
    try {
      // Placeholder: In real usage
      // const balance = await dbClient.checkManagerBalance(MANAGER_KEY, coinType);
      setStatus(`📊 Balance: 0 ${coinType} (placeholder - connect wallet for real data)`);
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Card size="3" style={{ marginTop: "20px" }}>
      <Flex direction="column" gap="4">
        {/* Header */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Badge color="cyan">BalanceManager</Badge>
            <Heading size="5">Custody & Trading Setup</Heading>
          </Flex>
        </Flex>

        {/* Warning */}
        <Callout.Root color="red">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            <strong>REQUIRED:</strong> A BalanceManager must be created before placing trades or
            using flash loans. This custody interface holds your funds and manages permissions.
          </Callout.Text>
        </Callout.Root>

        {/* Environment & Setup Info */}
        <Box>
          <Text weight="bold" size="3" style={{ marginBottom: "8px" }}>
            📋 Setup & Configuration
          </Text>
          <Flex gap="4" wrap="wrap">
            <Box>
              <Text size="2" weight="bold">
                Environment
              </Text>
              <Flex gap="2" style={{ marginTop: "8px" }}>
                {(["testnet", "mainnet"] as const).map((e) => (
                  <Button
                    key={e}
                    variant={env === e ? "solid" : "soft"}
                    onClick={() => setEnv(e)}
                    disabled={isBusy}
                  >
                    {e.toUpperCase()}
                  </Button>
                ))}
              </Flex>
            </Box>

            <Box>
              <Text size="2" weight="bold">
                Supported Coins
              </Text>
              <Flex gap="1" wrap="wrap" style={{ marginTop: "8px" }}>
                {coinOptions.map((c) => (
                  <Badge key={c} variant="soft">
                    {c}
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Create Manager */}
        <Box>
          <Text weight="bold" size="3" style={{ marginBottom: "8px" }}>
            1️⃣ Create BalanceManager (One-Time Setup)
          </Text>
          <Flex gap="2" style={{ marginTop: "12px" }}>
            <Button
              onClick={handleCreateManager}
              disabled={isBusy}
              color="green"
            >
              Create Manager
            </Button>
            <Text size="1" color="gray">
              Executes: dbClient.balanceManager.createAndShareBalanceManager()
            </Text>
          </Flex>
          <Text size="1" color="gray" style={{ marginTop: "8px" }}>
            ✓ Extract manager address from transaction effects
          </Text>
        </Box>

        {/* Manager Configuration */}
        <Box>
          <Text weight="bold" size="3" style={{ marginBottom: "8px" }}>
            2️⃣ Manager Configuration & Operations
          </Text>
          <Flex direction="column" gap="3">
            <input
              type="text"
              placeholder="Manager Address (0x...)"
              value={managerAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setManagerAddress(e.target.value)
              }
              disabled={isBusy}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--gray-a7)",
              }}
            />

            <input
              type="text"
              placeholder="Trade Cap (optional)"
              value={tradeCap}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTradeCap(e.target.value)
              }
              disabled={isBusy}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--gray-a7)",
              }}
            />

            <Flex gap="2" wrap="wrap" align="center">
              <select
                value={coinType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCoinType(e.target.value)
                }
                disabled={isBusy}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--gray-a7)",
                }}
              >
                {coinOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAmount(e.target.value)
                }
                disabled={isBusy}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--gray-a7)",
                  minWidth: "120px",
                }}
              />
            </Flex>

            <Flex gap="2" wrap="wrap">
              <Button
                onClick={handleDepositIntoManager}
                disabled={isBusy || !managerAddress || !amount}
              >
                Deposit {coinType}
              </Button>
              <Button
                onClick={handleQueryBalance}
                disabled={isBusy || !managerAddress}
                variant="soft"
              >
                Query Balance
              </Button>
              <Button
                onClick={handleWithdrawAllFromManager}
                disabled={isBusy || !managerAddress}
                color="red"
                variant="soft"
              >
                Withdraw All
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Status */}
        {status && (
          <Box
            style={{
              padding: "12px",
              backgroundColor: status.includes("❌")
                ? "var(--red-a2)"
                : status.includes("✅")
                  ? "var(--green-a2)"
                  : "var(--blue-a2)",
              borderRadius: "6px",
              borderLeft: `4px solid ${
                status.includes("❌")
                  ? "var(--red-9)"
                  : status.includes("✅")
                    ? "var(--green-9)"
                    : "var(--blue-9)"
              }`,
            }}
          >
            <Text size="2">{status}</Text>
          </Box>
        )}

        {/* Info Box */}
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            <strong>Note:</strong> This component is a UI placeholder for DeepBook operations.
            To enable real execution, connect your Sui wallet and implement DeepBookClient
            initialization with your private key (secure method required).
          </Callout.Text>
        </Callout.Root>

        {/* Code Reference */}
        <Box>
          <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
            Code Reference
          </Text>
          <Box
            style={{
              padding: "12px",
              backgroundColor: "var(--gray-a2)",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "monospace",
              overflowX: "auto",
            }}
          >
            <div>const tx = new Transaction();</div>
            <div>// Create</div>
            <div>tx.add(dbClient.balanceManager.createAndShareBalanceManager());</div>
            <div>// Deposit</div>
            <div>dbClient.balanceManager.depositIntoManager('MANAGER_1', 'SUI', 1000)(tx);</div>
            <div>// Withdraw</div>
            <div>dbClient.balanceManager.withdrawAllFromManager('MANAGER_1', 'SUI', address)(tx);</div>
            <div>// Query</div>
            <div>const bal = await dbClient.checkManagerBalance('MANAGER_1', 'SUI');</div>
          </Box>
        </Box>
      </Flex>
    </Card>
  );
}
