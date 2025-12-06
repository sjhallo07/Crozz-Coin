// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { GraphQLError } from "graphql";

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: {
    usage?: {
      input: { nodes: number; depth: number };
      payload: { query_payload_size: number; tx_payload_size: number };
      output: { nodes: number };
    };
  };
}

export interface GraphQLRequestOptions {
  showUsage?: boolean;
  rpcVersion?: string;
  timeout?: number;
}

export class SuiGraphQLClient {
  private endpoints: Record<"devnet" | "testnet" | "mainnet", string> = {
    devnet: "https://graphql.devnet.sui.io/graphql",
    testnet: "https://graphql.testnet.sui.io/graphql",
    mainnet: "https://graphql.mainnet.sui.io/graphql",
  };

  private currentEndpoint: string;
  private timeout: number = 30000;

  constructor(environment: "devnet" | "testnet" | "mainnet" = "testnet") {
    this.currentEndpoint = this.endpoints[environment];
  }

  /**
   * Switch to a different Sui network environment
   */
  switchEnvironment(environment: "devnet" | "testnet" | "mainnet"): void {
    this.currentEndpoint = this.endpoints[environment];
  }

  /**
   * Set custom GraphQL endpoint
   */
  setEndpoint(endpoint: string): void {
    this.currentEndpoint = endpoint;
  }

  /**
   * Get current endpoint
   */
  getEndpoint(): string {
    return this.currentEndpoint;
  }

  /**
   * Execute a GraphQL query
   */
  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: GraphQLRequestOptions,
  ): Promise<GraphQLResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options?.showUsage) {
      headers["x-sui-rpc-show-usage"] = "true";
    }

    if (options?.rpcVersion) {
      headers["x-sui-rpc-version"] = options.rpcVersion;
    }

    const body = {
      query,
      ...(variables && { variables }),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options?.timeout || this.timeout,
      );

      const response = await fetch(this.currentEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `GraphQL request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data: GraphQLResponse<T> = await response.json();

      if (data.errors) {
        // Only log in development, and only if it's not a connection error
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
          const hasConnectionError = data.errors.some(err => 
            err.message?.includes('connect') || 
            err.message?.includes('ECONNREFUSED')
          );
          if (!hasConnectionError) {
            console.warn("GraphQL Errors:", data.errors);
          }
        }
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("GraphQL request timeout");
        }
        // Silently handle connection errors (GraphQL not available)
        if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
          return { errors: [{ message: 'GraphQL service not available' } as GraphQLError] };
        }
        throw error;
      }
      throw new Error("Unknown error during GraphQL request");
    }
  }

  /**
   * Get service configuration and limits
   */
  async getServiceConfig() {
    const query = `
      query {
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

    return this.query(query, undefined, { showUsage: true });
  }

  /**
   * Get current epoch information
   */
  async getEpoch(epochId?: number) {
    const query = `
      query ($epochId: Int) {
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
            }
          }
          protocolConfigs {
            featureFlags
          }
        }
      }
    `;

    return this.query(query, epochId ? { epochId } : undefined, {
      showUsage: true,
    });
  }

  /**
   * Get transaction blocks with pagination
   */
  async getTransactionBlocks(
    first?: number,
    after?: string,
    filter?: {
      affectedAddress?: string;
      fromAddress?: string;
      toAddress?: string;
      sentAddress?: string;
      receivedAddress?: string;
    },
  ) {
    const query = `
      query ($first: Int, $after: String, $filter: TransactionBlockFilter) {
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

    const variables: Record<string, any> = {};
    if (first) variables.first = first;
    if (after) variables.after = after;
    if (filter) variables.filter = filter;

    return this.query(
      query,
      Object.keys(variables).length > 0 ? variables : undefined,
      {
        showUsage: true,
      },
    );
  }

  /**
   * Get object information
   */
  async getObject(objectId: string) {
    const query = `
      query ($objectId: SuiAddress!) {
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
            ... on Immutable
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

    return this.query(query, { objectId }, { showUsage: true });
  }

  /**
   * Get coin balance information
   */
  async getCoinBalance(owner: string, coinType: string = "0x2::sui::SUI") {
    const query = `
      query ($owner: SuiAddress!, $coinType: String) {
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

    return this.query(query, { owner, coinType }, { showUsage: true });
  }

  /**
   * Get owned objects
   */
  async getOwnedObjects(owner: string, first?: number, after?: string) {
    const query = `
      query ($owner: SuiAddress!, $first: Int, $after: String) {
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

    const variables: Record<string, any> = { owner };
    if (first) variables.first = first;
    if (after) variables.after = after;

    return this.query(query, variables, { showUsage: true });
  }

  /**
   * Get data retention information
   */
  async getDataRetention(queryType: string, field: string, filter?: string) {
    const query = `
      query {
        serviceConfig {
          retention(type: "${queryType}", field: "${field}"${filter ? `, filter: "${filter}"` : ""}) {
            first {
              sequenceNumber
            }
            last {
              sequenceNumber
            }
          }
        }
      }
    `;

    return this.query(query, undefined, { showUsage: true });
  }

  /**
   * Get dynamic field value
   */
  async getDynamicField(
    objectId: string,
    fieldName: {
      type: string;
      bcs: string;
    },
  ) {
    const query = `
      query ($objectId: SuiAddress!, $fieldName: DynamicFieldName!) {
        object(address: $objectId) {
          dynamicField(name: $fieldName) {
            name {
              type {
                repr
              }
              json
              bcs
            }
            value {
              __typename
              ... on MoveValue {
                type {
                  repr
                }
                json
                bcs
              }
              ... on MoveObject {
                hasPublicTransfer
                contents {
                  type {
                    repr
                  }
                  json
                  bcs
                }
              }
            }
          }
        }
      }
    `;

    return this.query(query, { objectId, fieldName }, { showUsage: true });
  }

  /**
   * Build a custom GraphQL query (advanced)
   */
  async custom<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: GraphQLRequestOptions,
  ): Promise<GraphQLResponse<T>> {
    return this.query<T>(query, variables, options);
  }
}

export default SuiGraphQLClient;
