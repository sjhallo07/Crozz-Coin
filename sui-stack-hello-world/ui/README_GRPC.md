# 🔗 Integración completa de gRPC de Sui

Este módulo proporciona acceso completo a todas las APIs gRPC de Sui Full Node, incluyendo:

## 📋 Servicios Disponibles

### 1. **TransactionExecutionService**
Enviar y ejecutar transacciones en la red Sui.

```typescript
import SuiGrpcClient from '@/services/grpcClient';

const client = new SuiGrpcClient({ endpoint: 'fullnode.devnet.sui.io' });

// Ejecutar una transacción
const result = await client.executeTransaction(txBytes, signatures);

// Simular una transacción
const simulation = await client.simulateTransaction(txBytes, signerAddress);
```

### 2. **LedgerService**
Consultar información del historial de la cadena (checkpoints, transacciones, objetos).

```typescript
// Obtener un checkpoint
const checkpoint = await client.getCheckpoint('12345');

// Obtener una transacción
const tx = await client.getTransaction('digest_base58');

// Obtener un objeto
const obj = await client.getObject('0x...');

// Obtener múltiples transacciones en lote
const txs = await client.batchGetTransactions(['digest1', 'digest2']);

// Obtener información del servidor
const info = await client.getServiceInfo();
```

### 3. **StateService**
Consultar estado en cadena en tiempo real (balances, objetos, campos dinámicos).

```typescript
// Obtener balance de SUI
const balance = await client.getCoinBalance(address);

// Obtener todos los balances
const allBalances = await client.getAllCoinBalances(address);

// Listar objetos poseídos
const objects = await client.listOwnedObjects(address, pageSize);

// Listar campos dinámicos
const fields = await client.listDynamicFields(parentId);

// Simular una transacción en el estado actual
const dryRun = await client.dryRunTransaction(txBytes, signerAddress);
```

### 4. **SubscriptionService**
Stream en tiempo real de actualizaciones de checkpoints.

```typescript
// Suscribirse a checkpoints
const unsubscribe = await client.subscribeCheckpoints(
  (checkpoint) => {
    console.log('Nuevo checkpoint:', checkpoint);
  },
  ['sequence_number', 'digest', 'summary.timestamp']
);

// Desuscribirse cuando sea necesario
unsubscribe();
```

### 5. **MovePackageService**
Acceder a metadata y contenido de paquetes Move.

```typescript
// Obtener paquete completo
const pkg = await client.getMovePackage(packageId);

// Obtener módulo específico
const module = await client.getMoveModule(packageId, 'moduleName');

// Obtener struct
const struct = await client.getMoveStruct(packageId, 'moduleName', 'StructName');

// Obtener función
const func = await client.getMoveFunction(packageId, 'moduleName', 'functionName');
```

### 6. **SignatureVerificationService**
Validar firmas fuera de la ejecución de transacciones.

```typescript
// Verificar una firma
const result = await client.verifySignature(signature, messageBytes, publicKey);

// Verificar múltiples firmas
const results = await client.batchVerifySignatures([
  { signature, messageBytes, publicKey },
  // más firmas...
]);
```

### 7. **NameService**
Resolver nombres SuiNS y hacer búsquedas inversas.

```typescript
// Resolver nombre SuiNS
const record = await client.resolveSuiNSName('ejemplo.sui');

// Búsqueda inversa: dirección a nombre
const name = await client.reverseLookupAddress('0x...');
```

## 🪝 React Hooks

Para facilitar el uso en componentes React, se proporcionan hooks personalizados:

```typescript
import {
  useCheckpoint,
  useTransaction,
  useObject,
  useCoinBalances,
  useOwnedObjects,
  useDynamicFields,
  useDryRunTransaction,
  useMovePackage,
  useSuiNSResolver,
  useCheckpointSubscription,
} from '@/hooks/useGrpc';

// En un componente
export function MyComponent() {
  const { transaction, loading, error } = useTransaction(
    'fullnode.devnet.sui.io',
    'digest_value'
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return <pre>{JSON.stringify(transaction, null, 2)}</pre>;
}
```

### Hooks Disponibles

- `useCheckpoint(endpoint, sequenceNumber)` - Obtener checkpoint
- `useTransaction(endpoint, digest)` - Obtener transacción
- `useObject(endpoint, objectId)` - Obtener objeto
- `useCoinBalances(endpoint, owner)` - Obtener balances
- `useCoinInfo(endpoint, coinType)` - Información de moneda
- `useOwnedObjects(endpoint, owner)` - Listar objetos poseídos
- `useDynamicFields(endpoint, parentId)` - Listar campos dinámicos
- `useDryRunTransaction(endpoint)` - Simular transacción
- `useMovePackage(endpoint, packageId)` - Obtener paquete Move
- `useSuiNSResolver(endpoint, name)` - Resolver nombre SuiNS
- `useCheckpointSubscription(endpoint, enabled)` - Suscripción en tiempo real

## 🎯 Field Masks

Los Field Masks permiten optimizar respuestas especificando qué campos incluir:

```typescript
import { FIELD_MASK_PRESETS, createCustomFieldMask } from '@/utils/fieldMask';

// Usar preset
const tx = await client.getTransaction(digest, FIELD_MASK_PRESETS.TRANSACTION_EFFECTS_ONLY);

// Crear máscara personalizada
const mask = createCustomFieldMask({
  includeEffects: true,
  includeEvents: true,
});

const result = await client.dryRunTransaction(txBytes, address);
```

### Presets Disponibles

```typescript
FIELD_MASK_PRESETS = {
  TRANSACTION_FULL: ['transaction', 'effects', 'events'],
  TRANSACTION_EFFECTS_ONLY: ['effects'],
  TRANSACTION_EVENTS_ONLY: ['events'],
  OBJECT_FULL: ['bcs', 'content', 'display'],
  OBJECT_CONTENT_ONLY: ['content'],
  OBJECT_BCS_ONLY: ['bcs'],
  CHECKPOINT_FULL: ['summary', 'transactions'],
  CHECKPOINT_SUMMARY_ONLY: ['summary'],
  CHECKPOINT_TRANSACTIONS_ONLY: ['transactions'],
  ALL_FIELDS: ['*'],
}
```

## 📊 Componente Explorador

Se incluye un componente completo para explorar todas las APIs:

```typescript
import GrpcApiExplorer from '@/components/GrpcApiExplorer';

export default function App() {
  return <GrpcApiExplorer defaultEndpoint="fullnode.devnet.sui.io" />;
}
```

## 📝 Ejemplos de Uso

Ver archivo `examples/grpcExamples.ts` para 14+ ejemplos listos para usar:

```typescript
import SuiGrpcExamples from '@/examples/grpcExamples';

const examples = new SuiGrpcExamples('fullnode.devnet.sui.io');

// Obtener balances de usuario
await examples.getUserBalances('0x...');

// Explorar paquete Move
await examples.explorePackage('0x...');

// Suscribirse a checkpoints
await examples.subscribeToCheckpoints();
```

## 🔌 Proveedores de gRPC

Lista de proveedores que ofrecen gRPC en Full Nodes:

- **Sui Foundation**: `fullnode.mainnet.sui.io`, `fullnode.testnet.sui.io`, `fullnode.devnet.sui.io`
- Otros proveedores: Contacta directamente o consulta la documentación de Sui

## ⚙️ Configuración

### Variables de Entorno

```bash
REACT_APP_GRPC_ENDPOINT=fullnode.devnet.sui.io
```

### Configuración en Código

```typescript
const client = new SuiGrpcClient({
  endpoint: 'fullnode.devnet.sui.io',
  port: 443,
  ssl: true,
});
```

## 🚀 Características Principales

✅ **Todas las APIs gRPC de Sui v2**
- TransactionExecutionService
- LedgerService
- StateService
- SubscriptionService (WebSocket)
- MovePackageService
- SignatureVerificationService
- NameService

✅ **Integración React**
- Hooks personalizados
- Manejo automático de estado
- Errores y loading

✅ **Field Masks Optimizados**
- Presets para casos comunes
- Creación de máscaras personalizadas
- Optimización automática

✅ **Componentes UI Completos**
- Explorador interactivo
- Soporte para todas las APIs
- Visualización de JSON

✅ **14+ Ejemplos Prácticos**
- Casos de uso reales
- Código listo para copiar y usar

## 📚 Próximos Pasos

1. Configura el endpoint de gRPC
2. Importa el cliente o los hooks necesarios
3. Usa los ejemplos como referencia
4. Integra en tus componentes React

## 🐛 Troubleshooting

### Error: "gRPC call failed"
- Verifica que el endpoint sea correcto
- Asegúrate de tener conectividad de red
- Comprueba que el endpoint soporta gRPC

### No hay respuesta en subscriptions
- Verifica que WebSocket esté habilitado
- Asegúrate de que el endpoint soporte WebSockets
- Revisa la consola de navegador para errores

### Respuestas vacías
- Usa field masks apropiados
- Verifica que los IDs/digests sean válidos
- Comprueba que los datos existan en la red

## 📖 Documentación Oficial

- [Sui gRPC Documentation](https://docs.sui.io/concepts/data-access/grpc-overview)
- [Sui API References](https://docs.sui.io/references/fullnode-protocol)
- [Protocol Buffers](https://protobuf.dev)
