import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Box, Button, Flex, Heading, Separator, Text, TextField, Callout } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

export function CurrencyManager() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [packageId, setPackageId] = useState(() =>
    localStorage.getItem("currency.packageId") || "",
  );
  const [moduleName, setModuleName] = useState("currency_demo");
  const [structName, setStructName] = useState("CurrCoin");
  const [treasuryCapId, setTreasuryCapId] = useState(() =>
    localStorage.getItem("currency.treasuryCapId") || "",
  );
  const [mintAmount, setMintAmount] = useState("0");
  const [burnCoinId, setBurnCoinId] = useState("");
  const [loading, setLoading] = useState<"mint" | "burn" | null>(null);
  const [status, setStatus] = useState<string>("");

  const coinType = packageId && moduleName && structName
    ? `${packageId}::${moduleName}::${structName}`
    : "";

  const ensureConnected = () => {
    if (!account) {
      setStatus("Please connect your wallet first.");
      return false;
    }
    return true;
  };

  const handleMint = () => {
    if (!ensureConnected()) return;
    if (!packageId || !treasuryCapId) {
      setStatus("Enter package ID and TreasuryCap ID to mint.");
      return;
    }
    if (!isValidSuiObjectId(packageId)) {
      setStatus("Package ID is not a valid Sui object id (0x...).");
      return;
    }
    if (!isValidSuiObjectId(treasuryCapId)) {
      setStatus("TreasuryCap ID is not a valid Sui object id (0x...).");
      return;
    }
    const amount = mintAmount.trim();
    if (!amount) {
      setStatus("Enter an amount to mint.");
      return;
    }
    let amountU64: bigint;
    try {
      amountU64 = BigInt(amount);
    } catch (e) {
      setStatus("Amount must be a valid integer.");
      return;
    }

    setLoading("mint");
    setStatus("Submitting mint transaction...");

    const tx = new Transaction();
    // Standard coin::mint call with TreasuryCap
    const [newCoin] = tx.moveCall({
      target: "0x2::coin::mint",
      arguments: [tx.object(treasuryCapId), tx.pure.u64(amountU64)],
      typeArguments: [coinType],
    });
    tx.transferObjects([newCoin], tx.pure.address(account!.address));

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (res) => {
          setStatus(`Mint submitted. Digest: ${res.digest}`);
          setLoading(null);
        },
        onError: (err) => {
          setStatus(`Mint failed: ${err.message}`);
          setLoading(null);
        },
      }
    );
  };

  const handleBurn = () => {
    if (!ensureConnected()) return;
    if (!packageId || !treasuryCapId || !burnCoinId) {
      setStatus("Enter package ID, TreasuryCap ID, and Coin ID to burn.");
      return;
    }
    if (!isValidSuiObjectId(packageId)) {
      setStatus("Package ID is not a valid Sui object id (0x...).");
      return;
    }
    if (!isValidSuiObjectId(treasuryCapId)) {
      setStatus("TreasuryCap ID is not a valid Sui object id (0x...).");
      return;
    }
    if (!isValidSuiObjectId(burnCoinId)) {
      setStatus("Coin ID to burn is not a valid Sui object id (0x...).");
      return;
    }

    setLoading("burn");
    setStatus("Submitting burn transaction...");

    const tx = new Transaction();
    // Standard coin::burn call with TreasuryCap
    tx.moveCall({
      target: "0x2::coin::burn",
      arguments: [tx.object(treasuryCapId), tx.object(burnCoinId)],
      typeArguments: [coinType],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (res) => {
          setStatus(`Burn submitted. Digest: ${res.digest}`);
          setLoading(null);
        },
        onError: (err) => {
          setStatus(`Burn failed: ${err.message}`);
          setLoading(null);
        },
      }
    );
  };

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">Currency Standard (Registry)</Heading>
        {coinType && (
          <Text size="2" color="gray">Coin type: {coinType}</Text>
        )}
      </Flex>

      <Callout.Root color="yellow" mb="3">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Currency Standard uses <code>coin_registry::new_currency</code> or <code>new_currency_with_otw</code>.
          This manager mints/burns coins with standard <code>coin::mint</code> and <code>coin::burn</code> functions.
          Registry: <code>0xc</code>. For creation, see "Create Currency" panels above.
        </Callout.Text>
      </Callout.Root>

      <Flex direction="column" gap="3">
        <TextField.Root
          placeholder="Package ID"
          value={packageId}
          onChange={(e) => {
            const v = e.target.value.trim();
            setPackageId(v);
            localStorage.setItem("currency.packageId", v);
          }}
        />
        <Flex gap="3">
          <TextField.Root
            placeholder="Module name"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value.trim())}
          />
          <TextField.Root
            placeholder="Struct name"
            value={structName}
            onChange={(e) => setStructName(e.target.value.trim())}
          />
        </Flex>

        <Separator my="2" size="4" />

        <Text weight="bold">TreasuryCap ID</Text>
        <TextField.Root
          placeholder="0x... TreasuryCap object (from creation)"
          value={treasuryCapId}
          onChange={(e) => {
            const v = e.target.value.trim();
            setTreasuryCapId(v);
            localStorage.setItem("currency.treasuryCapId", v);
          }}
        />

        <Flex gap="3" align="center">
          <TextField.Root
            placeholder="Mint amount (raw units)"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
          />
          <Button onClick={handleMint} disabled={loading === "mint"}>
            {loading === "mint" ? <ClipLoader size={16} /> : "Mint"}
          </Button>
        </Flex>

        <Flex gap="3" align="center">
          <TextField.Root
            placeholder="Coin ID to burn"
            value={burnCoinId}
            onChange={(e) => setBurnCoinId(e.target.value.trim())}
          />
          <Button color="red" onClick={handleBurn} disabled={loading === "burn"}>
            {loading === "burn" ? <ClipLoader size={16} /> : "Burn"}
          </Button>
        </Flex>

        {status && (
          <Text size="2" color="gray">{status}</Text>
        )}
      </Flex>
    </Box>
  );
}
