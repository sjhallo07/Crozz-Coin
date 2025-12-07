# Sui Stack Hello World App

A quick-start template built on the Sui Stack. This hello world app demonstrates creating and sharing greeting messages that anyone can edit - like a collaborative document where users can create posts and others can modify the text.

## Quick Start (Try it first!)

Want to see it working immediately? The app comes pre-configured with a published package so you can explore the experience right away:

1. Navigate to [`/ui/`](./ui/) directory
2. Run `pnpm install`
3. Run `pnpm dev`
4. Visit [http://localhost:5173/](http://localhost:5173/)

This uses existing package IDs so you can experience the app without any setup. To customize the functionality or deploy your own version, follow the steps below.

## Deploy Your Own Version

### Prerequisites

- Set up the Sui development environment ([installation guide](https://docs.sui.io/guides/developer/getting-started/sui-install))

### Publish hello-world package

1. Navigate to [`/move/hello-world/`](./move/hello-world/) directory
2. Run `sui client publish` to publish package
3. Copy the `PackageID` found in the list of `Published Objects` in the `Object Changes` section of the output. Paste it in `TESTNET_HELLO_WORLD_PACKAGE_ID` in [`./ui/src/constants.ts`](./ui/src/constants.ts).

### Run frontend

1. Navigate to [`/ui/`](./ui/) directory.
2. Run `pnpm install`
3. Run `pnpm dev`
4. Visit [http://localhost:5173/](http://localhost:5173/)

## 🌐 Local Network Development

### Testing with Local Sui Network

To develop and test against a local Sui network instead of testnet:

#### Quick Setup (2 minutes)

```bash
# 1. Start local network in one terminal
sui start --with-faucet --force-regenesis --epoch-duration-ms 5000

# 2. In another terminal, switch Sui CLI to local
sui client new-env --alias local --rpc http://127.0.0.1:9000
sui client switch --env local

# 3. Request test SUI
sui client faucet

# 4. Publish package locally
cd move/hello-world
sui client publish --gas-budget 100000000

# 5. Copy PackageID to ui/src/constants.ts
```

#### Configure dApp for Local Network

Update `ui/src/constants.ts`:

```typescript
export const HELLO_WORLD_PACKAGE_ID = "YOUR_LOCAL_PACKAGE_ID"; // From step 4
export const NETWORK = "local"; // Use local network
```

Create `.env.local` in `/ui/`:

```
VITE_SUI_NETWORK=local
VITE_FULLNODE_URL=http://127.0.0.1:9000
VITE_FAUCET_URL=http://127.0.0.1:9123
```

#### Run dApp Connected to Local Network

```bash
cd ui
pnpm dev  # Connects to local network via .env.local
```

### Setup Variations

**For Full Development Stack** (Indexer + GraphQL):

```bash
sui start --with-faucet --with-indexer --with-graphql --force-regenesis --epoch-duration-ms 5000
# GraphQL IDE available at http://127.0.0.1:9125
```

**For Persistent State** (Keep data between restarts):

```bash
sui start --with-faucet --epoch-duration-ms 5000
# Remove --force-regenesis to preserve state
```

**For Production-Like Testing** (Realistic epochs):

```bash
sui start --with-faucet --force-regenesis
# Uses default 24-hour epochs
```

### Local Network Port Configuration

- **RPC Server**: <http://127.0.0.1:9000>
- **Faucet**: <http://127.0.0.1:9123>  
- **GraphQL**: <http://127.0.0.1:9125> (with `--with-graphql`)
- **Indexer**: <http://127.0.0.1:9124> (with `--with-indexer`)

### Troubleshooting Local Network

**Port 9000 already in use?**

```bash
# Kill existing process
lsof -i :9000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use custom port
sui start --fullnode-rpc-port 8000 --with-faucet
```

**No gas in faucet?**

```bash
# Request more test SUI
sui client faucet

# Check balance
sui client gas

# May need to wait 60 seconds between requests
```

**Transaction failed?**

```bash
# Check active address
sui client active-address

# Verify you're on local network
sui client envs

# Try reducing gas budget in code
```

## More Information

Visit the [Sui 101 Local Network Guide](https://docs.sui.io/guides/developer/sui-101/local-network) for detailed setup instructions and advanced configurations.
