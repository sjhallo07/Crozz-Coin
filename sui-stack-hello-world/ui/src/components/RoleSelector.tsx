// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, Text, Badge, Button, Flex } from "@radix-ui/themes";
import { Crown, User, LogOut } from "lucide-react";

interface RoleSelectorProps {
  currentRole: string;
  currentAddress: string;
}

export function RoleSelector({ currentRole, currentAddress }: RoleSelectorProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "user":
        return "blue";
      default:
        return "gray";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown size={14} />;
      case "user":
        return <User size={14} />;
      default:
        return <LogOut size={14} />;
    }
  };

  return (
    <Flex align="center" gap="2">
      <Box>
        <Flex align="center" gap="2">
          {getRoleIcon(currentRole)}
          <Badge color={getRoleColor(currentRole)} variant="soft">
            {currentRole.toUpperCase()}
          </Badge>
        </Flex>
      </Box>
    </Flex>
  );
}
