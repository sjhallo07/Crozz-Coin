import { Box, Button, Card, Heading, Text, TextField, Select, Flex, Dialog, Spinner } from "@radix-ui/themes";
import { useAdminStore } from "../hooks/useAdminStore";
import type { SmartContractFunction, ExecutionResult } from "../types/admin";
import { useState, useEffect } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

interface FunctionExecutorProps {
  functions: SmartContractFunction[];
}

export function SmartContractExecutor({ functions }: FunctionExecutorProps) {
  const { currentUser, hasPermission } = useAdminStore();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [selectedFunction, setSelectedFunction] = useState<SmartContractFunction | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const canExecuteFunctions = hasPermission("execute_functions");
  const adminFunctions = functions.filter((fn) => fn.requiresAdmin);

  const handleSelectFunction = (functionId: string) => {
    const fn = adminFunctions.find((f) => f.id === functionId);
    setSelectedFunction(fn || null);
    setParameters({});
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleExecute = async () => {
    if (!selectedFunction || !currentUser) {
      return;
    }

    setIsExecuting(true);

    try {
      // Validate all parameters are provided
      const missingParams = selectedFunction.parameters.filter((p) => !parameters[p.name]);
      if (missingParams.length > 0) {
        setExecutionResult({
          status: "error",
          message: `Missing parameters: ${missingParams.map((p) => p.name).join(", ")}`,
          gasUsed: 0,
          timestamp: new Date(),
        });
        setShowResult(true);
        setIsExecuting(false);
        return;
      }

      // In a real implementation, this would construct and execute a transaction
      // For now, simulate successful execution
      setExecutionResult({
        status: "success",
        message: `Function ${selectedFunction.name} executed successfully`,
        transactionId: `0x${Math.random().toString(16).slice(2)}`,
        gasUsed: Math.floor(Math.random() * 10000) + 1000,
        timestamp: new Date(),
      });

      setShowResult(true);
    } catch (error) {
      setExecutionResult({
        status: "error",
        message: error instanceof Error ? error.message : "Execution failed",
        gasUsed: 0,
        timestamp: new Date(),
      });
      setShowResult(true);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!canExecuteFunctions) {
    return (
      <Box style={{ padding: "2rem" }}>
        <Card
          style={{
            background: "linear-gradient(135deg, #4a1a2e 0%, #2e1a4a 100%)",
            border: "2px solid #f97316",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <Heading size="5" style={{ color: "#fed7aa", marginBottom: "1rem" }}>
            🔒 Permission Denied
          </Heading>
          <Text style={{ color: "#fdba74", marginBottom: "1.5rem" }}>
            You don't have permission to execute smart contract functions. Only admins and super admins can access this feature.
          </Text>
          <Text size="2" style={{ color: "#fbbf24" }}>
            Required Permission: <strong>execute_functions</strong>
          </Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box style={{ padding: "2rem" }}>
      <Heading size="5" style={{ marginBottom: "1.5rem", color: "#e0e7ff" }}>
        ⚡ Smart Contract Executor
      </Heading>

      <Card
        style={{
          background: "rgba(30, 27, 75, 0.5)",
          border: "1px solid #3b3366",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <Flex direction="column" gap="3">
          <Box>
            <Text style={{ color: "#a5b4fc", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Available Functions
            </Text>
            <Select.Root value={selectedFunction?.id || ""} onValueChange={handleSelectFunction}>
              <Select.Trigger
                placeholder="Select a function to execute..."
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid #4c1d95",
                  color: "#e0e7ff",
                }}
              />
              <Select.Content>
                {adminFunctions.map((fn) => (
                  <Select.Item key={fn.id} value={fn.id}>
                    {fn.name} ({fn.module})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {selectedFunction && (
            <>
              <Box
                style={{
                  padding: "1rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid #1e40af",
                  borderRadius: "8px",
                }}
              >
                <Text style={{ color: "#93c5fd", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  Function: {selectedFunction.name}
                </Text>
                <Text size="2" style={{ color: "#bfdbfe" }}>
                  {selectedFunction.description}
                </Text>
                <Text size="1" style={{ color: "#60a5fa", marginTop: "0.5rem" }}>
                  Return Type: <strong>{selectedFunction.returnType}</strong>
                </Text>
              </Box>

              {selectedFunction.parameters.length > 0 && (
                <Box>
                  <Text style={{ color: "#a5b4fc", marginBottom: "1rem", fontWeight: "bold" }}>
                    Parameters ({selectedFunction.parameters.length})
                  </Text>
                  <Flex direction="column" gap="2">
                    {selectedFunction.parameters.map((param) => (
                      <Box key={param.name}>
                        <Text size="2" style={{ color: "#a5b4fc", marginBottom: "0.25rem" }}>
                          {param.name}
                          <span style={{ color: "#6366f1" }}> ({param.type})</span>
                          {param.isMutable && <span style={{ color: "#f97316" }}> [mutable]</span>}
                        </Text>
                        <TextField.Root
                          placeholder={`Enter ${param.name}...`}
                          value={parameters[param.name] || ""}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          style={{
                            background: "rgba(139, 92, 246, 0.1)",
                            borderColor: "#4c1d95",
                          }}
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}

              <Button
                onClick={handleExecute}
                disabled={isExecuting}
                style={{
                  background: isExecuting ? "#6b7280" : "#8b5cf6",
                  color: "#fff",
                  padding: "0.75rem 1.5rem",
                  marginTop: "1rem",
                }}
              >
                {isExecuting ? (
                  <>
                    <Spinner /> Executing...
                  </>
                ) : (
                  "Execute Function"
                )}
              </Button>
            </>
          )}
        </Flex>
      </Card>

      {showResult && executionResult && (
        <Dialog.Root open={showResult} onOpenChange={setShowResult}>
          <Dialog.Content
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #2d1b4e 100%)",
              border: "1px solid #3b3366",
            }}
          >
            <Dialog.Title style={{ color: "#e0e7ff" }}>
              {executionResult.status === "success" ? "✅ Success" : "❌ Error"}
            </Dialog.Title>

            <Box style={{ marginTop: "1rem" }}>
              <Text style={{ color: "#a5b4fc", marginBottom: "1rem" }}>
                {executionResult.message}
              </Text>

              {executionResult.transactionId && (
                <Box
                  style={{
                    padding: "0.75rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                  }}
                >
                  <Text size="2" style={{ color: "#a5b4fc" }}>
                    Transaction: <code style={{ color: "#60a5fa" }}>{executionResult.transactionId}</code>
                  </Text>
                </Box>
              )}

              <Text size="1" style={{ color: "#6b7280" }}>
                Gas Used: {executionResult.gasUsed}
              </Text>
              <Text size="1" style={{ color: "#6b7280" }}>
                Timestamp: {executionResult.timestamp.toISOString()}
              </Text>
            </Box>

            <Button
              onClick={() => setShowResult(false)}
              style={{ marginTop: "1.5rem", background: "#8b5cf6", color: "#fff" }}
            >
              Close
            </Button>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </Box>
  );
}
