// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import SuiGrpcClient from "../services/grpcClient";
import { FIELD_MASK_PRESETS } from "../utils/fieldMask";

const GRPC_ENDPOINT =
  process.env.REACT_APP_GRPC_ENDPOINT || "fullnode.devnet.sui.io";

class SuiGrpcExamples {
  private client: SuiGrpcClient;

  constructor(endpoint: string = GRPC_ENDPOINT) {
    this.client = new SuiGrpcClient({ endpoint });
  }

  /**
   * Ejemplo 1: Obtener información de una transacción completa
   */
  async getTransactionDetails(digest: string): Promise<void> {
    try {
      console.log(`📝 Obteniendo transacción ${digest}...`);
      const tx = await this.client.getTransaction(digest);
      console.log("Transacción:", tx);

      if (tx.effects) {
        console.log("Status:", (tx.effects as Record<string, unknown>).status);
        console.log(
          "Gas usado:",
          (tx.effects as Record<string, unknown>).gas_used,
        );
      }

      if (tx.events) {
        console.log("Eventos:", (tx.events as unknown[]).length);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 2: Obtener todos los balances de una dirección
   */
  async getUserBalances(address: string): Promise<void> {
    try {
      console.log(`💰 Obteniendo balances para ${address}...`);
      const balances = await this.client.getAllCoinBalances(address);
      console.log("Balances:", balances);

      // Agrupar por tipo de moneda
      if (balances && "coin_balances" in balances) {
        const coinBalances = balances.coin_balances as Array<{
          coin_type: string;
          balance: string;
          coin_object_count: number;
        }>;

        console.log("Resumen de balances:");
        coinBalances.forEach((cb) => {
          console.log(
            `  ${cb.coin_type}: ${cb.balance} (${cb.coin_object_count} monedas)`,
          );
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 3: Listar todos los objetos poseídos por una dirección
   */
  async listUserObjects(address: string, pageSize: number = 50): Promise<void> {
    try {
      console.log(`📦 Listando objetos de ${address}...`);
      const result = await this.client.listOwnedObjects(address, pageSize);
      console.log("Objetos:", result);

      if (result && "objects" in result) {
        const objects = result.objects as Array<{
          object_id: string;
          version: string;
        }>;
        console.log(`Total de objetos (primera página): ${objects.length}`);

        // Mostrar primeros 5
        objects.slice(0, 5).forEach((obj) => {
          console.log(
            `  - ${(obj as Record<string, unknown>).object_id} (v${(obj as Record<string, unknown>).version})`,
          );
        });

        if ("next_page_token" in result && result.next_page_token) {
          console.log("Hay más páginas disponibles...");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 4: Obtener información detallada de un objeto
   */
  async getObjectDetails(objectId: string): Promise<void> {
    try {
      console.log(`🔍 Obteniendo detalles del objeto ${objectId}...`);
      const obj = await this.client.getObject(objectId);
      console.log("Objeto:", obj);

      if (obj && "content" in obj) {
        const content = obj.content as Record<string, unknown>;
        console.log("Tipo:", content.type);
        console.log("Propietario:", content.owner);
        console.log("Versión:", content.version);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 5: Simular una transacción antes de enviarla
   */
  async simulateTransaction(
    txBytes: string,
    signerAddress: string,
  ): Promise<void> {
    try {
      console.log("🧪 Simulando transacción...");
      const result = await this.client.dryRunTransaction(
        txBytes,
        signerAddress,
      );
      console.log("Resultado de simulación:", result);

      if (result && "effects" in result) {
        const effects = result.effects as Record<string, unknown>;
        console.log("Estado:", effects.status);

        if ("gas_used" in effects) {
          const gasUsed = effects.gas_used as Record<string, unknown>;
          console.log(
            `Gas estimado: ${gasUsed.computation_cost} (computación) + ${gasUsed.storage_cost} (almacenamiento)`,
          );
        }
      }

      if ("events" in result) {
        const events = result.events as unknown[];
        console.log(`Eventos emitidos: ${events.length}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 6: Explorar un paquete Move
   */
  async explorePackage(packageId: string): Promise<void> {
    try {
      console.log(`📚 Explorando paquete ${packageId}...`);
      const pkg = await this.client.getMovePackage(packageId);
      console.log("Paquete:", pkg);

      if (pkg && "module" in pkg) {
        const modules = pkg.module as Record<string, unknown>;
        console.log(`Módulos encontrados: ${Object.keys(modules).length}`);

        Object.keys(modules).forEach((moduleName) => {
          console.log(`  - ${moduleName}`);
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 7: Resolver un nombre SuiNS
   */
  async resolveSuiName(name: string): Promise<void> {
    try {
      console.log(`🏷️ Resolviendo nombre SuiNS: ${name}...`);
      const record = await this.client.resolveSuiNSName(name);
      console.log("Registro SuiNS:", record);

      if (record) {
        console.log(`Propietario:`, record);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 8: Obtener información de moneda
   */
  async getCoinMetadata(coinType: string): Promise<void> {
    try {
      console.log(`💎 Obteniendo metadata de ${coinType}...`);
      const info = await this.client.getCoinInfo(coinType);
      console.log("Información de moneda:", info);

      if (info) {
        console.log("Símbolo:", (info as Record<string, unknown>).symbol);
        console.log("Nombre:", (info as Record<string, unknown>).name);
        console.log("Decimales:", (info as Record<string, unknown>).decimals);
        console.log("Suministro:", (info as Record<string, unknown>).supply);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 9: Obtener información de checkpoint
   */
  async getCheckpointInfo(sequenceNumber: string): Promise<void> {
    try {
      console.log(`📊 Obteniendo checkpoint ${sequenceNumber}...`);
      const checkpoint = await this.client.getCheckpoint(sequenceNumber);
      console.log("Checkpoint:", checkpoint);

      if (checkpoint && "summary" in checkpoint) {
        const summary = checkpoint.summary as Record<string, unknown>;
        console.log("Timestamp:", summary.timestamp);
        console.log("Transacciones:", summary.network_total_transactions);
        console.log("Epoch:", summary.epoch);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 10: Obtener información de servicio
   */
  async getServiceInfo(): Promise<void> {
    try {
      console.log("ℹ️ Obteniendo información del servidor gRPC...");
      const info = await this.client.getServiceInfo();
      console.log("Información del servidor:", info);

      console.log(`Versión:`, info);
      console.log(`Cadena:`, info);
      console.log(`Punto de control más bajo:`, info);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 11: Obtener múltiples objetos en lote
   */
  async batchGetObjects(objectIds: string[]): Promise<void> {
    try {
      console.log(`📦 Obteniendo ${objectIds.length} objetos en lote...`);
      const result = await this.client.batchGetObjects(objectIds);
      console.log("Objetos obtenidos:", result);

      if (result && "objects" in result) {
        const objects = result.objects as unknown[];
        console.log(`Objetos exitosos: ${objects.length}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 12: Obtener múltiples transacciones en lote
   */
  async batchGetTransactions(digests: string[]): Promise<void> {
    try {
      console.log(`📝 Obteniendo ${digests.length} transacciones en lote...`);
      const result = await this.client.batchGetTransactions(digests);
      console.log("Transacciones obtenidas:", result);

      if (result && "transactions" in result) {
        const transactions = result.transactions as unknown[];
        console.log(`Transacciones exitosas: ${transactions.length}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 13: Listar campos dinámicos de un objeto
   */
  async listDynamicFieldsExample(parentId: string): Promise<void> {
    try {
      console.log(`🔗 Listando campos dinámicos de ${parentId}...`);
      const result = await this.client.listDynamicFields(parentId);
      console.log("Campos dinámicos:", result);

      if (result && "dynamic_fields" in result) {
        const fields = result.dynamic_fields as Array<{
          name: string;
          type: string;
        }>;
        console.log(`Total de campos: ${fields.length}`);
        fields.forEach((field) => {
          console.log(
            `  - ${(field as Record<string, unknown>).name}: ${(field as Record<string, unknown>).type}`,
          );
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /**
   * Ejemplo 14: Suscribirse a actualizaciones en tiempo real
   */
  async subscribeToCheckpoints(): Promise<void> {
    try {
      console.log("📡 Suscribiéndose a actualizaciones de checkpoints...");

      let count = 0;
      const unsubscribe = await this.client.subscribeCheckpoints(
        (checkpoint) => {
          count++;
          console.log(
            `Checkpoint #${count}:`,
            (checkpoint as Record<string, unknown>).sequence_number,
          );

          // Desuscribirse después de 5 checkpoints
          if (count >= 5) {
            console.log("Deteniendo suscripción...");
            unsubscribe();
          }
        },
        ["sequence_number", "digest", "summary.timestamp"],
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

export default SuiGrpcExamples;

// Exportar función para usar en pruebas
export async function runAllExamples(endpoint?: string) {
  const examples = new SuiGrpcExamples(endpoint);

  // Ejemplos que requieren datos reales (descomenta según necesites)
  // await examples.getServiceInfo();
  // await examples.getCoinMetadata('0x2::sui::SUI');
  // await examples.getUserBalances('0x...');
  // await examples.listUserObjects('0x...');
  // await examples.subscribeToCheckpoints();
}
