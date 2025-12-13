# Docker Setup Guide - Crozz Coin

## Overview

This guide documents all the instructions for running the Crozz Coin application in Docker. The project includes both a Sui fullnode and a Kiosk dApp frontend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Running the Sui Fullnode](#running-the-sui-fullnode)
4. [Running the Kiosk dApp](#running-the-kiosk-dapp)
5. [Docker Commands Reference](#docker-commands-reference)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating Systems Supported:**
  - Linux/AMD64
  - Darwin/AMD64
  - Darwin/ARM64 (Apple Silicon)
  - Windows (via WSL2)

### Required Software

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Node.js**: v18 or higher (for dApp development)
- **pnpm**: v9.1.1 or higher (for JavaScript dependencies)

### Installation Commands

```bash
# Install pnpm globally
npm install -g pnpm@9.1.1

# Verify installation
docker --version
docker compose version
pnpm --version
node --version
```

---

## Project Structure

```
Crozz-Coin/
├── docker/                          # Docker configurations
│   ├── fullnode/                    # Sui fullnode Docker setup
│   │   ├── docker-compose.yaml      # Docker Compose configuration
│   │   ├── fullnode-template.yaml   # Fullnode configuration template
│   │   ├── genesis.blob             # Network genesis file (auto-downloaded)
│   │   └── README.md                # Fullnode-specific documentation
│   ├── graphql-rpc/                 # GraphQL RPC Docker setup
│   ├── jaeger-local/                # Jaeger tracing setup
│   └── [other services]/
├── dapps/                           # Decentralized applications
│   ├── kiosk/                       # Kiosk demo dApp
│   │   ├── package.json
│   │   ├── src/
│   │   └── vite.config.ts
│   └── [other dApps]/
├── CLAUDE.md                        # Repository coding guidelines
├── AGENTS.md                        # Agent guidelines
├── DEVELOPMENT_SETUP.md             # Development environment setup
├── QUICK_START.md                   # Quick start guide
└── README.md                        # Main README
```

---

## Running the Sui Fullnode

### Step 1: Navigate to Fullnode Directory

```bash
cd docker/fullnode
```

### Step 2: Download Configuration Files

The following files need to be present in the `docker/fullnode` directory:

#### A. Fullnode Configuration Template

```bash
wget https://github.com/MystenLabs/sui/raw/main/crates/sui-config/data/fullnode-template.yaml
```

#### B. Genesis Blob (for the network)

**For Testnet:**

```bash
wget https://github.com/MystenLabs/sui-genesis/raw/main/testnet/genesis.blob
```

**For Mainnet:**

```bash
wget https://github.com/MystenLabs/sui-genesis/raw/main/mainnet/genesis.blob
```

### Step 3: Configure fullnode-template.yaml

The configuration file should have the following key settings:

```yaml
# Database path
db-path: "/opt/sui/db"

# Network configuration
network-address: "/dns/localhost/tcp/8080/http"
metrics-address: "0.0.0.0:9184"
json-rpc-address: "0.0.0.0:9000"
enable-event-processing: true

# P2P configuration
p2p-config:
  listen-address: "0.0.0.0:8084"

# Genesis configuration
genesis:
  genesis-file-location: "/opt/sui/config/genesis.blob"

# State archive configuration (IMPORTANT: required field)
state-archive-read-config:
  - ingestion-url: "https://checkpoints.testnet.sui.io"  # or mainnet.sui.io
    concurrency: 5
    use-for-pruning-watermark: false  # MUST include this field
```

**Critical Note:** The `use-for-pruning-watermark` field is required and must be present in the configuration.

### Step 4: Update docker-compose.yaml

The Docker Compose file uses the appropriate image version:

```yaml
version: "3.9"
services:
  fullnode:
    image: mysten/sui-node:testnet-v1.33.0  # Use appropriate version
    ports:
      - "8080:8080"      # HTTP server
      - "8084:8084/udp"  # P2P protocol
      - "9000:9000"      # JSON-RPC
      - "9184:9184"      # Prometheus metrics
    volumes:
      - ./fullnode-template.yaml:/opt/sui/config/fullnode.yaml:ro
      - ./genesis.blob:/opt/sui/config/genesis.blob:ro
      - ./suidb:/opt/sui/db:rw
    command: ["/opt/sui/bin/sui-node", "--config-path", "/opt/sui/config/fullnode.yaml"]
volumes:
  suidb:
```

### Step 5: Start the Fullnode

**Start in detached mode (background):**

```bash
docker compose up -d
```

**Start in foreground mode (view logs in real-time):**

```bash
docker compose up
```

### Step 6: Verify Fullnode is Running

Check if the container is running:

```bash
docker compose ps
```

Expected output:

```
NAME       IMAGE                           STATUS
fullnode   mysten/sui-node:testnet-v1.33.0   Up X seconds
```

### Step 7: Test the JSON-RPC Endpoint

```bash
curl -X POST http://localhost:9000 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"sui_getLatestCheckpointSequenceNumber",
    "params":[]
  }'
```

Expected response:

```json
{
  "jsonrpc": "2.0",
  "result": "0",
  "id": 1
}
```

### Step 8: View Fullnode Activity

**View logs:**

```bash
docker compose logs -f  # Follow logs in real-time
docker compose logs --tail 50  # Show last 50 lines
```

**View resource usage:**

```bash
docker stats
```

**View Fullnode Explorer:**

- Open: [https://explorer.sui.io/?network=local](https://explorer.sui.io/?network=local)
- Select "Custom" network and enter: `http://localhost:9000`

### Step 9: Stop the Fullnode

```bash
docker compose stop
```

### Step 10: Clean Up

To remove all containers and volumes (fresh restart):

```bash
docker compose down --volumes
```

---

## Running the Kiosk dApp

### Step 1: Install Dependencies

From the root of the repository:

```bash
pnpm install
```

This installs all dependencies for all workspace packages.

### Step 2: Navigate to Kiosk Directory

```bash
cd dapps/kiosk
```

### Step 3: Start Development Server

```bash
pnpm dev
```

### Step 4: Access the Interface

Once the development server starts, open your browser and navigate to:

**URL:** [http://localhost:5173/](http://localhost:5173/)

Expected startup message:

```
VITE v5.4.21 ready in 179 ms

➜ Local:   http://localhost:5173/
➜ Network: use --host to expose
```

### Step 5: Features Available

The Kiosk dApp provides:

- ✅ Wallet Connection (Sui-compatible wallets)
- ✅ Network Selection (localnet, devnet, testnet, mainnet)
- ✅ Kiosk Search (by address or Kiosk ID)
- ✅ Kiosk Creation (create your own kiosk)
- ✅ Kiosk Management (manage existing kiosks)
- ✅ Marketplace (purchase items from other kiosks)

### Step 6: Build for Production

```bash
pnpm build
```

Output will be in the `dist/` directory.

### Step 7: Preview Production Build

```bash
pnpm preview
```

---

## Docker Commands Reference

### General Commands

```bash
# Check Docker daemon status
docker info

# List all images
docker images

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View Docker version
docker --version
docker compose version
```

### Fullnode Management

```bash
# Navigate to fullnode directory
cd docker/fullnode

# Start fullnode in background
docker compose up -d

# Start fullnode in foreground
docker compose up

# Stop fullnode
docker compose stop

# Restart fullnode
docker compose restart

# Remove fullnode (stops container and removes volumes)
docker compose down --volumes

# View fullnode logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View last N lines
docker compose logs --tail 50

# View logs for specific service
docker compose logs fullnode
```

### Container Inspection

```bash
# Get container ID
docker ps

# Connect to container shell
docker exec -it <CONTAINER_ID> /bin/bash

# View resource usage
docker stats

# View all resource usage
docker stats -a

# Inspect container details
docker inspect <CONTAINER_ID>

# View container logs
docker logs <CONTAINER_ID>

# Follow container logs
docker logs -f <CONTAINER_ID>
```

### Volume Management

```bash
# List all volumes
docker volume ls

# Remove specific volume
docker volume rm fullnode_suidb

# Remove all unused volumes
docker volume prune

# Inspect volume
docker volume inspect fullnode_suidb
```

---

## Troubleshooting

### Issue 1: Protocol Version Mismatch

**Error Message:**

```
ProtocolVersion(104) panic at crates/sui-protocol-config/src/lib.rs:1170:9
```

**Solution:** Update to a newer version of the sui-node image:

```bash
# Update the image in docker-compose.yaml
image: mysten/sui-node:testnet-v1.33.0  # Use a supported version

# Rebuild and restart
docker compose down
docker compose up -d
```

### Issue 2: Configuration Field Missing

**Error Message:**

```
missing field `use-for-pruning-watermark` at line 31 column 20
```

**Solution:** Add the missing field to `fullnode-template.yaml`:

```yaml
state-archive-read-config:
  - ingestion-url: "https://checkpoints.testnet.sui.io"
    concurrency: 5
    use-for-pruning-watermark: false  # Add this line
```

### Issue 3: Port Already in Use

**Error Message:**

```
Error response from daemon: Ports are not available
```

**Solution:** Change the port mappings in docker-compose.yaml:

```yaml
ports:
  - "8081:8080"      # Change from 8080 to 8081
  - "8085:8084/udp"  # Change from 8084 to 8085
  - "9001:9000"      # Change from 9000 to 9001
  - "9185:9184"      # Change from 9184 to 9185
```

### Issue 4: Permission Denied on Database

**Error Message:**

```
rm: cannot remove 'suidb/live': Permission denied
```

**Solution:** Use sudo to remove the directory:

```bash
sudo rm -rf docker/fullnode/suidb
```

### Issue 5: Fullnode Not Syncing

**Symptoms:** Logs show "Failed to find an archive reader to complete the state sync request"

**Solution:**

1. Ensure internet connectivity
2. Verify the correct genesis blob is being used
3. Check that the network checkpoint URL is correct in the configuration
4. Give the fullnode more time to sync (initial sync can take hours)

### Issue 6: RPC Endpoint Not Responding

**Test Command:**

```bash
curl http://localhost:9000
```

**If No Response:**

1. Check container is running: `docker compose ps`
2. Check if port 9000 is exposed: `docker ps`
3. View logs: `docker compose logs --tail 20`
4. Restart the service: `docker compose restart`

### Issue 7: Node Crashes on Startup

**Solution Steps:**

1. Check logs for the specific error: `docker compose logs --tail 100`
2. Remove the database: `sudo rm -rf docker/fullnode/suidb`
3. Verify configuration file syntax: `cat fullnode-template.yaml`
4. Start with a clean state: `docker compose down && docker compose up -d`

---

## Network Configuration Options

### Testnet Setup

**Configuration in fullnode-template.yaml:**

```yaml
state-archive-read-config:
  - ingestion-url: "https://checkpoints.testnet.sui.io"
    concurrency: 5
    use-for-pruning-watermark: false
```

**Docker Image:**

```yaml
image: mysten/sui-node:testnet-v1.33.0
```

**Genesis Blob:**

```bash
wget https://github.com/MystenLabs/sui-genesis/raw/main/testnet/genesis.blob
```

### Mainnet Setup

**Configuration in fullnode-template.yaml:**

```yaml
state-archive-read-config:
  - ingestion-url: "https://checkpoints.mainnet.sui.io"
    concurrency: 5
    use-for-pruning-watermark: false
```

**Docker Image:**

```yaml
image: mysten/sui-node:mainnet-v1.35.0  # Use latest mainnet version
```

**Genesis Blob:**

```bash
wget https://github.com/MystenLabs/sui-genesis/raw/main/mainnet/genesis.blob
```

---

## Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui Discord Community](https://discord.gg/sui)
- [Sui GitHub Repository](https://github.com/MystenLabs/sui)
- [Sui Resources](https://sui.io/resources/)
- [Sui Foundation](https://sui.io/about)

---

## Development Commands

For development on the Sui codebase itself, refer to [CLAUDE.md](./CLAUDE.md):

```bash
# Build a specific crate
cargo build -p sui-core

# Check code without building
cargo check

# Run tests
cargo simtest -p sui-e2e-tests

# Run linting
./scripts/lint.sh
```

---

## Notes

- Docker Compose V2 is used (uses `docker compose` not `docker-compose`)
- The fullnode requires significant disk space for state synchronization
- Initial state sync can take several hours depending on network conditions
- The configuration is automatically created in `/opt/sui/db` inside the container
- Metrics are exposed at port 9184 for Prometheus integration

---

**Last Updated:** December 13, 2025

**Repository:** [MystenLabs/sui - Crozz-Coin Fork](https://github.com/MystenLabs/sui)
