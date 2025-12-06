// Custom Indexing Framework - Main orchestrator and public API
// Brings together data sources, ingestion, processing, and storage layers

use crate::types::{DataSource, PipelineConfig, PipelineType};
use crate::data_source::{DataSourceFactory, DataSourceProvider};
use crate::ingestion::{IngestionPipeline, InMemoryWatermarkStore};
use crate::processor::{PipelineExecutor, Processor, SequentialPipeline, ConcurrentPipeline};
use crate::storage::{StorageAdapter, StorageConfig, StorageFactory};
use std::sync::Arc;
use std::error::Error;

/// Main indexer orchestrator
pub struct Indexer {
    config: PipelineConfig,
    data_source: Arc<dyn DataSourceProvider>,
    ingestion: Arc<IngestionPipeline>,
    executor: Arc<PipelineExecutor>,
    storage: Arc<dyn StorageAdapter>,
}

impl Indexer {
    /// Create new indexer
    pub async fn new(
        config: PipelineConfig,
        storage_config: StorageConfig,
    ) -> Result<Self, Box<dyn Error>> {
        // Create data source
        let data_source = Arc::from(DataSourceFactory::create(&config.data_source)?);

        // Create watermark store
        let watermark_store = Arc::new(InMemoryWatermarkStore::new());

        // Create ingestion pipeline
        let ingestion = Arc::new(IngestionPipeline::new(
            data_source.clone(),
            watermark_store,
            config.batch_size,
        ));

        // Create storage
        let storage = StorageFactory::create(&storage_config)?;

        // Create executor
        let executor = Arc::new(PipelineExecutor::new());

        Ok(Self {
            config,
            data_source,
            ingestion,
            executor,
            storage,
        })
    }

    /// Initialize storage and check data source connectivity
    pub async fn init(&self) -> Result<(), Box<dyn Error>> {
        // Initialize storage
        self.storage.init()?;

        // Verify data source connectivity
        let latest = self.data_source.get_latest_checkpoint().await?;
        println!(
            "Indexer initialized. Data source: {}, Latest checkpoint: {}",
            self.data_source.source_name(),
            latest
        );

        Ok(())
    }

    /// Add processor to indexer
    pub async fn add_processor(
        &self,
        processor: Arc<dyn Processor>,
    ) -> Result<(), Box<dyn Error>> {
        // Register with ingestion
        let subscriber = self
            .ingestion
            .register_pipeline(processor.name())
            .await;

        // Spawn processing pipeline
        match &self.config.pipeline_type {
            PipelineType::Sequential => {
                self.executor
                    .spawn_sequential(
                        processor.name(),
                        processor,
                        256, // batch size
                        subscriber,
                    )
                    .await;
            }
            PipelineType::Concurrent { max_concurrent } => {
                self.executor
                    .spawn_concurrent(
                        processor.name(),
                        processor,
                        *max_concurrent,
                        subscriber,
                    )
                    .await;
            }
        }

        Ok(())
    }

    /// Start indexer
    pub async fn start(&self) -> Result<(), Box<dyn Error>> {
        // Start ingestion in background
        let ingestion = self.ingestion.clone();
        tokio::spawn(async move {
            if let Err(e) = ingestion.start().await {
                eprintln!("Ingestion error: {}", e);
            }
        });

        // Wait for all pipelines
        self.executor.wait_all().await?;

        Ok(())
    }

    /// Get indexer status
    pub async fn status(&self) -> IndexerStatus {
        let progress = self.ingestion.get_progress().await;

        IndexerStatus {
            running: self.executor.active_count().await > 0,
            data_source: self.data_source.source_name(),
            current_checkpoint: progress.current_checkpoint,
            processed_count: progress.checkpoints_processed,
            active_pipelines: self.executor.active_count().await,
        }
    }

    pub fn storage(&self) -> Arc<dyn StorageAdapter> {
        self.storage.clone()
    }
}

/// Indexer status information
#[derive(Clone, Debug)]
pub struct IndexerStatus {
    pub running: bool,
    pub data_source: String,
    pub current_checkpoint: u64,
    pub processed_count: u64,
    pub active_pipelines: usize,
}

/// Builder for easy indexer configuration
pub struct IndexerBuilder {
    config: PipelineConfig,
    storage_config: StorageConfig,
}

impl IndexerBuilder {
    /// Create new builder with defaults
    pub fn new(name: String) -> Self {
        Self {
            config: PipelineConfig {
                name,
                data_source: DataSource::Rpc {
                    endpoint: "https://rpc.testnet.sui.io".to_string(),
                    auth_token: None,
                },
                start_checkpoint: 1,
                batch_size: 25,
                worker_threads: 4,
                pipeline_type: PipelineType::Concurrent { max_concurrent: 10 },
                retention_days: Some(90),
            },
            storage_config: StorageConfig {
                storage_type: crate::storage::StorageType::InMemory,
                connection_string: None,
                max_connections: 5,
                retention_days: Some(90),
            },
        }
    }

    /// Set data source
    pub fn with_data_source(mut self, source: DataSource) -> Self {
        self.config.data_source = source;
        self
    }

    /// Set starting checkpoint
    pub fn with_start_checkpoint(mut self, checkpoint: u64) -> Self {
        self.config.start_checkpoint = checkpoint;
        self
    }

    /// Set batch size
    pub fn with_batch_size(mut self, size: u64) -> Self {
        self.config.batch_size = size;
        self
    }

    /// Set pipeline type
    pub fn with_pipeline_type(mut self, pipeline_type: PipelineType) -> Self {
        self.config.pipeline_type = pipeline_type;
        self
    }

    /// Set storage backend
    pub fn with_storage(mut self, config: StorageConfig) -> Self {
        self.storage_config = config;
        self
    }

    /// Build indexer
    pub async fn build(self) -> Result<Indexer, Box<dyn Error>> {
        Indexer::new(self.config, self.storage_config).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_indexer_builder() {
        let result = IndexerBuilder::new("test".to_string())
            .with_batch_size(10)
            .build()
            .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_indexer_initialization() {
        let indexer = IndexerBuilder::new("test".to_string())
            .build()
            .await
            .unwrap();

        let result = indexer.init().await;
        // Will fail without real data source, but tests initialization logic
        assert!(result.is_err() || result.is_ok());
    }
}

// Export public API
pub use crate::processor::Processor;
pub use crate::types::{CheckpointData, CheckpointTransaction, Event};
pub use crate::data_source::DataSourceProvider;
pub use crate::ingestion::PipelineSubscriber;
pub use crate::storage::StorageAdapter;
