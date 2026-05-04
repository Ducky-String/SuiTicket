import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export const suiClients = {
  devnet: new SuiClient({ url: getFullnodeUrl('devnet') }),
  testnet: new SuiClient({ url: getFullnodeUrl('testnet') }),
  mainnet: new SuiClient({ url: getFullnodeUrl('mainnet') }),
} as const;

export type SuiNetwork = keyof typeof suiClients;
