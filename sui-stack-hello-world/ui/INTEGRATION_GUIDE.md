# Guía de Integración de gRPC en Sui Stack

## 📋 Descripción General

Este paquete proporciona una integración completa de las APIs gRPC de Sui en una aplicación React con TypeScript. Incluye:

- **Capa de Servicios**: Cliente gRPC centralizado con acceso a todas las 7 APIs
- **Context React**: Gestión centralizada de conexión y estado
- **Hooks Personalizados**: 11 hooks React para operaciones comunes
- **Componentes UI**: Interfaz para conexión y exploración de APIs
- **Configuración Centralizada**: Endpoints y configuraciones predefinidas
- **TypeScript**: Tipos completos para toda la API

## 🚀 Inicio Rápido

### 1. Instalación de Dependencias

```bash
npm install @radix-ui/themes @radix-ui/react-dialog
# o con pnpm
pnpm add @radix-ui/themes @radix-ui/react-dialog
```

### 2. Envolver la App con GrpcProvider

```tsx
import React from 'react';
import { GrpcProvider } from './contexts/GrpcContext';
import App from './App';

export default function RootApp() {
  return (
    <GrpcProvider defaultEnvironment="devnet" autoConnect={true}>
      <App />
    </GrpcProvider>
  );
}
```

### 3. Usar Hooks en Componentes

```tsx
import { useTransaction, useCoinBalances } from './hooks/useGrpc';

export function MyComponent() {
  // Obtener una transacción
  const { transaction, loading, error } = useTransaction('0x1234...');
  
  // Obtener balances de un usuario
  const { balances, loading: balLoading } = useCoinBalances('0xabcd...');

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return <pre>{JSON.stringify(transaction, null, 2)}</pre>;
}
```

## 🏗️ Arquitectura

### Jerarquía de Capas

```
┌─────────────────────────────────────┐
│   React Components                  │
│   (GrpcApiExplorer, etc.)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Custom Hooks (useGrpc.ts)         │
│   - useTransaction                  │
│   - useCoinBalances                 │
│   - useObject                       │
│   - etc.                            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   GrpcContext & Provider            │
│   - Maneja conexión centralizada    │
│   - Almacena cliente global         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   SuiGrpcClient (grpcClient.ts)     │
│   - 40+ métodos para 7 APIs         │
│   - Manejo de errores               │
│   - Soporte WebSocket               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Sui gRPC APIs (Red)               │
│   - TransactionExecutionService     │
│   - LedgerService                   │
│   - StateService                    │
│   - SubscriptionService             │
│   - MovePackageService              │
│   - SignatureVerificationService    │
│   - NameService                     │
└─────────────────────────────────────┘
```

### Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `contexts/GrpcContext.tsx` | Proveedor y contexto React para gRPC |
| `services/grpcClient.ts` | Cliente gRPC con 40+ métodos |
| `hooks/useGrpc.ts` | 11 hooks React personalizados |
| `components/GrpcConnection.tsx` | Componentes UI para conexión |
| `components/GrpcApiExplorer.tsx` | Explorador interactivo de APIs |
| `config/grpcConfig.ts` | Configuración y utilidades |
| `types/grpc.ts` | Definiciones TypeScript |
| `utils/fieldMask.ts` | Optimización de respuestas |

## 📖 Guía de Uso

### Configuración de Conexión

```tsx
import { GrpcConnectionSelector } from './components/GrpcConnection';

export function MyApp() {
  return (
    <div>
      <GrpcConnectionSelector />
      {/* tu contenido */}
    </div>
  );
}
```

**Características:**
- 3 botones para devnet, testnet, mainnet
- Campo para conectar a endpoint personalizado
- Muestra endpoint actual y estado

### Usar el Contexto Directamente

```tsx
import { useGrpcContext } from './contexts/GrpcContext';

export function MyComponent() {
  const { 
    client,           // Cliente gRPC
    isConnected,      // boolean
    environment,      // 'devnet' | 'testnet' | 'mainnet'
    currentEndpoint,  // string
    error,            // string | null
    switchEnvironment, // (env) => Promise<void>
  } = useGrpcContext();

  return <div>{isConnected ? 'Conectado' : 'Desconectado'}</div>;
}
```

### Obtener Transacciones

```tsx
import { useTransaction } from './hooks/useGrpc';

export function TransactionDetail({ digest }: { digest: string }) {
  const { transaction, loading, error, refetch } = useTransaction(digest);

  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {transaction && (
        <>
          <pre>{JSON.stringify(transaction, null, 2)}</pre>
          <button onClick={refetch}>Recargar</button>
        </>
      )}
    </div>
  );
}
```

### Consultar Balances

```tsx
import { useCoinBalances } from './hooks/useGrpc';
import { COMMON_COIN_TYPES } from './config/grpcConfig';

export function UserBalances({ address }: { address: string }) {
  const { balances, loading, error } = useCoinBalances(address);

  if (loading) return <p>Cargando balances...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!balances) return <p>Sin balances</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Moneda</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(balances).map(([coinType, balance]) => (
          <tr key={coinType}>
            <td>{coinType}</td>
            <td>{balance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Acceso Directo al Cliente

```tsx
import { useSuiGrpcClient } from './contexts/GrpcContext';

export function AdvancedQueries() {
  const client = useSuiGrpcClient();

  const handleCustomQuery = async () => {
    try {
      // Acceso a todas las 40+ métodos del cliente
      const checkpoint = await client.getCheckpoint('1');
      const tx = await client.getTransaction('0x123...');
      const balance = await client.getCoinBalance('0xabc...', '0x2::sui::SUI');
      
      console.log({ checkpoint, tx, balance });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleCustomQuery}>Ejecutar Consultas</button>;
}
```

### Suscribirse a Actualizaciones en Tiempo Real

```tsx
import { useCheckpointSubscription } from './hooks/useGrpc';

export function LiveCheckpoints() {
  const { latestCheckpoint, loading } = useCheckpointSubscription(true);

  return (
    <div>
      {loading && <p>Conectando al stream...</p>}
      {latestCheckpoint && (
        <div className="p-4 bg-blue-50 rounded">
          <h3>Último Checkpoint</h3>
          <p>Secuencia: {latestCheckpoint.sequence_number}</p>
          <p>Digest: {latestCheckpoint.digest}</p>
          <p>Timestamp: {latestCheckpoint.summary?.timestamp}</p>
        </div>
      )}
    </div>
  );
}
```

## 🎯 Casos de Uso Comunes

### Ver Detalles de una Transacción

```tsx
export function TransactionViewer() {
  const [digest, setDigest] = useState('');
  const { transaction, loading, error } = useTransaction(digest);

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        value={digest}
        onChange={(e) => setDigest(e.target.value)}
        placeholder="Ingresa el digest de la transacción"
        className="w-full p-2 border rounded"
      />
      {loading && <p>Cargando...</p>}
      {transaction && (
        <details className="border rounded p-2">
          <summary>Detalles de la Transacción</summary>
          <pre className="bg-gray-100 p-2 mt-2 text-xs overflow-auto">
            {JSON.stringify(transaction, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
```

### Panel de Control de Balances

```tsx
export function BalancesDashboard() {
  const [address, setAddress] = useState('');
  const { balances, loading } = useCoinBalances(address);

  return (
    <div className="grid grid-cols-3 gap-4">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Dirección de Sui"
        className="col-span-3 p-2 border rounded"
      />
      {loading ? (
        <p>Cargando...</p>
      ) : balances ? (
        Object.entries(balances).map(([coin, amount]) => (
          <div key={coin} className="p-4 bg-white rounded shadow">
            <p className="text-sm text-gray-600">{coin}</p>
            <p className="text-2xl font-bold">{amount}</p>
          </div>
        ))
      ) : null}
    </div>
  );
}
```

### Resolver Nombres SuiNS

```tsx
export function SuiNSResolver() {
  const [name, setName] = useState('');
  const { record, loading } = useSuiNSResolver(name);

  return (
    <div className="p-4 space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ej: myname.sui"
        className="w-full p-2 border rounded"
      />
      {loading && <p>Resolviendo...</p>}
      {record && (
        <div className="bg-green-50 p-4 rounded">
          <p>Dirección: {record.address}</p>
          <p>Propietario: {record.owner}</p>
        </div>
      )}
    </div>
  );
}
```

## ⚙️ Configuración Avanzada

### Personalizar Endpoints

```tsx
// En el archivo .env
REACT_APP_GRPC_ENDPOINT=https://custom-node.example.com:443

// O mediante el contexto
const { connectToEndpoint } = useGrpcContext();
await connectToEndpoint('https://my-node.example.com:443', 'devnet');
```

### Usar Field Masks para Optimizar Respuestas

```tsx
import { FIELD_MASK_PRESETS } from './utils/fieldMask';

export function OptimizedQuery() {
  const client = useSuiGrpcClient();

  const fetchOptimized = async () => {
    // Usar preset: solo campos esenciales de transacción
    const tx = await client.getTransaction('0x123...', 
      FIELD_MASK_PRESETS.TRANSACTION_BASIC
    );
    
    console.log(tx); // Solo contiene digest, status, gasUsed
  };

  return <button onClick={fetchOptimized}>Cargar (Optimizado)</button>;
}
```

### Manejo de Errores

```tsx
export function RobustComponent() {
  const { transaction, error } = useTransaction('0x123...');

  if (error) {
    if (error.includes('not found')) {
      return <p className="text-yellow-600">Transacción no encontrada</p>;
    }
    if (error.includes('UNAVAILABLE')) {
      return <p className="text-red-600">Servicio no disponible</p>;
    }
    return <p className="text-red-600">Error: {error}</p>;
  }

  return <div>{JSON.stringify(transaction)}</div>;
}
```

## 📚 API de Servicios Disponibles

### TransactionExecutionService
- `executeTransaction()` - Ejecutar transacción firmada
- `simulateTransaction()` - Simular ejecución

### LedgerService
- `getCheckpoint()` - Obtener checkpoint
- `getTransaction()` - Obtener transacción
- `getObject()` - Obtener objeto
- `batchGetTransactions()` - Batch de transacciones
- `batchGetObjects()` - Batch de objetos

### StateService
- `getCoinBalance()` - Balance de moneda específica
- `getAllCoinBalances()` - Todos los balances
- `getCoinInfo()` - Información de moneda
- `listOwnedObjects()` - Objetos del usuario
- `listDynamicFields()` - Campos dinámicos
- `dryRunTransaction()` - Simular transacción

### SubscriptionService
- `subscribeCheckpoints()` - Stream de checkpoints

### MovePackageService
- `getMovePackage()` - Obtener paquete
- `getMoveModule()` - Obtener módulo
- `getMoveStruct()` - Obtener struct
- `getMoveFunction()` - Obtener función

### SignatureVerificationService
- `verifySignature()` - Verificar firma
- `batchVerifySignatures()` - Batch de firmas

### NameService
- `resolveSuiNSName()` - Resolver nombre
- `reverseLookupAddress()` - Búsqueda inversa

## 🐛 Solución de Problemas

### Error: "useGrpcContext debe usarse dentro de un GrpcProvider"
```tsx
// ✗ Incorrecto - el hook está fuera del provider
<useGrpcContext /> // Error!

// ✓ Correcto - asegúrate que el componente esté dentro del provider
<GrpcProvider>
  <MyComponent /> {/* Aquí puedes usar useGrpcContext */}
</GrpcProvider>
```

### Error: "Cliente gRPC no está conectado"
```tsx
// Verifica si está conectado antes de usar el cliente
const { isConnected } = useGrpcContext();

if (!isConnected) {
  return <p>Por favor conecta primero</p>;
}

// Ahora está seguro usar el cliente
const client = useSuiGrpcClient();
```

### No Se Conecta al Endpoint
```tsx
// 1. Verifica que el endpoint sea válido
// 2. Asegúrate que no hay restricciones CORS
// 3. Verifica que gRPC está habilitado en el nodo
// 4. Intenta con devnet o testnet conocidos
```

### Performance Lenta
```tsx
// Usa field masks para reducir datos transferidos
import { FIELD_MASK_PRESETS } from './utils/fieldMask';

// En lugar de:
const tx = await client.getTransaction(digest); // Toda la data

// Usa:
const tx = await client.getTransaction(
  digest,
  FIELD_MASK_PRESETS.TRANSACTION_BASIC // Solo lo necesario
);
```

## 📦 Estructura de Archivos

```
src/
├── config/
│   └── grpcConfig.ts              # Configuración centralizada
├── contexts/
│   └── GrpcContext.tsx            # Context y Provider
├── services/
│   └── grpcClient.ts              # Cliente gRPC (40+ métodos)
├── hooks/
│   └── useGrpc.ts                 # 11 hooks personalizados
├── components/
│   ├── GrpcConnection.tsx         # Componentes de conexión
│   ├── GrpcApiExplorer.tsx        # Explorador de APIs
│   └── (otros componentes)
├── types/
│   └── grpc.ts                    # Definiciones TypeScript
├── utils/
│   └── fieldMask.ts               # Utilidades de field masks
└── examples/
    └── grpcExamples.ts            # Ejemplos de uso
```

## 🔗 Recursos Útiles

- [Documentación de Sui gRPC](https://docs.sui.io/guides/developer/sui-full-node/grpc-service)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
- [React Context API](https://react.dev/reference/react/createContext)
- [Custom Hooks React](https://react.dev/learn/reusing-logic-with-custom-hooks)

## ✅ Checklist de Integración

- [ ] Instalar dependencias (@radix-ui/themes)
- [ ] Envolver App con `<GrpcProvider>`
- [ ] Importar `GrpcConnectionSelector` en tu interfaz
- [ ] Probar conexión a devnet/testnet
- [ ] Implementar primeros hooks en componentes
- [ ] Configurar endpoint personalizado si es necesario
- [ ] Agregar manejo de errores específicos
- [ ] Optimizar con field masks si es necesario
- [ ] Desplegar con variables de entorno correctas

## 📞 Soporte

Para issues o preguntas:
1. Revisa los ejemplos en `examples/grpcExamples.ts`
2. Consulta la documentación de Sui oficial
3. Verifica logs del navegador (F12 → Console)
4. Asegúrate que el endpoint gRPC está activo
