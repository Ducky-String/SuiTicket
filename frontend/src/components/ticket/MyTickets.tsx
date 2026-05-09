import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useEffect, useState } from 'react';

const PACKAGE_ID = "0xa40017ba82cb0e4b512e648c3dc9dc9416c02196059aa777cd3a0e8af2e70616";
const TICKET_TYPE = `${PACKAGE_ID}::suiticket::Ticket`;

interface TicketDetails {
  id: string;
  movie_name: string;
  image_url: string;
  quantity: string;
}

export const MyTickets = () => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [loading, setLoading] = useState(false);

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
      {tickets.map((ticket) => (
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
          </div>
          <div className="p-5 flex-grow flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Sở hữu</span>
              <h3 className="text-lg font-bold mt-1 text-white truncate">{ticket.movie_name}</h3>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-gray-500 uppercase font-medium">NFT ID</span>
                <span className="text-[10px] text-gray-400 font-mono">{ticket.id.slice(0, 6)}...{ticket.id.slice(-4)}</span>
              </div>
              
              <button
                onClick={() => handleBurnTicket(ticket.id)}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-red-900/20 active:scale-95"
              >
                SOÁT VÉ (SỬ DỤNG)
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

