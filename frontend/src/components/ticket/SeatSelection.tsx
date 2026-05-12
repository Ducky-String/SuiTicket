import { useState } from 'react';

// Giới hạn số ghế tối đa khớp với MAX_QUANTITY trong Move contract
const MAX_SEATS = 100;

interface SeatSelectionProps {
  movieTitle: string;
  showtime: string;
  pricePerSeat: number;
  occupiedSeats?: string[]; // New prop
  onConfirm: (selectedSeats: string[]) => void;
  onCancel: () => void;
}

export const SeatSelection = ({ movieTitle, showtime, pricePerSeat, occupiedSeats = [], onConfirm, onCancel }: SeatSelectionProps) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = Array.from({ length: 14 }, (_, i) => i + 1);
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return; // Prevent selecting occupied seats

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      // Kiểm tra giới hạn MAX_SEATS (100) để khớp với contract
      if (selectedSeats.length >= MAX_SEATS) {
        alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế mỗi lần mua.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalPrice = selectedSeats.length * pricePerSeat;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:rotate-90 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="p-8 md:p-12 overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">Chọn vị trí ngồi</h2>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <span className="font-bold text-blue-400">{movieTitle}</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span className="text-emerald-400 font-medium">{showtime}</span>
            </p>
            {selectedSeats.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Đã chọn {selectedSeats.length}/{MAX_SEATS} ghế tối đa
              </p>
            )}
          </div>

          {/* Screen */}
          <div className="relative mb-20">
            <div className="w-4/5 h-2 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full shadow-[0_15px_40px_rgba(59,130,246,0.5)]"></div>
            <div className="text-center mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/50">Màn hình</div>
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col gap-3 items-center justify-center mb-12 min-w-fit">
            {rows.map(row => (
              <div key={row} className="flex gap-2 items-center">
                <span className="w-6 text-xs font-bold text-gray-600 mr-2">{row}</span>
                <div className="flex gap-2">
                  {cols.map(col => {
                    const seatId = `${row}${col}`;
                    const isSelected = selectedSeats.includes(seatId);
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isMaxReached = selectedSeats.length >= MAX_SEATS && !isSelected;
                    
                    return (
                      <button
                        key={seatId}
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl text-[10px] font-bold transition-all duration-300 transform active:scale-75 ${
                          isOccupied
                            ? 'bg-red-900/40 border border-red-900/50 text-red-500/50 cursor-not-allowed'
                            : isSelected 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110 rotate-3' 
                              : isMaxReached
                                ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-gray-800 border border-gray-700 text-gray-500 hover:border-blue-500/50 hover:text-blue-400'
                        }`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
                <span className="w-6 text-xs font-bold text-gray-600 ml-2">{row}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border border-gray-700 rounded-md"></div>
              <span className="text-xs text-gray-500 font-medium">Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-md shadow-sm"></div>
              <span className="text-xs text-gray-500 font-medium">Đang chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-900/50 border border-red-900 rounded-md"></div>
              <span className="text-xs text-gray-500 font-medium">Đã đặt</span>
            </div>
          </div>
        </div>

        {/* Footer / Summary */}
        <div className="p-8 bg-gray-900/50 border-t border-gray-800 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ghế đã chọn</p>
              <div className="flex flex-wrap gap-2 min-h-[1.5rem]">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map(seat => (
                    <span key={seat} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-md border border-blue-500/20">
                      {seat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-600 text-xs italic">Chưa chọn ghế</span>
                )}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-800 hidden md:block"></div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tổng thanh toán</p>
              <p className="text-2xl font-black text-white">
                {totalPrice.toFixed(2)} <span className="text-blue-500">SUI</span>
              </p>
            </div>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={() => onConfirm(selectedSeats)}
            className={`w-full md:w-auto px-12 py-4 font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3 ${
              selectedSeats.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-500/20 hover:scale-[1.02]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Xác nhận mua vé
          </button>
        </div>

      </div>
    </div>
  );
};
