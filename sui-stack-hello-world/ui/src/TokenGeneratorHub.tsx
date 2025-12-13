import { Box, Button, Card, Container, Flex, Grid, Heading, Link, Text } from "@radix-ui/themes";
import { ArrowLeft, BookOpen, ExternalLink, Rocket } from "lucide-react";
import { BrandHeader } from "./components/BrandHeader";

type BlogPost = {
  title: string;
  date: string;
  readTime: string;
  description: string;
};

const blogPosts: BlogPost[] = [
  {
    title: "How to Get Listed on CoinGecko",
    date: "September 11, 2025",
    readTime: "8 min read",
    description:
      "Guía completa para listar tu token en CoinGecko: requisitos, aplicación y tips para 2026.",
  },
  {
    title: "How to Get Listed on CoinMarketCap",
    date: "September 04, 2025",
    readTime: "8 min read",
    description: "Proceso paso a paso para CMC: requisitos, tokenomics y estrategia.",
  },
  {
    title: "How to Change Sui Token Metadata",
    date: "June 24, 2025",
    readTime: "5 min read",
    description: "Actualiza nombre, símbolo, logo y descripción de tu token Sui con buenas prácticas.",
  },
  {
    title: "Building a Token with Freezable Feature on Sui",
    date: "April 13, 2025",
    readTime: "9 min read",
    description: "Implementa deny list y freeze/unfreeze en Move para mayor seguridad.",
  },
];

export function TokenGeneratorHub({ onBack, onOpenApp }: { onBack: () => void; onOpenApp: () => void }) {
  return (
    <Container size="4" py="6">
      <BrandHeader onOpenApp={onOpenApp} />
      <Flex align="center" justify="between" mb="4">
        <Flex align="center" gap="3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} /> Volver
          </Button>
          <Box>
            <Text size="2" color="gray">Home / Generate</Text>
            <Heading size="7">Crypto Token Generator</Heading>
            <Text color="gray">Selecciona el tipo de token que deseas crear.</Text>
          </Box>
        </Flex>

        <Button size="3" onClick={onOpenApp}>
          Ir al Dashboard
        </Button>
      </Flex>

      <Grid columns={{ initial: "1", md: "3" }} gap="4">
        <TokenCard
          title="ERC-20 Token"
          description="Crea tu token en EVM (Ethereum, BSC, Base, Polygon, etc.)"
          cta="Create ERC-20 Token"
        />
        <TokenCard
          title="SPL Token"
          description="Crea tu token en Solana usando programas SPL."
          cta="Create SPL Token"
        />
        <TokenCard
          title="Sui Token"
          description="Crea tu token en Sui usando el módulo Coin y capacidades Move."
          cta="Create Sui Token"
          highlight
        />
      </Grid>

      <Flex justify="between" align="center" mt="6" mb="3">
        <Heading size="5">Featured Blog Posts</Heading>
        <Link href="#" target="_blank">
          Visit our Blog <ExternalLink size={14} />
        </Link>
      </Flex>

      <Grid columns={{ initial: "1", md: "2" }} gap="3">
        {blogPosts.map((post) => (
          <Card key={post.title} size="3">
            <Flex direction="column" gap="2">
              <Text size="1" color="gray">{post.date} · {post.readTime}</Text>
              <Heading size="4">{post.title}</Heading>
              <Text color="gray">{post.description}</Text>
              <Link href="#" target="_blank">
                Leer más <ExternalLink size={14} />
              </Link>
            </Flex>
          </Card>
        ))}
      </Grid>

      <Card size="3" mt="6">
        <Heading size="5" mb="2">Cómo usar el generador</Heading>
        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <Step title="1. Conecta tu wallet" description="Elige estándar y red (testnet/mainnet)." />
          <Step title="2. Configura tu token" description="Rellena metadata y activa features opcionales (taxes, limits, pause, freeze)." />
          <Step title="3. Prueba en testnet" description="Despliega gratis, revisa bytecode y funciones." />
          <Step title="4. Publica en mainnet" description="Verifica parámetros en el resumen y despliega; gestiona en el owner dashboard." />
        </Grid>
      </Card>

      <Card size="3" mt="6" variant="surface">
        <Flex gap="3" align="start">
          <Rocket size={24} />
          <Box>
            <Heading size="5">Ready to launch?</Heading>
            <Text color="gray">Crea tu token y pasa al dashboard de propietario para gestionar mint/burn, pausas y metadata.</Text>
            <Flex gap="3" mt="3">
              <Button onClick={onOpenApp}>Abrir app</Button>
              <Button variant="soft" onClick={onBack}>Volver a Home</Button>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </Container>
  );
}

function TokenCard({ title, description, cta, highlight }: { title: string; description: string; cta: string; highlight?: boolean }) {
  return (
    <Card size="4" variant={highlight ? "surface" : "classic"} style={highlight ? { borderColor: "var(--blue-8)" } : {}}>
      <Flex direction="column" gap="3" justify="between" style={{ minHeight: "200px" }}>
        <Box>
          <Heading size="4">{title}</Heading>
          <Text color="gray" size="2">{description}</Text>
        </Box>
        <Button>{cta}</Button>
      </Flex>
    </Card>
  );
}

function Step({ title, description }: { title: string; description: string }) {
  return (
    <Flex gap="2" align="start">
      <BookOpen size={18} />
      <Box>
        <Heading size="4">{title}</Heading>
        <Text color="gray">{description}</Text>
      </Box>
    </Flex>
  );
}