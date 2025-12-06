/**
 * Componentes React para explorar todas las APIs gRPC de Sui
 */

import React, { useState } from 'react';
import { Box, Button, Card, Heading, Text, TextField } from '@radix-ui/themes';
import {
  useCheckpoint,
  useTransaction,
  useObject,
  useCoinBalances,
  useMovePackage,
  useSuiNSResolver,
  useCheckpointSubscription,
} from '../hooks/useGrpc';
import { useGrpcContext } from '../contexts/GrpcContext';

interface GrpcApiExplorerProps {
  showConnectionSelector?: boolean;
}

export const GrpcApiExplorer: React.FC<GrpcApiExplorerProps> = ({
  showConnectionSelector = true,
}) => {
  const { isConnected } = useGrpcContext();
  const [activeTab, setActiveTab] = useState<
    'transaction' | 'object' | 'balances' | 'package' | 'suin' | 'stream'
  >('transaction');

  // Estados para inputs
  const [transactionDigest, setTransactionDigest] = useState('');
  const [objectId, setObjectId] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [packageId, setPackageId] = useState('');
  const [suiNSName, setSuiNSName] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState('');

  // Hooks
  const { transaction, loading: txLoading } = useTransaction(transactionDigest);
  const { object, loading: objLoading } = useObject(objectId);
  const { balances, loading: balLoading } = useCoinBalances(ownerAddress);
  const { pkg, loading: pkgLoading } = useMovePackage(packageId);
  const { record: suiNSRecord, loading: suiNSLoading } = useSuiNSResolver(suiNSName);
  const { latestCheckpoint, loading: streamLoading } = useCheckpointSubscription(
  );

  if (!isConnected) {
    return (
      <Box style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ padding: '20px', backgroundColor: '#fff3cd', borderColor: '#ffc107' }}>
          <Heading size="3" style={{ marginBottom: '10px', color: '#856404' }}>
            ⚠️ No conectado
          </Heading>
          <Text color="gray">
            Por favor, configura la conexión gRPC primero en el selector de conexión.
          </Text>
        </Card>
      </Box>
    );
  }

  const renderSection = (title: string, content: React.ReactNode) => (
    <Card style={{ padding: '20px', marginBottom: '20px' }}>
      <Heading size="3" style={{ marginBottom: '10px' }}>
        {title}
      </Heading>
      {content}
    </Card>
  );

  const renderJson = (data: unknown, loading: boolean) => (
    <Box
      style={{
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '4px',
        marginTop: '10px',
        maxHeight: '300px',
        overflow: 'auto',
        fontSize: '12px',
      }}
    >
      {loading ? (
        <Text>Cargando...</Text>
      ) : data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <Text color="gray">No hay datos</Text>
      )}
    </Box>
  );

  return (
    <Box style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Heading size="4" style={{ marginBottom: '20px' }}>
        🔗 Explorador de APIs gRPC de Sui
      </Heading>
        </Box>
      )}

      {/* Tabs */}
      <Box style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: 'transaction', label: '📝 Transacciones' },
          { id: 'object', label: '📦 Objetos' },
          { id: 'balances', label: '💰 Balances' },
          { id: 'package', label: '📚 Paquetes Move' },
          { id: 'suin', label: '🏷️ SuiNS' },
          { id: 'stream', label: '📊 Stream Checkpoints' },
        ].map(({ id, label }) => (
          <Button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            variant={activeTab === id ? 'solid' : 'outline'}
            style={{ cursor: 'pointer' }}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* Contenido por Tab */}

      {activeTab === 'transaction' &&
        renderSection(
          'Obtener Transacción',
          <Box>
            <TextField.Root
              value={transactionDigest}
              onChange={(e) => setTransactionDigest(e.target.value)}
              placeholder="Ingresa el digest de la transacción (Base58)"
            />
            <Button onClick={() => {}} style={{ marginTop: '10px' }}>
              Buscar Transacción
            </Button>
            {renderJson(transaction, txLoading)}
          </Box>
        )}

      {activeTab === 'object' &&
        renderSection(
          'Obtener Objeto',
          <Box>
            <TextField.Root
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              placeholder="Ingresa el ID del objeto (hex)"
            />
            <Button onClick={() => {}} style={{ marginTop: '10px' }}>
              Buscar Objeto
            </Button>
            {renderJson(object, objLoading)}
          </Box>
        )}

      {activeTab === 'balances' &&
        renderSection(
          'Balances de Monedas',
          <Box>
            <TextField.Root
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              placeholder="Ingresa la dirección del propietario"
            />
            <Button onClick={() => {}} style={{ marginTop: '10px' }}>
              Obtener Balances
            </Button>
            {renderJson(balances, balLoading)}
          </Box>
        )}

      {activeTab === 'package' &&
        renderSection(
          'Paquete Move',
          <Box>
            <TextField.Root
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              placeholder="Ingresa el ID del paquete"
            />
            <Button onClick={() => {}} style={{ marginTop: '10px' }}>
              Obtener Paquete
            </Button>
            {renderJson(pkg, pkgLoading)}
          </Box>
        )}

      {activeTab === 'suin' &&
        renderSection(
          'Resolver SuiNS',
          <Box>
            <TextField.Root
              value={suiNSName}
              onChange={(e) => setSuiNSName(e.target.value)}
              placeholder="Ingresa el nombre SuiNS (ej: ejemplo.sui)"
            />
            <Button onClick={() => {}} style={{ marginTop: '10px' }}>
              Resolver Nombre
            </Button>
            {renderJson(suiNSRecord, suiNSLoading)}
          </Box>
        )}

      {activeTab === 'stream' &&
        renderSection(
          'Stream de Checkpoints en Tiempo Real',
          <Box>
            <Text style={{ marginBottom: '10px', display: 'block' }}>
              {streamLoading ? '🔴 Conectando...' : '🟢 Conectado'}
            </Text>
            {latestCheckpoint && (
              <Box>
                <Text style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Última Secuencia:</strong>{' '}
                  {(latestCheckpoint as Record<string, unknown>).sequence_number}
                </Text>
                <Text style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Timestamp:</strong>{' '}
                  {(
                    (latestCheckpoint as Record<string, unknown>).summary as Record<
                      string,
                      unknown
                    >
                  )?.timestamp}
                </Text>
              </Box>
            )}
            {renderJson(latestCheckpoint, streamLoading)}
          </Box>
        )}
    </Box>
  );
};

export default GrpcApiExplorer;
