"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import type { Abi, Address } from "viem"

export function useDaoCount(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const query = useReadContract({
    address,
    abi,
    functionName: "getDaoCount",
    query: {
      refetchOnWindowFocus: true,
    },
  })
  return query
}

export function useAllDaos(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const query = useReadContract({
    address,
    abi,
    functionName: "getAllDaos",
    query: {
      refetchOnWindowFocus: true,
    },
  })
  return query
}

export function useDaosByCreator(params: { address: Address; abi: Abi; creator: Address }) {
  const { address, abi, creator } = params
  const query = useReadContract({
    address,
    abi,
    functionName: "getDaosByCreator",
    args: [creator],
    query: {
      refetchOnWindowFocus: true,
    },
  })
  return query
}

export function useCreateDAO(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  function createDAO(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "createDAO", args })
  }

  const receipt = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: Boolean(hash),
    },
  })

  return {
    createDAO,
    txHash: hash,
    isPending,
    error,
    receipt,
  }
}
