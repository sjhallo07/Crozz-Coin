// Secondary Window/Panel for Global Information and Recommendations
import { Box, Flex, Heading, Text, Button, Badge, Card } from "@radix-ui/themes";
import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface InfoPanel {
  id: string;
  title: string;
  icon: string;
  content: string;
  type: "info" | "warning" | "success" | "tip";
}

interface SecondaryWindowProps {
  panels: InfoPanel[];
  position?: "right" | "bottom";
  defaultOpen?: boolean;
}

const typeColors = {
  info: { bg: "var(--blue-a2)", border: "var(--blue-7)", text: "var(--blue-11)" },
  warning: { bg: "var(--orange-a2)", border: "var(--orange-7)", text: "var(--orange-11)" },
  success: { bg: "var(--green-a2)", border: "var(--green-7)", text: "var(--green-11)" },
  tip: { bg: "var(--purple-a2)", border: "var(--purple-7)", text: "var(--purple-11)" },
};

export function SecondaryWindow({
  panels,
  position = "bottom",
  defaultOpen = false,
}: SecondaryWindowProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set());

  const togglePanel = (id: string) => {
    const newExpanded = new Set(expandedPanels);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPanels(newExpanded);
  };

  if (!panels || panels.length === 0) {
    return null;
  }

  const positionStyles =
    position === "right"
      ? {
          position: "fixed" as const,
          right: "20px",
          bottom: "20px",
          width: "400px",
          maxHeight: "80vh",
        }
      : {
          position: "fixed" as const,
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "300px",
        };

  return (
    <Box
      style={{
        ...positionStyles,
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        borderRadius: "8px",
        background: "var(--gray-1)",
        border: "1px solid var(--gray-6)",
      }}
    >
      <Flex direction="column" style={{ height: "100%" }}>
        {/* Header */}
        <Flex
          justify="between"
          align="center"
          px="4"
          py="3"
          style={{ borderBottom: "1px solid var(--gray-6)" }}
        >
          <Heading size="3">Information Panel</Heading>
          <Flex gap="2">
            <Button
              variant="ghost"
              size="1"
              onClick={() => setIsOpen(!isOpen)}
              title={isOpen ? "Minimize" : "Expand"}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="1"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              <X size={16} />
            </Button>
          </Flex>
        </Flex>

        {/* Content */}
        {isOpen && (
          <Box
            style={{
              overflow: "auto",
              flex: 1,
              padding: "16px",
            }}
          >
            <Flex direction="column" gap="3">
              {panels.map((panel) => {
                const colors = typeColors[panel.type];
                const isExpanded = expandedPanels.has(panel.id);

                return (
                  <Card
                    key={panel.id}
                    style={{
                      borderLeft: `4px solid ${colors.border}`,
                      background: colors.bg,
                      cursor: "pointer",
                    }}
                    onClick={() => togglePanel(panel.id)}
                  >
                    <Flex justify="between" align="center">
                      <Flex direction="column" gap="1" style={{ flex: 1 }}>
                        <Flex align="center" gap="2">
                          <Text size="1" weight="bold">
                            {panel.icon} {panel.title}
                          </Text>
                          <Badge color={panel.type as any} size="1" variant="soft">
                            {panel.type}
                          </Badge>
                        </Flex>
                        {isExpanded && (
                          <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                            {panel.content}
                          </Text>
                        )}
                      </Flex>
                      {!isExpanded && (
                        <ChevronDown size={14} color={colors.text} />
                      )}
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* Footer */}
        {isOpen && (
          <Box
            px="4"
            py="2"
            style={{
              borderTop: "1px solid var(--gray-6)",
              background: "var(--gray-a2)",
              fontSize: "12px",
              color: "var(--gray-9)",
            }}
          >
            <Text size="1">
              {panels.length} notification{panels.length !== 1 ? "s" : ""} • Click to expand
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
