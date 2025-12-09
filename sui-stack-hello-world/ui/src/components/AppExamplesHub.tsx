import { useState } from "react";
import { Box, Badge, Button, Card, Dialog, Flex, Heading, Tabs, Text } from "@radix-ui/themes";
import { InfoCircledIcon, RocketIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { buildTrustlessSwapTake, buildDistributedCounterIncrement } from "../sdk/helpers";

type ExampleTab = "payments" | "defi" | "oracle" | "games" | "tools";

export function AppExamplesHub() {
  const [activeTab, setActiveTab] = useState<ExampleTab>("payments");

  return (
    <Card size="3" style={{ marginTop: "20px" }}>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Badge color="green">App Examples</Badge>
            <Heading size="5">Crozz Multi‑Use dApp Hub</Heading>
          </Flex>
        </Flex>

        <Flex align="center" gap="2">
          <InfoCircledIcon />
          <Text size="1" color="gray">
            Usa la misma cuenta de Sui para explorar pagos, DeFi, oráculos y juegos. Los ejemplos complejos se
            abren en paneles secundarios para no saturar la pantalla principal.
          </Text>
        </Flex>

        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as ExampleTab)}>
          <Tabs.List>
            <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
            <Tabs.Trigger value="defi">DeFi</Tabs.Trigger>
            <Tabs.Trigger value="oracle">Weather Oracle</Tabs.Trigger>
            <Tabs.Trigger value="games">Tic‑Tac‑Toe</Tabs.Trigger>
            <Tabs.Trigger value="tools">Dev / Tools</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="payments">
            <PaymentsSummary />
          </Tabs.Content>
          <Tabs.Content value="defi">
            <DefiSummary />
          </Tabs.Content>
          <Tabs.Content value="oracle">
            <WeatherOracleSummary />
          </Tabs.Content>
          <Tabs.Content value="games">
            <GamesSummary />
          </Tabs.Content>
          <Tabs.Content value="tools">
            <ToolsSummary />
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Card>
  );
}

function PaymentsSummary() {
  const [openUSDC, setOpenUSDC] = useState(false);
  const [openRegulated, setOpenRegulated] = useState(false);

  return (
    <Flex direction="column" gap="3" mt="3">
      <Heading size="3">Pagos y monedas</Heading>
      <Text size="2" color="gray">
        Usa los paneles de Crozz para crear monedas, displays y enlaces de pago sin salir de esta pantalla.
        Para guías más largas se abrirán ventanas secundarias.
      </Text>

      <Flex gap="2" wrap="wrap">
        <Button variant="soft" onClick={() => setOpenUSDC(true)}>
          <ExternalLinkIcon />
          <span style={{ marginLeft: 6 }}>Ver USDC transfer app</span>
        </Button>
        <Button variant="soft" onClick={() => setOpenRegulated(true)}>
          <ExternalLinkIcon />
          <span style={{ marginLeft: 6 }}>Moneda regulada</span>
        </Button>
      </Flex>

      <Dialog.Root open={openUSDC} onOpenChange={setOpenUSDC}>
        <Dialog.Content>
          <Dialog.Title>USDC Transfer App (ejemplo)</Dialog.Title>
          <Dialog.Description>
            Basado en <code>/examples/usdc-transfer-app</code>. Usa tu misma cuenta Sui para mover stablecoins;
            la UI detallada se puede cargar en una vista secundaria para no saturar el landing.
          </Dialog.Description>
          <Box mt="3" style={{ fontSize: 13, color: "var(--gray-11)" }}>
            - Requiere package y policy deployados en la red que uses.<br />
            - Puedes reutilizar los paneles de Payment URI y Registry para generar pagos seguros.<br />
            - Usa el hook <code>useTransactionExecution</code> para firmar PTBs consistentes.
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={openRegulated} onOpenChange={setOpenRegulated}>
        <Dialog.Content>
          <Dialog.Title>Moneda regulada</Dialog.Title>
          <Dialog.Description>
            Basado en <code>/examples/regulated-coin</code>. Roles, políticas y transferencias con permisos.
            Ideal para casos KYC/allowlist. Se abrirá en vista separada cuando actives el ejemplo.
          </Dialog.Description>
          <Box mt="3" style={{ fontSize: 13, color: "var(--gray-11)" }}>
            - Configura autoridades y políticas en el backend.<br />
            - Expone flows de mint/burn/transfer según roles.<br />
            - Integra displays con los paneles ya existentes.
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}

function DefiSummary() {
  const [openSwap, setOpenSwap] = useState(false);

  return (
    <Flex direction="column" gap="3" mt="3">
      <Heading size="3">DeFi con DeepBook</Heading>
      <Text size="2" color="gray">
        Gestiona balances, pools y órdenes usando DeepBook V3. Aquí verás resúmenes rápidos; las vistas
        completas viven en sus propios paneles.
      </Text>
      <Text size="1" color="gray">
        Ejemplos: <code>/examples/trading</code> y flujos de Trustless Swap. Usa este hub para disparar un panel
        secundario cuando quieras ejecutar swaps con tu misma cuenta.
      </Text>
      <Button
        variant="soft"
        onClick={() => setOpenSwap(true)}
      >
        <RocketIcon />
        <span style={{ marginLeft: 6 }}>Abrir Trustless Swap</span>
      </Button>

      <Dialog.Root open={openSwap} onOpenChange={setOpenSwap}>
        <Dialog.Content>
          <Dialog.Title>Trustless Swap (resumen)</Dialog.Title>
          <Dialog.Description>
            Basado en el patrón de Sui App Examples. Usa PTBs con condiciones atómicas para asegurar que ambas
            partes reciben sus activos o nada se mueve.
          </Dialog.Description>
          <Box mt="3" style={{ fontSize: 13, color: "var(--gray-11)", lineHeight: 1.5 }}>
            - Prepara el PTB: entrada de Coin A, output de Coin B.<br />
            - Firma y ejecuta con <code>useTransactionExecution</code>.<br />
            - Cuando tengas packageId, cambia el placeholder y habilita el botón de ejecución usando
            <code>buildTrustlessSwapTake</code>.
          </Box>
          <Box mt="3" style={{ fontSize: 12, fontFamily: "monospace", background: "var(--gray-a2)", padding: 12, borderRadius: 6 }}>
{`// Pseudocódigo
const tx = new Transaction();
execute((t) => {
  buildTrustlessSwapTake(t, {
    packageId: "<PKG>",
    swapCap: "<SWAP_CAP>",
    coinIn: "<COIN_OBJECT>",
    expectedOut: 1_000_000n,
    recipient: "<SUI_ADDRESS>",
  });
});`}
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}

function WeatherOracleSummary() {
  return (
    <Flex direction="column" gap="3" mt="3">
      <Heading size="3">Weather Oracle</Heading>
      <Text size="2" color="gray">
        Consulta datos de clima on‑chain actualizados por un backend autorizado. El oráculo usa objetos
        compartidos y campos dinámicos para cada ciudad.
      </Text>
      <Text size="1" color="gray">
        El panel detallado se puede abrir como segunda ventana con gráficos y lista de ciudades una vez que el
        contrato esté desplegado en tu red.
      </Text>
    </Flex>
  );
}

function GamesSummary() {
  const [openTicTacToe, setOpenTicTacToe] = useState(false);
  const [openCounter, setOpenCounter] = useState(false);

  return (
    <Flex direction="column" gap="3" mt="3">
      <Heading size="3">Tic‑Tac‑Toe on‑chain</Heading>
      <Text size="2" color="gray">
        Crea partidas owned, shared o multisig reutilizando tu misma cuenta. El tablero completo se mostrará en
        una vista secundaria para no recargar el landing.
      </Text>

      <Flex gap="2" wrap="wrap">
        <Button variant="soft" onClick={() => setOpenTicTacToe(true)}>
          <ExternalLinkIcon />
          <span style={{ marginLeft: 6 }}>Abrir Tic‑Tac‑Toe</span>
        </Button>
        <Button variant="soft" onClick={() => setOpenCounter(true)}>
          <ExternalLinkIcon />
          <span style={{ marginLeft: 6 }}>Distributed Counter</span>
        </Button>
      </Flex>

      <Dialog.Root open={openTicTacToe} onOpenChange={setOpenTicTacToe}>
        <Dialog.Content>
          <Dialog.Title>Tic‑Tac‑Toe (owned/shared/multisig)</Dialog.Title>
          <Dialog.Description>
            Basado en <code>/examples/tic-tac-toe</code>. Crea partidas owned o shared; en multisig el admin es
            un public key agregado.
          </Dialog.Description>
          <Box mt="3" style={{ fontSize: 13, color: "var(--gray-11)" }}>
            - Crea partida (shared) y comparte el objeto <code>Game</code>.<br />
            - Cada jugada es un PTB con checks de turno y estado.<br />
            - Para multisig, firma dual: multisig + jugador (gas sponsor).
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={openCounter} onOpenChange={setOpenCounter}>
        <Dialog.Content>
          <Dialog.Title>Distributed Counter</Dialog.Title>
          <Dialog.Description>
            Patrón simple de objeto compartido que múltiples usuarios pueden incrementar. Ideal para mostrar
            contención y ordering en Sui.
          </Dialog.Description>
          <Box mt="3" style={{ fontSize: 12, fontFamily: "monospace", background: "var(--gray-a2)", padding: 12, borderRadius: 6 }}>
{`// Pseudocódigo
const tx = new Transaction();
execute((t) => {
  buildDistributedCounterIncrement(t, {
    packageId: "<PKG>",
    counterId: "<COUNTER_ID>",
  });
});`}
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}

function ToolsSummary() {
  return (
    <Flex direction="column" gap="3" mt="3">
      <Heading size="3">Herramientas de desarrollo</Heading>
      <Text size="2" color="gray">
        Accede rápidamente a GraphQL, viewers de objetos y futuras integraciones con indexers sin saturar la
        página principal.
      </Text>
      <Text size="1" color="gray">
        Usa los ejemplos de <code>crates/sui-graphql-rpc/examples</code> para precargar consultas en el
        GraphQL Explorer, o integra tus propios indexers en vistas secundarias.
      </Text>
    </Flex>
  );
}
