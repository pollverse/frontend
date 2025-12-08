import { useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { readContract } from '@wagmi/core';
import { Address } from 'viem';
import { DGPGovernor } from '@/lib/abis';

export type VoteType = 0 | 1 | 2; // 0=Against, 1=For, 2=Abstain
export type ProposalState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed

export interface ProposalMetadata {
  proposer: Address;
  timestamp: bigint;
  metadataURI: string;
}

export interface CreateProposalParams {
  targets: Address[];
  values: bigint[];
  calldatas: string[];
  metadataURI: string;
}

export interface ProposeParams {
  targets: Address[];
  values: bigint[];
  calldatas: string[];
  description: string;
}

export interface ProposalVotes {
  againstVotes: bigint;
  forVotes: bigint;
  abstainVotes: bigint;
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
    abi: DGPGovernor,
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
    abi: DGPGovernor,
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
    abi: DGPGovernor,
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
    abi: DGPGovernor,
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
    abi: DGPGovernor,
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
    abi: DGPGovernor,
    functionName: 'quorumPercentage',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Write operations
  const { 
    writeContractAsync: createProposalAsync, 
    data: createProposalTxHash,
    isPending: isCreateProposalLoading,
    error: createProposalError,
    reset: resetCreateProposal
  } = useWriteContract();

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
  const { isLoading: isWaitingForCreateProposal } = useWaitForTransactionReceipt({
    hash: createProposalTxHash,
  });

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
        abi: DGPGovernor,
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
        abi: DGPGovernor,
        functionName: 'getProposalMetadata',
        args: [proposalId],
      });
      
      if (!metadata) return null;
      
      // The ABI returns a tuple with 3 fields
      const [proposer, timestamp, metadataURI] = metadata as [Address, bigint, string];
      
      return {
        proposer,
        timestamp,
        metadataURI,
      };
    } catch (error) {
      console.error('Error fetching proposal metadata:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Get metadata URI for a proposal
  const getMetadataURI = useCallback(async (proposalId: bigint): Promise<string | null> => {
    if (!contractAddress) return null;
    
    try {
      const uri = await readContract(config, {
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'getMetadataURI',
        args: [proposalId],
      });
      
      return uri as string;
    } catch (error) {
      console.error('Error fetching metadata URI:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Create a new proposal with metadata URI
  const createProposal = useCallback(async (params: CreateProposalParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    const { targets, values, calldatas, metadataURI } = params;

    resetCreateProposal();

    try {
      const hash = await createProposalAsync({
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'createProposal',
        args: [targets, values, calldatas, metadataURI],
      });

      return hash;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }, [contractAddress, createProposalAsync, resetCreateProposal]);

  // Create a standard proposal with description
  const propose = useCallback(async (params: ProposeParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    const { targets, values, calldatas, description } = params;

    resetPropose();

    try {
      const hash = await proposeAsync({
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
      });

      return hash;
    } catch (error) {
      console.error('Error proposing:', error);
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
        abi: DGPGovernor,
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
        abi: DGPGovernor,
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
        abi: DGPGovernor,
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
        abi: DGPGovernor,
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
        abi: DGPGovernor,
        functionName: 'cancel',
        args: [targets, values, calldatas, descriptionHash],
      });

      return hash;
    } catch (error) {
      console.error('Error canceling proposal:', error);
      throw error;
    }
  }, [contractAddress, cancelAsync]);

  // Update metadata URI for a proposal
  const updateMetadataURI = useCallback(async (proposalId: bigint, newURI: string) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await proposeAsync({
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'updateMetadataURI',
        args: [proposalId, newURI],
      });

      return hash;
    } catch (error) {
      console.error('Error updating metadata URI:', error);
      throw error;
    }
  }, [contractAddress, proposeAsync]);

  // Check if an account has voted on a proposal
  const hasVoted = useCallback(async (proposalId: bigint, account: Address): Promise<boolean> => {
    if (!contractAddress) return false;
    
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'hasVoted',
        args: [proposalId, account],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking if account has voted:', error);
      return false;
    }
  }, [contractAddress, config]);

  // Get vote power for an account at a specific timepoint
  const getVotes = useCallback(async (account: Address, timepoint: bigint): Promise<bigint> => {
    if (!contractAddress) return 0n;
    
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'getVotes',
        args: [account, timepoint],
      });
      return BigInt(String(result) || '0');
    } catch (error) {
      console.error('Error getting votes:', error);
      return 0n;
    }
  }, [contractAddress, config]);

  // Get proposal votes (for, against, abstain)
  const getProposalVotes = useCallback(async (proposalId: bigint): Promise<ProposalVotes | null> => {
    if (!contractAddress) return null;
    
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'getProposalVotes',
        args: [proposalId],
      });
      
      if (!result) return null;
      
      // The function returns 3 separate uint256 values
      const [againstVotes, forVotes, abstainVotes] = result as [bigint, bigint, bigint];
      
      return {
        againstVotes,
        forVotes,
        abstainVotes,
      };
    } catch (error) {
      console.error('Error getting proposal votes:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Get proposal votes using proposalVotes function
  const proposalVotes = useCallback(async (proposalId: bigint): Promise<ProposalVotes | null> => {
    if (!contractAddress) return null;
    
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'proposalVotes',
        args: [proposalId],
      });
      
      if (!result) return null;
      
      const [againstVotes, forVotes, abstainVotes] = result as [bigint, bigint, bigint];
      
      return {
        againstVotes,
        forVotes,
        abstainVotes,
      };
    } catch (error) {
      console.error('Error getting proposal votes:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Get proposal deadline
  const getProposalDeadline = useCallback(async (proposalId: bigint): Promise<bigint | null> => {
    if (!contractAddress) return null;
    
    try {
      const deadline = await readContract(config, {
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'proposalDeadline',
        args: [proposalId],
      });
      return BigInt(String(deadline) || '0');
    } catch (error) {
      console.error('Error getting proposal deadline:', error);
      return null;
    }
  }, [contractAddress, config]);

  // Get proposal snapshot
  const getProposalSnapshot = useCallback(async (proposalId: bigint): Promise<bigint | null> => {
    if (!contractAddress) return null;
    
    try {
      const snapshot = await readContract(config, {
        address: contractAddress,
        abi: DGPGovernor,
        functionName: 'proposalSnapshot',
        args: [proposalId],
      });
      return BigInt(String(snapshot) || '0');
    } catch (error) {
      console.error('Error getting proposal snapshot:', error);
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
    // Contract state
    votingToken: tokenAddress as Address | undefined,
    timelock: timelockAddress as Address | undefined,
    votingDelay: votingDelayData ? BigInt(votingDelayData.toString()) : 0n,
    votingPeriod: votingPeriodData ? BigInt(votingPeriodData.toString()) : 0n,
    proposalThreshold: proposalThresholdData ? BigInt(proposalThresholdData.toString()) : 0n,
    quorumPercentage: quorumPercentageData ? BigInt(quorumPercentageData.toString()) : 0n,
    
    // Loading states
    isLoading: isLoadingToken || isLoadingTimelock || isLoadingVotingDelay || 
               isLoadingVotingPeriod || isLoadingProposalThreshold || isLoadingQuorumPercentage,
    isCreatingProposal: isCreateProposalLoading || isWaitingForCreateProposal,
    isProposing: isProposeLoading || isWaitingForPropose,
    isVoting: isVoteLoading || isVoteWithReasonLoading || isWaitingForVote,
    isExecuting: isExecuteLoading || isWaitingForExecute,
    isCanceling: isCancelLoading || isWaitingForCancel,
    isQueuing: isQueueLoading || isWaitingForQueue,
    
    // Errors
    createProposalError: createProposalError?.message || null,
    proposeError: proposeError?.message || null,
    voteError: voteError?.message || voteWithReasonError?.message || null,
    executeError: executeError?.message || null,
    cancelError: cancelError?.message || null,
    queueError: queueError?.message || null,

    // Actions
    createProposal,
    propose,
    vote,
    castVote,
    castVoteWithReason,
    queue,
    execute,
    cancel,
    updateMetadataURI,
    
    // Query functions
    hasVoted,
    getVotes,
    getProposalState,
    getProposalMetadata,
    getMetadataURI,
    getProposalVotes,
    proposalVotes,
    getProposalDeadline,
    getProposalSnapshot,
    refresh,

    // Contract info
    contract: {
      address: contractAddress,
      abi: DGPGovernor,
    },
  };
}

export default useGovernor;

/* Usage Example:

const { 
  createProposal,
  propose,
  vote,
  queue,
  execute,
  votingToken,
  votingPeriod,
  isLoading,
  isCreatingProposal,
  isProposing,
  isVoting
} = useGovernor(governorAddress);

// Create a new proposal with metadata URI (recommended)
const handleCreateProposal = async () => {
  try {
    const hash = await createProposal({
      targets: [targetContractAddress],
      values: [0n],
      calldatas: [encodedFunctionData],
      metadataURI: "ipfs://QmXxx..." // IPFS URI containing proposal metadata
    });
    
    console.log("Proposal transaction:", hash);
    // Wait for isCreatingProposal to become false for confirmation
  } catch (error) {
    console.error('Failed to create proposal:', error);
  }
};

// Create a standard proposal with description
const handlePropose = async () => {
  try {
    const hash = await propose({
      targets: [targetContractAddress],
      values: [0n],
      calldatas: [encodedFunctionData],
      description: "Proposal to update protocol parameters"
    });
    
    console.log("Proposal transaction:", hash);
  } catch (error) {
    console.error('Failed to propose:', error);
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

// Get proposal votes
const getVotes = async (proposalId: bigint) => {
  const votes = await getProposalVotes(proposalId);
  if (votes) {
    console.log("Against:", votes.againstVotes);
    console.log("For:", votes.forVotes);
    console.log("Abstain:", votes.abstainVotes);
  }
};

*/