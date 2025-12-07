// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import type { SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Heading, Text, TextField, Box, Card, Badge } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Copy, Info, RefreshCw, Trash2 } from "lucide-react";
import { Modal } from "./components/Modal";
import { RecommendationsPanel } from "./components/RecommendationsPanel";

export function Greeting({ id }: { id: string }) {
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id,
    options: {
      showContent: true,
    },
  });

  const [newText, setNewText] = useState("");
  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const currentText = getGreetingFields(data?.data ?? undefined)?.text || "";
  const charCount = currentText.length;
  const textLength = newText.length;

  const executeMoveCall = () => {
    if (!newText.trim()) {
      alert("Please enter some text");
      return;
    }

    setWaitingForTxn(true);

    const tx = new Transaction();

    tx.moveCall({
      target: `${helloWorldPackageId}::greeting::update_text`,
      arguments: [tx.object(id), tx.pure.string(newText)],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (tx) => {
          suiClient.waitForTransaction({ digest: tx.digest }).then(async () => {
            await refetch();
            setWaitingForTxn(false);
            setNewText("");
          });
        },
        onError: (error) => {
          alert(`Transaction failed: ${error.message}`);
          setWaitingForTxn(false);
        },
      },
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const recommendations = [
    {
      type: "info" as const,
      title: "Greeting Status",
      description: `Your greeting has ${charCount} characters. Keep it meaningful!`,
    },
    {
      type: "tip" as const,
      title: "Update Greeting",
      description: "Enter new text and click Update to change your greeting message.",
      action: {
        label: "Focus Input",
        onClick: () => {
          const input = document.querySelector("input[placeholder]") as HTMLInputElement;
          input?.focus();
        },
      },
    },
    newText.trim()
      ? {
          type: "success" as const,
          title: `Ready to Update (${textLength} chars)`,
          description: `Your new message is ready. Click Update to commit changes.`,
        }
      : {
          type: "warning" as const,
          title: "Text Required",
          description: "Enter new text to update your greeting.",
        },
  ];

  if (isPending) {
    return (
      <Card>
        <Flex justify="center" align="center" gap="2">
          <ClipLoader size={20} />
          <Text>Loading greeting...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ borderLeft: "4px solid var(--red-7)" }}>
        <Flex direction="column" gap="2">
          <Heading size="3" color="red">
            Error Loading Greeting
          </Heading>
          <Text size="2">{error.message}</Text>
          <Button onClick={() => refetch()} variant="soft">
            <RefreshCw size={16} /> Retry
          </Button>
        </Flex>
      </Card>
    );
  }

  if (!data?.data) {
    return (
      <Card>
        <Text color="gray">Greeting not found</Text>
      </Card>
    );
  }

  return (
    <>
      <Card style={{ borderLeft: "4px solid var(--blue-7)" }}>
        <Flex direction="column" gap="4">
          {/* Header */}
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Heading size="4">Your Greeting</Heading>
              <Flex gap="2" align="center">
                <Badge color="blue" variant="soft">
                  {id.slice(0, 8)}...{id.slice(-8)}
                </Badge>
                <Button
                  variant="ghost"
                  size="1"
                  onClick={() => copyToClipboard(id)}
                  title="Copy Object ID"
                >
                  <Copy size={14} />
                </Button>
                {copiedId && <Text size="1" color="green">Copied!</Text>}
              </Flex>
            </Flex>
            <Flex gap="2">
              <Button
                variant="soft"
                size="2"
                onClick={() => setShowInfo(true)}
                title="View information"
              >
                <Info size={16} /> Info
              </Button>
              <Button
                variant="soft"
                size="2"
                onClick={() => setShowDetails(true)}
                title="View details"
              >
                <RefreshCw size={16} /> Details
              </Button>
            </Flex>
          </Flex>

          {/* Current Greeting Display */}
          <Card style={{ background: "var(--gray-a2)", padding: "16px" }}>
            <Flex direction="column" gap="2">
              <Text size="1" color="gray" weight="bold">
                Current Message
              </Text>
              <Text size="3" style={{ fontStyle: "italic", wordBreak: "break-word" }}>
                "{currentText}"
              </Text>
              <Flex justify="between">
                <Text size="1" color="gray">
                  Length: {charCount} characters
                </Text>
              </Flex>
            </Flex>
          </Card>

          {/* Recommendations Panel */}
          <RecommendationsPanel recommendations={recommendations} />

          {/* Update Section */}
          <Box>
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Update Greeting
              </Text>
              <Flex direction="row" gap="2">
                <TextField.Root
                  placeholder={currentText || "Enter new greeting text..."}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  disabled={waitingForTxn}
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => executeMoveCall()}
                  disabled={waitingForTxn || !newText.trim()}
                  style={{
                    minWidth: "120px",
                  }}
                >
                  {waitingForTxn ? (
                    <>
                      <ClipLoader size={16} /> Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </Flex>
              {newText && (
                <Text size="1" color="gray">
                  New message will have {textLength} characters
                </Text>
              )}
            </Flex>
          </Box>
        </Flex>
      </Card>

      {/* Information Modal */}
      <Modal
        open={showInfo}
        onOpenChange={setShowInfo}
        title="Greeting Information"
        description="Learn about your greeting object and how to update it"
      >
        <Flex direction="column" gap="4">
          <Box>
            <Heading size="3" mb="2">
              What is a Greeting?
            </Heading>
            <Text color="gray">
              A greeting is a simple Move object stored on the Sui blockchain. It contains a text message that you can update at any time.
            </Text>
          </Box>

          <Box>
            <Heading size="3" mb="2">
              Object Details
            </Heading>
            <Flex direction="column" gap="2">
              <Box>
                <Text size="1" weight="bold">
                  Object ID:
                </Text>
                <Text size="1" color="gray" style={{ wordBreak: "break-all" }}>
                  {id}
                </Text>
              </Box>
              <Box>
                <Text size="1" weight="bold">
                  Current Text:
                </Text>
                <Text size="1" color="gray">
                  "{currentText}"
                </Text>
              </Box>
              <Box>
                <Text size="1" weight="bold">
                  Character Count:
                </Text>
                <Text size="1" color="gray">
                  {charCount} characters
                </Text>
              </Box>
            </Flex>
          </Box>

          <Box>
            <Heading size="3" mb="2">
              How to Update
            </Heading>
            <Flex direction="column" gap="2" style={{ paddingLeft: "20px" }}>
              <Text size="1">
                • Enter new text in the input field
              </Text>
              <Text size="1">
                • Click the "Update" button
              </Text>
              <Text size="1">
                • Approve the transaction in your wallet
              </Text>
              <Text size="1">
                • Wait for confirmation on the blockchain
              </Text>
              <Text size="1">
                • Your greeting will be updated!
              </Text>
            </Flex>
          </Box>

          <Box>
            <Heading size="3" mb="2">
              Security Notes
            </Heading>
            <Flex direction="column" gap="2">
              <Text size="1" color="gray">
                ✅ Only you can update your greeting (if you own the object)
              </Text>
              <Text size="1" color="gray">
                ✅ Updates are immutable once confirmed
              </Text>
              <Text size="1" color="gray">
                ✅ Transactions require wallet approval
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Modal>

      {/* Details Modal */}
      <Modal
        open={showDetails}
        onOpenChange={setShowDetails}
        title="Greeting Object Details"
        description="Complete on-chain object information"
        size="large"
      >
        <Flex direction="column" gap="3">
          <Card style={{ background: "var(--gray-a2)", padding: "12px" }}>
            <Text size="1" weight="bold">
              Raw Object Data
            </Text>
            <pre
              style={{
                overflow: "auto",
                padding: "12px",
                background: "var(--gray-a3)",
                borderRadius: "4px",
                fontSize: "11px",
                marginTop: "8px",
                fontFamily: "monospace",
              }}
            >
              {JSON.stringify(data.data, null, 2)}
            </pre>
          </Card>

          <Box>
            <Heading size="3" mb="2">
              Key Information
            </Heading>
            <Flex direction="column" gap="2">
              <Flex justify="between">
                <Text size="1" weight="bold">
                  Owner Type:
                </Text>
                <Text size="1">{data.data.owner?.toString() || "Unknown"}</Text>
              </Flex>
              <Flex justify="between">
                <Text size="1" weight="bold">
                  Storage Rebate:
                </Text>
                <Text size="1">{(data.data as any).storageRebate || "N/A"}</Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Modal>
    </>
  );
}

function getGreetingFields(data: SuiObjectData | undefined) {
  if (!data || data.content?.dataType !== "moveObject") {
    return null;
  }

  return data.content.fields as { text: string };
}
