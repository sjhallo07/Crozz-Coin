// Module declarations and re-exports for sui-indexer framework
// Organizes all framework components for easy access

pub mod types;
pub mod data_source;
pub mod ingestion;
pub mod processor;
pub mod storage;

// Main framework orchestrator
mod framework;
pub use framework::{Indexer, IndexerBuilder, IndexerStatus};

// Core traits and types
pub use types::{
    CheckpointData, CheckpointTransaction, CertifiedCheckpointSummary, CheckpointContents,
    DataSource, Event, ObjectChange, ObjectChangeKind, Owner, ProcessedData, ProcessingMetrics,
    PipelineConfig, PipelineType, QueryFilter, Watermark,
};

pub use data_source::{DataSourceProvider, DataSourceFactory};
pub use ingestion::{IngestionMessage, IngestionPipeline, PipelineSubscriber};
pub use processor::{Processor, SequentialPipeline, ConcurrentPipeline, PipelineExecutor};
pub use storage::{StorageAdapter, StorageConfig, StorageFactory, StorageType};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_module_exports() {
        // Verify all public exports are accessible
        let _: Result<Box<dyn DataSourceProvider>, _> = Err("test");
    }
}
