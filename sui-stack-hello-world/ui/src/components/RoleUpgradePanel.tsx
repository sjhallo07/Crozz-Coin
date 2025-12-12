import { Box, Button, Card, Heading, Text, TextField, Select, Flex } from "@radix-ui/themes";
import { useAdminStore } from "../hooks/useAdminStore";
import { ROLE_PERMISSIONS } from "../types/admin";
import type { UserRole } from "../types/admin";
import { useState } from "react";

export function RoleUpgradePanel() {
  const { currentUser, isAdmin, isSuperAdmin, hasPermission } = useAdminStore();
  const [requestedRole, setRequestedRole] = useState<UserRole>("admin");

  const canAccessAdminPanel = isAdmin();
  const currentUserRole = currentUser?.role || "user";

  if (!canAccessAdminPanel) {
    return (
      <Box style={{ padding: "2rem" }}>
        <Card
          style={{
            background: "linear-gradient(135deg, #2e1a2e 0%, #4a1a4a 100%)",
            border: "2px solid #ec4899",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <Heading size="5" style={{ color: "#f472b6", marginBottom: "1rem" }}>
            🔐 Admin-Only Section
          </Heading>
          <Text style={{ color: "#f9a8d4", marginBottom: "1.5rem" }}>
            This section is restricted to administrators. Upgrade your account to access advanced features.
          </Text>

          <Flex direction="column" gap="2" style={{ marginTop: "2rem" }}>
            <Text size="2" style={{ color: "#e0e7ff" }}>
              Current Role: <strong>{currentUserRole}</strong>
            </Text>

            <Box style={{ marginTop: "1rem" }}>
              <Text size="2" style={{ color: "#a5b4fc", marginBottom: "0.5rem" }}>
                Available Roles:
              </Text>
              {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                <Box
                  key={role}
                  style={{
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid #3b3366",
                    borderRadius: "8px",
                  }}
                >
                  <Text style={{ color: "#e0e7ff", fontWeight: "bold" }}>
                    {role === "super_admin" ? "🌟 Super Admin" : role === "admin" ? "👑 Admin" : "👤 User"}
                  </Text>
                  <Text size="1" style={{ color: "#a5b4fc" }}>
                    {info.description}
                  </Text>
                </Box>
              ))}
            </Box>

            <Button
              style={{
                marginTop: "1.5rem",
                background: "#8b5cf6",
                color: "#fff",
                padding: "0.75rem 1.5rem",
              }}
            >
              Request Admin Access
            </Button>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box style={{ padding: "2rem" }}>
      <Heading size="5" style={{ marginBottom: "1.5rem", color: "#e0e7ff" }}>
        👑 Admin Configuration Panel
      </Heading>

      <Card
        style={{
          background: "rgba(30, 27, 75, 0.5)",
          border: "1px solid #3b3366",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <Heading size="4" style={{ marginBottom: "1rem", color: "#e0e7ff" }}>
          Current Admin Status
        </Heading>
        <Flex direction="column" gap="2">
          <Text style={{ color: "#a5b4fc" }}>
            Role: <strong style={{ color: "#e0e7ff" }}>{currentUserRole}</strong>
          </Text>
          <Text style={{ color: "#a5b4fc" }}>
            Is Super Admin: <strong style={{ color: isSuperAdmin() ? "#10b981" : "#ef4444" }}>
              {isSuperAdmin() ? "Yes" : "No"}
            </strong>
          </Text>
          <Text style={{ color: "#a5b4fc" }}>
            Permissions: <strong style={{ color: "#e0e7ff" }}>
              {ROLE_PERMISSIONS[currentUserRole].permissions.length}
            </strong>
          </Text>
        </Flex>
      </Card>

      {isSuperAdmin() && (
        <Card
          style={{
            background: "linear-gradient(135deg, #1e2e4a 0%, #1e3a5f 100%)",
            border: "1px solid #1e4976",
            padding: "1.5rem",
          }}
        >
          <Heading size="4" style={{ marginBottom: "1rem", color: "#7dd3fc" }}>
            Super Admin Controls
          </Heading>
          <Text style={{ color: "#a5b4fc", marginBottom: "1rem" }}>
            You have full access to all system functions and can manage other admin users.
          </Text>
          <Flex gap="2">
            <Button style={{ background: "#06b6d4", color: "#fff" }}>
              Manage Users
            </Button>
            <Button style={{ background: "#0891b2", color: "#fff" }}>
              Deploy Contracts
            </Button>
            <Button style={{ background: "#0d47a1", color: "#fff" }}>
              View Analytics
            </Button>
          </Flex>
        </Card>
      )}
    </Box>
  );
}
