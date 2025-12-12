import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Sui Kiosk overview + quick reference.
 */
export function KioskInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Sui Kiosk</Heading>
      <Text size="2" color="gray" mb="3">
        Shared commerce primitive on Sui for listing, trading, and extending asset sales. Owners keep control until
        purchase; creators set TransferPolicies; marketplaces index events.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Key roles</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2"><strong>Owners</strong>: hold <code>KioskOwnerCap</code>; place/lock/list/take, add extensions, withdraw proceeds.</Text></div>
          <div><Text size="2"><strong>Buyers</strong>: purchase from listings; pay fees per TransferPolicy; can bid via kiosks.</Text></div>
          <div><Text size="2"><strong>Marketplaces</strong>: index kiosk events, surface listings/bids, can add extensions/policies.</Text></div>
          <div><Text size="2"><strong>Creators</strong>: publish <code>TransferPolicy</code> rules (royalties, locks, tracks), enable/disable trades.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Core guarantees</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Every trade resolves a <code>TransferPolicy</code>; policy changes apply instantly and globally.</Text></div>
          <div><Text size="2">True ownership: only kiosk owner can take/list/borrow/mutate assets in their kiosk.</Text></div>
          <div><Text size="2">Assets unchanged until trade completes; PurchaseCap-enforced flows keep items locked as declared.</Text></div>
          <div><Text size="2">Extensions can be enabled/disabled anytime; extension state is always accessible.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Asset states</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2"><strong>PLACED</strong>: via <code>kiosk::place</code>; withdraw, borrow, or list.</Text></div>
          <div><Text size="2"><strong>LOCKED</strong>: via <code>kiosk::lock</code> with TransferPolicy; cannot withdraw, can borrow/list.</Text></div>
          <div><Text size="2"><strong>LISTED</strong>: via <code>list</code>/<code>place_and_list</code>; immutable borrow or delist.</Text></div>
          <div><Text size="2"><strong>LISTED EXCLUSIVELY</strong>: via <code>list_with_purchase_cap</code>; owner-approved, extension must provide unlock/delist.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Common flows (PTB-friendly)</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2"><strong>Create</strong>: <code>kiosk::default</code> (shares kiosk, returns KioskOwnerCap); advanced: <code>kiosk::new</code> then share.</Text></div>
          <div><Text size="2"><strong>Place</strong>: <code>kiosk::place</code> (owner cap + item), free placement.</Text></div>
          <div><Text size="2"><strong>Lock</strong>: <code>kiosk::lock</code> (owner cap + TransferPolicy + item) for policies requiring non-removal.</Text></div>
          <div><Text size="2"><strong>List</strong>: <code>kiosk::list</code> / <code>place_and_list</code> (price in MIST); emit <code>ItemListed</code>.</Text></div>
          <div><Text size="2"><strong>Delist</strong>: <code>kiosk::delist</code> returns listing fee; emits <code>ItemDelisted</code>.</Text></div>
          <div><Text size="2"><strong>Purchase</strong>: <code>kiosk::purchase</code> returns asset + <code>TransferRequest</code>; buyer must satisfy TransferPolicy.</Text></div>
          <div><Text size="2"><strong>Borrow</strong>: <code>borrow</code>/<code>borrow_mut</code> (module refs) or PTB-friendly <code>borrow_val</code> + <code>return_val</code>.</Text></div>
          <div><Text size="2"><strong>Withdraw proceeds</strong>: <code>kiosk::withdraw</code> (Option&lt;u64&gt; amount) to collect sale revenue.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Owner tips</Heading>
      <Box asChild>
        <div style={{ margin: 0, paddingInlineStart: "18px" }}>
          <div><Text size="2">Keep <code>KioskOwnerCap</code> secure; it controls the kiosk.</Text></div>
          <div><Text size="2">Use LOCKED + TransferPolicy for strong royalty/transfer enforcement.</Text></div>
          <div><Text size="2">Prefer audited extensions before <code>list_with_purchase_cap</code>; otherwise assets may stay locked.</Text></div>
          <div><Text size="2">Monitor events (<code>ItemListed</code>/<code>ItemDelisted</code>/purchases) for indexing and ops.</Text></div>
        </div>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Every sale must satisfy a <code>TransferPolicy</code>. Creator policy changes take effect immediately and
          globally—test on Testnet before production.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
