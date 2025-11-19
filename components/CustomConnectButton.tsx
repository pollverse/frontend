"use client"

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { CustomButton } from "./ui/CustomButton"

export function CustomConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
        <CustomButton 
          label="Disconnect"
          onClick={() => disconnect()}
          variant="secondary"
        />
      </div>
    )
  }

  return (
    <RainbowConnectButton.Custom>
      {({ openConnectModal }) => (
        <CustomButton
          label="Connect Wallet"
          onClick={openConnectModal}
          variant="primary"
        />
      )}
    </RainbowConnectButton.Custom>
  )
}
