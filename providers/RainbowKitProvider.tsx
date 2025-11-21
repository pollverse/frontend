'use client';

import * as React from 'react';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia, celoSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';

export const chains = [celoSepolia, baseSepolia] as const;

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, metaMaskWallet, coinbaseWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Pollverse',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: {
    [celoSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function RainbowKitProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7c3aed',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          {mounted ? children : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}