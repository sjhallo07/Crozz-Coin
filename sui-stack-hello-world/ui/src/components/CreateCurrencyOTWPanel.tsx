import { Box, Button, Card, Callout, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

/**
 * CreateCurrencyOTWPanel - OTW currency creation guide
 * This is a TWO-STEP process that requires:
 * 1. Package publish with init calling new_currency_with_otw
 * 2. Separate transaction calling finalize_registration
 * 
 * This panel provides instructions and the finalize_registration command.
 */
export function CreateCurrencyOTWPanel() {
  const [currencyObjectId, setCurrencyObjectId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [moduleName, setModuleName] = useState("my_coin");
  const [typeName, setTypeName] = useState("MY_COIN");

  const coinType = packageId && moduleName && typeName
    ? `${packageId}::${moduleName}::${typeName}`
    : "";

  const buildFinalizeCommand = () => {
    if (!currencyObjectId || !coinType) {
      return "# Fill in Currency Object ID and coin type above";
    }
    return `sui client ptb \\
  --assign ${currencyObjectId} currency_to_promote \\
  --move-call 0x2::coin_registry::finalize_registration @0xc currency_to_promote \\
  --gas-budget 100000000`;
  };

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">Create Currency (OTW - Two-Step)</Heading>
        <Text size="2" color="gray">One-Time Witness flow</Text>
      </Flex>

      <Callout.Root color="orange" mb="3">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          <strong>Two-step process required:</strong> After publishing package with <code>new_currency_with_otw</code> in init,
          you MUST call <code>finalize_registration</code> to complete the currency setup.
        </Callout.Text>
      </Callout.Root>

      <Flex direction="column" gap="3">
        <Heading size="3">Step 1: Publish Package with OTW</Heading>
        <Card style={{ padding: 12, backgroundColor: "var(--gray-a3)" }}>
          <Text size="2" weight="medium" style={{ marginBottom: 8 }}>Example Move module:</Text>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "11px" }}>
{`module my_package::my_coin {
    use sui::coin_registry;

    public struct MY_COIN has drop {}

    fun init(witness: MY_COIN, ctx: &mut TxContext) {
        let (mut currency, treasury_cap) = coin_registry::new_currency_with_otw(
            witness,
            6,                              // decimals
            b"MYC".to_string(),             // symbol
            b"My Coin".to_string(),         // name
            b"A custom coin".to_string(),   // description
            b"".to_string(),                // icon_url
            ctx,
        );

        // Optional: make regulated
        // let deny_cap = currency.make_regulated(true, ctx);
        // transfer::public_transfer(deny_cap, ctx.sender());

        let metadata_cap = currency.finalize(ctx);
        transfer::public_transfer(treasury_cap, ctx.sender());
        transfer::public_transfer(metadata_cap, ctx.sender());
    }
}`}
          </pre>
        </Card>

        <Callout.Root color="blue" mb="2">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            After publishing, a <code>Currency&lt;T&gt;</code> object is transferred to <code>0xc</code> (registry).
            Find its Object ID in the transaction output.
          </Callout.Text>
        </Callout.Root>

        <Heading size="3">Step 2: Finalize Registration</Heading>
        <Text size="2" color="gray" mb="2">
          Copy the Currency object ID from publish output and paste below:
        </Text>

        <TextField.Root
          placeholder="Currency Object ID (from publish output)"
          value={currencyObjectId}
          onChange={(e) => setCurrencyObjectId(e.target.value.trim())}
        />

        <Flex gap="3">
          <TextField.Root
            placeholder="Package ID (0x...)"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value.trim())}
          />
          <TextField.Root
            placeholder="Module (e.g., my_coin)"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value.trim())}
          />
          <TextField.Root
            placeholder="Type (e.g., MY_COIN)"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value.trim())}
          />
        </Flex>

        {coinType && (
          <Text size="2" color="cyan">
            Coin type: <code>{coinType}</code>
          </Text>
        )}

        <Card style={{ padding: 12, backgroundColor: "var(--gray-a3)" }}>
          <Text size="2" weight="medium" style={{ marginBottom: 8 }}>
            Run this command in your terminal:
          </Text>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "11px", wordBreak: "break-all" }}>
            {buildFinalizeCommand()}
          </pre>
        </Card>

        <Button
          onClick={() => {
            navigator.clipboard.writeText(buildFinalizeCommand());
          }}
          disabled={!currencyObjectId || !coinType}
        >
          Copy Command
        </Button>

        <Callout.Root color="green">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            After running finalize_registration, the Currency becomes a shared object at a derived address.
            Anyone can query it using the coin type.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </Box>
  );
}
