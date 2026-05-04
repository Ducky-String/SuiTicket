import { Transaction } from "@mysten/sui/transactions";
import { type Movie } from "./movie"; // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn

export const PACKAGE_ID = "0xe2b6ad5da741a8c13425a20f8b95f46082983d0a672fe8a948174d9e659f1a9a"; 

export const createMintTicketTransaction = (movie: Movie) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::suiticket::mint`,
    arguments: [
      tx.pure.string(movie.title),
      tx.pure.u64(movie.price),
    ],
  });

  return tx;
};