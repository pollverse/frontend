"use client"

import type { Abi, Address } from "viem"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"

export function useMinDelay(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  return useReadContract({ address, abi, functionName: "getMinDelay", query: { refetchOnWindowFocus: true } })
}

export function useIsOperationPending(params: { address: Address; abi: Abi; id: `0x${string}` }) {
  const { address, abi, id } = params
  return useReadContract({ address, abi, functionName: "isOperationPending", args: [id], query: { refetchOnWindowFocus: true } })
}

export function useIsOperationReady(params: { address: Address; abi: Abi; id: `0x${string}` }) {
  const { address, abi, id } = params
  return useReadContract({ address, abi, functionName: "isOperationReady", args: [id], query: { refetchOnWindowFocus: true } })
}

export function useIsOperationDone(params: { address: Address; abi: Abi; id: `0x${string}` }) {
  const { address, abi, id } = params
  return useReadContract({ address, abi, functionName: "isOperationDone", args: [id], query: { refetchOnWindowFocus: true } })
}

export function useSchedule(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function schedule(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "schedule", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { schedule, txHash: hash, isPending, error, receipt }
}

export function useExecute(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function execute(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "execute", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { execute, txHash: hash, isPending, error, receipt }
}

export function useCancel(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function cancel(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "cancel", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { cancel, txHash: hash, isPending, error, receipt }
}
