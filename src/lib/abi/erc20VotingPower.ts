import type { Abi, Address } from "viem"

export const erc20VotingPowerAbi = [] as unknown as Abi

export const erc20VotingPowerAddresses: Partial<Record<number, Address>> = {
  84532: process.env.NEXT_PUBLIC_ERC20_VP_ADDRESS_BASE_SEPOLIA as Address,
  44787: process.env.NEXT_PUBLIC_ERC20_VP_ADDRESS_CELO_SEPOLIA as Address,
}
