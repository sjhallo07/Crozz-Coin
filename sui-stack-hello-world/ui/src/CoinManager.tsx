import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Box, Button, Flex, Heading, Separator, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

export function CoinManager() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [packageId, setPackageId] = useState(() =>
    localStorage.getItem("coin.packageId") || "",
  );
  const [moduleName, setModuleName] = useState("coin_standard_demo");
  const [structName, setStructName] = useState("DemoCoin");
  const [treasuryWrapperId, setTreasuryWrapperId] = useState(() =>
    localStorage.getItem("coin.treasuryWrapperId") || "",
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
    if (!packageId || !treasuryWrapperId) {
      setStatus("Enter package ID and TreasuryWrapper ID to mint.");
      return;
    }
    if (!isValidSuiObjectId(packageId)) {
      setStatus("Package ID is not a valid Sui object id (0x...).");
      return;
    }
    if (!isValidSuiObjectId(treasuryWrapperId)) {
      setStatus("TreasuryWrapper ID is not a valid Sui object id (0x...).");
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
    const [newCoin] = tx.moveCall({
      target: `${packageId}::${moduleName}::mint`,
      arguments: [tx.object(treasuryWrapperId), tx.pure.u64(amountU64)],
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
          const msg = err?.message ?? String(err);
          const hint = msg.includes("TypeNotFound") || msg.includes("TypeArgumentError")
            ? "Revisa packageId, module y struct: deben apuntar al paquete publicado en esta red y la función mint debe existir. Verifica también TreasuryWrapper del mismo paquete."
            : "";
          setStatus(`Mint failed: ${msg}${hint ? " — " + hint : ""}`);
          setLoading(null);
        },
      }
    );
  };

  const handleBurn = () => {
    if (!ensureConnected()) return;
    if (!packageId || !treasuryWrapperId || !burnCoinId) {
      setStatus("Enter package ID, TreasuryWrapper ID, and Coin ID to burn.");
      return;
    }
    if (!isValidSuiObjectId(packageId)) {
      setStatus("Package ID is not a valid Sui object id (0x...).");
      return;
    }
    if (!isValidSuiObjectId(treasuryWrapperId)) {
      setStatus("TreasuryWrapper ID is not a valid Sui object id (0x...).");
      return;
    }
    if (!isValidSuiObjectId(burnCoinId)) {
      setStatus("Coin ID to burn is not a valid Sui object id (0x...).");
      return;
    }

    setLoading("burn");
    setStatus("Submitting burn transaction...");

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${moduleName}::burn`,
      arguments: [tx.object(treasuryWrapperId), tx.object(burnCoinId)],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (res) => {
          setStatus(`Burn submitted. Digest: ${res.digest}`);
          setLoading(null);
        },
        onError: (err) => {
          const msg = err?.message ?? String(err);
          const hint = msg.includes("TypeNotFound") || msg.includes("TypeArgumentError")
            ? "Revisa packageId, module y struct: deben existir en esta red, y Coin ID/TreasuryWrapper deben pertenecer a ese paquete."
            : "";
          setStatus(`Burn failed: ${msg}${hint ? " — " + hint : ""}`);
          setLoading(null);
        },
      }
    );
  };

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">Coin Standard (Mint / Burn)</Heading>
        {coinType && (
          <Text size="2" color="gray">Coin type: {coinType}</Text>
        )}
      </Flex>

      <Flex direction="column" gap="3">
        <TextField.Root
          placeholder="Package ID"
          value={packageId}
          onChange={(e) => {
            const v = e.target.value.trim();
            setPackageId(v);
            localStorage.setItem("coin.packageId", v);
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

        <Text weight="bold">TreasuryWrapper ID</Text>
        <TextField.Root
          placeholder="0x... TreasuryWrapper object"
          value={treasuryWrapperId}
          onChange={(e) => {
            const v = e.target.value.trim();
            setTreasuryWrapperId(v);
            localStorage.setItem("coin.treasuryWrapperId", v);
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
