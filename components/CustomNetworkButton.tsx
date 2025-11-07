// components/CustomNetworkButton.tsx
"use client";

import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { celoSepolia, baseSepolia } from "viem/chains";
import { CustomButton } from "./ui/CustomButton";
import Image from "next/image";
import { useEffect } from "react";

export function CustomNetworkButton() {
  const { open, close } = useAppKit();
  const { isConnected } = useAccount();
  const { chainId: appKitChainId } = useAppKitNetwork();

  const handleClick = () => {
    open({ view: "Networks" });
  };

  useEffect(() => {
    // Listen for network change events
    close();
    // Close the modal when network changes
    const modal = document.querySelector('appkit-modal[data-view="Networks"]');
    if (modal) {
      modal.remove();
    }
  }, [close]);

  return (
    <CustomButton
      icon={
        appKitChainId === celoSepolia.id ? (
          <Image
            src="/celo.png"
            alt="Celo Sepolia"
            width={24}
            height={24}
            className="rounded-full object-contain mr-1"
          />
        ) : appKitChainId === baseSepolia.id ? (
          <Image
            src="/base.png"
            alt="Base Sepolia"
            width={24}
            height={24}
            className="rounded-full object-contain mr-1"
          />
        ) : null
      }
      label={
        appKitChainId === celoSepolia.id
          ? "Celo Sepolia"
          : appKitChainId === baseSepolia.id
          ? "Base Sepolia"
          : isConnected
          ? "Unsupported Network"
          : "Select Network"
      }
      onClick={handleClick}
      variant="secondary"
    />
  );
}
