import { Box, Callout, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

/**
 * Sui Payment Kit overview from https://docs.sui.io/standards/payment-kit.
 */
export function PaymentKitInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Sui Payment Kit</Heading>
      <Text size="2" color="gray" mb="3">
        Framework for secure, standardized payment flows on Sui. Supports persistent registries with duplicate
        prevention or lightweight ephemeral payments, emits events, and returns receipts for off-chain verification.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Core capabilities</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Validates expected amount and transfers coins safely (any coin type).</Text></li>
          <li><Text size="2">Optional <code>PaymentRegistry</code> for duplicate detection + receipt storage.</Text></li>
          <li><Text size="2">Generates <code>PaymentReceipt</code> objects and emits events for tracking.</Text></li>
          <li><Text size="2">Supports transaction URIs for wallet-friendly payment links.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Payment modes</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li>
            <Text size="2"><strong>Registry payments</strong> — use <code>process_registry_payment</code> with <code>PaymentRegistry</code> to enforce duplicate prevention and keep receipts; funds can stay in the registry or forward to receiver.</Text>
          </li>
          <li>
            <Text size="2"><strong>Ephemeral payments</strong> — use <code>process_ephemeral_payment</code> for one-off transfers (no duplicate checks, no stored records) but still get a receipt + event.</Text>
          </li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Duplicate prevention (registry)</Heading>
      <Text size="2">
        Composite <code>PaymentKey&lt;T&gt;</code> = nonce (UUIDv4), amount, coin type, receiver. Stored as a <code>PaymentRecord</code>
        inside the registry; attempting to reuse the same key triggers <code>EDuplicatePayment</code>.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Receipts vs records</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2"><strong>PaymentReceipt</strong>: returned object with nonce, amount, coin type, receiver, timestamp, and payment type.</Text></li>
          <li><Text size="2"><strong>PaymentRecord</strong>: internal registry table entry for duplicate detection; expires after configured epochs and can be deleted with <code>delete_payment_record</code> once expired.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Registry lifecycle</Heading>
      <Box asChild>
        <ol style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Create with <code>create_registry(namespace, name, ctx)</code>; yields <code>PaymentRegistry</code> + <code>RegistryAdminCap</code>.</Text></li>
          <li><Text size="2">Process payments via <code>process_registry_payment</code> providing nonce, amount, coin, receiver?, clock.</Text></li>
          <li><Text size="2">Configure via admin cap: <code>set_config_epoch_expiration_duration</code> (record retention) and <code>set_config_registry_managed_funds</code> (retain funds vs forward).</Text></li>
          <li><Text size="2">Withdraw retained funds with <code>withdraw_from_registry</code> (requires admin cap).</Text></li>
          <li><Text size="2">Clean up expired records with <code>delete_payment_record</code> using the original payment key.</Text></li>
        </ol>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Transaction URIs (wallet links)</Heading>
      <Text size="2" mb="2">
        Format: <code>sui:&lt;address&gt;?amount=&lt;u64&gt;&amp;coinType=&lt;type&gt;&amp;nonce=&lt;uuid&gt;&amp;label=&lt;text&gt;&amp;icon=&lt;url&gt;&amp;message=&lt;text&gt;&amp;registry=&lt;id|name&gt;</code>.
      </Text>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Always URL-encode parameters; double colons become <code>%3A%3A</code>.</Text></li>
          <li><Text size="2">If <code>registry</code> provided → route to <code>process_registry_payment</code>; else use ephemeral payment.</Text></li>
          <li><Text size="2">Suggested defaults: coin type <code>0x2::sui::SUI</code> when omitted; generate nonce with UUIDv4.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Events & errors</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Events include nonce, amount, coin type, receiver, timestamp, registry info for off-chain analytics.</Text></li>
          <li><Text size="2">Common errors: duplicate payment, amount mismatch, record not found/not expired, unauthorized admin, invalid/duplicate registry name.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Namespace IDs (testnet: <code>0xa501...878db</code>, mainnet: <code>0xccd3...ae7c2</code>) scope registry names. Keep the <code>RegistryAdminCap</code> safe—it's required for config and withdrawals. See <Link href="https://github.com/MystenLabs/sui-payment-kit" target="_blank">Move</Link> and <Link href="https://github.com/MystenLabs/ts-sdks/tree/main/packages/payment-kit" target="_blank">TS SDK</Link> for code.</Callout.Text>
      </Callout.Root>
    </Box>
  );
}
