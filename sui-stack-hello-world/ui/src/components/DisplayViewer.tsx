import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Callout,
  Heading,
  Text,
  TextField,
  Separator,
  Code,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useSuiGraphQLClient } from "../contexts/GraphQLContext";

/**
 * Component to query and display object metadata with Display rendering.
 * Demonstrates how fullnodes render Display templates when showDisplay option is enabled.
 * 
 * For GraphQL: Objects automatically include display field when Display<T> exists
 * For JSON-RPC: Use showDisplay option in sui_getObject
 */
export function DisplayViewer() {
  const client = useSuiGraphQLClient();
  const [objectId, setObjectId] = useState("");
  const [objectData, setObjectData] = useState<any>(null);
  const [displayData, setDisplayData] = useState<Record<string, string> | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isQuerying, setIsQuerying] = useState(false);

  const handleQueryObject = async () => {
    if (!objectId.trim()) {
      setStatus("❌ Object ID required");
      return;
    }

    if (!client) {
      setStatus("❌ GraphQL client not available");
      return;
    }

    setIsQuerying(true);
    setStatus("🔄 Querying object...");
    setObjectData(null);
    setDisplayData(null);

    try {
      // GraphQL query to get object with display
      const query = `
        query GetObjectWithDisplay($objectId: SuiAddress!) {
          object(address: $objectId) {
            address
            version
            digest
            asMoveObject {
              contents {
                type {
                  repr
                }
              }
            }
            display {
              key
              value
              error
            }
          }
        }
      `;

      const response = await client.query(query, { objectId });

      if (response.errors) {
        setStatus(`❌ Query errors: ${response.errors.map((e: any) => e.message).join(", ")}`);
        return;
      }

      if (!response.data?.object) {
        setStatus("❌ Object not found");
        return;
      }

      const obj = response.data.object;
      setObjectData(obj);

      // Extract display data
      if (obj.display && obj.display.length > 0) {
        const displayMap: Record<string, string> = {};
        for (const item of obj.display) {
          if (item.error) {
            displayMap[item.key] = `ERROR: ${item.error}`;
          } else {
            displayMap[item.key] = item.value;
          }
        }
        setDisplayData(displayMap);
        setStatus("✅ Object queried with Display metadata");
      } else {
        setStatus("✅ Object queried (no Display template found)");
      }
    } catch (error: any) {
      console.error("Query error:", error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <Card>
      <Heading size="5" mb="3">Display Viewer</Heading>
      <Text size="2" color="gray" mb="4">
        Query an object to see its rendered Display metadata. If the object's type has a Display template,
        fullnodes will automatically render the fields.
      </Text>

      <Separator my="3" size="4" />

      <Box mb="3">
        <Text size="2" weight="bold" mb="1" style={{ display: "block" }}>
          Object ID
        </Text>
        <TextField.Root
          placeholder="0x..."
          value={objectId}
          onChange={(e) => setObjectId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQueryObject();
          }}
        />
      </Box>

      <Button
        onClick={handleQueryObject}
        disabled={isQuerying}
        style={{ width: "100%" }}
      >
        {isQuerying ? "Querying..." : "Query Object"}
      </Button>

      {status && (
        <Callout.Root mt="3" color={status.startsWith("✅") ? "green" : status.startsWith("🔄") ? "blue" : "red"}>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{status}</Callout.Text>
        </Callout.Root>
      )}

      {objectData && (
        <>
          <Separator my="3" size="4" />
          
          <Heading size="4" mb="2">Object Info</Heading>
          <Box mb="3" style={{ background: "var(--gray-a2)", padding: "12px", borderRadius: "6px" }}>
            <Text size="1" as="div" mb="1">
              <strong>Address:</strong> <Code>{objectData.address}</Code>
            </Text>
            <Text size="1" as="div" mb="1">
              <strong>Version:</strong> {objectData.version}
            </Text>
            <Text size="1" as="div" mb="1">
              <strong>Digest:</strong> <Code style={{ fontSize: "10px" }}>{objectData.digest}</Code>
            </Text>
            {objectData.asMoveObject?.contents?.type?.repr && (
              <Text size="1" as="div">
                <strong>Type:</strong> <Code style={{ fontSize: "10px" }}>{objectData.asMoveObject.contents.type.repr}</Code>
              </Text>
            )}
          </Box>
        </>
      )}

      {displayData && (
        <>
          <Heading size="4" mb="2">Display Metadata</Heading>
          <Box style={{ background: "var(--blue-a2)", padding: "12px", borderRadius: "6px", border: "1px solid var(--blue-a5)" }}>
            {Object.entries(displayData).map(([key, value]) => (
              <Box key={key} mb="2">
                <Text size="2" weight="bold" style={{ display: "block" }}>
                  {key}:
                </Text>
                <Text size="2" style={{ display: "block", wordBreak: "break-all" }}>
                  {value.startsWith("ERROR:") ? (
                    <span style={{ color: "var(--red-9)" }}>{value}</span>
                  ) : value.startsWith("http") ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-11)" }}>
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </Text>
              </Box>
            ))}
          </Box>

          <Separator my="3" size="4" />

          <Callout.Root color="green">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text size="2">
                <strong>Display fields rendered successfully!</strong> This is the metadata that wallets,
                explorers, and dApps see when querying this object. The template automatically substitutes
                object properties into the field values.
              </Text>
            </Callout.Text>
          </Callout.Root>
        </>
      )}

      {objectData && !displayData && (
        <>
          <Separator my="3" size="4" />
          <Callout.Root color="amber">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text size="2">
                No Display template found for this object's type. To add display metadata, create a Display&lt;T&gt;
                object using the CreateDisplayPanel component.
              </Text>
            </Callout.Text>
          </Callout.Root>
        </>
      )}

      <Separator my="3" size="4" />

      <Box>
        <Text size="2" weight="bold" mb="2" style={{ display: "block" }}>
          Common Display Fields
        </Text>
        <Box asChild>
          <div style={{ margin: 0, paddingInlineStart: "18px" }}>
            <div><Text size="1"><Code>name</Code>: Object name</Text></div>
            <div><Text size="1"><Code>description</Code>: Object description</Text></div>
            <div><Text size="1"><Code>image_url</Code>: Main image URL</Text></div>
            <div><Text size="1"><Code>thumbnail_url</Code>: Thumbnail for previews</Text></div>
            <div><Text size="1"><Code>link</Code>: Application link</Text></div>
            <div><Text size="1"><Code>project_url</Code>: Project website</Text></div>
            <div><Text size="1"><Code>creator</Code>: Creator info</Text></div>
          </div>
        </Box>
      </Box>
    </Card>
  );
}
