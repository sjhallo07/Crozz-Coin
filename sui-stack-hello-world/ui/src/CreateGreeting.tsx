// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Card, Flex, Heading, Text, Box, Badge } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { Sparkles, Info, CheckCircle } from "lucide-react";
import { Modal } from "./components/Modal";
import { RecommendationsPanel } from "./components/RecommendationsPanel";

export function CreateGreeting({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const create = () => {
    setWaitingForTxn(true);

    const tx = new Transaction();

    tx.moveCall({
      arguments: [],
      target: `${helloWorldPackageId}::greeting::new`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (tx) => {
          suiClient
            .waitForTransaction({
              digest: tx.digest,
              options: { showEffects: true },
            })
            .then(async (result) => {
              const objectId = result.effects?.created?.[0]?.reference?.objectId;
              if (objectId) {
                setCreatedId(objectId);
                onCreated(objectId);
                setWaitingForTxn(false);
              }
            });
        },
        onError: (error) => {
          alert(`Transaction failed: ${error.message}`);
          setWaitingForTxn(false);
        },
      },
    );
  };

  const recommendations = [
    {
      type: "info" as const,
      title: "What is a Greeting?",
      description: "A greeting is a simple blockchain object that stores a message you can update later.",
    },
    {
      type: "success" as const,
      title: "Default Message",
      description: 'Your greeting will start with "Hello world!" and you can update it anytime.',
    },
    {
      type: "tip" as const,
      title: "Easy to Use",
      description: "Just click Create Greeting and sign the transaction in your wallet!",
    },
  ];

  return (
    <Container>
      <Card style={{ borderLeft: "4px solid var(--purple-7)" }}>
        <Flex direction="column" gap="4">
          {/* Header */}
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Heading size="4">Create Your Greeting</Heading>
              <Text size="2" color="gray">
                Start your journey on the Sui blockchain
              </Text>
            </Flex>
            <Button
              variant="soft"
              size="2"
              onClick={() => setShowInfo(true)}
            >
              <Info size={16} /> Learn More
            </Button>
          </Flex>

          {/* Recommendations */}
          <RecommendationsPanel recommendations={recommendations} />

          {/* Create Button Section */}
          <Box>
            <Flex direction="column" gap="3">
              <Text size="1" color="gray">
                Click the button below to create your greeting object on the blockchain.
              </Text>
              
              <Button
                size="3"
                onClick={() => create()}
                disabled={waitingForTxn}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {waitingForTxn ? (
                  <>
                    <ClipLoader size={20} /> Creating Greeting...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Create Greeting
                  </>
                )}
              </Button>

              {createdId && (
                <Card style={{ borderLeft: "4px solid var(--green-7)", background: "var(--green-a2)" }}>
                  <Flex direction="column" gap="2" align="center">
                    <CheckCircle size={24} color="var(--green-11)" />
                    <Heading size="3" color="green">
                      Greeting Created!
                    </Heading>
                    <Badge color="green" variant="soft">
                      {createdId.slice(0, 8)}...{createdId.slice(-8)}
                    </Badge>
                    <Text size="1" color="gray">
                      Your greeting is ready. Click the update button to change the message.
                    </Text>
                  </Flex>
                </Card>
              )}
            </Flex>
          </Box>

          {/* Additional Info */}
          <Card style={{ background: "var(--gray-a2)" }}>
            <Flex direction="column" gap="2">
              <Text size="1" weight="bold">
                💡 Pro Tip
              </Text>
              <Text size="1" color="gray">
                After creating your greeting, you can update the message, share the ID with others, or manage it through the dashboard.
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Card>

      {/* Information Modal */}
      <Modal
        open={showInfo}
        onOpenChange={setShowInfo}
        title="Understanding Greetings"
        description="Everything you need to know about creating and managing greetings"
      >
        <Flex direction="column" gap="4">
          <Box>
            <Heading size="3" mb="2">
              What Happens When You Create?
            </Heading>
            <Flex direction="column" gap="2" as="ol" style={{ paddingLeft: "20px" }}>
              <Text as="li" size="1">
                <strong>Transaction created</strong> - A Move transaction is built
              </Text>
              <Text as="li" size="1">
                <strong>Wallet approval</strong> - You approve it in your wallet
              </Text>
              <Text as="li" size="1">
                <strong>Blockchain execution</strong> - The transaction runs on Sui
              </Text>
              <Text as="li" size="1">
                <strong>Object created</strong> - Your greeting object is created with default text
              </Text>
              <Text as="li" size="1">
                <strong>Ready to use</strong> - You can now update or manage it
              </Text>
            </Flex>
          </Box>

          <Box>
            <Heading size="3" mb="2">
              Initial Message
            </Heading>
            <Text color="gray" size="1">
              Every new greeting starts with the default message: <strong>"Hello world!"</strong>
            </Text>
            <Text color="gray" size="1" style={{ marginTop: "8px" }}>
              You can update this to any message you want after creation.
            </Text>
          </Box>

          <Box>
            <Heading size="3" mb="2">
              Gas Costs
            </Heading>
            <Text color="gray" size="1">
              Creating a greeting requires a small amount of SUI for gas fees. Make sure you have enough in your wallet.
            </Text>
            <Button
              variant="soft"
              size="2"
              style={{ marginTop: "12px" }}
              onClick={() => {
                window.open("https://faucet.sui.io", "_blank");
              }}
            >
              Get Testnet SUI
            </Button>
          </Box>

          <Box>
            <Heading size="3" mb="2">
              Security
            </Heading>
            <Flex direction="column" gap="2">
              <Text size="1" color="gray">
                ✅ You own the greeting object
              </Text>
              <Text size="1" color="gray">
                ✅ Only you can update it (with the private key)
              </Text>
              <Text size="1" color="gray">
                ✅ It's permanent on the blockchain
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Modal>
    </Container>
  );
}
