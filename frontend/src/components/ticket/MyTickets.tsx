import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const PACKAGE_ID = "0x9c49d21a7e7df43d44d7fd0b137e4b94304a7f465e2a44e73080090fa99f9c30";
const TICKET_TYPE = `${PACKAGE_ID}::suiticket::Ticket`;

interface TicketDetails {
  id: string;
  movie_name: string;
  image_url: string;
  showtime: string;
  quantity: string;
}

export const MyTickets = () => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicketQr, setSelectedTicketQr] = useState<string | null>(null);

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleBurnTicket = async (ticketId: string) => {
    const txb = new Transaction();

    txb.moveCall({
      target: `${PACKAGE_ID}::suiticket::burn_ticket`,
      arguments: [txb.object(ticketId)],
    });

    signAndExecute(
      { transaction: txb },
      {
        onSuccess: () => {
          alert("Soát vé thành công! Chúc bạn xem phim vui vẻ.");
          window.location.reload(); 
        },
        onError: (err) => {
          console.error("Lỗi khi soát vé:", err);
          alert("Có lỗi xảy ra khi soát vé.");
        },
      }
    );
  };

  useEffect(() => {
    const fetchTickets = async () => {
      if (!account?.address) return;
      setLoading(true);
      try {
        const ownedObjects = await client.getOwnedObjects({
          owner: account.address,
          options: { showContent: true },
          filter: {
            StructType: TICKET_TYPE,
          },
        });

        const objectIds = ownedObjects.data.map((obj) => obj.data?.objectId).filter(Boolean) as string[];

        if (objectIds.length === 0) {
          setTickets([]);
          setLoading(false);
          return;
        }

        const ticketObjects = await client.multiGetObjects({
          ids: objectIds,
          options: {
            showContent: true,
            showDisplay: true,
          },
        });

        const parsedTickets: TicketDetails[] = ticketObjects.map((obj) => {
          const data = obj.data;
          if (!data) return null;

          const content = data.content as any;
          const fields = content?.fields;

          const getSuiString = (field: any) => typeof field === 'object' ? field.data : field;

          return {
            id: data.objectId,
            movie_name: getSuiString(fields?.movie_name) || 'N/A',
            image_url: getSuiString(fields?.image_url) || '',
            showtime: getSuiString(fields?.showtime) || 'N/A',
            quantity: fields?.quantity || '0',
          };
        }).filter((t): t is TicketDetails => t !== null);

        setTickets(parsedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [account, client]);

  const getTicketStatus = (showtime: string) => {
    if (showtime === 'N/A') return { text: 'N/A', color: 'bg-gray-500' };
    
    const now = new Date();
    const [hours, minutes] = showtime.split(':').map(Number);
    const showtimeDate = new Date();
    showtimeDate.setHours(hours, minutes, 0, 0);

    const diffMinutes = (showtimeDate.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes > 30) {
      return { text: 'Sắp chiếu', color: 'bg-blue-500' };
    } else if (diffMinutes <= 30 && diffMinutes > -120) {
      return { text: 'Đang chiếu', color: 'bg-emerald-500 animate-pulse' };
    } else {
      return { text: 'Đã kết thúc', color: 'bg-red-500' };
    }
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Vui lòng kết nối ví để xem vé của bạn.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed">
        <p className="text-gray-400 text-lg">Bạn chưa sở hữu vé nào.</p>
        <p className="text-gray-500 text-sm mt-2">Hãy khám phá các phim đang chiếu và đặt vé ngay!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {tickets.map((ticket) => {
        const status = getTicketStatus(ticket.showtime);
        return (
          <div key={ticket.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group flex flex-col">
            <div className="aspect-[2/3] relative">
              <img
                src={ticket.image_url}
                alt={ticket.movie_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                x{ticket.quantity} Vé
              </div>
              <div className={`absolute bottom-4 left-4 ${status.color} text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-widest`}>
                {status.text}
              </div>
            </div>
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Sở hữu</span>
                <h3 className="text-lg font-bold mt-1 text-white truncate">{ticket.movie_name}</h3>
                <div className="flex items-center gap-2 mt-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-sm font-bold text-blue-400">{ticket.showtime}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">NFT ID</span>
                  <span className="text-[10px] text-gray-400 font-mono">{ticket.id.slice(0, 6)}...{ticket.id.slice(-4)}</span>
                </div>
                
                <button
                  onClick={() => setSelectedTicketQr(ticket.id)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16h.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                  HIỆN MÃ QR
                </button>

                <button
                  onClick={() => handleBurnTicket(ticket.id)}
                  className="w-full bg-gray-800 hover:bg-red-900/40 hover:text-red-400 text-gray-400 text-[10px] font-bold py-2 rounded-xl transition-all duration-300 border border-gray-700 hover:border-red-900/50"
                >
                  SOÁT VÉ THỦ CÔNG
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* QR Modal */}
      {selectedTicketQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedTicketQr(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Mã QR Vé Phim</h3>
              <p className="text-gray-400 text-sm mb-6">Đưa mã này cho nhân viên tại rạp để soát vé</p>
              
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6">
                <QRCodeCanvas 
                  value={selectedTicketQr} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <div className="text-[10px] font-mono text-gray-500 break-all bg-black/30 p-3 rounded-lg border border-gray-800">
                {selectedTicketQr}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
