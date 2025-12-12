import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { ECOSYSTEM_CONFIG } from "../config";
import { ConnectButton } from "@mysten/dapp-kit";

export function Header() {
  return (
    <Box
      style={{
        background: "linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
        borderBottom: "1px solid #3b3366",
        padding: "1rem 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Container size="4">
        <Flex justify="between" align="center" gap="4" style={{ padding: "0.5rem 0" }}>
          <Flex align="center" gap="3">
            <Text
              size="7"
              style={{
                margin: 0,
                fontWeight: "bold",
              }}
            >
              {ECOSYSTEM_CONFIG.logo}
            </Text>
            <Box>
              <Heading size="6" style={{ margin: 0, color: "#e0e7ff" }}>
                {ECOSYSTEM_CONFIG.fullName}
              </Heading>
              <Text size="2" style={{ color: "#a5b4fc" }}>
                {ECOSYSTEM_CONFIG.description}
              </Text>
            </Box>
          </Flex>
          <ConnectButton />
        </Flex>
      </Container>
    </Box>
  );
}
