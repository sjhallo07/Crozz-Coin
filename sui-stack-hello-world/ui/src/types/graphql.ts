/**
 * Sui GraphQL Response Types
 * Type definitions for GraphQL API responses
 */

// ============================================================================
// Scalar Types
// ============================================================================

export type SuiAddress = string;
export type Base64 = string;
export type DateTime = string;
export type Int64 = string;
export type UInt64 = string;
export type BigInt = string;

// ============================================================================
// Enum Types
// ============================================================================

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum ObjectStatus {
  ACTIVE = 'ACTIVE',
  WRAPPED = 'WRAPPED',
  DELETED = 'DELETED',
}

export enum OwnerType {
  ADDRESS = 'AddressOwner',
  OBJECT = 'ObjectOwner',
  SHARED = 'Shared',
  IMMUTABLE = 'Immutable',
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Connection<T> {
  pageInfo: PageInfo;
  nodes: T[];
  edges?: Edge<T>[];
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

// ============================================================================
// Address Owner Types
// ============================================================================

export interface Address {
  address: SuiAddress;
}

export interface AddressOwner {
  __typename: 'AddressOwner';
  owner: Address;
}

export interface ObjectOwner {
  __typename: 'ObjectOwner';
  owner: Address;
}

export interface SharedOwner {
  __typename: 'Shared';
  initialSharedVersion: string;
}

export interface ImmutableOwner {
  __typename: 'Immutable';
}

export type Owner = AddressOwner | ObjectOwner | SharedOwner | ImmutableOwner;

// ============================================================================
// Move Types
// ============================================================================

export interface MoveType {
  repr: string;
}

export interface MoveValue {
  __typename: 'MoveValue';
  type: MoveType;
  json: any;
  bcs: Base64;
}

export interface MoveObject {
  __typename: 'MoveObject';
  hasPublicTransfer: boolean;
  contents: MoveValue;
}

export type DynamicFieldValue = MoveValue | MoveObject;

export interface DynamicFieldName {
  type: string;
  bcs: Base64;
}

export interface DynamicField {
  name: DynamicFieldName;
  value: DynamicFieldValue;
}

// ============================================================================
// Object Types
// ============================================================================

export interface SuiObject {
  address: SuiAddress;
  version: string;
  digest: string;
  objectId: SuiAddress;
  storageRebate: string;
  owner: Owner;
  previousTransactionBlock?: {
    digest: string;
  };
  status: ObjectStatus;
  asMoveObject?: {
    contents: MoveValue;
    hasPublicTransfer: boolean;
  };
}

// ============================================================================
// Coin Types
// ============================================================================

export interface Coin {
  address: SuiAddress;
  coinBalance: string;
  coinObjectCount: string;
}

export interface CoinBalance {
  coinObjectCount: string;
  totalBalance: string;
}

export interface OwnerCoins {
  coins: Connection<Coin>;
  balance: CoinBalance;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface GasEffects {
  gasObject: {
    address: SuiAddress;
  };
}

export interface Effects {
  status: TransactionStatus;
  gasEffects: GasEffects;
}

export interface GasInput {
  gasPrice: string;
  gasBudget: string;
}

export interface TransactionKind {
  __typename: string;
}

export interface TransactionBlock {
  digest: string;
  sender: Address;
  timestamp: DateTime;
  kind: TransactionKind;
  effects: Effects;
  gasInput: GasInput;
}

export interface TransactionBlockConnection extends Connection<TransactionBlock> {
  nodes: TransactionBlock[];
  pageInfo: PageInfo;
}

// ============================================================================
// Epoch Types
// ============================================================================

export interface ValidatorInfo {
  name: string;
  address: SuiAddress;
  stakingPoolActivationEpoch: string;
}

export interface ValidatorSet {
  activeValidators: ValidatorInfo[];
}

export interface ProtocolConfigs {
  featureFlags: Record<string, boolean>;
}

export interface Epoch {
  epochId: string;
  referenceGasPrice: string;
  startTimestamp: DateTime;
  endTimestamp: DateTime;
  validatorSet: ValidatorSet;
  protocolConfigs: ProtocolConfigs;
}

// ============================================================================
// Service Config Types
// ============================================================================

export interface CheckpointRange {
  first?: {
    sequenceNumber: string;
  };
  last?: {
    sequenceNumber: string;
  };
}

export interface RetentionInfo {
  type: string;
  field: string;
  filter?: string;
  range?: CheckpointRange;
}

export interface ServiceConfig {
  maxQueryDepth: number;
  maxQueryNodes: number;
  maxOutputNodes: number;
  defaultPageSize: number;
  maxPageSize: number;
  queryTimeoutMs: number;
  maxQueryPayloadSize: number;
  maxTypeArgumentDepth: number;
  maxTypeArgumentWidth: number;
  maxTypeNodes: number;
  maxMoveValueDepth: number;
  retention?: (type: string, field: string, filter?: string) => RetentionInfo;
}

// ============================================================================
// Usage Information (Extensions)
// ============================================================================

export interface QueryUsage {
  input: {
    nodes: number;
    depth: number;
  };
  payload: {
    query_payload_size: number;
    tx_payload_size: number;
  };
  output: {
    nodes: number;
  };
}

export interface ResponseExtensions {
  usage?: QueryUsage;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface TransactionBlockFilter {
  affectedAddress?: SuiAddress;
  fromAddress?: SuiAddress;
  toAddress?: SuiAddress;
  sentAddress?: SuiAddress;
  receivedAddress?: SuiAddress;
}

// ============================================================================
// Response Types
// ============================================================================

export interface GraphQLQueryResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: (string | number)[];
  }>;
  extensions?: ResponseExtensions;
}
