import { useState, useCallback, useEffect } from 'react';
import { useConnection, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { Address } from 'viem';
import { GovernorFactory } from '@/lib/abis';

export interface DAOConfig {
  governor: Address;
  timelock: Address;
  treasury: Address;
  token: Address;
  tokenType: number; // 0 for ERC20, 1 for ERC721
  createdAt: number;
}

export interface CreateDAOParams {
  tokenName: string;
  tokenSymbol: string;
  initialSupply: bigint;
  maxSupply: bigint;
  votingDelay: bigint;
  votingPeriod: bigint;
  proposalThreshold: bigint;
  timelockDelay: bigint;
  quorumPercentage: bigint;
  tokenType: number; // 0 for ERC20, 1 for ERC721
  baseURI: string;
}

export interface DAOCreatedEventArgs {
  daoId: bigint;
  governor: Address;
  token: Address;
  tokenType: number;
  creator: Address;
  timestamp: number;
}

export function useGovernorFactory(contractAddress?: Address) {
  const { address: account } = useConnection();
  const [isCreatingDAO, setIsCreatingDAO] = useState(false);
  const [daoCreationError, setDaoCreationError] = useState<string | null>(null);
  const [createdDAO, setCreatedDAO] = useState<{
    daoId: bigint;
    governor: Address;
    token: Address;
  } | null>(null);

  // Read operations
  const {
    data: allDAOs = [],
    isLoading: isLoadingAllDAOs,
    refetch: refetchAllDAOs,
  } = useReadContract({
    address: contractAddress,
    abi: GovernorFactory,
    functionName: 'getAllDao',
    query: {
      enabled: !!contractAddress,
    },
  }) as { data: DAOConfig[]; isLoading: boolean; refetch: () => void };

  const {
    data: userDAOIds = [],
    isLoading: isLoadingUserDAOs,
    refetch: refetchUserDAOs,
  } = useReadContract({
    address: contractAddress,
    abi: GovernorFactory,
    functionName: 'getDaosByCreator',
    args: [account as Address],
    query: {
      enabled: !!contractAddress && !!account,
    },
  }) as { data: bigint[]; isLoading: boolean; refetch: () => void };

  // Write operations
  const { 
    writeContractAsync, 
    data: createDAOTxHash,
    isPending: isCreateDAOPending,
    error: createDAOError,
    reset: resetCreateDAO
  } = useWriteContract();

  const { 
    writeContractAsync: deleteDAOAsync, 
    data: deleteDAOTxHash,
    isPending: isDeleteDAOPending,
    error: deleteDAOError
  } = useWriteContract();

  // Wait for create DAO transaction confirmation
  const { 
    isLoading: isWaitingForCreateDAO,
    isSuccess: isCreateDAOSuccess 
  } = useWaitForTransactionReceipt({
    hash: createDAOTxHash,
  });

  // Wait for delete DAO transaction confirmation
  const { 
    isLoading: isWaitingForDeleteDAO,
    isSuccess: isDeleteDAOSuccess 
  } = useWaitForTransactionReceipt({
    hash: deleteDAOTxHash,
  });

  // Refetch data after successful transactions
  useEffect(() => {
    if (isCreateDAOSuccess || isDeleteDAOSuccess) {
      Promise.all([refetchAllDAOs(), refetchUserDAOs()]);
    }
  }, [isCreateDAOSuccess, isDeleteDAOSuccess, refetchAllDAOs, refetchUserDAOs]);

  // Listen for DAOCreated events (filter by current user)
  useWatchContractEvent({
    address: contractAddress,
    abi: GovernorFactory,
    eventName: 'DAOCreated',
    onLogs(logs) {
      if (logs.length > 0) {
        const latestLog = logs[logs.length - 1];
        if ('args' in latestLog && latestLog.args) {
          const { 
            creator, 
            daoId,
            governor, 
            token 
          } = latestLog.args as unknown as DAOCreatedEventArgs;
          
          // Only set if this is the current user's DAO
          if (creator === account) {
            setCreatedDAO({
              daoId: daoId as bigint,
              governor: governor as Address,
              token: token as Address,
            });
          }
        }
      }
    },
  });

  // Create a new DAO
  const createDAO = useCallback(async (params: CreateDAOParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    if (!account) {
      throw new Error('Wallet not connected');
    }

    setIsCreatingDAO(true);
    setDaoCreationError(null);
    setCreatedDAO(null);
    resetCreateDAO();

    try {
      // Create the tuple parameter as expected by the contract
      const createDAOParams = {
        tokenName: params.tokenName,
        tokenSymbol: params.tokenSymbol,
        initialSupply: params.initialSupply,
        maxSupply: params.maxSupply,
        votingDelay: params.votingDelay,
        votingPeriod: params.votingPeriod,
        proposalThreshold: params.proposalThreshold,
        timelockDelay: params.timelockDelay,
        quorumPercentage: params.quorumPercentage,
        tokenType: params.tokenType,
        baseURI: params.baseURI,
      };
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: GovernorFactory,
        functionName: 'createDAO',
        args: [createDAOParams],
      });

      return hash;
    } catch (error) {
      console.error('Error creating DAO:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create DAO';
      setDaoCreationError(errorMessage);
      throw error;
    } finally {
      setIsCreatingDAO(false);
    }
  }, [contractAddress, account, writeContractAsync, resetCreateDAO]);

  // Delete a DAO
  const deleteDAO = useCallback(async (daoId: bigint) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      const hash = await deleteDAOAsync({
        address: contractAddress,
        abi: GovernorFactory,
        functionName: 'deleteDao',
        args: [daoId],
      });
      
      return hash;
    } catch (error) {
      console.error('Error deleting DAO:', error);
      throw error;
    }
  }, [contractAddress, account, deleteDAOAsync]);

  // Get a single DAO by ID
  const getDAOById = useCallback((daoId: number): DAOConfig | null => {
    if (!contractAddress || typeof daoId !== 'number') return null;
    return allDAOs[daoId] || null;
  }, [contractAddress, allDAOs]);

  // Get DAOs by token type
  const getDAOsByTokenType = useCallback((tokenType: number): DAOConfig[] => {
    return allDAOs.filter(dao => dao.tokenType === tokenType);
  }, [allDAOs]);

  // Get DAO by any related address
  const getDAOByAddress = useCallback((address: Address): DAOConfig | undefined => {
    return allDAOs.find(dao => 
      dao.governor.toLowerCase() === address.toLowerCase() || 
      dao.timelock.toLowerCase() === address.toLowerCase() || 
      dao.treasury.toLowerCase() === address.toLowerCase() || 
      dao.token.toLowerCase() === address.toLowerCase()
    );
  }, [allDAOs]);

  // Get user's DAOs (full DAO configs)
  const userDAOs = useCallback((): DAOConfig[] => {
    return userDAOIds.map(id => allDAOs[Number(id)]).filter(Boolean);
  }, [userDAOIds, allDAOs])();

  // Refresh all DAO data
  const refreshDAOs = useCallback(async () => {
    await Promise.all([refetchAllDAOs(), refetchUserDAOs()]);
  }, [refetchAllDAOs, refetchUserDAOs]);

  return {
    // State
    isCreatingDAO: isCreatingDAO || isCreateDAOPending || isWaitingForCreateDAO,
    isDeletingDAO: isDeleteDAOPending || isWaitingForDeleteDAO,
    daoCreationError: daoCreationError || createDAOError?.message || null,
    deleteDAOError: deleteDAOError?.message || null,
    createdDAO,
    allDAOs,
    userDAOs,
    userDAOIds,
    daoCount: BigInt(allDAOs.length),
    isLoading: isLoadingAllDAOs || isLoadingUserDAOs,
    
    // Actions
    createDAO,
    deleteDAO,
    getDAOById,
    getDAOByAddress,
    getDAOsByTokenType,
    refreshDAOs,
    
    // Contract info
    contract: {
      address: contractAddress,
      abi: GovernorFactory,
    },
  };
}

export default useGovernorFactory;

/* Usage Example:

const { 
  createDAO, 
  allDAOs, 
  userDAOs, 
  isLoading, 
  isCreatingDAO,
  daoCreationError,
  createdDAO 
} = useGovernorFactory(contractAddress);

// Create a new DAO
const handleCreateDAO = async () => {
  try {
    const txHash = await createDAO({
      tokenName: "Vote Token",
      tokenSymbol: "VOTE",
      initialSupply: BigInt(1000000),
      maxSupply: BigInt(1000000),
      votingDelay: BigInt(1),
      votingPeriod: BigInt(100),
      proposalThreshold: BigInt(1000),
      timelockDelay: BigInt(86400), // 1 day
      quorumPercentage: BigInt(4), // 4%
      tokenType: 0, // 0 for ERC20, 1 for ERC721
      baseURI: "", // Only needed for ERC721
    });
    console.log("Transaction submitted:", txHash);
    // Wait for isCreatingDAO to become false
    // Check createdDAO for the deployed addresses
  } catch (error) {
    console.error("Failed to create DAO:", error);
  }
};

*/