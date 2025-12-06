// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from "react";
import {
  useSuiGraphQLClient,
  useGraphQLConnected,
} from "../contexts/GraphQLContext";
import {
  Epoch,
  TransactionBlockConnection,
  SuiObject,
  OwnerCoins,
  SuiAddress,
  TransactionBlockFilter,
} from "../types/graphql";

// ============================================================================
// Generic Query Hook
// ============================================================================

export interface UseGraphQLQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGraphQLQuery<T = any>(
  query: string,
  variables?: Record<string, any>,
  options?: {
    enabled?: boolean;
    skip?: boolean;
    showUsage?: boolean;
  },
): UseGraphQLQueryResult<T> {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(async () => {
    if (!client || !isConnected || options?.skip) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.query<T>(query, variables, {
        showUsage: options?.showUsage,
      });

      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }

      setData(response.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(false);
    }
  }, [
    client,
    isConnected,
    query,
    variables,
    options?.skip,
    options?.showUsage,
  ]);

  useEffect(() => {
    if (options?.enabled === false) return;
    executeQuery();
  }, [executeQuery, options?.enabled]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
  };
}

// ============================================================================
// Epoch Hooks
// ============================================================================

export function useEpoch(epochId?: number) {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<Epoch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getEpoch(epochId);
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      setData(response.data?.epoch || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch epoch");
    } finally {
      setLoading(false);
    }
  }, [client, isConnected, epochId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ============================================================================
// Transaction Hooks
// ============================================================================

export function useTransactionBlocks(
  filter?: TransactionBlockFilter,
  first: number = 10,
  options?: {
    skip?: boolean;
  },
) {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<TransactionBlockConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | undefined>();

  const refetch = useCallback(async () => {
    if (!client || !isConnected || options?.skip) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getTransactionBlocks(first, after, filter);
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      setData(response.data?.transactionBlocks || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions",
      );
    } finally {
      setLoading(false);
    }
  }, [client, isConnected, filter, first, after, options?.skip]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const nextPage = () => {
    if (data?.pageInfo.endCursor) {
      setAfter(data.pageInfo.endCursor);
    }
  };

  const previousPage = () => {
    if (data?.pageInfo.startCursor) {
      setAfter(undefined);
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
    nextPage,
    previousPage,
    hasNextPage: data?.pageInfo.hasNextPage || false,
  };
}

// ============================================================================
// Object Hooks
// ============================================================================

export function useObject(objectId: string) {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<SuiObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !isConnected || !objectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getObject(objectId);
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      setData(response.data?.object || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch object");
    } finally {
      setLoading(false);
    }
  }, [client, isConnected, objectId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ============================================================================
// Coin Balance Hooks
// ============================================================================

export function useCoinBalance(
  owner: SuiAddress,
  coinType: string = "0x2::sui::SUI",
) {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<OwnerCoins | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !isConnected || !owner) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getCoinBalance(owner, coinType);
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      setData(response.data?.owner || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch coin balance",
      );
    } finally {
      setLoading(false);
    }
  }, [client, isConnected, owner, coinType]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ============================================================================
// Owned Objects Hooks
// ============================================================================

export function useOwnedObjects(
  owner: SuiAddress,
  first: number = 50,
  options?: {
    skip?: boolean;
  },
) {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | undefined>();

  const refetch = useCallback(async () => {
    if (!client || !isConnected || !owner || options?.skip) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getOwnedObjects(owner, first, after);
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      setData(response.data?.owner || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch owned objects",
      );
    } finally {
      setLoading(false);
    }
  }, [client, isConnected, owner, first, after, options?.skip]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const nextPage = () => {
    if (data?.objects?.pageInfo?.endCursor) {
      setAfter(data.objects.pageInfo.endCursor);
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
    nextPage,
    hasNextPage: data?.objects?.pageInfo?.hasNextPage || false,
  };
}

// ============================================================================
// Service Config Hooks
// ============================================================================

export function useServiceConfig() {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getServiceConfig();
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      setData(response.data?.serviceConfig || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch service config",
      );
    } finally {
      setLoading(false);
    }
  }, [client, isConnected]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ============================================================================
// Data Retention Hooks
// ============================================================================

export function useDataRetention(
  queryType: string,
  field: string,
  filter?: string,
) {
  const client = useSuiGraphQLClient();
  const isConnected = useGraphQLConnected();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const response = await client.getDataRetention(queryType, field, filter);
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      setData(response.data?.serviceConfig?.retention || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch retention info",
      );
    } finally {
      setLoading(false);
    }
  }, [client, isConnected, queryType, field, filter]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
