# Crozz Coin DApp Architecture Documentation

**Version**: 2.0  
**Date**: December 11, 2025  
**Status**: Production Ready  
**Network**: Sui Testnet/Mainnet

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Components Overview](#components-overview)
4. [Service Marketplace](#service-marketplace)
5. [Dashboard System](#dashboard-system)
6. [UI/UX Design](#uiux-design)
7. [Integration Guide](#integration-guide)
8. [Deployment Guide](#deployment-guide)
9. [Security & Best Practices](#security--best-practices)
10. [API Reference](#api-reference)

---

## Executive Summary

The Crozz Coin DApp ecosystem is a comprehensive, production-ready decentralized application platform built on the Sui blockchain. It provides:

- **Service Marketplace**: Function-as-a-Service (FaaS) platform with payment processing
- **Multi-Dashboard System**: User and admin analytics dashboards
- **Enhanced UI/UX**: Modern, organized interface with secondary information windows
- **Payment Integration**: Seamless on-chain payments for services
- **Complete Documentation**: Comprehensive guides for developers and users

### Key Features

✅ **Service Registration**: Admins can register free and paid services  
✅ **Payment Processing**: Automated SUI token payment handling  
✅ **Dashboard Analytics**: Real-time usage and revenue tracking  
✅ **User Experience**: Intuitive interface with contextual help  
✅ **Admin Controls**: Full service management capabilities  
✅ **Security**: On-chain validation and capability-based access control  

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CROZZ ECOSYSTEM                              │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────┐  │
│  │   Frontend   │    │  Blockchain  │    │   Backend       │  │
│  │   (React)    │◄──►│     (Sui)    │◄──►│  (Indexer)      │  │
│  └──────────────┘    └──────────────┘    └─────────────────┘  │
│         │                    │                      │            │
│         │                    │                      │            │
│  ┌──────▼──────┐    ┌───────▼────────┐    ┌───────▼───────┐  │
│  │  UI Layer   │    │ Smart Contracts │    │   GraphQL     │  │
│  │  - Service  │    │  - Marketplace  │    │   - Queries   │  │
│  │  - Dashboard│    │  - Payment      │    │   - Events    │  │
│  │  - Wallet   │    │  - Admin        │    │   - Indexing  │  │
│  └─────────────┘    └─────────────────┘    └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19.2.1
- **TypeScript**: 5.9.3
- **Build Tool**: Vite 7.2.7
- **UI Library**: Radix UI Themes
- **State Management**: React Hooks + TanStack Query
- **Blockchain SDK**: @mysten/dapp-kit 0.19.11, @mysten/sui 1.45.2

#### Smart Contracts
- **Language**: Move
- **Platform**: Sui Blockchain
- **Framework**: Sui Framework (testnet branch)

#### Backend Infrastructure
- **Indexer**: Sui GraphQL Indexer
- **Database**: PostgreSQL (for indexing)
- **RPC**: Sui Full Node RPC

---

## Components Overview

### 1. Service Marketplace Component

**Location**: `/sui-stack-hello-world/ui/src/components/ServiceMarketplace.tsx`

The core component enabling Function-as-a-Service capabilities.

#### Features
- Browse services by category
- View service details (name, description, price, usage)
- Access free and paid services
- User dashboard for tracking usage
- Admin panel for service registration
- Secondary information window for contextual help

#### Key Functions
```typescript
handleAccessService(service: Service): void
handleConfirmAccess(): void
handleRegisterService(): void
```

#### State Management
```typescript
const [services, setServices] = useState<Service[]>()
const [selectedService, setSelectedService] = useState<Service | null>()
const [activeTab, setActiveTab] = useState<"marketplace" | "dashboard">()
```

### 2. Marketplace Dashboard Component

**Location**: `/sui-stack-hello-world/ui/src/components/MarketplaceDashboard.tsx`

Enhanced analytics dashboard for users and administrators.

#### User View Features
- Total services used counter
- Total spending tracker
- Favorite category identification
- Recent activity log
- Usage breakdown by category
- Monthly spending analysis

#### Admin View Features
- Total revenue overview
- Service performance metrics
- Top performing services ranking
- Revenue breakdown by service
- Withdrawal interface
- Service management tools

#### Analytics Capabilities
```typescript
// User Analytics
- Service usage tracking
- Spending patterns
- Category preferences
- Activity history

// Admin Analytics
- Revenue tracking
- Usage statistics
- Service performance
- Trend analysis
```

### 3. Secondary Window Component

**Location**: `/sui-stack-hello-world/ui/src/components/SecondaryWindow.tsx`

Contextual information panel that provides help without cluttering the main interface.

#### Features
- Collapsible information panels
- Multiple panel types (info, warning, success, tip)
- Flexible positioning (right sidebar or bottom panel)
- Expandable content
- Notification counter

#### Usage
```typescript
<SecondaryWindow 
  panels={infoPanels}
  position="bottom"
  defaultOpen={false}
/>
```

### 4. Smart Contract - Service Marketplace

**Location**: `/sui-stack-hello-world/move/service-marketplace/sources/marketplace.move`

Core blockchain logic for the marketplace.

#### Key Structures
```move
public struct AdminCap has key, store
public struct Service has store
public struct Marketplace has key
```

#### Core Functions
```move
register_service()      // Register new service
access_free_service()   // Access free service
access_paid_service()   // Access paid service with payment
update_service_status() // Enable/disable service
withdraw_revenue()      // Withdraw marketplace revenue
```

---

## Service Marketplace

### Service Registration Flow

```
Admin Action → Connect Wallet → Click "Register Service"
     ↓
Fill Service Form:
- Service Name
- Description
- Price (0 for free)
- Category
     ↓
Submit Transaction → Sign with AdminCap → On-Chain Registration
     ↓
Service Available in Marketplace
```

### Service Access Flow

```
User Action → Browse Services → Select Service → Click "Access"
     ↓
Review Details:
- Service name & description
- Price (if applicable)
- Payment confirmation
     ↓
Confirm Access → Sign Transaction → Execute on-chain
     ↓
Service Accessed → Usage Tracked → Dashboard Updated
```

### Payment Processing

#### Free Services
1. User clicks "Access" on free service
2. Transaction calls `access_free_service()`
3. No payment required
4. Usage count incremented
5. Event emitted

#### Paid Services
1. User clicks "Access" on paid service
2. Review payment amount
3. Transaction splits gas coin for payment
4. Calls `access_paid_service()` with payment coin
5. Payment added to marketplace revenue
6. Usage and revenue tracked
7. Event emitted

---

## Dashboard System

### User Dashboard

#### Overview Tab
- **Total Services Used**: Lifetime count of service accesses
- **Total Spent**: Cumulative SUI spent on services
- **Favorite Category**: Most frequently used service category
- **Usage Breakdown**: Visual breakdown by category (60% Compute, 25% Analytics, 15% API)

#### Activity Tab
- **Recent Activity**: List of recent service accesses
- **Service Names**: Names of accessed services
- **Timestamps**: Time since access
- **Status**: Success/Pending/Failed indicators
- **Amounts**: Payment amounts (or "FREE")

#### Spending Tab
- **Monthly Spending**: Current month, last month, average
- **Most Used Services**: Top 3 services by usage count
- **Spending Trends**: Historical spending patterns

### Admin Dashboard

#### Overview Tab
- **Total Revenue**: Cumulative marketplace earnings
- **Total Usage**: Sum of all service usage counts
- **Active Services**: Number of active services
- **Top Performers**: Top 3 services by usage

#### Services Tab
- **Service List**: All registered services
- **Service Details**: Name, ID, category, usage, revenue
- **Trend Indicators**: Up/Down/Stable arrows
- **Status Management**: Enable/Disable controls

#### Revenue Tab
- **Revenue Breakdown**: Revenue per service
- **Total Calculation**: Sum of all service revenues
- **Withdrawal Interface**: Button to withdraw available balance
- **Admin Address**: Destination for withdrawn funds

---

## UI/UX Design

### Design Principles

1. **Clarity**: Clear information hierarchy and intuitive navigation
2. **Consistency**: Unified design language across all components
3. **Responsiveness**: Adapts to different screen sizes
4. **Accessibility**: WCAG 2.1 Level AA compliance
5. **Performance**: Optimized loading and rendering

### Color Scheme

Based on the CROZZ branding:

```css
Primary: Indigo (#4f46e5)
Secondary: Cyan (#06b6d4)
Accent: Amber (#f59e0b)
Background: Dark theme with gray tones
```

### Component Layout

#### Service Cards
```
┌─────────────────────────────────────┐
│ Service Name          Category Badge │
│ Price Badge                          │
│                                      │
│ Description text...                  │
│                                      │
│ 📊 123 uses  💰 12.3 SUI  ✅ Active  │
│                         [Access Btn] │
└─────────────────────────────────────┘
```

#### Dashboard Cards
```
┌─────────────────────────────────────┐
│ Icon  Metric Name                    │
│                                      │
│ 123                                  │
│ Large Number                         │
│                                      │
│ Badge: Context                       │
└─────────────────────────────────────┘
```

### Secondary Window

Positioned at the bottom of the screen, collapsible, containing multiple information panels:

```
┌─────────────────────────────────────┐
│ Information Panel        [-][x]      │
├─────────────────────────────────────┤
│ 🎯 Welcome to Service Marketplace    │
│ ⚙️ Admin Features                    │
│ 🔒 Secure Payments                   │
│                                      │
│ 3 notifications • Click to expand    │
└─────────────────────────────────────┘
```

---

## Integration Guide

### Prerequisites

1. **Sui Wallet**: Install Sui Wallet, Ethos, or compatible wallet
2. **Testnet Tokens**: Get SUI from https://faucet.sui.io
3. **Node.js**: Version 18 or higher
4. **pnpm**: Package manager

### Frontend Integration

#### Step 1: Install Dependencies

```bash
cd sui-stack-hello-world/ui
pnpm install --ignore-workspace
```

#### Step 2: Configure Environment

Create `.env` file:

```env
VITE_MARKETPLACE_PACKAGE_ID=0xYOUR_PACKAGE_ID
VITE_MARKETPLACE_OBJECT_ID=0xYOUR_MARKETPLACE_ID
VITE_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID
```

#### Step 3: Import Components

```typescript
import { ServiceMarketplace } from "./components/ServiceMarketplace";
import { MarketplaceDashboard } from "./components/MarketplaceDashboard";

function App() {
  return (
    <>
      <ServiceMarketplace />
      <MarketplaceDashboard />
    </>
  );
}
```

### Smart Contract Integration

#### Step 1: Build Move Package

```bash
cd sui-stack-hello-world/move/service-marketplace
sui move build
```

#### Step 2: Publish to Testnet

```bash
sui client publish --gas-budget 100000000
```

#### Step 3: Save Object IDs

From the publish output, save:
- Package ID
- Marketplace Object ID
- AdminCap Object ID

#### Step 4: Update Frontend Config

Update `.env` with the saved IDs.

### Transaction Integration

#### Registering a Service

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::marketplace::register_service`,
  arguments: [
    tx.object(ADMIN_CAP_ID),
    tx.object(MARKETPLACE_ID),
    tx.pure.string(name),
    tx.pure.string(description),
    tx.pure.u64(price * 1_000_000_000), // SUI to MIST
  ],
});

await signAndExecuteTransaction({ transaction: tx });
```

#### Accessing a Paid Service

```typescript
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [price * 1_000_000_000]);
tx.moveCall({
  target: `${PACKAGE_ID}::marketplace::access_paid_service`,
  arguments: [
    tx.object(MARKETPLACE_ID),
    tx.pure.u64(serviceId),
    coin,
  ],
});

await signAndExecuteTransaction({ transaction: tx });
```

---

## Deployment Guide

### Local Development

```bash
# Start development server
cd sui-stack-hello-world/ui
pnpm dev

# Access at http://localhost:5173
```

### Production Build

```bash
# Build optimized bundle
pnpm build

# Preview production build
pnpm preview
```

### Deployment Options

#### 1. Vercel

```bash
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### 2. Netlify

```bash
netlify deploy --prod --dir=dist
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "pnpm build"
  publish = "dist"
```

#### 3. GitHub Pages

```bash
# Build with base path
pnpm build --base=/Crozz-Coin/

# Deploy to docs
cp -r dist/* ../../docs/marketplace/
git add docs/marketplace
git commit -m "Deploy marketplace"
git push
```

#### 4. Cloudflare Pages

```bash
# Install Wrangler
npm i -g wrangler

# Deploy
wrangler pages deploy dist
```

### Smart Contract Deployment

#### Testnet

```bash
sui client publish --gas-budget 100000000
```

#### Mainnet

```bash
sui client switch --env mainnet
sui client publish --gas-budget 100000000 --verify
```

---

## Security & Best Practices

### Smart Contract Security

1. **Capability-Based Access**
   - AdminCap required for privileged operations
   - Only one AdminCap minted per marketplace
   - Transfer AdminCap securely

2. **Payment Validation**
   - Price verification before service access
   - Sufficient payment enforcement
   - No partial payments allowed

3. **Service Status**
   - Inactive services cannot be accessed
   - Admin can disable compromised services
   - Status checked before every access

4. **Revenue Protection**
   - Revenue stored in marketplace balance
   - Only admin can withdraw
   - Withdrawal requires AdminCap

### Frontend Security

1. **Wallet Integration**
   - Use official wallet adapters
   - Validate wallet connections
   - Handle disconnections gracefully

2. **Transaction Safety**
   - Display transaction details before signing
   - Validate input parameters
   - Handle transaction failures

3. **Data Validation**
   - Validate all user inputs
   - Sanitize displayed data
   - Prevent XSS attacks

4. **API Security**
   - Use HTTPS for all requests
   - Validate RPC responses
   - Rate limit API calls

### Best Practices

#### For Developers

1. **Code Quality**
   - Follow TypeScript best practices
   - Use ESLint and Prettier
   - Write comprehensive tests
   - Document code thoroughly

2. **Error Handling**
   - Catch and log all errors
   - Display user-friendly messages
   - Implement retry logic
   - Monitor error rates

3. **Performance**
   - Lazy load components
   - Optimize images and assets
   - Use code splitting
   - Cache static resources

4. **Testing**
   - Unit test components
   - Integration test flows
   - Test on multiple networks
   - Security audit contracts

#### For Users

1. **Wallet Security**
   - Use hardware wallets for large amounts
   - Keep seed phrases secure
   - Verify transaction details
   - Don't share private keys

2. **Service Usage**
   - Read service descriptions
   - Verify pricing before access
   - Track spending through dashboard
   - Report suspicious services

3. **Payment Safety**
   - Confirm payment amounts
   - Check wallet balance
   - Wait for transaction confirmation
   - Keep transaction records

---

## API Reference

### React Components

#### ServiceMarketplace

```typescript
function ServiceMarketplace(): JSX.Element
```

Main marketplace component with service browsing and access.

**Features:**
- Service catalog
- Category filtering
- Service access with payment
- User dashboard
- Admin registration panel
- Information window

**State:**
```typescript
const [services, setServices] = useState<Service[]>()
const [selectedService, setSelectedService] = useState<Service | null>()
const [activeTab, setActiveTab] = useState<"marketplace" | "dashboard">()
```

#### MarketplaceDashboard

```typescript
function MarketplaceDashboard(): JSX.Element
```

Analytics dashboard with user and admin views.

**Props:** None

**Features:**
- User statistics
- Admin analytics
- Revenue tracking
- Service performance
- Withdrawal interface

**State:**
```typescript
const [activeView, setActiveView] = useState<"user" | "admin">()
```

#### SecondaryWindow

```typescript
interface SecondaryWindowProps {
  panels: InfoPanel[];
  position?: "right" | "bottom";
  defaultOpen?: boolean;
}

function SecondaryWindow(props: SecondaryWindowProps): JSX.Element
```

Contextual information panel.

**Props:**
- `panels`: Array of information panels
- `position`: Window position (default: "bottom")
- `defaultOpen`: Initial open state (default: false)

### Move Functions

#### register_service

```move
public fun register_service(
    _admin_cap: &AdminCap,
    marketplace: &mut Marketplace,
    name: String,
    description: String,
    price: u64,
    ctx: &mut TxContext,
)
```

Register a new service. Requires AdminCap.

#### access_free_service

```move
public fun access_free_service(
    marketplace: &mut Marketplace,
    service_id: u64,
    ctx: &mut TxContext,
)
```

Access a free service (price must be 0).

#### access_paid_service

```move
public fun access_paid_service(
    marketplace: &mut Marketplace,
    service_id: u64,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
)
```

Access a paid service with SUI payment.

#### withdraw_revenue

```move
public fun withdraw_revenue(
    _admin_cap: &AdminCap,
    marketplace: &mut Marketplace,
    amount: u64,
    ctx: &mut TxContext,
)
```

Withdraw revenue from marketplace. Requires AdminCap.

### Events

#### ServiceRegistered

```move
public struct ServiceRegistered has copy, drop {
    service_id: u64,
    name: String,
    price: u64,
}
```

#### ServiceAccessed

```move
public struct ServiceAccessed has copy, drop {
    service_id: u64,
    user: address,
    amount_paid: u64,
}
```

#### RevenueWithdrawn

```move
public struct RevenueWithdrawn has copy, drop {
    amount: u64,
    recipient: address,
}
```

---

## Troubleshooting

### Common Issues

#### Build Errors

**Issue**: `pnpm install` fails  
**Solution**: Run `pnpm install --ignore-workspace`

**Issue**: TypeScript errors  
**Solution**: Run `pnpm build` to see detailed errors

#### Transaction Failures

**Issue**: Transaction rejected  
**Solution**: Check wallet connection and SUI balance

**Issue**: Insufficient payment  
**Solution**: Ensure payment amount matches service price

#### UI Issues

**Issue**: Components not rendering  
**Solution**: Check browser console for errors

**Issue**: Wallet not connecting  
**Solution**: Install/update wallet extension

### Getting Help

- **Documentation**: Read this guide and SERVICE_MARKETPLACE_GUIDE.md
- **Issues**: Report bugs on GitHub
- **Community**: Join Discord for support
- **Examples**: Check existing dApps in `/dapps` directory

---

## Appendices

### A. File Structure

```
sui-stack-hello-world/
├── move/
│   ├── service-marketplace/
│   │   ├── Move.toml
│   │   └── sources/
│   │       └── marketplace.move
│   └── hello-world/
├── ui/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ServiceMarketplace.tsx
│   │   │   ├── MarketplaceDashboard.tsx
│   │   │   └── SecondaryWindow.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.mts
└── README.md
```

### B. Environment Variables

```env
# Required
VITE_MARKETPLACE_PACKAGE_ID=0x...
VITE_MARKETPLACE_OBJECT_ID=0x...

# Optional (for admins)
VITE_ADMIN_CAP_ID=0x...
```

### C. Package Versions

```json
{
  "dependencies": {
    "@mysten/dapp-kit": "0.19.11",
    "@mysten/sui": "1.45.2",
    "@radix-ui/themes": "^3.2.1",
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  }
}
```

### D. Glossary

- **AdminCap**: Capability NFT granting administrative privileges
- **FaaS**: Function-as-a-Service
- **MIST**: Smallest unit of SUI (1 SUI = 1,000,000,000 MIST)
- **PTB**: Programmable Transaction Block
- **Shared Object**: Object accessible by multiple accounts

---

**Document Version**: 2.0  
**Last Updated**: December 11, 2025  
**Maintained By**: Crozz Ecosystem Team  
**License**: Apache-2.0
