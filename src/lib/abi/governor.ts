import type { Abi, Address } from "viem"

export const governorAbi = [] as unknown as Abi

export const governorAddresses: Partial<Record<number, Address>> = {
  84532: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS_BASE_SEPOLIA as Address,
  44787: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS_CELO_SEPOLIA as Address,
}
