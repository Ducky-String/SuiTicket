import { Transaction } from '@mysten/sui/transactions';

/**
 * Handle minting a ticket NFT.
 * @param movieName Name of the movie
 * @param imageUrl URL of the movie poster
 * @param showtime Selected showtime
 * @param quantity Number of tickets to mint
 */
export const handleMintTicket = async (movieName: string, imageUrl: string, showtime: string, quantity: number) => {
  const txb = new Transaction();

  // Replace with your actual Package ID after publication
  const PACKAGE_ID = "0x9c49d21a7e7df43d44d7fd0b137e4b94304a7f465e2a44e73080090fa99f9c30";

  // Admin address to receive the payment
  const ADMIN_ADDRESS = "0x17d3394e754b09fd264781e9c029d7d19578c4ac43fd6c47b8dd3cec00a6fee5";

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
      txb.pure.string(showtime), // NEW: showtime argument
      txb.pure.u64(quantity),
      txb.pure.address(ADMIN_ADDRESS)
    ],
  });

  return txb;
};