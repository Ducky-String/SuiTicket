import { Transaction } from '@mysten/sui/transactions';

export const handleMintTicket = async (movieName: string, quantity: number) => {
  const txb = new Transaction();

  // Thay địa chỉ này bằng Package ID bạn đã deploy lên GitHub
  const PACKAGE_ID = "0xfb9572bdbac6c94edce9c547a476e2a9a4d9b044e13b30813d7e24e650b2cfaa";
  // Ví nhận tiền của Mạnh
  const ADMIN_ADDRESS = "0x17d3394e754b09fd264781e9c029d7d19578c4ac43fd6c47b8dd3cec00a6fee5";

  // 1. Tách đúng 5 SUI từ số dư hiện có của người dùng
  const [paymentCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(5000000000 * quantity)]);
  // 2. Thực hiện gọi hàm Move
  txb.moveCall({
    target: `${PACKAGE_ID}::suiticket::mint_ticket`,
    arguments: [
      paymentCoin, // Truyền đồng xu 5 SUI vào
      txb.pure.string(movieName),
      txb.pure.u64(quantity),
      txb.pure.address(ADMIN_ADDRESS)
    ],
  });

  return txb;
};