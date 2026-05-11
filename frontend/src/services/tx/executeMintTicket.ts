import { Transaction } from '@mysten/sui/transactions';
import { TICKET_PACKAGE_ID, ADMIN_ADDRESS } from '../../constants/contracts';

/**
 * Handle minting a ticket NFT.
 * @param movieName Name of the movie
 * @param imageUrl URL of the movie poster
 * @param showtime Selected showtime
 * @param seat Selected seat(s) as a string
 * @param quantity Number of tickets to mint
 */
export const handleMintTicket = async (movieName: string, imageUrl: string, showtime: string, seat: string, quantity: number) => {
  const txb = new Transaction();

  const PACKAGE_ID = TICKET_PACKAGE_ID.testnet;

  // Price per ticket: 0.01 SUI (10,000,000 MIST)
  const pricePerTicket = 10_000_000n;
  const totalAmount = pricePerTicket * BigInt(quantity);

  // 1. Split the payment from the gas coin
  const [paymentCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(totalAmount)]);

  // 2. Call the Move function
  // Target: <package_id>::suiticket::mint_ticket
  // Arguments: payment, movie_name, image_url, showtime, quantity, admin_address
  txb.moveCall({
    target: `${PACKAGE_ID}::suiticket::mint_ticket`,
    arguments: [
      paymentCoin,
      txb.pure.string(movieName),
      txb.pure.string(imageUrl),
      txb.pure.string(showtime),
      txb.pure.string(seat), // RE-ACTIVATED: seat argument
      txb.pure.u64(quantity),
      txb.pure.address(ADMIN_ADDRESS)
    ],
  });

  return txb;
};