import { Box, Container, Flex } from "@radix-ui/themes";
import { useState } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { OverviewPanel } from "./OverviewPanel";
import { BalancePanel } from "./BalancePanel";

type ActiveSection = "overview" | "balance" | "coins" | "marketplace" | "deepbook" | "wallet";

export function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewPanel />;
      case "balance":
        return <BalancePanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <Box style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)" }}>
      <Header />
      <Container size="4">
        <Flex gap="6" style={{ minHeight: "calc(100vh - 80px)", paddingTop: "2rem", paddingBottom: "2rem" }}>
          <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
          <Box style={{ flex: 1 }}>
            {renderSection()}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
