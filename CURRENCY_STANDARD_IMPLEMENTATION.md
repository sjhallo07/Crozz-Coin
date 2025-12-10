# Sui Currency Standard Implementation

**Reference:** https://docs.sui.io/standards/currency

## Overview

The `CreateCurrencyPanel` component has been enhanced to fully implement the **Sui Currency Standard** (`sui::coin_registry`), providing comprehensive support for creating fungible tokens on Sui with advanced features like supply models, regulatory capabilities, and metadata management.

---

## Features Implemented

### 1. Core Metadata Management
- **Name, Symbol, Decimals, Description, Icon URL**
- Decimals support: **0–18** (per Sui standard, previously limited to 0–9)
- Symbol validation: 1–10 ASCII uppercase alphanumeric characters
- Icon URL validation: Must be valid HTTPS URL
- Metadata stored in centralized `Currency<T>` object in `CoinRegistry` (address `0xc`)

### 2. Supply Models
The component now supports three supply management strategies:

#### **Flexible Supply (Unknown)** *(Default)*
- `TreasuryCap` controls minting and burning
- No supply constraints
- Use case: Standard, controlled-issuance tokens

```move
// TreasuryCap allows:
coin::mint<T>(cap, amount) → Coin<T>
coin::burn<T>(cap, coin)    → u64 (amount burned)
```

#### **Fixed Supply**
- Total supply locked at creation
- No minting or burning allowed after finalization
- Use case: Immutable, pre-mined tokens

```move
// During initialization:
currency.make_supply_fixed(cap)  // Freezes supply
```

#### **Burn-Only Supply**
- No new minting allowed
- Existing coins can be burned through registry
- Use case: Deflationary tokens with controlled supply reduction

```move
// During initialization:
currency.make_supply_burn_only(cap)

// Later, burn via registry:
coin_registry::burn(currency, coin)
coin_registry::burn_balance(currency, balance)
```

### 3. Regulatory Features (DenyCapV2)
Enable address restrictions through `DenyCapV2`:

- **Deny List Management**: Add/remove addresses that cannot use the coin
- **Global Pause**: Optional ability to pause all coin activity network-wide
- **Immediate Effect**: Address cannot use coin as transaction input immediately upon addition
- **Epoch Enforcement**: At next epoch, denied address also cannot receive the coin

```move
// Create regulated coin during initialization:
let deny_cap = currency.make_regulated(allow_global_pause, ctx);

// Later, manage deny list:
coin::deny_list_v2_add(deny_list, deny_cap, address, ctx)
coin::deny_list_v2_remove(deny_list, deny_cap, address, ctx)

// Pause activity (if allowed):
coin::deny_list_v2_enable_global_pause(deny_list, deny_cap, ctx)
coin::deny_list_v2_disable_global_pause(deny_list, deny_cap, ctx)
```

### 4. Creation Methods

#### **Standard Creation (Recommended)** *(Currently Implemented)*
- Single-step: `new_currency` → `finalize`
- Currency becomes shared object immediately
- Type `T` must have `key` ability only
- Suitable for most use cases

```move
let (currency_init, treasury_cap) = coin_registry::new_currency<T>(
    registry,
    decimals,
    symbol,
    name,
    description,
    icon_url,
    ctx,
);
let metadata_cap = currency_init.finalize(ctx);
```

#### **One-Time Witness (OTW) Creation** *(UI Ready, Requires OTW)*
- Two-step: `new_currency_with_otw` → `finalize_registration`
- Requires OTW (One-Time Witness) object as proof of uniqueness
- Currency transferred to `CoinRegistry` during init, promoted to shared via `finalize_registration`
- Use case: Package-native coins with guaranteed uniqueness

```move
// In package init:
let (currency_init, treasury_cap) = coin_registry::new_currency_with_otw(
    otw,  // One-Time Witness
    decimals,
    symbol,
    name,
    description,
    icon_url,
    ctx,
);
let metadata_cap = currency_init.finalize(ctx);

// Separate transaction to finalize registry placement:
coin_registry::finalize_registration(registry, currency, ctx)
```

### 5. Metadata Capability Management

#### **MetadataCap** - Controls metadata updates
- **Unclaimed**: Not yet taken by owner (updates allowed during initialization)
- **Claimed**: Owner has claimed; can be used for updates
- **Deleted**: Permanently destroyed; metadata frozen

#### **Update Operations**
```move
// Owner claims MetadataCap once:
let metadata_cap = currency.claim_metadata_cap(&treasury_cap, ctx);

// Update metadata (requires MetadataCap):
currency.set_name(&metadata_cap, new_name)
currency.set_description(&metadata_cap, new_description)
currency.set_icon_url(&metadata_cap, new_url)

// Irreversibly delete to lock metadata:
currency.delete_metadata_cap(metadata_cap)  // No further updates possible
```

---

## Component Architecture

### State Management
```typescript
// Core Metadata
packageId, moduleName, typeName
decimals, symbol, name, description, iconUrl

// Creation & Supply
creationMethod: "standard" | "otw"
supplyModel: "unknown" | "fixed" | "burn_only"
initialSupply: string (for fixed/burn-only)

// Regulatory
isRegulated: boolean
allowGlobalPause: boolean

// Metadata Management
deleteMetadataCap: boolean
```

### Transaction Flow

#### **Standard Creation with Flexible Supply**
1. Call `coin_registry::new_currency<T>` → get `CurrencyInitializer<T>` and `TreasuryCap<T>`
2. Call `coin_registry::finalize` → get `MetadataCap<T>`
3. Transfer capabilities to sender

#### **Fixed Supply Creation**
1. Call `coin_registry::new_currency<T>`
2. Mint initial supply: `coin::mint(treasury_cap, amount)`
3. Apply supply model: `currency_init.make_supply_fixed(minted_coin)`
4. Call `coin_registry::finalize`
5. Transfer `TreasuryCap` and `MetadataCap` to sender

#### **Regulated Coin Creation**
1. Call `coin_registry::new_currency<T>`
2. Make regulated: `currency_init.make_regulated(allow_global_pause)` → get `DenyCapV2<T>`
3. Call `coin_registry::finalize`
4. Transfer `TreasuryCap`, `MetadataCap`, and `DenyCapV2` to sender

#### **Delete MetadataCap (Locks Metadata)**
1. Call `coin_registry::finalize_and_delete_metadata_cap` instead of `finalize`
2. Only `TreasuryCap` and optional `DenyCapV2` transferred
3. Metadata frozen permanently

---

## Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Package ID | Valid Sui object ID (0x...) | `0x1234...` |
| Module Name | Non-empty string | `my_coin` |
| Type Name | Non-empty string | `MY_COIN` |
| Decimals | Integer 0–18 | `6` |
| Symbol | 1–10 ASCII uppercase alphanumeric | `MYC`, `COIN` |
| Name | Non-empty string | `My Coin` |
| Icon URL | Valid HTTPS URL (if provided) | `https://example.com/icon.png` |
| Initial Supply | Positive integer (if fixed/burn-only) | `1000000` |

---

## Registry System Object

**Address:** `0xc` (`sui::coin_registry`)

The centralized registry provides:
- **Unified coin metadata storage** via `Currency<T>` objects
- **Supply tracking** (fixed, burn-only, flexible)
- **Regulatory status** (regulated with deny list, unregulated, unknown)
- **Capability management** (TreasuryCap, MetadataCap, DenyCapV2)
- **Query functions** for wallets, exchanges, dApps

### Benefits of Centralized Registry
✅ Single source of truth for coin information
✅ Consistent handling across ecosystem (wallets, exchanges, dApps)
✅ Enhanced supply and regulatory tracking
✅ Future-proofing for protocol upgrades
✅ Backward compatibility with legacy `CoinMetadata`

---

## Best Practices

### For Coin Creators
1. **Choose supply model early**
   - Default to flexible if uncertain
   - Use fixed for immutable/pre-mined tokens
   - Use burn-only for deflationary mechanisms

2. **Consider regulatory needs**
   - Enable deny list only if compliance required
   - Document deny list policies with community

3. **Manage MetadataCap strategically**
   - Keep if future updates expected
   - Delete if metadata should be immutable
   - Transfer to governance if DAO-controlled

### For dApp Developers
1. **Query registry first** for coin information
2. **Handle all supply states** (fixed, burn-only, unknown)
3. **Respect regulatory status** (check if regulated, handle deny list)
4. **Check MetadataCap state** before assuming metadata updates possible

### For Infrastructure Providers
1. **Monitor registry changes** for new coin registrations
2. **Index supply events** (burns for burn-only coins)
3. **Support legacy coins** during migration period
4. **Cache registry data** (changes infrequently)

---

## Security Considerations

### Capability Protection
- **MetadataCap**: Controls coin branding; protect from unauthorized transfers
- **TreasuryCap**: Controls minting/burning; most sensitive capability
- **DenyCapV2**: Can restrict coin usage; use carefully in compliance contexts

### Invariants Enforced by Registry
- ✅ Each coin type registered only once
- ✅ Symbol validation (ASCII printable)
- ✅ Supply state cannot be downgraded (flexible → fixed → burn-only only)
- ✅ MetadataCap can only be claimed once
- ✅ Metadata updates require valid MetadataCap
- ✅ Denial entry takes effect immediately; removal at next epoch

### Migration Safety (Coin → Currency)
- Legacy `CoinMetadata` can migrate permissionlessly by reference
- Value-based migration (consumption) only allowed after `MetadataCap` claimed
- Ensures existing governance workflows not broken during transition
- Backward compatibility maintained

---

## Usage Examples

### Create a Simple Coin
```
1. Set Decimals: 6
2. Symbol: ABC
3. Supply Model: Flexible (default)
4. Regulated: No
5. Click "Create Currency"
→ Get TreasuryCap, MetadataCap
```

### Create a Fixed-Supply Token
```
1. Set Decimals: 9
2. Symbol: FIXED
3. Supply Model: Fixed
4. Initial Supply: 1000000
5. Regulated: No
6. Click "Create Currency"
→ Get TreasuryCap (non-functional for minting), MetadataCap
→ Supply locked; no further minting/burning
```

### Create a Regulated Coin
```
1. Set all metadata (name, symbol, etc.)
2. Supply Model: Flexible or Fixed
3. Regulated: Yes
4. Allow Global Pause: Yes (optional)
5. Click "Create Currency"
→ Get TreasuryCap, MetadataCap, DenyCapV2
→ Can now manage deny list and pause activity
```

### Lock Metadata Permanently
```
1. Set all metadata
2. Metadata Management: ✓ Delete MetadataCap after creation
3. Click "Create Currency"
→ Get TreasuryCap (and DenyCapV2 if regulated)
→ No MetadataCap returned; metadata immutable
```

---

## References

- **Official Docs:** https://docs.sui.io/standards/currency
- **sui::coin_registry Module:** https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/packages/sui-framework/sources/registries/coin_registry.move
- **sui::coin Module:** https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/packages/sui-framework/sources/coin.move
- **Currency vs Closed-Loop Tokens:** https://docs.sui.io/standards/closed-loop-token
- **Derived Objects (OTW Support):** https://docs.sui.io/concepts/sui-move-concepts/derived-objects

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Core Metadata | ✅ Complete | Name, symbol, decimals (0-18), description, icon |
| Flexible Supply | ✅ Complete | Default, TreasuryCap controlled |
| Fixed Supply | ✅ Complete | Mint before finalize, lock supply |
| Burn-Only Supply | ✅ Complete | Mint before finalize, burn-only mode |
| DenyCapV2 | ✅ Complete | Regulatory, global pause option |
| MetadataCap Management | ✅ Complete | Claim/delete options |
| Standard Creation | ✅ Complete | `new_currency` → `finalize` |
| OTW Creation | 🟡 UI Ready | Requires OTW object from package |
| Migration from Legacy | 📋 Future | Support for `CoinMetadata` migration |

---

## Next Steps

1. **Test against testnet** with real package deployments
2. **Implement OTW creation** once package publishing workflow ready
3. **Add metadata update UI** (separate panel for claiming/updating MetadataCap)
4. **Implement deny list manager** (add/remove addresses, pause/unpause)
5. **Add currency query panel** (lookup existing currencies in registry)
6. **Support migration flows** for legacy coins

---

**Last Updated:** December 9, 2025
**Implementation Commit:** `143efea13a`
