import { Box, Callout, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * Sui Object Display standard overview from https://docs.sui.io/standards/display.
 */
export function DisplayInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Sui Object Display</Heading>
      <Text size="2" color="gray" mb="3">
        On-chain templating for off-chain representation. Define <code>Display&lt;T&gt;</code> with a <code>Publisher</code>
        to expose names, images, links, and other fields; nodes render display when queried with <code>showDisplay: true</code>.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Core idea</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Template strings using <code>{`{property}`}</code> to substitute object fields.</Text></li>
          <li><Text size="2">Create with <code>display::new&lt;T&gt;</code> (or <code>new_with_fields</code>) using a <code>Publisher</code> owned by the package.</Text></li>
          <li><Text size="2">Update with <code>add_multiple</code>, <code>edit</code>, <code>remove</code>, then commit via <code>update_version</code> (emits event).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Recommended fields</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">name, description</Text></li>
          <li><Text size="2">link, project_url</Text></li>
          <li><Text size="2">image_url, thumbnail_url</Text></li>
          <li><Text size="2">creator (or other provenance data)</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Example flow</Heading>
      <Box asChild>
        <ol style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Claim <code>Publisher</code> in module init (one-time witness).</Text></li>
          <li><Text size="2">Build key/value vectors; include templated fields like <code>{`{name}`}</code>, <code>{`{id}`}</code>, <code>{`{image_url}`}</code>.</Text></li>
          <li><Text size="2">Create <code>Display&lt;T&gt;</code>, call <code>update_version</code>, transfer Publisher/Display if desired.</Text></li>
          <li><Text size="2">Clients query with <code>showDisplay: true</code> to get rendered metadata.</Text></li>
        </ol>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Why it matters</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Standardized metadata for wallets/explorers without hardcoding off-chain JSON.</Text></li>
          <li><Text size="2">Supports dynamic templating (e.g., URL composed from object id/fields).</Text></li>
          <li><Text size="2">Optimizes on-chain storage by templating common fields (esp. large item sets).</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Keep Publisher keys safe; only the package publisher can set Display for its types. Remember <Link href="https://examples.sui.io/basics/publisher.html" target="_blank">Publisher</Link> basics and include <code>update_version</code> after edits so fullnodes pick up changes.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
