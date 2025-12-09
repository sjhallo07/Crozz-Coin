import { Transaction } from "@mysten/sui/transactions";

type ObjectId = string;

/**
 * Helpers de construcción de PTBs inspirados en los ejemplos oficiales.
 * Ajusta los targets a tu módulo real; si falta packageId, no se agrega la call.
 */

// Versión simple (coincide con el uso en AppExamplesHub: swapCap + coin object)
export type TrustlessSwapTakeParams = {
  packageId: string;
  swapCap: ObjectId;
  coinIn: ObjectId;
  expectedOut: bigint | number;
  recipient: string;
};

export function buildTrustlessSwapTake(tx: Transaction, params: TrustlessSwapTakeParams) {
  const { packageId, swapCap, coinIn, expectedOut, recipient } = params;
  if (!packageId) return;
  tx.moveCall({
    target: `${packageId}::swap::take`,
    arguments: [tx.object(swapCap), tx.object(coinIn), tx.pure.u64(expectedOut), tx.pure.address(recipient)],
  });
}

// Versión con typeArguments (basada en swap trustless tipado)
export type TrustlessSwapTypedParams = {
  packageId: string;
  poolId: string;
  coinInType: string;
  coinOutType: string;
  amountIn: bigint | number;
  minAmountOut: bigint | number;
  recipient: string;
};

export function buildTrustlessSwap(tx: Transaction, p: TrustlessSwapTypedParams) {
  if (!p.packageId) return;
  tx.moveCall({
    target: `${p.packageId}::swap::trustless_swap`,
    typeArguments: [p.coinInType, p.coinOutType],
    arguments: [
      tx.object(p.poolId),
      tx.pure.u64(p.amountIn),
      tx.pure.u64(p.minAmountOut),
      tx.pure.address(p.recipient),
    ],
  });
}

// Distributed Counter
export function buildDistributedCounterCreate(tx: Transaction, packageId: string) {
  if (!packageId) return;
  tx.moveCall({ target: `${packageId}::counter::create`, arguments: [] });
}

export function buildDistributedCounterIncrement(tx: Transaction, params: {
  packageId: string;
  counterId: ObjectId;
}) {
  const { packageId, counterId } = params;
  if (!packageId) return;
  tx.moveCall({ target: `${packageId}::counter::increment`, arguments: [tx.object(counterId)] });
}

// Tic-Tac-Toe (shared)
export function buildTicTacToeCreateShared(tx: Transaction, params: {
  packageId: string;
  playerX: string;
  playerO: string;
}) {
  const { packageId, playerO, playerX } = params;
  if (!packageId) return;
  tx.moveCall({ target: `${packageId}::shared::new`, arguments: [tx.pure.address(playerX), tx.pure.address(playerO)] });
}

export function buildTicTacToePlaceMark(tx: Transaction, params: {
  packageId: string;
  gameId: ObjectId;
  row: number;
  col: number;
}) {
  const { packageId, gameId, row, col } = params;
  if (!packageId) return;
  tx.moveCall({
    target: `${packageId}::shared::place_mark`,
    arguments: [tx.object(gameId), tx.pure.u8(row), tx.pure.u8(col)],
  });
}

// Weather Oracle (usa u64 para temperatura * 100)
export function buildWeatherOracleUpdate(tx: Transaction, params: {
  packageId: string;
  oracleId: ObjectId;
  city: string;
  tempC: number;
  condition: string;
}) {
  const { packageId, oracleId, city, tempC, condition } = params;
  if (!packageId) return;
  const tempScaled = BigInt(Math.trunc(tempC * 100));
  tx.moveCall({
    target: `${packageId}::weather::update_city`,
    arguments: [tx.object(oracleId), tx.pure.string(city), tx.pure.u64(tempScaled), tx.pure.string(condition)],
  });
}

export const sdkHelpers = {
  buildTrustlessSwapTake,
  buildTrustlessSwap,
  buildDistributedCounterCreate,
  buildDistributedCounterIncrement,
  buildTicTacToeCreateShared,
  buildTicTacToePlaceMark,
  buildWeatherOracleUpdate,
};
