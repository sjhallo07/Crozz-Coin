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
import { InfoCircledIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";

interface DisplayField {
  key: string;
  value: string;
}

/**
 * Component to create a Display<T> object for a published type.
 * Requires a Publisher object owned by the package publisher.
 * 
 * Flow:
 * 1. User provides Publisher object ID and type (e.g., 0x123::module::Type)
 * 2. User adds key-value pairs for display fields (name, description, image_url, etc.)
 * 3. Calls display::new_with_fields<T> to create Display
 * 4. Calls display::update_version to commit and emit event
 * 5. Transfers Display to sender (or optionally shares/freezes)
 */
export function CreateDisplayPanel() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Publisher and Type inputs
  const [publisherObjectId, setPublisherObjectId] = useState("");
  const [typeArgument, setTypeArgument] = useState("");
  
  // Display fields (key-value pairs)
  const [displayFields, setDisplayFields] = useState<DisplayField[]>([
    { key: "name", value: "{name}" },
    { key: "description", value: "" },
    { key: "image_url", value: "" },
  ]);

  const [status, setStatus] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  // Add new field
  const handleAddField = () => {
    setDisplayFields([...displayFields, { key: "", value: "" }]);
  };

  // Remove field
  const handleRemoveField = (index: number) => {
    setDisplayFields(displayFields.filter((_, i) => i !== index));
  };

  // Update field
  const handleFieldChange = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...displayFields];
    updated[index][field] = newValue;
    setDisplayFields(updated);
  };

  const handleCreateDisplay = async () => {
    if (!currentAccount) {
      setStatus("❌ No wallet connected");
      return;
    }

    // Validation
    if (!isValidSuiObjectId(publisherObjectId)) {
      setStatus("❌ Invalid Publisher object ID");
      return;
    }

    if (!typeArgument.trim()) {
      setStatus("❌ Type argument required (e.g., 0x123::module::Type)");
      return;
    }

    const validFields = displayFields.filter(f => f.key.trim() && f.value.trim());
    if (validFields.length === 0) {
      setStatus("❌ At least one display field required");
      return;
    }

    setIsCreating(true);
    setStatus("🔄 Creating Display object...");

    try {
      const tx = new Transaction();

      // Extract keys and values as separate vectors
      const keys = validFields.map(f => f.key.trim());
      const values = validFields.map(f => f.value.trim());

      // 1. Create Display<T> with display::new_with_fields
      const [display] = tx.moveCall({
        target: "0x2::display::new_with_fields",
        typeArguments: [typeArgument.trim()],
        arguments: [
          tx.object(publisherObjectId),
          tx.pure.vector("string", keys),
          tx.pure.vector("string", values),
        ],
      });

      // 2. Update version to commit changes (emits event for fullnodes)
      tx.moveCall({
        target: "0x2::display::update_version",
        typeArguments: [typeArgument.trim()],
        arguments: [display],
      });

      // 3. Transfer Display object to sender
      tx.transferObjects([display], currentAccount.address);

      // Execute transaction
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Display created:", result);
            setStatus(`✅ Display created successfully! Digest: ${result.digest}`);
            
            // Save to localStorage for reference
            localStorage.setItem("display.lastPublisher", publisherObjectId);
            localStorage.setItem("display.lastType", typeArgument);
          },
          onError: (error) => {
            console.error("Display creation failed:", error);
            setStatus(`❌ Failed: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Transaction build error:", error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <Heading size="5" mb="3">Create Display Object</Heading>
      <Text size="2" color="gray" mb="4">
        Create a Display&lt;T&gt; object to define on-chain metadata templates for your type.
        Requires a Publisher object owned by the package.
      </Text>

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Publisher Object ID
        </Text>
        <TextField.Root
          placeholder="0x..."
          value={publisherObjectId}
          onChange={(e) => setPublisherObjectId(e.target.value)}
        />
        <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
          The Publisher object from package::claim(otw, ctx)
        </Text>
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Type Argument
        </Text>
        <TextField.Root
          placeholder="0x123::my_module::MyType"
          value={typeArgument}
          onChange={(e) => setTypeArgument(e.target.value)}
        />
        <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
          Full type path (e.g., 0xPACKAGE::module::Type)
        </Text>
      </Box>

      <Separator my="3" size="4" />

      <Box mb="3">
        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <Text size="2" weight="bold">Display Fields</Text>
          <Button size="1" variant="soft" onClick={handleAddField}>
            <PlusIcon /> Add Field
          </Button>
        </Box>

        {displayFields.map((field, index) => (
          <Box key={index} mb="2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <TextField.Root
              placeholder="key (e.g., name)"
              value={field.key}
              onChange={(e) => handleFieldChange(index, "key", e.target.value)}
              style={{ flex: "0 0 30%" }}
            />
            <TextField.Root
              placeholder="value (e.g., {name} or static text)"
              value={field.value}
              onChange={(e) => handleFieldChange(index, "value", e.target.value)}
              style={{ flex: "1" }}
            />
            <Button
              size="1"
              color="red"
              variant="soft"
              onClick={() => handleRemoveField(index)}
              disabled={displayFields.length === 1}
            >
              <TrashIcon />
            </Button>
          </Box>
        ))}

        <Text size="1" color="gray" mt="2" style={{ display: "block" }}>
          Use <Code>{`{property}`}</Code> syntax to template object fields. Example: <Code>{`{name}`}</Code>, <Code>{`{id}`}</Code>
        </Text>
      </Box>

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="2" style={{ display: "block" }}>
          Recommended Fields
        </Text>
        <Box asChild>
          <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
            <li><Text size="1"><Code>name</Code>: Object name (e.g., <Code>{`{name}`}</Code>)</Text></li>
            <li><Text size="1"><Code>description</Code>: Object description</Text></li>
            <li><Text size="1"><Code>image_url</Code>: Full image URL (e.g., <Code>{`https://example.com/{id}.png`}</Code>)</Text></li>
            <li><Text size="1"><Code>thumbnail_url</Code>: Smaller preview image</Text></li>
            <li><Text size="1"><Code>link</Code>: Application URL (e.g., <Code>{`https://app.com/item/{id}`}</Code>)</Text></li>
            <li><Text size="1"><Code>project_url</Code>: Project website</Text></li>
            <li><Text size="1"><Code>creator</Code>: Creator name or address</Text></li>
          </ul>
        </Box>
      </Box>

      <Button
        onClick={handleCreateDisplay}
        disabled={!currentAccount || isCreating}
        style={{ width: "100%" }}
      >
        {isCreating ? "Creating..." : "Create Display"}
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

      <Callout.Root color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <Text size="2">
            <strong>After creation:</strong> Fullnodes will process objects of type T with this Display template.
            Query objects with <Code>showDisplay: true</Code> (GraphQL) or <Code>showDisplay</Code> option (JSON-RPC)
            to retrieve rendered metadata.
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Card>
  );
}
