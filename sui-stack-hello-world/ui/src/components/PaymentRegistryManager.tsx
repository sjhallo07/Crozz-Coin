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
 * Component for managing Payment Kit registries.
 * Create registries, configure expiration, manage funds, and clean up expired records.
 * 
 * Registry management includes:
 * - Creating new PaymentRegistry objects
 * - Configuring epoch expiration duration for records
 * - Managing registry-controlled fund accumulation
 * - Withdrawing accumulated funds
 * - Deleting expired payment records
 * 
 * Reference: https://docs.sui.io/standards/payment-kit
 */
export function PaymentRegistryManager() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Create registry state
  const [createMode, setCreateMode] = useState<"create" | "configure" | "withdraw" | "delete">("create");
  
  // Create registry
  const [registryName, setRegistryName] = useState("");
  const [namespaceId, setNamespaceId] = useState("");
  
  // Configure registry
  const [registryIdForConfig, setRegistryIdForConfig] = useState("");
  const [adminCapId, setAdminCapId] = useState("");
  const [expirationDuration, setExpirationDuration] = useState("");
  const [registryManageFunds, setRegistryManageFunds] = useState(false);
  
  // Withdraw funds
  const [registryIdForWithdraw, setRegistryIdForWithdraw] = useState("");
  const [adminCapIdForWithdraw, setAdminCapIdForWithdraw] = useState("");
  const [coinTypeForWithdraw, setCoinTypeForWithdraw] = useState("0x2::sui::SUI");
  
  // Delete payment record
  const [registryIdForDelete, setRegistryIdForDelete] = useState("");
  const [nonceForDelete, setNonceForDelete] = useState("");
  const [amountForDelete, setAmountForDelete] = useState("");
  const [receiverForDelete, setReceiverForDelete] = useState("");
  const [coinTypeForDelete, setCoinTypeForDelete] = useState("0x2::sui::SUI");

  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Namespace object addresses
  const namespaceAddresses: Record<string, string> = {
    testnet: "0xa5016862fdccba7cc576b56cc5a391eda6775200aaa03a6b3c97d512312878db",
    mainnet: "0xccd3e4c7802921991cd9ce488c4ca0b51334ba75483702744242284ccf3ae7c2",
  };

  const handleCreateRegistry = async () => {
    if (!currentAccount) {
      setStatus("❌ No wallet connected");
      return;
    }

    const account = currentAccount;

    if (!registryName.trim()) {
      setStatus("❌ Registry name required");
      return;
    }

    const namespace = namespaceId || namespaceAddresses.testnet;
    if (!isValidSuiObjectId(namespace)) {
      setStatus("❌ Invalid namespace ID");
      return;
    }

    throw new Error("❌ Payment Kit module not deployed at 0x2. Please deploy payment_kit package first.");
    setStatus("🔄 Creating payment registry...");

    try {
      const tx = new Transaction();

      const [registryObj, adminCapObj] = tx.moveCall({
        target: "0x2::payment_kit::create_registry",
        arguments: [
          tx.object(namespace),
          tx.pure.string(registryName.trim()),
        ],
      });

      // Transfer both to sender
      tx.transferObjects([registryObj, adminCapObj], account.address);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Registry created:", result);
            setStatus(`✅ Registry created successfully! Digest: ${result.digest}`);
            setStatus(prev => prev + "\n💾 Registry and RegistryAdminCap transferred to your address");
            
            localStorage.setItem("payment.registryName", registryName);
          },
          onError: (error) => {
            console.error("Registry creation failed:", error);
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

  const handleConfigureRegistry = async () => {
    if (!currentAccount) {
      setStatus("❌ No wallet connected");
      return;
    }

    if (!isValidSuiObjectId(registryIdForConfig)) {
      setStatus("❌ Invalid registry ID");
      return;
    }

    if (!isValidSuiObjectId(adminCapId)) {
      setStatus("❌ Invalid admin cap ID");
      return;
    }

    const hasExpirationChange = expirationDuration.trim();
    if (!hasExpirationChange && registryManageFunds === undefined) {
      setStatus("❌ At least one configuration change required");
      return;
    }

    setIsProcessing(true);
    setStatus("🔄 Configuring registry...");

    try {
      const tx = new Transaction();

      // Set expiration duration if provided
      if (expirationDuration.trim()) {
        tx.moveCall({
          target: "0x2::payment_kit::set_config_epoch_expiration_duration",
          arguments: [
            tx.object(registryIdForConfig),
            tx.object(adminCapId),
            tx.pure.u64(BigInt(expirationDuration.trim())),
          ],
        });
      }

      // Set registry managed funds
      tx.moveCall({
        target: "0x2::payment_kit::set_config_registry_managed_funds",
        arguments: [
          tx.object(registryIdForConfig),
          tx.object(adminCapId),
          tx.pure.bool(registryManageFunds),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Registry configured:", result);
            setStatus(`✅ Registry configured successfully! Digest: ${result.digest}`);
          },
          onError: (error) => {
            console.error("Configuration failed:", error);
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

  const handleWithdrawFunds = async () => {
    if (!currentAccount) {
      setStatus("❌ No wallet connected");
      return;
    }

    if (!isValidSuiObjectId(registryIdForWithdraw)) {
      setStatus("❌ Invalid registry ID");
      return;
    }

    if (!isValidSuiObjectId(adminCapIdForWithdraw)) {
      setStatus("❌ Invalid admin cap ID");
      return;
    }

    setIsProcessing(true);
    setStatus("🔄 Withdrawing funds from registry...");

    try {
      const tx = new Transaction();

      const suiCoinType = coinTypeForWithdraw === "0x2::sui::SUI"
        ? "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
        : coinTypeForWithdraw;

      const [coins] = tx.moveCall({
        target: "0x2::payment_kit::withdraw_from_registry",
        typeArguments: [suiCoinType],
        arguments: [
          tx.object(registryIdForWithdraw),
          tx.object(adminCapIdForWithdraw),
        ],
      });

      // Transfer coins to sender
      tx.transferObjects([coins], currentAccount.address);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Funds withdrawn:", result);
            setStatus(`✅ Funds withdrawn successfully! Digest: ${result.digest}`);
          },
          onError: (error) => {
            console.error("Withdrawal failed:", error);
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

  const handleDeleteRecord = async () => {
    if (!currentAccount) {
      setStatus("❌ No wallet connected");
      return;
    }

    if (!isValidSuiObjectId(registryIdForDelete)) {
      setStatus("❌ Invalid registry ID");
      return;
    }

    if (!nonceForDelete.trim()) {
      setStatus("❌ Nonce required");
      return;
    }

    if (!amountForDelete.trim()) {
      setStatus("❌ Amount required");
      return;
    }

    setIsProcessing(true);
    setStatus("🔄 Deleting expired payment record...");

    try {
      const tx = new Transaction();

      const suiCoinType = coinTypeForDelete === "0x2::sui::SUI"
        ? "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
        : coinTypeForDelete;

      tx.moveCall({
        target: "0x2::payment_kit::delete_payment_record",
        typeArguments: [suiCoinType],
        arguments: [
          tx.object(registryIdForDelete),
          tx.pure.string(nonceForDelete.trim()),
          tx.pure.u64(BigInt(amountForDelete.trim())),
          tx.pure.address(receiverForDelete.trim() || currentAccount.address),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Record deleted:", result);
            setStatus(`✅ Payment record deleted successfully! Digest: ${result.digest}`);
          },
          onError: (error) => {
            console.error("Deletion failed:", error);
            
            if (error.message.includes("EPaymentRecordNotExpired")) {
              setStatus(`❌ Payment record has not expired yet. Wait for the configured expiration epoch.`);
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
  };

  return (
    <Card>
      <Heading size="5" mb="3">Payment Registry Manager</Heading>
      <Text size="2" color="gray" mb="4">
        Create and manage Payment Kit registries. Configure expiration policies, manage funds,
        and clean up expired payment records.
      </Text>

      <Separator my="3" size="4" />

      <Box mb="3" style={{ display: "flex", gap: "8px" }}>
        {["create", "configure", "withdraw", "delete"].map((mode) => (
          <Button
            key={mode}
            variant={createMode === mode ? "solid" : "soft"}
            onClick={() => setCreateMode(mode as any)}
            size="2"
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
        ))}
      </Box>

      <Separator my="3" size="4" />

      {createMode === "create" && (
        <>
          <Heading size="4" mb="2">Create Registry</Heading>
          
          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Registry Name
            </Text>
            <TextField.Root
              placeholder="my-payment-registry"
              value={registryName}
              onChange={(e) => setRegistryName(e.target.value)}
            />
            <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
              ASCII-based name for registry derivation
            </Text>
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Namespace ID (Optional)
            </Text>
            <TextField.Root
              placeholder={namespaceAddresses.testnet}
              value={namespaceId}
              onChange={(e) => setNamespaceId(e.target.value)}
            />
            <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
              Testnet default: {namespaceAddresses.testnet.slice(0, 10)}...
            </Text>
          </Box>

          <Button onClick={handleCreateRegistry} disabled={isProcessing} style={{ width: "100%" }}>
            {isProcessing ? "Creating..." : "Create Registry"}
          </Button>
        </>
      )}

      {createMode === "configure" && (
        <>
          <Heading size="4" mb="2">Configure Registry</Heading>
          
          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Registry ID
            </Text>
            <TextField.Root
              placeholder="0x..."
              value={registryIdForConfig}
              onChange={(e) => setRegistryIdForConfig(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Admin Cap ID
            </Text>
            <TextField.Root
              placeholder="0x..."
              value={adminCapId}
              onChange={(e) => setAdminCapId(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Expiration Duration (Epochs)
            </Text>
            <TextField.Root
              placeholder="1000"
              value={expirationDuration}
              onChange={(e) => setExpirationDuration(e.target.value)}
            />
            <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
              Payment records expire after this many epochs
            </Text>
          </Box>

          <Box mb="3" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              checked={registryManageFunds}
              onChange={(e) => setRegistryManageFunds(e.target.checked)}
              id="manageFunds"
            />
            <label htmlFor="manageFunds">
              <Text size="2">Registry retains funds (vs immediate transfer)</Text>
            </label>
          </Box>

          <Button onClick={handleConfigureRegistry} disabled={isProcessing} style={{ width: "100%" }}>
            {isProcessing ? "Configuring..." : "Configure Registry"}
          </Button>
        </>
      )}

      {createMode === "withdraw" && (
        <>
          <Heading size="4" mb="2">Withdraw Funds</Heading>
          
          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Registry ID
            </Text>
            <TextField.Root
              placeholder="0x..."
              value={registryIdForWithdraw}
              onChange={(e) => setRegistryIdForWithdraw(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Admin Cap ID
            </Text>
            <TextField.Root
              placeholder="0x..."
              value={adminCapIdForWithdraw}
              onChange={(e) => setAdminCapIdForWithdraw(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Coin Type
            </Text>
            <TextField.Root
              placeholder="0x2::sui::SUI"
              value={coinTypeForWithdraw}
              onChange={(e) => setCoinTypeForWithdraw(e.target.value)}
            />
          </Box>

          <Button onClick={handleWithdrawFunds} disabled={isProcessing} style={{ width: "100%" }}>
            {isProcessing ? "Withdrawing..." : "Withdraw Funds"}
          </Button>
        </>
      )}

      {createMode === "delete" && (
        <>
          <Heading size="4" mb="2">Delete Payment Record</Heading>
          
          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Registry ID
            </Text>
            <TextField.Root
              placeholder="0x..."
              value={registryIdForDelete}
              onChange={(e) => setRegistryIdForDelete(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Nonce (from original payment)
            </Text>
            <TextField.Root
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              value={nonceForDelete}
              onChange={(e) => setNonceForDelete(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Amount (from original payment)
            </Text>
            <TextField.Root
              placeholder="1000000000"
              value={amountForDelete}
              onChange={(e) => setAmountForDelete(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Receiver Address (Optional)
            </Text>
            <TextField.Root
              placeholder="0x..."
              value={receiverForDelete}
              onChange={(e) => setReceiverForDelete(e.target.value)}
            />
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Coin Type
            </Text>
            <TextField.Root
              placeholder="0x2::sui::SUI"
              value={coinTypeForDelete}
              onChange={(e) => setCoinTypeForDelete(e.target.value)}
            />
          </Box>

          <Button onClick={handleDeleteRecord} disabled={isProcessing} style={{ width: "100%" }}>
            {isProcessing ? "Deleting..." : "Delete Expired Record"}
          </Button>
        </>
      )}

      {status && (
        <Callout.Root mt="3" color={status.startsWith("✅") ? "green" : status.startsWith("🔄") ? "blue" : "red"}>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text style={{ whiteSpace: "pre-wrap" }}>{status}</Callout.Text>
        </Callout.Root>
      )}

      <Separator my="3" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <Text size="2">
            <strong>Registry Lifecycle:</strong> Create → Configure expiration/fund management → Process payments → 
            Clean up expired records when no longer needed for duplicate detection.
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Card>
  );
}
