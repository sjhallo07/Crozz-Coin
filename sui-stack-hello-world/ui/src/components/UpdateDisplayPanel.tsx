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
 * Component to update an existing Display<T> object.
 * Allows adding, editing, or removing display fields, then commits changes via update_version.
 * 
 * Flow:
 * 1. User provides Display object ID and type
 * 2. User adds/edits/removes fields using display::add_multiple, display::edit, display::remove
 * 3. Calls display::update_version to commit changes and emit event
 */
export function UpdateDisplayPanel() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [displayObjectId, setDisplayObjectId] = useState("");
  const [typeArgument, setTypeArgument] = useState("");
  
  // Fields to add/edit
  const [fieldsToAdd, setFieldsToAdd] = useState<DisplayField[]>([]);
  const [fieldsToEdit, setFieldsToEdit] = useState<DisplayField[]>([]);
  
  // Fields to remove (keys only)
  const [keysToRemove, setKeysToRemove] = useState<string[]>([]);

  const [status, setStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Add field to "add" list
  const handleAddFieldToAdd = () => {
    setFieldsToAdd([...fieldsToAdd, { key: "", value: "" }]);
  };

  // Add field to "edit" list
  const handleAddFieldToEdit = () => {
    setFieldsToEdit([...fieldsToEdit, { key: "", value: "" }]);
  };

  // Add key to "remove" list
  const handleAddKeyToRemove = () => {
    setKeysToRemove([...keysToRemove, ""]);
  };

  // Remove from lists
  const handleRemoveFromAdd = (index: number) => {
    setFieldsToAdd(fieldsToAdd.filter((_, i) => i !== index));
  };

  const handleRemoveFromEdit = (index: number) => {
    setFieldsToEdit(fieldsToEdit.filter((_, i) => i !== index));
  };

  const handleRemoveFromRemoveList = (index: number) => {
    setKeysToRemove(keysToRemove.filter((_, i) => i !== index));
  };

  // Update field values
  const handleFieldChange = (
    list: "add" | "edit",
    index: number,
    field: "key" | "value",
    newValue: string
  ) => {
    if (list === "add") {
      const updated = [...fieldsToAdd];
      updated[index][field] = newValue;
      setFieldsToAdd(updated);
    } else {
      const updated = [...fieldsToEdit];
      updated[index][field] = newValue;
      setFieldsToEdit(updated);
    }
  };

  const handleKeyToRemoveChange = (index: number, newValue: string) => {
    const updated = [...keysToRemove];
    updated[index] = newValue;
    setKeysToRemove(updated);
  };

  const handleUpdateDisplay = async () => {
    if (!currentAccount) {
      setStatus("❌ No wallet connected");
      return;
    }

    if (!isValidSuiObjectId(displayObjectId)) {
      setStatus("❌ Invalid Display object ID");
      return;
    }

    if (!typeArgument.trim()) {
      setStatus("❌ Type argument required");
      return;
    }

    const validAdd = fieldsToAdd.filter(f => f.key.trim() && f.value.trim());
    const validEdit = fieldsToEdit.filter(f => f.key.trim() && f.value.trim());
    const validRemove = keysToRemove.filter(k => k.trim());

    if (validAdd.length === 0 && validEdit.length === 0 && validRemove.length === 0) {
      setStatus("❌ No changes specified");
      return;
    }

    setIsUpdating(true);
    setStatus("🔄 Updating Display...");

    try {
      const tx = new Transaction();
      const displayObj = tx.object(displayObjectId);

      // Add multiple fields (if any)
      if (validAdd.length > 0) {
        tx.moveCall({
          target: "0x2::display::add_multiple",
          typeArguments: [typeArgument.trim()],
          arguments: [
            displayObj,
            tx.pure.vector("string", validAdd.map(f => f.key.trim())),
            tx.pure.vector("string", validAdd.map(f => f.value.trim())),
          ],
        });
      }

      // Edit fields individually
      for (const field of validEdit) {
        tx.moveCall({
          target: "0x2::display::edit",
          typeArguments: [typeArgument.trim()],
          arguments: [
            displayObj,
            tx.pure.string(field.key.trim()),
            tx.pure.string(field.value.trim()),
          ],
        });
      }

      // Remove fields individually
      for (const key of validRemove) {
        tx.moveCall({
          target: "0x2::display::remove",
          typeArguments: [typeArgument.trim()],
          arguments: [
            displayObj,
            tx.pure.string(key.trim()),
          ],
        });
      }

      // Commit changes via update_version
      tx.moveCall({
        target: "0x2::display::update_version",
        typeArguments: [typeArgument.trim()],
        arguments: [displayObj],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Display updated:", result);
            setStatus(`✅ Display updated successfully! Digest: ${result.digest}`);
            
            // Clear lists after success
            setFieldsToAdd([]);
            setFieldsToEdit([]);
            setKeysToRemove([]);
          },
          onError: (error) => {
            console.error("Display update failed:", error);
            setStatus(`❌ Failed: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Transaction build error:", error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <Heading size="5" mb="3">Update Display Object</Heading>
      <Text size="2" color="gray" mb="4">
        Modify an existing Display&lt;T&gt; object by adding, editing, or removing fields.
        Must own the Display object.
      </Text>

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Display Object ID
        </Text>
        <TextField.Root
          placeholder="0x..."
          value={displayObjectId}
          onChange={(e) => setDisplayObjectId(e.target.value)}
        />
      </Box>

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Type Argument
        </Text>
        <TextField.Root
          placeholder="0x123::module::Type"
          value={typeArgument}
          onChange={(e) => setTypeArgument(e.target.value)}
        />
      </Box>

      <Separator my="3" size="4" />

      {/* Add Fields Section */}
      <Box mb="3">
        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <Text size="2" weight="bold" color="green">Add New Fields</Text>
          <Button size="1" variant="soft" color="green" onClick={handleAddFieldToAdd}>
            <PlusIcon /> Add
          </Button>
        </Box>

        {fieldsToAdd.map((field, index) => (
          <Box key={index} mb="2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <TextField.Root
              placeholder="key"
              value={field.key}
              onChange={(e) => handleFieldChange("add", index, "key", e.target.value)}
              style={{ flex: "0 0 30%" }}
            />
            <TextField.Root
              placeholder="value"
              value={field.value}
              onChange={(e) => handleFieldChange("add", index, "value", e.target.value)}
              style={{ flex: "1" }}
            />
            <Button size="1" color="red" variant="soft" onClick={() => handleRemoveFromAdd(index)}>
              <TrashIcon />
            </Button>
          </Box>
        ))}
      </Box>

      <Separator my="3" size="4" />

      {/* Edit Fields Section */}
      <Box mb="3">
        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <Text size="2" weight="bold" color="blue">Edit Existing Fields</Text>
          <Button size="1" variant="soft" color="blue" onClick={handleAddFieldToEdit}>
            <PlusIcon /> Edit
          </Button>
        </Box>

        {fieldsToEdit.map((field, index) => (
          <Box key={index} mb="2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <TextField.Root
              placeholder="key"
              value={field.key}
              onChange={(e) => handleFieldChange("edit", index, "key", e.target.value)}
              style={{ flex: "0 0 30%" }}
            />
            <TextField.Root
              placeholder="new value"
              value={field.value}
              onChange={(e) => handleFieldChange("edit", index, "value", e.target.value)}
              style={{ flex: "1" }}
            />
            <Button size="1" color="red" variant="soft" onClick={() => handleRemoveFromEdit(index)}>
              <TrashIcon />
            </Button>
          </Box>
        ))}
      </Box>

      <Separator my="3" size="4" />

      {/* Remove Fields Section */}
      <Box mb="3">
        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <Text size="2" weight="bold" color="red">Remove Fields</Text>
          <Button size="1" variant="soft" color="red" onClick={handleAddKeyToRemove}>
            <PlusIcon /> Remove
          </Button>
        </Box>

        {keysToRemove.map((key, index) => (
          <Box key={index} mb="2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <TextField.Root
              placeholder="key to remove"
              value={key}
              onChange={(e) => handleKeyToRemoveChange(index, e.target.value)}
              style={{ flex: "1" }}
            />
            <Button size="1" color="red" variant="soft" onClick={() => handleRemoveFromRemoveList(index)}>
              <TrashIcon />
            </Button>
          </Box>
        ))}
      </Box>

      <Button
        onClick={handleUpdateDisplay}
        disabled={!currentAccount || isUpdating}
        style={{ width: "100%" }}
      >
        {isUpdating ? "Updating..." : "Update Display"}
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
            All changes are batched in a single transaction and committed via <Code>update_version</Code>.
            Fullnodes will apply the updated Display template after the event is emitted.
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Card>
  );
}
