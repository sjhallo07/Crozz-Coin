# Service Marketplace - Crozz Ecosystem

## Overview

The Service Marketplace is a comprehensive DApp that enables the Crozz ecosystem to offer Function-as-a-Service (FaaS) capabilities. Service providers can register both free and paid services, while users can browse and access these services through a user-friendly interface.

## Architecture

### Smart Contract Layer

**Location**: `/sui-stack-hello-world/move/service-marketplace/`

The marketplace is powered by a Move smart contract that provides:

1. **Service Registration**: Admins can register new services with custom pricing
2. **Access Control**: Only admin capability holders can manage services
3. **Payment Processing**: Automated payment collection for paid services
4. **Revenue Management**: Secure revenue withdrawal for admins
5. **Usage Tracking**: Real-time statistics on service usage and revenue

### Key Components

#### Move Contract (`marketplace.move`)

```move
module service_marketplace::marketplace;
```

**Main Structures:**

- `AdminCap`: Capability NFT for administrative operations
- `Marketplace`: Shared object containing all services and revenue
- `Service`: Individual service with pricing and statistics

**Core Functions:**

- `register_service()`: Register a new service (admin only)
- `access_free_service()`: Access a free service
- `access_paid_service()`: Access a paid service with payment
- `update_service_status()`: Enable/disable services
- `withdraw_revenue()`: Withdraw collected revenue (admin only)

### Frontend Layer

**Location**: `/sui-stack-hello-world/ui/src/components/ServiceMarketplace.tsx`

The frontend provides:

1. **Service Browser**: View all available services with details
2. **Service Dashboard**: Track personal usage and spending
3. **Admin Panel**: Register and manage services
4. **Payment Integration**: Seamless on-chain payment processing
5. **Secondary Window**: Information panel for help and guidance

## Features

### For Service Users

#### Browse Services
- View all available services organized by category
- See service descriptions, pricing, and usage statistics
- Filter between free and paid services
- Access services with one click

#### Dashboard
- Track total services used
- View spending history
- See favorite service categories
- Review recent activity

#### Payment Options
- **Free Services**: Instant access with no payment
- **Paid Services**: Pay in SUI tokens automatically deducted from wallet

### For Service Administrators

#### Service Registration
- Register new services with custom names and descriptions
- Set pricing (0 for free services)
- Categorize services (compute, storage, api, analytics, other)

#### Service Management
- Enable/disable services
- Update pricing
- Track usage statistics
- Monitor revenue per service

#### Revenue Management
- View total marketplace revenue
- Withdraw collected funds
- Track revenue by service

## Usage Guide

### For Users

1. **Connect Wallet**
   - Click "Connect" button in the top navigation
   - Select your Sui wallet (Sui Wallet, Ethos, etc.)
   - Ensure you're on Sui Testnet

2. **Browse Services**
   - Navigate to the "Service Marketplace" section
   - Browse available services
   - Read service descriptions and pricing

3. **Access a Service**
   - Click "Access" button on desired service
   - Review the confirmation dialog
   - For paid services, confirm payment amount
   - Click "Confirm Access" to execute transaction
   - Approve transaction in your wallet

4. **View Dashboard**
   - Switch to "My Dashboard" tab
   - View usage statistics and recent activity

### For Administrators

1. **Register a Service**
   - Click "Register Service" button
   - Fill in service details:
     - Service name
     - Description
     - Price (0 for free)
   - Click "Register Service"
   - Approve transaction (requires AdminCap NFT)

2. **Manage Services**
   - View service statistics in the marketplace
   - Update service status as needed
   - Monitor usage and revenue

3. **Withdraw Revenue**
   - Access admin dashboard
   - View total revenue
   - Initiate withdrawal transaction
   - Funds transferred to admin address

## Deployment Instructions

### Prerequisites

- Sui CLI installed and configured
- Testnet wallet with SUI tokens
- Node.js and pnpm installed
- AdminCap NFT (for service registration)

### Smart Contract Deployment

```bash
# Navigate to the Move package
cd sui-stack-hello-world/move/service-marketplace

# Build the package
sui move build

# Publish to testnet
sui client publish --gas-budget 100000000

# Save the Package ID and Marketplace Object ID
```

### Frontend Configuration

1. **Update Environment Variables**

Create or update `.env` file in `sui-stack-hello-world/ui/`:

```env
VITE_MARKETPLACE_PACKAGE_ID=0xYOUR_PACKAGE_ID
VITE_MARKETPLACE_OBJECT_ID=0xYOUR_MARKETPLACE_ID
VITE_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID  # For admins only
```

2. **Install Dependencies**

```bash
cd sui-stack-hello-world/ui
pnpm install --ignore-workspace
```

3. **Run Development Server**

```bash
pnpm dev
```

4. **Build for Production**

```bash
pnpm build
```

### Deployment to Production

#### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd sui-stack-hello-world/ui
vercel
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd sui-stack-hello-world/ui
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages

```bash
# Build with correct base path
pnpm build --base=/Crozz-Coin/

# Copy to docs directory
cp -r dist/* ../../docs/marketplace/
```

## API Reference

### Move Contract Functions

#### Public Entry Functions

##### register_service
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

Registers a new service. Requires AdminCap.

**Parameters:**
- `admin_cap`: Admin capability NFT
- `marketplace`: Marketplace shared object
- `name`: Service name
- `description`: Service description
- `price`: Price in MIST (1 SUI = 1,000,000,000 MIST)

##### access_free_service
```move
public fun access_free_service(
    marketplace: &mut Marketplace,
    service_id: u64,
    ctx: &mut TxContext,
)
```

Access a free service (price must be 0).

**Parameters:**
- `marketplace`: Marketplace shared object
- `service_id`: ID of the service to access

##### access_paid_service
```move
public fun access_paid_service(
    marketplace: &mut Marketplace,
    service_id: u64,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
)
```

Access a paid service with payment.

**Parameters:**
- `marketplace`: Marketplace shared object
- `service_id`: ID of the service to access
- `payment`: Coin object with sufficient balance

##### withdraw_revenue
```move
public fun withdraw_revenue(
    _admin_cap: &AdminCap,
    marketplace: &mut Marketplace,
    amount: u64,
    ctx: &mut TxContext,
)
```

Withdraw revenue from marketplace. Requires AdminCap.

**Parameters:**
- `admin_cap`: Admin capability NFT
- `marketplace`: Marketplace shared object
- `amount`: Amount to withdraw in MIST

#### View Functions

##### get_service_price
```move
public fun get_service_price(marketplace: &Marketplace, service_id: u64): u64
```

Returns the price of a service in MIST.

##### get_service_usage
```move
public fun get_service_usage(marketplace: &Marketplace, service_id: u64): u64
```

Returns the usage count of a service.

##### get_total_revenue
```move
public fun get_total_revenue(marketplace: &Marketplace): u64
```

Returns the total marketplace revenue in MIST.

### Events

#### ServiceRegistered
```move
public struct ServiceRegistered has copy, drop {
    service_id: u64,
    name: String,
    price: u64,
}
```

Emitted when a new service is registered.

#### ServiceAccessed
```move
public struct ServiceAccessed has copy, drop {
    service_id: u64,
    user: address,
    amount_paid: u64,
}
```

Emitted when a user accesses a service.

#### RevenueWithdrawn
```move
public struct RevenueWithdrawn has copy, drop {
    amount: u64,
    recipient: address,
}
```

Emitted when revenue is withdrawn.

## UI Components Reference

### ServiceMarketplace Component

Main component providing the marketplace interface.

**Props:** None (uses hooks for state management)

**Features:**
- Service browsing with category filters
- Service access with payment handling
- User dashboard for tracking
- Admin service registration
- Secondary information window

### SecondaryWindow Component

Information panel for contextual help.

**Props:**
```typescript
interface SecondaryWindowProps {
  panels: InfoPanel[];
  position?: "right" | "bottom";
  defaultOpen?: boolean;
}
```

## Security Considerations

1. **Admin Capability**: Only holders of AdminCap NFT can register services and withdraw revenue
2. **Payment Validation**: Contract validates payment amounts match service pricing
3. **Service Status**: Inactive services cannot be accessed
4. **Revenue Protection**: Revenue can only be withdrawn by admin with proper capability
5. **Transaction Safety**: All operations use Sui's safe transaction model

## Best Practices

### For Service Providers

1. **Clear Descriptions**: Write detailed service descriptions
2. **Fair Pricing**: Set reasonable prices for services
3. **Active Maintenance**: Keep services active and functional
4. **Revenue Management**: Regularly withdraw revenue to secure wallet

### For Users

1. **Verify Services**: Read descriptions before accessing
2. **Check Pricing**: Confirm payment amounts before transactions
3. **Wallet Security**: Use secure wallet practices
4. **Track Spending**: Monitor usage through dashboard

## Troubleshooting

### Common Issues

#### Transaction Failed
- **Cause**: Insufficient SUI balance
- **Solution**: Add funds from faucet or exchange

#### Service Not Found
- **Cause**: Invalid service ID or service not yet registered
- **Solution**: Refresh page and verify service exists

#### Admin Functions Not Available
- **Cause**: Missing AdminCap NFT
- **Solution**: Obtain AdminCap from marketplace deployer

#### Payment Not Processing
- **Cause**: Incorrect payment amount or wallet not connected
- **Solution**: Verify wallet connection and sufficient balance

## Future Enhancements

### Planned Features

1. **Service Categories**: Enhanced categorization and filtering
2. **Reviews & Ratings**: User feedback system
3. **Subscription Model**: Recurring payment services
4. **Service Bundles**: Package deals for multiple services
5. **Analytics Dashboard**: Advanced metrics for admins
6. **API Integration**: External service integration
7. **Multi-Token Support**: Accept other tokens besides SUI

### Community Contributions

We welcome contributions! Areas for improvement:

- Additional service categories
- Enhanced UI/UX
- Mobile responsiveness
- Internationalization
- Testing infrastructure
- Documentation improvements

## Support & Resources

- **Documentation**: This guide and inline code comments
- **Repository**: https://github.com/sjhallo07/Crozz-Coin
- **Sui Documentation**: https://docs.sui.io
- **Discord**: Join Crozz community for support

## License

Apache-2.0 License - See LICENSE file for details

---

**Version**: 1.0  
**Last Updated**: December 11, 2025  
**Status**: Production Ready
