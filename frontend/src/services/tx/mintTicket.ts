/**
 * @deprecated File này KHÔNG được dùng trong app.
 * Hàm mint ticket chính đang ở: services/tx/executeMintTicket.ts → handleMintTicket()
 * File này có thể được xóa an toàn.
 */
import { Transaction } from '@mysten/sui/transactions';
import { TICKET_PACKAGE_ID } from '../../constants/contracts';
import { DEFAULT_NETWORK, type SupportedNetwork } from '../../constants/networks';

export type MintAndTransferTicketInput = {
  name: string;
  description: string;
  price: number | bigint;
  buyer: string;
  network?: SupportedNetwork;
};

export function buildMintAndTransferTicketTx(input: MintAndTransferTicketInput): Transaction {
  const network = input.network ?? DEFAULT_NETWORK;
  const packageId = TICKET_PACKAGE_ID[network];

  if (packageId === '0x0') {
    throw new Error(`Missing package id for network: ${network}`);
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::suiticket::mint_and_transfer`,
    arguments: [
      tx.pure.string(input.name),
      tx.pure.string(input.description),
      tx.pure.u64(input.price),
      tx.pure.address(input.buyer),
    ],
  });

  return tx;
}
