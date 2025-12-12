// Admin and Role Types

export type UserRole = "user" | "admin" | "super_admin";

export interface AdminUser {
  address: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  lastActivity: Date;
}

export type Permission =
  | "view_dashboard"
  | "manage_users"
  | "manage_greetings"
  | "configure_system"
  | "deploy_contracts"
  | "manage_admins"
  | "view_analytics"
  | "execute_functions";

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    role: "user",
    permissions: ["view_dashboard", "view_analytics"],
    description: "Basic user with limited access",
  },
  admin: {
    role: "admin",
    permissions: [
      "view_dashboard",
      "manage_users",
      "manage_greetings",
      "view_analytics",
      "execute_functions",
    ],
    description: "Admin with management capabilities",
  },
  super_admin: {
    role: "super_admin",
    permissions: [
      "view_dashboard",
      "manage_users",
      "manage_greetings",
      "configure_system",
      "deploy_contracts",
      "manage_admins",
      "view_analytics",
      "execute_functions",
    ],
    description: "Super admin with full access",
  },
};

export interface ContractParam {
  name: string;
  type: string;
  isReference: boolean;
  isMutable: boolean;
}

export interface SmartContractFunction {
  id: string;
  name: string;
  module: string;
  description: string;
  parameters: ContractParam[];
  returnType: string;
  requiresAdmin: boolean;
  visibility: "public" | "private";
  fileLocation: string;
}

export interface ExecutionResult {
  status: "success" | "error";
  message: string;
  transactionId?: string;
  gasUsed: number;
  timestamp: Date;
  error?: string;
}
