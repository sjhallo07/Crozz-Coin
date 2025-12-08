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
 * Component for processing ephemeral payments via Payment Kit.
 * Ephemeral payments are one-time transfers without duplicate prevention or persistent storage.
 * 
 * Best for:
 * - One-off transfers with external tracking
 * - Lower gas costs than registry payments
 * - No need for duplicate prevention
 * 
 * Reference: https://docs.sui.io/standards/payment-kit
 */
export function EphemeralPaymentPanel() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [nonce, setNonce] = useState("");
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [coinType, setCoinType] = useState("0x2::sui::SUI");
  
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

    if (!isValidSuiObjectId(receiverAddress)) {
      setStatus("❌ Invalid receiver address");
      return;
    }

    if (!coinType.trim()) {
      setStatus("❌ Coin type required");
      return;
    }

    setIsProcessing(true);
    setStatus("🔄 Processing ephemeral payment...");

    try {
      const tx = new Transaction();

      // Get Clock system object
      const clock = tx.object("0x6");

      // For SUI transfers, use specific coin type
      const suiCoinType = coinType === "0x2::sui::SUI" 
        ? "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
        : coinType;

      // Call process_ephemeral_payment<T>
      const receipt = tx.moveCall({
        target: "0x2::payment_kit::process_ephemeral_payment",
        typeArguments: [suiCoinType],
        arguments: [
          tx.pure.string(nonce.trim()),
          tx.pure.u64(BigInt(amount.trim())),
          tx.object(currentAccount.address), // Coin to transfer (would be actual coin in real scenario)
          tx.pure.address(receiverAddress.trim()),
          clock,
        ],
      });

      // Transfer receipt to sender for tracking
      tx.transferObjects([receipt], currentAccount.address);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Payment processed:", result);
            setStatus(`✅ Ephemeral payment processed! Digest: ${result.digest}`);
            
            // Save to localStorage
            localStorage.setItem("payment.lastNonce", nonce);
            localStorage.setItem("payment.lastReceiver", receiverAddress);
          },
          onError: (error) => {
            console.error("Payment failed:", error);
            setStatus(`❌ Failed: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Transaction build error:", error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <Heading size="5" mb="3">Ephemeral Payment</Heading>
      <Text size="2" color="gray" mb="4">
        Process one-time payments without duplicate prevention or persistent storage.
        Ephemeral payments have lower gas costs and are ideal for external payment tracking systems.
      </Text>

      <Separator my="3" size="4" />

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
          Native coin units (e.g., 1000000000 = 1 SUI)
        </Text>
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Receiver Address
        </Text>
        <TextField.Root
          placeholder="0x..."
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
        />
        <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
          Destination for payment funds
        </Text>
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Coin Type
        </Text>
        <TextField.Root
          placeholder="0x2::sui::SUI"
          value={coinType}
          onChange={(e) => setCoinType(e.target.value)}
        />
        <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
          Full type path (default: SUI)
        </Text>
      </Box>

      <Separator my="3" size="4" />

      <Button
        onClick={handleProcessPayment}
        disabled={!currentAccount || isProcessing}
        style={{ width: "100%" }}
      >
        {isProcessing ? "Processing..." : "Process Ephemeral Payment"}
      </Button>

      {status && (
        <Callout.Root mt="3" color={status.startsWith("✅") ? "green" : status.startsWith("🔄") ? "blue" : "red"}>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{status}</Callout.Text>
        </Callout.Root>
      )}

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="2" style={{ display: "block" }}>
          Key Characteristics
        </Text>
        <Box asChild>
          <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
            <li><Text size="1">✓ No duplicate detection enforced</Text></li>
            <li><Text size="1">✓ No persistent payment records (lower storage cost)</Text></li>
            <li><Text size="1">✓ Funds transfer immediately to receiver</Text></li>
            <li><Text size="1">✓ PaymentReceipt returned for tracking</Text></li>
            <li><Text size="1">✓ Events emitted for off-chain monitoring</Text></li>
            <li><Text size="1">✓ Lower gas costs than registry payments</Text></li>
          </ul>
        </Box>
      </Box>

      <Separator my="3" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <Text size="2">
            <strong>Use ephemeral payments for:</strong> Streaming payments, tips, one-time transactions,
            or when your application manages payment deduplication externally. For persistent records and
            duplicate prevention, use registry-based payments instead.
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Card>
  );
}
