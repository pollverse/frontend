"use client"

import type { Abi, Address } from "viem"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"

export function useQuorumPercentage(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  return useReadContract({ address, abi, functionName: "quorumPercentage", query: { refetchOnWindowFocus: true } })
}

export function useProposalThreshold(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  return useReadContract({ address, abi, functionName: "proposalThreshold", query: { refetchOnWindowFocus: true } })
}

export function useProposalState(params: { address: Address; abi: Abi; proposalId: bigint }) {
  const { address, abi, proposalId } = params
  return useReadContract({ address, abi, functionName: "state", args: [proposalId], query: { refetchOnWindowFocus: true } })
}

export function useProposalSnapshot(params: { address: Address; abi: Abi; proposalId: bigint }) {
  const { address, abi, proposalId } = params
  return useReadContract({ address, abi, functionName: "proposalSnapshot", args: [proposalId], query: { refetchOnWindowFocus: true } })
}

export function useProposalDeadline(params: { address: Address; abi: Abi; proposalId: bigint }) {
  const { address, abi, proposalId } = params
  return useReadContract({ address, abi, functionName: "proposalDeadline", args: [proposalId], query: { refetchOnWindowFocus: true } })
}

export function useProposalVotes(params: { address: Address; abi: Abi; proposalId: bigint }) {
  const { address, abi, proposalId } = params
  return useReadContract({ address, abi, functionName: "proposalVotes", args: [proposalId], query: { refetchOnWindowFocus: true } })
}

export function useProposalMetadata(params: { address: Address; abi: Abi; proposalId: bigint }) {
  const { address, abi, proposalId } = params
  return useReadContract({ address, abi, functionName: "getProposalMetadata", args: [proposalId], query: { refetchOnWindowFocus: true } })
}

export function usePropose(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function propose(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "propose", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { propose, txHash: hash, isPending, error, receipt }
}

export function useProposeWithMetadata(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function proposeWithMetadata(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "proposeWithMetadata", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { proposeWithMetadata, txHash: hash, isPending, error, receipt }
}

export function useCastVote(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function castVote(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "castVote", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { castVote, txHash: hash, isPending, error, receipt }
}

export function useCastVoteWithReason(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  function castVoteWithReason(args: readonly unknown[]) {
    return writeContract({ address, abi, functionName: "castVoteWithReason", args })
  }
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: Boolean(hash) } })
  return { castVoteWithReason, txHash: hash, isPending, error, receipt }
}

export function useGovernor(params: { address: Address; abi: Abi }) {
  const { address, abi } = params
  const { data } = useReadContract({ address, abi, functionName: "getGovernorData", query: { refetchOnWindowFocus: true } })
  return data
}
