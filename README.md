# Crozz-Coin

Paquete Move para desplegar **CROZZ COIN 2.0** en la red **Sui**, con funciones de mint y burn controladas mediante `TreasuryCap` y registro de metadata con `coin_registry`.

## Estructura del proyecto

- `Move.toml`: configuración del paquete Move y dependencia del framework Sui.
- `sources/crozz_coin.move`: módulo del token `CROZZ_COIN`.
- `assets/`: logos extraídos del sitio público de Crozz Coin y su referencia de origen.
- `ui/`: dashboard admin en React/Vite conectado al paquete Move mediante wallet y PTBs.
- `scripts/install_sui_cli.sh`: instala el CLI de Sui en `.tools/sui`.
- `scripts/suiw`: wrapper que usa el `sui` global o el local del proyecto.
- `.vscode/cline_mcp_settings.example.json`: ejemplo de configuración MCP para prompts remotos.

## Contrato incluido

El módulo `crozz_coin::crozz_coin`:

- crea la moneda durante la publicación del paquete usando `coin_registry::new_currency_with_otw`,
- elimina el `MetadataCap` durante la inicialización para dejar el metadata inmutable,
- emite un `AdminCap` al publicador para control capability-based,
- crea y comparte `TreasuryState`, un objeto compartido con estado administrativo visible por UI e indexadores,
- transfiere el `TreasuryCap` al publicador,
- permite hacer `mint` a una dirección,
- permite hacer `burn` de monedas existentes,
- permite pausar y reanudar el flujo admin,
- permite transferir la capacidad administrativa a otra dirección,
- emite eventos de `mint`, `burn`, `pause` y `admin transfer`.

## Prerrequisitos

Necesitas tener instalado el CLI de Sui en tu entorno antes de compilar o publicar.

Este repositorio incluye un instalador local para no depender de una instalación global:

```bash
./scripts/install_sui_cli.sh
```

Comprueba que está disponible con:

```bash
./scripts/suiw --version
```

## Build y despliegue

### 1. Selecciona la red

Para **devnet**:

```bash
./scripts/suiw client switch --env devnet
```

Para **testnet**:

```bash
./scripts/suiw client switch --env testnet
```

Para **mainnet**:

```bash
./scripts/suiw client switch --env mainnet
```

### 2. Compila el paquete

```bash
./scripts/suiw move build
```

### 3. Publica el contrato

```bash
./scripts/suiw client publish --gas-budget 100000000
```

### 4. Finaliza el registro del currency en `coin_registry`

El flujo moderno con **One-Time Witness** requiere una segunda transacción para promover el `Currency<CROZZ_COIN>` al registry compartido.

Usa el `Currency` object creado durante el `publish`:

```bash
./scripts/suiw client ptb \
 --assign @<CREATED_CURRENCY_OBJECT_ID> currency_to_promote \
 --move-call 0x2::coin_registry::finalize_registration <PACKAGE_ID>::crozz_coin::CROZZ_COIN @0xc currency_to_promote \
 --gas-budget 100000000
```

Después de publicar:

- guarda el `packageId`,
- guarda el `AdminCap` transferido al publicador,
- guarda el `created_currency_object_id` que devuelve el publish,
- guarda el `TreasuryState` shared object creado durante la publicación,
- guarda el `TreasuryCap` transferido al publicador,
- usa ese objeto para operaciones futuras de `mint` y `burn`.

## Uso del token

Durante la publicación, el módulo crea:

- símbolo: `CROZZ`
- nombre: `CROZZ COIN 2.0`
- decimales: `9`
- descripción: `The ultimate decentralized CROZZ token on the Sui Blockchain`
- icon URL: `https://crozzcoin.com/wp-content/uploads/2025/08/cropped-logo-no-background-270x270.png`

## Acceso de administrador estilo Sui

El contrato ahora expone conceptos clave del modelo **Ethereum → Sui**:

- `AdminCap`: capability object requerido para acciones administrativas.
- `TreasuryState`: shared object con:
  - `admin`
  - `treasury_cap_id`
  - `total_minted`
  - `total_burned`
  - `is_paused`
  - `version`
- eventos indexables:
  - `MintEvent`
  - `BurnEvent`
  - `PauseEvent`
  - `AdminTransferredEvent`

Esto muestra en práctica el enfoque recomendado de Sui:

- **capability-based access control** en lugar de roles basados solo en dirección,
- **state in objects** en lugar de storage interno estilo Solidity,
- **programmable transaction blocks** para construir las operaciones desde el cliente.

## Dashboard admin React

El directorio `ui/` contiene un panel admin construido con **React + Vite + @mysten/dapp-kit**.

El dashboard permite:

- conectar wallet Sui,
- descubrir `AdminCap` y `TreasuryCap` del wallet activo,
- leer el objeto compartido `TreasuryState`,
- ejecutar `mint`, `burn`, `pause/resume`,
- transferir el `AdminCap` a otro administrador,
- ver eventos recientes del paquete,
- visualizar una comparación práctica entre el modelo de Ethereum y Sui.

### Variables de entorno del dashboard

Configura en el archivo raíz `.env`:

```bash
VITE_SUI_NETWORK=testnet
VITE_SUI_PACKAGE_ID=0xYOUR_PACKAGE_ID
VITE_SUI_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID
VITE_SUI_TREASURY_CAP_ID=0xYOUR_TREASURY_CAP_ID
VITE_SUI_TREASURY_STATE_ID=0xYOUR_TREASURY_STATE_ID
VITE_SUI_COIN_TYPE=0xYOUR_PACKAGE_ID::crozz_coin::CROZZ_COIN
VITE_SUI_TOKEN_SYMBOL=CROZZ
VITE_SUI_TOKEN_DECIMALS=9
VITE_SUI_TOKEN_ICON_URL=https://crozzcoin.com/wp-content/uploads/2025/08/cropped-logo-no-background-270x270.png
```

Notas:

- `VITE_SUI_TREASURY_STATE_ID` es obligatorio para la UI.
- `VITE_SUI_ADMIN_CAP_ID` y `VITE_SUI_TREASURY_CAP_ID` pueden autodescubrirse si el wallet conectado posee esos objetos.

### Ejecutar el dashboard

Instala dependencias:

```bash
cd ui
pnpm install
```

Modo desarrollo:

```bash
pnpm dev
```

Build de producción:

```bash
pnpm build
```

## Logo extraído del sitio

Se detectaron y guardaron dos assets públicos desde `https://crozzcoin.com/`:

- `assets/logo-source.png` — logo principal del sitio, PNG `1000x1000`
- `assets/logo-square-source.png` — variante cuadrada, PNG `270x270`
- `assets/SOURCE.md` — referencia del origen y URLs públicas detectadas en el HTML

La variante cuadrada es la que se usa como `icon_url` del token en `sources/crozz_coin.move`.

## Configuración MCP en VS Code

Si usas una extensión compatible con **Model Context Protocol (MCP)**, puedes conectar un servidor remoto para centralizar prompts o instrucciones del sistema.

Ubicaciones comunes de configuración:

- `~/.vscode/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- `.vscode/cline_mcp_settings.json`

Este repositorio incluye un ejemplo listo para copiar en:

- `.vscode/cline_mcp_settings.example.json`

### Ejemplo

```json
{
 "mcpServers": {
  "remote-sui-prompts": {
   "command": "ssh",
   "args": [
    "user@your-remote-server.com",
    "npx",
    "-y",
    "@modelcontextprotocol/server-everything"
   ],
   "disabled": false,
   "alwaysAllow": [
    "get_master_prompt",
    "list_prompts"
   ]
  },
  "local-prompt-manager": {
   "command": "node",
   "args": [
    "/path/to/your/local/mcp-server/build/index.js"
   ]
  }
 }
}
```

## Notas importantes

- La dirección `crozz_coin = "0x0"` en `Move.toml` es adecuada para desarrollo y publicación inicial.
- Una vez publicado el paquete, el tipo del token quedará anclado al `packageId` resultante.
- El directorio `.tools/` está ignorado en git para que el binario local de Sui no termine accidentalmente versionado.
- El flujo `coin_registry::new_currency_with_otw` requiere el paso adicional `finalize_registration` tras el publish.
- Si vas a automatizar despliegues por entorno, conviene mantener scripts separados para `devnet`, `testnet` y `mainnet`.
