import React, { ReactNode } from 'react';  
import {base, mainnet, mantle, sepolia, polygon , sonicTestnet , hederaTestnet} from 'viem/chains';

// import './index.css';

import { PrivyProvider } from '@privy-io/react-auth';

// import App from './App';

// Define the props type
interface PrivyProviderWrapperProps {
  children: ReactNode;
}

 const sonicBlazeTestnet =({
  id: 57054,
  name: 'Sonic Blaze Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic Blaze Testnet',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Blaze Testnet Explorer',
      url: 'https://blaze.soniclabs.com/',
    },
  },
  testnet: true,
})


// const hederaTestnet =({
//   id: 296,
//   name: 'Hedera Testnet',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Hedera Testnet',
//     symbol: 'HBAR',
//   },
//   rpcUrls: {
//     default: { http: ['https://testnet.hashio.io/api'] },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Hedera Testnet Explorer',
//       url: ' https://hashscan.io/testnet',
//     },
//   },
//   testnet: true,
// })


export const Providers: React.FC<PrivyProviderWrapperProps> = ({ children }) => {
  return (
    <PrivyProvider
      appId="cm4jsvuou01cnyejck56sr8ba"
      config={{
        loginMethods: ['wallet','email'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          // logo: 'https://i.imgur.com/6IYBfVa.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain:  hederaTestnet ,
        // Replace this with a list of your desired supported chains
        supportedChains: [  hederaTestnet ] ,
      }}
    >
      {children}
    </PrivyProvider>
  );
}; 