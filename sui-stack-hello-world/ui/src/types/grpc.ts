/**
 * Tipos y interfaces para APIs gRPC de Sui
 */

// ==================== Transacciones ====================

export interface TransactionEffects {
  status: {
    status: 'success' | 'failure';
    error?: string;
  };
  executed_epoch: string;
  gas_used: {
    computation_cost: string;
    storage_cost: string;
    storage_rebate: string;
    non_refundable_storage_fee: string;
  };
  modified_at_versions?: Array<[string, string]>;
  shared_objects?: unknown[];
  transaction_digest: string;
  created?: Array<{ object_id: string; version: string }>;
  mutated?: Array<{ object_id: string; version: string }>;
  unwrapped?: Array<{ object_id: string; version: string }>;
  deleted?: string[];
  wrapped?: string[];
  gas_object?: { object_id: string; version: string };
  dependencies?: string[];
}

export interface TransactionEvent {
  type: string;
  package_id: string;
  module: string;
  sender: string;
  data: Record<string, unknown>;
}

export interface Transaction {
  digest: string;
  transaction?: Record<string, unknown>;
  effects?: TransactionEffects;
  events?: TransactionEvent[];
  timestamp_ms?: string;
  confirmed_local_execution?: boolean;
}

// ==================== Objetos ====================

export interface ObjectContent {
  object_id: string;
  version: string;
  digest: string;
  type: string;
  owner: {
    type: 'address_owner' | 'object_owner' | 'shared' | 'immutable';
    value?: string;
  };
  previous_transaction: string;
  storage_rebate: string;
  display?: Record<string, string>;
}

export interface SuiObject {
  bcs?: string;
  content?: ObjectContent;
  object_id: string;
}

// ==================== Balances ====================

export interface CoinBalance {
  coin_type: string;
  coin_object_count: number;
  balance: string;
}

export interface AllBalances {
  coin_balances: CoinBalance[];
  next_page_token?: string;
}

export interface CoinInfo {
  coin_type: string;
  symbol: string;
  name: string;
  description: string;
  decimals: number;
  icon_url?: string;
  supply?: string;
  id?: string;
  owner?: string;
}

// ==================== Checkpoints ====================

export interface CheckpointSummary {
  epoch: string;
  sequence_number: string;
  content_digest: string;
  timestamp: number;
  network_total_transactions: string;
  previous_digest: string;
}

export interface Checkpoint {
  summary?: CheckpointSummary;
  transactions?: Array<{
    digest: string;
    effects_digest?: string;
  }>;
  checkpoint_commitments?: unknown[];
}

// ==================== Paquetes Move ====================

export interface MoveModule {
  file_format_version: number;
  module: {
    name: string;
    functions?: Record<string, MoveFunction>;
    structs?: Record<string, MoveStruct>;
  };
}

export interface MoveFunction {
  visibility: 'public' | 'friend' | 'private';
  is_entry: boolean;
  parameters?: string[];
  return_types?: string[];
  type_parameters?: unknown[];
}

export interface MoveStruct {
  abilities: string[];
  fields: Array<{
    name: string;
    type: string;
  }>;
  type_parameters?: unknown[];
}

export interface MovePackage {
  package_id: string;
  version: string;
  module_map: Record<string, MoveModule>;
}

// ==================== Campos Dinámicos ====================

export interface DynamicField {
  name: {
    type: string;
    value: unknown;
  };
  object_id: string;
  version: string;
  digest: string;
  object_type: string;
}

export interface DynamicFields {
  dynamic_fields: DynamicField[];
  next_page_token?: string;
}

// ==================== SuiNS ====================

export interface SuiNSRecord {
  object_id: string;
  owner: string;
  domain_name: string;
  target_address?: string;
  avatar?: string;
  content_hash?: string;
  expiration_timestamp_ms?: string;
}

// ==================== Respuestas Paginadas ====================

export interface PagedResponse<T> {
  data: T[];
  next_page_token?: string;
  has_next_page: boolean;
}

// ==================== Configuración ====================

export interface GrpcClientConfig {
  endpoint: string;
  port?: number;
  ssl?: boolean;
  timeout?: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  read_mask?: string[];
}

// ==================== Respuestas de Servicio ====================

export interface ServiceInfo {
  version: string;
  chain_id: string;
  checkpoint_height: string;
  lowest_available_checkpoint: string;
  lowest_available_checkpoint_objects: string;
  epoch: string;
  timestamp_ms: string;
  protocol_version: string;
}

// ==================== Errores ====================

export class GrpcError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GrpcError';
  }
}

// ==================== Eventos ====================

export enum EventType {
  MintEvent = 'mint',
  BurnEvent = 'burn',
  TransferEvent = 'transfer',
  MoveEvent = 'move',
  DeleteEvent = 'delete',
  NewObjectEvent = 'new_object',
  MutateObjectEvent = 'mutate_object',
  UnwrapObjectEvent = 'unwrap_object',
  CoinBalanceChangeEvent = 'coin_balance_change',
  ModulePublishEvent = 'module_publish',
}

// ==================== Firma ====================

export interface SignatureVerificationRequest {
  signature: string;
  message_bytes: string;
  public_key: string;
}

export interface SignatureVerificationResult {
  is_valid: boolean;
  error?: string;
}

// ==================== Subscripción ====================

export interface CheckpointStreamMessage {
  cursor: string;
  checkpoint: Checkpoint;
}

export type CheckpointStreamCallback = (message: CheckpointStreamMessage) => void;
export type UnsubscribeFn = () => void;
