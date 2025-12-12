# Admin RBAC System Documentation

## Overview

The Crozz Coin Admin RBAC (Role-Based Access Control) System provides comprehensive management of user roles, permissions, and smart contract function execution. The system is built with React 18, TypeScript, Zustand state management, and Radix UI components.

## Architecture

### Core Components

#### 1. **AdminDashboard** (`src/components/AdminDashboard.tsx`)
Main dashboard component displaying:
- Current admin status with role indicator
- Statistics cards (total admins, active permissions, smart contracts)
- Tabbed interface with role management, smart contracts, permissions, and settings
- Role-specific access controls

**Features:**
- View current role (User, Admin, or Super Admin)
- Monitor ecosystem statistics
- Access admin-only features based on permissions
- Super admin system settings tab

#### 2. **RoleUpgradePanel** (`src/components/RoleUpgradePanel.tsx`)
Provides interface for non-admin users:
- Display current role with restrictions
- Show available roles and their capabilities
- Request admin access button
- Permission descriptions

**Display Modes:**
- Non-admin: Shows role upgrade request interface
- Admin: Shows admin status and control panel
- Super Admin: Unlocks advanced controls

#### 3. **SmartContractExecutor** (`src/components/SmartContractExecutor.tsx`)
Admin-only component for executing smart contract functions:
- Function selection from discovered contracts
- Dynamic parameter input based on function signature
- Permission-based execution restrictions
- Execution result modal with transaction details

**Features:**
- Gas usage tracking
- Transaction ID display
- Timestamp logging
- Error handling with user feedback

### State Management

#### **useAdminStore** (`src/hooks/useAdminStore.ts`)
Zustand store managing admin state:

**State:**
```typescript
{
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
}
```

**Methods:**
- `setCurrentUser(user)` - Set current admin user
- `setAdminUsers(users)` - Update admin user list
- `hasPermission(permission)` - Check if user has permission
- `isAdmin()` - Check if user is admin or super_admin
- `isSuperAdmin()` - Check if user is super_admin
- `addAdminUser(user)` - Add new admin user
- `removeAdminUser(address)` - Remove admin user
- `updateUserRole(address, role)` - Change user role
- `getAllAdminUsers()` - Get all admin users
- `getAdminUserByAddress(address)` - Find user by address
- `initializeDefaultAdmin(address)` - Initialize default admin

### Type Definitions

#### **UserRole**
```typescript
type UserRole = "user" | "admin" | "super_admin";
```

#### **Permission**
```typescript
type Permission =
  | "view_dashboard"
  | "manage_users"
  | "manage_greetings"
  | "configure_system"
  | "deploy_contracts"
  | "manage_admins"
  | "view_analytics"
  | "execute_functions";
```

#### **AdminUser**
```typescript
interface AdminUser {
  address: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  lastActivity: Date;
}
```

#### **SmartContractFunction**
```typescript
interface SmartContractFunction {
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
```

#### **ExecutionResult**
```typescript
interface ExecutionResult {
  status: "success" | "error";
  message: string;
  transactionId?: string;
  gasUsed: number;
  timestamp: Date;
}
```

## Permission Matrix

### User Role Permissions
- `view_dashboard` - View main dashboard
- `view_analytics` - View analytics and reports

### Admin Role Permissions
- `view_dashboard` - View main dashboard
- `manage_users` - Manage user accounts
- `manage_greetings` - Create and modify greetings
- `view_analytics` - View analytics and reports
- `execute_functions` - Execute smart contract functions

### Super Admin Role Permissions (All)
- `view_dashboard`
- `manage_users`
- `manage_greetings`
- `configure_system` - System configuration
- `deploy_contracts` - Deploy new contracts
- `manage_admins` - Manage other admins
- `view_analytics`
- `execute_functions`

## Smart Contract Integration

### MoveContractScanner (`src/services/contractScanner.ts`)

Scans Move contract files to discover function signatures:

**Key Features:**
- Recursive directory scanning for `.move` files
- Extract public function signatures
- Parse parameters with types
- Detect reference and mutable parameters
- Generate function metadata

**Usage:**
```typescript
const scanner = new MoveContractScanner("/path/to/contracts");
const functions = await scanner.discoverFunctions();
```

**Methods:**
- `discoverFunctions()` - Scan and discover all functions
- `findMoveFiles(dir)` - Find all Move source files
- `extractFunctionsFromFile(filePath)` - Extract functions from single file
- `extractModuleName(content)` - Get module name from source
- `parseParameters(paramsStr)` - Parse function parameters

## Integration with Dashboard

The AdminDashboard is integrated into the main Dashboard component:

```typescript
{state.role === "admin" && (
  <Tabs.Content value="rbac">
    <AdminDashboard contractFunctions={[]} />
  </Tabs.Content>
)}
```

The RBAC Dashboard appears as a tab in the dashboard navigation for admin users.

## Theme & Styling

All components use the Crozz Coin ecosystem theme:

**Colors:**
- Primary: `#8b5cf6` (Purple)
- Accent: `#ec4899` (Pink)
- Background: Dark gray (`rgba(30, 27, 75, 0.5)`)
- Text: Light gray (`#e0e7ff`)
- Borders: `#3b3366` (Dark purple)

**Typography:**
- Headers: Radix UI Heading component
- Body: Radix UI Text component
- Consistent spacing with gap utilities

## Usage Examples

### Check User Permissions
```typescript
const { currentUser, hasPermission } = useAdminStore();

if (hasPermission("execute_functions")) {
  // Allow function execution
}
```

### Add Admin User
```typescript
const { addAdminUser } = useAdminStore();

addAdminUser({
  address: "0x...",
  role: "admin",
  permissions: ROLE_PERMISSIONS.admin.permissions,
  createdAt: new Date(),
  lastActivity: new Date(),
});
```

### Execute Smart Contract Function
```typescript
<SmartContractExecutor functions={contractFunctions} />
```

The component handles:
- Function selection
- Parameter validation
- Execution with permission checks
- Result display with transaction details

## Default Admin User

System initializes with a default super admin:
- **Address**: `0x0000000000000000000000000000000000000000000000000000000000000000`
- **Role**: `super_admin`
- **Permissions**: All 8 permissions enabled

## Future Enhancements

1. **Persistence**: Store admin users in backend/blockchain
2. **Wallet Integration**: Connect to Sui wallet for transaction signing
3. **Audit Logging**: Log all admin actions with timestamps
4. **Role Templates**: Predefined role configurations
5. **API Integration**: Connect to smart contract deployment APIs
6. **Multi-sig**: Require multiple admins for sensitive operations
7. **Timelock**: Delay execution of critical functions
8. **Event Tracking**: Monitor ecosystem-wide admin activities

## Files Modified

- `src/components/AdminDashboard.tsx` - NEW
- `src/components/RoleUpgradePanel.tsx` - NEW
- `src/components/SmartContractExecutor.tsx` - NEW
- `src/hooks/useAdminStore.ts` - NEW
- `src/services/contractScanner.ts` - NEW
- `src/types/admin.ts` - NEW
- `src/Dashboard.tsx` - Updated with AdminDashboard integration
- `src/components/DashboardNav.tsx` - Updated with RBAC Dashboard tab

## Testing the System

1. **Access Admin Dashboard**: Navigate to the dashboard as an admin user
2. **View RBAC Tab**: Click on "RBAC Dashboard" tab
3. **Check Permissions**: View permission matrix on the Permissions tab
4. **Test Role Upgrade**: Try accessing admin features as a non-admin user
5. **Execute Functions**: Select and execute smart contract functions

## API Reference

### useAdminStore

```typescript
const {
  currentUser,
  adminUsers,
  setCurrentUser,
  hasPermission,
  isAdmin,
  isSuperAdmin,
  addAdminUser,
  removeAdminUser,
  updateUserRole,
  getAllAdminUsers,
  getAdminUserByAddress,
  initializeDefaultAdmin,
} = useAdminStore();
```

### AdminDashboard Props

```typescript
interface AdminDashboardProps {
  contractFunctions?: SmartContractFunction[];
}
```

### SmartContractExecutor Props

```typescript
interface FunctionExecutorProps {
  functions: SmartContractFunction[];
}
```

## Debugging

Enable verbose logging by checking browser console for:
- Admin store state changes
- Permission checks
- Function execution attempts
- Admin user management operations

## Security Considerations

1. **Client-Side Restrictions**: Current implementation is client-side only. Always validate permissions on the backend/contract.
2. **Private Keys**: Never transmit or store private keys in admin store.
3. **Auditing**: Log all admin actions for compliance.
4. **Rate Limiting**: Implement on backend to prevent abuse.
5. **Wallet Verification**: Verify user ownership of wallet address.

## Contributing

When extending the admin system:
1. Update type definitions in `src/types/admin.ts`
2. Add new methods to `useAdminStore.ts`
3. Create corresponding UI components with Crozz Coin theme
4. Update permission matrix in this documentation
5. Add integration tests for permission checks

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
