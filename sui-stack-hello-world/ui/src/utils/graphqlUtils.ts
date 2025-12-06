// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Build a GraphQL fragment for Move values
 */
export const MOVE_VALUE_FRAGMENT = `
  fragment MoveValueFields on MoveValue {
    type {
      repr
    }
    json
    bcs
  }
`;

/**
 * Build a GraphQL fragment for dynamic field values
 */
export const DYNAMIC_FIELD_VALUE_FRAGMENT = `
  fragment DynamicFieldValueSelection on DynamicFieldValue {
    __typename
    ... on MoveValue {
      ...MoveValueFields
    }
    ... on MoveObject {
      hasPublicTransfer
      contents {
        ...MoveValueFields
      }
    }
  }
`;

/**
 * Build a GraphQL fragment for dynamic fields
 */
export const DYNAMIC_FIELD_FRAGMENT = `
  fragment DynamicFieldSelect on DynamicField {
    name {
      ...MoveValueFields
    }
    value {
      ...DynamicFieldValueSelection
    }
  }
`;

// ============================================================================
// Common Query Templates
// ============================================================================

/**
 * Query for getting epoch information with validators and protocol config
 */
export const EPOCH_QUERY = `
  query GetEpoch($epochId: Int) {
    epoch(id: $epochId) {
      epochId
      referenceGasPrice
      startTimestamp
      endTimestamp
      validatorSet {
        activeValidators {
          name
          address
          stakingPoolActivationEpoch
          commissionRate
          gasPrice
          stakingPoolSuiBalance
        }
      }
      protocolConfigs {
        featureFlags
      }
    }
  }
`;

/**
 * Query for paginating transaction blocks
 */
export const TRANSACTION_BLOCKS_QUERY = `
  query GetTransactionBlocks($first: Int, $after: String, $filter: TransactionBlockFilter) {
    transactionBlocks(first: $first, after: $after, filter: $filter) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        digest
        sender {
          address
        }
        timestamp
        kind {
          __typename
        }
        effects {
          status
          gasEffects {
            gasObject {
              address
            }
          }
        }
        gasInput {
          gasPrice
          gasBudget
        }
      }
      edges {
        cursor
      }
    }
  }
`;

/**
 * Query for getting object information with owner and contents
 */
export const OBJECT_QUERY = `
  query GetObject($objectId: SuiAddress!) {
    object(address: $objectId) {
      address
      version
      digest
      objectId
      storageRebate
      owner {
        __typename
        ... on AddressOwner {
          owner {
            address
          }
        }
        ... on ObjectOwner {
          owner {
            address
          }
        }
        ... on Shared {
          initialSharedVersion
        }
      }
      previousTransactionBlock {
        digest
      }
      status
      asMoveObject {
        contents {
          type {
            repr
          }
          json
          bcs
        }
        hasPublicTransfer
      }
    }
  }
`;

/**
 * Query for getting coin balance and coin information
 */
export const COIN_BALANCE_QUERY = `
  query GetCoinBalance($owner: SuiAddress!, $coinType: String) {
    owner(address: $owner) {
      coins(first: 50) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          address
          coinBalance
          coinObjectCount
        }
      }
      balance(type: $coinType) {
        coinObjectCount
        totalBalance
      }
    }
  }
`;

/**
 * Query for getting owned objects with pagination
 */
export const OWNED_OBJECTS_QUERY = `
  query GetOwnedObjects($owner: SuiAddress!, $first: Int, $after: String) {
    owner(address: $owner) {
      objects(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
          startCursor
        }
        nodes {
          address
          version
          digest
          objectId
          owner {
            __typename
          }
        }
        edges {
          cursor
        }
      }
    }
  }
`;

/**
 * Query for getting service configuration and limits
 */
export const SERVICE_CONFIG_QUERY = `
  query GetServiceConfig {
    serviceConfig {
      maxQueryDepth
      maxQueryNodes
      maxOutputNodes
      defaultPageSize
      maxPageSize
      queryTimeoutMs
      maxQueryPayloadSize
      maxTypeArgumentDepth
      maxTypeArgumentWidth
      maxTypeNodes
      maxMoveValueDepth
    }
  }
`;

// ============================================================================
// Pagination Utilities
// ============================================================================

export interface PaginationParams {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

/**
 * Validate pagination parameters
 * According to GraphQL spec, cannot use both 'first' and 'last'
 */
export function validatePaginationParams(params: PaginationParams): {
  valid: boolean;
  error?: string;
} {
  if (params.first !== undefined && params.last !== undefined) {
    return {
      valid: false,
      error: 'Cannot use both "first" and "last" parameters',
    };
  }

  if (params.first !== undefined && params.first > 100) {
    return {
      valid: false,
      error: "Page size limit exceeded. Maximum is 100.",
    };
  }

  if (params.last !== undefined && params.last > 100) {
    return {
      valid: false,
      error: "Page size limit exceeded. Maximum is 100.",
    };
  }

  return { valid: true };
}

/**
 * Build pagination variables for a query
 */
export function buildPaginationVariables(
  params: PaginationParams,
): Record<string, any> {
  const variables: Record<string, any> = {};

  if (params.first !== undefined) {
    variables.first = Math.min(params.first, 100);
  }
  if (params.after !== undefined) {
    variables.after = params.after;
  }
  if (params.last !== undefined) {
    variables.last = Math.min(params.last, 100);
  }
  if (params.before !== undefined) {
    variables.before = params.before;
  }

  return variables;
}

// ============================================================================
// Query Validators
// ============================================================================

/**
 * Validate a SUI address format
 */
export function isValidSuiAddress(address: string): boolean {
  // Sui addresses are 32 bytes hex (64 chars) optionally prefixed with 0x
  const normalizedAddress = address.startsWith("0x")
    ? address.slice(2)
    : address;
  return /^[a-fA-F0-9]{64}$/.test(normalizedAddress);
}

/**
 * Validate a SUI object ID format
 */
export function isValidObjectId(objectId: string): boolean {
  return isValidSuiAddress(objectId);
}

/**
 * Validate a transaction digest
 */
export function isValidTransactionDigest(digest: string): boolean {
  // Sui transaction digests are Base58Check encoded
  return digest.length === 44 && /^[A-Za-z0-9]+$/.test(digest);
}

// ============================================================================
// Data Formatting
// ============================================================================

/**
 * Format balance from MIST to SUI (1 SUI = 1,000,000,000 MIST)
 */
export function formatBalance(balance: string | number): string {
  const num = typeof balance === "string" ? BigInt(balance) : BigInt(balance);
  const divisor = BigInt(1_000_000_000);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(9, "0");
  return `${integerPart}.${fractionalStr}`;
}

/**
 * Parse SUI amount to MIST
 */
export function parseBalance(suiAmount: string): string {
  const [integerPart, fractionalPart = ""] = suiAmount.split(".");
  const paddedFractional = fractionalPart.padEnd(9, "0");
  const mist =
    BigInt(integerPart) * BigInt(1_000_000_000) + BigInt(paddedFractional);
  return mist.toString();
}

/**
 * Format timestamp to human-readable format
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString();
}

/**
 * Format object address with truncation option
 */
export function formatAddress(
  address: string,
  truncate: boolean = false,
): string {
  if (!truncate) return address;
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Extract error message from GraphQL response
 */
export function extractErrorMessage(
  errors?: Array<{ message: string }>,
): string | null {
  if (!errors || errors.length === 0) return null;
  return errors.map((e) => e.message).join("; ");
}

/**
 * Parse GraphQL error details
 */
export function parseGraphQLError(error: any): {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: (string | number)[];
} {
  return {
    message: error.message || "Unknown GraphQL error",
    locations: error.locations,
    path: error.path,
  };
}

// ============================================================================
// Query Optimization
// ============================================================================

/**
 * Build a query with usage tracking headers
 */
export function buildQueryWithUsage(
  showUsage: boolean = true,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (showUsage) {
    headers["x-sui-rpc-show-usage"] = "true";
  }

  return headers;
}

/**
 * Calculate query complexity based on nodes and depth
 */
export function calculateQueryComplexity(
  nodes: number,
  depth: number,
  maxNodes: number = 15000,
  maxDepth: number = 15,
): {
  complexity: number;
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const complexity = nodes * (depth / 2);

  if (nodes > maxNodes) {
    warnings.push(`Query nodes (${nodes}) exceeds limit (${maxNodes})`);
  }

  if (depth > maxDepth) {
    warnings.push(`Query depth (${depth}) exceeds limit (${maxDepth})`);
  }

  return {
    complexity,
    isValid: warnings.length === 0,
    warnings,
  };
}
