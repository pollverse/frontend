// components/CustomConnectButton.tsx
"use client"

import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { CustomButton } from "./ui/CustomButton"

export function CustomConnectButton() {
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()

  const handleClick = () => {
    if (isConnected) {
      open({ view: "Account" })
    } else {
      open({ view: "Connect" })
    }
  }

  return (
    <CustomButton
      label={isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
      onClick={handleClick}
      variant="primary"
    />
  )
}
