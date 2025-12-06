import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Box, Button, Flex, Heading, Separator, Text, TextField, Callout } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

export function CurrencyManager() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [packageId, setPackageId] = useState("");
  const [moduleName, setModuleName] = useState("currency_demo");
  const [structName, setStructName] = useState("CurrCoin");
  const [treasuryWrapperId, setTreasuryWrapperId] = useState("");
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
          setStatus(`Mint failed: ${err.message}`);
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
          Best practice: keep your TreasuryCap/MetadataCap safe; if you set supply to fixed or burn-only,
          you may lose minting ability. For OTW flows, remember to call finalize_registration after publish.
        </Callout.Text>
      </Callout.Root>

      <Flex direction="column" gap="3">
        <TextField.Root
          placeholder="Package ID"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value.trim())}
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
          onChange={(e) => setTreasuryWrapperId(e.target.value.trim())}
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
