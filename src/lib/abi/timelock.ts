import type { Abi, Address } from "viem"

export const timelockAbi = [] as unknown as Abi

export const timelockAddresses: Partial<Record<number, Address>> = {
  84532: process.env.NEXT_PUBLIC_TIMELOCK_ADDRESS_BASE_SEPOLIA as Address,
  44787: process.env.NEXT_PUBLIC_TIMELOCK_ADDRESS_CELO_SEPOLIA as Address,
}
