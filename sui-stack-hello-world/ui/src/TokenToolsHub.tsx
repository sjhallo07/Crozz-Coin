import { Box, Button, Card, Container, Flex, Grid, Heading, Link, Text } from "@radix-ui/themes";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
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

export function TokenToolsHub({ onBack, onOpenApp }: { onBack: () => void; onOpenApp: () => void }) {
  return (
    <Container size="4" py="6">
      <BrandHeader onOpenApp={onOpenApp} />
      <Flex align="center" justify="between" mb="4">
        <Flex align="center" gap="3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} /> Volver
          </Button>
          <Box>
            <Text size="2" color="gray">Home / Tools</Text>
            <Heading size="7">Token Tools</Heading>
            <Text color="gray">Elige las herramientas para tu tipo de token.</Text>
          </Box>
        </Flex>

        <Button size="3" onClick={onOpenApp}>
          Ir al Dashboard de app
        </Button>
      </Flex>

      <Grid columns={{ initial: "1", md: "3" }} gap="4">
        <ToolCard
          title="ERC-20 Tools"
          description="Herramientas para tokens EVM (Ethereum, BSC, Base, Polygon, etc.)."
          cta="ERC-20 Tools"
        />
        <ToolCard
          title="Solana Tools"
          description="Herramientas para tokens SPL en Solana."
          cta="Solana Tools"
        />
        <ToolCard
          title="Sui Tools"
          description="Herramientas para tokens Sui: multisender, authority, metadata, mint/burn, freeze/pause."
          cta="Sui Tools"
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
        <Heading size="5" mb="2">Potencia tus operaciones</Heading>
        <Text color="gray">
          Multisender masivo, transfer/revoke authority, actualización de metadata, mint/burn y freeze/pause para proteger a tu comunidad. Flujos optimizados y controles sin código.
        </Text>
      </Card>

      <Card size="3" mt="4" variant="surface">
        <Heading size="5" mb="2">Cómo usar las tools</Heading>
        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <Step title="1. Elige token" description="Selecciona ERC-20, SPL o Sui según tu despliegue." />
          <Step title="2. Conecta y selecciona función" description="Multisender, metadata, mint/burn, freeze/pause, authority." />
          <Step title="3. Configura parámetros" description="Direcciones, montos, URIs, límites y toggles de seguridad." />
          <Step title="4. Ejecuta y verifica" description="Confirma on-chain y revisa resultados en el dashboard." />
        </Grid>
      </Card>
    </Container>
  );
}

function ToolCard({ title, description, cta, highlight }: { title: string; description: string; cta: string; highlight?: boolean }) {
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