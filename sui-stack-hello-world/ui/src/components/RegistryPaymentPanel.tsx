import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Callout,
  Heading,
  Text,
  TextField,
  Separator,
  Code,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";

/**
 * Component for processing registry-based payments via Payment Kit.
 * Registry payments include duplicate prevention and persistent receipt storage.
 * 
 * Best for:
 * - Preventing duplicate payments via composite PaymentKey
 * - Persistent payment records for auditing/compliance
 * - Managed fund accumulation in registry
 * - Multi-payment tracking
 * 
 * Reference: https://docs.sui.io/standards/payment-kit
 */
export function RegistryPaymentPanel() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [registryId, setRegistryId] = useState("");
  const [nonce, setNonce] = useState("");
  const [amount, setAmount] = useState("");
  const [coinObjectId, setCoinObjectId] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [coinType, setCoinType] = useState("0x2::sui::SUI");
  const [useOptionalReceiver, setUseOptionalReceiver] = useState(false);

  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const generateNonce = () => {
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    setNonce(uuid);
  };

  const handleProcessPayment = async () => {
    if (!currentAccount) {
      setStatus("❌ No wallet connected");
      return;
    }

    // Validation
    if (!isValidSuiObjectId(registryId)) {
      setStatus("❌ Invalid registry ID");
      return;
    }

    if (!nonce.trim()) {
      setStatus("❌ Nonce required");
      return;
    }

    if (nonce.length > 36) {
      setStatus("❌ Nonce must be max 36 characters");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount))) {
      setStatus("❌ Valid amount (u64) required");
      return;
    }

    if (!isValidSuiObjectId(coinObjectId)) {
      setStatus("❌ Invalid coin object ID");
      return;
    }

    if (useOptionalReceiver && !isValidSuiObjectId(receiverAddress)) {
      setStatus("❌ Invalid receiver address");
      return;
    }

    if (!coinType.trim()) {
      setStatus("❌ Coin type required");
      return;
    }

    throw new Error("❌ Payment Kit module not deployed at 0x2. Please deploy payment_kit package first.");
    setStatus("❌ Payment Kit no disponible: el módulo 0x2::payment_kit no existe en testnet/mainnet. Necesitas desplegar tu propio package Payment Kit o usar un package existente.");
    setIsProcessing(false);
    return;

    // TODO: Reemplazar "0x2::payment_kit" con tu packageId desplegado
    // Ejemplo: const PAYMENT_KIT_PKG = "0xTU_PACKAGE_ID_AQUI";
    /* DESHABILITADO HASTA QUE TENGAS PAYMENT KIT DESPLEGADO
    *
    * try {
      const tx = new Transaction();

      // Get Clock system object
      const clock = tx.object("0x6");

      // Full SUI type
      const suiCoinType = coinType === "0x2::sui::SUI" 
        ? "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
        : coinType;

      // Build receiver option (Some(address) or None)
      const receiverArg = useOptionalReceiver && receiverAddress.trim()
        ? tx.pure.option("address", receiverAddress.trim())
        : tx.pure.option("address", null);

      // Call process_registry_payment<T>
      const receipt = tx.moveCall({
        target: "0x2::payment_kit::process_registry_payment", // CAMBIAR A TU PACKAGE
        typeArguments: [suiCoinType],
        arguments: [
          tx.object(registryId),
          tx.pure.string(nonce.trim()),
          tx.pure.u64(BigInt(amount.trim())),
          tx.object(coinObjectId),
          receiverArg,
          clock,
        ],
      });

      // Transfer receipt to sender
      tx.transferObjects([receipt], currentAccount.address);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Registry payment processed:", result);
            setStatus(`✅ Registry payment processed! Digest: ${result.digest}`);
            setStatus(prev => prev + "\n💾 Payment record stored in registry with duplicate prevention enabled");
            
            // Save to localStorage
            localStorage.setItem("payment.registry", registryId);
            localStorage.setItem("payment.lastNonce", nonce);
          },
          onError: (error) => {
            console.error("Payment failed:", error);
            
            // Check for specific errors
            if (error.message.includes("EDuplicatePayment")) {
              setStatus(`❌ Duplicate payment detected! This nonce was already processed.`);
            } else if (error.message.includes("EPaymentAmountMismatch")) {
              setStatus(`❌ Payment amount mismatch. Coin value doesn't match expected amount.`);
            } else {
              setStatus(`❌ Failed: ${error.message}`);
            }
          },
        }
      );
    } catch (error: any) {
      console.error("Transaction build error:", error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
    *
    * FIN BLOQUE COMENTADO
    */
  };

  return (
    <Card>
      <Heading size="5" mb="3">Registry Payment</Heading>
      <Text size="2" color="gray" mb="4">
        Process payments through a PaymentRegistry with duplicate prevention and persistent records.
        Each payment is tracked by a composite key (nonce, amount, coin type, receiver).
      </Text>

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Registry ID
        </Text>
        <TextField.Root
          placeholder="0x..."
          value={registryId}
          onChange={(e) => setRegistryId(e.target.value)}
        />
        <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
          PaymentRegistry object ID for duplicate detection
        </Text>
      </Box>

      <Box mb="3">
        <Box style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <Box style={{ flex: "1" }}>
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Nonce (Unique ID)
            </Text>
            <TextField.Root
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
            />
            <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
              UUIDv4 format recommended, max 36 characters
            </Text>
          </Box>
          <Button size="2" variant="soft" onClick={generateNonce}>
            Generate
          </Button>
        </Box>
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Payment Amount (MISTS)
        </Text>
        <TextField.Root
          placeholder="1000000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
          Must match coin value exactly
        </Text>
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Coin Object ID
        </Text>
        <TextField.Root
          placeholder="0x..."
          value={coinObjectId}
          onChange={(e) => setCoinObjectId(e.target.value)}
        />
        <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
          Coin object to transfer (value must match amount)
        </Text>
      </Box>

      <Separator my="3" size="4" />

      <Box mb="3" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <input
          type="checkbox"
          checked={useOptionalReceiver}
          onChange={(e) => setUseOptionalReceiver(e.target.checked)}
          id="useReceiver"
        />
        <label htmlFor="useReceiver">
          <Text size="2">Specify receiver address (optional)</Text>
        </label>
      </Box>

      {useOptionalReceiver && (
        <Box mb="3">
          <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
            Receiver Address
          </Text>
          <TextField.Root
            placeholder="0x... (optional)"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          />
          <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
            If provided, funds transfer here; otherwise registry retains funds
          </Text>
        </Box>
      )}

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Coin Type
        </Text>
        <TextField.Root
          placeholder="0x2::sui::SUI"
          value={coinType}
          onChange={(e) => setCoinType(e.target.value)}
        />
      </Box>

      <Button
        onClick={handleProcessPayment}
        disabled={!currentAccount || isProcessing}
        style={{ width: "100%" }}
      >
        {isProcessing ? "Processing..." : "Process Registry Payment"}
      </Button>

      {status && (
        <Callout.Root mt="3" color={status.startsWith("✅") ? "green" : status.startsWith("🔄") ? "blue" : "red"}>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text style={{ whiteSpace: "pre-wrap" }}>{status}</Callout.Text>
        </Callout.Root>
      )}

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="2" style={{ display: "block" }}>
          Composite PaymentKey
        </Text>
        <Text size="1" color="gray" mb="2">
          Duplicate prevention uses this key:
        </Text>
        <Box style={{ background: "var(--gray-a2)", padding: "8px", borderRadius: "4px", fontSize: "12px" }}>
          <Text size="1" as="div"><strong>nonce:</strong> {nonce || "(will be set)"}</Text>
          <Text size="1" as="div"><strong>amount:</strong> {amount || "(will be set)"}</Text>
          <Text size="1" as="div"><strong>coin_type:</strong> {coinType}</Text>
          <Text size="1" as="div"><strong>receiver:</strong> {receiverAddress || "(optional)"}</Text>
        </Box>
      </Box>

      <Separator my="3" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <Text size="2">
            <strong>Duplicate Prevention:</strong> Attempting to process the same PaymentKey twice will fail with
            <Code>EDuplicatePayment</Code>. This composite key ensures each payment is unique and prevents accidental
            re-processing of the same transaction.
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Card>
  );
}
