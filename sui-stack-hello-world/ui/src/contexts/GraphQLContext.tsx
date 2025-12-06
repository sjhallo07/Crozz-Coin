/**
 * GraphQL Context Provider for Sui
 * Global state management for GraphQL client and operations
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import SuiGraphQLClient from '../services/graphqlClient';

export interface GraphQLContextType {
  client: SuiGraphQLClient | null;
  isConnected: boolean;
  currentEndpoint: string;
  environment: 'devnet' | 'testnet' | 'mainnet';
  error: string | null;
  connectToEndpoint: (endpoint: string) => Promise<void>;
  switchEnvironment: (env: 'devnet' | 'testnet' | 'mainnet') => Promise<void>;
  disconnect: () => void;
  resetError: () => void;
}

export const GraphQLContext = createContext<GraphQLContextType | undefined>(
  undefined
);

interface GraphQLProviderProps {
  children: React.ReactNode;
  defaultEnvironment?: 'devnet' | 'testnet' | 'mainnet';
  autoConnect?: boolean;
}

/**
 * GraphQL Provider Component
 * Provides global GraphQL client and state management
 */
export function GraphQLProvider({
  children,
  defaultEnvironment = 'testnet',
  autoConnect = true,
}: GraphQLProviderProps) {
  const [client, setClient] = useState<SuiGraphQLClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState('');
  const [environment, setEnvironment] =
    useState<'devnet' | 'testnet' | 'mainnet'>(defaultEnvironment);
  const [error, setError] = useState<string | null>(null);

  // Initialize client on mount
  useEffect(() => {
    if (autoConnect) {
      connectToEnvironment(defaultEnvironment);
    }
  }, []);

  /**
   * Connect to a specific environment
   */
  const connectToEnvironment = useCallback(
    async (env: 'devnet' | 'testnet' | 'mainnet') => {
      try {
        setError(null);
        const newClient = new SuiGraphQLClient(env);
        setClient(newClient);
        setCurrentEndpoint(newClient.getEndpoint());
        setEnvironment(env);
        setIsConnected(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to connect to GraphQL';
        setError(errorMessage);
        setIsConnected(false);
      }
    },
    []
  );

  /**
   * Connect to custom endpoint
   */
  const connectToEndpoint = useCallback(async (endpoint: string) => {
    try {
      setError(null);

      // Validate endpoint
      if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        throw new Error('Invalid endpoint: must start with http:// or https://');
      }

      const newClient = new SuiGraphQLClient('testnet');
      newClient.setEndpoint(endpoint);

      setClient(newClient);
      setCurrentEndpoint(endpoint);
      setIsConnected(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect to endpoint';
      setError(errorMessage);
      setIsConnected(false);
    }
  }, []);

  /**
   * Switch environment
   */
  const switchEnvironment = useCallback(
    async (env: 'devnet' | 'testnet' | 'mainnet') => {
      await connectToEnvironment(env);
    },
    [connectToEnvironment]
  );

  /**
   * Disconnect
   */
  const disconnect = useCallback(() => {
    setClient(null);
    setIsConnected(false);
    setCurrentEndpoint('');
    setError(null);
  }, []);

  /**
   * Reset error
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const value: GraphQLContextType = {
    client,
    isConnected,
    currentEndpoint,
    environment,
    error,
    connectToEndpoint,
    switchEnvironment,
    disconnect,
    resetError,
  };

  return (
    <GraphQLContext.Provider value={value}>{children}</GraphQLContext.Provider>
  );
}

/**
 * Hook to use GraphQL context
 */
export function useGraphQLContext(): GraphQLContextType {
  const context = React.useContext(GraphQLContext);
  if (context === undefined) {
    throw new Error(
      'useGraphQLContext must be used within a GraphQLProvider'
    );
  }
  return context;
}

/**
 * Hook to get GraphQL client
 */
export function useSuiGraphQLClient() {
  const { client, isConnected } = useGraphQLContext();

  if (!isConnected || !client) {
    return null;
  }

  return client;
}

/**
 * Hook to check if connected to GraphQL
 */
export function useGraphQLConnected() {
  const { isConnected } = useGraphQLContext();
  return isConnected;
}

/**
 * Hook to get/switch environment
 */
export function useGraphQLEnvironment() {
  const { environment, switchEnvironment } = useGraphQLContext();
  return { environment, switchEnvironment };
}
