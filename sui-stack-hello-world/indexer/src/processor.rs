// Processing layer - Sequential and Concurrent pipeline implementations
// Orchestrates checkpoint processing, manages concurrency, maintains watermarks

use crate::types::{CheckpointData, ProcessedData, ProcessingMetrics, Watermark};
use crate::ingestion::PipelineSubscriber;
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Trait for processing logic - implement this for custom data processing
#[async_trait]
pub trait Processor: Send + Sync {
    /// Process checkpoint data and return processed records
    async fn process(&self, checkpoint: &CheckpointData) -> Result<ProcessedData, Box<dyn std::error::Error>>;

    /// Commit processed data to storage
    async fn commit(&self, data: &ProcessedData) -> Result<(), Box<dyn std::error::Error>>;

    /// Prune old data (optional)
    async fn prune(&self, before_checkpoint: u64) -> Result<(), Box<dyn std::error::Error>> {
        Ok(())
    }

    /// Get processor name
    fn name(&self) -> String;
}

/// Sequential pipeline - in-order processing with batching
pub struct SequentialPipeline {
    name: String,
    processor: Arc<dyn Processor>,
    batch_size: usize,
    watermark: Arc<Mutex<Watermark>>,
}

impl SequentialPipeline {
    pub fn new(name: String, processor: Arc<dyn Processor>, batch_size: usize) -> Self {
        Self {
            name,
            processor,
            batch_size,
            watermark: Arc::new(Mutex::new(Watermark::default())),
        }
    }

    /// Run sequential pipeline
    pub async fn run(&self, mut subscriber: PipelineSubscriber) -> Result<(), Box<dyn std::error::Error>> {
        let mut batch: Vec<ProcessedData> = Vec::new();
        let mut total_metrics = ProcessingMetrics::default();

        loop {
            match subscriber.recv().await {
                Ok(crate::ingestion::IngestionMessage::Checkpoint(checkpoint)) => {
                    // Process checkpoint
                    match self.processor.process(&checkpoint).await {
                        Ok(mut processed) => {
                            // Update metrics
                            total_metrics.transaction_count += processed.metrics.transaction_count;
                            total_metrics.event_count += processed.metrics.event_count;
                            total_metrics.object_change_count += processed.metrics.object_change_count;
                            total_metrics.records_created += processed.metrics.records_created;

                            batch.push(processed);

                            // Commit batch if full
                            if batch.len() >= self.batch_size {
                                self.commit_batch(&mut batch, checkpoint.checkpoint_summary.sequence_number)
                                    .await?;
                            }
                        }
                        Err(e) => {
                            eprintln!("Processing error: {}", e);
                        }
                    }
                }
                Ok(crate::ingestion::IngestionMessage::Error(error)) => {
                    eprintln!("Ingestion error: {}", error);
                }
                Ok(crate::ingestion::IngestionMessage::Paused) => {
                    // Commit remaining batch
                    if !batch.is_empty() {
                        let seq = batch.iter().map(|b| b.checkpoint_sequence).max().unwrap_or(0);
                        self.commit_batch(&mut batch, seq).await?;
                    }
                    println!("{}: Pipeline paused", self.name);
                }
                Ok(crate::ingestion::IngestionMessage::Resumed) => {
                    println!("{}: Pipeline resumed", self.name);
                }
                Ok(crate::ingestion::IngestionMessage::Shutdown) | Err(_) => {
                    // Commit remaining batch before shutdown
                    if !batch.is_empty() {
                        let seq = batch.iter().map(|b| b.checkpoint_sequence).max().unwrap_or(0);
                        self.commit_batch(&mut batch, seq).await?;
                    }
                    println!("{}: Pipeline shutdown", self.name);
                    break;
                }
            }
        }

        Ok(())
    }

    async fn commit_batch(&self, batch: &mut Vec<ProcessedData>, sequence: u64) -> Result<(), Box<dyn std::error::Error>> {
        // Combine batch data
        let mut combined_records = Vec::new();
        let mut combined_metrics = ProcessingMetrics::default();

        for data in batch.iter() {
            combined_records.extend(data.records.iter().cloned());
            combined_metrics.transaction_count += data.metrics.transaction_count;
            combined_metrics.event_count += data.metrics.event_count;
            combined_metrics.object_change_count += data.metrics.object_change_count;
            combined_metrics.records_created += data.metrics.records_created;
        }

        // Create combined data
        let combined = ProcessedData {
            checkpoint_sequence: sequence,
            records: combined_records,
            metrics: combined_metrics,
        };

        // Commit to storage
        self.processor.commit(&combined).await?;

        // Update watermark
        {
            let mut wm = self.watermark.lock().await;
            wm.checkpoint_sequence = sequence;
            wm.updated_at = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64;
        }

        batch.clear();
        Ok(())
    }

    pub async fn get_watermark(&self) -> Watermark {
        self.watermark.lock().await.clone()
    }
}

/// Concurrent pipeline - high-throughput out-of-order processing
pub struct ConcurrentPipeline {
    name: String,
    processor: Arc<dyn Processor>,
    max_concurrent: usize,
    watermark: Arc<Mutex<Watermark>>,
}

impl ConcurrentPipeline {
    pub fn new(name: String, processor: Arc<dyn Processor>, max_concurrent: usize) -> Self {
        Self {
            name,
            processor,
            max_concurrent,
            watermark: Arc::new(Mutex::new(Watermark::default())),
        }
    }

    /// Run concurrent pipeline
    pub async fn run(&self, mut subscriber: PipelineSubscriber) -> Result<(), Box<dyn std::error::Error>> {
        let semaphore = Arc::new(tokio::sync::Semaphore::new(self.max_concurrent));
        let mut tasks = Vec::new();

        loop {
            match subscriber.recv().await {
                Ok(crate::ingestion::IngestionMessage::Checkpoint(checkpoint)) => {
                    let permit = semaphore.acquire().await?;
                    let processor = self.processor.clone();
                    let checkpoint_seq = checkpoint.checkpoint_summary.sequence_number;
                    let watermark = self.watermark.clone();

                    let task = tokio::spawn(async move {
                        let _permit = permit;
                        match processor.process(&checkpoint).await {
                            Ok(processed) => {
                                // Commit processed data
                                if let Ok(_) = processor.commit(&processed).await {
                                    // Update watermark
                                    let mut wm = watermark.lock().await;
                                    if checkpoint_seq > wm.checkpoint_sequence {
                                        wm.checkpoint_sequence = checkpoint_seq;
                                        wm.updated_at = std::time::SystemTime::now()
                                            .duration_since(std::time::UNIX_EPOCH)
                                            .unwrap()
                                            .as_millis() as u64;
                                    }
                                }
                                Ok::<_, Box<dyn std::error::Error>>(())
                            }
                            Err(e) => Err(e),
                        }
                    });

                    tasks.push(task);

                    // Clean up completed tasks
                    tasks.retain(|t| !t.is_finished());
                }
                Ok(crate::ingestion::IngestionMessage::Error(error)) => {
                    eprintln!("Ingestion error: {}", error);
                }
                Ok(crate::ingestion::IngestionMessage::Paused) => {
                    println!("{}: Pipeline paused", self.name);
                }
                Ok(crate::ingestion::IngestionMessage::Resumed) => {
                    println!("{}: Pipeline resumed", self.name);
                }
                Ok(crate::ingestion::IngestionMessage::Shutdown) | Err(_) => {
                    // Wait for all tasks to complete
                    futures::future::join_all(tasks).await;
                    println!("{}: Pipeline shutdown", self.name);
                    break;
                }
            }
        }

        Ok(())
    }

    pub async fn get_watermark(&self) -> Watermark {
        self.watermark.lock().await.clone()
    }
}

/// Pipeline executor - manages pipeline lifecycle
pub struct PipelineExecutor {
    tasks: Arc<Mutex<Vec<tokio::task::JoinHandle<Result<(), Box<dyn std::error::Error>>>>>>,
}

impl PipelineExecutor {
    pub fn new() -> Self {
        Self {
            tasks: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Spawn sequential pipeline
    pub async fn spawn_sequential(
        &self,
        name: String,
        processor: Arc<dyn Processor>,
        batch_size: usize,
        subscriber: PipelineSubscriber,
    ) {
        let pipeline = Arc::new(SequentialPipeline::new(name, processor, batch_size));
        let tasks = self.tasks.clone();

        let task = tokio::spawn(async move {
            let result = pipeline.run(subscriber).await;
            result
        });

        let mut tasks_guard = tasks.lock().await;
        tasks_guard.push(task);
    }

    /// Spawn concurrent pipeline
    pub async fn spawn_concurrent(
        &self,
        name: String,
        processor: Arc<dyn Processor>,
        max_concurrent: usize,
        subscriber: PipelineSubscriber,
    ) {
        let pipeline = Arc::new(ConcurrentPipeline::new(name, processor, max_concurrent));
        let tasks = self.tasks.clone();

        let task = tokio::spawn(async move {
            let result = pipeline.run(subscriber).await;
            result
        });

        let mut tasks_guard = tasks.lock().await;
        tasks_guard.push(task);
    }

    /// Wait for all pipelines to complete
    pub async fn wait_all(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut tasks = self.tasks.lock().await;
        while let Some(task) = tasks.pop() {
            task.await??;
        }
        Ok(())
    }

    /// Get number of active pipelines
    pub async fn active_count(&self) -> usize {
        let tasks = self.tasks.lock().await;
        tasks.iter().filter(|t| !t.is_finished()).count()
    }
}

/// Example processor for testing
pub struct ExampleProcessor {
    name: String,
}

impl ExampleProcessor {
    pub fn new(name: String) -> Self {
        Self { name }
    }
}

#[async_trait]
impl Processor for ExampleProcessor {
    async fn process(&self, checkpoint: &CheckpointData) -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let mut records = Vec::new();
        let mut metrics = ProcessingMetrics::default();

        // Example: extract transaction info
        for tx in &checkpoint.transactions {
            metrics.transaction_count += 1;
            metrics.event_count += tx.events.len() as u64;
            metrics.object_change_count += tx.object_changes.len() as u64;

            let record = serde_json::json!({
                "digest": tx.digest,
                "sender": tx.sender,
                "kind": tx.kind,
                "timestamp": tx.timestamp_ms,
            });

            records.push(record);
        }

        metrics.records_created = records.len() as u64;

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics,
        })
    }

    async fn commit(&self, data: &ProcessedData) -> Result<(), Box<dyn std::error::Error>> {
        // Example: log committed data
        println!(
            "[{}] Committed {} records from checkpoint {}",
            self.name, data.metrics.records_created, data.checkpoint_sequence
        );
        Ok(())
    }

    fn name(&self) -> String {
        self.name.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_processor() {
        tokio::runtime::Runtime::new().unwrap().block_on(async {
            let processor = Arc::new(ExampleProcessor::new("test".to_string()));
            
            let checkpoint = CheckpointData {
                checkpoint_summary: crate::types::CertifiedCheckpointSummary {
                    sequence_number: 1,
                    checkpoint_digest: "digest".to_string(),
                    timestamp_ms: 1000,
                    network_name: "testnet".to_string(),
                    previous_checkpoint_digest: None,
                    epoch: 1,
                    reference_gas_price: 1000,
                    total_transactions: 1,
                    total_gas_units: 1000,
                },
                checkpoint_contents: crate::types::CheckpointContents {
                    transactions: vec!["tx1".to_string()],
                    user_signatures: vec![],
                },
                transactions: vec![],
            };

            let result = processor.process(&checkpoint).await.unwrap();
            assert_eq!(result.checkpoint_sequence, 1);
        });
    }
}
