// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Switch,
  Tabs,
} from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Settings, Save, RotateCcw } from "lucide-react";
import { useNetworkVariable } from "../networkConfig";

interface ConfigSettings {
  maxTextLength: number;
  enableEventTracking: boolean;
  enableOwnershipTransfer: boolean;
  enablePublicUpdates: boolean;
  maxUpdateCount: number;
}

const DEFAULT_CONFIG: ConfigSettings = {
  maxTextLength: 280,
  enableEventTracking: true,
  enableOwnershipTransfer: true,
  enablePublicUpdates: true,
  maxUpdateCount: 1000,
};

export function ConfigManager() {
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
  const [config, setConfig] = useState<ConfigSettings>(DEFAULT_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<ConfigSettings>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("greeting_config");
    if (stored) {
      const parsedConfig = JSON.parse(stored);
      setConfig(parsedConfig);
      setOriginalConfig(parsedConfig);
    }
  }, []);

  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasChanges(changed);
  }, [config, originalConfig]);

  const handleSave = () => {
    localStorage.setItem("greeting_config", JSON.stringify(config));
    setOriginalConfig(config);
    setSaveMessage("✓ Configuration saved successfully!");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleReset = () => {
    setConfig(originalConfig);
  };

  const handleResetToDefaults = () => {
    if (confirm("Reset to default configuration?")) {
      setConfig(DEFAULT_CONFIG);
      handleSave();
    }
  };

  return (
    <Box>
      <Flex direction="column" gap="4">
        {/* Status Message */}
        {saveMessage && (
          <Card
            style={{
              backgroundColor: "var(--green-a2)",
              borderLeft: "4px solid var(--green-9)",
            }}
          >
            <Text size="2" color="green">
              {saveMessage}
            </Text>
          </Card>
        )}

        {/* Main Configuration */}
        <Card>
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="4">Smart Contract Configuration</Heading>
                <Text color="gray" size="2">
                  Manage settings for the greeting module
                </Text>
              </Box>
              <Flex gap="2">
                <Button
                  variant="soft"
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  <RotateCcw size={16} />
                  Discard
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges}>
                  <Save size={16} />
                  Save Changes
                </Button>
              </Flex>
            </Flex>

            {/* Text Length Limit */}
            <Box style={{ padding: "16px", backgroundColor: "var(--gray-a2)", borderRadius: "8px" }}>
              <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                  <Heading size="3">Maximum Text Length</Heading>
                  <Text weight="bold">{config.maxTextLength} chars</Text>
                </Flex>
                <Text size="2" color="gray">
                  Maximum characters allowed in a greeting (prevents spam)
                </Text>
                <TextField.Root
                  type="number"
                  value={config.maxTextLength.toString()}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxTextLength: Math.max(10, parseInt(e.target.value) || 10),
                    }))
                  }
                  min="10"
                  max="10000"
                />
              </Flex>
            </Box>

            {/* Event Tracking */}
            <Box style={{ padding: "16px", backgroundColor: "var(--gray-a2)", borderRadius: "8px" }}>
              <Flex justify="between" align="center">
                <Box>
                  <Heading size="3">Event Tracking</Heading>
                  <Text size="2" color="gray">
                    Emit events for all transactions (audit trail)
                  </Text>
                </Box>
                <Switch
                  checked={config.enableEventTracking}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableEventTracking: checked,
                    }))
                  }
                />
              </Flex>
            </Box>

            {/* Ownership Transfer */}
            <Box style={{ padding: "16px", backgroundColor: "var(--gray-a2)", borderRadius: "8px" }}>
              <Flex justify="between" align="center">
                <Box>
                  <Heading size="3">Ownership Transfer</Heading>
                  <Text size="2" color="gray">
                    Allow users to transfer ownership of greetings
                  </Text>
                </Box>
                <Switch
                  checked={config.enableOwnershipTransfer}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableOwnershipTransfer: checked,
                    }))
                  }
                />
              </Flex>
            </Box>

            {/* Public Updates */}
            <Box style={{ padding: "16px", backgroundColor: "var(--gray-a2)", borderRadius: "8px" }}>
              <Flex justify="between" align="center">
                <Box>
                  <Heading size="3">Public Updates</Heading>
                  <Text size="2" color="gray">
                    Allow anyone to update any greeting
                  </Text>
                </Box>
                <Switch
                  checked={config.enablePublicUpdates}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      enablePublicUpdates: checked,
                    }))
                  }
                />
              </Flex>
            </Box>

            {/* Update Count Limit */}
            <Box style={{ padding: "16px", backgroundColor: "var(--gray-a2)", borderRadius: "8px" }}>
              <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                  <Heading size="3">Max Update Count</Heading>
                  <Text weight="bold">{config.maxUpdateCount}</Text>
                </Flex>
                <Text size="2" color="gray">
                  Maximum times a greeting can be updated
                </Text>
                <TextField.Root
                  type="number"
                  value={config.maxUpdateCount.toString()}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxUpdateCount: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  min="1"
                  max="10000"
                />
              </Flex>
            </Box>
          </Flex>
        </Card>

        {/* Configuration Reference */}
        <Card style={{ backgroundColor: "var(--blue-a1)" }}>
          <Flex direction="column" gap="2">
            <Heading size="4" color="blue">
              Configuration Details
            </Heading>
            <Text size="2">
              These settings control the behavior of the greeting smart contract. Changes are stored locally and can be synchronized with the on-chain contract.
            </Text>
            <Box as="ul" style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <Text as="li" size="2">
                <strong>Package ID:</strong> {helloWorldPackageId?.slice(0, 12)}...
              </Text>
              <Text as="li" size="2">
                Storage: LocalStorage
              </Text>
              <Text as="li" size="2">
                Last Modified: {new Date().toLocaleString()}
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">Advanced Settings</Heading>
            <Button variant="soft" color="red" onClick={handleResetToDefaults}>
              Reset to Default Configuration
            </Button>
            <Text size="2" color="gray">
              This will restore all settings to their default values.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}
