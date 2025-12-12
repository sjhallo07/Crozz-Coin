import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Callout,
  Flex,
  Heading,
  Text,
  TextField,
  Dialog,
  Tabs,
  Badge,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

/**
 * DeepBookV3 Information & Risk Disclosure
 * Displays comprehensive info about DeepBookV3, setup requirements, and mandatory risk warnings
 */
export function DeepBookV3Info() {
  const [openRisks, setOpenRisks] = useState(false);
  const [openBestPractices, setOpenBestPractices] = useState(false);

  return (
    <Card size="3" style={{ marginTop: "20px" }}>
      <Flex direction="column" gap="4">
        {/* Header */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Badge color="blue">DeepBookV3 SDK</Badge>
            <Heading size="5">Decentralized Exchange Protocol</Heading>
          </Flex>
        </Flex>

        {/* Overview */}
        <Box>
          <Text weight="bold" size="3">
            About DeepBookV3
          </Text>
          <Text size="2" color="gray" style={{ marginTop: "8px", lineHeight: 1.6 }}>
            DeepBookV3 is a powerful decentralized exchange (DEX) protocol on Sui
            enabling market makers and traders to:
          </Text>
          <div style={{ marginTop: "8px", marginLeft: "20px", fontSize: "14px" }}>
            <div>Place limit orders with customizable price levels</div>
            <div>Execute flash loans without collateral</div>
            <div>Access deep liquidity pools</div>
            <div>Manage balance/custody through BalanceManager</div>
            <div>Trade against permissionless pools</div>
          </div>
          <Text size="1" color="gray" style={{ marginTop: "12px" }}>
            <strong>SDK:</strong> @mysten/deepbook-v3 | 
            <strong style={{ marginLeft: "8px" }}>Docs:</strong>{" "}
            <a
              href="https://docs.sui.io/standards/deepbookv3-sdk"
              target="_blank"
              rel="noopener noreferrer"
            >
              docs.sui.io
            </a>
          </Text>
        </Box>

        {/* Setup Requirements */}
        <Box>
          <Text weight="bold" size="3" style={{ marginBottom: "8px" }}>
            ⚙️ Setup Requirements
          </Text>
          <Flex direction="column" gap="2">
            <Box
              style={{
                padding: "12px",
                backgroundColor: "var(--gray-a2)",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "monospace",
              }}
            >
              <div>1. Import DeepBookClient & SuiClient</div>
              <div style={{ marginTop: "8px" }}>
                2. Initialize with: address, env (testnet/mainnet), SuiClient
              </div>
              <div style={{ marginTop: "8px" }}>
                3. Create BalanceManager (for custody/trading)
              </div>
              <div style={{ marginTop: "8px" }}>
                4. Register coins (SUI, DBUSDC, USDT, WETH, DEEP, etc.)
              </div>
              <div style={{ marginTop: "8px" }}>
                5. Query/execute: limit orders, flash loans, swaps
              </div>
            </Box>
          </Flex>
        </Box>

        {/* Coins & Pools Info */}
        <Box>
          <Text weight="bold" size="3" style={{ marginBottom: "8px" }}>
            💰 Default Coins & Pools
          </Text>
          <Flex gap="4" wrap="wrap">
            <Box>
              <Text size="2" weight="bold" color="blue">
                Testnet
              </Text>
              <Text size="1">
                DEEP, SUI, DBUSDC, DBUSDT
              </Text>
            </Box>
            <Box>
              <Text size="2" weight="bold" color="green">
                Mainnet
              </Text>
              <Text size="1">
                DEEP, SUI, USDC, USDT, WETH
              </Text>
            </Box>
          </Flex>
          <Text size="1" color="gray" style={{ marginTop: "8px" }}>
            Custom coins/pools can be registered via CoinMap/PoolMap
          </Text>
        </Box>

        {/* Action Buttons */}
        <Flex gap="2" wrap="wrap">
          <Dialog.Root open={openRisks} onOpenChange={setOpenRisks}>
            <Dialog.Trigger>
              <Button color="red" variant="soft">
                <ExclamationTriangleIcon /> Risk & Disclaimer
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>
                <Flex align="center" gap="2">
                  <ExclamationTriangleIcon color="red" />
                  MANDATORY RISK DISCLOSURE & DISCLAIMER
                </Flex>
              </Dialog.Title>

              <Flex direction="column" gap="3" style={{ marginTop: "16px" }}>
                {/* Critical Risks */}
                <Callout.Root color="red">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text weight="bold">CRITICAL RISKS</Callout.Text>
                </Callout.Root>

                <Box>
                  <Text weight="bold" size="2">
                    🔴 Smart Contract Risk
                  </Text>
                  <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                    DeepBookV3 is in active development. Code may contain bugs, exploits, or
                    undiscovered vulnerabilities. Even audited contracts can fail. Use only
                    with funds you can afford to lose completely.
                  </Text>
                </Box>

                <Box>
                  <Text weight="bold" size="2">
                    🔴 Flash Loan Risk
                  </Text>
                  <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                    Flash loans enable arbitrage but also high-frequency attacks. An attacker
                    can borrow massive amounts, manipulate prices, and deplete your balance
                    in a single transaction. Always add slippage protection & price oracle checks.
                  </Text>
                </Box>

                <Box>
                  <Text weight="bold" size="2">
                    🔴 Impermanent Loss & Slippage
                  </Text>
                  <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                    Market making and liquidity provision expose you to price divergence losses.
                    Slippage on large trades can exceed expected price. Test on devnet/testnet
                    with small amounts first.
                  </Text>
                </Box>

                <Box>
                  <Text weight="bold" size="2">
                    🔴 Private Key Exposure
                  </Text>
                  <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                    Never hardcode private keys in code or .env files committed to git. Use
                    secure key management (hardware wallets, vaults). SDK examples show keys
                    for educational purposes only — NEVER replicate in production.
                  </Text>
                </Box>

                <Box>
                  <Text weight="bold" size="2">
                    🔴 Regulatory & Tax
                  </Text>
                  <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                    Trading, swaps, and market making may be subject to local tax/regulatory
                    laws. DeepBook/Sui is not regulated; you are responsible for compliance.
                  </Text>
                </Box>

                {/* NO WARRANTY */}
                <Callout.Root color="orange">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    <strong>NO WARRANTY:</strong> This software and DeepBook are provided "AS
                    IS" without warranty. Developers and Mysten Labs disclaim all liability for
                    losses, including total fund loss.
                  </Callout.Text>
                </Callout.Root>

                {/* Acknowledgment */}
                <Box
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--yellow-a2)",
                    borderRadius: "6px",
                    borderLeft: "4px solid var(--yellow-9)",
                  }}
                >
                  <Text size="2" weight="bold">
                    ✓ Acknowledgment
                  </Text>
                  <Text size="1" style={{ marginTop: "8px" }}>
                    By using DeepBook, you acknowledge:
                  </Text>
                  <div style={{ marginTop: "8px", marginLeft: "16px", fontSize: "13px" }}>
                    <div>I have read and understood these risks</div>
                    <div>I only trade with funds I can afford to lose</div>
                    <div>I take full responsibility for losses</div>
                    <div>I have tested extensively on devnet/testnet</div>
                    <div>I have NOT hardcoded secrets or private keys</div>
                  </div>
                </Box>
              </Flex>

              <Flex gap="2" style={{ marginTop: "20px" }}>
                <Dialog.Close>
                  <Button variant="soft">Close</Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          <Dialog.Root open={openBestPractices} onOpenChange={setOpenBestPractices}>
            <Dialog.Trigger>
              <Button color="green" variant="soft">
                Best Practices
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>DeepBookV3 Best Practices</Dialog.Title>

              <Tabs.Root defaultValue="testing" style={{ marginTop: "16px" }}>
                <Tabs.List>
                  <Tabs.Trigger value="testing">Testing</Tabs.Trigger>
                  <Tabs.Trigger value="security">Security</Tabs.Trigger>
                  <Tabs.Trigger value="trading">Trading</Tabs.Trigger>
                  <Tabs.Trigger value="monitoring">Monitoring</Tabs.Trigger>
                </Tabs.List>

                <Box style={{ marginTop: "12px" }}>
                  {/* Testing Tab */}
                  <Tabs.Content value="testing">
                    <Flex direction="column" gap="3">
                      <Box>
                        <Text weight="bold" size="2">
                          1️⃣ Always Test on Devnet First
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Use free SUI tokens (faucet.sui.io) to test orders, balance manager setup,
                          and flash loans. Verify all logic before testnet.
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          2️⃣ Start Small on Testnet
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Place test limit orders (1-10 DBUSDT) to verify execution flow, slippage
                          calculations, and error handling.
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          3️⃣ Simulate High-Volume Scenarios
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Test order book depth, large swap amounts, and flash loan logic to catch
                          edge cases before mainnet.
                        </Text>
                      </Box>
                    </Flex>
                  </Tabs.Content>

                  {/* Security Tab */}
                  <Tabs.Content value="security">
                    <Flex direction="column" gap="3">
                      <Box>
                        <Text weight="bold" size="2">
                          🔐 Private Key Management
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Use environment variables (never hardcode). Rotate keys regularly. For
                          production: use hardware wallets or key vaults (AWS KMS, Google Secret
                          Manager).
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          🛡️ Validation & Slippage
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Always validate user inputs (min/max amounts, price ranges). Set aggressive
                          slippage tolerances (0.5%-2% for stable pairs). Check oracle prices before
                          large trades.
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          ✅ Audit & Code Review
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Have custom pools/coins audited before mainnet. Review transaction builders
                          for correctness (esp. multi-step logic).
                        </Text>
                      </Box>
                    </Flex>
                  </Tabs.Content>

                  {/* Trading Tab */}
                  <Tabs.Content value="trading">
                    <Flex direction="column" gap="3">
                      <Box>
                        <Text weight="bold" size="2">
                          📊 Risk Management
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Set max order size, position limits, and stop-loss levels. Never use 100% of
                          capital in a single trade. Monitor P&L continuously.
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          ⚡ Flash Loan Caution
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Flash loans must repay in the same transaction. Add circuit breakers to detect
                          price manipulation. Rate-limit loan requests. Monitor for sandwich attacks.
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          🎯 Order Placement Strategy
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Spread orders across price levels to reduce impact. Use limit orders over market
                          orders. Monitor fill rates and adjust pricing dynamically.
                        </Text>
                      </Box>
                    </Flex>
                  </Tabs.Content>

                  {/* Monitoring Tab */}
                  <Tabs.Content value="monitoring">
                    <Flex direction="column" gap="3">
                      <Box>
                        <Text weight="bold" size="2">
                          📡 Real-Time Monitoring
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Track order fills, balance changes, and gas costs. Set up alerts for large
                          trades or unusual market activity. Log all transactions.
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          📝 Error Handling
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Catch and log all SDK errors (network, contract, validation). Implement retry
                          logic with exponential backoff for transient failures. Never ignore errors.
                        </Text>
                      </Box>
                      <Box>
                        <Text weight="bold" size="2">
                          🔍 Audit Logs & Compliance
                        </Text>
                        <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                          Maintain detailed audit logs (timestamp, action, amount, result). For tax/legal
                          compliance, export transaction history regularly.
                        </Text>
                      </Box>
                    </Flex>
                  </Tabs.Content>
                </Box>
              </Tabs.Root>

              <Flex gap="2" style={{ marginTop: "20px" }}>
                <Dialog.Close>
                  <Button variant="soft">Close</Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          <Button color="blue" variant="soft" asChild>
            <a
              href="https://github.com/MystenLabs/ts-sdks/tree/main/packages/deepbook-v3"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repo
            </a>
          </Button>

          <Button color="blue" variant="soft" asChild>
            <a
              href="https://www.npmjs.com/package/@mysten/deepbook-v3"
              target="_blank"
              rel="noopener noreferrer"
            >
              NPM Package
            </a>
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
