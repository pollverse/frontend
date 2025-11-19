"use client"

import type { Abi, Address } from "viem"
import { useReadContract } from "wagmi"

export function useERC20VotingPower(params: {
  token: Address
  abi: Abi
  account: Address
}) {
  const { token, abi, account } = params

  const balance = useReadContract({
    address: token,
    abi,
    functionName: "balanceOf",
    args: [account],
    query: { refetchOnWindowFocus: true },
  })

  const totalSupply = useReadContract({
    address: token,
    abi,
    functionName: "totalSupply",
    query: { refetchOnWindowFocus: true },
  })

  const decimals = useReadContract({
    address: token,
    abi,
    functionName: "decimals",
    query: { refetchOnWindowFocus: false },
  })

  return { balance, totalSupply, decimals }
}
