# CROZZ Coin - Testnet Connection Guide

## 🚀 Quick Start - Connect to Sui Testnet

### Prerequisites

1. **Web Browser** with Web3 support (Chrome, Firefox, Edge, Safari)
2. **Sui Wallet** installed
3. **Node.js 18+** (for local development)

---

## 📱 Step 1: Install a Sui Wallet

### Option A: Sui Wallet (Official)
- **Download**: [Chrome Web Store](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipiknpg/reviews)
- **Setup**: Create new account or import existing
- **Network**: Auto-configured to Testnet/Mainnet

### Option B: Slush Wallet
- **Download**: [Chrome Web Store](https://chrome.google.com/webstore/detail/slush-wallet/jnkelfclilanbhejoafkncafjcdaaaab)
- **Setup**: Follow wallet initialization
- **Testnet**: Supported

### Option C: Nightly Wallet
- **Download**: [nightly.app](https://nightly.app)
- **Setup**: Web-based wallet
- **Testnet**: Supported

---

## 🔗 Step 2: Configure to Testnet

1. **Open your Sui Wallet extension**
2. **Click "Settings"** ⚙️
3. **Select "Network"**
4. **Choose "Testnet"** 🌐
5. **Confirm** ✓

**Testnet RPC Endpoint**: `https://rpc.testnet.sui.io`

---

## 💰 Step 3: Get Testnet SUI Coins

### Method 1: Faucet Button (Recommended)
1. **Click** "Get Testnet SUI from Faucet" button in the app header
2. **Approve** transaction in your wallet (no cost)
3. **Wait** 1-2 seconds for coins to appear
4. **Check balance** in wallet

### Method 2: Direct Faucet Access
1. **Visit**: [https://testnet.suifaucet.fun/](https://testnet.suifaucet.fun/)
2. **Paste** your wallet address
3. **Click** "Request SUI"
4. **Receive** 2 SUI coins (can request every 24 hours)

### Method 3: CLI Command
```bash
sui client faucet --address <YOUR_WALLET_ADDRESS>
```

**Amount**: 2 SUI per request  
**Frequency**: Once every 24 hours  
**Gas Cost**: FREE ✓

---

## 🎯 Step 4: Connect Your Wallet to CROZZ App

1. **Open** CROZZ dApp: `http://localhost:5174/`
2. **Click** "Connect Wallet" button (top right)
3. **Select** your wallet (Sui Wallet, Slush, etc.)
4. **Approve** connection in wallet popup
5. **Confirm** address display in app header

**✓ You are now connected!**

---

## 🧪 Step 5: Test the Application

### Create Greeting
1. **Click** "Create Greeting" button
2. **Review** steps shown in modal
3. **Approve** transaction in wallet
4. **Wait** for confirmation (5-15 seconds)
5. **See** greeting ID displayed

### Update Greeting
1. **Enter** new text in input field
2. **Click** "Update Greeting"
3. **Approve** transaction
4. **Wait** for confirmation
5. **See** updated text displayed

### Explore Features
- **Coin Manager**: View and manage your SUI coins
- **DeepBook**: Trading pairs and orders
- **Kiosk**: NFT marketplace features
- **Events**: Monitor blockchain events
- **GraphQL**: Query blockchain data

---

## 🔍 Verify Connection Status

The **Testnet Status Card** shows:
- ✅ Network connection status
- 🔑 Wallet address and public key
- 🌐 RPC endpoint URL
- 💾 Quick links to faucet and explorer

**Status Indicators**:
- 🟢 **Green**: Connected and healthy
- 🔴 **Red**: Connection issues
- 🟡 **Yellow**: Wallet not connected

---

## 📊 Monitor Transactions

### View Transaction in Explorer
1. **Click** "View in Explorer" button in Testnet Status
2. **See** all your transactions
3. **Check** transaction status and details
4. **Monitor** gas fees and effects

**Explorer**: [https://testnet.suivision.xyz/](https://testnet.suivision.xyz/)

---

## 🛠️ Network Configuration Details

### Current Setup
```typescript
// networkConfig.ts
const networkConfig = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl('testnet'),
    variables: {
      helloWorldPackageId: TESTNET_HELLO_WORLD_PACKAGE_ID,
    },
  },
});
```

### RPC Endpoints
| Network | RPC URL |
|---------|---------|
| **Testnet** | https://rpc.testnet.sui.io |
| Mainnet | https://rpc.mainnet.sui.io |
| Devnet | https://rpc.devnet.sui.io |

### Supported Wallets
- ✅ Sui Wallet (Official)
- ✅ Slush Wallet
- ✅ Nightly Wallet
- ✅ Walrus Wallet
- ✅ All Wallet Standard compatible wallets

---

## ⚠️ Troubleshooting

### Issue: "Wallet Not Detected"
**Solution**:
1. Check wallet extension is installed
2. Refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Enable wallet extension permissions
4. Try different wallet

### Issue: "Insufficient Gas"
**Solution**:
1. Get more SUI from faucet
2. Check gas limit in transaction
3. Retry transaction

### Issue: "Network Connection Failed"
**Solution**:
1. Check internet connection
2. Try different RPC endpoint
3. Clear browser cache
4. Check wallet network setting

### Issue: "Transaction Rejected"
**Solution**:
1. Review transaction details
2. Check wallet balance
3. Ensure wallet is on Testnet
4. Retry transaction

### Issue: "Address Copy Not Working"
**Solution**:
1. Check browser permissions for clipboard
2. Use manual copy (Ctrl+C)
3. Verify HTTPS connection (if applicable)

---

## 📚 Learn More

### Official Sui Documentation
- [Getting Started](https://docs.sui.io/guides/developer/getting-started)
- [dApp Development](https://docs.sui.io/guides/developer/app-examples)
- [Move Programming](https://docs.sui.io/concepts/sui-move-concepts)
- [Testnet Guide](https://docs.sui.io/guides/operator/sui-testnet)

### Useful Links
- **Faucet**: https://testnet.suifaucet.fun/
- **Explorer**: https://testnet.suivision.xyz/
- **Discord**: https://discord.gg/sui
- **GitHub**: https://github.com/MystenLabs/sui

### CLI Installation
```bash
# Install Sui CLI
curl -fsSL https://github.com/MystenLabs/sui/releases/download/devnet/install.sh | sh

# Configure Testnet
sui client switch --env testnet

# Check address
sui client active-address

# Get coins
sui client faucet
```

---

## ✅ Verification Checklist

- [ ] Wallet installed and configured
- [ ] Network set to Testnet
- [ ] Wallet has SUI coins (minimum 0.1 SUI)
- [ ] App loaded at http://localhost:5174/
- [ ] Wallet connected to app
- [ ] Can see account address in header
- [ ] Can see Testnet Status card
- [ ] RPC connection shows as healthy
- [ ] Can create transactions
- [ ] Can view transactions in explorer

---

## 🎉 You're Ready!

Once all checks pass, you can:
- ✅ Create and update greetings
- ✅ Manage coins and currencies
- ✅ Explore advanced features
- ✅ Monitor events and transactions
- ✅ Trade on DeepBook
- ✅ Manage NFTs with Kiosk

**Happy exploring! 🚀**

---

## 💡 Pro Tips

1. **Gas Estimation**: Always review estimated gas before approving
2. **Address Backup**: Save your wallet address (shown in app)
3. **Faucet Limits**: You can request SUI once every 24 hours
4. **Explorer Monitoring**: Keep explorer open to monitor transactions
5. **Wallet Backup**: Store your seed phrase securely
6. **Test Features**: Use Testnet to test before Mainnet deployment

---

**Last Updated**: December 7, 2025  
**Network**: Sui Testnet  
**Status**: ✅ Production Ready
