// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  OAuthProvider,
  ZKLOGIN_PROVIDERS,
  ZkLoginSession,
} from "../services/zkloginProvider";
import ZkLoginClient from "../services/zkloginClient";

interface ZkLoginAuthProps {
  provider: OAuthProvider;
  clientId: string;
  redirectUri: string;
  saltServiceUrl: string;
  provingServiceUrl: string;
  network?: "devnet" | "testnet" | "mainnet";
  onAuthSuccess?: (address: string, session: ZkLoginSession) => void;
  onAuthError?: (error: Error) => void;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  address?: string;
  session?: ZkLoginSession;
  error?: Error;
  step:
    | "initial"
    | "authenticating"
    | "generating-proof"
    | "complete"
    | "error";
}

/**
 * zkLogin Authentication Component
 */
export const ZkLoginAuth: React.FC<ZkLoginAuthProps> = ({
  provider,
  clientId,
  redirectUri,
  saltServiceUrl,
  provingServiceUrl,
  network = "testnet",
  onAuthSuccess,
  onAuthError,
}) => {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isAuthenticated: false,
    step: "initial",
  });

  const [client, setClient] = useState<ZkLoginClient | null>(null);

  // Initialize zkLogin client
  useEffect(() => {
    try {
      const zkLoginClient = new ZkLoginClient(
        provider,
        clientId,
        redirectUri,
        network,
      );
      setClient(zkLoginClient);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step: "error",
        error:
          error instanceof Error
            ? error
            : new Error("Failed to initialize zkLogin"),
      }));
    }
  }, [provider, clientId, redirectUri, network]);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const callbackUrl = window.location.href;
      if (!callbackUrl.includes("id_token")) {
        return;
      }

      if (!client) return;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        step: "generating-proof",
      }));

      try {
        const { address, session } = await client.authenticate(
          callbackUrl,
          saltServiceUrl,
          provingServiceUrl,
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          address,
          session,
          step: "complete",
        }));

        onAuthSuccess?.(address, session);

        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Authentication failed");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          step: "error",
          error: err,
        }));
        onAuthError?.(err);
      }
    };

    handleCallback();
  }, [client, saltServiceUrl, provingServiceUrl, onAuthSuccess, onAuthError]);

  const handleLogin = useCallback(() => {
    if (!client) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      step: "authenticating",
    }));

    try {
      const authUrl = client.generateAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to generate authorization URL");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        step: "error",
        error: err,
      }));
      onAuthError?.(err);
    }
  }, [client, onAuthError]);

  const handleLogout = useCallback(() => {
    setState({
      isLoading: false,
      isAuthenticated: false,
      step: "initial",
    });
  }, []);

  // Provider display name
  const providerName = provider
    .replace("https://", "")
    .split(".")[0]
    .toUpperCase();
  const providerConfig = ZKLOGIN_PROVIDERS[provider];

  return (
    <Box style={{ width: "100%", maxWidth: "500px" }}>
      {state.step === "initial" && !state.isAuthenticated && (
        <Card style={{ padding: "24px", textAlign: "center" }}>
          <Heading size="5" mb="3">
            zkLogin Authentication
          </Heading>
          <Text size="2" color="gray" mb="6">
            Sign in with your {providerName} account using zero-knowledge proofs
          </Text>

          <Button
            onClick={handleLogin}
            disabled={state.isLoading}
            size="3"
            style={{ width: "100%", marginBottom: "12px" }}
          >
            {state.isLoading ? "Connecting..." : `Sign in with ${providerName}`}
          </Button>

          <Box
            style={{
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            <Text size="1" color="gray">
              <strong>Network:</strong>{" "}
              {providerConfig.supportedNetworks?.join(", ") || "N/A"}
            </Text>
          </Box>
        </Card>
      )}

      {state.step === "authenticating" && (
        <Card style={{ padding: "24px", textAlign: "center" }}>
          <Heading size="5" mb="3">
            Redirecting to {providerName}...
          </Heading>
          <Text size="2" color="gray">
            You will be redirected to complete authentication
          </Text>
        </Card>
      )}

      {state.step === "generating-proof" && (
        <Card style={{ padding: "24px", textAlign: "center" }}>
          <Heading size="5" mb="3">
            Generating Zero-Knowledge Proof
          </Heading>
          <Text size="2" color="gray" mb="6">
            Creating your zkLogin address and ZK proof...
          </Text>
          <Box style={{ animation: "spin 1s linear infinite" }}>⚙️</Box>
        </Card>
      )}

      {state.step === "complete" && state.isAuthenticated && state.address && (
        <Card style={{ padding: "24px" }}>
          <Heading size="5" mb="3">
            ✓ Authentication Successful
          </Heading>

          <Box
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#e8f5e9",
              borderRadius: "8px",
            }}
          >
            <Text size="1" weight="bold" color="green">
              zkLogin Address
            </Text>
            <Text
              size="1"
              style={{
                fontFamily: "monospace",
                wordBreak: "break-all",
                marginTop: "8px",
              }}
            >
              {state.address}
            </Text>
          </Box>

          {state.session && (
            <Box
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <Text size="1" weight="bold">
                Session Details
              </Text>
              <Text size="1" color="gray">
                Provider: {state.session.provider}
              </Text>
              <Text size="1" color="gray">
                Expires: {new Date(state.session.expiresAt).toLocaleString()}
              </Text>
            </Box>
          )}

          <Flex gap="3">
            <Button
              onClick={handleLogout}
              color="gray"
              variant="outline"
              style={{ flex: 1 }}
            >
              Logout
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(state.address || "");
              }}
              style={{ flex: 1 }}
            >
              Copy Address
            </Button>
          </Flex>
        </Card>
      )}

      {state.step === "error" && state.error && (
        <Card
          style={{
            padding: "24px",
            borderColor: "#ff6b6b",
            borderWidth: "2px",
          }}
        >
          <Heading size="5" mb="3" color="red">
            ✗ Authentication Error
          </Heading>
          <Text size="2" color="gray" mb="6">
            {state.error.message}
          </Text>
          <Button
            onClick={handleLogout}
            color="gray"
            variant="outline"
            style={{ width: "100%" }}
          >
            Try Again
          </Button>
        </Card>
      )}
    </Box>
  );
};

/**
 * zkLogin Session Manager Component
 */
interface ZkLoginSessionManagerProps {
  client: ZkLoginClient;
  sessionId: string;
  onSessionExpired?: () => void;
}

export const ZkLoginSessionManager: React.FC<ZkLoginSessionManagerProps> = ({
  client,
  sessionId,
  onSessionExpired,
}) => {
  const [session, setSession] = useState<ZkLoginSession | undefined>();
  const [isValid, setIsValid] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Poll session validity
  useEffect(() => {
    const interval = setInterval(() => {
      const valid = client.isSessionValid(sessionId);
      setIsValid(valid);

      if (!valid && onSessionExpired) {
        onSessionExpired();
      }

      const currentSession = client.getSession(sessionId);
      setSession(currentSession);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [client, sessionId, onSessionExpired]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  if (!session || !isValid) {
    return <Text color="red">Session expired or invalid</Text>;
  }

  const timeRemaining = session.expiresAt - now;
  const minutesRemaining = Math.floor(timeRemaining / 60000);

  return (
    <Box
      style={{
        padding: "12px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <Flex justify="between" align="center">
        <Text size="1">
          <strong>zkLogin Session Active</strong> ({minutesRemaining} min
          remaining)
        </Text>
        <Button
          size="1"
          onClick={async () => {
            try {
              await client.refreshSession(sessionId);
              const updated = client.getSession(sessionId);
              setSession(updated);
            } catch (error) {
              console.error("Failed to refresh session", error);
            }
          }}
        >
          Refresh
        </Button>
      </Flex>
    </Box>
  );
};

export default ZkLoginAuth;
