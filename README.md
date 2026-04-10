# Crozz Coin 2.0

**CROZZ COIN** is an open-source fungible token deployed on the [Sui Network](https://sui.io) using the [Move](https://move-book.com) smart-contract language.

---

## Token Specs

| Property    | Value                         |
|-------------|-------------------------------|
| Symbol      | `CROZZ`                       |
| Name        | Crozz Coin                    |
| Decimals    | 9                             |
| Network     | Sui (Testnet / Mainnet)       |
| Package     | `crozz_coin`                  |
| Version     | 2.0.0                         |

---

## Project Structure

```
crozz_coin/
├── Move.toml                        # Package manifest
├── sources/
│   └── crozz_coin.move              # Coin module
└── tests/
    └── crozz_coin_tests.move        # Unit tests
```

---

## Prerequisites

| Tool         | Install                                          |
|--------------|--------------------------------------------------|
| Sui CLI      | `cargo install --locked --git https://github.com/MystenLabs/sui.git sui` |
| Git          | OS package manager                               |

Verify the installation:
```bash
sui --version
```

---

## Local Development

### 1 — Clone and enter the repo
```bash
git clone https://github.com/sjhallo07/Crozz-Coin.git
cd Crozz-Coin
```

### 2 — Run the tests
```bash
sui move test
```

All six tests should pass:
- `test_deployer_receives_caps`
- `test_metadata_frozen`
- `test_mint_and_total_supply`
- `test_mint_to_many`
- `test_burn_reduces_supply`
- `test_lock_treasury_destroys_cap`

### 3 — Build
```bash
sui move build
```

---

## Deployment

### Switch to Testnet (first-time setup)
```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
sui client faucet          # fund the active address
```

### Publish the package
```bash
sui client publish --gas-budget 100000000
```

The output includes:
- `PackageID` — the on-chain address of the published package
- `TreasuryCap` object ID — required for minting
- `AdminCap` object ID — required for metadata updates and treasury locking

### Mint tokens
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_coin \
  --function mint \
  --args <TREASURY_CAP_ID> <AMOUNT_BASE_UNITS> <RECIPIENT_ADDRESS> \
  --gas-budget 10000000
```

*Example — mint 1 000 CROZZ (9 decimals = 1 000 000 000 000 base units) to Alice:*
```bash
sui client call \
  --package 0xPACKAGE \
  --module crozz_coin \
  --function mint \
  --args 0xTREASURY 1000000000000 0xALICE \
  --gas-budget 10000000
```

### Lock the treasury (make supply fixed)
Once the initial distribution is complete you can permanently destroy the
`TreasuryCap` so no more tokens can ever be minted:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_coin \
  --function lock_treasury \
  --args <ADMIN_CAP_ID> <TREASURY_CAP_ID> \
  --gas-budget 10000000
```

> ⚠️ **This action is irreversible.** The TreasuryCap is destroyed on-chain.

### Burn tokens
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_coin \
  --function burn \
  --args <TREASURY_CAP_ID> <COIN_OBJECT_ID> \
  --gas-budget 10000000
```

---

## Features

| Function           | Description                                                |
|--------------------|------------------------------------------------------------|
| `mint`             | Mint tokens and transfer to a recipient                    |
| `mint_coin`        | Mint and return a `Coin` object (composable)               |
| `mint_to_many`     | Batch-mint to multiple recipients in one transaction       |
| `burn`             | Burn tokens, reducing total supply                         |
| `lock_treasury`    | Permanently destroy the `TreasuryCap` (supply lock)        |
| `update_description` | Update the on-chain description (requires `AdminCap`)  |
| `update_icon_url`  | Update the icon URL (requires `AdminCap`)                  |
| `total_supply`     | View the current total supply                              |

---

## License

[MIT](LICENSE)
