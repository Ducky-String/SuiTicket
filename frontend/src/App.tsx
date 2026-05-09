import { useState } from "react";
import { MOCK_MOVIES } from "./types/movie";
import { type Movie } from "./types/movie";
import { ConnectButton, useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { handleMintTicket } from './services/tx/executeMintTicket';
import { MyTickets } from './components/ticket/MyTickets';
import { MovieDetail } from './components/MovieDetail';

function App() {
  const [view, setView] = useState<'movies' | 'tickets' | 'detail'>('movies');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const account = useCurrentAccount();
  const { data: balanceData } = useSuiClientQuery('getBalance', {
    owner: account?.address as string,
  }, {
    enabled: !!account,
  });

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyTicket = async (movie: Movie) => {
    if (!account) {
      alert("Vui lòng kết nối ví trước khi mua vé!");
      return;
    }

    const priceInMist = 10000000; // 0.01 SUI
    const currentBalance = balanceData ? Number(balanceData.totalBalance) : 0;

    if (currentBalance < priceInMist) {
      alert(`Số dư không đủ! Bạn cần 0.01 SUI nhưng ví chỉ có ${currentBalance / 1000000000} SUI.`);
      return;
    }

    const imageUrl = movie.image.startsWith('http') 
      ? movie.image 
      : `https://raw.githubusercontent.com/Ducky-String/SuiTicket/main/frontend${movie.image}`;

    const tx = await handleMintTicket(movie.title, imageUrl, 1);

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
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
      {/* 1. NAVBAR */}
      <nav className="flex justify-between items-center p-6 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => setView('movies')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M2 9V5.2a.2.2 0 0 1 .2-.2h19.6a.2.2 0 0 1 .2.2V9M2 15v3.8a.2.2 0 0 0 .2.2h19.6a.2.2 0 0 0 .2-.2V15M2 9c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2M2 15c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter">SUI TICKET</h1>
        </div>
        <div className="space-x-6 flex items-center">
          <button 
            onClick={() => setView('movies')} 
            className={`transition hidden md:block text-sm font-bold uppercase tracking-widest ${view === 'movies' || view === 'detail' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
          >
            Phim đang chiếu
          </button>
          <button 
            onClick={() => setView('tickets')} 
            className={`transition hidden md:block text-sm font-bold uppercase tracking-widest ${view === 'tickets' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
          >
            Vé của tôi
          </button>
          <ConnectButton />
        </div>
      </nav>

      {/* 2. HERO SECTION - Hide if in detail view */}
      {view !== 'detail' && (
        <header className="py-16 px-6 text-center animate-in fade-in zoom-in duration-700">
          <h2 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 leading-tight">
            {view === 'movies' ? 'Trải nghiệm điện ảnh Web3' : 'Kho vé NFT của bạn'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {view === 'movies' 
              ? 'Nền tảng đặt vé xem phim thế hệ mới trên Sui Blockchain. Nhanh chóng, bảo mật và hoàn toàn phi tập trung.' 
              : 'Nơi lưu giữ những kỷ niệm điện ảnh của bạn dưới dạng tài sản kỹ thuật số không thể thay thế.'}
          </p>
        </header>
      )}

      {/* 3. CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pb-20 pt-8">
        {view === 'movies' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {MOCK_MOVIES.map((movie) => (
              <div 
                key={movie.id} 
                onClick={() => handleMovieClick(movie)}
                className="bg-gray-900 rounded-3xl border border-gray-800 hover:border-blue-500/50 transition-all duration-500 group cursor-pointer overflow-hidden flex flex-col shadow-xl hover:shadow-blue-500/10"
              >
                <div className="relative w-full aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold">
                    {movie.price} SUI
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2 block">{movie.genre}</span>
                    <h3 className="text-xl font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      <span className="text-xs text-yellow-400 font-bold">
                        {(4 + (movie.id * 7 % 11) / 10).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-1">(1.2k+)</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium italic">Xem chi tiết</span>
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'tickets' && (
          <MyTickets />
        )}

        {view === 'detail' && selectedMovie && (
          <MovieDetail 
            movie={selectedMovie} 
            onBack={() => setView('movies')} 
            onBuy={handleBuyTicket}
          />
        )}
      </main>
    </div>
  );
}

export default App;