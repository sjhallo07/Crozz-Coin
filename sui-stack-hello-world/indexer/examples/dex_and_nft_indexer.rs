// Example: DEX Trading Volume Indexer
// Tracks and aggregates DEX trading volumes from Sui blockchain

use sui_indexer::*;
use std::sync::Arc;
use async_trait::async_trait;
use serde::{Serialize, Deserialize};

/// DEX trade event structure
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DexTrade {
    pub transaction_digest: String,
    pub timestamp_ms: u64,
    pub pool_id: String,
    pub token_a: String,
    pub token_b: String,
    pub amount_a: u64,
    pub amount_b: u64,
    pub trader: String,
}

/// DEX Volume Aggregator
pub struct DexVolumeIndexer {
    name: String,
}

impl DexVolumeIndexer {
    pub fn new() -> Self {
        Self {
            name: "dex_volume_indexer".to_string(),
        }
    }

    /// Extract DEX events from checkpoint
    fn extract_trades(&self, checkpoint: &CheckpointData) -> Vec<DexTrade> {
        let mut trades = Vec::new();

        for tx in &checkpoint.transactions {
            for event in &tx.events {
                // Look for swap events (example module/event pattern)
                if event.module == "dex" && event.event_type.contains("Swap") {
                    if let Ok(trade) = self.parse_trade_event(event, tx) {
                        trades.push(trade);
                    }
                }
            }
        }

        trades
    }

    /// Parse individual trade event
    fn parse_trade_event(
        &self,
        event: &Event,
        tx: &CheckpointTransaction,
    ) -> Result<DexTrade, Box<dyn std::error::Error>> {
        let json = &event.parsed_json;

        Ok(DexTrade {
            transaction_digest: tx.digest.clone(),
            timestamp_ms: tx.timestamp_ms,
            pool_id: json["pool_id"].as_str().unwrap_or("").to_string(),
            token_a: json["token_a"].as_str().unwrap_or("").to_string(),
            token_b: json["token_b"].as_str().unwrap_or("").to_string(),
            amount_a: json["amount_a"].as_u64().unwrap_or(0),
            amount_b: json["amount_b"].as_u64().unwrap_or(0),
            trader: tx.sender.clone(),
        })
    }
}

#[async_trait]
impl Processor for DexVolumeIndexer {
    async fn process(&self, checkpoint: &CheckpointData) -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let trades = self.extract_trades(checkpoint);

        // Aggregate volumes
        let mut volume_by_pool: std::collections::HashMap<String, (u64, u64)> = std::collections::HashMap::new();

        for trade in &trades {
            let entry = volume_by_pool.entry(trade.pool_id.clone()).or_insert((0, 0));
            entry.0 += trade.amount_a;
            entry.1 += trade.amount_b;
        }

        // Create records
        let mut records = Vec::new();
        for (pool_id, (vol_a, vol_b)) in volume_by_pool {
            records.push(serde_json::json!({
                "pool_id": pool_id,
                "token_a_volume": vol_a,
                "token_b_volume": vol_b,
                "trade_count": trades.iter().filter(|t| t.pool_id == pool_id).count(),
                "checkpoint": checkpoint.checkpoint_summary.sequence_number,
            }));
        }

        // Create metrics
        let metrics = ProcessingMetrics {
            transaction_count: checkpoint.transactions.len() as u64,
            event_count: trades.len() as u64,
            object_change_count: 0,
            processing_duration_ms: 0,
            records_created: records.len() as u64,
        };

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics,
        })
    }

    async fn commit(&self, data: &ProcessedData) -> Result<(), Box<dyn std::error::Error>> {
        // In real implementation, would store to database
        println!(
            "[{}] Committed {} volume records from checkpoint {}",
            self.name, data.metrics.records_created, data.checkpoint_sequence
        );

        for record in &data.records {
            println!("  {:?}", record);
        }

        Ok(())
    }

    fn name(&self) -> String {
        self.name.clone()
    }
}

/// Example: NFT Collection Activity Monitor
pub struct NftActivityIndexer {
    name: String,
    collection_filter: Option<String>,
}

impl NftActivityIndexer {
    pub fn new(collection_filter: Option<String>) -> Self {
        Self {
            name: "nft_activity_indexer".to_string(),
            collection_filter,
        }
    }

    fn extract_nft_transfers(&self, checkpoint: &CheckpointData) -> Vec<serde_json::Value> {
        let mut transfers = Vec::new();

        for tx in &checkpoint.transactions {
            for change in &tx.object_changes {
                if matches!(change.kind, crate::types::ObjectChangeKind::Transferred) {
                    // Check if transfer matches collection filter
                    if let Some(ref filter) = self.collection_filter {
                        if change.object_id.contains(filter) {
                            transfers.push(serde_json::json!({
                                "object_id": change.object_id,
                                "transaction": tx.digest,
                                "sender": tx.sender,
                                "timestamp": tx.timestamp_ms,
                            }));
                        }
                    }
                }
            }
        }

        transfers
    }
}

#[async_trait]
impl Processor for NftActivityIndexer {
    async fn process(&self, checkpoint: &CheckpointData) -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let transfers = self.extract_nft_transfers(checkpoint);

        let metrics = ProcessingMetrics {
            transaction_count: checkpoint.transactions.len() as u64,
            event_count: 0,
            object_change_count: transfers.len() as u64,
            processing_duration_ms: 0,
            records_created: transfers.len() as u64,
        };

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records: transfers,
            metrics,
        })
    }

    async fn commit(&self, data: &ProcessedData) -> Result<(), Box<dyn std::error::Error>> {
        println!(
            "[{}] Committed {} NFT transfers from checkpoint {}",
            self.name, data.metrics.records_created, data.checkpoint_sequence
        );
        Ok(())
    }

    fn name(&self) -> String {
        self.name.clone()
    }
}

/// Example usage
#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create indexer with testnet RPC
    let indexer = IndexerBuilder::new("dex_and_nft_indexer".to_string())
        .with_data_source(DataSource::Rpc {
            endpoint: "https://rpc.testnet.sui.io".to_string(),
            auth_token: None,
        })
        .with_start_checkpoint(1000)
        .with_batch_size(25)
        .with_pipeline_type(PipelineType::Concurrent { max_concurrent: 5 })
        .with_storage(StorageConfig {
            storage_type: crate::storage::StorageType::InMemory,
            connection_string: None,
            max_connections: 5,
            retention_days: Some(90),
        })
        .build()
        .await?;

    // Initialize
    indexer.init().await?;

    // Add processors
    let dex_indexer = Arc::new(DexVolumeIndexer::new());
    indexer.add_processor(dex_indexer).await?;

    let nft_indexer = Arc::new(NftActivityIndexer::new(None));
    indexer.add_processor(nft_indexer).await?;

    // Run indexer
    println!("Starting indexer...");
    indexer.start().await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dex_indexer_creation() {
        let indexer = DexVolumeIndexer::new();
        assert_eq!(indexer.name, "dex_volume_indexer");
    }

    #[test]
    fn test_nft_indexer_with_filter() {
        let indexer = NftActivityIndexer::new(Some("0xnft".to_string()));
        assert!(indexer.collection_filter.is_some());
    }
}
