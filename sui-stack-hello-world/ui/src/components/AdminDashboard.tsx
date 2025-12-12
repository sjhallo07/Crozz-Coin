import { Box, Tabs, Card, Heading, Text, Flex, Badge } from "@radix-ui/themes";
import { useAdminStore } from "../hooks/useAdminStore";
import { RoleUpgradePanel } from "./RoleUpgradePanel";
import { SmartContractExecutor } from "./SmartContractExecutor";
import type { SmartContractFunction } from "../types/admin";
import { useState, useEffect } from "react";

interface AdminDashboardProps {
  contractFunctions?: SmartContractFunction[];
}

export function AdminDashboard({ contractFunctions = [] }: AdminDashboardProps) {
  const { currentUser, isAdmin, isSuperAdmin, hasPermission } = useAdminStore();
  const [adminStats, setAdminStats] = useState({
    totalAdmins: 0,
    totalPermissions: 0,
    availableFunctions: 0,
  });

  useEffect(() => {
    setAdminStats({
      totalAdmins: 1, // Would fetch from state
      totalPermissions: currentUser ? 8 : 0, // Based on role
      availableFunctions: contractFunctions.length,
    });
  }, [currentUser, contractFunctions]);

  const currentUserRole = currentUser?.role || "user";
  const canAccessAdmin = isAdmin();

  return (
    <Box style={{ padding: "2rem", minHeight: "100vh" }}>
      <Heading size="6" style={{ marginBottom: "2rem", color: "#e0e7ff" }}>
        🎛️ Crozz Coin Admin Dashboard
      </Heading>

      {/* Admin Status Card */}
      <Card
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          border: "1px solid #4c1d95",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <Flex justify="between" align="center">
          <Box>
            <Text style={{ color: "#a5b4fc", marginBottom: "0.5rem" }}>Current Role</Text>
            <Heading size="4" style={{ color: "#c4b5fd" }}>
              {currentUserRole === "super_admin" ? "🌟 Super Admin" : currentUserRole === "admin" ? "👑 Admin" : "👤 User"}
            </Heading>
          </Box>
          <Flex gap="2" direction="column">
            <Badge
              style={{
                background: isAdmin() ? "#10b981" : "#ef4444",
                color: "#fff",
                padding: "0.5rem 1rem",
              }}
            >
              {isAdmin() ? "✓ Admin Access" : "✗ Limited Access"}
            </Badge>
            {isSuperAdmin() && (
              <Badge
                style={{
                  background: "#f59e0b",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                }}
              >
                🌟 Super Admin
              </Badge>
            )}
          </Flex>
        </Flex>
      </Card>

      {/* Stats Cards */}
      <Flex gap="3" style={{ marginBottom: "2rem" }}>
        <Card
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid #1e40af",
            padding: "1rem",
            flex: 1,
          }}
        >
          <Text style={{ color: "#60a5fa" }}>Total Admin Users</Text>
          <Heading size="3" style={{ color: "#93c5fd" }}>
            {adminStats.totalAdmins}
          </Heading>
        </Card>

        <Card
          style={{
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid #4c1d95",
            padding: "1rem",
            flex: 1,
          }}
        >
          <Text style={{ color: "#c4b5fd" }}>Active Permissions</Text>
          <Heading size="3" style={{ color: "#e9d5ff" }}>
            {adminStats.totalPermissions}
          </Heading>
        </Card>

        <Card
          style={{
            background: "rgba(236, 72, 153, 0.1)",
            border: "1px solid #831843",
            padding: "1rem",
            flex: 1,
          }}
        >
          <Text style={{ color: "#f472b6" }}>Smart Contracts</Text>
          <Heading size="3" style={{ color: "#fbcfe8" }}>
            {adminStats.availableFunctions}
          </Heading>
        </Card>
      </Flex>

      {/* Admin Tabs */}
      {canAccessAdmin ? (
        <Tabs.Root defaultValue="role" style={{ marginTop: "2rem" }}>
          <Tabs.List style={{ background: "rgba(139, 92, 246, 0.1)", borderRadius: "8px" }}>
            <Tabs.Trigger value="role">Role Management</Tabs.Trigger>
            <Tabs.Trigger value="contracts">Smart Contracts</Tabs.Trigger>
            <Tabs.Trigger value="permissions">Permissions</Tabs.Trigger>
            {isSuperAdmin() && <Tabs.Trigger value="settings">Settings</Tabs.Trigger>}
          </Tabs.List>

          <Box style={{ marginTop: "2rem" }}>
            <Tabs.Content value="role">
              <RoleUpgradePanel />
            </Tabs.Content>

            <Tabs.Content value="contracts">
              <SmartContractExecutor functions={contractFunctions} />
            </Tabs.Content>

            <Tabs.Content value="permissions">
              <Box style={{ padding: "2rem" }}>
                <Card
                  style={{
                    background: "rgba(30, 27, 75, 0.5)",
                    border: "1px solid #3b3366",
                    padding: "1.5rem",
                  }}
                >
                  <Heading size="4" style={{ marginBottom: "1.5rem", color: "#e0e7ff" }}>
                    Your Permissions
                  </Heading>
                  <Flex direction="column" gap="2">
                    {[
                      "view_dashboard",
                      "manage_users",
                      "manage_greetings",
                      "configure_system",
                      "deploy_contracts",
                      "manage_admins",
                      "view_analytics",
                      "execute_functions",
                    ].map((perm) => (
                      <Flex key={perm} align="center" gap="2">
                        <Box
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            background: hasPermission(perm as any) ? "#10b981" : "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        >
                          {hasPermission(perm as any) ? "✓" : "✗"}
                        </Box>
                        <Text style={{ color: "#a5b4fc", fontFamily: "monospace" }}>
                          {perm}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                </Card>
              </Box>
            </Tabs.Content>

            {isSuperAdmin() && (
              <Tabs.Content value="settings">
                <Box style={{ padding: "2rem" }}>
                  <Card
                    style={{
                      background: "linear-gradient(135deg, #1e2e4a 0%, #1e3a5f 100%)",
                      border: "1px solid #1e4976",
                      padding: "1.5rem",
                    }}
                  >
                    <Heading size="4" style={{ marginBottom: "1.5rem", color: "#7dd3fc" }}>
                      ⚙️ System Settings
                    </Heading>
                    <Text style={{ color: "#a5b4fc" }}>
                      Super Admin system settings are available here. Configure ecosystem parameters, manage integrations,
                      and monitor system health.
                    </Text>
                  </Card>
                </Box>
              </Tabs.Content>
            )}
          </Box>
        </Tabs.Root>
      ) : (
        <Box style={{ marginTop: "2rem" }}>
          <RoleUpgradePanel />
        </Box>
      )}
    </Box>
  );
}
