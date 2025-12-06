// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

export interface GrpcEnvironmentConfig {
  mainnet: {
    endpoint: string;
    port: number;
  };
  testnet: {
    endpoint: string;
    port: number;
  };
  devnet: {
    endpoint: string;
    port: number;
  };
}

export const GRPC_CONFIG: GrpcEnvironmentConfig = {
  mainnet: {
    endpoint: "fullnode.mainnet.sui.io",
    port: 443,
  },
  testnet: {
    endpoint: "fullnode.testnet.sui.io",
    port: 443,
  },
  devnet: {
    endpoint: "fullnode.devnet.sui.io",
    port: 443,
  },
};

/**
 * Obtiene la configuración según el ambiente
 */
export function getGrpcConfig(
  environment: keyof typeof GRPC_CONFIG = "devnet",
): { endpoint: string; port: number } {
  return GRPC_CONFIG[environment];
}

/**
 * Endpoints de SuiNS resolvibles
 */
export const SUIN_S_CONFIG = {
  testnet: "testnet.suins.io",
  devnet: "devnet.suins.io",
  mainnet: "suins.io",
};

/**
 * Tipos de monedas comunes
 */
export const COMMON_COIN_TYPES = {
  SUI: "0x2::sui::SUI",
  USDC: "0x5d4b302506645c34f144ef5b109669ba1b3192f5720338603bdc2bdb51b50882::coin::Coin",
  USDT: "0xc060006111016b8a029ad1c8397dba19c28ff4e6a433d4b5cb3a91b8287dcccf::coin::Coin",
};

/**
 * Direcciones de paquetes del sistema
 */
export const SYSTEM_PACKAGES = {
  SUI_SYSTEM: "0x3",
  CLOCK: "0x6",
  SUI_FRAMEWORK: "0x1",
  STD: "0x1",
};

/**
 * Configuración de limites y paginación
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
};

/**
 * Configuración de timeouts (en ms)
 */
export const TIMEOUT_CONFIG = {
  DEFAULT: 30000, // 30 segundos
  LONG_RUNNING: 60000, // 60 segundos
  STREAMING: 300000, // 5 minutos
};

/**
 * Configuración de reintentos
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 segundo
  MAX_DELAY: 10000, // 10 segundos
  BACKOFF_MULTIPLIER: 2,
};

/**
 * Headers HTTP para requests gRPC
 */
export const GRPC_HEADERS = {
  "Content-Type": "application/grpc+proto",
  "grpc-accept-encoding": "gzip",
};

/**
 * Códigos de error gRPC comunes
 */
export const GRPC_ERROR_CODES = {
  OK: 0,
  CANCELLED: 1,
  UNKNOWN: 2,
  INVALID_ARGUMENT: 3,
  DEADLINE_EXCEEDED: 4,
  NOT_FOUND: 5,
  ALREADY_EXISTS: 6,
  PERMISSION_DENIED: 7,
  RESOURCE_EXHAUSTED: 8,
  FAILED_PRECONDITION: 9,
  ABORTED: 10,
  OUT_OF_RANGE: 11,
  UNIMPLEMENTED: 12,
  INTERNAL: 13,
  UNAVAILABLE: 14,
  DATA_LOSS: 15,
  UNAUTHENTICATED: 16,
};

/**
 * Estados de transacción
 */
export enum TransactionStatus {
  SUCCESS = "success",
  FAILURE = "failure",
  PENDING = "pending",
}

/**
 * Tipos de eventos Move comunes
 */
export const MOVE_EVENT_TYPES = {
  COIN_TRANSFER: "0x2::transfer::Transfer",
  COIN_BURN: "0x2::coin::Coin",
  OBJECT_CREATED: "object::Created",
  OBJECT_DELETED: "object::Deleted",
  PACKAGE_PUBLISHED: "package::Published",
};

/**
 * Validar si una dirección es válida
 */
export function isValidSuiAddress(address: string): boolean {
  // Las direcciones de Sui son hexadecimales de 64 caracteres con prefijo 0x
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Validar si un objeto ID es válido
 */
export function isValidObjectId(objectId: string): boolean {
  return isValidSuiAddress(objectId);
}

/**
 * Formatear una dirección de Sui
 */
export function formatSuiAddress(address: string): string {
  if (!address.startsWith("0x")) {
    return "0x" + address.padStart(64, "0");
  }
  return address.padStart(66, "0"); // 0x + 64 caracteres
}

/**
 * Truncar una dirección para mostrar (ej: 0x1234...5678)
 */
export function truncateSuiAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 2) {
    return address;
  }
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Convertir balance (en unidades más pequeñas) a SUI
 */
export function balanceToSui(
  balance: string | number,
  decimals: number = 9,
): number {
  const num = typeof balance === "string" ? BigInt(balance) : BigInt(balance);
  return Number(num) / Math.pow(10, decimals);
}

/**
 * Convertir SUI a balance (en unidades más pequeñas)
 */
export function suiToBalance(sui: number, decimals: number = 9): bigint {
  return BigInt(Math.floor(sui * Math.pow(10, decimals)));
}

/**
 * Obtener nombre legible para tipo de moneda
 */
export function getCoinTypeName(coinType: string): string {
  const parts = coinType.split("::");
  return parts[parts.length - 1] || coinType;
}

/**
 * Obtener todos los endpoints disponibles
 */
export function getAllGrpcEndpoints(): Array<{
  name: string;
  endpoint: string;
}> {
  return [
    { name: "Mainnet", endpoint: GRPC_CONFIG.mainnet.endpoint },
    { name: "Testnet", endpoint: GRPC_CONFIG.testnet.endpoint },
    { name: "Devnet", endpoint: GRPC_CONFIG.devnet.endpoint },
  ];
}
