// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useGraphQLContext } from "../contexts/GraphQLContext";
import {
  useEpoch,
  useTransactionBlocks,
  useObject,
  useCoinBalance,
  useServiceConfig,
} from "../hooks/useGraphQL";
import {
  formatBalance,
  formatTimestamp,
  formatAddress,
} from "../utils/graphqlUtils";

export function GraphQLExplorer() {
  const { isConnected, environment, currentEndpoint, error } =
    useGraphQLContext();
  const [activeTab, setActiveTab] = useState<
    "epoch" | "transactions" | "object" | "balance" | "config"
  >("epoch");
  const [epochId, setEpochId] = useState<number | undefined>();
  const [objectId, setObjectId] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  const epochData = useEpoch(epochId);
  const txData = useTransactionBlocks(
    ownerAddress ? { affectedAddress: ownerAddress } : undefined,
  );
  const objectData = useObject(objectId);
  const balanceData = useCoinBalance(ownerAddress);
  const configData = useServiceConfig();

  if (!isConnected) {
    return (
      <div
        style={{
          padding: "20px",
          border: "1px solid #ff6b6b",
          borderRadius: "8px",
          backgroundColor: "#ffe0e0",
        }}
      >
        <h3>⚠️ GraphQL Not Connected</h3>
        <p>Please connect to GraphQL service first.</p>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Environment: {environment}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2>🔗 GraphQL Explorer</h2>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
          <p>
            Environment: <strong>{environment}</strong>
          </p>
          <p>
            Endpoint: <code>{currentEndpoint}</code>
          </p>
          {error && <p style={{ color: "red" }}>Error: {error}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {(
          ["epoch", "transactions", "object", "balance", "config"] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #4285f4" : "none",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: activeTab === tab ? "#4285f4" : "#666",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ marginTop: "20px" }}>
        {activeTab === "epoch" && (
          <EpochTab
            data={epochData}
            epochId={epochId}
            onEpochIdChange={setEpochId}
          />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab
            data={txData}
            ownerAddress={ownerAddress}
            onAddressChange={setOwnerAddress}
          />
        )}
        {activeTab === "object" && (
          <ObjectTab
            data={objectData}
            objectId={objectId}
            onObjectIdChange={setObjectId}
          />
        )}
        {activeTab === "balance" && (
          <BalanceTab
            data={balanceData}
            ownerAddress={ownerAddress}
            onAddressChange={setOwnerAddress}
          />
        )}
        {activeTab === "config" && <ConfigTab data={configData} />}
      </div>
    </div>
  );
}

// ============================================================================
// Tab Components
// ============================================================================

interface EpochTabProps {
  data: any;
  epochId: number | undefined;
  onEpochIdChange: (id: number | undefined) => void;
}

function EpochTab({ data, epochId, onEpochIdChange }: EpochTabProps) {
  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Epoch ID (optional):
        </label>
        <input
          type="number"
          value={epochId ?? ""}
          onChange={(e) =>
            onEpochIdChange(
              e.target.value ? parseInt(e.target.value) : undefined,
            )
          }
          placeholder="Leave empty for current epoch"
          style={{ padding: "8px", width: "200px" }}
        />
      </div>

      {data.loading && <p>Loading epoch data...</p>}
      {data.error && <p style={{ color: "red" }}>Error: {data.error}</p>}

      {data.data && (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
          }}
        >
          <p>
            <strong>Epoch:</strong> {data.data.epochId}
          </p>
          <p>
            <strong>Reference Gas Price:</strong> {data.data.referenceGasPrice}
          </p>
          <p>
            <strong>Start:</strong> {formatTimestamp(data.data.startTimestamp)}
          </p>
          <p>
            <strong>End:</strong> {formatTimestamp(data.data.endTimestamp)}
          </p>
          <p>
            <strong>Active Validators:</strong>{" "}
            {data.data.validatorSet.activeValidators.length}
          </p>
        </div>
      )}
    </div>
  );
}

interface TransactionsTabProps {
  data: any;
  ownerAddress: string;
  onAddressChange: (address: string) => void;
}

function TransactionsTab({
  data,
  ownerAddress,
  onAddressChange,
}: TransactionsTabProps) {
  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Owner Address (optional):
        </label>
        <input
          type="text"
          value={ownerAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="0x..."
          style={{ padding: "8px", width: "400px" }}
        />
      </div>

      {data.loading && <p>Loading transactions...</p>}
      {data.error && <p style={{ color: "red" }}>Error: {data.error}</p>}

      {data.data && (
        <div>
          <p>
            <strong>Total Transactions:</strong> {data.data.nodes.length}
          </p>
          {data.data.nodes.map((tx: any, i: number) => (
            <div
              key={i}
              style={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
              }}
            >
              <p>
                <strong>Digest:</strong>{" "}
                <code>{formatAddress(tx.digest, true)}</code>
              </p>
              <p>
                <strong>Sender:</strong>{" "}
                {formatAddress(tx.sender.address, true)}
              </p>
              <p>
                <strong>Timestamp:</strong> {formatTimestamp(tx.timestamp)}
              </p>
              <p>
                <strong>Status:</strong> {tx.effects.status}
              </p>
              <p>
                <strong>Gas Price:</strong> {tx.gasInput.gasPrice}
              </p>
            </div>
          ))}
          <div style={{ marginTop: "15px" }}>
            {data.hasNextPage && (
              <button
                onClick={data.nextPage}
                style={{ padding: "8px 16px", cursor: "pointer" }}
              >
                Load Next Page
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ObjectTabProps {
  data: any;
  objectId: string;
  onObjectIdChange: (id: string) => void;
}

function ObjectTab({ data, objectId, onObjectIdChange }: ObjectTabProps) {
  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Object ID:
        </label>
        <input
          type="text"
          value={objectId}
          onChange={(e) => onObjectIdChange(e.target.value)}
          placeholder="0x..."
          style={{ padding: "8px", width: "400px" }}
        />
      </div>

      {data.loading && <p>Loading object...</p>}
      {data.error && <p style={{ color: "red" }}>Error: {data.error}</p>}

      {data.data && (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
          }}
        >
          <p>
            <strong>Address:</strong>{" "}
            <code>{formatAddress(data.data.address, true)}</code>
          </p>
          <p>
            <strong>Version:</strong> {data.data.version}
          </p>
          <p>
            <strong>Digest:</strong>{" "}
            <code>{formatAddress(data.data.digest, true)}</code>
          </p>
          <p>
            <strong>Status:</strong> {data.data.status}
          </p>
          <p>
            <strong>Storage Rebate:</strong> {data.data.storageRebate}
          </p>
          <p>
            <strong>Owner Type:</strong> {data.data.owner.__typename}
          </p>
        </div>
      )}
    </div>
  );
}

interface BalanceTabProps {
  data: any;
  ownerAddress: string;
  onAddressChange: (address: string) => void;
}

function BalanceTab({ data, ownerAddress, onAddressChange }: BalanceTabProps) {
  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Owner Address:
        </label>
        <input
          type="text"
          value={ownerAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="0x..."
          style={{ padding: "8px", width: "400px" }}
        />
      </div>

      {data.loading && <p>Loading balance...</p>}
      {data.error && <p style={{ color: "red" }}>Error: {data.error}</p>}

      {data.data && (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
          }}
        >
          <p>
            <strong>Total SUI Balance:</strong>{" "}
            {formatBalance(data.data.balance.totalBalance)} SUI
          </p>
          <p>
            <strong>Coin Objects:</strong> {data.data.balance.coinObjectCount}
          </p>
          <p>
            <strong>Coins Available:</strong> {data.data.coins.nodes.length}
          </p>
          {data.data.coins.nodes.map((coin: any, i: number) => (
            <div
              key={i}
              style={{
                backgroundColor: "#fff",
                padding: "8px",
                marginBottom: "5px",
                borderRadius: "2px",
              }}
            >
              <p>
                <code>{formatAddress(coin.address, true)}</code>:{" "}
                {formatBalance(coin.coinBalance)} SUI
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ConfigTabProps {
  data: any;
}

function ConfigTab({ data }: ConfigTabProps) {
  return (
    <div>
      {data.loading && <p>Loading configuration...</p>}
      {data.error && <p style={{ color: "red" }}>Error: {data.error}</p>}

      {data.data && (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
          }}
        >
          <h3>Service Limits</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <p>
                <strong>Max Query Depth:</strong> {data.data.maxQueryDepth}
              </p>
              <p>
                <strong>Max Query Nodes:</strong> {data.data.maxQueryNodes}
              </p>
              <p>
                <strong>Max Output Nodes:</strong> {data.data.maxOutputNodes}
              </p>
              <p>
                <strong>Default Page Size:</strong> {data.data.defaultPageSize}
              </p>
            </div>
            <div>
              <p>
                <strong>Max Page Size:</strong> {data.data.maxPageSize}
              </p>
              <p>
                <strong>Query Timeout:</strong> {data.data.queryTimeoutMs}ms
              </p>
              <p>
                <strong>Max Payload Size:</strong>{" "}
                {data.data.maxQueryPayloadSize} bytes
              </p>
              <p>
                <strong>Max Move Value Depth:</strong>{" "}
                {data.data.maxMoveValueDepth}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
