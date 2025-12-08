import { useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { readContract } from '@wagmi/core';
import { Address } from 'viem';
import { governorAbi } from '@/lib/abi/core/governor';

export type VoteType = 0 | 1 | 2; // 0=Against, 1=For, 2=Abstain
export type ProposalState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed

export interface ProposalMetadata {
  title: string;
  description: string;
  proposalType: string;
  proposedSolution: string;
  rationale: string;
  expectedOutcomes: string;
  timeline: string;
  budget: string;
  proposer: Address;
  timestamp: bigint;
  status: number;
  votesFor: bigint;
  votesAgainst: bigint;
  quorumReachedPct: bigint;
}

export interface CreateProposalParams {
  targets: Address[];
  values: bigint[];
  calldatas: string[];
  description: string;
  metadata?: Omit<ProposalMetadata, 'proposer' | 'timestamp' | 'status' | 'votesFor' | 'votesAgainst' | 'quorumReachedPct'>;
}

export const useGovernor = (contractAddress?: Address) => {
  const config = useConfig();

  // Read governor state
  const {
    data: tokenAddress,
    isPending: isLoadingToken,
    refetch: refetchToken,
  } = useReadContract({
    address: contractAddress,
    abi: governorAbi,
    functionName: 'token',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: timelockAddress,
    isPending: isLoadingTimelock,
    refetch: refetchTimelock,
  } = useReadContract({
    address: contractAddress,
    abi: governorAbi,
    functionName: 'timelock',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: votingDelayData,
    isPending: isLoadingVotingDelay,
    refetch: refetchVotingDelay,
  } = useReadContract({
    address: contractAddress,
    abi: governorAbi,
    functionName: 'votingDelay',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: votingPeriodData,
    isPending: isLoadingVotingPeriod,
    refetch: refetchVotingPeriod,
  } = useReadContract({
    address: contractAddress,
    abi: governorAbi,
    functionName: 'votingPeriod',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: proposalThresholdData,
    isPending: isLoadingProposalThreshold,
    refetch: refetchProposalThreshold,
  } = useReadContract({
    address: contractAddress,
    abi: governorAbi,
    functionName: 'proposalThreshold',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: quorumPercentageData,
    isPending: isLoadingQuorumPercentage,
    refetch: refetchQuorumPercentage,
  } = useReadContract({
    address: contractAddress,
    abi: governorAbi,
    functionName: 'quorumPercentage',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Write operations
  const { 
    writeContractAsync: proposeAsync, 
    data: proposeTxHash,
    isPending: isProposeLoading,
    error: proposeError,
    reset: resetPropose
  } = useWriteContract();

  const { 
    writeContractAsync: castVoteAsync, 
    data: voteTxHash,
    isPending: isVoteLoading,
    error: voteError,
    reset: resetVote
  } = useWriteContract();

  const { 
    writeContractAsync: castVoteWithReasonAsync, 
    data: voteWithReasonTxHash,
    isPending: isVoteWithReasonLoading,
    error: voteWithReasonError
  } = useWriteContract();

  const { 
    writeContractAsync: executeAsync, 
    data: executeTxHash,
    isPending: isExecuteLoading,
    error: executeError
  } = useWriteContract();

  const { 
    writeContractAsync: cancelAsync, 
    data: cancelTxHash,
    isPending: isCancelLoading,
    error: cancelError
  } = useWriteContract();

  const { 
    writeContractAsync: queueAsync, 
    data: queueTxHash,
    isPending: isQueueLoading,
    error: queueError
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isWaitingForPropose } = useWaitForTransactionReceipt({
    hash: proposeTxHash,
  });

  const { isLoading: isWaitingForVote } = useWaitForTransactionReceipt({
    hash: voteTxHash || voteWithReasonTxHash,
  });

  const { isLoading: isWaitingForExecute } = useWaitForTransactionReceipt({
    hash: executeTxHash,
  });

  const { isLoading: isWaitingForCancel } = useWaitForTransactionReceipt({
    hash: cancelTxHash,
  });

  const { isLoading: isWaitingForQueue } = useWaitForTransactionReceipt({
    hash: queueTxHash,
  });

  // Get proposal state
  const getProposalState = useCallback(async (proposalId: bigint): Promise<ProposalState | null> => {
    if (!contractAddress) return null;
    
    try {
      const state = await readContract(config, {
        address: contractAddress,
        abi: governorAbi,
        functionName: 'state',
        args: [proposalId],
      });
      return state as ProposalState;
    } catch (error) {
      console.error('Error fetching proposal state:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Get proposal metadata
  const getProposalMetadata = useCallback(async (proposalId: bigint): Promise<ProposalMetadata | null> => {
    if (!contractAddress) return null;
    
    try {
      const metadata = await readContract(config, {
        address: contractAddress,
        abi: governorAbi,
        functionName: 'getProposalMetadata',
        args: [proposalId],
      });
      
      if (!metadata) return null;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = metadata as any[];
      return {
        title: data[0],
        description: data[1],
        proposalType: data[2],
        proposedSolution: data[3],
        rationale: data[4],
        expectedOutcomes: data[5],
        timeline: data[6],
        budget: data[7],
        proposer: data[8],
        timestamp: data[9],
        status: data[10],
        votesFor: data[11],
        votesAgainst: data[12],
        quorumReachedPct: data[13],
      };
    } catch (error) {
      console.error('Error fetching proposal metadata:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Create a new proposal
  const createProposal = useCallback(async (params: CreateProposalParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    const { targets, values, calldatas, description } = params;

    resetPropose();

    try {
      const hash = await proposeAsync({
        address: contractAddress,
        abi: governorAbi,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
      });

      return hash;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }, [contractAddress, proposeAsync, resetPropose]);

  // Vote on a proposal (simple vote without reason)
  const castVote = useCallback(async (proposalId: bigint, support: VoteType) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    resetVote();

    try {
      const hash = await castVoteAsync({
        address: contractAddress,
        abi: governorAbi,
        functionName: 'castVote',
        args: [proposalId, support],
      });

      return hash;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }, [contractAddress, castVoteAsync, resetVote]);

  // Vote on a proposal with reason
  const castVoteWithReason = useCallback(async (
    proposalId: bigint, 
    support: VoteType, 
    reason: string
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await castVoteWithReasonAsync({
        address: contractAddress,
        abi: governorAbi,
        functionName: 'castVoteWithReason',
        args: [proposalId, support, reason],
      });

      return hash;
    } catch (error) {
      console.error('Error casting vote with reason:', error);
      throw error;
    }
  }, [contractAddress, castVoteWithReasonAsync]);

  // Convenience vote function that handles both cases
  const vote = useCallback(async (
    proposalId: bigint, 
    support: VoteType, 
    reason?: string
  ) => {
    if (reason && reason.trim() !== '') {
      return castVoteWithReason(proposalId, support, reason);
    }
    return castVote(proposalId, support);
  }, [castVote, castVoteWithReason]);

  // Queue a proposal
  const queue = useCallback(async (
    targets: Address[],
    values: bigint[],
    calldatas: string[],
    descriptionHash: string
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await queueAsync({
        address: contractAddress,
        abi: governorAbi,
        functionName: 'queue',
        args: [targets, values, calldatas, descriptionHash],
      });

      return hash;
    } catch (error) {
      console.error('Error queuing proposal:', error);
      throw error;
    }
  }, [contractAddress, queueAsync]);

  // Execute a proposal
  const execute = useCallback(async (
    targets: Address[],
    values: bigint[],
    calldatas: string[],
    descriptionHash: string
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await executeAsync({
        address: contractAddress,
        abi: governorAbi,
        functionName: 'execute',
        args: [targets, values, calldatas, descriptionHash],
      });

      return hash;
    } catch (error) {
      console.error('Error executing proposal:', error);
      throw error;
    }
  }, [contractAddress, executeAsync]);

  // Cancel a proposal
  const cancel = useCallback(async (
    targets: Address[],
    values: bigint[],
    calldatas: string[],
    descriptionHash: string
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await cancelAsync({
        address: contractAddress,
        abi: governorAbi,
        functionName: 'cancel',
        args: [targets, values, calldatas, descriptionHash],
      });

      return hash;
    } catch (error) {
      console.error('Error canceling proposal:', error);
      throw error;
    }
  }, [contractAddress, cancelAsync]);

  // Check if an account has voted on a proposal
  const hasVoted = useCallback(async (proposalId: bigint, account: Address): Promise<boolean> => {
    if (!contractAddress) return false;
    
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi: governorAbi,
        functionName: 'hasVoted',
        args: [proposalId, account],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking if account has voted:', error);
      return false;
    }
  }, [contractAddress, config]);

  // Get vote power for an account at a specific block
  const getVotes = useCallback(async (account: Address, blockNumber: bigint): Promise<bigint> => {
    if (!contractAddress) return 0n;
    
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi: governorAbi,
        functionName: 'getVotes',
        args: [account, blockNumber],
      });
      return BigInt(String(result) || '0');
    } catch (error) {
      console.error('Error getting votes:', error);
      return 0n;
    }
  }, [contractAddress, config]);

  // Get proposal votes (for, against, abstain)
  const getProposalVotes = useCallback(async (proposalId: bigint) => {
    if (!contractAddress) return null;
    
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi: governorAbi,
        functionName: 'proposalVotes',
        args: [proposalId],
      });
      
      if (!result) return null;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result as any[];
      return {
        againstVotes: data[0] as bigint,
        forVotes: data[1] as bigint,
        abstainVotes: data[2] as bigint,
      };
    } catch (error) {
      console.error('Error getting proposal votes:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      refetchToken(),
      refetchTimelock(),
      refetchVotingDelay(),
      refetchVotingPeriod(),
      refetchProposalThreshold(),
      refetchQuorumPercentage(),
    ]);
  }, [
    refetchToken,
    refetchTimelock,
    refetchVotingDelay,
    refetchVotingPeriod,
    refetchProposalThreshold,
    refetchQuorumPercentage,
  ]);

  return {
    // Contract state (return raw data, no unnecessary local state)
    votingToken: tokenAddress as Address | undefined,
    timelock: timelockAddress as Address | undefined,
    votingDelay: votingDelayData ? BigInt(votingDelayData.toString()) : 0n,
    votingPeriod: votingPeriodData ? BigInt(votingPeriodData.toString()) : 0n,
    proposalThreshold: proposalThresholdData ? BigInt(proposalThresholdData.toString()) : 0n,
    quorumPercentage: quorumPercentageData ? BigInt(quorumPercentageData.toString()) : 0n,
    
    // Loading states
    isLoading: isLoadingToken || isLoadingTimelock || isLoadingVotingDelay || 
               isLoadingVotingPeriod || isLoadingProposalThreshold || isLoadingQuorumPercentage,
    isProposing: isProposeLoading || isWaitingForPropose,
    isVoting: isVoteLoading || isVoteWithReasonLoading || isWaitingForVote,
    isExecuting: isExecuteLoading || isWaitingForExecute,
    isCanceling: isCancelLoading || isWaitingForCancel,
    isQueuing: isQueueLoading || isWaitingForQueue,
    
    // Errors
    proposeError: proposeError?.message || null,
    voteError: voteError?.message || voteWithReasonError?.message || null,
    executeError: executeError?.message || null,
    cancelError: cancelError?.message || null,
    queueError: queueError?.message || null,

    // Actions
    createProposal,
    vote,
    castVote,
    castVoteWithReason,
    queue,
    execute,
    cancel,
    
    // Query functions
    hasVoted,
    getVotes,
    getProposalState,
    getProposalMetadata,
    getProposalVotes,
    refresh,

    // Contract info
    contract: {
      address: contractAddress,
      abi: governorAbi,
    },
  };
}

export default useGovernor;

/* Usage Example:

const { 
  createProposal,
  vote,
  queue,
  execute,
  votingToken,
  votingPeriod,
  isLoading,
  isProposing,
  isVoting
} = useGovernor(governorAddress);

// Create a new proposal
const handleCreateProposal = async () => {
  try {
    const hash = await createProposal({
      targets: [targetContractAddress],
      values: [0n],
      calldatas: [encodedFunctionData],
      description: "Proposal to update protocol parameters",
      metadata: {
        title: "Update Protocol Parameters",
        description: "This proposal updates key protocol parameters",
        proposalType: "Parameter Update",
        proposedSolution: "Adjust the interest rate to 5%",
        rationale: "Current rates are not sustainable",
        expectedOutcomes: "Better capital efficiency",
        timeline: "Immediate upon execution",
        budget: "No additional budget required"
      }
    });
    
    console.log("Proposal transaction:", hash);
    // Wait for isProposing to become false for confirmation
  } catch (error) {
    console.error('Failed to create proposal:', error);
  }
};

// Vote on a proposal
const handleVote = async (proposalId: bigint, support: VoteType) => {
  try {
    const hash = await vote(
      proposalId,
      support,
      "I support this proposal because..." // Optional reason
    );
    
    console.log("Vote transaction:", hash);
  } catch (error) {
    console.error('Failed to cast vote:', error);
  }
};

// Queue and execute a proposal (for TimelockController)
const handleQueueAndExecute = async (
  targets: Address[],
  values: bigint[],
  calldatas: string[],
  descriptionHash: string
) => {
  try {
    // First queue the proposal
    const queueHash = await queue(targets, values, calldatas, descriptionHash);
    console.log("Queued:", queueHash);
    
    // Wait for timelock delay...
    
    // Then execute
    const executeHash = await execute(targets, values, calldatas, descriptionHash);
    console.log("Executed:", executeHash);
  } catch (error) {
    console.error('Failed to queue/execute:', error);
  }
};

*/