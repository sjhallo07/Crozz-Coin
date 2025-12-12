// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  TextArea,
  Dialog,
} from "@radix-ui/themes";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import { useState } from "react";
import { Plus, Copy, Trash2, ArrowRight, Lock } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useQueryAllGreetings } from "../hooks/useQueryAllGreetings";

interface AdminPanelProps {
  onAddAdmin: (address: string) => void;
  onRemoveAdmin: (address: string) => void;
  adminAddresses: string[];
}

export function AdminPanel({
  onAddAdmin,
  onRemoveAdmin,
  adminAddresses,
}: AdminPanelProps) {
  const currentAccount = useCurrentAccount();
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [createText, setCreateText] = useState("");
  const [transferId, setTransferId] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);

  const { allGreetings = [], isLoading: greetingsLoading } = useQueryAllGreetings();

  const handleCreateGreeting = () => {
    if (!createText.trim()) {
      alert("Please enter greeting text");
      return;
    }
    setLoading(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${helloWorldPackageId}::greeting::new`,
      arguments: [],
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          suiClient
            .waitForTransaction({
              digest: result.digest,
              options: { showEffects: true },
            })
            .then((txResult) => {
              const objectId = txResult.effects?.created?.[0]?.reference?.objectId;
              if (objectId) {
                setTxResult(`✓ Greeting created: ${objectId}`);
                setCreateText("");
                setTimeout(() => setTxResult(null), 5000);
              }
              setLoading(false);
            });
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const handleUpdateGreeting = (id: string, newText: string) => {
    if (!newText.trim()) {
      alert("Please enter new greeting text");
      return;
    }
    setLoading(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${helloWorldPackageId}::greeting::update_text`,
      arguments: [tx.object(id), tx.pure.string(newText)],
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setTxResult(`✓ Greeting updated`);
          setTimeout(() => setTxResult(null), 3000);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const handleTransferOwnership = () => {
    if (!transferId.trim() || !transferAddress.trim()) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${helloWorldPackageId}::greeting::transfer_ownership`,
      arguments: [
        tx.object(transferId),
        tx.pure.address(transferAddress),
      ],
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setTxResult(`✓ Ownership transferred`);
          setTransferId("");
          setTransferAddress("");
          setTimeout(() => setTxResult(null), 3000);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const handleAddAdmin = () => {
    if (!newAdminAddress.trim()) {
      alert("Please enter an address");
      return;
    }
    if (adminAddresses.includes(newAdminAddress)) {
      alert("This address is already an admin");
      return;
    }
    onAddAdmin(newAdminAddress);
    setNewAdminAddress("");
    setShowAddAdminDialog(false);
    setTxResult("✓ Admin added successfully");
    setTimeout(() => setTxResult(null), 3000);
  };

  return (
    <Box>
      <Flex direction="column" gap="4">
        {/* Status Bar */}
        {txResult && (
          <Card
            style={{
              backgroundColor: "var(--green-a2)",
              borderLeft: "4px solid var(--green-9)",
            }}
          >
            <Text size="2" color="green">
              {txResult}
            </Text>
          </Card>
        )}

        {/* Create New Greeting */}
        <Card>
          <Flex direction="column" gap="3">
            <Box>
              <Heading size="4">Create New Greeting</Heading>
              <Text color="gray" size="2">
                Create a new greeting object on-chain
              </Text>
            </Box>

            <TextArea
              placeholder="Enter greeting text (max 280 characters)"
              value={createText}
              onChange={(e) => setCreateText(e.target.value)}
              disabled={loading}
              maxLength={280}
            />

            <Flex justify="between" align="center">
              <Text size="1" color="gray">
                {createText.length}/280 characters
              </Text>
              <Button
                onClick={handleCreateGreeting}
                disabled={loading || !createText.trim()}
              >
                {loading ? <ClipLoader size={16} /> : <Plus size={16} />}
                Create Greeting
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Update Greeting */}
        <Card>
          <Flex direction="column" gap="3">
            <Box>
              <Heading size="4">Update Greeting Text</Heading>
              <Text color="gray" size="2">
                Update text of any greeting object
              </Text>
            </Box>

            {allGreetings.length === 0 ? (
              <Text color="gray">
                {greetingsLoading ? "Loading greetings..." : "No greetings found"}
              </Text>
            ) : (
              <Box>
                <Text size="1" color="gray" mb="2">
                  Select a greeting to update:
                </Text>
                <Box style={{ display: "grid", gap: "8px", maxHeight: "300px", overflow: "auto" }}>
                  {allGreetings.map((greeting: any) => (
                    <Card
                      key={greeting.objectId}
                      style={{
                        padding: "12px",
                        backgroundColor: "var(--gray-a2)",
                        cursor: "pointer",
                      }}
                    >
                      <Flex direction="column" gap="2">
                        <Flex justify="between" align="start">
                          <Box>
                            <Text size="2" weight="bold">
                              {greeting.text?.substring(0, 50)}...
                            </Text>
                            <Text size="1" color="gray">
                              ID: {greeting.objectId.slice(0, 10)}...
                            </Text>
                          </Box>
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => {
                              const newText = prompt("Enter new greeting text:");
                              if (newText) {
                                handleUpdateGreeting(greeting.objectId, newText);
                              }
                            }}
                          >
                            Update
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Flex>
        </Card>

        {/* Transfer Ownership */}
        <Card>
          <Flex direction="column" gap="3">
            <Box>
              <Heading size="4">Transfer Ownership</Heading>
              <Text color="gray" size="2">
                Transfer a greeting to another address
              </Text>
            </Box>

            <TextField.Root
              placeholder="Greeting ID"
              value={transferId}
              onChange={(e) => setTransferId(e.target.value)}
              disabled={loading}
            />

            <TextField.Root
              placeholder="New owner address (0x...)"
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              disabled={loading}
            />

            <Button
              onClick={handleTransferOwnership}
              disabled={loading || !transferId || !transferAddress}
            >
              {loading ? <ClipLoader size={16} /> : <ArrowRight size={16} />}
              Transfer Ownership
            </Button>
          </Flex>
        </Card>

        {/* Admin Management */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="4">Admin Management</Heading>
                <Text color="gray" size="2">
                  Manage admin addresses ({adminAddresses.length} active)
                </Text>
              </Box>
              <Dialog.Root open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
                <Dialog.Trigger>
                  <Button>
                    <Plus size={16} />
                    Add Admin
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content maxWidth="500px">
                  <Dialog.Title>Add New Admin</Dialog.Title>
                  <Flex direction="column" gap="3">
                    <TextField.Root
                      placeholder="Admin address (0x...)"
                      value={newAdminAddress}
                      onChange={(e) => setNewAdminAddress(e.target.value)}
                    />
                    <Flex gap="3" justify="end">
                      <Dialog.Close>
                        <Button variant="soft">Cancel</Button>
                      </Dialog.Close>
                      <Button onClick={handleAddAdmin}>Add Admin</Button>
                    </Flex>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </Flex>

            {adminAddresses.length === 0 ? (
              <Text color="gray">No admins configured yet.</Text>
            ) : (
              <Box style={{ display: "grid", gap: "8px" }}>
                {adminAddresses.map((addr) => (
                  <Flex
                    key={addr}
                    justify="between"
                    align="center"
                    style={{
                      padding: "12px",
                      backgroundColor: "var(--gray-a2)",
                      borderRadius: "8px",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <Lock size={14} color="var(--gray-9)" />
                      <code>{addr.slice(0, 10)}...{addr.slice(-8)}</code>
                    </Flex>
                    <Button
                      variant="soft"
                      color="red"
                      size="1"
                      onClick={() => onRemoveAdmin(addr)}
                    >
                      <Trash2 size={14} />
                      Remove
                    </Button>
                  </Flex>
                ))}
              </Box>
            )}
          </Flex>
        </Card>

        {/* Contract Functions Reference */}
        <Card style={{ backgroundColor: "var(--blue-a1)" }}>
          <Flex direction="column" gap="2">
            <Heading size="4" color="blue">
              Available Admin Functions
            </Heading>
            <Box as="ul" style={{ paddingLeft: "20px" }}>
              <Text as="li" size="2">
                <strong>new()</strong> - Create a new greeting object
              </Text>
              <Text as="li" size="2">
                <strong>update_text(id, text)</strong> - Update greeting text
              </Text>
              <Text as="li" size="2">
                <strong>transfer_ownership(id, address)</strong> - Transfer to another owner
              </Text>
              <Text as="li" size="2">
                <strong>update_text_owner_only(id, text)</strong> - Owner-restricted update
              </Text>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}
