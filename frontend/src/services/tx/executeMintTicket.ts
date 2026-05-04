import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import type { Transaction } from '@mysten/sui/transactions';
import {
  buildMintAndTransferTicketTx,
  type MintAndTransferTicketInput,
} from './mintTicket';

type SignAndExecute = (input: {
  transaction: Transaction;
}) => Promise<SuiTransactionBlockResponse>;

export async function executeMintAndTransferTicket(
  input: MintAndTransferTicketInput,
  signAndExecuteTransaction: SignAndExecute,
): Promise<SuiTransactionBlockResponse> {
  const transaction = buildMintAndTransferTicketTx(input);
  return signAndExecuteTransaction({ transaction });
}
