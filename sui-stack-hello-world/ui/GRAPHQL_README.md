# GraphQL RPC Integration for Sui

> **Sui GraphQL RPC Beta** - Production-ready integration for querying Sui blockchain data

This implementation provides a comprehensive GraphQL client for the Sui RPC service, with React hooks, context management, and interactive explorer components.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Pagination](#pagination)
- [Error Handling](#error-handling)
- [Resources](#resources)

## 🚀 Quick Start

### 1. Setup GraphQL Provider

```tsx
import { GraphQLProvider } from './contexts/GraphQLContext';
import { GraphQLExplorer } from './components/GraphQLExplorer';

function App() {
  return (
    <GraphQLProvider defaultEnvironment="testnet" autoConnect={true}>
      {/* Your app components */}
      <GraphQLExplorer />
    </GraphQLProvider>
  );
}
```

### 2. Use GraphQL Hooks in Components

```tsx
import { useEpoch, useCoinBalance } from './hooks/useGraphQL';

function MyComponent() {
  const { data: epoch, loading, error } = useEpoch();
  const { data: balance } = useCoinBalance('0x...');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Current Epoch: {epoch?.epochId}</p>
      <p>Balance: {balance?.balance.totalBalance} MIST</p>
    </div>
  );
}
```

### 3. Manual Client Usage

```tsx
import { SuiGraphQLClient } from './services/graphqlClient';

async function queryEpoch() {
  const client = new SuiGraphQLClient('testnet');
  const response = await client.getEpoch();
  console.log(response.data);
}
```

## ✨ Features

### Core Features

✅ **Full GraphQL RPC Support** - All Sui gRPC services via GraphQL

- Epoch information and validators
- Transaction blocks with pagination
- Object queries and dynamic fields
- Coin balance and owned objects
- Service configuration and limits

✅ **React Hooks** - 8+ custom hooks for common operations

- `useEpoch()` - Get current/specific epoch
- `useTransactionBlocks()` - Paginate transactions
- `useObject()` - Query object details
- `useCoinBalance()` - Get user balances
- `useOwnedObjects()` - List user objects
- `useServiceConfig()` - Get service limits
- `useDataRetention()` - Data retention info
- `useGraphQLQuery()` - Generic query hook

✅ **Context Management** - Global state for GraphQL

- Auto-connect to network on mount
- Environment switching (devnet/testnet/mainnet)
- Custom endpoint support
- Error tracking and recovery

✅ **UI Components** - Interactive explorer

- Environment selector
- Query builder tabs
- Real-time results
- Usage tracking display

✅ **Pagination** - Full cursor-based pagination support

- Forward pagination (`first`, `after`)
- Backward pagination (`last`, `before`)
- Cursor validation and consistency
- Automatic page limit enforcement

✅ **Headers & Configuration**

- Custom HTTP headers (`x-sui-rpc-show-usage`, `x-sui-rpc-version`)
- Request timeouts
- Query complexity tracking
- Usage information extraction

✅ **Type Safety** - Full TypeScript support

- 30+ type definitions
- Enum types for status/owner
- Connection and pagination types
- Response wrapper types

✅ **Query Utilities** - Helper functions

- GraphQL fragments for reuse
- Query builders for complex queries
- Address validation
- Balance formatting
- Error extraction

## 🏗️ Architecture

### File Structure

```
src/
├── services/
│   └── graphqlClient.ts          # Core GraphQL client (350+ lines)
├── contexts/
│   └── GraphQLContext.tsx         # Global state management (150+ lines)
├── hooks/
│   └── useGraphQL.ts             # React hooks (250+ lines)
├── components/
│   └── GraphQLExplorer.tsx        # Interactive explorer (300+ lines)
├── types/
│   └── graphql.ts                # TypeScript definitions (200+ lines)
├── utils/
│   └── graphqlUtils.ts           # Helper functions (300+ lines)
└── examples/
    └── graphqlExamples.ts        # 15 working examples (400+ lines)
```

### Architecture Layers

```
Components (GraphQLExplorer.tsx)
    ↓
Hooks (useGraphQL.ts)
    ↓
GraphQL Context (GraphQLContext.tsx)
    ↓
GraphQL Client (graphqlClient.ts)
    ↓
Sui GraphQL RPC Service
    ↓
Sui Blockchain
```

## 📖 Usage Examples

### Example 1: Get Current Epoch

```tsx
import { useEpoch } from './hooks/useGraphQL';

function EpochInfo() {
  const { data, loading, error, refetch } = useEpoch();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Epoch {data?.epochId}</h2>
      <p>Reference Gas Price: {data?.referenceGasPrice}</p>
      <p>Validators: {data?.validatorSet.activeValidators.length}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Example 2: Query Object Details

```tsx
import { useObject } from './hooks/useGraphQL';

function ObjectViewer({ objectId }: { objectId: string }) {
  const { data, loading, error } = useObject(objectId);

  return (
    <div>
      {data && (
        <div>
          <p>Address: {data.address}</p>
          <p>Version: {data.version}</p>
          <p>Status: {data.status}</p>
          {data.asMoveObject && (
            <p>Type: {data.asMoveObject.contents.type.repr}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### Example 3: Paginate Transactions

```tsx
import { useTransactionBlocks } from './hooks/useGraphQL';
import { formatAddress } from './utils/graphqlUtils';

function TransactionList() {
  const { 
    data, 
    loading, 
    nextPage, 
    hasNextPage 
  } = useTransactionBlocks(undefined, 25);

  return (
    <div>
      {data?.nodes.map(tx => (
        <div key={tx.digest}>
          <code>{formatAddress(tx.digest, true)}</code>
          <p>Sender: {formatAddress(tx.sender.address, true)}</p>
        </div>
      ))}
      {hasNextPage && (
        <button onClick={nextPage}>Load More</button>
      )}
    </div>
  );
}
```

### Example 4: Get Coin Balance

```tsx
import { useCoinBalance } from './hooks/useGraphQL';
import { formatBalance } from './utils/graphqlUtils';

function BalanceViewer({ owner }: { owner: string }) {
  const { data, loading } = useCoinBalance(owner);

  return (
    <div>
      <h3>SUI Balance: {formatBalance(data?.balance.totalBalance)} SUI</h3>
      <p>Coins: {data?.coins.nodes.length}</p>
    </div>
  );
}
```

### Example 5: Custom GraphQL Query

```tsx
import { useSuiGraphQLClient } from './contexts/GraphQLContext';

function CustomQuery() {
  const client = useSuiGraphQLClient();

  const handleQuery = async () => {
    const response = await client?.query(
      `query { 
        serviceConfig { 
          maxQueryDepth 
          maxPageSize 
        } 
      }`,
      undefined,
      { showUsage: true }
    );
    console.log('Response:', response);
  };

  return <button onClick={handleQuery}>Run Query</button>;
}
```

## 📚 API Reference

### SuiGraphQLClient

Main client class for GraphQL operations.

```typescript
class SuiGraphQLClient {
  constructor(environment: 'devnet' | 'testnet' | 'mainnet');
  
  // Queries
  query<T>(query: string, variables?: any, options?: any): Promise<GraphQLResponse<T>>;
  getEpoch(epochId?: number): Promise<...>;
  getTransactionBlocks(first?: number, after?: string, filter?: any): Promise<...>;
  getObject(objectId: string): Promise<...>;
  getCoinBalance(owner: string, coinType?: string): Promise<...>;
  getOwnedObjects(owner: string, first?: number, after?: string): Promise<...>;
  getServiceConfig(): Promise<...>;
  getDataRetention(queryType: string, field: string, filter?: string): Promise<...>;
  
  // Environment
  switchEnvironment(env: 'devnet' | 'testnet' | 'mainnet'): void;
  setEndpoint(endpoint: string): void;
  getEndpoint(): string;
}
```

### React Hooks

All hooks follow the same pattern:

```typescript
interface UseResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

Available hooks:

- `useEpoch(epochId?: number): UseResult<Epoch>`
- `useTransactionBlocks(filter?, first?, options?): UseResult<Connection<TransactionBlock>>`
- `useObject(objectId: string): UseResult<SuiObject>`
- `useCoinBalance(owner: string, coinType?: string): UseResult<OwnerCoins>`
- `useOwnedObjects(owner: string, first?, options?): UseResult<Connection<SuiObject>>`
- `useServiceConfig(): UseResult<ServiceConfig>`
- `useDataRetention(queryType, field, filter?): UseResult<RetentionInfo>`
- `useGraphQLQuery<T>(query, variables?, options?): UseResult<T>`

### Context Hooks

```typescript
// Get full context
const context = useGraphQLContext(): GraphQLContextType;

// Get only client
const client = useSuiGraphQLClient(): SuiGraphQLClient | null;

// Get connection status
const isConnected = useGraphQLConnected(): boolean;

// Get/switch environment
const { environment, switchEnvironment } = useGraphQLEnvironment();
```

### Utility Functions

```typescript
// Formatting
formatBalance(balance: string): string;          // MIST to SUI
parseBalance(suiAmount: string): string;         // SUI to MIST
formatTimestamp(timestamp: string): string;      // ISO date
formatAddress(address: string, truncate?: boolean): string;

// Validation
isValidSuiAddress(address: string): boolean;
isValidObjectId(objectId: string): boolean;
isValidTransactionDigest(digest: string): boolean;

// Pagination
validatePaginationParams(params: PaginationParams): ValidationResult;
buildPaginationVariables(params: PaginationParams): Record<string, any>;

// Error Handling
extractErrorMessage(errors?: any[]): string | null;
parseGraphQLError(error: any): ParsedError;

// Optimization
calculateQueryComplexity(nodes, depth, maxNodes?, maxDepth?): ComplexityInfo;
```

## 🎯 Best Practices

### 1. Always Use Provider

```tsx
// ✅ Good
<GraphQLProvider>
  <MyComponent />
</GraphQLProvider>

// ❌ Bad - will throw error
function MyComponent() {
  const context = useGraphQLContext(); // Will fail
}
```

### 2. Check Connection Status

```tsx
// ✅ Good
const { isConnected } = useGraphQLContext();
if (!isConnected) return <div>Not connected</div>;

// ❌ Bad - might cause null errors
const client = useSuiGraphQLClient();
client.query(...);
```

### 3. Use Proper Error Handling

```tsx
// ✅ Good
const { data, loading, error, refetch } = useEpoch();

return (
  <div>
    {loading && <Spinner />}
    {error && <ErrorMessage error={error} />}
    {data && <Display data={data} />}
  </div>
);
```

### 4. Optimize Queries

```tsx
// ✅ Good - skip when address is empty
const { data } = useCoinBalance(address, {
  skip: !address
});

// ❌ Bad - queries even with empty address
const { data } = useCoinBalance(address);
```

### 5. Handle Large Pagination

```tsx
// ✅ Good - use cursor-based pagination
const { data, nextPage, hasNextPage } = useTransactionBlocks(
  undefined,
  50  // page size
);

// ❌ Bad - loading all at once
const { data } = useTransactionBlocks(undefined, 10000);
```

## 📄 Pagination Guide

### Forward Pagination

```tsx
const [after, setAfter] = useState<string | undefined>();

const { data } = useTransactionBlocks(10, after);

const nextPage = () => {
  if (data?.pageInfo.endCursor) {
    setAfter(data.pageInfo.endCursor);
  }
};
```

### Backward Pagination

```tsx
// Use 'last' parameter
const query = `
  query {
    transactionBlocks(last: 10) {
      pageInfo { startCursor hasPreviousPage }
      nodes { digest }
    }
  }
`;
```

### Cursor Consistency

```tsx
// Same checkpoint for all pagination requests
const firstQuery = await client.getTransactionBlocks(10);
const cursor = firstQuery.data?.transactionBlocks?.pageInfo?.endCursor;

// Use same cursor from same request
const nextQuery = await client.getTransactionBlocks(10, cursor);
```

## ⚠️ Error Handling

### Common Errors

```typescript
// Invalid address format
GraphQLError: Invalid address format

// Query too complex
GraphQLError: Query exceeds maximum nodes (15000)

// Timeout
Error: GraphQL request timeout

// Network error
Error: Failed to fetch

// Rate limited
Error: Too many requests
```

### Handling Errors

```tsx
const { data, error, refetch } = useEpoch();

if (error?.includes('timeout')) {
  return <button onClick={() => refetch()}>Retry</button>;
}

if (error?.includes('rate limit')) {
  return <div>Please wait before retrying</div>;
}
```

## 📊 Service Limits

Query the service config to understand limits:

```tsx
const { data: config } = useServiceConfig();

console.log({
  maxDepth: config?.maxQueryDepth,        // 15
  maxNodes: config?.maxQueryNodes,        // 15000
  maxPageSize: config?.maxPageSize,       // 100
  maxTimeout: config?.queryTimeoutMs,     // 60000
});
```

## 🔗 Resources

### Official Documentation

- [Sui GraphQL RPC (Beta)](https://docs.sui.io/concepts/data-access/graphql-rpc)
- [GraphQL Fundamentals](https://graphql.org/learn/)
- [Cursor-based Pagination](https://relay.dev/graphql/connections.htm)
- [Sui API Reference](https://docs.sui.io/references/sui-api)

### Network Endpoints

- **Mainnet**: `https://graphql.mainnet.sui.io/graphql`
- **Testnet**: `https://graphql.testnet.sui.io/graphql`
- **Devnet**: `https://graphql.devnet.sui.io/graphql`

### Related Services

- [Sui JSON-RPC](https://docs.sui.io/references/sui-api/json-rpc)
- [Indexer RPC](https://docs.sui.io/concepts/data-access/indexer-rpc)
- [Sui Full Node](https://docs.sui.io/guides/developer/running-a-fullnode)

## 📝 Examples

See `src/examples/graphqlExamples.ts` for 15 complete working examples:

1. Get current epoch
2. Get specific epoch by ID
3. Paginate transactions with filter
4. Get object details
5. Get coin balance
6. Get owned objects
7. Custom query with fragments
8. Service configuration
9. Data retention info
10. Switch environment
11. Batch query with Promise.all
12. Query with usage tracking
13. Error handling
14. Paginate backwards
15. Complex nested query

## 🤝 Contributing

To extend this implementation:

1. Add new query methods to `SuiGraphQLClient`
2. Create corresponding hooks in `useGraphQL.ts`
3. Add type definitions to `types/graphql.ts`
4. Create examples in `examples/graphqlExamples.ts`
5. Update this documentation

---

**Version**: 1.0.0  
**Status**: Production-ready (Beta)  
**Last Updated**: December 2025
