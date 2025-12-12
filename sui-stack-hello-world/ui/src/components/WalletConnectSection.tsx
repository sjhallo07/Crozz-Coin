// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";
import { Wallet, Zap } from "lucide-react";

export function WalletConnectSection() {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      style={{
        minHeight: "100vh",
        backgroundColor: "linear-gradient(135deg, var(--blue-a2) 0%, var(--purple-a2) 100%)",
      }}
    >
      <Card
        style={{
          maxWidth: "500px",
          width: "100%",
          padding: "40px",
        }}
      >
        <Flex direction="column" gap="6" align="center">
          {/* Header */}
          <Flex direction="column" gap="2" align="center">
            <Box
              style={{
                fontSize: "48px",
                fontWeight: "bold",
              }}
            >
              <Zap size={48} color="var(--blue-9)" />
            </Box>
            <Heading size="6">Greeting Module</Heading>
            <Text color="gray" size="3">
              Admin & User Management System
            </Text>
          </Flex>

          {/* Description */}
          <Box style={{ textAlign: "center" }}>
            <Text size="2" color="gray" as="p">
              Connect your wallet to get started. You can access:
            </Text>
            <Box as="ul" style={{ marginTop: "8px", paddingLeft: "20px", textAlign: "left" }}>
              <Text as="li" size="2" color="gray">
                User dashboard to create and manage greetings
              </Text>
              <Text as="li" size="2" color="gray">
                Admin panel with full contract control
              </Text>
              <Text as="li" size="2" color="gray">
                Configuration management for smart contract
              </Text>
            </Box>
          </Box>

          {/* Connect Button */}
          <Box style={{ width: "100%" }}>
            <ConnectButton />
          </Box>

          {/* Features */}
          <Flex direction="column" gap="2" style={{ width: "100%", marginTop: "20px" }}>
            <Heading size="3">Features</Heading>
            <Box style={{ display: "grid", gap: "8px" }}>
              <Card style={{ padding: "12px", backgroundColor: "var(--blue-a1)" }}>
                <Flex gap="2">
                  <Wallet size={16} color="var(--blue-9)" style={{ marginTop: "2px" }} />
                  <Box>
                    <Text weight="bold" size="2">
                      Multiple Roles
                    </Text>
                    <Text size="1" color="gray">
                      Admin, User, or Guest access levels
                    </Text>
                  </Box>
                </Flex>
              </Card>
              <Card style={{ padding: "12px", backgroundColor: "var(--green-a1)" }}>
                <Flex gap="2">
                  <Wallet size={16} color="var(--green-9)" style={{ marginTop: "2px" }} />
                  <Box>
                    <Text weight="bold" size="2">
                      Smart Contract Integration
                    </Text>
                    <Text size="1" color="gray">
                      Direct interaction with on-chain functions
                    </Text>
                  </Box>
                </Flex>
              </Card>
              <Card style={{ padding: "12px", backgroundColor: "var(--orange-a1)" }}>
                <Flex gap="2">
                  <Wallet size={16} color="var(--orange-9)" style={{ marginTop: "2px" }} />
                  <Box>
                    <Text weight="bold" size="2">
                      Real-time Sync
                    </Text>
                    <Text size="1" color="gray">
                      Live updates from the blockchain
                    </Text>
                  </Box>
                </Flex>
              </Card>
            </Box>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
