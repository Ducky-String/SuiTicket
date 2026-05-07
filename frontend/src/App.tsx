import { MOCK_MOVIES } from "./types/movie";
// Thêm import type Movie vào đây
import { type Movie } from "./types/movie";
import { ConnectButton, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createMintTicketTransaction } from './types/onchain';

function App() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Sửa lại kiểu dữ liệu ở tham số movie thành Movie
  const handleBuyTicket = (movie: Movie) => {
    const tx = createMintTicketTransaction(movie);

    signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.log('Giao dịch thành công:', result);
          alert(`🎉 Chúc mừng! Bạn đã đúc thành công vé NFT cho phim: ${movie.title}`);
        },
        onError: (error) => {
          console.error('Lỗi giao dịch:', error);
          alert('Giao dịch thất bại. Hãy chắc chắn bạn đã kết nối ví và có đủ SUI (Testnet)!');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* 1. NAVBAR */}
      <nav className="flex justify-between items-center p-6 bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-500 tracking-tighter">SUI TICKET</h1>
        <div className="space-x-6 flex items-center">
          <a href="#" className="hover:text-blue-400 transition hidden md:block">Phim đang chiếu</a>
          <a href="#" className="hover:text-blue-400 transition hidden md:block">Lịch sử vé</a>
          {/* Nút kết nối ví xịn từ dApp Kit */}
          <ConnectButton />
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="py-16 px-6 text-center">
        <h2 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Mua vé xem phim trên Sui Blockchain
        </h2>
        <p className="text-gray-400 text-lg">Nhanh chóng - Bảo mật - Vé NFT độc quyền</p>
      </header>

      {/* 3. MOVIE LIST */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {MOCK_MOVIES.map((movie) => (
            <div key={movie.id} className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-500 group relative flex flex-col">

              {/* Ảnh Poster với hiệu ứng 3D */}
              <div className="relative w-full aspect-[2/3] p-3">
                <div className="w-full h-full overflow-visible rounded-xl relative">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-4 group-hover:z-10 relative"
                  />
                </div>
              </div>

              {/* Thông tin phim */}
              <div className="p-5 pt-2 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{movie.genre}</span>
                  <h3 className="text-lg font-bold mt-1 leading-tight group-hover:text-blue-400 transition-colors">{movie.title}</h3>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Giá vé</span>
                    <span className="text-lg font-bold text-emerald-400">{movie.price} SUI</span>
                  </div>
                  <button
                    onClick={() => handleBuyTicket(movie)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    Đặt vé
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;