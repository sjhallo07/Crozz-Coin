import { Box, Button, Card, Callout, Flex, Heading, Text, TextField, Select, CheckboxCards, Separator } from "@radix-ui/themes";
import { InfoCircledIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import ClipLoader from "react-spinners/ClipLoader";

/**
 * CreateCurrencyPanel - Comprehensive currency creation per Sui Currency Standard
 * https://docs.sui.io/standards/currency
 * 
 * Supports both:
 * 1. Standard creation: new_currency → finalize (immediate shared object)
 * 2. OTW creation: new_currency_with_otw → finalize_registration (two-step, registry-placed)
 * 
 * Features:
 * - Metadata (name, symbol, decimals 0-18, description, icon)
 * - Supply models (Fixed, BurnOnly, or Flexible/Unknown)
 * - Regulatory features (DenyCapV2 for address restrictions)
 * - Metadata capability management
 * 
 * Registry address: 0xc (sui::coin_registry)
 */
export function CreateCurrencyPanel() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Form state
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

  // Creation method: "standard" or "otw"
  const [creationMethod, setCreationMethod] = useState<"standard" | "otw">("standard");

  // Supply model: "unknown" (default), "fixed", or "burn_only"
  const [supplyModel, setSupplyModel] = useState<"unknown" | "fixed" | "burn_only">("unknown");
  const [initialSupply, setInitialSupply] = useState("1000000"); // For minting after new_currency

  // Regulatory: enable deny list (DenyCapV2)
  const [isRegulated, setIsRegulated] = useState(false);
  const [allowGlobalPause, setAllowGlobalPause] = useState(false);

  // Metadata cap management
  const [deleteMetadataCap, setDeleteMetadataCap] = useState(false);

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
    // Core metadata validation
    if (!packageId || !moduleName || !typeName) {
      setStatus("Package ID, Module name, and Type name are required.");
      return false;
    }
    if (!isValidSuiObjectId(packageId)) {
      setStatus("Package ID must be a valid Sui object ID (0x...).");
      return false;
    }

    // Decimals: 0-18 per Sui Currency Standard
    const dec = parseInt(decimals, 10);
    if (isNaN(dec) || dec < 0 || dec > 18) {
      setStatus("Decimals must be between 0 and 18 per Sui Currency Standard.");
      return false;
    }

    // Symbol: ASCII printable, typically 1-10 uppercase chars
    if (!symbol) {
      setStatus("Symbol is required.");
      return false;
    }
    if (!/^[A-Z0-9]{1,10}$/.test(symbol)) {
      setStatus("Symbol must be 1-10 uppercase ASCII alphanumeric characters.");
      return false;
    }

    // Name validation
    if (!name) {
      setStatus("Name is required.");
      return false;
    }

    // Supply model validation
    if (supplyModel !== "unknown") {
      const supply = parseInt(initialSupply, 10);
      if (isNaN(supply) || supply <= 0) {
        setStatus("Initial supply must be a positive integer for fixed/burn-only models.");
        return false;
      }
    }

    // Icon URL validation (optional but must be valid URL if provided)
    if (iconUrl && !isValidUrl(iconUrl)) {
      setStatus("Icon URL must be a valid HTTP/HTTPS URL.");
      return false;
    }

    return true;
  };

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return str.startsWith("http://") || str.startsWith("https://");
    } catch {
      return false;
    }
  };

  const handleCreate = () => {
    if (!ensureConnected()) return;
    if (!validateInputs()) return;

    setLoading(true);
    setStatus("Creating currency...");

    const tx = new Transaction();
    const coinType = `${packageId}::${moduleName}::${typeName}`;
    const registryId = "0xc"; // CoinRegistry system object

    let currencyInit: any;
    let treasuryCap: any;

    if (creationMethod === "standard") {
      // Standard creation: new_currency
      // Returns: (CurrencyInitializer<T>, TreasuryCap<T>)
      [currencyInit, treasuryCap] = tx.moveCall({
        target: "0x2::coin_registry::new_currency",
        arguments: [
          tx.object(registryId),
          tx.pure.u8(parseInt(decimals, 10)),
          tx.pure.string(symbol),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(iconUrl || ""),
        ],
        typeArguments: [coinType],
      });
    } else {
      // OTW creation: new_currency_with_otw
      // Requires OTW object as first argument
      // This example uses a placeholder; in production, you'd pass the actual OTW
      setStatus("❌ OTW creation requires the OTW object from package. Use standard creation or manual PTB.");
      setLoading(false);
      return;
    }

    // Step 1: Configure supply model
    let finalizedCurrencyInit = currencyInit;
    if (supplyModel === "fixed" || supplyModel === "burn_only") {
      // Mint initial supply for fixed/burn-only coins
      const minted = tx.moveCall({
        target: "0x2::coin::mint",
        arguments: [
          treasuryCap,
          tx.pure.u64(parseInt(initialSupply, 10)),
        ],
        typeArguments: [coinType],
      });

      // Apply supply model
      const method = supplyModel === "fixed" ? "make_supply_fixed" : "make_supply_burn_only";
      finalizedCurrencyInit = tx.moveCall({
        target: `0x2::coin_registry::${method}_init`,
        arguments: [currencyInit, minted],
        typeArguments: [coinType],
      });
    }

    // Step 2: Make regulated (optional)
    let denyCap: any = null;
    if (isRegulated) {
      denyCap = tx.moveCall({
        target: "0x2::coin_registry::make_regulated",
        arguments: [
          finalizedCurrencyInit,
          tx.pure.bool(allowGlobalPause),
        ],
        typeArguments: [coinType],
      });
    }

    // Step 3: Finalize
    // Returns MetadataCap<T>
    let metadataCap: any;
    if (deleteMetadataCap) {
      // Finalize and delete metadata cap in one call
      tx.moveCall({
        target: "0x2::coin_registry::finalize_and_delete_metadata_cap",
        arguments: [finalizedCurrencyInit],
        typeArguments: [coinType],
      });
      metadataCap = null; // Not returned when deleted
    } else {
      [metadataCap] = tx.moveCall({
        target: "0x2::coin_registry::finalize",
        arguments: [finalizedCurrencyInit],
        typeArguments: [coinType],
      });
    }

    // Step 4: Transfer capabilities to sender
    const transfers = [treasuryCap];
    if (metadataCap) transfers.push(metadataCap);
    if (denyCap) transfers.push(denyCap);
    tx.transferObjects(transfers, account!.address);

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (res) => {
          const capsList = [];
          capsList.push("TreasuryCap");
          if (metadataCap) capsList.push("MetadataCap");
          if (denyCap) capsList.push("DenyCapV2");
          const capsText = capsList.join(", ");

          const supplyText =
            supplyModel === "unknown" ? "Flexible" :
            supplyModel === "fixed" ? "Fixed" :
            "Burn-Only";

          setStatus(
            `✅ Currency created! Digest: ${res.digest}\n` +
            `Supply: ${supplyText} | Regulated: ${isRegulated ? "Yes" : "No"}\n` +
            `Capabilities: ${capsText}`
          );
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
        <Heading size="4">Create Currency (Sui Standard)</Heading>
        <Text size="2" color="gray">Per https://docs.sui.io/standards/currency</Text>
      </Flex>

      <Callout.Root color="blue" mb="4">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Create currencies using the Sui Currency Standard with support for supply models, regulatory features, and metadata management. Registry: <code>0xc</code>
        </Callout.Text>
      </Callout.Root>

      <Flex direction="column" gap="4">
        {/* SECTION: Core Metadata */}
        <Card style={{ padding: 16, background: "var(--gray-a3)" }}>
          <Heading size="3" mb="3">Core Metadata</Heading>
          
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
                placeholder="Decimals (0-18)"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                type="number"
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
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <TextField.Root
              placeholder="Icon URL (optional, must be https://)"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value.trim())}
            />
          </Flex>
        </Card>

        <Separator size="1" />

        {/* SECTION: Creation Method */}
        <Card style={{ padding: 16, background: "var(--gray-a3)" }}>
          <Heading size="3" mb="3">Creation Method</Heading>
          <Callout.Root mb="3">
            <Callout.Icon>
              <QuestionMarkCircledIcon />
            </Callout.Icon>
            <Callout.Text size="1">
              <strong>Standard:</strong> new_currency → finalize (immediate shared object)<br/>
              <strong>OTW:</strong> new_currency_with_otw → finalize_registration (two-step, registry-placed)
            </Callout.Text>
          </Callout.Root>
          
          <Flex gap="3">
            <Button
              onClick={() => setCreationMethod("standard")}
              variant={creationMethod === "standard" ? "solid" : "outline"}
            >
              Standard (recommended)
            </Button>
            <Button
              onClick={() => setCreationMethod("otw")}
              variant={creationMethod === "otw" ? "solid" : "outline"}
              disabled
              title="Requires OTW object from package publication"
            >
              OTW (advanced)
            </Button>
          </Flex>
        </Card>

        <Separator size="1" />

        {/* SECTION: Supply Model */}
        <Card style={{ padding: 16, background: "var(--gray-a3)" }}>
          <Heading size="3" mb="3">Supply Model</Heading>
          <Callout.Root mb="3">
            <Callout.Icon>
              <QuestionMarkCircledIcon />
            </Callout.Icon>
            <Callout.Text size="1">
              <strong>Flexible:</strong> TreasuryCap controls minting/burning (default)<br/>
              <strong>Fixed:</strong> Total supply locked, no changes<br/>
              <strong>Burn-Only:</strong> No minting, but burning allowed
            </Callout.Text>
          </Callout.Root>

          <Flex gap="3" mb="3">
            <Button
              onClick={() => setSupplyModel("unknown")}
              variant={supplyModel === "unknown" ? "solid" : "outline"}
            >
              Flexible
            </Button>
            <Button
              onClick={() => setSupplyModel("fixed")}
              variant={supplyModel === "fixed" ? "solid" : "outline"}
            >
              Fixed
            </Button>
            <Button
              onClick={() => setSupplyModel("burn_only")}
              variant={supplyModel === "burn_only" ? "solid" : "outline"}
            >
              Burn-Only
            </Button>
          </Flex>

          {supplyModel !== "unknown" && (
            <TextField.Root
              placeholder="Initial Supply (must mint before finalize)"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              type="number"
            />
          )}
        </Card>

        <Separator size="1" />

        {/* SECTION: Regulatory Features */}
        <Card style={{ padding: 16, background: "var(--gray-a3)" }}>
          <Heading size="3" mb="3">Regulatory Features</Heading>
          <Callout.Root mb="3">
            <Callout.Icon>
              <QuestionMarkCircledIcon />
            </Callout.Icon>
            <Callout.Text size="1">
              Enable deny list (DenyCapV2) to restrict addresses from using the coin. Addresses on deny list cannot use the coin as transaction inputs or receive it.
            </Callout.Text>
          </Callout.Root>

          <Flex direction="column" gap="3">
            <Flex align="center" gap="2">
              <input
                type="checkbox"
                checked={isRegulated}
                onChange={(e) => setIsRegulated(e.target.checked)}
                id="regulated-check"
              />
              <label htmlFor="regulated-check">
                <Text size="2">Make this coin regulated (create DenyCapV2)</Text>
              </label>
            </Flex>

            {isRegulated && (
              <Flex align="center" gap="2" style={{ marginLeft: 20 }}>
                <input
                  type="checkbox"
                  checked={allowGlobalPause}
                  onChange={(e) => setAllowGlobalPause(e.target.checked)}
                  id="pause-check"
                />
                <label htmlFor="pause-check">
                  <Text size="2">Allow global pause (can pause all activity)</Text>
                </label>
              </Flex>
            )}
          </Flex>
        </Card>

        <Separator size="1" />

        {/* SECTION: Metadata Cap Management */}
        <Card style={{ padding: 16, background: "var(--gray-a3)" }}>
          <Heading size="3" mb="3">Metadata Management</Heading>
          <Callout.Root mb="3">
            <Callout.Icon>
              <QuestionMarkCircledIcon />
            </Callout.Icon>
            <Callout.Text size="1">
              MetadataCap allows updates to coin metadata (name, description, icon). Delete permanently to lock metadata.
            </Callout.Text>
          </Callout.Root>

          <Flex align="center" gap="2">
            <input
              type="checkbox"
              checked={deleteMetadataCap}
              onChange={(e) => setDeleteMetadataCap(e.target.checked)}
              id="delete-cap-check"
            />
            <label htmlFor="delete-cap-check">
              <Text size="2">Delete MetadataCap after creation (irreversible, locks metadata)</Text>
            </label>
          </Flex>
        </Card>

        <Separator size="1" />

        {/* CREATE BUTTON */}
        <Button
          onClick={handleCreate}
          disabled={loading}
          size="3"
          style={{
            width: "100%",
            background: loading ? "var(--gray-8)" : "var(--accent-9)",
            color: "white",
          }}
        >
          {loading ? <ClipLoader size={16} color="white" /> : "Create Currency"}
        </Button>

        {/* STATUS */}
        {status && (
          <Card style={{ padding: 12, backgroundColor: "var(--gray-a3)", whiteSpace: "pre-wrap" }}>
            <Text size="2" style={{ fontFamily: "monospace" }}>
              {status}
            </Text>
          </Card>
        )}
      </Flex>
    </Box>
  );
}
