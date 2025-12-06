// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiGraphQLClient } from "../services/graphqlClient";
import {
  EPOCH_QUERY,
  TRANSACTION_BLOCKS_QUERY,
  OBJECT_QUERY,
  COIN_BALANCE_QUERY,
  MOVE_VALUE_FRAGMENT,
  DYNAMIC_FIELD_FRAGMENT,
  DYNAMIC_FIELD_VALUE_FRAGMENT,
} from "../utils/graphqlUtils";

/**
 * Example 1: Get current epoch information
 */
export async function example1_getCurrentEpoch() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const response = await client.getEpoch();
    console.log("Current Epoch:", response.data?.epoch);
    return response.data?.epoch;
  } catch (error) {
    console.error("Error fetching epoch:", error);
  }
}

/**
 * Example 2: Get epoch with custom ID
 */
export async function example2_getEpochById() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const response = await client.getEpoch(100);
    console.log("Epoch 100:", response.data?.epoch);
    return response.data?.epoch;
  } catch (error) {
    console.error("Error fetching epoch:", error);
  }
}

/**
 * Example 3: Paginate transactions with filter
 */
export async function example3_paginateTransactions() {
  const client = new SuiGraphQLClient("testnet");

  try {
    // Get first page
    const response = await client.getTransactionBlocks(
      10, // first: 10
      undefined, // after cursor
      {
        affectedAddress:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
      },
    );

    console.log(
      "First page of transactions:",
      response.data?.transactionBlocks,
    );

    // Get next page if available
    if (response.data?.transactionBlocks?.pageInfo?.hasNextPage) {
      const nextResponse = await client.getTransactionBlocks(
        10,
        response.data.transactionBlocks.pageInfo.endCursor,
        {
          affectedAddress:
            "0x1234567890123456789012345678901234567890123456789012345678901234",
        },
      );

      console.log(
        "Next page of transactions:",
        nextResponse.data?.transactionBlocks,
      );
      return {
        firstPage: response.data?.transactionBlocks,
        nextPage: nextResponse.data?.transactionBlocks,
      };
    }

    return response.data?.transactionBlocks;
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
}

/**
 * Example 4: Get object details
 */
export async function example4_getObjectDetails() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const objectId =
      "0x1234567890123456789012345678901234567890123456789012345678901234";
    const response = await client.getObject(objectId);

    console.log("Object details:", response.data?.object);
    return response.data?.object;
  } catch (error) {
    console.error("Error fetching object:", error);
  }
}

/**
 * Example 5: Get coin balance
 */
export async function example5_getCoinBalance() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const owner =
      "0x1234567890123456789012345678901234567890123456789012345678901234";
    const response = await client.getCoinBalance(owner);

    console.log("Coin balance:", response.data?.owner);
    return response.data?.owner;
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
}

/**
 * Example 6: Get owned objects with pagination
 */
export async function example6_getOwnedObjects() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const owner =
      "0x1234567890123456789012345678901234567890123456789012345678901234";
    const response = await client.getOwnedObjects(owner, 50);

    console.log("Owned objects:", response.data?.owner);
    return response.data?.owner;
  } catch (error) {
    console.error("Error fetching owned objects:", error);
  }
}

/**
 * Example 7: Custom GraphQL query with fragments
 */
export async function example7_customQueryWithFragments() {
  const client = new SuiGraphQLClient("testnet");

  const query = `
    ${MOVE_VALUE_FRAGMENT}
    ${DYNAMIC_FIELD_VALUE_FRAGMENT}
    ${DYNAMIC_FIELD_FRAGMENT}

    query DynamicField {
      object(
        address: "0xb57fba584a700a5bcb40991e1b2e6bf68b0f3896d767a0da92e69de73de226ac"
      ) {
        dynamicField(
          name: {
            type: "0x2::kiosk::Lock",
            bcs: "NLArx1UJguOUYmXgNG8Pv8KbKXLjWtCi6i0Yeq1Vhfw="
          }
        ) {
          ...DynamicFieldSelect
        }
      }
    }
  `;

  try {
    const response = await client.custom(query, undefined, { showUsage: true });
    console.log("Dynamic field query response:", response);
    return response;
  } catch (error) {
    console.error("Error querying dynamic field:", error);
  }
}

/**
 * Example 8: Service configuration with query complexity
 */
export async function example8_getServiceConfig() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const response = await client.getServiceConfig();
    const config = response.data?.serviceConfig;

    console.log("Service Configuration:", {
      maxQueryDepth: config?.maxQueryDepth,
      maxQueryNodes: config?.maxQueryNodes,
      maxOutputNodes: config?.maxOutputNodes,
      maxPageSize: config?.maxPageSize,
      queryTimeout: `${config?.queryTimeoutMs}ms`,
    });

    return config;
  } catch (error) {
    console.error("Error fetching service config:", error);
  }
}

/**
 * Example 9: Data retention information
 */
export async function example9_getDataRetention() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const response = await client.getDataRetention(
      "Query",
      "transactions",
      "affectedAddress",
    );

    console.log(
      "Data retention information:",
      response.data?.serviceConfig?.retention,
    );
    return response.data?.serviceConfig?.retention;
  } catch (error) {
    console.error("Error fetching retention info:", error);
  }
}

/**
 * Example 10: Switch environment and query
 */
export async function example10_switchEnvironment() {
  const client = new SuiGraphQLClient("devnet");

  try {
    console.log("Current endpoint (devnet):", client.getEndpoint());

    // Get epoch from devnet
    const devnetResponse = await client.getEpoch();
    console.log("Devnet epoch:", devnetResponse.data?.epoch?.epochId);

    // Switch to testnet
    client.switchEnvironment("testnet");
    console.log("Switched endpoint (testnet):", client.getEndpoint());

    // Get epoch from testnet
    const testnetResponse = await client.getEpoch();
    console.log("Testnet epoch:", testnetResponse.data?.epoch?.epochId);

    return {
      devnet: devnetResponse.data?.epoch?.epochId,
      testnet: testnetResponse.data?.epoch?.epochId,
    };
  } catch (error) {
    console.error("Error switching environment:", error);
  }
}

/**
 * Example 11: Batch query with Promise.all
 */
export async function example11_batchQuery() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const ownerAddress =
      "0x1234567890123456789012345678901234567890123456789012345678901234";

    const [epoch, balance, objects] = await Promise.all([
      client.getEpoch(),
      client.getCoinBalance(ownerAddress),
      client.getOwnedObjects(ownerAddress, 50),
    ]);

    console.log("Batch query results:", {
      currentEpoch: epoch.data?.epoch?.epochId,
      coinBalance: balance.data?.owner?.balance.totalBalance,
      objectCount: objects.data?.owner?.objects.nodes.length,
    });

    return { epoch: epoch.data, balance: balance.data, objects: objects.data };
  } catch (error) {
    console.error("Error in batch query:", error);
  }
}

/**
 * Example 12: Query with custom headers and usage tracking
 */
export async function example12_queryWithUsageTracking() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const response = await client.getEpoch(undefined);

    const usage = response.extensions?.usage;

    if (usage) {
      console.log("Query Usage:", {
        inputNodes: usage.input.nodes,
        inputDepth: usage.input.depth,
        outputNodes: usage.output.nodes,
        queryPayloadSize: usage.payload.query_payload_size,
      });
    }

    return usage;
  } catch (error) {
    console.error("Error querying with usage:", error);
  }
}

/**
 * Example 13: Handle GraphQL errors gracefully
 */
export async function example13_errorHandling() {
  const client = new SuiGraphQLClient("testnet");

  try {
    // Invalid object ID will cause GraphQL error
    const response = await client.getObject(
      "0x00000000000000000000000000000000",
    );

    if (response.errors) {
      console.error("GraphQL Errors:");
      response.errors.forEach((error) => {
        console.error(`  - ${error.message}`);
      });
      return response.errors;
    }

    return response.data;
  } catch (error) {
    console.error(
      "Fetch Error:",
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Example 14: Pagination backwards
 */
export async function example14_paginateBackwards() {
  const client = new SuiGraphQLClient("testnet");

  try {
    // Get last 10 transactions
    const response = await client.custom(
      `
      query {
        transactionBlocks(last: 10) {
          pageInfo {
            hasPreviousPage
            startCursor
            endCursor
          }
          nodes {
            digest
            timestamp
          }
        }
      }
      `,
      undefined,
      { showUsage: true },
    );

    console.log("Last 10 transactions:", response.data?.transactionBlocks);
    return response.data?.transactionBlocks;
  } catch (error) {
    console.error("Error paginating backwards:", error);
  }
}

/**
 * Example 15: Complex nested query with validators info
 */
export async function example15_validatorsInfo() {
  const client = new SuiGraphQLClient("testnet");

  try {
    const query = `
      query {
        epoch {
          epochId
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
        }
      }
    `;

    const response = await client.custom(query, undefined, { showUsage: true });
    console.log("Validators info:", response.data?.epoch?.validatorSet);
    return response.data?.epoch?.validatorSet;
  } catch (error) {
    console.error("Error fetching validators info:", error);
  }
}
