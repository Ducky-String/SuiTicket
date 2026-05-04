type PackageByNetwork = Record<'devnet' | 'testnet' | 'mainnet', string>;

// Fill package IDs after publishing each environment.
export const TICKET_PACKAGE_ID: PackageByNetwork = {
  devnet: '0x0',
  testnet: '0x5286f50673be250932e1aecfd782609e9291a27f449034f353c092836835f9f3',
  mainnet: '0x0',
};
