# Custom Indexing Framework para Sui - Guía Completa

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Conceptos Clave](#conceptos-clave)
- [Arquitectura](#arquitectura)
- [Primeros Pasos](#primeros-pasos)
- [Guía de Implementación](#guía-de-implementación)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [API Reference](#api-reference)
- [Mejores Prácticas](#mejores-prácticas)
- [Resolución de Problemas](#resolución-de-problemas)

## 🎯 Introducción

El Custom Indexing Framework permite procesar y almacenar datos específicos de blockchain de Sui de manera eficiente. En lugar de consultar APIs repetidamente o construir lógica de filtrado compleja, el framework procesa datos en bruto una sola vez y los almacena en el formato deseado.

### Casos de Uso

- **DEX Trading Analytics** - Rastrear volúmenes comerciales por pool
- **NFT Collection Monitoring** - Monitorear actividad de colecciones específicas
- **Analytics Dashboards** - Construir dashboards con datos históricos
- **Índices de Búsqueda Especializados** - Crear índices para búsquedas rápidas
- **Agregación de Datos Bridge** - Integrar datos de múltiples bridges

### Ventajas

✅ **Eficiencia** - Procesa datos una sola vez sin repetir queries
✅ **Flexibilidad** - Control total sobre formato y almacenamiento
✅ **Escalabilidad** - Soporta procesamiento concurrente de alta velocidad
✅ **Control** - Elige dónde y cómo almacenar datos
✅ **Real-time** - Acceso inmediato a datos procesados

## 📚 Conceptos Clave

### Checkpoints

Los checkpoints en Sui son lotes de transacciones que representan snapshots consistentes del estado blockchain. Cada checkpoint contiene:

- **Resumen certificado** - Metadata del checkpoint
- **Contenidos** - Digests de transacciones
- **Transacciones completas** - Datos, efectos, eventos, cambios de objeto

```rust
pub struct CheckpointData {
    pub checkpoint_summary: CertifiedCheckpointSummary,
    pub checkpoint_contents: CheckpointContents,
    pub transactions: Vec<CheckpointTransaction>,
}
```

### Flujo de Datos

```
Data Source (Remote/Local/RPC)
    ↓
Broadcaster (Distributes checkpoints)
    ↓
Regulator (Flow control via backpressure)
    ↓
Processing Pipelines (Sequential or Concurrent)
    ↓
Storage Layer (PostgreSQL/MongoDB/Custom)
```

### Watermarks

Los watermarks rastrean el progreso del procesamiento:

```rust
pub struct Watermark {
    pub checkpoint_sequence: u64,      // Último checkpoint procesado
    pub timestamp_ms: u64,              // Marca de tiempo
    pub updated_at: u64,                // Última actualización
}
```

## 🏗️ Arquitectura

### Capas del Framework

#### 1. Data Source Layer

Proporciona acceso a datos de checkpoint desde múltiples fuentes:

- **Remote Store** - Repositorio HTTP/S3 público (ejemplo: checkpoints.mainnet.sui.io)
- **Local Files** - Sistema de archivos local (para testing)
- **RPC Endpoint** - Conexión directa a nodo Sui (confiable y controlable)

#### 2. Ingestion Layer

Maneja el fetching y distribución confiable de datos:

- **Broadcaster** - Distribuye checkpoints a múltiples pipelines
- **Regulator** - Controla flujo de datos mediante backpressure
- **Watermark Store** - Rastrea progreso por pipeline

#### 3. Processing Layer

Ejecuta lógica personalizada de transformación:

- **Sequential Pipeline** - Procesamiento en-orden con batching
- **Concurrent Pipeline** - Procesamiento de alta velocidad sin orden
- **Processor Interface** - Implementa tu lógica de transformación

#### 4. Storage Layer

Almacena datos procesados:

- **PostgreSQL** - ORM Diesel, connection pooling, migraciones
- **Custom Database** - Implementa la interfaz para cualquier DB
- **Watermark Management** - Rastrea progreso de procesamiento

## 🚀 Primeros Pasos

### 1. Crear un Indexer Básico

```rust
use sui_indexer::*;
use std::sync::Arc;
use async_trait::async_trait;

// Implementar la interfaz Processor
struct MyIndexer;

#[async_trait]
impl Processor for MyIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        // Tu lógica de procesamiento aquí
        let records = vec![];
        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics: ProcessingMetrics::default(),
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        // Guardar datos procesados
        Ok(())
    }

    fn name(&self) -> String {
        "my_indexer".to_string()
    }
}
```

### 2. Configurar el Indexer

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let indexer = IndexerBuilder::new("my_indexer".to_string())
        .with_data_source(DataSource::Rpc {
            endpoint: "https://rpc.testnet.sui.io".to_string(),
            auth_token: None,
        })
        .with_batch_size(25)
        .with_pipeline_type(PipelineType::Concurrent { max_concurrent: 10 })
        .build()
        .await?;

    // Inicializar
    indexer.init().await?;

    // Agregar procesadores
    indexer.add_processor(Arc::new(MyIndexer)).await?;

    // Ejecutar
    indexer.start().await?;

    Ok(())
}
```

### 3. Monitorear Progreso

```rust
loop {
    let status = indexer.status().await;
    println!("Checkpoint: {}", status.current_checkpoint);
    println!("Procesados: {}", status.processed_count);
    println!("Pipelines activos: {}", status.active_pipelines);
    
    tokio::time::sleep(Duration::from_secs(5)).await;
}
```

## 📖 Guía de Implementación

### Procesar Eventos

```rust
#[async_trait]
impl Processor for EventIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let mut records = Vec::new();

        for tx in &checkpoint.transactions {
            for event in &tx.events {
                // Filtrar eventos de interés
                if event.module == "dex" && event.event_type == "Swap" {
                    records.push(serde_json::json!({
                        "event_type": event.event_type,
                        "sender": event.sender,
                        "data": event.parsed_json,
                        "timestamp": tx.timestamp_ms,
                    }));
                }
            }
        }

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics: ProcessingMetrics {
                event_count: records.len() as u64,
                records_created: records.len() as u64,
                ..Default::default()
            },
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        // Guardar a base de datos
        let storage = self.storage.clone();
        storage.store_records("events", &data.records)?;
        Ok(())
    }

    fn name(&self) -> String {
        "event_indexer".to_string()
    }
}
```

### Rastrear Cambios de Objetos

```rust
#[async_trait]
impl Processor for ObjectChangeIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let mut records = Vec::new();

        for tx in &checkpoint.transactions {
            for change in &tx.object_changes {
                records.push(serde_json::json!({
                    "object_id": change.object_id,
                    "change_type": format!("{:?}", change.kind),
                    "version": change.version,
                    "transaction": tx.digest,
                }));
            }
        }

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics: ProcessingMetrics {
                object_change_count: records.len() as u64,
                records_created: records.len() as u64,
                ..Default::default()
            },
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        self.storage.store_records("object_changes", &data.records)?;
        Ok(())
    }

    fn name(&self) -> String {
        "object_change_indexer".to_string()
    }
}
```

### Agregar Múltiples Procesadores

```rust
// Crear indexers para diferentes aspectos
let dex_indexer = Arc::new(DexVolumeIndexer::new());
let nft_indexer = Arc::new(NftActivityIndexer::new(None));
let event_indexer = Arc::new(EventIndexer::new());

// Agregar todos a la misma instancia del indexer
indexer.add_processor(dex_indexer).await?;
indexer.add_processor(nft_indexer).await?;
indexer.add_processor(event_indexer).await?;

// Todos procesan en paralelo desde la misma fuente de datos
indexer.start().await?;
```

## 💡 Ejemplos Prácticos

### Ejemplo 1: DEX Trading Volume Indexer

```rust
pub struct DexVolumeIndexer;

#[async_trait]
impl Processor for DexVolumeIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let mut volume_by_pool: HashMap<String, (u64, u64)> = HashMap::new();

        for tx in &checkpoint.transactions {
            for event in &tx.events {
                if event.event_type == "Swap" {
                    let pool_id = event.parsed_json["pool_id"].as_str().unwrap_or("");
                    let amount_a = event.parsed_json["amount_in"].as_u64().unwrap_or(0);
                    let amount_b = event.parsed_json["amount_out"].as_u64().unwrap_or(0);

                    let entry = volume_by_pool.entry(pool_id.to_string()).or_insert((0, 0));
                    entry.0 += amount_a;
                    entry.1 += amount_b;
                }
            }
        }

        let records = volume_by_pool.into_iter().map(|(pool_id, (vol_a, vol_b))| {
            serde_json::json!({
                "pool_id": pool_id,
                "volume_a": vol_a,
                "volume_b": vol_b,
                "checkpoint": checkpoint.checkpoint_summary.sequence_number,
            })
        }).collect();

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics: ProcessingMetrics::default(),
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        // Guardar volúmenes a PostgreSQL
        Ok(())
    }

    fn name(&self) -> String {
        "dex_volume".to_string()
    }
}
```

### Ejemplo 2: NFT Activity Monitor

```rust
pub struct NftActivityIndexer {
    collection_id: String,
}

#[async_trait]
impl Processor for NftActivityIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let mut records = Vec::new();

        for tx in &checkpoint.transactions {
            for change in &tx.object_changes {
                // Verificar si pertenece a nuestra colección
                if change.object_id.contains(&self.collection_id) {
                    records.push(serde_json::json!({
                        "nft_id": change.object_id,
                        "action": format!("{:?}", change.kind),
                        "transaction": tx.digest,
                        "sender": tx.sender,
                        "timestamp": tx.timestamp_ms,
                    }));
                }
            }
        }

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics: ProcessingMetrics::default(),
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        // Guardar actividad de NFTs
        Ok(())
    }

    fn name(&self) -> String {
        format!("nft_activity_{}", self.collection_id)
    }
}
```

### Ejemplo 3: Analytics Dashboard Aggregator

```rust
pub struct AnalyticsAggregator;

#[async_trait]
impl Processor for AnalyticsAggregator {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let mut stats = serde_json::json!({
            "checkpoint": checkpoint.checkpoint_summary.sequence_number,
            "timestamp": checkpoint.checkpoint_summary.timestamp_ms,
            "transaction_count": checkpoint.transactions.len(),
            "total_gas": 0u64,
            "total_events": 0u64,
            "object_changes": 0u64,
        });

        for tx in &checkpoint.transactions {
            stats["total_gas"] = stats["total_gas"].as_u64().unwrap_or(0) + tx.gas_budget;
            stats["total_events"] = stats["total_events"].as_u64().unwrap_or(0) + tx.events.len() as u64;
            stats["object_changes"] = stats["object_changes"].as_u64().unwrap_or(0) + tx.object_changes.len() as u64;
        }

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records: vec![stats],
            metrics: ProcessingMetrics::default(),
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        // Guardar estadísticas agregadas
        Ok(())
    }

    fn name(&self) -> String {
        "analytics_aggregator".to_string()
    }
}
```

## 📚 API Reference

### Processor Trait

```rust
#[async_trait]
pub trait Processor: Send + Sync {
    /// Procesa datos de checkpoint
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>>;

    /// Guarda datos procesados
    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>>;

    /// Limpia datos antiguos (opcional)
    async fn prune(&self, before_checkpoint: u64) 
        -> Result<(), Box<dyn std::error::Error>>;

    /// Nombre del procesador
    fn name(&self) -> String;
}
```

### Data Sources

```rust
pub enum DataSource {
    /// Almacén remoto (HTTP/S3)
    Remote { url: String, network: String },
    
    /// Sistema de archivos local
    Local { path: String },
    
    /// Endpoint RPC
    Rpc { endpoint: String, auth_token: Option<String> },
}
```

### Pipeline Types

```rust
pub enum PipelineType {
    /// Procesamiento secuencial en-orden
    Sequential,
    
    /// Procesamiento concurrente de alta velocidad
    Concurrent { max_concurrent: usize },
}
```

### IndexerBuilder

```rust
IndexerBuilder::new("name")
    .with_data_source(DataSource::Rpc { ... })
    .with_batch_size(25)
    .with_start_checkpoint(1000)
    .with_pipeline_type(PipelineType::Concurrent { max_concurrent: 10 })
    .with_storage(StorageConfig { ... })
    .build()
    .await?
```

## ✅ Mejores Prácticas

### 1. Elige el Tipo de Pipeline Correcto

**Sequential** es mejor para:

- Procesamiento ordenado
- Datos que dependen de orden
- Operaciones con estado
- Depuración

**Concurrent** es mejor para:

- Alto throughput
- Datos independientes
- Bajo latency
- Escalabilidad

```rust
// Para análisis de volumen DEX: concurrent
.with_pipeline_type(PipelineType::Concurrent { max_concurrent: 20 })

// Para rastrear transferencias de NFTs: sequential si dependen de orden
.with_pipeline_type(PipelineType::Sequential)
```

### 2. Manejo de Errores Robusto

```rust
#[async_trait]
impl Processor for MyIndexer {
    async fn process(&self, checkpoint: &CheckpointData) 
        -> Result<ProcessedData, Box<dyn std::error::Error>> {
        let mut records = Vec::new();

        for tx in &checkpoint.transactions {
            match self.process_transaction(tx) {
                Ok(record) => records.push(record),
                Err(e) => {
                    eprintln!("Error processing tx {}: {}", tx.digest, e);
                    // Continuar con siguiente tx
                }
            }
        }

        Ok(ProcessedData {
            checkpoint_sequence: checkpoint.checkpoint_summary.sequence_number,
            records,
            metrics: ProcessingMetrics {
                records_created: records.len() as u64,
                ..Default::default()
            },
        })
    }

    async fn commit(&self, data: &ProcessedData) 
        -> Result<(), Box<dyn std::error::Error>> {
        match self.storage.store_records("table", &data.records) {
            Ok(_) => Ok(()),
            Err(e) => {
                eprintln!("Storage error: {}", e);
                Err(e)
            }
        }
    }

    fn name(&self) -> String {
        "my_indexer".to_string()
    }
}
```

### 3. Filtrado Eficiente

```rust
// ✅ Bueno: Filtrar temprano
for event in &tx.events {
    if event.module == "dex" && event.event_type == "Swap" {
        // Procesar solo eventos relevantes
    }
}

// ❌ Malo: Procesar todo luego filtrar
let mut records = Vec::new();
for event in &tx.events {
    records.push(event);
}
records.retain(|e| e.module == "dex");
```

### 4. Usar Batch Size Apropiado

```rust
// Para datos pequeños o procesamiento rápido: batch size grande
.with_batch_size(100)

// Para datos grandes o procesamiento lento: batch size pequeño
.with_batch_size(10)

// Recomendado: 25-50 para mayoría de casos
.with_batch_size(25)
```

### 5. Monitorear Progreso

```rust
// Monitor en thread separado
tokio::spawn({
    let indexer = indexer.clone();
    async move {
        loop {
            let status = indexer.status().await;
            println!("Progress: {}/{} checkpoints", 
                status.processed_count, 
                status.current_checkpoint);
            tokio::time::sleep(Duration::from_secs(10)).await;
        }
    }
});
```

## 🔧 Resolución de Problemas

### Problema: Memoria en aumento

**Causa**: Batch size muy grande
**Solución**:

```rust
.with_batch_size(10)  // Reducir batch size
```

### Problema: Procesamiento lento

**Causa**: Sequential pipeline en datos que pueden ser concurrentes
**Solución**:

```rust
.with_pipeline_type(PipelineType::Concurrent { max_concurrent: 20 })
```

### Problema: Pérdida de datos

**Causa**: No confirmar cambios correctamente
**Solución**:

```rust
async fn commit(&self, data: &ProcessedData) 
    -> Result<(), Box<dyn std::error::Error>> {
    // Usar transacciones
    let txn = self.db.transaction().await?;
    txn.store_records(&data.records).await?;
    txn.commit().await?;
    Ok(())
}
```

### Problema: Eventos no capturados

**Causa**: Nombres incorrectos de módulo/evento
**Solución**:

```rust
// Verificar nombres exactos en checkpoint
for tx in &checkpoint.transactions {
    for event in &tx.events {
        println!("Event: {}.{}", event.module, event.event_type);
    }
}
```

## 📦 Endpoints de Data Source

### Mainnet

- **Remote Store**: `https://checkpoints.mainnet.sui.io`
- **RPC**: `https://fullnode.mainnet.sui.io:443`

### Testnet

- **Remote Store**: `https://checkpoints.testnet.sui.io`
- **RPC**: `https://fullnode.testnet.sui.io:443`

### Devnet

- **RPC Only**: `https://fullnode.devnet.sui.io:443`
- *Nota: No hay remote store para devnet*

## 🔗 Recursos

- [Documentación Oficial](https://docs.sui.io/concepts/data-access/custom-indexing-framework)
- [Sui RPC API](https://docs.sui.io/references/sui-api)
- [Transaction Lifecycle](https://docs.sui.io/concepts/transactions/transaction-lifecycle)
- [Checkpoints](https://docs.sui.io/concepts/checkpoints)

---

**Versión**: 1.0.0  
**Estado**: Production-ready  
**Última actualización**: Diciembre 2025
