// Recommendations Panel Component
import { Box, Flex, Text, Badge, Card } from "@radix-ui/themes";
import { AlertCircle, CheckCircle, Info, Zap, TrendingUp } from "lucide-react";

interface Recommendation {
  type: "info" | "warning" | "success" | "tip";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  compact?: boolean;
}

const iconMap = {
  info: <Info size={18} />,
  warning: <AlertCircle size={18} />,
  success: <CheckCircle size={18} />,
  tip: <Zap size={18} />,
};

const colorMap = {
  info: "blue" as const,
  warning: "orange" as const,
  success: "green" as const,
  tip: "purple" as const,
};

const badgeColorMap = {
  info: "blue" as const,
  warning: "orange" as const,
  success: "green" as const,
  tip: "purple" as const,
};

export function RecommendationsPanel({
  recommendations,
  compact = false,
}: RecommendationsPanelProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {recommendations.map((rec, idx) => (
        <Card key={idx} style={{ borderLeft: `4px solid var(--${colorMap[rec.type]}-a7)` }}>
          <Flex gap="3" direction={compact ? "row" : "column"}>
            <Flex gap="2" align="start" style={{ flex: 1 }}>
              <Box style={{ color: `var(--${colorMap[rec.type]}-11)`, paddingTop: "2px" }}>
                {iconMap[rec.type]}
              </Box>
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                <Flex gap="2" align="center">
                  <Text weight="bold" size="2">
                    {rec.title}
                  </Text>
                  <Badge color={badgeColorMap[rec.type]} size="1" variant="soft">
                    {rec.type}
                  </Badge>
                </Flex>
                <Text size="1" color="gray">
                  {rec.description}
                </Text>
              </Flex>
            </Flex>
            {rec.action && (
              <Flex>
                <button
                  onClick={rec.action.onClick}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: `1px solid var(--${colorMap[rec.type]}-7)`,
                    background: `var(--${colorMap[rec.type]}-a2)`,
                    color: `var(--${colorMap[rec.type]}-11)`,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {rec.action.label}
                </button>
              </Flex>
            )}
          </Flex>
        </Card>
      ))}
    </Box>
  );
}
