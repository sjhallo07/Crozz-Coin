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
  Tabs,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  ExclamationTriangleIcon,
  BookmarkIcon,
} from "@radix-ui/react-icons";

/**
 * Sui Advanced Topics
 * - Move 2024 migration
 * - Custom indexer setup
 * - On-chain randomness
 * - GraphQL RPC queries
 * - Object-based local fee markets
 */
export function SuiAdvancedTopics() {
  const [activeTab, setActiveTab] = useState<
    "move2024" | "indexer" | "randomness" | "graphql" | "feemarkets"
  >("move2024");
  const [status, setStatus] = useState("");

  return (
    <Card size="3" style={{ marginTop: "20px" }}>
      <Flex direction="column" gap="4">
        {/* Header */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Badge color="indigo">Advanced Topics</Badge>
            <Heading size="5">Sui Developer Advanced Guides</Heading>
          </Flex>
        </Flex>

        {/* Info */}
        <Callout.Root>
          <Callout.Icon>
            <BookmarkIcon />
          </Callout.Icon>
          <Callout.Text>
            Advanced topics cover coding practices, useful features, and developer-focused
            considerations for sophisticated Sui solutions. Not necessarily harder, but often
            needed for advanced use cases.
          </Callout.Text>
        </Callout.Root>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <Tabs.List>
            <Tabs.Trigger value="move2024">Move 2024</Tabs.Trigger>
            <Tabs.Trigger value="indexer">Custom Indexer</Tabs.Trigger>
            <Tabs.Trigger value="randomness">On-Chain Randomness</Tabs.Trigger>
            <Tabs.Trigger value="graphql">GraphQL RPC</Tabs.Trigger>
            <Tabs.Trigger value="feemarkets">Fee Markets</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="move2024" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--blue-a2)",
                  borderRadius: "6px",
                  borderLeft: "4px solid var(--blue-9)",
                }}
              >
                <Text weight="bold" size="2">
                  🔄 Move 2024 Migration
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  New features are becoming available in Move 2024. These are opt-in, so existing
                  code continues to work. Migrate when you need new features or improvements.
                </Text>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Key Changes & Features
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "13px" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Lambdas & Closures</Text>
                    <Text size="1" color="gray">
                      First-class function support with lambda expressions and higher-order functions
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Enum Variants</Text>
                    <Text size="1" color="gray">
                      Enhanced enum pattern matching and variant handling
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Improved Type System</Text>
                    <Text size="1" color="gray">
                      Better generic support, trait improvements, and type inference
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Enhanced Standard Library</Text>
                    <Text size="1" color="gray">
                      New utilities and functions in the Move standard library
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Migration Steps
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "12px", fontFamily: "monospace" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Step 1: Update Move.toml</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      [package]<br/>
                      language = "2024.beta"  # Enable Move 2024
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Step 2: Review Breaking Changes</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      Check deprecation warnings and update syntax accordingly
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Step 3: Test Thoroughly</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      Run existing tests and add new tests for 2024 features
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Step 4: Redeploy</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      Deploy updated package to Testnet, then Mainnet
                    </div>
                  </Box>
                </Flex>
              </Box>

              <Callout.Root color="yellow">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Breaking Changes:</strong> Some APIs have changed. Review official
                  migration guide at docs.sui.io for detailed breaking changes list.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>

          {/* Custom Indexer Tab */}
          <Tabs.Content value="indexer" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--green-a2)",
                  borderRadius: "6px",
                  borderLeft: "4px solid var(--green-9)",
                }}
              >
                <Text weight="bold" size="2">
                  🔍 Custom Indexer
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  A custom indexer improves latency, allows pruning full node data, and provides
                  efficient checkpoint data assembly.
                </Text>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Benefits
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "13px" }}>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Lower Latency:</strong> Query indexed data faster than RPC</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Data Pruning:</strong> Remove unnecessary history from node</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Custom Aggregations:</strong> Compute metrics relevant to your app</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Efficient Checkpoints:</strong> Quick access to checkpoint data</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Scaling:</strong> Handle high-volume queries without RPC limits</Text>
                  </Flex>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Architecture Options
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "12px" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Full Node + Indexer (Recommended)</Text>
                    <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                      Run a Sui full node + separate indexer service. Full node streams events to indexer.
                      Indexer stores in database (PostgreSQL, MongoDB, etc.).
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Sui Indexer Framework</Text>
                    <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                      Use official Sui Indexer Framework for structured indexing of events, objects, and transactions.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Custom Event Handlers</Text>
                    <Text size="1" color="gray" style={{ marginTop: "4px" }}>
                      Listen to Sui events via WebSocket and process with custom logic.
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Setup Steps
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "11px", fontFamily: "monospace" }}>
                  <div>1. Install Sui Full Node (testnet/mainnet)</div>
                  <div>2. Enable RPC endpoints in node config</div>
                  <div>3. Setup database (PostgreSQL recommended)</div>
                  <div>4. Write indexer service to listen to events</div>
                  <div>5. Process and store event data in database</div>
                  <div>6. Expose API for your application</div>
                </Flex>
              </Box>

              <Callout.Root color="blue">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Resources:</strong> Check Github for official Sui Indexer Framework and examples.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>

          {/* On-Chain Randomness Tab */}
          <Tabs.Content value="randomness" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--orange-a2)",
                  borderRadius: "6px",
                  borderLeft: "4px solid var(--orange-9)",
                }}
              >
                <Text weight="bold" size="2">
                  🎲 On-Chain Randomness
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  Randomness simulates chance on-chain, but can expose logic vulnerabilities.
                  Understanding risks and mitigating them is critical.
                </Text>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Randomness Sources
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "13px" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Sui Randomness API</Text>
                    <Text size="1" color="gray">
                      Official random_bytes() function in Move. Uses verifiable randomness from
                      validators. Fair but not instant.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Epoch-Based Randomness</Text>
                    <Text size="1" color="gray">
                      Epoch hash as randomness source. Changes every epoch (~24 hours on mainnet).
                      Deterministic but unpredictable in advance.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">VRF (Verifiable Random Function)</Text>
                    <Text size="1" color="gray">
                      Cryptographic commitment to randomness. Verifiable on-chain. More secure for
                      high-value applications.
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Security Vulnerabilities
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "12px" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--red-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">MEV (Maximal Extractable Value)</Text>
                    <Text size="1" color="gray">
                      Validators can see transactions before inclusion. Frontrunning possible.
                      Mitigation: Use commit-reveal schemes or threshold encryption.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--red-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Predictability</Text>
                    <Text size="1" color="gray">
                      If randomness depends on block hash or timestamp, miners/validators can
                      influence outcome. Use official randomness APIs instead.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--red-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Replay Attacks</Text>
                    <Text size="1" color="gray">
                      Without proper nonce handling, same random value can be used multiple times.
                      Always include unique identifiers.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--red-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Timing Windows</Text>
                    <Text size="1" color="gray">
                      Transactions within same block share randomness. Ensure per-tx uniqueness
                      with sequence numbers or sender addresses.
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Safe Patterns
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "11px", fontFamily: "monospace" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Use Official Randomness</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      use sui::random::Random;<br/>
                      let random_bytes = random::random_bytes(ctx);<br/>
                      let random_u64 = random::next_u64(&random_bytes);
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Add Uniqueness</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      Include tx_context::sender() and tx_context::digest()
                      in randomness hash to prevent replays
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Commit-Reveal</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      For sensitive operations: Tx 1 commits to random value,
                      Tx 2 reveals it later with validation
                    </div>
                  </Box>
                </Flex>
              </Box>

              <Callout.Root color="orange">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Critical:</strong> Never use block hash, timestamp, or predictable values
                  for important randomness. Always audit randomness-dependent code.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>

          {/* GraphQL RPC Tab */}
          <Tabs.Content value="graphql" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--purple-a2)",
                  borderRadius: "6px",
                  borderLeft: "4px solid var(--purple-9)",
                }}
              >
                <Text weight="bold" size="2">
                  📊 GraphQL RPC Queries
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  Query Sui RPC using GraphQL service. More flexible and efficient than traditional
                  REST APIs for complex data fetching.
                </Text>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  GraphQL Advantages
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "13px" }}>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Precise Data:</strong> Request only fields you need</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>No Over-fetching:</strong> Reduce bandwidth and latency</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Nested Queries:</strong> Get related data in single request</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Filtering:</strong> Server-side filters reduce client processing</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Badge>✓</Badge>
                    <Text><strong>Type Safety:</strong> Schema provides clear types and validation</Text>
                  </Flex>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Common Queries
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "11px", fontFamily: "monospace" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Query Object</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      {`query {
  object(address: "0x...") {
    objectId
    owner
    digest
    storageRebate
  }
}`}
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Query Transaction</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      {`query {
  transaction(digest: "0x...") {
    sender
    kind
    gasPrice
    status
  }
}`}
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Query Account Coins</strong></div>
                    <div style={{ marginTop: "6px", color: "var(--gray-11)" }}>
                      {`query {
  coins(owner: "0x...") {
    nodes {
      coinObjectId
      balance
      coinType
    }
  }
}`}
                    </div>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  GraphQL Endpoints
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "12px", fontFamily: "monospace" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Mainnet:</strong></div>
                    <div style={{ color: "var(--gray-11)" }}>
                      https://sui-mainnet.mystenlabs.com/graphql
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Testnet:</strong></div>
                    <div style={{ color: "var(--gray-11)" }}>
                      https://sui-testnet.mystenlabs.com/graphql
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Devnet:</strong></div>
                    <div style={{ color: "var(--gray-11)" }}>
                      https://sui-devnet.mystenlabs.com/graphql
                    </div>
                  </Box>
                </Flex>
              </Box>

              <Callout.Root color="blue">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Docs:</strong> Explore GraphQL schema and playground at endpoints with
                  /graphql path.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>

          {/* Fee Markets Tab */}
          <Tabs.Content value="feemarkets" style={{ marginTop: "16px" }}>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  padding: "12px",
                  backgroundColor: "var(--cyan-a2)",
                  borderRadius: "6px",
                  borderLeft: "4px solid var(--cyan-9)",
                }}
              >
                <Text weight="bold" size="2">
                  💰 Object-Based Local Fee Markets
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  Limits transaction rate on shared objects, preventing network overload from slow
                  checkpoints.
                </Text>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  How It Works
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "13px" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Per-Object Rate Limiting</Text>
                    <Text size="1" color="gray">
                      Each shared object has independent rate limit. Transactions writing to same
                      object compete for limited slots.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Dynamic Pricing</Text>
                    <Text size="1" color="gray">
                      When object is congested, gas price increases. Incentivizes use of less
                      congested objects.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Checkpoint Protection</Text>
                    <Text size="1" color="gray">
                      Prevents slow checkpoints that block entire network. Each shared object
                      contributes independently to throughput.
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Design Implications
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "12px" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--yellow-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Object Design</Text>
                    <Text size="1" color="gray">
                      Split high-contention shared objects into multiple objects to reduce per-object
                      congestion. Use IDs based on transaction sender hash if possible.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--yellow-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Gas Budget Planning</Text>
                    <Text size="1" color="gray">
                      During congestion, gas prices for affected objects increase. Plan for higher
                      gas costs during peak usage.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--yellow-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Monitoring</Text>
                    <Text size="1" color="gray">
                      Track per-object congestion and adjust strategies. Use GraphQL to query object
                      history and identify contention.
                    </Text>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--yellow-a2)", borderRadius: "4px" }}>
                    <Text weight="bold">Fallback Logic</Text>
                    <Text size="1" color="gray">
                      Implement retry logic with exponential backoff. Consider alternative execution
                      paths for congested objects.
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Box>
                <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
                  Example: Account Abstraction Impact
                </Text>
                <Flex direction="column" gap="2" style={{ fontSize: "11px", fontFamily: "monospace" }}>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Avoid:</strong> Single counter object for all users</div>
                    <div style={{ color: "var(--red-11)", marginTop: "4px" }}>
                      All transactions compete → high contention
                    </div>
                  </Box>
                  <Box style={{ padding: "8px", backgroundColor: "var(--gray-a2)", borderRadius: "4px" }}>
                    <div><strong>Better:</strong> Per-user or bucket-based counters</div>
                    <div style={{ color: "var(--green-11)", marginTop: "4px" }}>
                      Distribute load → lower gas, faster execution
                    </div>
                  </Box>
                </Flex>
              </Box>

              <Callout.Root color="blue">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text size="1">
                  <strong>Key Insight:</strong> Object-based fee markets reward good design. Split
                  contention, monitor usage, adapt strategies.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>

        {/* Status */}
        {status && (
          <Box
            style={{
              padding: "12px",
              backgroundColor: "var(--blue-a2)",
              borderRadius: "6px",
              borderLeft: "4px solid var(--blue-9)",
            }}
          >
            <Text size="2">{status}</Text>
          </Box>
        )}

        {/* Resources */}
        <Box>
          <Text weight="bold" size="2" style={{ marginBottom: "8px" }}>
            📚 Official Resources
          </Text>
          <Flex direction="column" gap="2" style={{ fontSize: "12px" }}>
            <Flex gap="2" align="start">
              <Badge variant="soft">→</Badge>
              <Text>Move 2024: https://docs.sui.io/guides/developer/advanced/move-2024</Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge variant="soft">→</Badge>
              <Text>Custom Indexer: https://docs.sui.io/guides/developer/advanced/indexer</Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge variant="soft">→</Badge>
              <Text>Randomness: https://docs.sui.io/guides/developer/advanced/randomness</Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge variant="soft">→</Badge>
              <Text>GraphQL RPC: https://docs.sui.io/guides/developer/advanced/graphql</Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge variant="soft">→</Badge>
              <Text>Fee Markets: https://docs.sui.io/guides/developer/advanced/fee-markets</Text>
            </Flex>
            <Flex gap="2" align="start">
              <Badge variant="soft">→</Badge>
              <Text>App Examples Hub: usa el panel "App Examples" para abrir Weather Oracle, Trustless Swap, Tic-Tac-Toe, Distributed Counter y más sin saturar el landing.</Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}
