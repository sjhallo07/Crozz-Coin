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

export function TokenDashboardHub({ onBack, onOpenApp }: { onBack: () => void; onOpenApp: () => void }) {
  return (
    <Container size="4" py="6">
      <BrandHeader onOpenApp={onOpenApp} />
      <Flex align="center" justify="between" mb="4">
        <Flex align="center" gap="3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} /> Volver
          </Button>
          <Box>
            <Text size="2" color="gray">Home / Dashboard</Text>
            <Heading size="7">Manage Tokens</Heading>
            <Text color="gray">Selecciona el tipo de token cuyo dashboard quieres abrir.</Text>
          </Box>
        </Flex>

        <Button size="3" onClick={onOpenApp}>
          Ir al Dashboard de app
        </Button>
      </Flex>

      <Grid columns={{ initial: "1", md: "3" }} gap="4">
        <TokenCard
          title="ERC-20 Tokens"
          description="Administra tokens en EVM (Ethereum, BSC, Base, Polygon, etc.)."
          cta="ERC-20 Token Dashboard"
        />
        <TokenCard
          title="SPL Tokens"
          description="Administra tokens SPL creados en Solana."
          cta="SPL Token Dashboard"
        />
        <TokenCard
          title="Sui Tokens"
          description="Administra tokens Sui creados con el módulo Coin y capacidades Move."
          cta="Sui Token Dashboard"
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
        <Heading size="5" mb="2">Gestiona con eficiencia</Heading>
        <Text color="gray">
          Accede a funciones generales (transfer, allowances), controles de ownership, límites y seguridad (pause/freeze/blacklist), y métricas clave de supply y LP en un solo lugar.
        </Text>
      </Card>

      <Card size="3" mt="4" variant="surface">
        <Heading size="5" mb="2">Cómo usar el dashboard</Heading>
        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <Step title="1. Abre el dashboard" description="Elige el tipo de token y conéctate." />
          <Step title="2. Ejecuta funciones" description="Administra mint/burn, pausas, límites y metadata sin código." />
          <Step title="3. Ajusta tokenomics" description="Modifica parámetros según evoluciona tu proyecto." />
          <Step title="4. Monitorea" description="Revisa métricas de supply y liquidez desde un panel unificado." />
        </Grid>
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