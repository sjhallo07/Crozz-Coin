# Greeting Module Dashboard

A comprehensive admin and user management system for the Sui greeting smart contract module.

## Features

### 🎯 Dashboard Overview

- Real-time role-based access control
- Beautiful, responsive UI using Radix UI
- Wallet connection and management
- Multi-role support (Admin, User, Guest)

### 👥 Role-Based Access

#### Admin Panel

Admins have full control over the greeting module:

- Create new greeting objects
- Update greeting text on any object
- Transfer ownership to other addresses
- Manage admin accounts
- Configure smart contract settings
- View all greetings and metadata

#### User Panel

Users can:

- Create their own greeting objects
- Update their own greetings (owner-only)
- View all public greetings on the network
- Transfer ownership of their greetings
- Track update history and metadata

#### Guest

- View wallet connection prompt
- Connect wallet to access dashboard

### ⚙️ Configuration Management

- Text length limits (max 280 characters by default)
- Event tracking toggles
- Ownership transfer controls
- Public update permissions
- Update count limits

## Smart Contract Integration

### Available Functions

The dashboard integrates with these smart contract functions:

```move
// Creation
public fun new() -> Greeting

// Updates
public fun update_text(greeting: &mut Greeting, new_text: String)
public fun update_text_owner_only(greeting: &mut Greeting, new_text: String)

// Ownership
public fun transfer_ownership(greeting: &mut Greeting, new_owner: address)

// Readers
public fun text(greeting: &Greeting) -> String
public fun owner(greeting: &Greeting) -> address
public fun created_at(greeting: &Greeting) -> u64
public fun update_count(greeting: &Greeting) -> u64
```

### Events

The module emits three types of events:

1. **GreetingCreated** - When a new greeting is created

   ```
   {
     greeting_id: ID,
     owner: address,
     text: String,
     timestamp: u64
   }
   ```

2. **GreetingUpdated** - When greeting is updated

   ```
   {
     greeting_id: ID,
     old_text: String,
     new_text: String,
     updated_by: address,
     update_count: u64,
     timestamp: u64
   }
   ```

3. **OwnershipTransferred** - When ownership changes

   ```
   {
     greeting_id: ID,
     old_owner: address,
     new_owner: address,
     timestamp: u64
   }
   ```

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm or npm
- Sui Testnet wallet (WalletKit, Suiet, etc.)
- Testnet SUI tokens for gas fees

### Installation

1. Navigate to the UI directory:

```bash
cd sui-stack-hello-world/ui
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your network configuration
```

4. Start the development server:

```bash
pnpm dev
# or
npm run dev
```

5. Open <http://localhost:5173> in your browser

### Configuration

The dashboard uses these key configuration files:

**`src/constants.ts`** - Network and package IDs:

```typescript
export const TESTNET_HELLO_WORLD_PACKAGE_ID = "0x..."; // Your package ID
export const TESTNET_HELLO_WORLD_CLOCK_ID = "0x...";
```

**`src/networkConfig.ts`** - Network settings:

```typescript
const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
```

## Component Structure

```
Dashboard.tsx (Main container)
├── WalletConnectSection (Connection prompt)
├── Dashboard (Main UI)
│   ├── Header (Navigation & role display)
│   ├── Sidebar (Navigation menu)
│   └── Main Content Area
│       ├── Overview Tab
│       ├── User Panel (if user/admin)
│       │   ├── Create Greeting
│       │   ├── Your Greetings
│       │   └── All Greetings
│       ├── Admin Panel (if admin)
│       │   ├── Create Greeting
│       │   ├── Update Greeting
│       │   ├── Transfer Ownership
│       │   └── Admin Management
│       ├── Config Manager (if admin)
│       │   ├── Text Length Settings
│       │   ├── Event Tracking
│       │   ├── Ownership Transfer
│       │   ├── Public Updates
│       │   └── Update Count Limits
│       └── Admin Management (if admin)
│           └── Admin Address Management
├── Supporting Components
│   ├── RoleSelector
│   ├── DashboardNav
│   └── Utility Components
└── Hooks
    └── useQueryAllGreetings

```

## Usage Examples

### As an Admin

1. **Create a new greeting:**
   - Navigate to Admin Panel → Create New Greeting
   - Enter greeting text (max 280 chars)
   - Click "Create Greeting"

2. **Update any greeting:**
   - Select greeting from the list
   - Click "Update" button
   - Enter new text and confirm

3. **Transfer ownership:**
   - Navigate to Transfer Ownership section
   - Enter greeting ID
   - Enter new owner's address
   - Confirm transaction

4. **Manage admins:**
   - Go to Admin Management tab
   - Add admin addresses
   - Remove existing admins

### As a User

1. **Create your greeting:**
   - Navigate to User Panel
   - Enter your greeting text
   - Click "Create Greeting"

2. **Update your greeting:**
   - Find your greeting in "Your Greetings" section
   - Click "Edit" button
   - Update text and save

3. **View all greetings:**
   - See "All Greetings" section
   - Filter by owner if needed

## Advanced Features

### Admin Management

- Add multiple admin addresses
- Remove admin access
- Admin addresses stored in localStorage
- Persistent across sessions

### Event Tracking

- All actions emit blockchain events
- Enable/disable event tracking via config
- Events indexed for off-chain analytics

### Configuration Persistence

- Settings stored in localStorage
- Synchronize with blockchain when needed
- Reset to defaults option available

## Deployment

### Testnet Deployment

1. Deploy the smart contract:

```bash
cd sui-stack-hello-world/move/hello-world
sui client publish --gas-budget 100000000
```

2. Update package ID in `src/constants.ts`

3. Deploy the UI:

```bash
pnpm build
# Outputs to dist/ directory
```

4. Deploy to hosting (Vercel, Netlify, etc.):

```bash
# Using Vercel
vercel deploy
```

## Security Considerations

- **Owner-only updates**: `update_text_owner_only()` restricts updates to the object owner
- **Length validation**: 280 character limit prevents spam and excessive gas usage
- **Event audit trail**: All changes are tracked via events
- **Admin whitelist**: Only designated addresses can perform admin functions
- **Testnet only**: Currently configured for Sui Testnet (use caution with mainnet)

## Troubleshooting

### Wallet Connection Issues

- Ensure wallet is installed and unlocked
- Verify you're on Sui Testnet
- Check wallet supports current dApp Kit version

### Transaction Failures

- Check you have sufficient gas (SUI tokens)
- Verify the greeting ID is valid
- Ensure you have necessary permissions

### UI Not Loading

- Clear browser cache
- Check console for errors
- Verify all dependencies installed: `pnpm install`

### Greetings Not Appearing

- Refresh the page
- Check network configuration
- Verify package ID is correct
- Use GraphQL explorer to query objects directly

## API Reference

### useQueryAllGreetings Hook

```typescript
const { allGreetings, isLoading, error } = useQueryAllGreetings();

// Returns:
{
  allGreetings: GreetingObject[];
  isLoading: boolean;
  error: Error | null;
}

// GreetingObject interface:
{
  objectId: string;
  text: string;
  owner: string;
  created_at: number;
  updated_count: number;
}
```

## Development

### Running Tests

```bash
cd sui-stack-hello-world/move/hello-world
sui move test
```

### Building Move Module

```bash
cd sui-stack-hello-world/move/hello-world
sui move build
```

### Linting

```bash
cd sui-stack-hello-world/ui
pnpm lint
```

## Architecture

### State Management

- React hooks for component state
- localStorage for persistent settings
- Context API for GraphQL provider
- useQuery for remote data fetching

### Blockchain Integration

- @mysten/dapp-kit for wallet connection
- @mysten/sui for transaction building
- Programmable Transaction Blocks (PTB) for multi-step operations

### UI Framework

- Radix UI themes for components
- React Router (optional) for navigation
- Lucide icons for visual elements

## Contributing

To contribute to the dashboard:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under Apache 2.0 License.

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the Sui documentation
3. Check GitHub issues
4. Ask in the Sui community Discord

## Resources

- [Sui Documentation](https://docs.sui.io)
- [dApp Kit Documentation](https://sdk.mysten.dev/dapp-kit)
- [Radix UI](https://radix-ui.com)
- [Sui Testnet Faucet](https://faucet.sui.io)
