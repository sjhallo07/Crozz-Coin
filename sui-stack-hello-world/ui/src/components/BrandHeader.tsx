import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";

interface BrandHeaderProps {
  onOpenApp?: () => void;
  tagline?: string;
}

export function BrandHeader({ onOpenApp, tagline = "Token Studio & Analytics" }: BrandHeaderProps) {
  return (
    <Flex direction={{ initial: "column", sm: "row" }} align={{ initial: "start", sm: "center" }} justify="between" gap="3" mb="4">
      <Flex align="center" gap="3">
        <img
          src="/logo-no-background.png"
          alt="Crozz Ecosystem logo"
          style={{ width: 52, height: 52, borderRadius: "12px" }}
        />
        <Box>
          <Text size="1" color="gray">CROZZ</Text>
          <Heading size="6">CROZZ ECOSYSTEM</Heading>
          <Text size="2" color="gray">{tagline}</Text>
        </Box>
      </Flex>

      {onOpenApp && (
        <Button size="3" variant="solid" onClick={onOpenApp}>
          Abrir app
        </Button>
      )}
    </Flex>
  );
}
