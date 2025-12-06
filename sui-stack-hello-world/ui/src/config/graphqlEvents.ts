/**
 * Sui GraphQL Event Query Examples
 * Early-stage feature for querying events using GraphQL
 * Based on: https://docs.sui.io/guides/developer/sui-101/using-events
 */

// ============================================================================
// GRAPHQL QUERY STRINGS
// ============================================================================

/**
 * GraphQL query: Get all events of a specific type
 */
export const QUERY_EVENTS_BY_TYPE = `
{
  events(
    filter: {
      eventType: "0x3164fcf73eb6b41ff3d2129346141bd68469964c2d95a5b1533e8d16e6ea6e13::Market::ChangePriceEvent<0x2::sui::SUI>"
    }
  ) {
    nodes {
      sendingModule {
        name
        package { digest }
      }
      sender {
        address
      }
      timestamp
      contents {
        type {
          repr
        }
        json
      }
      bcs
    }
  }
}
`;

/**
 * GraphQL query: Filter events by sender with pagination
 */
export const QUERY_EVENTS_BY_SENDER = `
query ByTxSender {
  events(
    first: 10
    filter: {
      sender: "0xdff57c401e125a7e0e06606380560b459a179aacd08ed396d0162d57dbbdadfb"
    }
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      sendingModule {
        name
      }
      contents {
        type {
          repr
        }
        json
      }
      sender {
        address
      }
      timestamp
      bcs
    }
  }
}
`;

/**
 * GraphQL query: Get events by package
 */
export const QUERY_EVENTS_BY_PACKAGE = `
{
  events(
    filter: {
      sendingModule: {
        package: "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05"
      }
    }
  ) {
    nodes {
      sendingModule {
        name
        package { digest }
      }
      sender {
        address
      }
      timestamp
      contents {
        type {
          repr
        }
        json
      }
    }
  }
}
`;

/**
 * GraphQL query: Get events with complex filtering
 */
export const QUERY_EVENTS_COMPLEX_FILTER = `
{
  events(
    first: 20
    after: "cursor-value"
    filter: {
      eventType: "0xdee9::clob_v2::OrderFilled<0x2::sui::SUI, 0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN>"
    }
  ) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    nodes {
      sendingModule {
        name
        package { digest }
      }
      sender {
        address
      }
      timestamp
      contents {
        type {
          repr
        }
        json
      }
      bcs
    }
    totalCount
  }
}
`;

// ============================================================================
// CROZZ SPECIFIC GRAPHQL QUERIES
// ============================================================================

/**
 * GraphQL query: Get all lock events for a package
 */
export const QUERY_CROZZ_LOCK_EVENTS = (packageId: string) => `
{
  events(
    filter: {
      sendingModule: {
        package: "${packageId}"
        moduleName: "lock"
      }
    }
  ) {
    nodes {
      sendingModule {
        name
      }
      sender {
        address
      }
      timestamp
      contents {
        json
      }
    }
  }
}
`;

/**
 * GraphQL query: Get all escrow/trade events
 */
export const QUERY_CROZZ_ESCROW_EVENTS = (packageId: string) => `
{
  events(
    filter: {
      sendingModule: {
        package: "${packageId}"
        moduleName: "shared"
      }
    }
  ) {
    nodes {
      sendingModule {
        name
      }
      sender {
        address
      }
      timestamp
      contents {
        type {
          repr
        }
        json
      }
    }
  }
}
`;

/**
 * GraphQL query: Get game events for a specific player
 */
export const QUERY_CROZZ_PLAYER_GAME_EVENTS = (packageId: string, playerAddress: string) => `
{
  events(
    filter: {
      sendingModule: {
        package: "${packageId}"
        moduleName: "game"
      }
      sender: "${playerAddress}"
    }
  ) {
    nodes {
      sender {
        address
      }
      timestamp
      contents {
        type {
          repr
        }
        json
      }
    }
  }
}
`;

/**
 * GraphQL query: Get recent events with order field
 */
export const QUERY_RECENT_EVENTS = `
{
  events(
    first: 50
    orderBy: TIMESTAMP_DESC
  ) {
    nodes {
      sendingModule {
        name
        package { digest }
      }
      sender {
        address
      }
      timestamp
      contents {
        type {
          repr
        }
        json
      }
    }
  }
}
`;

// ============================================================================
// TYPESCRIPT GRAPHQL CLIENT UTILITIES
// ============================================================================

/**
 * Utility types for GraphQL event responses
 */
export interface GraphQLEventNode {
  sendingModule: {
    name: string;
    package?: { digest: string };
  };
  sender: {
    address: string;
  };
  timestamp: string;
  contents: {
    type?: { repr: string };
    json: Record<string, any>;
  };
  bcs?: string;
}

export interface GraphQLPageInfo {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
  endCursor: string;
}

export interface GraphQLEventsResponse {
  events: {
    pageInfo: GraphQLPageInfo;
    nodes: GraphQLEventNode[];
    totalCount?: number;
  };
}

/**
 * TypeScript GraphQL client for querying events
 */
export class SuiGraphQLEventClient {
  private endpoint: string;

  constructor(endpoint: string = "https://graphql-mainnet.sui.io") {
    this.endpoint = endpoint;
  }

  /**
   * Execute a GraphQL query
   */
  async query<T>(query: string): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }

  /**
   * Query events by type
   */
  async queryEventsByType(eventType: string): Promise<GraphQLEventNode[]> {
    const query = `
    {
      events(
        filter: {
          eventType: "${eventType}"
        }
      ) {
        nodes {
          sendingModule {
            name
            package { digest }
          }
          sender {
            address
          }
          timestamp
          contents {
            type {
              repr
            }
            json
          }
        }
      }
    }
    `;

    const response = await this.query<GraphQLEventsResponse>(query);
    return response.events.nodes;
  }

  /**
   * Query events by sender address
   */
  async queryEventsBySender(sender: string, limit: number = 10): Promise<GraphQLEventNode[]> {
    const query = `
    {
      events(
        first: ${limit}
        filter: {
          sender: "${sender}"
        }
      ) {
        nodes {
          sendingModule {
            name
          }
          sender {
            address
          }
          timestamp
          contents {
            type {
              repr
            }
            json
          }
        }
      }
    }
    `;

    const response = await this.query<GraphQLEventsResponse>(query);
    return response.events.nodes;
  }

  /**
   * Query events by module
   */
  async queryEventsByModule(
    packageId: string,
    moduleName: string,
    limit: number = 10
  ): Promise<GraphQLEventNode[]> {
    const query = `
    {
      events(
        first: ${limit}
        filter: {
          sendingModule: {
            package: "${packageId}"
            moduleName: "${moduleName}"
          }
        }
      ) {
        nodes {
          sendingModule {
            name
          }
          sender {
            address
          }
          timestamp
          contents {
            type {
              repr
            }
            json
          }
        }
      }
    }
    `;

    const response = await this.query<GraphQLEventsResponse>(query);
    return response.events.nodes;
  }

  /**
   * Query events with pagination
   */
  async queryEventsWithPagination(
    filter: string,
    limit: number = 10,
    after?: string
  ): Promise<{
    nodes: GraphQLEventNode[];
    pageInfo: GraphQLPageInfo;
  }> {
    const afterClause = after ? `after: "${after}"` : "";

    const query = `
    {
      events(
        first: ${limit}
        ${afterClause}
        filter: {
          ${filter}
        }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          sendingModule {
            name
          }
          sender {
            address
          }
          timestamp
          contents {
            type {
              repr
            }
            json
          }
        }
      }
    }
    `;

    const response = await this.query<GraphQLEventsResponse>(query);
    return {
      nodes: response.events.nodes,
      pageInfo: response.events.pageInfo,
    };
  }
}

// ============================================================================
// GRAPHQL SUBSCRIPTION UTILITIES
// ============================================================================

/**
 * GraphQL Subscription example for real-time event streaming
 * Note: This is a conceptual example - actual implementation depends on server support
 */
export const SUBSCRIPTION_EVENTS_REALTIME = `
subscription OnNewEvents {
  events(
    filter: {
      eventType: "0x3164fcf73eb6b41ff3d2129346141bd68469964c2d95a5b1533e8d16e6ea6e13::Market::ChangePriceEvent"
    }
  ) {
    node {
      sendingModule {
        name
      }
      sender {
        address
      }
      timestamp
      contents {
        json
      }
    }
  }
}
`;

/**
 * WebSocket-based real-time event listener
 */
export class SuiGraphQLEventSubscriber {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, (event: GraphQLEventNode) => void> = new Map();

  constructor(wsUrl: string = "wss://graphql-mainnet.sui.io/ws") {
    this.url = wsUrl;
  }

  /**
   * Connect to the GraphQL WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("[SuiGraphQLEventSubscriber] Connected to WebSocket");
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error("[SuiGraphQLEventSubscriber] WebSocket error:", error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribeToEventType(
    eventType: string,
    handler: (event: GraphQLEventNode) => void
  ): string {
    const subscriptionId = `sub_${Date.now()}`;
    this.handlers.set(subscriptionId, handler);

    const message = {
      type: "start",
      payload: {
        query: `
        subscription {
          events(filter: { eventType: "${eventType}" }) {
            node {
              sendingModule { name package { digest } }
              sender { address }
              timestamp
              contents { type { repr } json }
            }
          }
        }
        `,
      },
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    this.handlers.delete(subscriptionId);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      if (message.type === "data" && message.payload?.data?.events) {
        const event = message.payload.data.events.node as GraphQLEventNode;

        // Call all registered handlers
        for (const handler of this.handlers.values()) {
          handler(event);
        }
      }
    } catch (error) {
      console.error("[SuiGraphQLEventSubscriber] Error handling message:", error);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log("[SuiGraphQLEventSubscriber] Disconnected");
    }
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Complete event querying workflow
 */
export const exampleEventQueryingWorkflow = {
  title: "Complete Event Querying Workflow",
  description: "Full example of setting up event queries with GraphQL",
  code: `
// Create GraphQL client
const graphqlClient = new SuiGraphQLEventClient("https://graphql-mainnet.sui.io");

// Query events by type
const lockEvents = await graphqlClient.queryEventsByType(
  "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05::lock::LockCreated"
);

console.log("Lock events:", lockEvents);

// Query events by sender
const playerEvents = await graphqlClient.queryEventsBySender(
  "0x8b35e67a519fffa11a9c74f169228ff1aa085f3a3d57710af08baab8c02211b9"
);

console.log("Player events:", playerEvents);

// Query with pagination
let cursor: string | undefined;
let allEvents: GraphQLEventNode[] = [];

while (true) {
  const result = await graphqlClient.queryEventsWithPagination(
    \`eventType: "0x...::event::EventName"\`,
    10,
    cursor
  );

  allEvents = allEvents.concat(result.nodes);

  if (!result.pageInfo.hasNextPage) break;
  cursor = result.pageInfo.endCursor;
}

console.log(\`Retrieved \${allEvents.length} events\`);

// Subscribe to real-time events
const subscriber = new SuiGraphQLEventSubscriber();
await subscriber.connect();

subscriber.subscribeToEventType(
  "0x158f2027f60c89bb91526d9bf08831d27f5a0fcb0f74e6698b9f0e1fb2be5d05::game::GameFinished",
  (event) => {
    console.log("New game finished event:", event.contents.json);
  }
);
  `
};

export default {
  QUERY_EVENTS_BY_TYPE,
  QUERY_EVENTS_BY_SENDER,
  QUERY_EVENTS_BY_PACKAGE,
  QUERY_EVENTS_COMPLEX_FILTER,
  QUERY_CROZZ_LOCK_EVENTS,
  QUERY_CROZZ_ESCROW_EVENTS,
  QUERY_CROZZ_PLAYER_GAME_EVENTS,
  QUERY_RECENT_EVENTS,
  SuiGraphQLEventClient,
  SuiGraphQLEventSubscriber,
};
