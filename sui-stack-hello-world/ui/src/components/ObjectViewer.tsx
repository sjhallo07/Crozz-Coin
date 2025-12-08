import { Box, Button, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { useSuiGraphQLClient } from "../contexts/GraphQLContext";

export function ObjectViewer() {
  const client = useSuiGraphQLClient();
  const [objectId, setObjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const fetchObject = async () => {
    setError(null);
    setResult(null);
    if (!client) {
      setError("GraphQL client not connected.");
      return;
    }
    if (!isValidSuiObjectId(objectId)) {
      setError("Object ID inválido (debe ser 0x...).");
      return;
    }
    setLoading(true);
    try {
      const resp = await client.getObject(objectId);
      if (resp.errors?.length) {
        setError(resp.errors.map((e) => e.message).join(", "));
      } else {
        setResult(resp.data);
      }
    } catch (e: any) {
      setError(e?.message || "Error desconocido al consultar el objeto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt="6" p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">Object Viewer (GraphQL)</Heading>
        <Text size="2" color="gray">Visualiza objetos por ID desde GraphQL</Text>
      </Flex>

      <Flex gap="3" align="center" mb="3">
        <TextField.Root
          placeholder="0x... Object ID"
          value={objectId}
          onChange={(e) => setObjectId(e.target.value.trim())}
        />
        <Button onClick={fetchObject} disabled={loading}>
          {loading ? "Consultando..." : "Consultar"}
        </Button>
      </Flex>

      {error && (
        <Text size="2" color="red" style={{ marginBottom: 8 }}>{error}</Text>
      )}

      {result && (
        <Card style={{ padding: 12, backgroundColor: "var(--gray-a2)" }}>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </Box>
  );
}
