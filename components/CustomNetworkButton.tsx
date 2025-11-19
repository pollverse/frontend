"use client";

import { useAccount, useSwitchChain } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, zora } from 'viem/chains';
import { CustomButton } from "./ui/CustomButton";
import Image from "next/image";
// import { Chain } from 'viem';
import { ChevronDown } from 'lucide-react';

const SUPPORTED_CHAINS = [mainnet, polygon, optimism, arbitrum, base, zora];

const CHAIN_ICONS: Record<number, string> = {
  [mainnet.id]: '/ethereum.png',
  [polygon.id]: '/polygon.png',
  [optimism.id]: '/optimism.png',
  [arbitrum.id]: '/arbitrum.png',
  [base.id]: '/base.png',
  [zora.id]: '/zora.png',
};

const CHAIN_NAMES: Record<number, string> = {
  [mainnet.id]: 'Ethereum',
  [polygon.id]: 'Polygon',
  [optimism.id]: 'Optimism',
  [arbitrum.id]: 'Arbitrum',
  [base.id]: 'Base',
  [zora.id]: 'Zora',
};

export function CustomNetworkButton() {
  const { chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  const currentChain = chains.find((c) => c.id === chain?.id);
  
  // const currentChain = chain ? SUPPORTED_CHAINS.find((c) => c.id === chain.id) : null;
  const isUnsupported = chain == null || undefined;

  const handleNetworkChange = (chainId: number) => {
    if (switchChain) {
      switchChain({ chainId });
    }
  };

  return (
    <div className="relative group">
      <CustomButton
        icon={
          currentChain && CHAIN_ICONS[currentChain.id] ? (
            <Image
              src={CHAIN_ICONS[currentChain.id]}
              alt={currentChain.name}
              width={24}
              height={24}
              className="rounded-full object-contain mr-1"
            />
          ) : null
        }
        variant="secondary"
        className="flex items-center gap-1"
      >
        {isUnsupported 
          ? 'Unsupported Network' 
          : currentChain 
            ? CHAIN_NAMES[currentChain.id] || currentChain.name
            : 'Select Network'
        }
        <ChevronDown className="w-4 h-4 ml-1" />
      </CustomButton>
      
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 hidden group-hover:block">
        <div className="py-1">
          {SUPPORTED_CHAINS.map((supportedChain) => (
            <button
              key={supportedChain.id}
              onClick={() => handleNetworkChange(supportedChain.id)}
              className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                chain?.id === supportedChain.id
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {CHAIN_ICONS[supportedChain.id] && (
                <Image
                  src={CHAIN_ICONS[supportedChain.id]}
                  alt={supportedChain.name}
                  width={20}
                  height={20}
                  className="rounded-full mr-2"
                />
              )}
              <span>{CHAIN_NAMES[supportedChain.id] || supportedChain.name}</span>
              {chain?.id === supportedChain.id && (
                <span className="ml-auto text-green-500">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
