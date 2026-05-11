type PackageByNetwork = Record<'devnet' | 'testnet' | 'mainnet', string>;

// Fill package IDs after publishing each environment.
export const TICKET_PACKAGE_ID: PackageByNetwork = {
  devnet: '0x0',
  testnet: '0x2b97e83f3eeb69ef1d5a1555457985922ece25967affb19f07042be700c3ffa0',
  mainnet: '0x0',
};

export const ADMIN_ADDRESS = "0x17d3394e754b09fd264781e9c029d7d19578c4ac43fd6c47b8dd3cec00a6fee5";
