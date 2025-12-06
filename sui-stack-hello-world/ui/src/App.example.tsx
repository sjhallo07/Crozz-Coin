// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { GrpcProvider } from "./contexts/GrpcContext";
import {
  GrpcConnectionSelector,
  GrpcConnectionBadge,
} from "./components/GrpcConnection";
import { GrpcApiExplorer } from "./components/GrpcApiExplorer";

import { useGrpcContext } from "./contexts/GrpcContext";
import { useTransaction, useCoinBalances } from "./hooks/useGrpc";

/**
 * Ejemplo de aplicación con integración de gRPC
 */
function App() {
  return (
    <GrpcProvider defaultEnvironment="devnet" autoConnect={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Sui gRPC Explorer
            </h1>
            <GrpcConnectionBadge />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Selector de Conexión */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Configuración de Conexión
            </h2>
            <GrpcConnectionSelector />
          </section>

          {/* Explorador de APIs */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Explorador de APIs
            </h2>
            <GrpcApiExplorer showConnectionSelector={false} />
          </section>
        </main>
      </div>
    </GrpcProvider>
  );
}

export default App;

/**
 * Alternativa más simple si solo necesitas los hooks en un componente
 */
export function SimpleGrpcExample() {
  return (
    <GrpcProvider defaultEnvironment="testnet">
      <MyComponent />
    </GrpcProvider>
  );
}

function MyComponent() {
  const { isConnected, currentEndpoint, environment } = useGrpcContext();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Estado de Conexión</h3>
      <div className="space-y-2 text-sm">
        <p>
          Estado:{" "}
          <span className="font-semibold">
            {isConnected ? "✓ Conectado" : "✗ Desconectado"}
          </span>
        </p>
        <p>
          Ambiente: <span className="font-mono">{environment}</span>
        </p>
        <p>
          Endpoint:{" "}
          <span className="font-mono break-all">{currentEndpoint}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Ejemplo de uso de hooks en un componente
 */
export function TransactionViewer({ digest }: { digest: string }) {
  const { transaction, loading, error } = useTransaction(digest);

  if (!digest) {
    return <p className="text-gray-500">Ingresa un digest de transacción</p>;
  }

  if (loading) {
    return <p className="text-blue-500">Cargando transacción...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!transaction) {
    return <p className="text-gray-500">No se encontró la transacción</p>;
  }

  return (
    <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
      {JSON.stringify(transaction, null, 2)}
    </pre>
  );
}

/**
 * Ejemplo de consulta de balances
 */
export function BalanceViewer({ address }: { address: string }) {
  const { balances, loading, error } = useCoinBalances(address);

  if (!address) {
    return <p className="text-gray-500">Ingresa una dirección de Sui</p>;
  }

  if (loading) {
    return <p className="text-blue-500">Cargando balances...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!balances) {
    return <p className="text-gray-500">Sin balances</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Balances de {address}</h3>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
        {JSON.stringify(balances, null, 2)}
      </pre>
    </div>
  );
}
