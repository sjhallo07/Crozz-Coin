// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import SuiGrpcClient from "../services/grpcClient";
import { getGrpcConfig } from "../config/grpcConfig";

interface GrpcContextType {
  client: SuiGrpcClient | null;
  isConnected: boolean;
  currentEndpoint: string;
  environment: "mainnet" | "testnet" | "devnet";
  error: string | null;
  connectToEndpoint: (
    endpoint: string,
    environment?: "mainnet" | "testnet" | "devnet",
  ) => Promise<void>;
  disconnect: () => void;
  switchEnvironment: (env: "mainnet" | "testnet" | "devnet") => Promise<void>;
}

const GrpcContext = createContext<GrpcContextType | undefined>(undefined);

export interface GrpcProviderProps {
  children: ReactNode;
  defaultEnvironment?: "mainnet" | "testnet" | "devnet";
  autoConnect?: boolean;
}

export function GrpcProvider({
  children,
  defaultEnvironment = "devnet",
  autoConnect = true,
}: GrpcProviderProps) {
  const [client, setClient] = useState<SuiGrpcClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState("");
  const [environment, setEnvironment] = useState<
    "mainnet" | "testnet" | "devnet"
  >(defaultEnvironment);
  const [error, setError] = useState<string | null>(null);

  const connectToEndpoint = useCallback(
    async (
      endpoint: string,
      env: "mainnet" | "testnet" | "devnet" = defaultEnvironment,
    ) => {
      try {
        setError(null);

        // Validar que el endpoint sea válido
        if (!endpoint || endpoint.trim().length === 0) {
          throw new Error("Endpoint no puede estar vacío");
        }

        const newClient = new SuiGrpcClient(endpoint);

        // Intentar una conexión de prueba
        try {
          await newClient.getServiceInfo();
        } catch (e) {
          console.warn(
            "Advertencia: No se pudo conectar a la información del servicio, pero el cliente se creó",
          );
        }

        setClient(newClient);
        setCurrentEndpoint(endpoint);
        setEnvironment(env);
        setIsConnected(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error de conexión desconocido";
        setError(errorMessage);
        setIsConnected(false);
        setClient(null);
        console.error("Error conectando a gRPC:", err);
      }
    },
    [defaultEnvironment],
  );

  const disconnect = useCallback(() => {
    setClient(null);
    setIsConnected(false);
    setCurrentEndpoint("");
    setError(null);
  }, []);

  const switchEnvironment = useCallback(
    async (env: "mainnet" | "testnet" | "devnet") => {
      const config = getGrpcConfig(env);
      const endpoint = `https://${config.endpoint}:${config.port}`;
      await connectToEndpoint(endpoint, env);
    },
    [connectToEndpoint],
  );

  // Auto-conectar al montar
  React.useEffect(() => {
    if (autoConnect && !isConnected) {
      switchEnvironment(defaultEnvironment);
    }
  }, [autoConnect, isConnected, defaultEnvironment, switchEnvironment]);

  const value: GrpcContextType = {
    client,
    isConnected,
    currentEndpoint,
    environment,
    error,
    connectToEndpoint,
    disconnect,
    switchEnvironment,
  };

  return <GrpcContext.Provider value={value}>{children}</GrpcContext.Provider>;
}

/**
 * Hook para usar el contexto gRPC
 */
export function useGrpcContext(): GrpcContextType {
  const context = useContext(GrpcContext);
  if (!context) {
    throw new Error("useGrpcContext debe usarse dentro de un GrpcProvider");
  }
  return context;
}

/**
 * Hook para obtener solo el cliente gRPC
 */
export function useSuiGrpcClient(): SuiGrpcClient {
  const { client } = useGrpcContext();
  if (!client) {
    throw new Error("Cliente gRPC no está conectado");
  }
  return client;
}

/**
 * Hook para verificar si está conectado
 */
export function useGrpcConnected(): boolean {
  const { isConnected } = useGrpcContext();
  return isConnected;
}

/**
 * Hook para cambiar ambiente
 */
export function useGrpcEnvironment() {
  const { environment, switchEnvironment, currentEndpoint } = useGrpcContext();
  return {
    environment,
    switchEnvironment,
    currentEndpoint,
  };
}
