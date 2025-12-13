// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text, Tabs, Button, Card } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Menu, LogOut, Settings, Users } from "lucide-react";
import { AdminPanel } from "./panels/AdminPanel";
import { UserPanel } from "./panels/UserPanel";
import { ConfigManager } from "./panels/ConfigManager";
import { WalletConnectSection } from "./components/WalletConnectSection";
import { RoleSelector } from "./components/RoleSelector";
import { DashboardNav } from "./components/DashboardNav";
import { AdminDashboard } from "./components/AdminDashboard";
import { useAdminStore } from "./hooks/useAdminStore";
import type { SmartContractFunction } from "./types/admin";

export type UserRole = "admin" | "user" | "guest";

interface DashboardState {
  role: UserRole;
  sidebarOpen: boolean;
  activeTab: string;
}

export function Dashboard() {
  const currentAccount = useCurrentAccount();
  const [state, setState] = useState<DashboardState>({
    role: "guest",
    sidebarOpen: true,
    activeTab: "overview",
  });

  const [adminAddresses, setAdminAddresses] = useState<string[]>(() => {
    const stored = localStorage.getItem("admin_addresses");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (currentAccount?.address) {
      const isAdmin = adminAddresses.includes(currentAccount.address);
      setState({
        ...state,
        role: isAdmin ? "admin" : currentAccount ? "user" : "guest",
      });
    } else {
      setState({ ...state, role: "guest" });
    }
  }, [currentAccount?.address, adminAddresses, state]);

  const handleAddAdmin = (address: string) => {
    const updated = [...adminAddresses, address];
    setAdminAddresses(updated);
    localStorage.setItem("admin_addresses", JSON.stringify(updated));
  };

  const handleRemoveAdmin = (address: string) => {
    const updated = adminAddresses.filter((addr) => addr !== address);
    setAdminAddresses(updated);
    localStorage.setItem("admin_addresses", JSON.stringify(updated));
  };

  const handleDisconnect = () => {
    setState((prev) => ({ ...prev, role: "guest" }));
  };

  if (!currentAccount) {
    return <WalletConnectSection />;
  }

  return (
    <Flex direction="column" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Box
        style={{
          borderBottom: "1px solid var(--gray-a3)",
          backgroundColor: "var(--gray-a1)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <Container size="4">
          <Flex
            px="4"
            py="3"
            justify="between"
            align="center"
            style={{ gap: "12px" }}
          >
            <Flex align="center" style={{ gap: "12px", flex: 1 }}>
              <Button
                variant="ghost"
                size="2"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    sidebarOpen: !prev.sidebarOpen,
                  }))
                }
              >
                <Menu size={20} />
              </Button>
              <Box>
                <Heading size="5">Greeting Module Dashboard</Heading>
                <Text size="1" color="gray">
                  Admin & User Management System
                </Text>
              </Box>
            </Flex>

            <Flex align="center" style={{ gap: "8px" }}>
              <RoleSelector
                currentRole={state.role}
                currentAddress={currentAccount?.address || ""}
              />
              <Button
                variant="soft"
                color="red"
                size="2"
                onClick={handleDisconnect}
              >
                <LogOut size={16} />
                Disconnect
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Flex style={{ flex: 1 }}>
        {/* Sidebar */}
        {state.sidebarOpen && (
          <Box
            style={{
              width: "250px",
              borderRight: "1px solid var(--gray-a3)",
              backgroundColor: "var(--gray-a1)",
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <DashboardNav
              role={state.role}
              activeTab={state.activeTab}
              onTabChange={(tab) => setState((prev) => ({ ...prev, activeTab: tab }))}
              adminCount={adminAddresses.length}
            />
          </Box>
        )}

        {/* Main Panel */}
        <Box style={{ flex: 1, overflow: "auto" }}>
          <Container size="4" p="4">
            <Tabs.Root
              value={state.activeTab}
              onValueChange={(tab) =>
                setState((prev) => ({ ...prev, activeTab: tab }))
              }
            >
              {/* Guest/User Overview */}
              <Tabs.Content value="overview">
                <Card>
                  <Flex direction="column" style={{ gap: "16px" }}>
                    <Box>
                      <Heading size="4">Dashboard Overview</Heading>
                      <Text color="gray" size="2">
                        Welcome to the Greeting Module Management System
                      </Text>
                    </Box>

                    <Box style={{ padding: "20px", backgroundColor: "var(--gray-a2)", borderRadius: "8px" }}>
                      <Heading size="3" mb="2">
                        Your Role: <Text color="blue">{state.role.toUpperCase()}</Text>
                      </Heading>
                      <Text size="2">
                        Address: <code style={{ backgroundColor: "var(--gray-a3)", padding: "4px 8px", borderRadius: "4px" }}>
                          {currentAccount.address.slice(0, 10)}...{currentAccount.address.slice(-8)}
                        </code>
                      </Text>
                      {state.role === "admin" && (
                        <Text size="2" color="green" mt="2">
                          ✓ You have full administrative access
                        </Text>
                      )}
                      {state.role === "user" && (
                        <Text size="2" color="blue" mt="2">
                          ✓ You can view and manage your own greetings
                        </Text>
                      )}
                    </Box>

                    {/* Quick Stats */}
                    <Box>
                      <Heading size="3" mb="3">
                        Quick Stats
                      </Heading>
                      <Flex gap="3" wrap="wrap">
                        <Card style={{ flex: "1", minWidth: "200px" }}>
                          <Flex direction="column" gap="2">
                            <Text size="1" color="gray">
                              Admin Accounts
                            </Text>
                            <Heading size="4">{adminAddresses.length}</Heading>
                          </Flex>
                        </Card>
                        <Card style={{ flex: "1", minWidth: "200px" }}>
                          <Flex direction="column" gap="2">
                            <Text size="1" color="gray">
                              Your Status
                            </Text>
                            <Heading size="4">
                              {state.role === "admin" ? "Admin" : "User"}
                            </Heading>
                          </Flex>
                        </Card>
                      </Flex>
                    </Box>
                  </Flex>
                </Card>
              </Tabs.Content>

              {/* User Panel */}
              {(state.role === "user" || state.role === "admin") && (
                <Tabs.Content value="user">
                  <UserPanel adminAddresses={adminAddresses} />
                </Tabs.Content>
              )}

              {/* Admin Roles & Permissions Dashboard */}
              {state.role === "admin" && (
                <Tabs.Content value="rbac">
                  <AdminDashboard contractFunctions={[]} />
                </Tabs.Content>
              )}

              {/* Admin Panel */}
              {state.role === "admin" && (
                <>
                  <Tabs.Content value="admin">
                    <AdminPanel
                      onAddAdmin={handleAddAdmin}
                      onRemoveAdmin={handleRemoveAdmin}
                      adminAddresses={adminAddresses}
                    />
                  </Tabs.Content>

                  <Tabs.Content value="config">
                    <ConfigManager />
                  </Tabs.Content>

                  <Tabs.Content value="admin-management">
                    <Card>
                      <Flex direction="column" gap="4">
                        <Box>
                          <Heading size="4">Admin Management</Heading>
                          <Text color="gray" size="2">
                            Manage admin addresses and permissions
                          </Text>
                        </Box>

                        <Box>
                          <Heading size="3" mb="2">
                            Current Admins ({adminAddresses.length})
                          </Heading>
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
                                  <code>{addr.slice(0, 10)}...{addr.slice(-8)}</code>
                                  <Button
                                    variant="soft"
                                    color="red"
                                    size="1"
                                    onClick={() => handleRemoveAdmin(addr)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Flex>
                    </Card>
                  </Tabs.Content>
                </>
              )}

              {/* Config Tab for Users */}
              {state.role !== "admin" && (
                <Tabs.Content value="config">
                  <Card>
                    <Box>
                      <Heading size="4">Configuration</Heading>
                      <Text color="gray" size="2">
                        Admin-only section. Upgrade your account to access.
                      </Text>
                    </Box>
                  </Card>
                </Tabs.Content>
              )}
            </Tabs.Root>
          </Container>
        </Box>
      </Flex>
    </Flex>
  );
}
