import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Educational panel that distills the highlights of the Sui Coin Standard.
 */
export function CoinStandardInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Coin Standard (sui::coin)</Heading>
      <Text size="2" color="gray" mb="3">
        Coins are fungible objects of type <code>Coin&lt;T&gt;</code> created with
        <code> coin::create_currency </code> or <code>coin::create_regulated_currency_v2</code>.
        The publisher receives a <code>TreasuryCap&lt;T&gt;</code> that governs minting and burning.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Lifecycle essentials</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div>
            <Text size="2">
              <strong>Create:</strong> Publishing module calls <code>coin::create_currency</code> and returns
              a TreasuryCap. Regulated flows use <code>create_regulated_currency_v2</code> to also mint a
              <code>DenyCapV2</code>.
            </Text>
          </div>
          <div>
            <Text size="2">
              <strong>Supply models:</strong> Decide between fixed, burn-only, or flexible supply. Fixed and burn-only
              should destroy or escrow the TreasuryCap to enforce the constraint.
            </Text>
          </div>
          <div>
            <Text size="2">
              <strong>Metadata:</strong> Standard coins emit <code>CoinMetadata</code>; regulated coins include
              <code>RegulatedCoinMetadata</code> (tying metadata, deny cap, and governance).
            </Text>
          </div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Minting & burning</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div>
            <Text size="2">
              Mint with <code>coin::mint</code> using the TreasuryCap. Values respect the <code>decimals</code>
              field in metadata (e.g. raw 1_000_000 with 6 decimals renders as 1.000000).
            </Text>
          </div>
          <div>
            <Text size="2">
              Burn with <code>coin::burn</code>, returning the amount removed from supply. Cannot exceed total supply.
            </Text>
          </div>
          <div>
            <Text size="2">
              Treat TreasuryCap like a root admin secret—transferring it delegates full supply control.
            </Text>
          </div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Regulation & deny lists</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div>
            <Text size="2">
              <strong>DenyList:</strong> Shared object at <code>0x403</code>. Use
              <code> coin::deny_list_v2_add / remove </code> with the <code>DenyCapV2</code> to manage addresses.
            </Text>
          </div>
          <div>
            <Text size="2">
              <strong>Global pause:</strong> If <code>allow_global_pause</code> is true, the deny cap holder can pause
              all transactions (<code>enable_global_pause</code>) or resume them (<code>disable_global_pause</code>).
            </Text>
          </div>
          <div>
            <Text size="2">
              SDK helpers exist in both TypeScript and Rust. Prefer programmable transaction blocks to batch
              denies/allow operations with audit logs.
            </Text>
          </div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Maintenance & best practices</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div>
            <Text size="2">
              Freeze <code>CoinMetadata</code> after initialization unless you explicitly support updates; regulated flows
              auto-freeze to guarantee integrity.
            </Text>
          </div>
          <div>
            <Text size="2">
              Monitor deny list operations and TreasuryCap transfers—both are high-risk actions that should emit
              events and on-chain logs.
            </Text>
          </div>
          <div>
            <Text size="2">
              Plan your migration path: CoinMetadata is slated for deprecation; new projects should prefer the
              Currency standard for richer supply/regulatory tracking.
            </Text>
          </div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="red">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Never share or freeze the <code>TreasuryCap</code>. Exposing it lets attackers mint infinite supply. Restrict access
          tightly, automate monitoring, and consider hardware custody for production deployments.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
