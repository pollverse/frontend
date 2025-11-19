import type { Abi, Address } from "viem"

export const treasuryAbi = [] as unknown as Abi

export const treasuryAddresses: Partial<Record<number, Address>> = {
  84532: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_BASE_SEPOLIA as Address,
  44787: process.env.NEXT_PUBLIC_TREASURY_ADDRESS_CELO_SEPOLIA as Address,
}
