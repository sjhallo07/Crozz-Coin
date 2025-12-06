// Ingestion layer - Broadcaster and Regulator for checkpoint distribution
// Manages reliable fetching and distribution of checkpoint data to processing pipelines

use crate::types::{CheckpointData, IngestionProgress};
use crate::data_source::DataSourceProvider;
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use std::collections::HashMap;

/// Message sent through broadcaster
#[derive(Clone, Debug)]
pub enum IngestionMessage {
    /// Checkpoint data ready for processing
    Checkpoint(CheckpointData),
    /// Error occurred during ingestion
    Error(String),
    /// Ingestion paused
    Paused,
    /// Ingestion resumed
    Resumed,
    /// Shutdown signal
    Shutdown,
}

/// Trait for watermark tracking
#[async_trait]
pub trait WatermarkStore: Send + Sync {
    /// Update watermark for pipeline
    async fn update_watermark(&self, pipeline_id: &str, sequence: u64) -> Result<(), Box<dyn std::error::Error>>;

    /// Get current watermark
    async fn get_watermark(&self, pipeline_id: &str) -> Result<u64, Box<dyn std::error::Error>>;

    /// Reset watermark
    async fn reset_watermark(&self, pipeline_id: &str) -> Result<(), Box<dyn std::error::Error>>;
}

/// In-memory watermark store
pub struct InMemoryWatermarkStore {
    watermarks: Arc<Mutex<HashMap<String, u64>>>,
}

impl InMemoryWatermarkStore {
    pub fn new() -> Self {
        Self {
            watermarks: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl WatermarkStore for InMemoryWatermarkStore {
    async fn update_watermark(&self, pipeline_id: &str, sequence: u64) -> Result<(), Box<dyn std::error::Error>> {
        let mut watermarks = self.watermarks.lock().await;
        watermarks.insert(pipeline_id.to_string(), sequence);
        Ok(())
    }

    async fn get_watermark(&self, pipeline_id: &str) -> Result<u64, Box<dyn std::error::Error>> {
        let watermarks = self.watermarks.lock().await;
        Ok(watermarks.get(pipeline_id).copied().unwrap_or(0))
    }

    async fn reset_watermark(&self, pipeline_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut watermarks = self.watermarks.lock().await;
        watermarks.remove(pipeline_id);
        Ok(())
    }
}

/// Regulator - controls data flow based on backpressure
pub struct Regulator {
    /// Highest watermark across all subscribers
    high_watermark: Arc<Mutex<u64>>,
    /// Latest available checkpoint
    latest_checkpoint: Arc<Mutex<u64>>,
    /// Fetch batch size
    batch_size: u64,
}

impl Regulator {
    pub fn new(batch_size: u64) -> Self {
        Self {
            high_watermark: Arc::new(Mutex::new(0)),
            latest_checkpoint: Arc::new(Mutex::new(0)),
            batch_size,
        }
    }

    /// Update high watermark from subscriber
    pub async fn update_watermark(&self, checkpoint: u64) {
        let mut hw = self.high_watermark.lock().await;
        if checkpoint > *hw {
            *hw = checkpoint;
        }
    }

    /// Get next batch to fetch
    pub async fn get_next_batch(&self) -> (u64, u64) {
        let hw = *self.high_watermark.lock().await;
        let lc = *self.latest_checkpoint.lock().await;

        let start = hw + 1;
        let end = std::cmp::min(start + self.batch_size - 1, lc);

        (start, end)
    }

    /// Set latest available checkpoint
    pub async fn set_latest_checkpoint(&self, checkpoint: u64) {
        let mut lc = self.latest_checkpoint.lock().await;
        *lc = checkpoint;
    }

    /// Check if there's more data to fetch
    pub async fn has_more_data(&self) -> bool {
        let hw = *self.high_watermark.lock().await;
        let lc = *self.latest_checkpoint.lock().await;
        hw < lc
    }
}

/// Broadcaster - distributes checkpoints to multiple pipelines
pub struct Broadcaster {
    /// Data source for checkpoints
    data_source: Arc<dyn DataSourceProvider>,
    /// Regulator for flow control
    regulator: Arc<Regulator>,
    /// Broadcast channel
    tx: broadcast::Sender<IngestionMessage>,
    /// Active subscribers
    subscribers: Arc<Mutex<Vec<String>>>,
    /// Progress tracking
    progress: Arc<Mutex<IngestionProgress>>,
}

impl Broadcaster {
    pub fn new(
        data_source: Arc<dyn DataSourceProvider>,
        regulator: Arc<Regulator>,
        buffer_size: usize,
    ) -> Self {
        let (tx, _) = broadcast::channel(buffer_size);

        Self {
            data_source,
            regulator,
            tx,
            subscribers: Arc::new(Mutex::new(Vec::new())),
            progress: Arc::new(Mutex::new(IngestionProgress {
                current_checkpoint: 0,
                last_fetched_checkpoint: 0,
                checkpoints_processed: 0,
                total_events: 0,
                processing_rate: 0.0,
                last_update_ms: 0,
            })),
        }
    }

    /// Subscribe to checkpoint messages
    pub fn subscribe(&self) -> broadcast::Receiver<IngestionMessage> {
        self.tx.subscribe()
    }

    /// Register a subscriber
    pub async fn register_subscriber(&self, subscriber_id: String) {
        let mut subs = self.subscribers.lock().await;
        if !subs.contains(&subscriber_id) {
            subs.push(subscriber_id);
        }
    }

    /// Unregister a subscriber
    pub async fn unregister_subscriber(&self, subscriber_id: &str) {
        let mut subs = self.subscribers.lock().await;
        subs.retain(|s| s != subscriber_id);
    }

    /// Get current progress
    pub async fn get_progress(&self) -> IngestionProgress {
        self.progress.lock().await.clone()
    }

    /// Start broadcasting checkpoints
    pub async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        let start_time = std::time::Instant::now();
        let mut processed = 0u64;

        // Get latest checkpoint
        let latest = self.data_source.get_latest_checkpoint().await?;
        self.regulator.set_latest_checkpoint(latest).await;

        loop {
            // Check if there's more data
            if !self.regulator.has_more_data().await {
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                
                // Re-check latest
                if let Ok(new_latest) = self.data_source.get_latest_checkpoint().await {
                    self.regulator.set_latest_checkpoint(new_latest).await;
                }
                continue;
            }

            let (start, end) = self.regulator.get_next_batch().await;

            // Fetch batch
            for sequence in start..=end {
                match self.data_source.get_checkpoint(sequence).await {
                    Ok(checkpoint) => {
                        // Verify checkpoint
                        if let Ok(true) = self.data_source.verify_checkpoint(&checkpoint).await {
                            // Send to subscribers
                            let _ = self.tx.send(IngestionMessage::Checkpoint(checkpoint.clone()));
                            
                            processed += 1;

                            // Update progress
                            {
                                let mut prog = self.progress.lock().await;
                                prog.last_fetched_checkpoint = sequence;
                                prog.checkpoints_processed = processed;
                                prog.last_update_ms = std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_millis() as u64;
                            }
                        }
                    }
                    Err(e) => {
                        let error_msg = format!("Failed to fetch checkpoint {}: {}", sequence, e);
                        let _ = self.tx.send(IngestionMessage::Error(error_msg));
                    }
                }
            }

            // Update regulator with progress
            if end > 0 {
                self.regulator.update_watermark(end).await;
            }

            // Calculate rate
            let elapsed = start_time.elapsed().as_secs_f64();
            if elapsed > 0.0 {
                let rate = processed as f64 / elapsed;
                let mut prog = self.progress.lock().await;
                prog.processing_rate = rate;
            }
        }
    }
}

/// Pipeline subscriber
pub struct PipelineSubscriber {
    pub id: String,
    pub receiver: broadcast::Receiver<IngestionMessage>,
    watermark: Arc<Mutex<u64>>,
}

impl PipelineSubscriber {
    pub fn new(id: String, receiver: broadcast::Receiver<IngestionMessage>) -> Self {
        Self {
            id,
            receiver,
            watermark: Arc::new(Mutex::new(0)),
        }
    }

    /// Get next checkpoint message
    pub async fn recv(&mut self) -> Result<IngestionMessage, broadcast::error::RecvError> {
        self.receiver.recv().await
    }

    /// Update subscriber watermark
    pub async fn update_watermark(&self, sequence: u64) {
        let mut wm = self.watermark.lock().await;
        *wm = sequence;
    }

    /// Get current watermark
    pub async fn get_watermark(&self) -> u64 {
        *self.watermark.lock().await
    }
}

/// Ingestion pipeline orchestrator
pub struct IngestionPipeline {
    broadcaster: Arc<Broadcaster>,
    watermark_store: Arc<dyn WatermarkStore>,
}

impl IngestionPipeline {
    pub fn new(
        data_source: Arc<dyn DataSourceProvider>,
        watermark_store: Arc<dyn WatermarkStore>,
        batch_size: u64,
    ) -> Self {
        let regulator = Arc::new(Regulator::new(batch_size));
        let broadcaster = Arc::new(Broadcaster::new(data_source, regulator, 100));

        Self {
            broadcaster,
            watermark_store,
        }
    }

    /// Start ingestion
    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.broadcaster.run().await
    }

    /// Register processing pipeline subscriber
    pub async fn register_pipeline(&self, pipeline_id: String) -> PipelineSubscriber {
        self.broadcaster.register_subscriber(pipeline_id.clone()).await;
        let receiver = self.broadcaster.subscribe();
        PipelineSubscriber::new(pipeline_id, receiver)
    }

    /// Get ingestion progress
    pub async fn get_progress(&self) -> IngestionProgress {
        self.broadcaster.get_progress().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_regulator_batch_calculation() {
        tokio::runtime::Runtime::new().unwrap().block_on(async {
            let regulator = Regulator::new(10);
            regulator.set_latest_checkpoint(100).await;
            
            let (start, end) = regulator.get_next_batch().await;
            assert_eq!(start, 1);
            assert_eq!(end, 10);
        });
    }

    #[test]
    fn test_watermark_store() {
        tokio::runtime::Runtime::new().unwrap().block_on(async {
            let store = InMemoryWatermarkStore::new();
            store.update_watermark("pipeline1", 50).await.unwrap();
            let wm = store.get_watermark("pipeline1").await.unwrap();
            assert_eq!(wm, 50);
        });
    }
}
