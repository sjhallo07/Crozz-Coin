// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Button, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { CheckCircle2, Rocket, ShieldCheck, Sparkles } from "lucide-react";

interface ChainBadgeProps {
  label: string;
}

const chains = [
  "Sui",
  "Ethereum",
  "Optimism",
  "Polygon",
  "Base",
  "BSC",
  "Arbitrum",
  "Avalanche",
  "Linea",
  "Blast",
  "Scroll",
  "Metis",
  "Mantle",
  "Core",
  "Cronos",
  "PulseChain",
  "Unichain",
  "Monad",
  "Sonic",
  "HyperEVM",
];

const suiTools = [
  "Multisender",
  "Transfer authority",
  "Revoke authority",
  "Update metadata",
  "Mint / Burn",
  "Freeze / Unfreeze",
  "Pause / Unpause token",
];

const features = [
  "Token creator for Sui with owner dashboard",
  "Verification & ownership controls (pause, freeze, blacklist)",
  "Staking + contract insights: read & act on Move bytecode",
  "Gas-optimized flows and multi-network presets",
];

const safety = [
  "Use TreasuryCap for mint authority and scoped capabilities",
  "Validate supply caps, taxes, and limits on-chain",
  "Expose pausable / freezable toggles for emergency controls",
  "Surface RPC network and package IDs clearly in UI",
];

function ChainBadge({ label }: ChainBadgeProps) {
  return (
    <Card variant="classic" style={{ padding: "8px 12px", borderRadius: 999 }}>
      <Text size="2" weight="medium">
        {label}
      </Text>
    </Card>
  );
}

interface LandingPageProps {
  onOpenApp: () => void;
  onOpenGenerator?: () => void;
  onOpenDashboardHub?: () => void;
  onOpenToolsHub?: () => void;
}

export function LandingPage({ onOpenApp, onOpenGenerator, onOpenDashboardHub, onOpenToolsHub }: LandingPageProps) {
  return (
    <Box style={{ background: "radial-gradient(circle at 20% 20%, #1b1f33 0%, #0f111a 50%, #0b0d14 100%)", color: "white", minHeight: "100vh" }}>
      <Container size="4" px="4" py="6">
        {/* Hero */}
        <Flex direction="column" gap="6" align="start">
          <Box>
            <Text size="2" color="gray">Crozz Token Studio</Text>
            <Heading size="9" style={{ lineHeight: 1.1 }}>
              El generador de tokens más personalizable en Sui
            </Heading>
            <Text size="4" color="gray" mt="3" style={{ maxWidth: 720 }}>
              Crea tokens Sui listos para producción con dashboard de propietario, verificación de usuarios y controles de staking. Inspirado en la experiencia de 20lab, optimizado para Move y mejores prácticas Sui.
            </Text>
          </Box>

          <Flex gap="3" wrap="wrap" align="center">
            <Button size="3" radius="full" onClick={onOpenApp}>
              Abrir app
            </Button>
            <Button
              size="3"
              radius="full"
              variant="soft"
              onClick={() => (onOpenGenerator ? onOpenGenerator() : onOpenApp())}
            >
              Crear token Sui
            </Button>
            <Button
              size="3"
              radius="full"
              variant="ghost"
              onClick={() => (onOpenDashboardHub ? onOpenDashboardHub() : onOpenApp())}
            >
              Dashboards de tokens
            </Button>
            <Button
              size="3"
              radius="full"
              variant="ghost"
              onClick={() => (onOpenToolsHub ? onOpenToolsHub() : onOpenApp())}
            >
              Tools de tokens
            </Button>
            <ConnectButton connectText="Conectar wallet" />
          </Flex>

          {/* Trust signals */}
          <Grid columns="3" gap="3" style={{ width: "100%" }}>
            <Card size="3">
              <Flex gap="2" align="start">
                <Sparkles color="#7cf5a3" />
                <Box>
                  <Heading size="4">Customizable</Heading>
                  <Text color="gray">
                    17+ features: taxes, límites, metadata, recovery, pausable, mint/burn, freeze.
                  </Text>
                </Box>
              </Flex>
            </Card>
            <Card size="3">
              <Flex gap="2" align="start">
                <ShieldCheck color="#7cb8f5" />
                <Box>
                  <Heading size="4">Gobernanza y seguridad</Heading>
                  <Text color="gray">
                    Controles de propietario, pausas de emergencia y capacidades Move bien delimitadas.
                  </Text>
                </Box>
              </Flex>
            </Card>
            <Card size="3">
              <Flex gap="2" align="start">
                <Rocket color="#f5d47c" />
                <Box>
                  <Heading size="4">Gas optimizado</Heading>
                  <Text color="gray">Flujos preparados para ahorrar ~40% de gas en operaciones comunes.</Text>
                </Box>
              </Flex>
            </Card>
          </Grid>

          {/* Features bullets */}
          <Card size="3" style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <Heading size="5" mb="3">Lo que obtienes</Heading>
            <Grid columns={{ initial: "1", md: "2" }} gap="3">
              {features.map((item) => (
                <Flex key={item} gap="2" align="start">
                  <CheckCircle2 color="#7cf5a3" />
                  <Text>{item}</Text>
                </Flex>
              ))}
            </Grid>
          </Card>

          {/* Chains */}
          <Box style={{ width: "100%" }}>
            <Heading size="5" mb="3">Cadenas soportadas (enfoque Sui)</Heading>
            <Flex gap="2" wrap="wrap">
              {chains.map((chain) => (
                <ChainBadge key={chain} label={chain} />
              ))}
            </Flex>
          </Box>

          {/* Sui tools */}
          <Card size="3" style={{ width: "100%" }}>
            <Heading size="5" mb="3">Herramientas Sui incluidas</Heading>
            <Flex gap="2" wrap="wrap">
              {suiTools.map((tool) => (
                <Card key={tool} variant="classic" style={{ padding: "10px 12px" }}>
                  <Text>{tool}</Text>
                </Card>
              ))}
            </Flex>
          </Card>

          {/* Safety / best practices */}
          <Card size="3" style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <Heading size="5" mb="3">Buenas prácticas Sui</Heading>
            <Grid columns={{ initial: "1", md: "2" }} gap="3">
              {safety.map((item) => (
                <Flex key={item} gap="2" align="start">
                  <ShieldCheck color="#7cb8f5" />
                  <Text>{item}</Text>
                </Flex>
              ))}
            </Grid>
          </Card>

          {/* Steps */}
          <Card size="3" style={{ width: "100%" }}>
            <Heading size="5" mb="3">Cómo funciona</Heading>
            <Grid columns={{ initial: "1", md: "2" }} gap="3">
              <Step number={1} title="Conecta wallet" description="Selecciona estándar y red (Sui testnet/mainnet)." />
              <Step number={2} title="Configura tu token" description="Activa taxes, límites, pausas, metadata, mint/burn." />
              <Step number={3} title="Prueba en testnet" description="Despliega gratis en testnet y valida bytecode y funciones." />
              <Step number={4} title="Publica en mainnet" description="Despliega y gestiona desde el dashboard de propietario." />
            </Grid>
          </Card>

          {/* Pricing note */}
          <Card size="3" style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.04)" }}>
            <Heading size="5" mb="2">Modelo simple</Heading>
            <Text color="gray">
              Testnet: gratis. Mainnet: tarifa única + funciones opcionales (taxes, límites, pausas). Incluye verificación manual/personalizada del token.
            </Text>
          </Card>
        </Flex>
      </Container>
    </Box>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Card>
      <Flex direction="column" gap="2">
        <Text weight="bold" color="gray">Paso {number}</Text>
        <Heading size="4">{title}</Heading>
        <Text color="gray">{description}</Text>
      </Flex>
    </Card>
  );
}