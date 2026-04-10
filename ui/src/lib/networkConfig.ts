import { createNetworkConfig } from '@mysten/dapp-kit';
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

export const { networkConfig } = createNetworkConfig({
    devnet: { network: 'devnet', url: getJsonRpcFullnodeUrl('devnet') },
    testnet: { network: 'testnet', url: getJsonRpcFullnodeUrl('testnet') },
    mainnet: { network: 'mainnet', url: getJsonRpcFullnodeUrl('mainnet') },
    localnet: { network: 'localnet', url: getJsonRpcFullnodeUrl('localnet') },
});

export type SupportedNetwork = keyof typeof networkConfig;
