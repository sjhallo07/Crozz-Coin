import { useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiAddress, isValidSuiObjectId } from "@mysten/sui/utils";
import {
  Box,
  Button,
  Callout,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import ClipLoader from "react-spinners/ClipLoader";
import { useTransactionExecution } from "../hooks/useTransactionExecution";

/**
 * Self-service token factory panel
 *
 * Assumed factory Move function signature (adjust in UI if your factory differs):
 *   public fun create_token_with_fee(
 *     name: String,
 *     symbol: String,
 *     decimals: u8,
 *     initial_supply: u64,
 *     fee_recipient: address,
 *     fee_amount: u64,
 *     description: String,
 *     icon_url: String,
 *   )
 * Returns a (TreasuryCap, metadata object, and/or freshly minted Coin).
 */
export function TokenFactoryPanel() {
  const account = useCurrentAccount();
  const { execute, loading, error, lastDigest } = useTransactionExecution();

  const [packageId, setPackageId] = useState(() => localStorage.getItem("factory.packageId") || "");
  const [moduleName, setModuleName] = useState("token_factory");
  const [functionName, setFunctionName] = useState("create_token_with_fee");

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("9");
  const [initialSupply, setInitialSupply] = useState("1000000000");

  const [feeAmount, setFeeAmount] = useState("10000000"); // in MIST
  const [feeRecipient, setFeeRecipient] = useState(() => account?.address ?? "");

  const [description, setDescription] = useState("Utility token for my app");
  const [iconUrl, setIconUrl] = useState("https://example.com/icon.png");
  const [status, setStatus] = useState<string>("");

  const target = useMemo(() => {
    if (!packageId || !moduleName || !functionName) return "";
    return `${packageId}::${moduleName}::${functionName}`;
  }, [packageId, moduleName, functionName]);

  useEffect(() => {
    if (error) {
      setStatus(`Create failed: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (lastDigest) {
      setStatus(`Create submitted. Digest: ${lastDigest}`);
    }
  }, [lastDigest]);

  const validate = () => {
    if (!account) {
      setStatus("Connect your wallet on Sui first.");
      return false;
    }
    if (!packageId || !isValidSuiObjectId(packageId)) {
      setStatus("Package ID must be a valid 0x... Sui object ID.");
      return false;
    }
    if (!moduleName || !functionName) {
      setStatus("Module and function are required.");
      return false;
    }
    if (!name.trim() || !symbol.trim()) {
      setStatus("Name and symbol are required.");
      return false;
    }

    let decimalsNum: number;
    try {
      decimalsNum = Number(decimals);
    } catch {
      setStatus("Decimals must be a number between 0 and 18.");
      return false;
    }
    if (!Number.isInteger(decimalsNum) || decimalsNum < 0 || decimalsNum > 18) {
      setStatus("Decimals must be an integer between 0 and 18.");
      return false;
    }

    try {
      const supply = BigInt(initialSupply);
      if (supply <= 0n) {
        setStatus("Initial supply must be > 0.");
        return false;
      }
    } catch {
      setStatus("Initial supply must be a valid integer.");
      return false;
    }

    try {
      const fee = BigInt(feeAmount || "0");
      if (fee < 0) {
        setStatus("Fee must be >= 0.");
        return false;
      }
    } catch {
      setStatus("Fee must be a valid integer (in MIST).");
      return false;
    }

    if (feeAmount && !isValidSuiAddress(feeRecipient)) {
      setStatus("Fee recipient must be a valid Sui address.");
      return false;
    }

    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;

    setStatus("Submitting token creation...");
    execute((tx: Transaction) => {
      const decimalsNum = Number(decimals);
      const supply = BigInt(initialSupply);
      const fee = BigInt(feeAmount || "0");

      const args = [
        tx.pure.string(name.trim()),
        tx.pure.string(symbol.trim()),
        tx.pure.u8(decimalsNum),
        tx.pure.u64(supply),
        tx.pure.address(feeRecipient || account!.address),
        tx.pure.u64(fee),
        tx.pure.string(description.trim()),
        tx.pure.string(iconUrl.trim()),
      ];

      tx.moveCall({
        target,
        arguments: args,
      });
    });
  };

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">Self-Service Token Factory</Heading>
        {target && <Text size="2" color="gray">Target: {target}</Text>}
      </Flex>

      <Callout.Root color="blue" mb="3">
        <Callout.Icon>ℹ️</Callout.Icon>
        <Callout.Text>
          This panel assumes a factory Move function that mints a new fungible token, charges a fee, and returns the minted assets.
          Adjust module/function or args to match your deployed factory. Amounts are raw units (MIST for fees).
        </Callout.Text>
      </Callout.Root>

      <Grid columns={{ initial: "1", md: "2" }} gap="3">
        <TextField.Root
          placeholder="Package ID"
          value={packageId}
          onChange={(e) => {
            const v = e.target.value.trim();
            setPackageId(v);
            localStorage.setItem("factory.packageId", v);
          }}
        />
        <Flex gap="2">
          <TextField.Root
            placeholder="Module"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value.trim())}
          />
          <TextField.Root
            placeholder="Function"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value.trim())}
          />
        </Flex>
      </Grid>

      <Separator my="3" size="4" />

      <Grid columns={{ initial: "1", md: "2" }} gap="3">
        <TextField.Root
          placeholder="Token name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField.Root
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <TextField.Root
          placeholder="Decimals (0-18)"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
        />
        <TextField.Root
          placeholder="Initial supply (raw units)"
          value={initialSupply}
          onChange={(e) => setInitialSupply(e.target.value)}
        />
      </Grid>

      <Separator my="3" size="4" />

      <Grid columns={{ initial: "1", md: "2" }} gap="3">
        <TextField.Root
          placeholder="Fee amount (MIST)"
          value={feeAmount}
          onChange={(e) => setFeeAmount(e.target.value)}
        />
        <TextField.Root
          placeholder="Fee recipient (address)"
          value={feeRecipient}
          onChange={(e) => setFeeRecipient(e.target.value.trim())}
        />
      </Grid>

      <Separator my="3" size="4" />

      <TextArea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField.Root
        mt="3"
        placeholder="Icon URL"
        value={iconUrl}
        onChange={(e) => setIconUrl(e.target.value)}
      />

      <Flex justify="end" mt="4">
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? <ClipLoader size={16} /> : "Create token"}
        </Button>
      </Flex>

      {status && (
        <Text size="2" color="gray" mt="2">
          {status}
        </Text>
      )}
    </Box>
  );
}
