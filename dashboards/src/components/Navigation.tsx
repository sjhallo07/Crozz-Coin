import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { MENU_ITEMS } from "../config";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: any) => void;
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  return (
    <Box
      style={{
        width: "220px",
        background: "rgba(30, 27, 75, 0.5)",
        border: "1px solid #3b3366",
        borderRadius: "12px",
        padding: "1rem 0",
        height: "fit-content",
        position: "sticky",
        top: "100px",
      }}
    >
      <Flex direction="column" gap="2" style={{ padding: "0 0.5rem" }}>
        {MENU_ITEMS.map((item) => (
          <Button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background:
                activeSection === item.id
                  ? "rgba(139, 92, 246, 0.3)"
                  : "transparent",
              borderLeft: activeSection === item.id ? "3px solid #8b5cf6" : "3px solid transparent",
              color: activeSection === item.id ? "#e0e7ff" : "#cbd5e1",
              padding: "0.75rem 1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "left",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <Text style={{ marginRight: "0.5rem" }}>{item.icon}</Text>
            <Text size="2">{item.label}</Text>
          </Button>
        ))}
      </Flex>
    </Box>
  );
}
