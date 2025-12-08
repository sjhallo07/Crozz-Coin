# Sui Payment Kit Implementation

Comprehensive implementation of the **Sui Payment Kit standard** for the Crozz-Coin project, enabling secure payment processing with flexible options for duplicate prevention and receipt management.

**Reference:** https://docs.sui.io/standards/payment-kit

## Overview

The Sui Payment Kit is a battle-tested framework for standardized payment flows on Sui. It provides two payment modes, event-driven architecture, and optional persistent storage with duplicate detection.

## Implementation Status

✅ **Complete Payment Kit Integration**

### Components Implemented

1. **PaymentURIGenerator** (`ui/src/components/PaymentURIGenerator.tsx`)
   - Generate standardized transaction URIs for wallet-friendly payment links
   - Support for all required and optional parameters
   - Automatic UUID v4 generation for nonces
   - QR code ready output

2. **PaymentRegistryManager** (`ui/src/components/PaymentRegistryManager.tsx`)
   - Create payment registries with Namespace
   - Configure expiration policies and fund management
   - Withdraw accumulated funds (requires admin cap)
   - Delete expired payment records for storage cleanup

3. **EphemeralPaymentPanel** (`ui/src/components/EphemeralPaymentPanel.tsx`)
   - Process one-time payments without duplicate detection
   - Lower gas costs than registry payments
   - Returns PaymentReceipt and emits events
   - Ideal for external payment tracking

4. **RegistryPaymentPanel** (`ui/src/components/RegistryPaymentPanel.tsx`)
   - Process payments through PaymentRegistry with duplicate prevention
   - Composite PaymentKey (nonce, amount, coin type, receiver)
   - Persistent payment records for compliance
   - Optional receiver with registry-managed funds

### Supporting Documentation

- **PaymentKitInfo** (`ui/src/PaymentKitInfo.tsx`) - Already existing educational component

## Key Features

### 1. Ephemeral Payments

**Characteristics:**
- No duplicate detection
- No persistent storage (lower cost)
- Immediate fund transfer to receiver
- PaymentReceipt + events for tracking
- Lower gas costs

**Transaction Structure:**
```typescript
const receipt = tx.moveCall({
  target: "0x2::payment_kit::process_ephemeral_payment",
  typeArguments: [coinType],
  arguments: [
    tx.pure.string(nonce),
    tx.pure.u64(amount),
    tx.object(coinId),
    tx.pure.address(receiver),
    clock,
  ],
});
```

**Best For:**
- Streaming payments
- Tips and small transfers
- Applications with external duplicate prevention
- One-off transactions

### 2. Registry Payments

**Characteristics:**
- Duplicate prevention via composite PaymentKey
- Persistent payment records in registry
- Optional receiver or registry-managed funds
- PaymentReceipt + events
- Compliance and audit trails

**Transaction Structure:**
```typescript
const receipt = tx.moveCall({
  target: "0x2::payment_kit::process_registry_payment",
  typeArguments: [coinType],
  arguments: [
    tx.object(registryId),
    tx.pure.string(nonce),
    tx.pure.u64(amount),
    tx.object(coinId),
    tx.pure.option("address", receiver || null),
    clock,
  ],
});
```

**Composite PaymentKey:**
- **nonce**: Unique identifier (UUIDv4, max 36 chars)
- **payment_amount**: Coin value in native units
- **coin_type**: Full type path (e.g., 0x2::sui::SUI)
- **receiver**: Destination address

Attempting to process the same key twice triggers `EDuplicatePayment` error.

**Best For:**
- Preventing duplicate payments
- Compliance and auditing requirements
- Persistent payment history
- Fund accumulation in registry

### 3. Registry Management

**Creating a Registry:**
```typescript
const [registry, adminCap] = tx.moveCall({
  target: "0x2::payment_kit::create_registry",
  arguments: [
    tx.object(namespaceId),
    tx.pure.string(registryName),
  ],
});
```

**Configuration Options:**
- **Expiration Duration**: Epochs before PaymentRecords become deletable
- **Registry Managed Funds**: Accumulate in registry (true) or transfer to receiver (false)

**Fund Withdrawal:**
```typescript
const coins = tx.moveCall({
  target: "0x2::payment_kit::withdraw_from_registry",
  typeArguments: [coinType],
  arguments: [
    tx.object(registryId),
    tx.object(adminCapId),
  ],
});
```

**Record Cleanup:**
```typescript
tx.moveCall({
  target: "0x2::payment_kit::delete_payment_record",
  typeArguments: [coinType],
  arguments: [
    tx.object(registryId),
    tx.pure.string(nonce),
    tx.pure.u64(amount),
    tx.pure.address(receiver),
  ],
});
```

### 4. Transaction URIs

**Format:**
```
sui:<address>?amount=<u64>&coinType=<type>&nonce=<uuid>&[label=<text>][&icon=<url>][&message=<text>][&registry=<id|name>]
```

**Required Parameters:**
- `address`: Receiver destination
- `amount`: Payment in native coin units
- `coinType`: Full coin type path
- `nonce`: Unique payment identifier (max 36 chars)

**Optional Parameters:**
- `label`: Merchant/app name
- `icon`: Icon URL (wallet displays)
- `message`: Payment description
- `registry`: Registry ID or ASCII name (enables duplicate prevention)

**Examples:**

Basic SUI payment:
```
sui:0x1234567890abcdef...?amount=1000000000&coinType=0x2::sui::SUI&nonce=550e8400-e29b-41d4-a716-446655440000
```

With metadata:
```
sui:0x1234567890abcdef...?amount=1000000000&coinType=0x2::sui::SUI&nonce=550e8400-e29b-41d4-a716-446655440000&label=Coffee%20Shop&icon=https://example.com/icon.png&message=Espresso%20and%20croissant
```

Registry-based (with object ID):
```
sui:0x1234567890abcdef...?amount=1000000000&coinType=0x2::sui::SUI&nonce=550e8400-e29b-41d4-a716-446655440000&registry=0xabcdef...
```

Registry-based (with ASCII name):
```
sui:0x1234567890abcdef...?amount=1000000000&nonce=550e8400-e29b-41d4-a716-446655440000&registry=default-payment-registry
```

**Encoding:**
- All parameter values must be URL-encoded (RFC 3986)
- Special characters (spaces, colons, slashes) use percent encoding
- Examples: space = %20, colon = %3A, slash = %2F

## Structures

### PaymentReceipt
```move
public struct PaymentReceipt has key, store {
  payment_type: PaymentType,
  nonce: String,
  payment_amount: u64,
  receiver: address,
  coin_type: String,
  timestamp_ms: u64,
}
```

### PaymentRecord (Internal)
```move
public struct PaymentRecord has store {
  epoch_at_time_of_record: u64,
}
```

Used for duplicate detection; expires after configured epochs; can be deleted after expiration.

### RegistryAdminCap
```move
public struct RegistryAdminCap has key, store {
  id: UID,
  registry_id: ID,
}
```

Grants administrative control (fund withdrawal, configuration changes).

## Namespace Objects

Pre-deployed Namespace objects for registry creation:

| Network | Address |
|---------|---------|
| Testnet | `0xa5016862fdccba7cc576b56cc5a391eda6775200aaa03a6b3c97d512312878db` |
| Mainnet | `0xccd3e4c7802921991cd9ce488c4ca0b51334ba75483702744242284ccf3ae7c2` |

## Clock Object

Payment Kit functions require the Sui Clock system object:

| Network | Address |
|---------|---------|
| All | `0x6` |

## Error Conditions

| Error | Cause | Resolution |
|-------|-------|-----------|
| `EDuplicatePayment` | PaymentKey already processed in registry | Use different nonce |
| `EPaymentAmountMismatch` | Coin value ≠ expected amount | Verify coin value matches |
| `EPaymentRecordNotFound` | Record doesn't exist in registry | Verify correct registry and key |
| `EPaymentRecordNotExpired` | Attempted to delete before expiration | Wait for configured epochs |
| `EUnauthorizedAdmin` | Missing or wrong RegistryAdminCap | Verify admin cap ownership |

## UI Components Usage

### 1. Payment URI Generator

Generate wallet-friendly payment links:

1. Enter receiver address, amount, nonce
2. Select or customize coin type
3. Add optional metadata (label, icon, message)
4. Optionally specify registry for duplicate prevention
5. Click "Generate URI"
6. Share or encode as QR code

### 2. Payment Registry Manager

Manage registry lifecycle:

**Create:**
- Enter registry name and namespace
- Receive registry ID and admin cap

**Configure:**
- Set epoch expiration duration
- Enable/disable registry-managed funds

**Withdraw:**
- Withdraw accumulated funds (requires admin cap)

**Delete:**
- Clean up expired payment records
- Requires payment key from original transaction

### 3. Ephemeral Payment Panel

Process one-time payments:

1. Generate or provide nonce
2. Enter amount and receiver
3. Select coin type
4. Click "Process Ephemeral Payment"
5. Receive PaymentReceipt

### 4. Registry Payment Panel

Process registry-based payments:

1. Provide registry ID
2. Generate or provide nonce
3. Enter amount and coin object ID
4. Optionally specify receiver
5. Click "Process Registry Payment"
6. Receive PaymentReceipt with duplicate prevention

## Integration Examples

### Coffee Shop Payment Flow

**Setup:**
1. Create payment registry named "coffee-shop-payments"
2. Configure expiration duration (30 days)
3. Enable registry-managed funds

**Payment:**
1. Generate URI: `sui:0xcoffee...?amount=1000000000&nonce=<uuid>&registry=coffee-shop-payments&label=Coffee%20Shop`
2. Customer scans QR code
3. Wallet parses URI and executes RegistryPayment
4. Payment receipt confirms transaction
5. Accumulated funds withdrawn monthly

### Gaming Item Purchase

**Ephemeral Payment:**
1. Generate URI with custom coin type
2. Player initiates purchase
3. One-time transfer (no duplicate prevention needed)
4. Item awarded after PaymentReceipt confirmation

### E-Commerce with Compliance

**Registry-Based:**
1. Create registry per order
2. Process payment with order ID as nonce
3. Maintain payment history for auditing
4. Prevent accidental duplicate charges

## Best Practices

1. **Use UUIDv4 for Nonces**: Cryptographically random prevents accidental duplicates
2. **Validate URIs**: Check all parameters before sharing
3. **Test with Ephemeral First**: Lower gas cost for development
4. **Configure Expiration Wisely**: Balance duplicate prevention with storage efficiency
5. **Display Metadata**: Show label, icon, message to users during payment
6. **Handle Errors Gracefully**: EDuplicatePayment typically means user retried payment
7. **Cache Receipts**: Store PaymentReceipt objects for off-chain verification
8. **Monitor Events**: Listen to payment events for real-time tracking
9. **Clean Up Records**: Delete expired records to reduce storage costs
10. **Secure Admin Caps**: Protect RegistryAdminCap like private keys

## Verification

Build and test:

```bash
cd /workspaces/Crozz-Coin/sui-stack-hello-world/ui
pnpm build    # Should complete with 0 errors
pnpm dev      # Start dev server
```

Manual testing:

1. Connect wallet on Testnet
2. Navigate to Payment Kit panels
3. Use PaymentURIGenerator to create URIs
4. Use PaymentRegistryManager to create registry
5. Test ephemeral and registry payments
6. Verify PaymentReceipts are created

## References

- **Payment Kit Standard**: https://docs.sui.io/standards/payment-kit
- **Derived Objects**: Used for deterministic registry addresses
- **Clock Object**: https://docs.sui.io/references/framework/sui-framework/clock
- **Transaction URIs**: RFC 3986 URL encoding

## Future Enhancements

Potential improvements:

1. **Payment Dashboard**: Historical view of all payments
2. **Batch Payments**: Process multiple payments in single transaction
3. **Payment Analytics**: Charts and reports of payment volume
4. **Webhook Integration**: Notify external systems on payment completion
5. **Refund Support**: Reverse payments and delete records
6. **Multi-coin Aggregation**: Combine different coin types in registry
7. **Payment Plans**: Recurring payment automation
8. **Export Tools**: Export payment history for accounting

## Conclusion

The Sui Payment Kit implementation provides production-ready payment processing with flexible options for different use cases. The four UI components enable:

- **URI Generation**: Create wallet-friendly payment links
- **Registry Management**: Create and manage payment registries
- **Ephemeral Payments**: Lightweight one-time transfers
- **Registry Payments**: Secure payments with duplicate prevention

This implementation follows Sui standards and best practices, ready for integration into payment flows, marketplace, gaming, and e-commerce applications.
