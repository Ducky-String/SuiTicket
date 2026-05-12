import { useState, useEffect, useRef, useCallback } from 'react';
import { useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { TICKET_PACKAGE_ID } from '../../constants/contracts';

// Dùng constant từ contracts.ts — nhất quán với MyTickets.tsx
const PACKAGE_ID = TICKET_PACKAGE_ID.testnet;
const TICKET_TYPE = `${PACKAGE_ID}::suiticket::Ticket`;

// ID duy nhất cho phần tử DOM của scanner
const SCANNER_DOM_ID = 'qr-reader';

type FacingMode = 'environment' | 'user';

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

  // Camera state
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  // --- verifyTicket: ổn định, chỉ dùng state setters + client (stable) ---
  const verifyTicket = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setTicketInfo(null);

    try {
      const response = await client.getObject({
        id,
        options: { showContent: true, showType: true }
      });

      if (response.error) {
        setError('Không tìm thấy vé. Có thể vé đã bị xóa hoàn toàn khỏi blockchain.');
        return;
      }

      const data = response.data;
      if (!data) {
        setError('Dữ liệu vé không hợp lệ.');
        return;
      }

      // Normalize type để tránh case-mismatch từ Sui RPC
      // (VD: Sui có thể trả về địa chỉ với cách format khác)
      const normalizeType = (t: string) => t?.toLowerCase().replace(/\s/g, '') || '';
      const isAuthentic = normalizeType(data.type) === normalizeType(TICKET_TYPE);

      // Debug log — giúp kiểm tra nếu type không khớp
      if (!isAuthentic) {
        console.warn('[StaffScanner] Type mismatch!');
        console.warn('  → Nhận được từ chain:', data.type);
        console.warn('  → Kỳ vọng (TICKET_TYPE):', TICKET_TYPE);
      }
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
      console.error('Verification error:', err);
      setError('Lỗi khi kiểm tra vé. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [client]);

  // --- Khởi động scanner với facing mode cụ thể ---
  const startScanner = useCallback(async (mode: FacingMode) => {
    setCameraError(null);

    // Dừng scanner cũ nếu đang chạy
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        // Bỏ qua lỗi khi dừng
      }
      html5QrCodeRef.current = null;
    }

    const qrCode = new Html5Qrcode(SCANNER_DOM_ID);
    html5QrCodeRef.current = qrCode;

    const config: Html5QrcodeCameraScanConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    try {
      await qrCode.start(
        { facingMode: { ideal: mode } }, // ideal = ưu tiên camera này, fallback nếu không có
        config,
        (decodedText) => {
          // Tránh duplicate: chỉ process nếu QR khác lần trước
          if (decodedText !== lastScannedRef.current) {
            lastScannedRef.current = decodedText;
            setScanResult(decodedText);
            verifyTicket(decodedText);
          }
        },
        () => {
          // Lỗi decode bình thường (camera đang tìm QR) — bỏ qua
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      // Nếu camera sau không có, thử camera trước
      if (mode === 'environment') {
        try {
          await qrCode.start(
            { facingMode: 'user' },
            config,
            (decodedText) => {
              if (decodedText !== lastScannedRef.current) {
                lastScannedRef.current = decodedText;
                setScanResult(decodedText);
                verifyTicket(decodedText);
              }
            },
            () => {}
          );
          setFacingMode('user');
          setIsScanning(true);
          setCameraError('Thiết bị không có camera sau. Đang dùng camera trước.');
        } catch (fallbackErr) {
          setCameraError('Không thể truy cập camera. Vui lòng cấp quyền camera và thử lại.');
          setIsScanning(false);
        }
      } else {
        setCameraError('Không thể truy cập camera. Vui lòng cấp quyền camera và thử lại.');
        setIsScanning(false);
      }
    }
  }, [verifyTicket]);

  // --- Toggle giữa camera trước / sau ---
  const toggleCamera = async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    const newMode: FacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    lastScannedRef.current = null; // Reset để scan lại
    await startScanner(newMode);
    setIsSwitching(false);
  };

  // Khởi động scanner lần đầu với camera sau
  useEffect(() => {
    startScanner('environment');

    return () => {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          html5QrCodeRef.current.clear();
        } catch (e) {
          // Bỏ qua lỗi cleanup
        }
        html5QrCodeRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          alert('Soát vé thành công! Đã trừ 1 lượt sử dụng.');
          verifyTicket(ticketInfo.id);
        },
        onError: (err) => {
          console.error('Redeem error:', err);
          alert('Lỗi khi soát vé. Có thể bạn không đủ quyền hoặc vé đã hết lượt.');
        }
      }
    );
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      lastScannedRef.current = null;
      verifyTicket(manualId.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          HỆ THỐNG SOÁT VÉ
        </h2>
        <p className="text-gray-500 mt-2">Dành cho nhân viên rạp phim SuiTicket</p>
      </div>

      {/* Scanner Section */}
      <div className="mb-6">
        {/* Camera Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Camera indicator dot */}
            <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {isScanning
                ? facingMode === 'environment' ? 'Camera sau' : 'Camera trước'
                : 'Camera tắt'}
            </span>
          </div>

          {/* Toggle Camera Button */}
          <button
            onClick={toggleCamera}
            disabled={isSwitching}
            title={facingMode === 'environment' ? 'Chuyển sang camera trước' : 'Chuyển sang camera sau'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isSwitching
                ? 'border-gray-700 text-gray-600 cursor-wait'
                : 'border-gray-700 text-gray-300 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5'
            }`}
          >
            {isSwitching ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {isSwitching
              ? 'Đang chuyển...'
              : facingMode === 'environment' ? '↺ Camera trước' : '↺ Camera sau'}
          </button>
        </div>

        {/* Camera warning */}
        {cameraError && (
          <div className="mb-3 px-4 py-2 bg-amber-900/20 border border-amber-700/40 rounded-xl text-amber-400 text-xs font-medium flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {cameraError}
          </div>
        )}

        {/* Scanner viewport */}
        <div className="overflow-hidden rounded-2xl border-2 border-gray-800 bg-black relative">
          {/* Camera label overlay */}
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                {facingMode === 'environment' ? 'REAR' : 'FRONT'}
              </span>
            </div>
          </div>
          {/* Dom element html5-qrcode sẽ inject vào đây */}
          <div id={SCANNER_DOM_ID} className="w-full" />
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-3 uppercase tracking-widest font-medium">
          Hướng camera vào mã QR trên vé của khách
        </p>
      </div>

      {/* Manual Entry */}
      <form onSubmit={handleManualVerify} className="flex gap-2 mb-6">
        <input
          type="text"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Hoặc nhập NFT Object ID thủ công..."
          className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all border border-gray-700 active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Đang kiểm tra...' : 'KIỂM TRA'}
        </button>
      </form>

      {/* Last scanned badge */}
      {scanResult && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <p className="text-[10px] text-gray-500 font-mono truncate">
            Đã quét: {scanResult}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Đang truy vấn dữ liệu Blockchain...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-6 bg-red-900/20 border border-red-900/50 rounded-2xl text-red-400 text-center animate-in fade-in zoom-in duration-300">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Ticket Result */}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
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
            {/* 
              BUG FIX: Status phải check CẢ isAuthentic VÀ isBurned.
              Trước đây chỉ check isBurned → vé giả mạo vẫn hiện "VÉ HỢP LỆ"
            */}
            {(() => {
              const isValid = ticketInfo.isAuthentic && !ticketInfo.isBurned;
              const statusColor = isValid
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400';
              const statusIcon = isValid ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              );
              const statusText = isValid
                ? 'VÉ HỢP LỆ — CHO PHÉP VÀO RẠP'
                : !ticketInfo.isAuthentic
                  ? 'VÉ KHÔNG HỢP LỆ — TỪ CHỐI VÀO RẠP'
                  : 'VÉ ĐÃ HẾT LƯỢT SỬ DỤNG';
              return (
                <div className={`flex items-center gap-3 p-4 rounded-2xl ${statusColor}`}>
                  {statusIcon}
                  <span className="font-bold">{statusText}</span>
                </div>
              );
            })()}

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
