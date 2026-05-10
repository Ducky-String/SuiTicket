import { useState } from "react";
import { type Movie } from "../types/movie";

interface MovieDetailProps {
  movie: Movie;
  onBack: () => void;
  onBuy: (movie: Movie, selectedShowtime: string) => void;
}

export const MovieDetail = ({ movie, onBack, onBuy }: MovieDetailProps) => {
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Nút quay lại */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Quay lại danh sách
      </button>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Container Grid 12 cột */}
        <div className="grid grid-cols-12 gap-0 md:gap-8">

          {/* BÊN TRÁI: Poster phim - Chiếm 3/12 cột trên màn hình MD+ */}
          <div className="col-span-12 md:col-span-3 p-6 md:p-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Thông tin phụ dưới ảnh */}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-500 text-sm">Định dạng</span>
                <span className="text-blue-400 font-medium">2D / Digital</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-500 text-sm">Giá vé</span>
                <span className="text-emerald-400 font-bold">{movie.price} SUI</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-500 text-sm">Trạng thái</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase">Đang chiếu</span>
              </div>
            </div>
          </div>

          {/* BÊN PHẢI: Nội dung mô tả - Chiếm 9/12 cột trên màn hình MD+ */}
          <div className="col-span-12 md:col-span-9 p-6 md:p-10 md:pl-0 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 uppercase tracking-wider">
                  {movie.genre}
                </span>
                <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded-full border border-gray-700">
                  {movie.duration}
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/20">
                  {movie.rating}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                {movie.title}
              </h1>

              {/* Phần đánh giá sao hoặc lượt xem */}
              <div className="flex items-center gap-4">
                {movie.status === 'coming-soon' ? (
                  <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="text-lg font-black tracking-tighter">
                      {movie.views?.toLocaleString()} lượt người quan tâm
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = 4 + (movie.id * 7 % 11) / 10;
                        const fill = star <= Math.floor(rating)
                          ? "text-yellow-400"
                          : star === Math.ceil(rating) && rating % 1 !== 0
                            ? "text-yellow-400/50"
                            : "text-gray-600";
                        return (
                          <svg key={star} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={fill}>
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        );
                      })}
                    </div>
                    <span className="text-yellow-400 font-bold text-lg">
                      {(4 + (movie.id * 7 % 11) / 10).toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">(1.2k+ đánh giá)</span>
                  </>
                )}
              </div>
            </div>

              {/* CHỌN SUẤT CHIẾU - Chỉ hiện nếu phim đang chiếu */}
            {movie.status === 'now-playing' ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
                  Chọn suất chiếu
                </h2>
                <div className="flex flex-wrap gap-3">
                  {movie.showtimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedShowtime(time)}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 border ${
                        selectedShowtime === time
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 scale-105'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-3 text-amber-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  <h3 className="text-lg font-black uppercase tracking-wider">Phim sắp khởi chiếu</h3>
                </div>
                <p className="text-gray-400">Bộ phim này dự kiến sẽ khởi chiếu vào ngày <span className="text-white font-bold">{movie.releaseDate}</span>. Hãy quay lại sau để đặt vé!</p>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
                Nội dung phim
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg text-justify md:pr-10">
                {movie.description}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-1 bg-red-600 rounded-full"></span>
                Trailer Phim
              </h2>
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                <iframe
                  src={movie.trailerUrl}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Đạo diễn</p>
                <p className="text-white text-lg font-semibold">{movie.director}</p>
              </div>
              <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Diễn viên chính</p>
                <p className="text-white text-lg font-semibold">{movie.cast}</p>
              </div>
            </div>

            {/* Nút đặt vé - Ẩn nếu phim sắp chiếu */}
            {movie.status === 'now-playing' && (
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                <div className="w-full sm:w-auto">
                  <button
                    disabled={!selectedShowtime}
                    onClick={() => selectedShowtime && onBuy(movie, selectedShowtime)}
                    className={`w-full sm:w-auto px-12 py-4 font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3 ${
                      selectedShowtime
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-500/20 hover:scale-[1.02]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M13 3v18" /><path d="M3 13h18" />
                    </svg>
                    {selectedShowtime ? `Đặt vé suất ${selectedShowtime}` : 'Vui lòng chọn suất chiếu'}
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Giao dịch an toàn qua <span className="text-blue-400 font-semibold">Sui Network</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};