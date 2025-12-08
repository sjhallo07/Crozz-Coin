import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useSuiGraphQLClient } from "../contexts/GraphQLContext";

export function GraphQLHealthPanel() {
  const client = useSuiGraphQLClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const checkHealth = async () => {
    setError(null);
    setResult(null);
    if (!client) {
      setError("GraphQL client not connected.");
      return;
    }
    setLoading(true);
    try {
      const resp = await client.getServiceConfig();
      if (resp.errors?.length) {
        setError(resp.errors.map((e) => e.message).join(", "));
      } else {
        setResult(resp.data);
      }
    } catch (e: any) {
      setError(e?.message || "Error desconocido al consultar serviceConfig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">GraphQL Health</Heading>
        <Text size="2" color="gray">Config y límites del servicio (JSON)</Text>
      </Flex>

      <Button onClick={checkHealth} disabled={loading}>
        {loading ? "Consultando..." : "Ver serviceConfig"}
      </Button>

      {error && (
        <Text size="2" color="red" style={{ marginTop: 8 }}>{error}</Text>
      )}

      {result && (
        <Card style={{ padding: 12, marginTop: 8, backgroundColor: "var(--gray-a2)" }}>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </Box>
  );
}
