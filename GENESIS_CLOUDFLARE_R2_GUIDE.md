# Sui Genesis & Cloudflare R2 Storage Guide

## Genesis Overview

Genesis refers to the **initial state of the Sui blockchain**. When launching a network, validators collaborate by providing:
- Public keys
- Network addresses
- Validator information

### Genesis Process

1. **Initial Committee Collaboration**: All validators contribute their information to a shared workspace
2. **Genesis Checkpoint Generation**: Sui generates the initial, unsigned genesis checkpoint (checkpoint #0)
3. **Validator Signatures**: Each validator provides their signature
4. **Certificate Aggregation**: Signatures are aggregated to form a certificate
5. **Genesis Bundle**: Checkpoint and initial objects are bundled into `genesis.blob`

### Genesis Blob File

The `genesis.blob` file is used to initialize state when running the `sui-node` binary for:
- Validators
- Full nodes

**Location**: Available in the [sui-genesis](https://github.com/mystenlabs/sui-genesis) repository

**For Setup**: See [Sui Full Node Configuration](https://docs.sui.io/guides/operator/sui-full-node#set-up-from-source) for genesis.blob retrieval

---

## Cloudflare R2 Storage (Free & Permissionless)

### Key Features

- ✅ **No Credentials Required** - Permissionless access
- ✅ **Free Tier Available** - No egress costs
- ✅ **S3 Compatible API** - Uses standard S3 protocol
- ✅ **Formal Snapshots Only** - Ideal for validators and State Sync Full Nodes (SSFNs)
- ✅ **Quick Bootstrap** - Faster than RocksDB snapshots
- ✅ **Database Agnostic** - Works with any backend

### Configuration

```yaml
object-store-config:
  object-store: "S3"  # R2 is S3-compatible
  bucket: "<CLOUDFLARE-R2-BUCKET-NAME>"
  aws-access-key-id: ""      # Optional for R2
  aws-secret-access-key: ""  # Optional for R2
  aws-region: "auto"          # R2 region
  object-store-connection-limit: 200  # For formal snapshots
  
  # R2-specific configuration
  endpoint: "https://<ACCOUNT-ID>.r2.cloudflarestorage.com"
```

### Advantages for Operators

1. **Cost Effective**: No egress charges for reads
2. **No Authentication**: Use public buckets for formal snapshots
3. **Fast Restoration**: Optimized for Sui's formal snapshot format
4. **Scalable**: Handle large formal snapshots efficiently
5. **Global CDN**: Cloudflare's edge network for faster downloads

---

## Storage Backends Comparison

| Backend | Type | Credentials | Cost | Use Case | Speed |
|---------|------|-------------|------|----------|-------|
| **RocksDB** | Local | None | Storage only | Full nodes with history | Fast |
| **Formal Snapshots (R2)** | Remote | Optional | Free | Validators, SSFNs | Very Fast |
| **S3** | Cloud | Required | Egress charges | Enterprise backup | Medium |
| **GCS** | Cloud | Required | Egress charges | Google ecosystem | Medium |
| **Azure Blob** | Cloud | Required | Egress charges | Azure ecosystem | Medium |
| **Cloudflare R2** | Cloud | Optional | Free | Permissionless bootstrap | Fast |

---

## .gitignore Configuration

Updated `.gitignore` files now include:

```gitignore
# Node.js (functional only)
node_modules/
!node_modules/.pnpm
!node_modules/@mysten
!node_modules/vite
!node_modules/react

# Storage & Snapshots
snapshots/
storage/

# Cloud Storage (Cloudflare R2: Free, no credentials - formal snapshots only)
*.r2-snapshot
*.s3-snapshot
*.gcs-snapshot
*.azure-snapshot
```

### Files Updated

- ✅ `.gitignore` (root)
- ✅ `sui-stack-hello-world/.gitignore`
- ✅ `dapps/kiosk/.gitignore`
- ✅ `dapps/kiosk-cli/.gitignore`
- ✅ `dapps/multisig-toolkit/.gitignore`

**Commit**: `2262ad7451` - "chore: update .gitignore files with Cloudflare R2 and functional node_modules only"

---

## Usage Pattern: Validator Setup

### 1. Download Genesis Blob

```bash
# From sui-genesis repository
git clone https://github.com/mystenlabs/sui-genesis.git
cd sui-genesis
# Get appropriate genesis.blob for network (mainnet/testnet)
```

### 2. Configure with Cloudflare R2

```yaml
# ~/.sui/sui_config/client.yaml
object-store-config:
  object-store: "S3"
  bucket: "sui-formal-snapshots"
  endpoint: "https://<ACCOUNT-ID>.r2.cloudflarestorage.com"
  aws-region: "auto"
  object-store-connection-limit: 200

# Genesis configuration
genesis-checkpoint-file: "./genesis.blob"
```

### 3. Initialize Node

```bash
sui-node --config-path ~/.sui/sui_config/client.yaml
```

---

## Best Practices

1. **For Validators**: Use formal snapshots + Cloudflare R2
   - Minimal data
   - Fast sync
   - No credentials needed

2. **For Full Nodes (RPC)**: Use RocksDB snapshots locally
   - Includes historical data
   - Better for queries
   - Larger storage footprint

3. **For Backup**: Use Cloudflare R2 + formal snapshots
   - Permissionless access
   - No egress costs
   - Easy restoration

4. **For Enterprise**: Use S3/GCS/Azure
   - Enterprise SLAs
   - Integration with existing infrastructure
   - Full audit trails

---

## References

- **Sui Genesis Docs**: https://docs.sui.io/guides/operator/genesis
- **Sui Full Node Setup**: https://docs.sui.io/guides/operator/sui-full-node
- **Sui Storage Options**: https://docs.sui.io/guides/operator/data-management
- **Database Snapshots**: https://docs.sui.io/guides/operator/snapshots
- **Cloudflare R2**: https://www.cloudflare.com/products/r2/

---

## Storage Command Reference

### Prune Database

```bash
# Keep last N epochs, discard everything else
sui-node --prune-older-than-epochs 10
```

### Create Formal Snapshot

```bash
# Take formal snapshot with current epoch
sui-node snapshot create --output ./snapshot.formal
```

### Restore from Snapshot

```bash
# Restore from Cloudflare R2
sui-node snapshot restore --source s3://bucket/snapshot.formal
```

---

*Last Updated: December 10, 2025*  
*Commit: 2262ad7451*
