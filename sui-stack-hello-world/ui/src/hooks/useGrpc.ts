// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useEffect } from "react";
import { useSuiGrpcClient, useGrpcConnected } from "../contexts/GrpcContext";

// Hook para obtener información de checkpoints
export function useCheckpoint(sequenceNumber?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [checkpoint, setCheckpoint] = useState<Record<string, unknown> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckpoint = useCallback(async () => {
    if (!sequenceNumber || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.getCheckpoint(sequenceNumber);
      setCheckpoint(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error fetching checkpoint",
      );
    } finally {
      setLoading(false);
    }
  }, [sequenceNumber, isConnected, client]);

  useEffect(() => {
    fetchCheckpoint();
  }, [fetchCheckpoint]);

  return { checkpoint, loading, error, refetch: fetchCheckpoint };
}

// Hook para obtener una transacción
export function useTransaction(digest?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [transaction, setTransaction] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!digest || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.getTransaction(digest);
      setTransaction(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error fetching transaction",
      );
    } finally {
      setLoading(false);
    }
  }, [digest, isConnected, client]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return { transaction, loading, error, refetch: fetchTransaction };
}

// Hook para obtener un objeto
export function useObject(objectId?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [object, setObject] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObject = useCallback(async () => {
    if (!objectId || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.getObject(objectId);
      setObject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching object");
    } finally {
      setLoading(false);
    }
  }, [objectId, isConnected, client]);

  useEffect(() => {
    fetchObject();
  }, [fetchObject]);

  return { object, loading, error, refetch: fetchObject };
}

// Hook para obtener balances de monedas
export function useCoinBalances(owner?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [balances, setBalances] = useState<Record<string, unknown> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!owner || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.getAllCoinBalances(owner);
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching balances");
    } finally {
      setLoading(false);
    }
  }, [owner, isConnected, client]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, loading, error, refetch: fetchBalances };
}

// Hook para listar objetos poseídos
export function useOwnedObjects(owner?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [objects, setObjects] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObjects = useCallback(async () => {
    if (!owner || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.listOwnedObjects(owner);
      setObjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching objects");
    } finally {
      setLoading(false);
    }
  }, [owner, isConnected, client]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  return { objects, loading, error, refetch: fetchObjects };
}

// Hook para listar campos dinámicos
export function useDynamicFields(parentId?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [fields, setFields] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    if (!parentId || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.listDynamicFields(parentId);
      setFields(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching fields");
    } finally {
      setLoading(false);
    }
  }, [parentId, isConnected, client]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return { fields, loading, error, refetch: fetchFields };
}

// Hook para simular una transacción
export function useDryRunTransaction() {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dryRun = useCallback(
    async (txBytes: string, signerAddress: string) => {
      if (!isConnected) {
        throw new Error("Cliente no está conectado");
      }

      setLoading(true);
      setError(null);

      try {
        const data = await client.dryRunTransaction(txBytes, signerAddress);
        setResult(data);
        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error running dry run";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, client],
  );

  return { result, loading, error, dryRun };
}

// Hook para obtener información de paquete Move
export function useMovePackage(packageId?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [pkg, setPkg] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackage = useCallback(async () => {
    if (!packageId || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.getMovePackage(packageId);
      setPkg(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching package");
    } finally {
      setLoading(false);
    }
  }, [packageId, isConnected, client]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  return { pkg, loading, error, refetch: fetchPackage };
}

// Hook para resolver nombre SuiNS
export function useSuiNSResolver(name?: string) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async () => {
    if (!name || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const data = await client.resolveSuiNSName(name);
      setRecord(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error resolving name");
    } finally {
      setLoading(false);
    }
  }, [name, isConnected, client]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return { record, loading, error, refetch: resolve };
}

// Hook para suscribirse a checkpoints en tiempo real
export function useCheckpointSubscription(enabled: boolean = false) {
  const client = useSuiGrpcClient();
  const isConnected = useGrpcConnected();
  const [latestCheckpoint, setLatestCheckpoint] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !isConnected) return;

    setLoading(true);
    setError(null);

    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        unsubscribe = await client.subscribeCheckpoints(
          (checkpoint) => {
            setLatestCheckpoint(checkpoint);
          },
          ["sequence_number", "digest", "summary.timestamp"],
        );
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error subscribing to checkpoints",
        );
        setLoading(false);
      }
    })();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enabled, isConnected, client]);

  return { latestCheckpoint, loading, error };
}
