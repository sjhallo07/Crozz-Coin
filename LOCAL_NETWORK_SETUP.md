# 🌐 Local Network Setup Guide for CROZZ

Este documento te guía paso a paso para configurar y usar una red local de Sui para desarrollo.

## 📋 Requisitos Previos

### 1. Instalar Sui CLI

**Opción A: macOS (con Homebrew)**
```bash
brew install sui
```

**Opción B: Linux/Ubuntu**
```bash
# Instalar Rust (si no está instalado)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Instalar Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui
```

**Opción C: Desde binarios**
Descarga desde: https://docs.sui.io/guides/developer/getting-started/sui-install

### 2. Verificar instalación
```bash
sui --version
# Debería mostrar: sui X.Y.Z
```

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Iniciar Red Local

Abre una terminal dedicada (esta debe permanecer abierta):

```bash
cd /workspaces/Crozz-Coin

# Iniciar red local con configuración para desarrollo
RUST_LOG="off,sui_node=info" sui start --with-faucet --force-regenesis --epoch-duration-ms 5000
```

**Explicación de flags:**
- `--with-faucet`: Inicia servicio de faucet para obtener test SUI
- `--force-regenesis`: Resetea el estado (blockchain limpio cada inicio)
- `--epoch-duration-ms 5000`: Épocas de 5 segundos (útil para testing)
- `RUST_LOG="off,sui_node=info"`: Reduce logging para mejor rendimiento

**Espera hasta ver:**
```
Fullnode RPC URL: http://127.0.0.1:9000
Faucet URL: http://127.0.0.1:9123
✓ Network started successfully
```

### Paso 2: Configurar Sui CLI

En una **nueva terminal**:

```bash
# Crear environment local (solo primera vez)
sui client new-env --alias local --rpc http://127.0.0.1:9000

# Cambiar a environment local
sui client switch --env local

# Verificar configuración
sui client envs
# Debería mostrar: local <- (activo)
```

### Paso 3: Obtener Test SUI

```bash
# Solicitar test SUI al faucet
sui client faucet

# Espera ~30-60 segundos, luego verifica
sui client gas

# Debería mostrar tus gas coins con balances
```

### Paso 4: Configurar dApp

El archivo `.env.local` ya está creado en `sui-stack-hello-world/ui/.env.local`:

```env
VITE_SUI_NETWORK=local
VITE_FULLNODE_URL=http://127.0.0.1:9000
VITE_FAUCET_URL=http://127.0.0.1:9123
```

### Paso 5: Publicar Contratos Localmente

```bash
cd /workspaces/Crozz-Coin/sui-stack-hello-world/move/hello-world

# Publicar package
sui client publish --gas-budget 100000000

# IMPORTANTE: Copia el PackageID del output
# Busca en "Published Objects" -> "PackageID"
```

**Actualiza** `sui-stack-hello-world/ui/src/constants.ts`:
```typescript
export const HELLO_WORLD_PACKAGE_ID = "TU_PACKAGE_ID_AQUI";
export const NETWORK = "local"; // Cambia de "testnet" a "local"
```

### Paso 6: Iniciar dApp

```bash
cd /workspaces/Crozz-Coin/sui-stack-hello-world/ui

# Instalar dependencias (si no lo has hecho)
pnpm install

# Iniciar dev server
pnpm dev

# Visita: http://localhost:5173
```

## 🎯 Configuraciones Avanzadas

### Full Stack (con Indexer + GraphQL)

Para desarrollo completo con GraphQL IDE:

```bash
# Requiere PostgreSQL instalado
RUST_LOG="off,sui_node=info" sui start \
  --with-faucet \
  --with-indexer \
  --with-graphql \
  --force-regenesis \
  --epoch-duration-ms 5000

# GraphQL IDE disponible en: http://127.0.0.1:9125
```

### Estado Persistente

Para mantener datos entre reinicios (sin --force-regenesis):

```bash
RUST_LOG="off,sui_node=info" sui start \
  --with-faucet \
  --epoch-duration-ms 5000

# El estado se guarda en ~/.sui/sui_config/
```

### Épocas Realistas

Para testing más cercano a producción (épocas de 24 horas):

```bash
RUST_LOG="off,sui_node=info" sui start \
  --with-faucet \
  --force-regenesis
```

### Puertos Personalizados

Si el puerto 9000 está ocupado:

```bash
sui start \
  --fullnode-rpc-port 8000 \
  --with-faucet=0.0.0.0:6123 \
  --force-regenesis

# Actualiza .env.local con los nuevos puertos
```

## 🔧 Troubleshooting

### ❌ Puerto 9000 ya está en uso

```bash
# Encontrar y matar proceso
lsof -i :9000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# O usar puerto diferente
sui start --fullnode-rpc-port 8000 --with-faucet
```

### ❌ Faucet no responde

```bash
# Verificar que faucet está corriendo
curl http://127.0.0.1:9123/health

# Si no responde, reinicia la red
# Ctrl+C en terminal de sui start, luego vuelve a iniciar
```

### ❌ Sin gas en wallet

```bash
# Solicitar más SUI
sui client faucet

# Verificar balance
sui client gas

# Espera 60 segundos entre solicitudes
```

### ❌ Transacciones fallan

```bash
# Verificar dirección activa
sui client active-address

# Verificar environment
sui client envs

# Verificar conexión RPC
curl -X POST http://127.0.0.1:9000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getTotalTransactionBlocks","params":[]}'
```

### ❌ dApp no conecta

1. Verifica que la red local está corriendo
2. Confirma `.env.local` tiene URLs correctas
3. Reinicia el dev server: `Ctrl+C` → `pnpm dev`
4. Verifica wallet está conectada a red local

## 📊 Monitoreo

### CLI Queries

```bash
# Ver total de transacciones
sui client call --address 0x2 --module system --function total_tx_count

# Ver tus objetos
sui client objects

# Ver balance
sui client gas

# Ver info de epoch
sui client call --address 0x2 --module sui_system --function get_epoch
```

### GraphQL Explorer

Si iniciaste con `--with-graphql`, visita:
- http://127.0.0.1:9125 - GraphQL IDE interactivo

### Exploradores Externos

Configura **Polymedia Explorer** para red local:
1. Visita https://explorer.polymedia.app/
2. Settings → Custom RPC
3. Ingresa: `http://127.0.0.1:9000`

## 🔄 Workflow de Desarrollo

### 1. Desarrollo de Contratos

```bash
# Terminal 1: Red local corriendo
sui start --with-faucet --force-regenesis --epoch-duration-ms 5000

# Terminal 2: Desarrollo
cd move/tu-contrato
# Edita código Move...

# Publicar cambios
sui client publish --gas-budget 100000000

# Copiar nuevo PackageID a constants.ts
```

### 2. Desarrollo de dApp

```bash
# Terminal 1: Red local corriendo
# Terminal 2: Dev server
cd ui
pnpm dev

# Hot reload automático al editar código
# Wallet conectada a red local
```

### 3. Testing E2E

```bash
# Terminal 1: Red local con indexer
sui start --with-faucet --with-indexer --with-graphql --force-regenesis

# Terminal 2: Publicar contratos
sui client publish

# Terminal 3: Tests
cd ui
npm test

# O tests manuales en navegador
```

## 📝 Best Practices

✅ **Usar `--epoch-duration-ms 5000`** para desarrollo rápido
✅ **Usar `--force-regenesis`** para testing limpio
✅ **Mantener terminal de red separada** para ver logs
✅ **Guardar PackageIDs** de cada publicación
✅ **Usar GraphQL** para queries complejas
✅ **Monitorear eventos** para debugging

❌ **No usar** `--force-regenesis` si necesitas persistencia
❌ **No exponer** red local a internet
❌ **No usar** keys de producción en local
❌ **No asumir** estado persiste entre reinicios (con --force-regenesis)

## 🔗 Enlaces Útiles

- **Documentación oficial**: https://docs.sui.io/guides/developer/sui-101/local-network
- **Sui CLI Reference**: https://docs.sui.io/references/cli
- **TypeScript SDK**: https://sdk.mystenlabs.com/typescript
- **Move by Example**: https://examples.sui.io/

## 💡 Tips

1. **Snapshots**: Guarda estado importante antes de cambios grandes
   ```bash
   cp -r ~/.sui/sui_config ~/.sui/sui_config.backup
   ```

2. **Múltiples addresses**: Crea addresses de prueba
   ```bash
   sui client new-address ed25519
   sui client switch --address 0x...
   ```

3. **Scripting**: Automatiza setup con scripts
   ```bash
   #!/bin/bash
   sui client switch --env local
   sui client faucet
   cd move/hello-world && sui client publish
   ```

4. **Logs detallados**: Para debugging profundo
   ```bash
   RUST_LOG="info" sui start --with-faucet
   ```

## 🎉 ¡Listo!

Ahora tienes un entorno de desarrollo local completo para Sui. Puedes:
- ✅ Desarrollar y testear contratos rápidamente
- ✅ Iterar en dApp sin costos de testnet
- ✅ Debuggear con logs detallados
- ✅ Usar GraphQL para queries complejas
- ✅ Testing E2E completo

Para más ayuda, consulta los archivos en `ui/src/config/`:
- `localNetworkGuide.ts` - Guía completa
- `localNetworkConfig.ts` - Referencia de configuración
- `localNetworkHelpers.ts` - Utilidades TypeScript
