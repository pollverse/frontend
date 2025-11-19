"use client"

import type { Abi, Address } from "viem"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"

export function useETHBalance(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  return useReadContract({ address, abi, functionName: "getETHBalance", query: { refetchOnWindowFocus: true } })
}

export function useTokenBalance(params: { address: Address; abi: Abi; token: Address }) {
  const { address, abi, token } = params
  return useReadContract({ address, abi, functionName: "getTokenBalance", args: [token], query: { refetchOnWindowFocus: true } })
}

export function useWithdrawETH(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function withdrawETH(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "withdrawETH", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { withdrawETH, txHash: hash, isPending, error, receipt }
}

export function useWithdrawToken(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function withdrawToken(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "withdrawToken", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { withdrawToken, txHash: hash, isPending, error, receipt }
}

export function useTreasury(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { data } = useReadContract({ address, abi, functionName: "getTreasuryData", query: { refetchOnWindowFocus: true } })
  return data
}
