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
  Select,
} from "@radix-ui/themes";
import { InfoCircledIcon, CopyIcon } from "@radix-ui/react-icons";

/**
 * Component for generating and managing transaction URIs for Payment Kit.
 * Enables creation of wallet-friendly payment links with standardized format.
 * 
 * URI Format: sui:<address>?amount=<u64>&coinType=<type>&nonce=<uuid>&...
 * 
 * Reference: https://docs.sui.io/standards/payment-kit
 */
export function PaymentURIGenerator() {
  // Required fields
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [nonce, setNonce] = useState("");
  
  // Coin type (with preset options)
  const [coinType, setCoinType] = useState("0x2::sui::SUI");
  const [customCoinType, setCustomCoinType] = useState("");
  
  // Optional metadata
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [message, setMessage] = useState("");
  
  // Optional registry
  const [registry, setRegistry] = useState("");
  const [useRegistry, setUseRegistry] = useState(false);
  
  const [generatedUri, setGeneratedUri] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate UUID v4
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleGenerateNonce = () => {
    setNonce(generateUUID());
  };

  const handleGenerateURI = () => {
    // Validation
    if (!receiverAddress.trim()) {
      alert("Receiver address required");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount))) {
      alert("Valid amount (u64) required");
      return;
    }

    if (!nonce.trim()) {
      alert("Nonce required (max 36 chars)");
      return;
    }

    const selectedCoinType = customCoinType.trim() || coinType;
    if (!selectedCoinType.trim()) {
      alert("Coin type required");
      return;
    }

    // Build URI
    let uri = `sui:${receiverAddress.trim()}?amount=${amount.trim()}&coinType=${encodeURIComponent(selectedCoinType)}&nonce=${nonce.trim()}`;

    // Add optional parameters
    if (label.trim()) {
      uri += `&label=${encodeURIComponent(label.trim())}`;
    }
    if (icon.trim()) {
      uri += `&icon=${encodeURIComponent(icon.trim())}`;
    }
    if (message.trim()) {
      uri += `&message=${encodeURIComponent(message.trim())}`;
    }

    // Add registry if specified
    if (useRegistry && registry.trim()) {
      uri += `&registry=${encodeURIComponent(registry.trim())}`;
    }

    setGeneratedUri(uri);
  };

  const handleCopyURI = () => {
    if (generatedUri) {
      navigator.clipboard.writeText(generatedUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <Heading size="5" mb="3">Payment URI Generator</Heading>
      <Text size="2" color="gray" mb="4">
        Generate standardized transaction URIs for Payment Kit flows. These URIs can be shared as links
        for wallets to parse and execute payments.
      </Text>

      <Separator my="3" size="4" />

      <Heading size="4" mb="2">Required Fields</Heading>

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
          Destination address for payment
        </Text>
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Amount (MISTS)
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
        <Box style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <Box style={{ flex: "1" }}>
            <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
              Nonce
            </Text>
            <TextField.Root
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
            />
            <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
              Unique identifier (UUIDv4, max 36 chars)
            </Text>
          </Box>
          <Button size="2" variant="soft" onClick={handleGenerateNonce}>
            Generate
          </Button>
        </Box>
      </Box>

      <Separator my="3" size="4" />

      <Heading size="4" mb="2">Coin Type</Heading>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Preset Coin Types
        </Text>
        <Select.Root value={customCoinType ? "custom" : coinType} onValueChange={(v) => {
          if (v === "custom") {
            setCoinType("");
          } else {
            setCoinType(v);
            setCustomCoinType("");
          }
        }}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="0x2::sui::SUI">SUI (0x2::sui::SUI)</Select.Item>
            <Select.Item value="custom">Custom Type</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>

      {(customCoinType || coinType === "") && (
        <Box mb="3">
          <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
            Custom Coin Type
          </Text>
          <TextField.Root
            placeholder="0xPACKAGE::module::CoinType"
            value={customCoinType || coinType}
            onChange={(e) => setCustomCoinType(e.target.value)}
          />
        </Box>
      )}

      <Separator my="3" size="4" />

      <Heading size="4" mb="2">Optional Metadata</Heading>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Label (Merchant/App Name)
        </Text>
        <TextField.Root
          placeholder="Coffee Shop"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Icon URL
        </Text>
        <TextField.Root
          placeholder="https://example.com/icon.png"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Message (Payment Description)
        </Text>
        <TextField.Root
          placeholder="Espresso and croissant"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Box>

      <Separator my="3" size="4" />

      <Heading size="4" mb="2">Registry Configuration</Heading>

      <Box mb="3" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <input
          type="checkbox"
          checked={useRegistry}
          onChange={(e) => setUseRegistry(e.target.checked)}
          id="useRegistry"
        />
        <label htmlFor="useRegistry">
          <Text size="2">Use Payment Registry (enable duplicate prevention)</Text>
        </label>
      </Box>

      {useRegistry && (
        <Box mb="3">
          <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
            Registry (Object ID or ASCII Name)
          </Text>
          <TextField.Root
            placeholder="0xabcdef... or default-payment-registry"
            value={registry}
            onChange={(e) => setRegistry(e.target.value)}
          />
          <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
            Omit to process as ephemeral payment (no duplicate detection)
          </Text>
        </Box>
      )}

      <Separator my="3" size="4" />

      <Button onClick={handleGenerateURI} style={{ width: "100%" }} mb="3">
        Generate URI
      </Button>

      {generatedUri && (
        <>
          <Box mb="3">
            <Text size="2" weight="bold" mb="2" style={{ display: "block" }}>
              Generated URI
            </Text>
            <Box
              style={{
                background: "var(--blue-a2)",
                border: "1px solid var(--blue-a5)",
                padding: "12px",
                borderRadius: "6px",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
                wordBreak: "break-all",
              }}
            >
              <Code style={{ flex: "1", fontSize: "11px" }}>
                {generatedUri}
              </Code>
              <Button
                size="1"
                variant="soft"
                onClick={handleCopyURI}
              >
                <CopyIcon /> {copied ? "Copied!" : "Copy"}
              </Button>
            </Box>
          </Box>

          <Box mb="3">
            <Text size="2" weight="bold" mb="2" style={{ display: "block" }}>
              QR Code Ready
            </Text>
            <Text size="1" color="gray">
              Use any QR code generator to encode this URI. Share the QR code or link with users to initiate payments.
            </Text>
          </Box>

          <Callout.Root color="green">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text size="2">
                This URI is ready to be:
              </Text>
              <div style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                <div><Text size="1">Encoded into a QR code</Text></div>
                <div><Text size="1">Shared as a link</Text></div>
                <div><Text size="1">Embedded in emails or messages</Text></div>
                <div><Text size="1">Parsed by wallets supporting Payment Kit</Text></div>
              </div>
            </Callout.Text>
          </Callout.Root>
        </>
      )}

      <Separator my="3" size="4" />

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <Text size="2">
            <strong>URI Encoding:</strong> Special characters (spaces, colons, slashes) are automatically URL-encoded.
            The registry parameter can be either an object ID (0xabc...) or an ASCII-based name (e.g., "default-payment-registry").
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Card>
  );
}
