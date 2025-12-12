import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Sui Kiosk Apps overview + key API points.
 */
export function KioskAppsInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Kiosk Apps</Heading>
      <Text size="2" color="gray" mb="3">
        Extensions that add functionality to Sui Kiosk without changing core logic. Two kinds: basic (metadata/dyn fields)
        and permissioned (via <code>kiosk_extension</code> API with permissions).
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Basic apps</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Don’t need Kiosk Apps API; often attach dynamic fields (e.g., kiosk name) using <code>uid_mut_as_owner</code>.</Text></div>
          <div><Text size="2">Anyone can read <code>uid</code>; only owner (with <code>KioskOwnerCap</code>) can mutate via <code>uid_mut_as_owner</code>.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Permissioned apps (kiosk_extension)</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Installed via explicit <code>kiosk_extension::add</code> call; owner can <code>disable</code>/<code>enable</code> anytime.</Text></div>
          <div><Text size="2">Permissions bitmap (<code>u128</code>): bit0 place, bit1 place+lock (currently only two bits defined).</Text></div>
          <div><Text size="2">All-or-nothing on install; disable revokes all permissions; remove requires empty app storage.</Text></div>
          <div><Text size="2">Protected helpers: <code>kiosk_extension::place</code>, <code>kiosk_extension::lock</code>; checks via <code>can_place</code>/<code>can_lock</code>.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">App lifecycle</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Install: owner calls app’s <code>add</code> (wraps <code>kiosk_extension::add</code> with app witness + permissions).</Text></div>
          <div><Text size="2">Disable/enable: <code>kiosk_extension::disable</code>/<code>enable</code>.</Text></div>
          <div><Text size="2">Remove: <code>kiosk_extension::remove</code> only if storage empty; rebates storage cost.</Text></div>
          <div><Text size="2">Storage: each app gets its own Bag; accessed via <code>storage</code>/<code>storage_mut</code> with app witness.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Best practices</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Define a constant PERMISSIONS in the app to document required rights.</Text></div>
          <div><Text size="2">Keep storage minimal; design for removal (drain state before uninstall).</Text></div>
          <div><Text size="2">Audit extensions, especially those using <code>list_with_purchase_cap</code> or requiring lock permissions.</Text></div>
          <div><Text size="2">Use <code>can_place</code>/<code>can_lock</code> checks before calling protected ops; surface clear errors.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Installation is explicit and owner-controlled. Permissions are all-or-nothing; keep app storage empty before
          removal and disable untrusted extensions promptly.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
