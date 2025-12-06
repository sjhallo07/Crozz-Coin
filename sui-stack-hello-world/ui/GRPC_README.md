# 🚀 Sistema de gRPC Integrado para Sui Stack

Una solución completa y lista para producción que integra todas las APIs gRPC de Sui (7 servicios) en una aplicación React moderna con TypeScript.

## ✨ Características Principales

### 🔧 Capa de Servicio Completa
- **40+ métodos** para acceder a todas las APIs de Sui
- **7 servicios gRPC** completamente implementados
- **Manejo automático de errores** y reintentos
- **Soporte para WebSocket** para suscripciones en tiempo real
- **Type-safe** con TypeScript completo

### ⚛️ Integración React Profunda
- **Context API** para gestión centralizada de estado
- **11 hooks personalizados** para operaciones comunes
- **Auto-conexión** al cargar la aplicación
- **Cambio dinámico de endpoints** entre devnet/testnet/mainnet
- **Caché inteligente** de resultados

### 🎨 Componentes UI Listos
- **GrpcConnectionSelector** - Panel de control de conexión
- **GrpcApiExplorer** - Explorador interactivo de todas las APIs
- **GrpcConnectionBadge** - Indicador de estado de conexión
- **Respuesta JSON visualizada** con syntax highlighting

### ⚙️ Configuración Profesional
- **Endpoints predefinidos** para todos los entornos
- **Field masks** para optimizar respuestas
- **Validadores de dirección** de Sui
- **Funciones utilitarias** para conversión de monedas
- **Variables de entorno** centralizadas

## 📁 Estructura de Archivos

```
sui-stack-hello-world/ui/src/
├── config/
│   └── grpcConfig.ts              # Configuración centralizada
├── contexts/
│   └── GrpcContext.tsx            # Context + Provider + Hooks
├── services/
│   └── grpcClient.ts              # Cliente gRPC
├── hooks/
│   └── useGrpc.ts                 # 11 Hooks personalizados
├── components/
│   ├── GrpcConnection.tsx         # Componentes de conexión
│   ├── GrpcApiExplorer.tsx        # Explorador interactivo
│   └── (otros)
├── types/
│   └── grpc.ts                    # Tipos TypeScript
├── utils/
│   └── fieldMask.ts               # Optimización de respuestas
├── examples/
│   └── grpcExamples.ts            # 14 ejemplos listos
└── App.example.tsx                # Ejemplo completo de App

INTEGRATION_GUIDE.md               # Guía de integración
README_GRPC.md                      # Documentación técnica
.env.example                        # Variables de entorno
```

## 🎯 Servicios Implementados

### 1. **TransactionExecutionService**
Ejecutar y simular transacciones en la red Sui
```tsx
const result = await client.executeTransaction(txBytes, signature);
const simulation = await client.simulateTransaction(txBytes);
```

### 2. **LedgerService**
Acceder al historial de la red y consultar transacciones/objetos
```tsx
const checkpoint = await client.getCheckpoint('1000');
const tx = await client.getTransaction('0x...');
const obj = await client.getObject('0x...');
```

### 3. **StateService**
Consultar datos actualizados del blockchain (balances, objetos, etc.)
```tsx
const balance = await client.getCoinBalance(address, coinType);
const objects = await client.listOwnedObjects(address);
const fields = await client.listDynamicFields(parentId);
```

### 4. **SubscriptionService**
Suscribirse a actualizaciones en tiempo real
```tsx
const unsubscribe = await client.subscribeCheckpoints((checkpoint) => {
  console.log('Nuevo checkpoint:', checkpoint);
});
```

### 5. **MovePackageService**
Acceder a metadatos de paquetes Move
```tsx
const pkg = await client.getMovePackage(packageId);
const module = await client.getMoveModule(packageId, moduleName);
```

### 6. **SignatureVerificationService**
Verificar firmas criptográficas
```tsx
const isValid = await client.verifySignature(message, signature);
```

### 7. **NameService**
Resolver nombres SuiNS
```tsx
const address = await client.resolveSuiNSName('myname.sui');
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
cd sui-stack-hello-world/ui
npm install
# o
pnpm install
```

### 2. Configuración Básica

```tsx
import React from 'react';
import { GrpcProvider } from './contexts/GrpcContext';
import { GrpcConnectionSelector } from './components/GrpcConnection';
import { GrpcApiExplorer } from './components/GrpcApiExplorer';

function App() {
  return (
    <GrpcProvider defaultEnvironment="devnet" autoConnect={true}>
      <div className="p-8">
        <h1>Sui gRPC Explorer</h1>
        <GrpcConnectionSelector />
        <GrpcApiExplorer />
      </div>
    </GrpcProvider>
  );
}

export default App;
```

### 3. Usar Hooks en Componentes

```tsx
import { useTransaction, useCoinBalances } from './hooks/useGrpc';

export function Dashboard({ address }: { address: string }) {
  const { transaction, loading } = useTransaction('0x...');
  const { balances } = useCoinBalances(address);

  return (
    <div>
      {loading ? <p>Cargando...</p> : <pre>{JSON.stringify(transaction)}</pre>}
    </div>
  );
}
```

## 📚 Documentación

### Archivos de Documentación
- **INTEGRATION_GUIDE.md** - Guía completa de integración con ejemplos
- **README_GRPC.md** - Documentación técnica detallada
- **examples/grpcExamples.ts** - 14 ejemplos de código listos para copiar

### Temas Cubiertos
- ✅ Configuración inicial
- ✅ Gestión de conexión
- ✅ Uso de hooks React
- ✅ Consultas avanzadas
- ✅ Manejo de errores
- ✅ Optimización con field masks
- ✅ Casos de uso comunes
- ✅ Solución de problemas

## 🎨 Componentes Disponibles

### GrpcConnectionSelector
Panel de control para cambiar de endpoint y entorno
```tsx
<GrpcConnectionSelector />
```

### GrpcApiExplorer
Interfaz interactiva para explorar todas las APIs
```tsx
<GrpcApiExplorer showConnectionSelector={false} />
```

### GrpcConnectionBadge
Indicador de estado minimalista
```tsx
<GrpcConnectionBadge /> {/* Muestra: gRPC (devnet) */}
```

### GrpcConnectionInfo
Panel informativo con detalles de conexión
```tsx
<GrpcConnectionInfo />
```

## 🎣 Hooks Disponibles

### useTransaction
```tsx
const { transaction, loading, error, refetch } = useTransaction(digest);
```

### useCoinBalances
```tsx
const { balances, loading, error } = useCoinBalances(address);
```

### useObject
```tsx
const { object, loading, error } = useObject(objectId);
```

### useCoinInfo
```tsx
const { coinInfo, loading, error } = useCoinInfo(coinType);
```

### useOwnedObjects
```tsx
const { objects, loading, error } = useOwnedObjects(address);
```

### useDynamicFields
```tsx
const { fields, loading, error } = useDynamicFields(parentId);
```

### useDryRunTransaction
```tsx
const { result, loading, dryRun } = useDryRunTransaction();
await dryRun(txBytes, signerAddress);
```

### useMovePackage
```tsx
const { pkg, loading, error } = useMovePackage(packageId);
```

### useSuiNSResolver
```tsx
const { record, loading, error } = useSuiNSResolver(name);
```

### useCheckpointSubscription
```tsx
const { latestCheckpoint, loading } = useCheckpointSubscription(true);
```

### useCheckpoint
```tsx
const { checkpoint, loading, error } = useCheckpoint(sequenceNumber);
```

## ⚙️ Configuración Avanzada

### Variables de Entorno
```bash
# .env
REACT_APP_GRPC_ENVIRONMENT=devnet
REACT_APP_GRPC_AUTO_CONNECT=true
REACT_APP_GRPC_TIMEOUT=30000
REACT_APP_GRPC_DEBUG=false
```

### Endpoints Soportados
```
Devnet:  fullnode.devnet.sui.io:443
Testnet: fullnode.testnet.sui.io:443
Mainnet: fullnode.mainnet.sui.io:443
Custom:  https://your-endpoint.com:443
```

### Optimización con Field Masks
```tsx
import { FIELD_MASK_PRESETS } from './utils/fieldMask';

// Solo campos esenciales
const tx = await client.getTransaction(digest, FIELD_MASK_PRESETS.TRANSACTION_BASIC);
```

## 📊 Ejemplos de Casos de Uso

### Dashboard de Balances
```tsx
export function BalanceDashboard({ address }: { address: string }) {
  const { balances, loading } = useCoinBalances(address);
  
  return loading ? <p>Loading...</p> : (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(balances || {}).map(([coin, amount]) => (
        <div key={coin} className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-600">{coin}</p>
          <p className="text-2xl font-bold">{amount}</p>
        </div>
      ))}
    </div>
  );
}
```

### Visor de Transacciones
```tsx
export function TransactionViewer({ digest }: { digest: string }) {
  const { transaction, loading, error } = useTransaction(digest);
  
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (loading) return <p>Cargando...</p>;
  
  return <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(transaction, null, 2)}</pre>;
}
```

### Monitor en Tiempo Real
```tsx
export function LiveMonitor() {
  const { latestCheckpoint } = useCheckpointSubscription(true);
  
  return (
    <div className="p-4 bg-blue-50 rounded">
      <h3>Checkpoint #{latestCheckpoint?.sequence_number}</h3>
      <p>Timestamp: {latestCheckpoint?.summary?.timestamp}</p>
    </div>
  );
}
```

## 🧪 Testing

```tsx
import { render, screen } from '@testing-library/react';
import { GrpcProvider } from './contexts/GrpcContext';

function TestComponent() {
  return (
    <GrpcProvider>
      <MyComponent />
    </GrpcProvider>
  );
}

test('component renders', () => {
  render(<TestComponent />);
  expect(screen.getByText(/algo/i)).toBeInTheDocument();
});
```

## 🐛 Solución de Problemas

### Error: "useGrpcContext must be used within GrpcProvider"
**Solución:** Asegúrate que tu componente está dentro de `<GrpcProvider>`

### Error: "Cliente gRPC no está conectado"
**Solución:** Verifica que `isConnected` sea true antes de usar el cliente

### Las solicitudes son lentas
**Solución:** Usa field masks para reducir el tamaño de las respuestas

### No se conecta al endpoint personalizado
**Solución:** Verifica que el endpoint sea válido y soporte gRPC

## 📈 Performance

- **Caché de resultados** automático
- **Field masks** para reducir payload
- **Reintentos inteligentes** con backoff exponencial
- **WebSocket reusable** para suscripciones
- **Timeouts configurables** para no bloquear

## 🔐 Seguridad

- ✅ Validación de direcciones de Sui
- ✅ Manejo seguro de errores
- ✅ Variables de entorno sensibles
- ✅ Soporte para endpoints HTTPS
- ✅ Verificación de firmas

## 🤝 Contribución

Las mejoras son bienvenidas. Por favor:
1. Prueba localmente
2. Agrupa cambios relacionados
3. Documenta nuevas características

## 📝 Licencia

Este proyecto está bajo licencia MIT.

## 🔗 Enlaces Útiles

- [Documentación Oficial de Sui](https://docs.sui.io)
- [gRPC Sui API Reference](https://docs.sui.io/guides/developer/sui-full-node/grpc-service)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
- [React Documentation](https://react.dev)

## 💡 Consejos

1. **Comienza con devnet** - Más seguro para probar
2. **Usa GrpcConnectionSelector** - Panel listo para producción
3. **Lee los ejemplos** - Hay 14 casos listos en `examples/grpcExamples.ts`
4. **Revisa los tipos** - TypeScript completo te guiará
5. **Consulta logs** - Abre F12 para ver logs de debug

---

**¡Listo para usar!** 🎉

Este sistema está completamente integrado y listo para producción. Todos los archivos están ubicados en `sui-stack-hello-world/ui/src/` y funcionan sin dependencias externas adicionales.

Para comenzar: revisa `INTEGRATION_GUIDE.md` y `App.example.tsx`
