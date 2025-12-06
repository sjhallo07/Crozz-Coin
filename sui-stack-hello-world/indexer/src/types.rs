// Sui Custom Indexer Framework - Core Types
// Comprehensive type definitions for checkpoint data, transactions, events, and storage

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Represents a checkpoint - a batch of transactions with consistent state
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CheckpointData {
    pub checkpoint_summary: CertifiedCheckpointSummary,
    pub checkpoint_contents: CheckpointContents,
    pub transactions: Vec<CheckpointTransaction>,
}

/// Certified checkpoint summary with signatures
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CertifiedCheckpointSummary {
    /// Sequential checkpoint number
    pub sequence_number: u64,
    /// Digest of checkpoint contents
    pub checkpoint_digest: String,
    /// Timestamp of checkpoint creation
    pub timestamp_ms: u64,
    /// Network where checkpoint exists
    pub network_name: String,
    /// Previous checkpoint digest
    pub previous_checkpoint_digest: Option<String>,
    /// Epoch number
    pub epoch: u64,
    /// Reference gas price
    pub reference_gas_price: u64,
    /// Total bytes executed
    pub total_transactions: u64,
    /// Total gas paid
    pub total_gas_units: u64,
}

/// Contents of checkpoint - transactions and events
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CheckpointContents {
    /// Transaction digests in order
    pub transactions: Vec<String>,
    /// User signatures
    pub user_signatures: Vec<String>,
}

/// Single transaction in checkpoint
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CheckpointTransaction {
    /// Transaction digest
    pub digest: String,
    /// Sender address
    pub sender: String,
    /// Transaction kind
    pub kind: TransactionKind,
    /// Gas budget
    pub gas_budget: u64,
    /// Gas price
    pub gas_price: u64,
    /// Transaction data
    pub data: TransactionData,
    /// Transaction effects/results
    pub effects: TransactionEffects,
    /// Events generated
    pub events: Vec<Event>,
    /// Object changes
    pub object_changes: Vec<ObjectChange>,
    /// Timestamp
    pub timestamp_ms: u64,
}

/// Type of transaction
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum TransactionKind {
    /// Program transaction (move call)
    ProgrammableTransaction,
    /// Object transfer
    Transfer,
    /// Publish new module
    Publish,
    /// Upgrade module
    Upgrade,
    /// System transaction
    SystemTransaction,
    /// Other transaction
    Other(String),
}

/// Transaction execution data
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TransactionData {
    /// Inputs to transaction
    pub inputs: Vec<TransactionInput>,
    /// Commands executed
    pub commands: Vec<Command>,
}

/// Input to transaction
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum TransactionInput {
    /// Pure value input
    Pure {
        bytes: String,
    },
    /// Object reference input
    Object {
        object_id: String,
        version: u64,
        digest: String,
    },
    /// Shared object input
    SharedObject {
        object_id: String,
        initial_shared_version: u64,
    },
}

/// Command in transaction
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Command {
    /// Command type
    pub kind: String,
    /// Command arguments
    pub args: Vec<String>,
}

/// Effects of transaction execution
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TransactionEffects {
    /// Transaction status
    pub status: TransactionStatus,
    /// Gas used
    pub gas_used: GasEffects,
    /// Object changes
    pub modified_at_versions: Vec<ModifiedObject>,
    /// Objects created
    pub created: Vec<CreatedObject>,
    /// Objects deleted
    pub deleted: Vec<DeletedObject>,
    /// Shared object mutations
    pub shared_objects: Vec<SharedObjectMutation>,
    /// Dependencies
    pub dependencies: Vec<String>,
}

/// Status of transaction
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum TransactionStatus {
    Success,
    Failure {
        error: String,
    },
}

/// Gas usage
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GasEffects {
    pub gas_object: String,
    pub gas_cost: u64,
    pub computation_cost: u64,
    pub storage_cost: u64,
    pub storage_rebate: u64,
    pub non_refundable_storage_fee: u64,
}

/// Modified object
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ModifiedObject {
    pub object_id: String,
    pub sequence_number: u64,
}

/// Created object
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreatedObject {
    pub object_id: String,
    pub version: u64,
    pub owner: Owner,
}

/// Deleted object
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DeletedObject {
    pub object_id: String,
    pub version: u64,
}

/// Shared object mutation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SharedObjectMutation {
    pub object_id: String,
    pub version: u64,
}

/// Object ownership
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Owner {
    AddressOwner(String),
    ObjectOwner(String),
    Shared { initial_shared_version: u64 },
    Immutable,
}

/// Blockchain event
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Event {
    /// Package containing event type
    pub package_id: String,
    /// Module containing event
    pub module: String,
    /// Event type
    pub event_type: String,
    /// Event sender
    pub sender: String,
    /// Transaction that created event
    pub transaction_module: String,
    /// Event JSON data
    pub parsed_json: serde_json::Value,
    /// Raw event bytes
    pub bcs: String,
    /// Event index
    pub event_index: u64,
}

/// Object state change
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ObjectChange {
    /// Type of change
    pub kind: ObjectChangeKind,
    /// Object ID
    pub object_id: String,
    /// Object version
    pub version: u64,
    /// Object digest
    pub digest: Option<String>,
}

/// Type of object change
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ObjectChangeKind {
    /// Object created
    Created,
    /// Object mutated
    Mutated,
    /// Object transferred
    Transferred,
    /// Object deleted
    Deleted,
    /// Object wrapped
    Wrapped,
    /// Object unwrapped
    Unwrapped,
}

/// Data source for checkpoints
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DataSource {
    /// Remote checkpoint store (e.g., S3, HTTP)
    Remote {
        url: String,
        network: String,
    },
    /// Local filesystem
    Local {
        path: String,
    },
    /// Sui RPC endpoint
    Rpc {
        endpoint: String,
        auth_token: Option<String>,
    },
}

/// Watermark for tracking progress
#[derive(Clone, Debug, Serialize, Deserialize, Default)]
pub struct Watermark {
    /// Latest processed checkpoint sequence
    pub checkpoint_sequence: u64,
    /// Latest processed timestamp
    pub timestamp_ms: u64,
    /// Last updated time
    pub updated_at: u64,
}

/// Pipeline checkpoint state
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PipelineCheckpoint {
    /// Pipeline name
    pub pipeline_name: String,
    /// Watermark progress
    pub watermark: Watermark,
    /// Last error
    pub last_error: Option<String>,
    /// Error count
    pub error_count: u64,
}

/// Processed data ready for storage
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProcessedData {
    /// Source checkpoint sequence
    pub checkpoint_sequence: u64,
    /// Processed records
    pub records: Vec<serde_json::Value>,
    /// Metrics
    pub metrics: ProcessingMetrics,
}

/// Processing metrics
#[derive(Clone, Debug, Serialize, Deserialize, Default)]
pub struct ProcessingMetrics {
    /// Number of transactions processed
    pub transaction_count: u64,
    /// Number of events processed
    pub event_count: u64,
    /// Number of object changes
    pub object_change_count: u64,
    /// Processing duration (ms)
    pub processing_duration_ms: u64,
    /// Records created
    pub records_created: u64,
}

/// Configuration for pipeline
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PipelineConfig {
    /// Pipeline identifier
    pub name: String,
    /// Data source
    pub data_source: DataSource,
    /// Starting checkpoint
    pub start_checkpoint: u64,
    /// Maximum checkpoints to process per batch
    pub batch_size: u64,
    /// Number of worker threads
    pub worker_threads: usize,
    /// Pipeline type
    pub pipeline_type: PipelineType,
    /// Retention policy (days)
    pub retention_days: Option<u64>,
}

/// Type of processing pipeline
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PipelineType {
    /// Sequential in-order processing
    Sequential,
    /// Concurrent out-of-order processing
    Concurrent {
        max_concurrent: usize,
    },
}

/// Ingestion progress
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IngestionProgress {
    /// Current checkpoint being processed
    pub current_checkpoint: u64,
    /// Last checkpoint fetched
    pub last_fetched_checkpoint: u64,
    /// Checkpoints processed
    pub checkpoints_processed: u64,
    /// Total events processed
    pub total_events: u64,
    /// Processing rate (events/sec)
    pub processing_rate: f64,
    /// Last update timestamp
    pub last_update_ms: u64,
}

/// Indexer status
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IndexerStatus {
    /// Is indexer running
    pub is_running: bool,
    /// Current checkpoint
    pub current_checkpoint: u64,
    /// Total processed
    pub total_processed: u64,
    /// Errors encountered
    pub error_count: u64,
    /// Last error
    pub last_error: Option<String>,
    /// Uptime (ms)
    pub uptime_ms: u64,
    /// Progress per pipeline
    pub pipelines: HashMap<String, IngestionProgress>,
}

/// Query filter for data retrieval
#[derive(Clone, Debug, Default)]
pub struct QueryFilter {
    /// Filter by sender
    pub sender: Option<String>,
    /// Filter by event type
    pub event_type: Option<String>,
    /// Filter by object ID
    pub object_id: Option<String>,
    /// Filter by transaction kind
    pub transaction_kind: Option<TransactionKind>,
    /// Start checkpoint (inclusive)
    pub start_checkpoint: Option<u64>,
    /// End checkpoint (inclusive)
    pub end_checkpoint: Option<u64>,
    /// Start timestamp (inclusive)
    pub start_timestamp_ms: Option<u64>,
    /// End timestamp (inclusive)
    pub end_timestamp_ms: Option<u64>,
    /// Limit results
    pub limit: Option<u64>,
}

/// Query result
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct QueryResult {
    /// Query execution time (ms)
    pub execution_time_ms: u64,
    /// Number of results
    pub result_count: u64,
    /// Results
    pub results: Vec<serde_json::Value>,
}

/// Retention configuration
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RetentionPolicy {
    /// Keep data for N days
    pub days: u64,
    /// Keep data for N checkpoints
    pub checkpoints: Option<u64>,
    /// Prune automatically
    pub auto_prune: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_watermark_serialization() {
        let watermark = Watermark {
            checkpoint_sequence: 100,
            timestamp_ms: 1000000,
            updated_at: 2000000,
        };
        let json = serde_json::to_string(&watermark).unwrap();
        let deserialized: Watermark = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.checkpoint_sequence, 100);
    }

    #[test]
    fn test_owner_variants() {
        let owner = Owner::AddressOwner("0x1234".to_string());
        let json = serde_json::to_string(&owner).unwrap();
        assert!(json.contains("0x1234"));
    }
}
