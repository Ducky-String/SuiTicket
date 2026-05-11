import { useState } from "react";
import { MOCK_MOVIES } from "./types/movie";
import { type Movie } from "./types/movie";
import { ConnectButton, useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { handleMintTicket } from './services/tx/executeMintTicket';
import { MyTickets } from './components/ticket/MyTickets';
import { MovieDetail } from './components/MovieDetail';
import { StaffScanner } from './components/ticket/StaffScanner';
import { SeatSelection } from './components/ticket/SeatSelection';
import confetti from 'canvas-confetti';

type TxStatus = 'idle' | 'signing' | 'processing' | 'success' | 'error';
type ViewType = 'now-playing' | 'coming-soon' | 'tickets' | 'detail' | 'staff';

function App() {
  const [view, setView] = useState<ViewType>('now-playing');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txError, setTxError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [isSelectingSeats, setIsSelectingSeats] = useState(false);
  const [tempPurchaseData, setTempPurchaseData] = useState<{ movie: Movie; showtime: string } | null>(null);

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

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

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleBuyTicket = (movie: Movie, showtime: string) => {
    if (!account) {
      alert("Vui lòng kết nối ví trước khi mua vé!");
      return;
    }
    setTempPurchaseData({ movie, showtime });
    setIsSelectingSeats(true);
  };

  const handleConfirmPurchase = async (selectedSeats: string[]) => {
    if (!tempPurchaseData || !account) return;

    const { movie, showtime } = tempPurchaseData;
    const quantity = selectedSeats.length;
    const priceInMist = Math.round(movie.price * 1_000_000_000) * quantity; 
    const currentBalance = balanceData ? Number(balanceData.totalBalance) : 0;

    if (currentBalance < priceInMist) {
      alert(`Số dư không đủ! Bạn cần ${(priceInMist / 1000000000).toFixed(2)} SUI nhưng ví chỉ có ${currentBalance / 1000000000} SUI.`);
      return;
    }

    setIsSelectingSeats(false);
    setTxStatus('signing');
    setTxError(null);

    try {
      const imageUrl = movie.image.startsWith('http') 
        ? movie.image 
        : `https://raw.githubusercontent.com/Ducky-String/SuiTicket/main/frontend${movie.image.startsWith('/') ? movie.image : '/' + movie.image}`;

      const seatString = selectedSeats.join(', ');
      const tx = await handleMintTicket(movie.title, imageUrl, showtime, seatString, quantity);

      const result = await signAndExecuteTransaction({ transaction: tx });
      
      console.log('Giao dịch thành công:', result);
      setTxDigest(result.digest);
      setTxStatus('success');
      fireConfetti();
    } catch (error: any) {
      console.error('Lỗi giao dịch chi tiết:', error);
      // Nếu lỗi là undefined hoặc trống, hiển thị thông báo thân thiện
      const errorMsg = error?.message || (typeof error === 'undefined' ? 'Giao dịch bị từ chối hoặc lỗi kết nối ví' : 'Giao dịch thất bại');
      setTxError(errorMsg);
      setTxStatus('error');
    }
  };

  const filteredMovies = MOCK_MOVIES.filter(m => {
    if (view === 'now-playing') return m.status === 'now-playing';
    if (view === 'coming-soon') return m.status === 'coming-soon';
    return true;
  });

  const TransactionModal = () => {
    if (txStatus === 'idle') return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-300 text-center">
          
          {(txStatus === 'success' || txStatus === 'error') && (
            <button 
              onClick={() => {
                setTxStatus('idle');
                if (txStatus === 'success') setView('tickets');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}

          <div className="mb-6 flex justify-center">
            {txStatus === 'signing' && (
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
              </div>
            )}
            {txStatus === 'processing' && (
              <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            )}
            {txStatus === 'success' && (
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
            {txStatus === 'error' && (
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 animate-in zoom-in duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold mb-2">
            {txStatus === 'signing' && 'Đang đợi ký ví...'}
            {txStatus === 'processing' && 'Đang xác nhận trên Sui...'}
            {txStatus === 'success' && 'Mua vé thành công!'}
            {txStatus === 'error' && 'Giao dịch thất bại'}
          </h3>

          <p className="text-gray-400 text-sm mb-6">
            {txStatus === 'signing' && 'Vui lòng xác nhận giao dịch trong ví của bạn để tiếp tục.'}
            {txStatus === 'processing' && 'Giao dịch đang được xử lý bởi mạng lưới Sui. Vui lòng không đóng cửa sổ.'}
            {txStatus === 'success' && 'Chúc mừng! Vé NFT của bạn đã được đúc thành công và gửi vào ví.'}
            {txStatus === 'error' && (txError || 'Đã có lỗi xảy ra trong quá trình xử lý giao dịch.')}
          </p>

          {txStatus === 'success' && txDigest && (
            <div className="mt-4 p-3 bg-black/30 rounded-xl border border-gray-800">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Transaction Digest</p>
              <p className="text-[10px] font-mono text-blue-400 break-all">{txDigest}</p>
            </div>
          )}

          {txStatus === 'success' && (
            <button 
              onClick={() => {
                setTxStatus('idle');
                setView('tickets');
              }}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              XEM VÉ CỦA TÔI
            </button>
          )}

          {txStatus === 'error' && (
            <button 
              onClick={() => setTxStatus('idle')}
              className="mt-8 w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              QUAY LẠI
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30 flex flex-col">
      <TransactionModal />
      
      {isSelectingSeats && tempPurchaseData && (
        <SeatSelection 
          movieTitle={tempPurchaseData.movie.title}
          showtime={tempPurchaseData.showtime}
          pricePerSeat={tempPurchaseData.movie.price}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setIsSelectingSeats(false)}
        />
      )}
      
      {/* 1. NAVBAR */}
      <nav className="flex justify-between items-center p-6 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => setView('now-playing')}>
          <img 
            src="/logo.png" 
            alt="SUI TICKET Logo" 
            className="w-10 h-10 object-contain mr-3 filter drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]"
          />
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">SUI TICKET</h1>
        </div>
        <div className="space-x-6 flex items-center">
          <button 
            onClick={() => setView('now-playing')} 
            className={`transition hidden md:block text-sm font-bold uppercase tracking-widest ${view === 'now-playing' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
          >
            Đang chiếu
          </button>
          <button 
            onClick={() => setView('coming-soon')} 
            className={`transition hidden md:block text-sm font-bold uppercase tracking-widest ${view === 'coming-soon' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
          >
            Sắp chiếu
          </button>
          <button 
            onClick={() => setView('tickets')} 
            className={`transition hidden md:block text-sm font-bold uppercase tracking-widest ${view === 'tickets' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
          >
            Vé của tôi
          </button>
          <button 
            onClick={() => setView('staff')} 
            className={`transition hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border px-3 py-1.5 rounded-lg ${view === 'staff' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${view === 'staff' ? 'bg-white animate-pulse' : 'bg-gray-600'}`}></div>
            Staff Mode
          </button>
          <ConnectButton />
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      {view !== 'detail' && view !== 'staff' && (
        <header className="py-16 px-6 text-center animate-in fade-in zoom-in duration-700">
          <h2 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 leading-tight">
            {view === 'now-playing' && 'Trải nghiệm điện ảnh Web3'}
            {view === 'coming-soon' && 'Siêu phẩm sắp đổ bộ'}
            {view === 'tickets' && 'Kho vé NFT của bạn'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {view === 'now-playing' && 'Nền tảng đặt vé xem phim thế hệ mới trên Sui Blockchain. Nhanh chóng, bảo mật và hoàn toàn phi tập trung.'}
            {view === 'coming-soon' && 'Đón chờ những bộ phim bom tấn sắp có mặt tại SuiTicket. Đặt lịch ngay để không bỏ lỡ!'}
            {view === 'tickets' && 'Nơi lưu giữ những kỷ niệm điện ảnh của bạn dưới dạng tài sản kỹ thuật số không thể thay thế.'}
          </p>
        </header>
      )}

      {/* 3. CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pb-20 pt-8 flex-grow">
        {(view === 'now-playing' || view === 'coming-soon') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {filteredMovies.map((movie) => (
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
                  
                  {movie.status === 'coming-soon' ? (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-amber-500/80 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                      Sắp chiếu
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold">
                      {movie.price} SUI
                    </div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2 block">{movie.genre}</span>
                    <h3 className="text-xl font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">{movie.title}</h3>
                    
                    {movie.status === 'coming-soon' ? (
                      <div className="flex items-center gap-2 mt-2 text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span className="text-xs font-black">
                          {movie.views?.toLocaleString()} lượt xem
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        <span className="text-xs text-yellow-400 font-bold">
                          {(4 + (movie.id * 7 % 11) / 10).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1">(1.2k+)</span>
                      </div>
                    )}
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
            onBack={() => setView(selectedMovie.status === 'now-playing' ? 'now-playing' : 'coming-soon')} 
            onBuy={handleBuyTicket}
          />
        )}

        {view === 'staff' && (
          <StaffScanner />
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="SUI TICKET Logo" 
                className="w-8 h-8 object-contain mr-3"
              />
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">SUI TICKET</h1>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Nền tảng đặt vé xem phim thế hệ mới trên Sui Blockchain. Nhanh chóng, bảo mật và hoàn toàn phi tập trung. Sở hữu vé của bạn dưới dạng NFT độc bản.
            </p>
            <div className="flex gap-4">
              {/* Facebook */}
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110 text-gray-400 hover:text-white group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* X (formerly Twitter) */}
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black border hover:border-gray-700 transition-all hover:scale-110 text-gray-400 hover:text-white group">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110 text-gray-400 hover:text-white group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110 text-gray-400 hover:text-white group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 68.41 68.41 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 68.41 68.41 0 0 1-15 0 2 2 0 0 1-2-2z"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Dịch vụ</h4>
            <ul className="space-y-4">
              <li><button onClick={() => setView('now-playing')} className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Phim đang chiếu</button></li>
              <li><button onClick={() => setView('coming-soon')} className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Phim sắp chiếu</button></li>
              <li><button onClick={() => setView('tickets')} className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Vé của tôi</button></li>
              <li><a href="https://suiscan.xyz/mainnet/home" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Suiscan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Hỗ trợ</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-400 text-sm transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Kết nối với chúng tôi</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>1900 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>support@suiticket.com</span>
              </div>
              <div className="pt-4">
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Blockchain Powered</p>
                  <p className="text-[10px] text-gray-400">Giao dịch an toàn và minh bạch trên mạng lưới Sui.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">
          <p>© 2026 SUI TICKET. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;