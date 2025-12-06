// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from "react";
import { useGrpcContext } from "../contexts/GrpcContext";
import { GRPC_CONFIG, getAllGrpcEndpoints } from "../config/grpcConfig";

export function GrpcConnectionSelector() {
  const {
    environment,
    switchEnvironment,
    currentEndpoint,
    isConnected,
    error,
  } = useGrpcContext();
  const [customEndpoint, setCustomEndpoint] = useState("");

  const handleEnvironmentChange = async (
    env: "mainnet" | "testnet" | "devnet",
  ) => {
    await switchEnvironment(env);
  };

  const handleCustomConnect = async () => {
    if (customEndpoint.trim()) {
      const { connectToEndpoint } = useGrpcContext();
      await connectToEndpoint(customEndpoint);
      setCustomEndpoint("");
    }
  };

  const endpoints = getAllGrpcEndpoints();

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Conexión gRPC</h2>
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm font-medium">
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Entornos predefinidos */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Entorno predefinido:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["devnet", "testnet", "mainnet"] as const).map((env) => (
              <button
                key={env}
                onClick={() => handleEnvironmentChange(env)}
                className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  environment === env
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoint actual */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Endpoint actual:
          </label>
          <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600 break-all">
            {currentEndpoint || "No conectado"}
          </div>
        </div>

        {/* Endpoint personalizado */}
        <div>
          <label className="block text-sm font-medium mb-2">
            O conectar a endpoint personalizado:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://custom-endpoint.example.com:443"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCustomConnect();
                }
              }}
            />
            <button
              onClick={handleCustomConnect}
              disabled={!customEndpoint.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Conectar
            </button>
          </div>
        </div>

        {/* Lista de endpoints disponibles */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Endpoints disponibles:
          </label>
          <div className="space-y-1 bg-gray-50 p-2 rounded border border-gray-200 max-h-24 overflow-y-auto">
            {endpoints.map((ep) => (
              <div
                key={ep.name}
                className="text-xs text-gray-600 flex items-center justify-between"
              >
                <span className="font-medium">{ep.name}:</span>
                <code className="bg-white px-2 py-1 rounded border border-gray-200">
                  {ep.endpoint}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente que muestra información de la conexión actual
 */
export function GrpcConnectionInfo() {
  const { isConnected, currentEndpoint, environment, error } = useGrpcContext();

  return (
    <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="font-medium text-gray-700">Estado:</span>
          <p className="text-gray-600">
            {isConnected ? "✓ Conectado" : "✗ Desconectado"}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Ambiente:</span>
          <p className="text-gray-600">{environment || "-"}</p>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-700">Endpoint:</span>
          <p className="text-gray-600 break-all">
            {currentEndpoint || "No configurado"}
          </p>
        </div>
        {error && (
          <div className="col-span-2">
            <span className="font-medium text-red-700">Error:</span>
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Componente para mostrar el estado de conexión en forma de badge
 */
export function GrpcConnectionBadge() {
  const { isConnected, environment } = useGrpcContext();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
      <div
        className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
      />
      <span className="font-medium text-gray-700">
        {isConnected ? `gRPC (${environment})` : "gRPC (offline)"}
      </span>
    </div>
  );
}
