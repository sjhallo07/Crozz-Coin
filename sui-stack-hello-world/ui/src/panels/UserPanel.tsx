// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextArea,
  Badge,
} from "@radix-ui/themes";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import { useState } from "react";
// Fix: 'Counter' icon does not exist in lucide-react; replace with 'ListOrdered'
import { Plus, Edit2, Copy, Calendar, User, ListOrdered } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useQueryAllGreetings } from "../hooks/useQueryAllGreetings";

interface UserPanelProps {
  adminAddresses: string[];
}

export function UserPanel({ adminAddresses }: UserPanelProps) {
  const currentAccount = useCurrentAccount();
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [newGreetingText, setNewGreetingText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { allGreetings = [], isLoading: greetingsLoading } = useQueryAllGreetings();

  const userGreetings = allGreetings.filter(
    (g: any) => g.owner?.toLowerCase() === currentAccount?.address.toLowerCase()
  );

  const handleCreateGreeting = () => {
    if (!newGreetingText.trim()) {
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
                setTxResult(`✓ Greeting created successfully!`);
                setNewGreetingText("");
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

  const handleUpdateGreeting = (id: string) => {
    if (!editText.trim()) {
      alert("Please enter new greeting text");
      return;
    }

    setLoading(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${helloWorldPackageId}::greeting::update_text_owner_only`,
      arguments: [tx.object(id), tx.pure.string(editText)],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setTxResult(`✓ Greeting updated!`);
          setEditingId(null);
          setEditText("");
          setTimeout(() => setTxResult(null), 3000);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(Number(timestamp)).toLocaleDateString();
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
        <Card style={{ borderLeft: "4px solid var(--blue-9)" }}>
          <Flex direction="column" gap="3">
            <Box>
              <Heading size="4">Create Your Greeting</Heading>
              <Text color="gray" size="2">
                Create a new greeting object to share with others
              </Text>
            </Box>

            <TextArea
              placeholder="Enter your greeting text (max 280 characters)"
              value={newGreetingText}
              onChange={(e) => setNewGreetingText(e.target.value)}
              disabled={loading}
              maxLength={280}
            />

            <Flex justify="between" align="center">
              <Text size="1" color="gray">
                {newGreetingText.length}/280 characters
              </Text>
              <Button
                onClick={handleCreateGreeting}
                disabled={loading || !newGreetingText.trim()}
              >
                {loading ? <ClipLoader size={16} /> : <Plus size={16} />}
                Create Greeting
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Your Greetings */}
        <Card>
          <Flex direction="column" gap="3">
            <Box>
              <Heading size="4">Your Greetings</Heading>
              <Text color="gray" size="2">
                Greetings you own ({userGreetings.length})
              </Text>
            </Box>

            {greetingsLoading ? (
              <Flex justify="center" align="center">
                <ClipLoader />
              </Flex>
            ) : userGreetings.length === 0 ? (
              <Text color="gray">
                You haven't created any greetings yet. Create one above!
              </Text>
            ) : (
              <Box style={{ display: "grid", gap: "12px" }}>
                {userGreetings.map((greeting: any) => (
                  <Card
                    key={greeting.objectId}
                    style={{
                      backgroundColor: "var(--gray-a2)",
                      borderLeft: "4px solid var(--blue-9)",
                    }}
                  >
                    {editingId === greeting.objectId ? (
                      // Edit Mode
                      <Flex direction="column" gap="3">
                        <TextArea
                          placeholder="Edit greeting text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          disabled={loading}
                          maxLength={280}
                        />
                        <Flex gap="2" justify="end">
                          <Button
                            variant="soft"
                            onClick={() => {
                              setEditingId(null);
                              setEditText("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleUpdateGreeting(greeting.objectId)}
                            disabled={loading}
                          >
                            {loading ? <ClipLoader size={16} /> : <Edit2 size={16} />}
                            Save
                          </Button>
                        </Flex>
                      </Flex>
                    ) : (
                      // View Mode
                      <Flex direction="column" gap="2">
                        <Flex justify="between" align="start">
                          <Box style={{ flex: 1 }}>
                            <Text size="3" weight="bold" as="p">
                              {greeting.text}
                            </Text>
                          </Box>
                          <Flex gap="2">
                            <Button
                              variant="soft"
                              size="1"
                              onClick={() => {
                                setEditingId(greeting.objectId);
                                setEditText(greeting.text);
                              }}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="soft"
                              size="1"
                              onClick={() =>
                                copyToClipboard(greeting.objectId, greeting.objectId)
                              }
                            >
                              <Copy size={14} />
                              {copiedId === greeting.objectId ? "Copied" : ""}
                            </Button>
                          </Flex>
                        </Flex>

                        <Flex gap="4" wrap="wrap">
                          <Flex align="center" gap="2">
                            <Badge color="blue" variant="soft">
                              ID
                            </Badge>
                            <Text size="1" color="gray">
                              {greeting.objectId.slice(0, 12)}...
                            </Text>
                          </Flex>
                          <Flex align="center" gap="2">
                            <Calendar size={14} color="var(--gray-9)" />
                            <Text size="1" color="gray">
                              {formatTimestamp(greeting.created_at)}
                            </Text>
                          </Flex>
                          <Flex align="center" gap="2">
                            <ListOrdered size={14} color="var(--gray-9)" />
                            <Text size="1" color="gray">
                              Updated {greeting.updated_count} times
                            </Text>
                          </Flex>
                        </Flex>
                      </Flex>
                    )}
                  </Card>
                ))}
              </Box>
            )}
          </Flex>
        </Card>

        {/* All Public Greetings */}
        <Card>
          <Flex direction="column" gap="3">
            <Box>
              <Heading size="4">All Greetings</Heading>
              <Text color="gray" size="2">
                View all greetings on the network ({allGreetings.length})
              </Text>
            </Box>

            {greetingsLoading ? (
              <Flex justify="center">
                <ClipLoader />
              </Flex>
            ) : allGreetings.length === 0 ? (
              <Text color="gray">No greetings found on the network.</Text>
            ) : (
              <Box
                style={{
                  display: "grid",
                  gap: "8px",
                  maxHeight: "500px",
                  overflow: "auto",
                }}
              >
                {allGreetings.map((greeting: any) => (
                  <Card
                    key={greeting.objectId}
                    style={{
                      padding: "12px",
                      backgroundColor: "var(--gray-a1)",
                    }}
                  >
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="start">
                        <Box style={{ flex: 1 }}>
                          <Text size="2" weight="bold">
                            {greeting.text.substring(0, 60)}
                            {greeting.text.length > 60 ? "..." : ""}
                          </Text>
                          <Text size="1" color="gray">
                            ID: {greeting.objectId.slice(0, 10)}...
                          </Text>
                        </Box>
                        <Badge
                          color={
                            greeting.owner?.toLowerCase() ===
                            currentAccount?.address.toLowerCase()
                              ? "blue"
                              : "gray"
                          }
                          variant="soft"
                        >
                          {greeting.owner?.toLowerCase() ===
                          currentAccount?.address.toLowerCase()
                            ? "Your Greeting"
                            : "Others"}
                        </Badge>
                      </Flex>
                      <Flex gap="3" wrap="wrap">
                        <Flex align="center" gap="1">
                          <User size={12} color="var(--gray-9)" />
                          <Text size="1" color="gray">
                            {greeting.owner ? greeting.owner.slice(0, 8) + "..." : "Unknown"}
                          </Text>
                        </Flex>
                        <Flex align="center" gap="1">
                          <Calendar size={12} color="var(--gray-9)" />
                          <Text size="1" color="gray">
                            {formatTimestamp(greeting.created_at)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Box>
            )}
          </Flex>
        </Card>

        {/* Available Functions */}
        <Card style={{ backgroundColor: "var(--blue-a1)" }}>
          <Flex direction="column" gap="2">
            <Heading size="4" color="blue">
              Available User Functions
            </Heading>
            <Box as="ul" style={{ paddingLeft: "20px" }}>
              <Text as="li" size="2">
                <strong>new()</strong> - Create a new greeting object
              </Text>
              <Text as="li" size="2">
                <strong>update_text_owner_only(id, text)</strong> - Update your own greeting
              </Text>
              <Text as="li" size="2">
                <strong>read functions</strong> - View all greetings and their metadata
              </Text>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}
