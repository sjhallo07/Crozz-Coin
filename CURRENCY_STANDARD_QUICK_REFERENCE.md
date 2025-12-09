# Sui Currency Standard - Quick Reference Guide

## Overview
The Sui Currency Standard (`sui::coin_registry` at `0xc`) enables creating fungible tokens with:
- **Flexible metadata management** (name, symbol, decimals, description, icon)
- **Three supply models** (flexible, fixed, burn-only)
- **Built-in regulatory features** (DenyCapV2 for address restrictions)
- **Capability-based permissions** (TreasuryCap, MetadataCap, DenyCapV2)

## Getting Started

### 1. Access the UI
Navigate to **http://localhost:5173/** and scroll to **"Create Currency (Sui Standard)"**

### 2. Fill Out Core Metadata

| Field | Example | Notes |
|-------|---------|-------|
| **Package ID** | `0x1234567890...` | Your deployed package address |
| **Module** | `my_coin` | Module containing the type definition |
| **Type Name** | `MY_COIN` | Struct name with `key` ability |
| **Name** | `My Coin` | Display name (user-facing) |
| **Symbol** | `MYC` | Ticker symbol (1-10 uppercase letters/numbers) |
| **Decimals** | `6` | Precision (0-18 per Sui standard) |
| **Description** | `A custom coin` | Brief description |
| **Icon URL** | `https://...` | HTTPS URL to 64x64 PNG (optional) |

### 3. Choose Supply Model

```
┌─────────────────────────────────────────────────────────┐
│ FLEXIBLE (Default)                                      │
├─────────────────────────────────────────────────────────┤
│ TreasuryCap controls all minting/burning                │
│ Use case: Standard tokens with variable supply          │
│ No initial supply needed                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FIXED                                                   │
├─────────────────────────────────────────────────────────┤
│ Supply locked at creation, no minting/burning allowed   │
│ Use case: Immutable pre-mined tokens                    │
│ REQUIRES initial supply amount                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BURN-ONLY                                               │
├─────────────────────────────────────────────────────────┤
│ No minting; burning via registry allowed                │
│ Use case: Deflationary/decaying tokens                  │
│ REQUIRES initial supply amount                          │
└─────────────────────────────────────────────────────────┘
```

### 4. Optional: Enable Regulatory Features

**DenyCapV2** allows restricting addresses:
- ✅ Add addresses to deny list (immediate effect)
- ✅ Remove addresses from deny list (effective next epoch)
- ✅ Optionally pause all activity globally
- ✅ Resume activity at any time

**When to enable:**
- Compliance requirements
- Preventing sanctioned addresses
- Managing token sales/airdrops

### 5. Optional: Lock Metadata

Check **"Delete MetadataCap after creation"** to:
- Permanently freeze metadata
- Prevent any future updates
- ⚠️ **This is irreversible**

**When to lock:**
- Immutable branding required
- Governance-controlled metadata elsewhere
- Permanent supply announcement

### 6. Create Currency

Click **"Create Currency"** to:
1. Sign transaction with your wallet
2. Receive capabilities:
   - **Always:** `TreasuryCap` (controls minting/burning if supply flexible)
   - **Unless locked:** `MetadataCap` (controls metadata updates)
   - **If regulated:** `DenyCapV2` (controls deny list and global pause)

## What You Get

### TreasuryCap
- **Controls:** Minting and burning (if not fixed supply)
- **Transferable:** Yes (can delegate to others)
- **Required for:** `coin::mint()` and `coin::burn()`

```move
// Mint coins
let new_coin = coin::mint(&mut treasury_cap, amount, ctx);

// Burn coins
coin::burn(&mut treasury_cap, coin_to_burn);
```

### MetadataCap (Optional)
- **Controls:** Coin metadata updates (name, description, icon)
- **Transferable:** Yes
- **One-time claim:** Yes (can only be claimed once from Currency)
- **Deletable:** Yes (irreversible)

```move
// Update metadata
currency.set_name(&metadata_cap, "New Name");
currency.set_description(&metadata_cap, "New description");
currency.set_icon_url(&metadata_cap, "https://...");

// Lock metadata forever
currency.delete_metadata_cap(metadata_cap);
```

### DenyCapV2 (Optional, if Regulated)
- **Controls:** Deny list and global pause
- **Transferable:** Yes
- **Manages:** Address restrictions

```move
// Add address to deny list
coin::deny_list_v2_add(&mut deny_list, &mut deny_cap, address, ctx);

// Remove address
coin::deny_list_v2_remove(&mut deny_list, &mut deny_cap, address, ctx);

// Pause all activity (if allowed)
coin::deny_list_v2_enable_global_pause(&mut deny_list, &mut deny_cap, ctx);

// Resume activity
coin::deny_list_v2_disable_global_pause(&mut deny_list, &mut deny_cap, ctx);
```

## Common Scenarios

### Scenario 1: Simple ERC-20 Style Token
```
✓ Decimals: 18
✓ Supply: Flexible (default)
✓ Regulated: No
→ Receive: TreasuryCap, MetadataCap
→ You control total supply via minting
```

### Scenario 2: Fixed Supply Coin
```
✓ Decimals: 8
✓ Supply: Fixed
✓ Initial Supply: 21,000,000
✓ Regulated: No
→ Receive: TreasuryCap (non-functional), MetadataCap
→ Total supply fixed at creation, no changes possible
```

### Scenario 3: Stablecoin with Compliance
```
✓ Decimals: 6
✓ Supply: Flexible
✓ Regulated: Yes
✓ Allow Global Pause: Yes
→ Receive: TreasuryCap, MetadataCap, DenyCapV2
→ Can mint/burn, manage denied addresses, pause if needed
```

### Scenario 4: Immutable Governance Token
```
✓ Decimals: 9
✓ Supply: Fixed
✓ Initial Supply: 1,000,000
✓ Regulated: No
✓ Delete MetadataCap: Yes
→ Receive: TreasuryCap only (non-functional)
→ Supply and branding both immutable
```

### Scenario 5: Burn-Only Deflationary Token
```
✓ Decimals: 12
✓ Supply: Burn-Only
✓ Initial Supply: 1,000,000,000
✓ Regulated: No
→ Receive: TreasuryCap (for burning only), MetadataCap
→ Cannot mint; can burn through registry
→ Total supply decreases over time
```

## Decimals Reference

The `decimals` field controls display precision:

| Decimals | Amount | Display |
|----------|--------|---------|
| 0 | 1,000,000 | 1,000,000 |
| 6 | 1,000,000 | 1.000000 |
| 9 | 1,000,000,000 | 1.000000000 |
| 18 | 1,000,000,000,000,000,000 | 1.000000000000000000 |

**Tip:** Use 6 for most tokens (like USDC), 9 for flexible precision.

## Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Package ID | `0x` followed by hex | `0x1234567890abcdef` |
| Module | Non-empty string | `my_coin` |
| Type | Non-empty string | `MY_COIN` |
| Symbol | 1-10 uppercase alphanumeric | `MYC`, `WETH`, `USDC` |
| Decimals | Integer 0-18 | `6` |
| Icon URL | Valid HTTPS URL (if provided) | `https://example.com/icon.png` |
| Supply (if fixed/burn-only) | Positive integer | `1000000` |

## Under the Hood

### Registry System (`0xc`)
- Centralized object that stores all coin metadata
- Shared object (anyone can read, owner can update)
- Maintains supply information and regulatory status
- Enables wallets, exchanges, dApps to handle all coins uniformly

### Creation Methods

#### **Standard Creation** (Currently Available)
```
new_currency<T>() → finalize() → Currency<T> (shared immediately)
```

#### **OTW Creation** (Advanced, UI Ready)
```
new_currency_with_otw<T>(otw) → finalize_registration() → Currency<T> (in registry)
```

## After Creation

### Next Steps
1. **Find your Currency object ID** - Check transaction effects in explorer
2. **Share details** with users (package::module::type, decimals, symbol)
3. **Manage capabilities:**
   - TreasuryCap: Keep safe (controls supply)
   - MetadataCap: Keep if updates needed, delete if immutable
   - DenyCapV2: Keep if compliance needed, manage deny list

### Useful Queries
```move
// Get metadata
let name = currency::name(&currency);
let symbol = currency::symbol(&currency);
let decimals = currency::decimals(&currency);

// Check supply status
let is_fixed = currency::is_supply_fixed(&currency);
let is_burn_only = currency::is_supply_burn_only(&currency);
let total = currency::total_supply(&currency);

// Check regulatory status
let is_regulated = currency::is_regulated(&currency);
let deny_cap_id = currency::deny_cap_id(&currency);

// Check metadata capability
let is_claimed = currency::is_metadata_cap_claimed(&currency);
let is_deleted = currency::is_metadata_cap_deleted(&currency);
```

## Security Checklist

- [ ] Keep TreasuryCap safe (controls supply)
- [ ] Only share MetadataCap with authorized updaters
- [ ] Only share DenyCapV2 with authorized compliance officers
- [ ] Validate icon URL is trustworthy
- [ ] Document supply model choice to community
- [ ] If locked, document reason for MetadataCap deletion
- [ ] If regulated, explain deny list policies

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid package ID" | Wrong format | Use `0x` + hex address |
| "Symbol must be uppercase" | Mixed case input | Converter auto-uppercases |
| "Decimals out of range" | < 0 or > 18 | Use 0-18 (6 is standard) |
| "Initial supply required" | Selected Fixed/Burn-Only | Enter positive integer |
| "Icon URL invalid" | Non-HTTPS URL | Use https:// URLs only |
| Transaction rejected | Wallet not connected | Click connect wallet button |

## Links & References

- **Official Documentation:** https://docs.sui.io/standards/currency
- **coin_registry Module:** https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/packages/sui-framework/sources/registries/coin_registry.move
- **Sui Move Book:** https://move-book.com/
- **Regulatory Coin Example:** https://github.com/MystenLabs/sui/tree/main/examples/move/coin
- **Explorer:** https://suiscan.xyz/ (testnet: https://testnet.suiscan.xyz/)

## Tips & Tricks

1. **Decimals = 0?** Valid for whole tokens (rare, but possible)
2. **Need multiple types?** Create separate packages with different structs
3. **Lost metadata cap?** If deleted, metadata frozen; recreate currency if needed
4. **Changing ownership?** Transfer TreasuryCap/MetadataCap/DenyCapV2 to new owner
5. **Testing first?** Use Sui testnet (https://faucet.testnet.sui.io/) to test free

## Version Info

- **Sui Currency Standard:** Implemented per https://docs.sui.io/standards/currency
- **Registry Address:** `0xc`
- **Component Version:** 1.0
- **Last Updated:** December 9, 2025

---

**Ready to create your first currency?** Head to http://localhost:5173/ and scroll to "Create Currency"!
