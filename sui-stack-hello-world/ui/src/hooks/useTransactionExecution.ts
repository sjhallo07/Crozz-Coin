import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

type ExecuteFn = (buildTx: (tx: Transaction) => void) => void;

export function useTransactionExecution(): {
  execute: ExecuteFn;
  loading: boolean;
  error: string | null;
  lastDigest: string | null;
} {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDigest, setLastDigest] = useState<string | null>(null);

  const execute: ExecuteFn = (buildTx) => {
    setLoading(true);
    setError(null);

    const tx = new Transaction();
    buildTx(tx);

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setLastDigest(result.digest);
          suiClient
            .waitForTransaction({
              digest: result.digest,
              options: { showEffects: true },
            })
            .finally(() => {
              setLoading(false);
            });
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        },
      },
    );
  };

  return { execute, loading, error, lastDigest };
}
