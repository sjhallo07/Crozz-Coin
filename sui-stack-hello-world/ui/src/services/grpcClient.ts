/**
 * gRPC Client Service para Sui Full Node
 * Proporciona acceso a todas las APIs de gRPC disponibles
 */

interface GrpcConfig {
  endpoint: string;
  port?: number;
  ssl?: boolean;
}

class SuiGrpcClient {
  private endpoint: string;
  private port: number;
  private ssl: boolean;

  constructor(config: GrpcConfig) {
    this.endpoint = config.endpoint;
    this.port = config.port || 443;
    this.ssl = config.ssl !== false;
  }

  private getUrl(): string {
    const protocol = this.ssl ? 'https' : 'http';
    return `${protocol}://${this.endpoint}:${this.port}`;
  }

  /**
   * Realiza una llamada gRPC genérica usando fetch
   */
  private async grpcCall<T>(
    service: string,
    method: string,
    request: Record<string, unknown>,
    readMask?: string[]
  ): Promise<T> {
    const payload = {
      ...request,
      ...(readMask && { read_mask: { paths: readMask } }),
    };

    const response = await fetch(`${this.getUrl()}/${service}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc+proto',
        'grpc-accept-encoding': 'gzip',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `gRPC call failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  // ==================== TransactionExecutionService ====================

  /**
   * Envía y ejecuta una transacción firmada
   */
  async executeTransaction(
    txBytes: string,
    signatures: string[]
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.TransactionExecutionService', 'ExecuteTransaction', {
      transaction_bytes: txBytes,
      signatures,
    });
  }

  /**
   * Simula una transacción sin ejecutarla
   */
  async simulateTransaction(
    txBytes: string,
    signerAddress: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.TransactionExecutionService', 'SimulateTransaction', {
      transaction_bytes: txBytes,
      signer_address: signerAddress,
    }, ['effects', 'events']);
  }

  // ==================== LedgerService ====================

  /**
   * Obtiene información de un checkpoint específico
   */
  async getCheckpoint(sequenceNumber: string): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'GetCheckpoint', {
      sequence_number: sequenceNumber,
    }, ['transactions', 'summary']);
  }

  /**
   * Obtiene las transacciones en un checkpoint
   */
  async getCheckpointTransactions(
    sequenceNumber: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'GetCheckpoint', {
      sequence_number: sequenceNumber,
    }, ['transactions']);
  }

  /**
   * Obtiene una transacción específica por digest
   */
  async getTransaction(digest: string): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'GetTransaction', {
      digest,
    }, ['effects', 'events']);
  }

  /**
   * Obtiene un objeto específico
   */
  async getObject(objectId: string): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'GetObject', {
      object_id: objectId,
    }, ['bcs', 'content']);
  }

  /**
   * Obtiene información de la época actual
   */
  async getCurrentEpoch(): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'GetEpoch', {
      epoch_id: 'latest',
    });
  }

  /**
   * Obtiene información de servicio (versión, cadena, etc.)
   */
  async getServiceInfo(): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'GetServiceInfo', {});
  }

  /**
   * Obtiene múltiples transacciones en lote
   */
  async batchGetTransactions(digests: string[]): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'BatchGetTransactions', {
      digests,
    }, ['effects', 'events']);
  }

  /**
   * Obtiene múltiples objetos en lote
   */
  async batchGetObjects(objectIds: string[]): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.LedgerService', 'BatchGetObjects', {
      object_ids: objectIds,
    }, ['bcs']);
  }

  // ==================== StateService ====================

  /**
   * Obtiene el saldo de un tipo de moneda para una dirección
   */
  async getCoinBalance(
    owner: string,
    coinType: string = '0x2::sui::SUI'
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.StateService', 'GetCoinBalance', {
      owner,
      coin_type: coinType,
    });
  }

  /**
   * Obtiene los balances de todos los tipos de monedas para una dirección
   */
  async getAllCoinBalances(owner: string): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.StateService', 'GetAllCoinBalances', {
      owner,
    });
  }

  /**
   * Obtiene información de un tipo de moneda
   */
  async getCoinInfo(coinType: string): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.StateService', 'GetCoinInfo', {
      coin_type: coinType,
    });
  }

  /**
   * Lista los objetos poseídos por una dirección
   */
  async listOwnedObjects(
    owner: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.StateService', 'ListOwnedObjects', {
      owner,
      page_size: pageSize || 50,
      page_token: pageToken,
    });
  }

  /**
   * Lista los campos dinámicos de un objeto
   */
  async listDynamicFields(
    parent: string,
    pageSize?: number,
    pageToken?: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.StateService', 'ListDynamicFields', {
      parent,
      page_size: pageSize || 50,
      page_token: pageToken,
    });
  }

  /**
   * Obtiene un campo dinámico específico
   */
  async getDynamicFieldObject(
    parentId: string,
    name: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.StateService', 'GetDynamicFieldObject', {
      parent_id: parentId,
      name,
    });
  }

  /**
   * Simula una transacción en el estado actual
   */
  async dryRunTransaction(
    txBytes: string,
    signerAddress: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.StateService', 'DryRunTransaction', {
      transaction_bytes: txBytes,
      signer_address: signerAddress,
    }, ['effects', 'events']);
  }

  // ==================== SubscriptionService ====================

  /**
   * Se suscribe a actualizaciones de checkpoints en tiempo real
   * Nota: Requiere WebSocket, no está completamente implementado aquí
   */
  async subscribeCheckpoints(
    onCheckpoint: (checkpoint: Record<string, unknown>) => void,
    readMask?: string[]
  ): Promise<() => void> {
    const wsUrl = this.getUrl()
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');

    const ws = new WebSocket(wsUrl);

    const subscribe = {
      service: 'sui.rpc.v2.SubscriptionService',
      method: 'SubscribeCheckpoints',
      request: {
        read_mask: { paths: readMask || ['*'] },
      },
    };

    ws.onopen = () => {
      ws.send(JSON.stringify(subscribe));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.checkpoint) {
          onCheckpoint(data.checkpoint);
        }
      } catch (error) {
        console.error('Error parsing checkpoint message:', error);
      }
    };

    // Retorna función para desuscribirse
    return () => {
      ws.close();
    };
  }

  // ==================== MovePackageService ====================

  /**
   * Obtiene el contenido de un paquete Move
   */
  async getMovePackage(packageId: string): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.MovePackageService', 'GetMovePackage', {
      package_id: packageId,
    });
  }

  /**
   * Obtiene la definición de un módulo Move
   */
  async getMoveModule(
    packageId: string,
    moduleName: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.MovePackageService', 'GetMoveModule', {
      package_id: packageId,
      module_name: moduleName,
    });
  }

  /**
   * Obtiene la definición de un struct Move
   */
  async getMoveStruct(
    packageId: string,
    moduleName: string,
    structName: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.MovePackageService', 'GetMoveStruct', {
      package_id: packageId,
      module_name: moduleName,
      struct_name: structName,
    });
  }

  /**
   * Obtiene la definición de una función Move
   */
  async getMoveFunction(
    packageId: string,
    moduleName: string,
    functionName: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.MovePackageService', 'GetMoveFunction', {
      package_id: packageId,
      module_name: moduleName,
      function_name: functionName,
    });
  }

  // ==================== SignatureVerificationService ====================

  /**
   * Verifica una firma
   */
  async verifySignature(
    signature: string,
    messageBytes: string,
    publicKey: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.SignatureVerificationService', 'VerifySignature', {
      signature,
      message_bytes: messageBytes,
      public_key: publicKey,
    });
  }

  /**
   * Verifica múltiples firmas
   */
  async batchVerifySignatures(
    signatures: Array<{
      signature: string;
      messageBytes: string;
      publicKey: string;
    }>
  ): Promise<Record<string, unknown>> {
    return this.grpcCall(
      'sui.rpc.v2.SignatureVerificationService',
      'BatchVerifySignatures',
      {
        signatures,
      }
    );
  }

  // ==================== NameService ====================

  /**
   * Resuelve un nombre SuiNS a su registro
   */
  async resolveSuiNSName(name: string): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.NameService', 'ResolveSuiNSName', {
      name,
    });
  }

  /**
   * Realiza una búsqueda inversa: de dirección a nombre SuiNS
   */
  async reverseLookupAddress(
    address: string
  ): Promise<Record<string, unknown>> {
    return this.grpcCall('sui.rpc.v2.NameService', 'ReverseLookupAddress', {
      address,
    });
  }
}

export default SuiGrpcClient;
