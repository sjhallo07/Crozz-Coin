// Advanced Examples - Real-world indexing patterns for Sui blockchain

use sui_indexer::*;
use std::sync::Arc;
use async_trait::async_trait;
use std::collections::HashMap;

/// Example 1: Bridge Activity Tracker
/// Tracks all cross-chain bridge transactions and aggregates volume by bridge
pub struct BridgeActivityIndexer {
    bridge_modules: Vec<String>,
}

impl BridgeActivityIndexer {
    pub fn new() -> Self {
        Self {
            bridge_modules: vec![
                "bridge::sui_bridge".to_string(),
                "wormhole::bridge".to_string(),
                "axelar::bridge".to_string(),
            ],
        }
    }

    fn extract_bridge_events(&self, checkpoint: &CheckpointData) -> Vec<serde_json::Value> {
        let mut bridge_events = Vec::new();

        for tx in &checkpoint.transactions {
            for event in &tx.events {
                // Check if event is from any of our tracked bridges
                if self.bridge_modules.iter().any(|m| event.package_id.contains(m)) {
                    bridge_events.push(serde_json::json!({
                        "bridge": event.module,
                        "event_type": event.event_type,
                        "sender": event.sender,
                        "transaction": tx.digest,
                        "data": event.parsed_json,
                        "timestamp": tx.timestamp_ms,
                        "checkpoint": checkpoint.checkpoint_summary.sequence_number,
                    }));
                }
            }
        }

        bridge_events
    }
}

#[async_trait]
impl Processor for BridgeActivityIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let records = self.extract_bridge_events(checkpoint);

        let metrics = ProcessingMetrics {
            event_count: records.len() as u64,
            records_created: records.len() as u64,
            ..Default::default()
        };

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics,
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        println!("[Bridge Activity] Committed {} bridge events", data.metrics.event_count);
        Ok(())
    }

    fn name(&self) -> String {
        "bridge_activity_tracker".to_string()
    }
}

/// Example 2: Lending Protocol Monitor
/// Tracks borrow/lend events and maintains position data
pub struct LendingProtocolIndexer {
    lending_module: String,
}

impl LendingProtocolIndexer {
    pub fn new(lending_module: String) -> Self {
        Self { lending_module }
    }

    fn extract_lending_events(&self, checkpoint: &CheckpointData) -> (Vec<serde_json::Value>, HashMap<String, u64>) {
        let mut events = Vec::new();
        let mut total_borrowed: HashMap<String, u64> = HashMap::new();

        for tx in &checkpoint.transactions {
            for event in &tx.events {
                if event.module == self.lending_module {
                    match event.event_type.as_str() {
                        "Borrow" => {
                            let amount = event.parsed_json["amount"].as_u64().unwrap_or(0);
                            let asset = event.parsed_json["asset"].as_str().unwrap_or("");

                            total_borrowed
                                .entry(asset.to_string())
                                .and_modify(|a| *a += amount)
                                .or_insert(amount);

                            events.push(serde_json::json!({
                                "event": "Borrow",
                                "borrower": event.sender,
                                "asset": asset,
                                "amount": amount,
                                "timestamp": tx.timestamp_ms,
                            }));
                        }
                        "Repay" => {
                            let amount = event.parsed_json["amount"].as_u64().unwrap_or(0);

                            events.push(serde_json::json!({
                                "event": "Repay",
                                "borrower": event.sender,
                                "amount": amount,
                                "timestamp": tx.timestamp_ms,
                            }));
                        }
                        _ => {}
                    }
                }
            }
        }

        (events, total_borrowed)
    }
}

#[async_trait]
impl Processor for LendingProtocolIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let (events, totals) = self.extract_lending_events(checkpoint);

        // Create aggregate record
        let mut records = events;
        records.push(serde_json::json!({
            "type": "aggregate",
            "total_borrowed_by_asset": totals,
            "checkpoint": checkpoint.checkpoint_summary.sequence_number,
        }));

        let metrics = ProcessingMetrics {
            event_count: records.len() as u64,
            records_created: records.len() as u64,
            ..Default::default()
        };

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics,
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        println!("[Lending] Committed {} lending events", data.metrics.event_count);
        Ok(())
    }

    fn name(&self) -> String {
        "lending_protocol_indexer".to_string()
    }
}

/// Example 3: Object Lifecycle Tracker
/// Tracks creation, mutation, and destruction of specific object types
pub struct ObjectLifecycleIndexer {
    object_type_filter: Option<String>,
}

impl ObjectLifecycleIndexer {
    pub fn new(object_type_filter: Option<String>) -> Self {
        Self { object_type_filter }
    }

    fn matches_filter(&self, object_id: &str) -> bool {
        if let Some(ref filter) = self.object_type_filter {
            object_id.contains(filter)
        } else {
            true
        }
    }

    fn extract_object_lifecycle(&self, checkpoint: &CheckpointData) -> Vec<serde_json::Value> {
        let mut events = Vec::new();

        for tx in &checkpoint.transactions {
            for change in &tx.object_changes {
                if self.matches_filter(&change.object_id) {
                    events.push(serde_json::json!({
                        "object_id": change.object_id,
                        "change_type": format!("{:?}", change.kind),
                        "version": change.version,
                        "digest": change.digest,
                        "transaction": tx.digest,
                        "sender": tx.sender,
                        "timestamp": tx.timestamp_ms,
                    }));
                }
            }
        }

        events
    }
}

#[async_trait]
impl Processor for ObjectLifecycleIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let records = self.extract_object_lifecycle(checkpoint);

        let metrics = ProcessingMetrics {
            object_change_count: records.len() as u64,
            records_created: records.len() as u64,
            ..Default::default()
        };

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics,
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        println!("[Object Lifecycle] Committed {} object changes", data.metrics.object_change_count);
        Ok(())
    }

    fn name(&self) -> String {
        "object_lifecycle_tracker".to_string()
    }
}

/// Example 4: Transaction Fee Analyzer
/// Analyzes gas usage patterns and fees across all transactions
pub struct TransactionFeeAnalyzer;

impl TransactionFeeAnalyzer {
    fn analyze_fees(&self, checkpoint: &CheckpointData) -> serde_json::Value {
        let mut total_gas = 0u64;
        let mut total_fees = 0u64;
        let mut by_sender: HashMap<String, u64> = HashMap::new();
        let mut by_kind: HashMap<String, u64> = HashMap::new();

        for tx in &checkpoint.transactions {
            let gas_cost = tx.effects.gas_used.computation_cost 
                + tx.effects.gas_used.storage_cost 
                - tx.effects.gas_used.storage_rebate;

            total_gas += gas_cost;
            total_fees += gas_cost;

            // By sender
            by_sender
                .entry(tx.sender.clone())
                .and_modify(|v| *v += gas_cost)
                .or_insert(gas_cost);

            // By transaction kind
            by_kind
                .entry(format!("{:?}", tx.kind))
                .and_modify(|v| *v += gas_cost)
                .or_insert(gas_cost);
        }

        serde_json::json!({
            "checkpoint": checkpoint.checkpoint_summary.sequence_number,
            "total_transactions": checkpoint.transactions.len(),
            "total_gas_cost": total_gas,
            "average_gas_per_tx": if !checkpoint.transactions.is_empty() {
                total_gas / checkpoint.transactions.len() as u64
            } else {
                0
            },
            "top_spenders": by_sender.iter()
                .map(|(addr, cost)| (addr.clone(), cost))
                .collect::<Vec<_>>(),
            "by_transaction_type": by_kind,
        })
    }
}

#[async_trait]
impl Processor for TransactionFeeAnalyzer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let analysis = self.analyze_fees(checkpoint);

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records: vec![analysis],
            metrics: ProcessingMetrics {
                transaction_count: checkpoint.transactions.len() as u64,
                records_created: 1,
                ..Default::default()
            },
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        println!("[Fee Analysis] Committed fee analysis for checkpoint {}", 
            data.checkpoint_sequence);
        Ok(())
    }

    fn name(&self) -> String {
        "transaction_fee_analyzer".to_string()
    }
}

/// Example 5: Multi-Indexer Setup
/// Shows how to run multiple indexers simultaneously on the same data source
#[tokio::main]
pub async fn run_multi_indexer_setup() -> Result<(), Box<dyn std::error::Error>> {
    // Create indexer
    let indexer = IndexerBuilder::new("multi_indexer".to_string())
        .with_data_source(DataSource::Rpc {
            endpoint: "https://rpc.testnet.sui.io".to_string(),
            auth_token: None,
        })
        .with_batch_size(25)
        .with_pipeline_type(PipelineType::Concurrent { max_concurrent: 5 })
        .build()
        .await?;

    indexer.init().await?;

    // Add multiple processors
    indexer.add_processor(Arc::new(BridgeActivityIndexer::new())).await?;
    indexer.add_processor(Arc::new(
        LendingProtocolIndexer::new("lending::protocol".to_string())
    )).await?;
    indexer.add_processor(Arc::new(
        ObjectLifecycleIndexer::new(Some("0xnft".to_string()))
    )).await?;
    indexer.add_processor(Arc::new(TransactionFeeAnalyzer)).await?;

    println!("Starting multi-indexer with 4 concurrent processors...");
    indexer.start().await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bridge_indexer_creation() {
        let indexer = BridgeActivityIndexer::new();
        assert_eq!(indexer.bridge_modules.len(), 3);
    }

    #[test]
    fn test_lending_indexer_creation() {
        let indexer = LendingProtocolIndexer::new("lending::v1".to_string());
        assert_eq!(indexer.lending_module, "lending::v1");
    }

    #[test]
    fn test_object_lifecycle_filter() {
        let indexer = ObjectLifecycleIndexer::new(Some("0xtype".to_string()));
        assert!(indexer.matches_filter("0xtype123"));
        assert!(!indexer.matches_filter("0xother456"));
    }
}
