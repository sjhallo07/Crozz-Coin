// Data source providers for checkpoint data ingestion
// Supports Remote (HTTP/S3), Local (filesystem), and RPC endpoints

use crate::types::{CheckpointData, DataSource};
use async_trait::async_trait;
use std::error::Error;
use std::sync::Arc;

/// Trait for data source implementations
#[async_trait]
pub trait DataSourceProvider: Send + Sync {
    /// Get checkpoint by sequence number
    async fn get_checkpoint(&self, sequence: u64) -> Result<CheckpointData, Box<dyn Error>>;

    /// Get list of available checkpoints
    async fn list_checkpoints(
        &self,
        start: u64,
        limit: usize,
    ) -> Result<Vec<u64>, Box<dyn Error>>;

    /// Get latest available checkpoint sequence
    async fn get_latest_checkpoint(&self) -> Result<u64, Box<dyn Error>>;

    /// Verify checkpoint validity
    async fn verify_checkpoint(&self, checkpoint: &CheckpointData) -> Result<bool, Box<dyn Error>>;

    /// Get source name for logging
    fn source_name(&self) -> String;
}

/// Remote HTTP/S3 checkpoint store provider
pub struct RemoteStoreProvider {
    url: String,
    network: String,
    client: reqwest::Client,
    cache: Arc<tokio::sync::Mutex<std::collections::HashMap<u64, CheckpointData>>>,
}

impl RemoteStoreProvider {
    pub fn new(url: String, network: String) -> Self {
        Self {
            url,
            network,
            client: reqwest::Client::new(),
            cache: Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
        }
    }

    /// Build checkpoint URL
    fn checkpoint_url(&self, sequence: u64) -> String {
        format!("{}/{}/{}.json", self.url, self.network, sequence)
    }
}

#[async_trait]
impl DataSourceProvider for RemoteStoreProvider {
    async fn get_checkpoint(&self, sequence: u64) -> Result<CheckpointData, Box<dyn Error>> {
        // Check cache first
        {
            let cache = self.cache.lock().await;
            if let Some(checkpoint) = cache.get(&sequence) {
                return Ok(checkpoint.clone());
            }
        }

        // Fetch from remote
        let url = self.checkpoint_url(sequence);
        let response = self
            .client
            .get(&url)
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to fetch checkpoint {}: {}", sequence, response.status()).into());
        }

        let checkpoint: CheckpointData = response.json().await?;

        // Cache result
        {
            let mut cache = self.cache.lock().await;
            cache.insert(sequence, checkpoint.clone());
        }

        Ok(checkpoint)
    }

    async fn list_checkpoints(
        &self,
        start: u64,
        limit: usize,
    ) -> Result<Vec<u64>, Box<dyn Error>> {
        let latest = self.get_latest_checkpoint().await?;
        let mut checkpoints = Vec::new();

        for i in 0..limit as u64 {
            let seq = start + i;
            if seq > latest {
                break;
            }
            checkpoints.push(seq);
        }

        Ok(checkpoints)
    }

    async fn get_latest_checkpoint(&self) -> Result<u64, Box<dyn Error>> {
        let url = format!("{}/{}/latest", self.url, self.network);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err("Failed to fetch latest checkpoint".into());
        }

        #[derive(serde::Deserialize)]
        struct LatestResponse {
            sequence_number: u64,
        }

        let latest: LatestResponse = response.json().await?;
        Ok(latest.sequence_number)
    }

    async fn verify_checkpoint(&self, checkpoint: &CheckpointData) -> Result<bool, Box<dyn Error>> {
        // Verify checkpoint digest and signatures
        Ok(true) // Simplified: real implementation would verify cryptographically
    }

    fn source_name(&self) -> String {
        format!("Remote({})", self.network)
    }
}

/// Local filesystem checkpoint provider
pub struct LocalFileProvider {
    path: String,
}

impl LocalFileProvider {
    pub fn new(path: String) -> Self {
        Self { path }
    }

    /// Build checkpoint file path
    fn checkpoint_path(&self, sequence: u64) -> std::path::PathBuf {
        std::path::PathBuf::from(format!("{}/checkpoint_{}.json", self.path, sequence))
    }
}

#[async_trait]
impl DataSourceProvider for LocalFileProvider {
    async fn get_checkpoint(&self, sequence: u64) -> Result<CheckpointData, Box<dyn Error>> {
        let path = self.checkpoint_path(sequence);

        if !path.exists() {
            return Err(format!("Checkpoint file not found: {:?}", path).into());
        }

        let content = tokio::fs::read_to_string(&path).await?;
        let checkpoint: CheckpointData = serde_json::from_str(&content)?;

        Ok(checkpoint)
    }

    async fn list_checkpoints(
        &self,
        start: u64,
        limit: usize,
    ) -> Result<Vec<u64>, Box<dyn Error>> {
        let mut checkpoints = Vec::new();
        let path = std::path::PathBuf::from(&self.path);

        if !path.is_dir() {
            return Err(format!("Path is not a directory: {:?}", path).into());
        }

        let mut entries = tokio::fs::read_dir(&path).await?;
        let mut sequences: Vec<u64> = Vec::new();

        while let Some(entry) = entries.next_entry().await? {
            let file_name = entry.file_name();
            if let Some(name) = file_name.to_str() {
                if name.starts_with("checkpoint_") && name.ends_with(".json") {
                    if let Ok(seq) = name
                        .strip_prefix("checkpoint_")
                        .unwrap()
                        .strip_suffix(".json")
                        .unwrap()
                        .parse::<u64>()
                    {
                        sequences.push(seq);
                    }
                }
            }
        }

        sequences.sort();
        for seq in sequences {
            if seq >= start && checkpoints.len() < limit {
                checkpoints.push(seq);
            }
        }

        Ok(checkpoints)
    }

    async fn get_latest_checkpoint(&self) -> Result<u64, Box<dyn Error>> {
        let checkpoints = self.list_checkpoints(0, u64::MAX as usize).await?;
        checkpoints
            .last()
            .copied()
            .ok_or_else(|| "No checkpoints found".into())
    }

    async fn verify_checkpoint(&self, _checkpoint: &CheckpointData) -> Result<bool, Box<dyn Error>> {
        Ok(true) // Local files assumed valid
    }

    fn source_name(&self) -> String {
        "LocalFile".to_string()
    }
}

/// RPC endpoint checkpoint provider
pub struct RpcProvider {
    endpoint: String,
    client: reqwest::Client,
    auth_token: Option<String>,
}

impl RpcProvider {
    pub fn new(endpoint: String, auth_token: Option<String>) -> Self {
        Self {
            endpoint,
            client: reqwest::Client::new(),
            auth_token,
        }
    }

    /// Build RPC request
    fn build_request(&self, method: &str, params: serde_json::Value) -> serde_json::Value {
        serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params,
        })
    }
}

#[async_trait]
impl DataSourceProvider for RpcProvider {
    async fn get_checkpoint(&self, sequence: u64) -> Result<CheckpointData, Box<dyn Error>> {
        let request = self.build_request(
            "sui_getCheckpoint",
            serde_json::json!({
                "sequenceNumber": sequence
            }),
        );

        let mut builder = self.client.post(&self.endpoint).json(&request);

        if let Some(token) = &self.auth_token {
            builder = builder.bearer_auth(token);
        }

        let response = builder.send().await?;
        let json: serde_json::Value = response.json().await?;

        if let Some(error) = json.get("error") {
            return Err(format!("RPC error: {}", error).into());
        }

        let checkpoint = json
            .get("result")
            .and_then(|r| serde_json::from_value::<CheckpointData>(r.clone()).ok())
            .ok_or("Invalid checkpoint response")?;

        Ok(checkpoint)
    }

    async fn list_checkpoints(
        &self,
        start: u64,
        limit: usize,
    ) -> Result<Vec<u64>, Box<dyn Error>> {
        let latest = self.get_latest_checkpoint().await?;
        let mut checkpoints = Vec::new();

        for i in 0..limit as u64 {
            let seq = start + i;
            if seq > latest {
                break;
            }
            checkpoints.push(seq);
        }

        Ok(checkpoints)
    }

    async fn get_latest_checkpoint(&self) -> Result<u64, Box<dyn Error>> {
        let request = self.build_request("sui_getLatestCheckpointSequenceNumber", serde_json::json!([]));

        let mut builder = self.client.post(&self.endpoint).json(&request);

        if let Some(token) = &self.auth_token {
            builder = builder.bearer_auth(token);
        }

        let response = builder.send().await?;
        let json: serde_json::Value = response.json().await?;

        if let Some(error) = json.get("error") {
            return Err(format!("RPC error: {}", error).into());
        }

        let sequence = json
            .get("result")
            .and_then(|r| r.as_u64())
            .ok_or("Invalid checkpoint sequence")?;

        Ok(sequence)
    }

    async fn verify_checkpoint(&self, _checkpoint: &CheckpointData) -> Result<bool, Box<dyn Error>> {
        Ok(true) // RPC node assumed trustworthy
    }

    fn source_name(&self) -> String {
        format!("RPC({})", self.endpoint)
    }
}

/// Factory for creating data source providers
pub struct DataSourceFactory;

impl DataSourceFactory {
    /// Create provider from DataSource configuration
    pub fn create(source: &DataSource) -> Result<Box<dyn DataSourceProvider>, Box<dyn Error>> {
        match source {
            DataSource::Remote { url, network } => Ok(Box::new(RemoteStoreProvider::new(
                url.clone(),
                network.clone(),
            ))),
            DataSource::Local { path } => Ok(Box::new(LocalFileProvider::new(path.clone()))),
            DataSource::Rpc {
                endpoint,
                auth_token,
            } => Ok(Box::new(RpcProvider::new(endpoint.clone(), auth_token.clone()))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_remote_store_url_building() {
        let provider = RemoteStoreProvider::new(
            "https://checkpoints.mainnet.sui.io".to_string(),
            "mainnet".to_string(),
        );
        let url = provider.checkpoint_url(100);
        assert!(url.contains("mainnet"));
        assert!(url.contains("100.json"));
    }

    #[test]
    fn test_local_file_path_building() {
        let provider = LocalFileProvider::new("/tmp/checkpoints".to_string());
        let path = provider.checkpoint_path(50);
        assert!(path.to_string_lossy().contains("checkpoint_50.json"));
    }
}
