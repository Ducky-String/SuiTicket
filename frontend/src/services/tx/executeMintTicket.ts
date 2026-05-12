import { Transaction } from '@mysten/sui/transactions';
import { TICKET_PACKAGE_ID, ADMIN_ADDRESS } from '../../constants/contracts';

/**
 * Handle minting a ticket NFT.
 * @param movieName Name of the movie
 * @param imageUrl URL of the movie poster
 * @param showtime Selected showtime
 * @param seat Selected seat(s) as a string
 * @param quantity Number of tickets to mint
 * @param pricePerSeat Price per seat in SUI (default 0.01 SUI). Must match PRICE_PER_TICKET in contract.
 */
export const handleMintTicket = async (
  movieName: string,
  imageUrl: string,
  showtime: string,
  seat: string,
  quantity: number,
  pricePerSeat: number = 0.01
) => {
  const txb = new Transaction();

  const PACKAGE_ID = TICKET_PACKAGE_ID.testnet;

  // Convert SUI → MIST (1 SUI = 1,000,000,000 MIST) rồi nhân số lượng
  const priceInMist = BigInt(Math.round(pricePerSeat * 1_000_000_000));
  const totalAmount = priceInMist * BigInt(quantity);

  // 1. Split the payment from the gas coin
  const [paymentCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(totalAmount)]);

  // 2. Call the Move function
  // Target: <package_id>::suiticket::mint_ticket
  // Arguments: payment, movie_name, image_url, showtime, seat, quantity, admin_address
  txb.moveCall({
    target: `${PACKAGE_ID}::suiticket::mint_ticket`,
    arguments: [
      paymentCoin,
      txb.pure.string(movieName),
      txb.pure.string(imageUrl),
      txb.pure.string(showtime),
      txb.pure.string(seat),
      txb.pure.u64(quantity),
      txb.pure.address(ADMIN_ADDRESS)
    ],
  });

  return txb;
};