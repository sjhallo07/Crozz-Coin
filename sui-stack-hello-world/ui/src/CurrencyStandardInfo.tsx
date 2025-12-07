import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Highlights the Sui Currency Standard and Coin Registry flows.
 */
export function CurrencyStandardInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Currency Standard (sui::coin_registry)</Heading>
      <Text size="2" color="gray" mb="3">
        <code>Currency&lt;T&gt;</code> objects live in the system Coin Registry at address <code>0xc</code> and unify
        metadata, supply state, and regulatory settings. Creation paths return a <code>CurrencyInitializer</code>
        and <code>TreasuryCap</code> so you can configure supply and regulation before finalizing.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Creation flows</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li>
            <Text size="2">
              <strong>Standard:</strong> <code>new_currency</code> (requires <code>key</code> ability). Immediately derives
              a shared <code>Currency&lt;T&gt;</code> when <code>finalize</code> is called.
            </Text>
          </li>
          <li>
            <Text size="2">
              <strong>One-Time Witness:</strong> <code>new_currency_with_otw</code> (requires OTW proof). After init you must
              call <code>finalize_registration</code> in a separate transaction to promote it into the registry.
            </Text>
          </li>
          <li>
            <Text size="2">
              Both flows produce <code>CurrencyInitializer</code> which you can mutate—mark regulated, set fixed supply,
              or burn-only—before finalization.
            </Text>
          </li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Supply & regulation</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li>
            <Text size="2">
              Supply states are <strong>Unknown</strong>, <strong>Fixed</strong>, or <strong>BurnOnly</strong>. Switching is one-way:
              you cannot revert from Fixed/BurnOnly back to Unknown.
            </Text>
          </li>
          <li>
            <Text size="2">
              Regulated coins capture deny-cap provenance inside <code>RegulatedState</code>; you can migrate legacy states via
              <code>migrate_regulated_state_by_metadata</code> or <code>_by_cap</code>.
            </Text>
          </li>
          <li>
            <Text size="2">
              Burning via <code>coin_registry::burn</code> / <code>burn_balance</code> only works for BurnOnly supply; otherwise
              require TreasuryCap in the <code>coin</code> module.
            </Text>
          </li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Metadata governance</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li>
            <Text size="2">
              <code>MetadataCap</code> gates updates to name, symbol, description, and icon. It can be claimed once and optionally
              deleted to freeze metadata permanently.
            </Text>
          </li>
          <li>
            <Text size="2">
              Legacy <code>CoinMetadata</code> can be migrated with <code>migrate_legacy_metadata</code>; once claimed, you must use
              <code>set_*</code> helpers instead of legacy updates.
            </Text>
          </li>
          <li>
            <Text size="2">
              Dynamic fields (Bag + VecMap) allow extensibility—use them for custom analytics, attestations, or off-chain
              proof references without altering the base struct.
            </Text>
          </li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Migration roadmap</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li>
            <Text size="2">
              Map legacy constructors: <code>coin::create_currency</code> → <code>coin_registry::new_currency_with_otw</code> and
              <code>coin::create_regulated_currency_v2</code> → <code>new_currency_with_otw</code> + <code>make_regulated</code>.
            </Text>
          </li>
          <li>
            <Text size="2">
              After migration, persist <code>TreasuryCap</code> IDs inside <code>Currency</code> using <code>set_treasury_cap_id</code> to ensure
              indexers and wallets locate supply controllers.
            </Text>
          </li>
          <li>
            <Text size="2">
              Consider emitting events when finalizing or migrating so dApps can reconcile registry state with off-chain
              inventory systems.
            </Text>
          </li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow" mb="3">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          When using OTW flows, do not forget the <code>finalize_registration</code> step. Until it runs, wallets cannot resolve
          your currency type from the registry and RPC queries will fail.
        </Callout.Text>
      </Callout.Root>

      <Callout.Root color="green">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Best practices: store capabilities in dedicated custodial accounts, automate monitoring for metadata changes,
          and cache registry reads—<code>Currency&lt;T&gt;</code> objects change infrequently but are central to UX.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
