import { Box, Callout, Heading, Separator, Table, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * Coin vs Token API quick comparison (from Sui docs).
 */
export function CoinTokenComparison() {
  const rows: Array<{
    fn: string;
    coin: string;
    token: string;
    note: string;
  }> = [
    { fn: "mint", coin: "+", token: "+", note: "Requires TreasuryCap" },
    { fn: "burn", coin: "+", token: "+", note: "Requires TreasuryCap" },
    { fn: "join", coin: "+", token: "+", note: "Public" },
    { fn: "split", coin: "+", token: "+", note: "Public" },
    { fn: "zero", coin: "+", token: "+", note: "Public" },
    { fn: "destroy_zero", coin: "+", token: "+", note: "Public" },
    { fn: "keep", coin: "-", token: "+", note: "Send token back to sender (needed due to transfer protections)" },
    { fn: "transfer", coin: "+", token: "[protected]", note: "Coin free to transfer; Token requires authorization" },
    { fn: "to_balance / to_coin", coin: "+", token: "[protected]", note: "Token conversion to coin requires authorization" },
    { fn: "from_balance / from_coin", coin: "+", token: "[protected]", note: "Token creation from coin requires authorization" },
    { fn: "spend", coin: "-", token: "[protected]", note: "Token spend consumes token and needs authorization" },
  ];

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Coin vs Token API</Heading>
      <Text size="2" color="gray" mb="3">
        Quick reference for <code>coin</code> and <code>token</code> modules. "[protected]" actions emit
        <code> ActionRequest</code> and must be authorized by policy/rules (TokenPolicy or TreasuryCap paths).
      </Text>

      <Separator my="2" size="4" />

      <Table.Root size="2" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Function</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Coin</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Note</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.fn}>
              <Table.RowHeaderCell>{row.fn}</Table.RowHeaderCell>
              <Table.Cell>{row.coin}</Table.Cell>
              <Table.Cell>{row.token}</Table.Cell>
              <Table.Cell>{row.note}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Separator my="2" size="4" />

      <Callout.Root color="yellow">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Token protected actions default to deny until explicitly allowed by <code>TokenPolicy</code> (or confirmed with
          <code> TreasuryCap</code>). Be explicit about which conversions/transfers/spend you enable.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
