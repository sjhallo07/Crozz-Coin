import { Box, Button, Card, Callout, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import ClipLoader from "react-spinners/ClipLoader";

/**
 * CreateCurrencyPanel - Standard currency creation using new_currency
 * This flow creates a Currency immediately as a shared object.
 * 
 * Registry address: 0xc (sui::coin_registry)
 */
export function CreateCurrencyPanel() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [packageId, setPackageId] = useState(() =>
    localStorage.getItem("create_currency.packageId") || "",
  );
  const [moduleName, setModuleName] = useState("my_coin");
  const [typeName, setTypeName] = useState("MY_COIN");
  const [decimals, setDecimals] = useState("6");
  const [symbol, setSymbol] = useState("MYC");
  const [name, setName] = useState("My Coin");
  const [description, setDescription] = useState("A custom coin on Sui");
  const [iconUrl, setIconUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const ensureConnected = () => {
    if (!account) {
      setStatus("Please connect your wallet first.");
      return false;
    }
    return true;
  };

  const validateInputs = () => {
    if (!packageId || !moduleName || !typeName) {
      setStatus("Package ID, Module name, and Type name are required.");
      return false;
    }
    if (!isValidSuiObjectId(packageId)) {
      setStatus("Package ID must be a valid Sui object ID (0x...).");
      return false;
    }
    const dec = parseInt(decimals, 10);
    if (isNaN(dec) || dec < 0 || dec > 9) {
      setStatus("Decimals must be between 0 and 9.");
      return false;
    }
    if (!symbol || !/^[A-Z0-9]{1,10}$/.test(symbol)) {
      setStatus("Symbol must be 1-10 uppercase ASCII characters.");
      return false;
    }
    if (!name) {
      setStatus("Name is required.");
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    if (!ensureConnected()) return;
    if (!validateInputs()) return;

    setLoading(true);
    setStatus("Creating currency with new_currency...");

    const tx = new Transaction();
    const coinType = `${packageId}::${moduleName}::${typeName}`;
    const registryId = "0xc"; // CoinRegistry system object

    // Call: coin_registry::new_currency<T>
    // Returns: (CurrencyInitializer<T>, TreasuryCap<T>)
    const [currencyInit, treasuryCap] = tx.moveCall({
      target: "0x2::coin_registry::new_currency",
      arguments: [
        tx.object(registryId),
        tx.pure.u8(parseInt(decimals, 10)),
        tx.pure.string(symbol),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(iconUrl),
      ],
      typeArguments: [coinType],
    });

    // Finalize the currency (returns MetadataCap)
    const [metadataCap] = tx.moveCall({
      target: "0x2::coin_registry::finalize",
      arguments: [currencyInit],
      typeArguments: [coinType],
    });

    // Transfer TreasuryCap and MetadataCap to sender
    tx.transferObjects([treasuryCap, metadataCap], account!.address);

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (res) => {
          setStatus(`✅ Currency created! Digest: ${res.digest}. Check explorer for TreasuryCap and MetadataCap.`);
          setLoading(false);
        },
        onError: (err) => {
          setStatus(`❌ Failed: ${err.message}`);
          setLoading(false);
        },
      }
    );
  };

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">Create Currency (Standard)</Heading>
        <Text size="2" color="gray">Uses new_currency (immediate shared object)</Text>
      </Flex>

      <Callout.Root color="blue" mb="3">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Standard flow: call <code>new_currency</code> → <code>finalize</code> → Currency is shared immediately.
          Registry: <code>0xc</code>
        </Callout.Text>
      </Callout.Root>

      <Flex direction="column" gap="3">
        <TextField.Root
          placeholder="Package ID (0x...)"
          value={packageId}
          onChange={(e) => {
            const v = e.target.value.trim();
            setPackageId(v);
            localStorage.setItem("create_currency.packageId", v);
          }}
        />
        <Flex gap="3">
          <TextField.Root
            placeholder="Module name (e.g., my_coin)"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value.trim())}
          />
          <TextField.Root
            placeholder="Type name (e.g., MY_COIN)"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value.trim())}
          />
        </Flex>

        <Flex gap="3">
          <TextField.Root
            placeholder="Decimals (0-9)"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
          />
          <TextField.Root
            placeholder="Symbol (e.g., MYC)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
        </Flex>

        <TextField.Root
          placeholder="Name (e.g., My Coin)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField.Root
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField.Root
          placeholder="Icon URL (optional)"
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value.trim())}
        />

        <Button onClick={handleCreate} disabled={loading}>
          {loading ? <ClipLoader size={16} /> : "Create Currency"}
        </Button>

        {status && (
          <Card style={{ padding: 12, backgroundColor: "var(--gray-a3)" }}>
            <Text size="2">{status}</Text>
          </Card>
        )}
      </Flex>
    </Box>
  );
}
