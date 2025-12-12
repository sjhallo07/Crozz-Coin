// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Box, Button, Flex, Badge } from "@radix-ui/themes";
import {
  Home,
  Users,
  Settings,
  Lock,
  BarChart3,
  Shield,
} from "lucide-react";

interface DashboardNavProps {
  role: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  adminCount: number;
}

export function DashboardNav({
  role,
  activeTab,
  onTabChange,
  adminCount,
}: DashboardNavProps) {
  const navItems = [
    {
      label: "Overview",
      value: "overview",
      icon: <Home size={16} />,
      available: true,
    },
    {
      label: "User Panel",
      value: "user",
      icon: <Users size={16} />,
      available: role === "user" || role === "admin",
    },
    {
      label: "RBAC Dashboard",
      value: "rbac",
      icon: <Shield size={16} />,
      available: role === "admin",
    },
    {
      label: "Admin Panel",
      value: "admin",
      icon: <Lock size={16} />,
      available: role === "admin",
    },
    {
      label: "Configuration",
      value: "config",
      icon: <Settings size={16} />,
      available: true,
    },
    {
      label: "Admin Management",
      value: "admin-management",
      icon: <BarChart3 size={16} />,
      available: role === "admin",
      badge: adminCount,
    },
  ];

  return (
    <Flex direction="column" gap="2">
      {navItems.map((item) =>
        item.available ? (
          <Button
            key={item.value}
            variant={activeTab === item.value ? "solid" : "ghost"}
            onClick={() => onTabChange(item.value)}
            style={{
              justifyContent: "flex-start",
              gap: "8px",
              width: "100%",
            }}
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined && (
              <Badge color="blue" variant="soft" ml="auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ) : null
      )}
    </Flex>
  );
}
