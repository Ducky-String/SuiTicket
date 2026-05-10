import { useState, useEffect, useRef } from 'react';
import { useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Html5QrcodeScanner } from 'html5-qrcode';

const PACKAGE_ID = "0x9c49d21a7e7df43d44d7fd0b137e4b94304a7f465e2a44e73080090fa99f9c30";
const TICKET_TYPE = `${PACKAGE_ID}::suiticket::Ticket`;

interface VerifiedTicket {
  id: string;
  movieName: string;
  showtime: string;
  quantity: number;
  isAuthentic: boolean;
  isBurned: boolean;
}

export const StaffScanner = () => {
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [ticketInfo, setTicketInfo] = useState<VerifiedTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  function onScanSuccess(decodedText: string) {
    if (decodedText !== scanResult) {
      setScanResult(decodedText);
      verifyTicket(decodedText);
    }
  }

  function onScanFailure(_error: any) {
    // console.warn(`Code scan error = ${error}`);
  }

  const verifyTicket = async (id: string) => {
    setLoading(true);
    setError(null);
    setTicketInfo(null);
    
    try {
      const response = await client.getObject({
        id,
        options: { showContent: true, showType: true }
      });

      if (response.error) {
        setError("Không tìm thấy vé. Có thể vé đã bị xóa hoàn toàn khỏi blockchain.");
        return;
      }

      const data = response.data;
      if (!data) {
        setError("Dữ liệu vé không hợp lệ.");
        return;
      }

      const isAuthentic = data.type === TICKET_TYPE;
      const content = data.content as any;
      const fields = content?.fields;
      
      const getSuiString = (field: any) => typeof field === 'object' ? field.data : field;

      const quantity = fields?.quantity ? parseInt(fields.quantity) : 0;
      const movieName = getSuiString(fields?.movie_name);
      const showtime = getSuiString(fields?.showtime);

      setTicketInfo({
        id,
        movieName: movieName || 'N/A',
        showtime: showtime || 'N/A',
        quantity,
        isAuthentic,
        isBurned: quantity <= 0
      });

    } catch (err) {
      console.error("Verification error:", err);
      setError("Lỗi khi kiểm tra vé. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!ticketInfo) return;

    const txb = new Transaction();
    txb.moveCall({
      target: `${PACKAGE_ID}::suiticket::use_one_ticket`,
      arguments: [txb.object(ticketInfo.id)],
    });

    signAndExecute(
      { transaction: txb },
      {
        onSuccess: () => {
          alert("Soát vé thành công! Đã trừ 1 lượt sử dụng.");
          verifyTicket(ticketInfo.id); // Refresh info
        },
        onError: (err) => {
          console.error("Redeem error:", err);
          alert("Lỗi khi soát vé. Có thể bạn không đủ quyền hoặc vé đã hết lượt.");
        }
      }
    );
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      verifyTicket(manualId.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          HỆ THỐNG SOÁT VÉ
        </h2>
        <p className="text-gray-500 mt-2">Dành cho nhân viên rạp phim SuiTicket</p>
      </div>

      {/* Scanner Section */}
      <div className="mb-8 overflow-hidden rounded-2xl border-2 border-gray-800 bg-black">
        <div id="reader" className="w-full"></div>
      </div>

      {/* Manual Entry */}
      <form onSubmit={handleManualVerify} className="flex gap-2 mb-8">
        <input 
          type="text" 
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Nhập NFT ID thủ công..."
          className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all border border-gray-700 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Đang kiểm tra...' : 'KIỂM TRA'}
        </button>
      </form>

      {/* Result Section */}
      {loading && (
        <div className="flex flex-col items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Đang truy vấn dữ liệu Blockchain...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-900/20 border border-red-900/50 rounded-2xl text-red-400 text-center animate-in fade-in zoom-in duration-300">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <p className="font-bold">{error}</p>
        </div>
      )}

      {ticketInfo && (
        <div className={`p-8 rounded-3xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
          ticketInfo.isAuthentic && !ticketInfo.isBurned 
            ? 'bg-emerald-950/20 border-emerald-500/30' 
            : 'bg-red-950/20 border-red-500/30'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                ticketInfo.isAuthentic ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {ticketInfo.isAuthentic ? 'CHÍNH HÃNG' : 'GIẢ MẠO'}
              </span>
              <h3 className="text-2xl font-bold mt-2">{ticketInfo.movieName}</h3>
              <div className="flex items-center gap-2 mt-1 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="font-black text-lg">SUẤT: {ticketInfo.showtime}</span>
              </div>
              <p className="text-gray-500 text-[10px] font-mono mt-2 break-all">{ticketInfo.id}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-500 text-[10px] uppercase block">Còn lại</span>
              <span className={`text-4xl font-black ${ticketInfo.isBurned ? 'text-red-500' : 'text-emerald-500'}`}>
                {ticketInfo.quantity}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${
              ticketInfo.isBurned ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {ticketInfo.isBurned ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              )}
              <span className="font-bold">
                {ticketInfo.isBurned ? 'VÉ ĐÃ HẾT LƯỢT SỬ DỤNG' : 'VÉ HỢP LỆ - CHO PHÉP VÀO RẠP'}
              </span>
            </div>

            {ticketInfo.isAuthentic && !ticketInfo.isBurned && (
              <button 
                onClick={handleRedeem}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
              >
                XÁC NHẬN SOÁT VÉ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
