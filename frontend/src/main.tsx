import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./styles/index.css";

// 1. Nếu '@mysten/sui/client' báo lỗi không có member, hãy thêm .js như dưới đây
import { createSuiClient } from '@mysten/sui.js/client'; 
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

// 2. Tạo client riêng biệt để làm bộ máy vận hành (transport)
const testnetClient = createSuiClient({ url: "https://fullnode.testnet.sui.io:443" });

// 3. Khai báo config với đầy đủ các thuộc tính mà TS đang đòi hỏi
const { networkConfig } = createNetworkConfig({
  testnet: { 
    url: "https://fullnode.testnet.sui.io:443",
    transport: testnetClient as any // Ép kiểu 'any' ở đây để vượt qua lỗi ts(2322) nhanh nhất
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);