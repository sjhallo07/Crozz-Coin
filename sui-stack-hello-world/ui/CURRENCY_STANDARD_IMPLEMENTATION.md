# Currency Standard Implementation Summary

## ✅ Implemented Features

### 1. Create Currency (Standard Flow)
**Component:** `CreateCurrencyPanel.tsx`
- **Function:** `coin_registry::new_currency<T>`
- **Flow:** Single transaction creates Currency as shared object immediately
- **Returns:** `TreasuryCap<T>` and `MetadataCap<T>`
- **Use case:** Dynamic currency creation anytime after type is published
- **Registry:** `0xc` (CoinRegistry system object)

**UI Features:**
- Input validation for Package ID, Module, Type name
- Decimals (0-9), Symbol (ASCII uppercase), Name, Description, Icon URL
- Calls `new_currency` → `finalize` in one transaction
- Auto-transfers TreasuryCap and MetadataCap to creator
- LocalStorage persistence for Package ID

**Transaction Structure:**
```typescript
const [currencyInit, treasuryCap] = tx.moveCall({
  target: "0x2::coin_registry::new_currency",
  arguments: [registryId, decimals, symbol, name, description, iconUrl],
  typeArguments: [coinType],
});

const [metadataCap] = tx.moveCall({
  target: "0x2::coin_registry::finalize",
  arguments: [currencyInit],
  typeArguments: [coinType],
});

tx.transferObjects([treasuryCap, metadataCap], senderAddress);
```

---

### 2. Create Currency (OTW Flow)
**Component:** `CreateCurrencyOTWPanel.tsx`
- **Function:** `coin_registry::new_currency_with_otw<T>`
- **Flow:** Two-step process (requires finalize_registration after init)
- **Use case:** Package publish with One-Time Witness proof

**Step 1: Package Init**
```move
fun init(witness: MY_COIN, ctx: &mut TxContext) {
    let (mut currency, treasury_cap) = coin_registry::new_currency_with_otw(
        witness, decimals, symbol, name, description, icon_url, ctx
    );
    let metadata_cap = currency.finalize(ctx);
    transfer::public_transfer(treasury_cap, ctx.sender());
    transfer::public_transfer(metadata_cap, ctx.sender());
}
```

**Step 2: Finalize Registration** (separate transaction)
```bash
sui client ptb \
  --assign <currency_object_id> currency_to_promote \
  --move-call 0x2::coin_registry::finalize_registration @0xc currency_to_promote
```

**UI Features:**
- Complete Move code example for package init
- Instructions for two-step flow
- Command builder for finalize_registration
- Copy-to-clipboard for CLI command
- Visual warnings about required second step

---

### 3. Currency Manager (Mint/Burn)
**Component:** `CurrencyManager.tsx`
- **Updated to use standard coin functions**
- **Mint:** `0x2::coin::mint<T>(TreasuryCap, amount)`
- **Burn:** `0x2::coin::burn<T>(TreasuryCap, Coin)`

**Changes from previous version:**
- Renamed `treasuryWrapperId` → `treasuryCapId` (accurate naming)
- Uses framework `coin::mint` and `coin::burn` instead of custom module functions
- Added type arguments to moveCall
- Updated Callout with Currency Standard context
- Validation for Sui object IDs (package, TreasuryCap, coin)
- LocalStorage persistence for TreasuryCap ID

**Transaction Structure (Mint):**
```typescript
const [newCoin] = tx.moveCall({
  target: "0x2::coin::mint",
  arguments: [tx.object(treasuryCapId), tx.pure.u64(amount)],
  typeArguments: [coinType],
});
tx.transferObjects([newCoin], senderAddress);
```

**Transaction Structure (Burn):**
```typescript
tx.moveCall({
  target: "0x2::coin::burn",
  arguments: [tx.object(treasuryCapId), tx.object(coinId)],
  typeArguments: [coinType],
});
```

---

### 4. Visual Object Viewer
**Component:** `ObjectViewer.tsx`
- Query any Sui object by ID via GraphQL
- Displays full JSON response
- Validation with `isValidSuiObjectId`
- Error handling and loading states

---

### 5. GraphQL Health Panel
**Component:** `GraphQLHealthPanel.tsx`
- Query `serviceConfig` from GraphQL endpoint
- Shows limits, timeouts, node counts
- Formatted JSON display
- Useful for debugging GraphQL availability

---

## 📋 Key Concepts Implemented

### Registry System
- **CoinRegistry:** System object at `0xc`
- **Currency<T>:** Shared object storing metadata, supply, regulatory status
- **Derived addresses:** OTW currencies use deterministic addresses after finalization

### Capabilities
- **TreasuryCap<T>:** Required for mint/burn operations
- **MetadataCap<T>:** Required for metadata updates (name, symbol, description, icon)
- **DenyCapV2<T>:** Optional, for regulated coins (deny list)

### Supply States (not yet in UI, but documented)
- **Fixed:** Total supply locked (no mint/burn)
- **BurnOnly:** Can burn but not mint
- **Unknown:** Flexible (TreasuryCap controls)

### Two Creation Paths
1. **Standard (`new_currency`)**: Immediate shared object, no OTW required
2. **OTW (`new_currency_with_otw`)**: Two-step, requires finalize_registration

---

## 🎯 How to Use

### Create a Currency (Standard)
1. Connect wallet on Testnet
2. Scroll to "Create Currency (Standard)" panel
3. Fill in:
   - Package ID (your published package with the coin type)
   - Module name and Type name
   - Decimals, Symbol, Name, Description, Icon URL
4. Click "Create Currency"
5. Approve transaction
6. Receive TreasuryCap and MetadataCap in your wallet

### Create a Currency (OTW)
1. Publish package with `new_currency_with_otw` in init (see code example in panel)
2. Note the Currency object ID from publish output
3. Scroll to "Create Currency (OTW - Two-Step)" panel
4. Enter Currency Object ID, Package ID, Module, Type
5. Copy the generated CLI command
6. Run command in terminal to finalize registration
7. Currency is now live as shared object

### Mint Coins
1. Use TreasuryCap ID from creation
2. Scroll to "Currency Standard (Registry)" panel
3. Enter Package ID, Module, Type, TreasuryCap ID, Amount
4. Click "Mint"
5. Coin is minted and transferred to your wallet

### Burn Coins
1. Get Coin object ID from wallet or explorer
2. Enter Package ID, Module, Type, TreasuryCap ID, Coin ID
3. Click "Burn"
4. Coin is destroyed, supply decreases

---

## 🔍 Verification

### Check Currency Exists
```bash
# Query Currency object (derived address for OTW, or direct for standard)
sui client object <currency_object_id>
```

### Check TreasuryCap
```bash
sui client object <treasury_cap_id>
```

### Query via GraphQL
Use the ObjectViewer in UI to query any object by ID and see full JSON.

### Check Total Supply
GraphQL query:
```graphql
query {
  object(address: "<currency_object_id>") {
    asMoveObject {
      contents {
        json
      }
    }
  }
}
```

Look for `supply` field in Currency object.

---

## 📚 References

- **Sui Docs:** https://docs.sui.io/standards/currency
- **Registry Module:** `sui::coin_registry` at `0x2`
- **Coin Module:** `sui::coin` at `0x2`
- **Registry Address:** `0xc`
- **Framework Source:** [coin_registry.move](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/packages/sui-framework/sources/registries/coin_registry.move)

---

## ⚠️ Important Notes

1. **OTW requires two steps:** Always call `finalize_registration` after publishing with `new_currency_with_otw`
2. **TreasuryCap security:** Keep TreasuryCap safe; it controls minting
3. **MetadataCap is one-time claim:** Can only be claimed once per currency
4. **Symbol validation:** Must be ASCII printable (A-Z, 0-9)
5. **Registry is shared:** At address `0xc`, accessible to all
6. **Type must have `key`:** For standard flow, type needs `key` ability

---

## 🚀 Next Steps (Optional Enhancements)

- [ ] Add "Make Regulated" option during creation (DenyCapV2)
- [ ] Add supply model selection (Fixed/BurnOnly/Unknown)
- [ ] Metadata update panel (requires MetadataCap)
- [ ] Query Currency by type (GraphQL or RPC)
- [ ] Display total supply and regulatory status
- [ ] Migration tool for legacy CoinMetadata

---

**Status:** ✅ All core Currency Standard flows implemented and tested
**UI State:** Dev server running on http://localhost:5173/
**Last Updated:** December 8, 2025
