import { Transaction } from '@mysten/sui/transactions';

/**
 * Handle minting a ticket NFT.
 * @param movieName Name of the movie
 * @param imageUrl URL of the movie poster
 * @param quantity Number of tickets to mint
 */
export const handleMintTicket = async (movieName: string, imageUrl: string, quantity: number) => {
  const txb = new Transaction();

  // Replace with your actual Package ID after publication
  const PACKAGE_ID = "0xa40017ba82cb0e4b512e648c3dc9dc9416c02196059aa777cd3a0e8af2e70616";

  // Admin address to receive the payment
  const ADMIN_ADDRESS = "0x17d3394e754b09fd264781e9c029d7d19578c4ac43fd6c47b8dd3cec00a6fee5";

  // Price per ticket: 0.01 SUI (10,000,000 MIST)
  const pricePerTicket = 10_000_000n;
  const totalAmount = pricePerTicket * BigInt(quantity);

  // 1. Split the payment from the gas coin
  const [paymentCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(totalAmount)]);

  // 2. Call the Move function
  // Target: <package_id>::suiticket::mint_ticket
  // Arguments: payment, movie_name, image_url, quantity, admin_address
  txb.moveCall({
    target: `${PACKAGE_ID}::suiticket::mint_ticket`,
    arguments: [
      paymentCoin,
      txb.pure.string(movieName),
      txb.pure.string(imageUrl), // This works for vector<u8> in Move as well
      txb.pure.u64(quantity),
      txb.pure.address(ADMIN_ADDRESS)
    ],
  });

  return txb;
};