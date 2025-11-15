import type { Abi, Address } from "viem"

export const erc721VotingPowerAbi = [] as unknown as Abi

export const erc721VotingPowerAddresses: Partial<Record<number, Address>> = {
  84532: process.env.NEXT_PUBLIC_ERC721_VP_ADDRESS_BASE_SEPOLIA as Address,
  44787: process.env.NEXT_PUBLIC_ERC721_VP_ADDRESS_CELO_SEPOLIA as Address,
}
