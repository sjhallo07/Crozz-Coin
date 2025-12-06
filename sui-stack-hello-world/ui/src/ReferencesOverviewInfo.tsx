import { Box, Callout, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * Sui References Overview from https://docs.sui.io/references.
 * Comprehensive reference docs for RPC, Move, CLI, IDEs, and SDKs.
 */
export function ReferencesOverviewInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Sui References Overview</Heading>
      <Text size="2" color="gray" mb="3">
        Centralized hub for RPC, GraphQL, Move, CLI tools, IDE support, and SDKs. Reference Sui framework modules,
        Move language specs, and interact with Sui networks via CLI or code.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">RPC & GraphQL</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>Sui RPC</strong>: Framework and RPC docs for blockchain code internals.</Text></li>
          <li><Text size="2"><strong>GraphQL for Sui RPC</strong>: Public service enabling efficient network interaction (recommended for new projects).</Text></li>
          <li><Text size="2"><strong>JSON-RPC</strong>: Legacy reference for projects not yet migrated to GraphQL.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Move resources</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>Sui Framework</strong>: Move modules for Sui logic and standards (auto-generated from code comments).</Text></li>
          <li><Text size="2"><strong>The Move Book</strong>: Comprehensive guide to Move on Sui.</Text></li>
          <li><Text size="2"><strong>The Move Reference</strong>: Architecture and syntax documentation.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">CLI tools</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>Sui Client CLI</strong>: Generate addresses, access networks (base commands for feature sets).</Text></li>
          <li><Text size="2"><strong>Sui Client PTB CLI</strong>: Build, preview, execute programmable transaction blocks from terminal.</Text></li>
          <li><Text size="2"><strong>Sui Move CLI</strong>: Access Sui Move functions on-chain.</Text></li>
          <li><Text size="2"><strong>Sui Replay CLI</strong>: Access Sui Move functions on-chain (same as Move CLI).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">IDE support (VSCode)</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li>
            <Text size="2">
              <strong>Move extension</strong>: Code navigation, completion, diagnostics for Move (
              <Link href="https://marketplace.visualstudio.com/items?itemName=mysten.move" target="_blank">install</Link>).
            </Text>
          </li>
          <li>
            <Text size="2">
              <strong>Move Trace Debugger</strong>: Debug execution traces directly in VS Code (
              <Link href="https://marketplace.visualstudio.com/items?itemName=mysten.move-trace-debug" target="_blank">install</Link>).
            </Text>
          </li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">SDKs</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>Sui TypeScript SDK</strong>: Official TS SDK with its own microsite for interaction in TypeScript.</Text></li>
          <li><Text size="2"><strong>Sui Rust SDK</strong>: Rust wrappers around Sui API; interact with Sui networks via Rust.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          For new integrations, prefer GraphQL for RPC; use JSON-RPC only for legacy projects. Explore the <Link href="https://docs.sui.io/references" target="_blank">full References</Link> page for direct links to all tools, frameworks, and SDKs.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
