# DeepBookV3 SDK Integration Guide

**Date**: December 8, 2025  
**SDK Version**: @mysten/deepbook-v3 0.22.2  
**Environment**: Testnet / Mainnet

---

## Overview

This guide documents the integration of **DeepBookV3 SDK** into Crozz-Coin UI, including risk disclosure, best practices, and setup instructions.

### What is DeepBookV3?

DeepBookV3 is a decentralized exchange (DEX) protocol on Sui enabling:
- **Limit Orders**: Place orders at specific price levels
- **Flash Loans**: Borrow funds without collateral (must repay in same tx)
- **Market Making**: Run sophisticated trading strategies
- **Liquidity Provision**: Supply liquidity to permissionless pools
- **Swaps**: Execute trades against deep order books

---

## Installation

```bash
pnpm add @mysten/deepbook-v3
```

**Installed Version**: 0.22.2  
**Dependencies**: @mysten/sui, @mysten/dapp-kit (already in your project)

---

## Architecture

### Components

#### 1. **DeepBookV3Info.tsx**
- Overview of DeepBookV3 capabilities
- Risk & Disclaimer dialog (MANDATORY READ)
- Best Practices tabs (Testing, Security, Trading, Monitoring)
- Links to official docs, GitHub repo, and NPM package

#### 2. **DeepBookV3BalanceManager.tsx**
- **BalanceManager** setup and management
- Deposit/withdraw operations
- Balance queries
- Configuration interface

### Supported Networks & Coins

| Network | Coins |
|---------|-------|
| **Testnet** | SUI, DBUSDC, DBUSDT, DEEP |
| **Mainnet** | SUI, USDC, USDT, WETH, DEEP |

---

## ⚠️ CRITICAL RISKS & DISCLAIMERS

### Risk 1: Smart Contract Risk
- DeepBookV3 is in active development
- Code may contain bugs, exploits, or undiscovered vulnerabilities
- Even audited contracts can fail
- **Use only with funds you can afford to lose completely**

### Risk 2: Flash Loan Risk
- Flash loans enable high-frequency arbitrage but also attacks
- An attacker can borrow massive amounts, manipulate prices, and deplete your balance in a single transaction
- **Always add slippage protection & price oracle checks**

### Risk 3: Impermanent Loss & Slippage
- Market making and liquidity provision expose you to price divergence losses
- Slippage on large trades can exceed expected price
- **Test extensively on devnet/testnet with small amounts first**

### Risk 4: Private Key Exposure
- Never hardcode private keys in code or `.env` files committed to git
- Use secure key management (hardware wallets, key vaults)
- SDK examples show keys for educational purposes only — **NEVER replicate in production**

### Risk 5: Regulatory & Tax
- Trading, swaps, and market making may be subject to local tax/regulatory laws
- DeepBook/Sui is not regulated; you are responsible for compliance
- **Consult a tax/legal professional before trading**

### NO WARRANTY

**This software and DeepBook are provided "AS IS" without warranty. Developers and Mysten Labs disclaim all liability for losses, including total fund loss.**

---

## Best Practices

### Testing (MANDATORY)

1. **Always Test on Devnet First**
   - Use free SUI tokens (faucet.sui.io)
   - Test orders, balance manager setup, flash loans
   - Verify all logic before testnet

2. **Start Small on Testnet**
   - Place test limit orders (1-10 DBUSDT)
   - Verify execution flow, slippage calculations, error handling
   - Monitor fill rates and latency

3. **Simulate High-Volume Scenarios**
   - Test order book depth
   - Large swap amounts
   - Flash loan logic to catch edge cases

### Security

1. **Private Key Management**
   - Use environment variables (never hardcode)
   - Rotate keys regularly
   - For production: use hardware wallets or key vaults (AWS KMS, Google Secret Manager)

2. **Validation & Slippage Protection**
   - Always validate user inputs (min/max amounts, price ranges)
   - Set aggressive slippage tolerances (0.5%-2% for stable pairs)
   - Check oracle prices before large trades

3. **Audit & Code Review**
   - Have custom pools/coins audited before mainnet
   - Review transaction builders for correctness (esp. multi-step logic)
   - Use MoveAnalyzer for Move contract safety

### Trading

1. **Risk Management**
   - Set max order size, position limits, stop-loss levels
   - Never use 100% of capital in a single trade
   - Monitor P&L continuously

2. **Flash Loan Caution**
   - Flash loans must repay in the same transaction
   - Add circuit breakers to detect price manipulation
   - Rate-limit loan requests
   - Monitor for sandwich attacks (MEV)

3. **Order Placement Strategy**
   - Spread orders across price levels to reduce market impact
   - Use limit orders over market orders (if available)
   - Monitor fill rates and adjust pricing dynamically

### Monitoring

1. **Real-Time Monitoring**
   - Track order fills, balance changes, and gas costs
   - Set up alerts for large trades or unusual market activity
   - Log all transactions

2. **Error Handling**
   - Catch and log all SDK errors (network, contract, validation)
   - Implement retry logic with exponential backoff for transient failures
   - Never ignore errors silently

3. **Audit Logs & Compliance**
   - Maintain detailed audit logs (timestamp, action, amount, result)
   - For tax/legal compliance, export transaction history regularly
   - Use structured logging (JSON format for analysis)

---

## Setup Instructions

### 1. Create DeepBookClient

```tsx
import { DeepBookClient } from '@mysten/deepbook-v3';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

class DeepBookMarketMaker {
  dbClient: DeepBookClient;
  suiClient: SuiClient;
  keypair: Ed25519Keypair;

  constructor(privateKey: string, env: 'testnet' | 'mainnet') {
    this.keypair = this.getSignerFromPK(privateKey);
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(env),
    });
    this.dbClient = new DeepBookClient({
      address: this.getActiveAddress(),
      env: env,
      client: this.suiClient,
    });
  }

  getSignerFromPK = (privateKey: string): Ed25519Keypair => {
    const { schema, secretKey } = decodeSuiPrivateKey(privateKey);
    if (schema === 'ED25519') return Ed25519Keypair.fromSecretKey(secretKey);
    throw new Error(`Unsupported schema: ${schema}`);
  };

  getActiveAddress() {
    return this.keypair.toSuiAddress();
  }
}
```

### 2. Create BalanceManager

```tsx
import { Transaction } from '@mysten/sui/transactions';

async createBalanceManager() {
  const tx = new Transaction();
  tx.add(this.dbClient.balanceManager.createAndShareBalanceManager());

  const res = await this.suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: this.keypair,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  // Extract manager address from objectChanges
  const managerAddress = res.objectChanges?.find((change) =>
    change.type === 'created' && change.objectType.includes('BalanceManager')
  )?.['objectId'];

  return managerAddress;
}
```

### 3. Deposit Funds

```tsx
async depositIntoManager(
  balanceManagerKey: string,
  coinType: string,
  amount: number
) {
  const tx = new Transaction();
  this.dbClient.balanceManager.depositIntoManager(
    balanceManagerKey,
    coinType,
    amount
  )(tx);

  await this.suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: this.keypair,
  });
}
```

### 4. Place Limit Order

```tsx
async placeLimitOrder(
  managerKey: string,
  poolKey: string,
  price: number,
  quantity: number,
  isBid: boolean
) {
  const tx = new Transaction();

  // Use dbClient to build limit order transaction
  // Example (check SDK docs for exact API):
  // dbClient.limitOrder.place(poolKey, price, quantity, isBid)(tx);
  // dbClient.balanceManager.updateTradeAuth(managerKey)(tx);

  await this.suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: this.keypair,
  });
}
```

### 5. Flash Loan Example

```tsx
async flashLoanArbitrage(poolKey: string, loanAmount: number) {
  const tx = new Transaction();

  // 1. Take flash loan
  const [borrowedCoin] = dbClient.flashLoan.takeLoan(poolKey, loanAmount)(tx);

  // 2. Execute arbitrage logic
  // (swap, trade, etc.)
  // ...

  // 3. Repay loan (MUST be in same tx)
  dbClient.flashLoan.repay(poolKey, borrowedCoin)(tx);

  await this.suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: this.keypair,
  });
}
```

---

## Environment Variables

Add to `.env.local`:

```env
# DeepBook Configuration
VITE_DEEPBOOK_ENV=testnet
VITE_DEEPBOOK_BALANCE_MANAGER_ADDRESS=0x...
VITE_DEEPBOOK_ADMIN_CAP=0x...

# Private key (ONLY for dev/test, use secure vault in production)
# DEEPBOOK_PRIVATE_KEY=0x...
```

---

## Resources

- **Official Docs**: https://docs.sui.io/standards/deepbookv3-sdk
- **GitHub Repository**: https://github.com/MystenLabs/ts-sdks/tree/main/packages/deepbook-v3
- **NPM Package**: https://www.npmjs.com/package/@mysten/deepbook-v3
- **DeepBookV3 Contract Repo**: https://github.com/MystenLabs/deepbookv3
- **Sui TypeScript SDK**: https://sdk.mystenlabs.com/typescript
- **Sui Faucet**: https://faucet.sui.io

---

## Troubleshooting

### Issue: "BalanceManager not found"
- Ensure BalanceManager is created before trades
- Verify manager address is correct
- Check that trades use correct manager key

### Issue: "Insufficient balance"
- Deposit more coins into BalanceManager
- Check balance with `checkManagerBalance()`
- Ensure coin type matches

### Issue: "Flash loan failed to repay"
- Ensure repayment is in the same transaction
- Verify loan amount is correct
- Check that borrowed coin is not consumed

### Issue: "Slippage exceeded"
- Adjust price parameters
- Use more aggressive slippage settings for volatile pairs
- Check order book depth before placing orders

---

## Support

For issues, bugs, or questions:
- GitHub Issues: https://github.com/MystenLabs/ts-sdks/issues
- Sui Discord: https://discord.gg/sui
- Sui Forum: https://forums.sui.io

---

**Last Updated**: December 8, 2025  
**Status**: ✅ Integrated, Ready for Testing
