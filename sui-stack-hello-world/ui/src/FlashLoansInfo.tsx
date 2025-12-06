import { Box, Callout, Heading, Separator, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/**
 * DeepBookV3 flash loans overview from https://docs.sui.io/standards/deepbookv3/flash-loans.
 */
export function FlashLoansInfo() {
  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Heading size="4" mb="2">Flash loans (DeepBookV3)</Heading>
      <Text size="2" color="gray" mb="3">
        Uncollateralized, same-PTB loans of base or quote from any pool. Borrow + return within the transaction; a
        <em>FlashLoan</em> hot potato enforces repayment.
      </Text>

      <Separator my="2" size="4" />

      <Heading size="3">Borrow</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Borrow base: returns assets plus <em>FlashLoan</em> token to force in-PTB repayment.</Text></li>
          <li><Text size="2">Borrow quote: same pattern for quote asset.</Text></li>
          <li><Text size="2">Amount can be up to pool-owned balance.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Heading size="3">Repay</Heading>
      <Box asChild>
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          <li><Text size="2">Return base loan: unwraps <em>FlashLoan</em> only when funds are repaid; otherwise the PTB reverts.</Text></li>
          <li><Text size="2">Return quote loan: same for quote.</Text></li>
        </ul>
      </Box>

      <Separator my="2" size="4" />

      <Callout.Root color="amber">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Flash loans are atomic: failure to return reverts the entire PTB. Borrowing from a pool and trading in the same
          pool can fail because borrowed funds aren’t available for movement—structure PTBs to avoid self-depletion.
        </Callout.Text>
      </Callout.Root>
    </Box>
  );
}
