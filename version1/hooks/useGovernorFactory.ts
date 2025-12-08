import { useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { Address } from 'viem';
import { governorFactoryAbi } from '@/lib/abi/faoctories/governorFactory';

// type TokenType = 0 | 1; // 0 for ERC20, 1 for ERC721

type TokenType = 'ERC20' | 'ERC721';

export interface DAOConfig {
  daoName: string;
  metadataURI: string;
  daoDescription: string;
  governor: Address;
  timelock: Address;
  treasury: Address;
  token: Address;
  tokenType: TokenType;
  creator: Address;
  createdAt: bigint;
}

export interface CreateDAOParams {
  daoName: string;
  daoDescription: string;
  metadataURI: string;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: bigint;
  maxSupply: bigint;
  votingDelay: number;
  votingPeriod: number;
  proposalThreshold: bigint;
  timelockDelay: number;
  quorumPercentage: number;
  tokenType: TokenType;
  baseURI?: string;
}

export interface DAOCreatedEventArgs {
  governor: Address;
  timelock: Address;
  treasury: Address;
  daoName: string;
  token: Address;
  tokenType: TokenType;
  creator: Address;
  daoId: bigint;
}

export function useGovernorFactory(contractAddress?: Address) {
  const { address: account } = useAccount();
  const [isCreatingDAO, setIsCreatingDAO] = useState(false);
  const [daoCreationError, setDaoCreationError] = useState<string | null>(null);
  const [createdDAO, setCreatedDAO] = useState<{
    governor: Address;
    timelock: Address;
    treasury: Address;
    token: Address;
  } | null>(null);

  // Read operations
  const {
    data: daoCount,
    isLoading: isLoadingDaoCount,
    refetch: refetchDaoCount,
  } = useReadContract({
    address: contractAddress,
    abi: governorFactoryAbi,
    functionName: 'getDaoCount',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: allDAOs = [],
    isLoading: isLoadingAllDAOs,
    refetch: refetchAllDAOs,
  } = useReadContract({
    address: contractAddress,
    abi: governorFactoryAbi,
    functionName: 'getAllDaos',
    query: {
      enabled: !!contractAddress,
    },
  }) as { data: DAOConfig[]; isLoading: boolean; refetch: () => void };

  const {
    data: userDAOs = [],
    isLoading: isLoadingUserDAOs,
    refetch: refetchUserDAOs,
  } = useReadContract({
    address: contractAddress,
    abi: governorFactoryAbi,
    functionName: 'getDaosByCreator',
    args: [account as Address],
    query: {
      enabled: !!contractAddress && !!account,
    },
  }) as { data: Address[]; isLoading: boolean; refetch: () => void };

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
      Promise.all([refetchDaoCount(), refetchAllDAOs(), refetchUserDAOs()]);
    }
  }, [isCreateDAOSuccess, isDeleteDAOSuccess, refetchDaoCount, refetchAllDAOs, refetchUserDAOs]);

  // Listen for DAOCreated events (filter by current user)
  useWatchContractEvent({
    address: contractAddress,
    abi: governorFactoryAbi,
    eventName: 'DAOCreated',
    onLogs(logs) {
      if (logs.length > 0) {
        const latestLog = logs[logs.length - 1]; // Get most recent
        if ('args' in latestLog && latestLog.args) {
          const { 
            creator, 
            governor, 
            timelock, 
            treasury, 
            token 
          } = latestLog.args as unknown as DAOCreatedEventArgs;
          
          // Only set if this is the current user's DAO
          if (creator === account) {
            setCreatedDAO({
              governor: governor as Address,
              timelock: timelock as Address,
              treasury: treasury as Address,
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
      const { 
        daoName, 
        daoDescription, 
        metadataURI, 
        tokenName, 
        tokenSymbol, 
        initialSupply, 
        maxSupply, 
        votingDelay, 
        votingPeriod, 
        proposalThreshold, 
        timelockDelay, 
        quorumPercentage, 
        tokenType, 
        baseURI = '' 
      } = params;
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: governorFactoryAbi,
        functionName: 'createDAO',
        args: [
          daoName,
          daoDescription,
          metadataURI,
          tokenName,
          tokenSymbol,
          initialSupply,
          maxSupply,
          BigInt(votingDelay),
          BigInt(votingPeriod),
          proposalThreshold,
          BigInt(timelockDelay),
          BigInt(quorumPercentage),
          tokenType,
          baseURI
        ],
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
        abi: governorFactoryAbi,
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
  const getDAOsByTokenType = useCallback((tokenType: TokenType): DAOConfig[] => {
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

  // Refresh all DAO data
  const refreshDAOs = useCallback(async () => {
    await Promise.all([refetchDaoCount(), refetchAllDAOs(), refetchUserDAOs()]);
  }, [refetchDaoCount, refetchAllDAOs, refetchUserDAOs]);

  return {
    // State
    isCreatingDAO: isCreatingDAO || isCreateDAOPending || isWaitingForCreateDAO,
    isDeletingDAO: isDeleteDAOPending || isWaitingForDeleteDAO,
    daoCreationError: daoCreationError || createDAOError?.message || null,
    deleteDAOError: deleteDAOError?.message || null,
    createdDAO,
    allDAOs,
    userDAOs,
    daoCount: daoCount ? BigInt(daoCount.toString()) : BigInt(0),
    isLoading: isLoadingDaoCount || isLoadingAllDAOs || isLoadingUserDAOs,
    
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
      abi: governorFactoryAbi,
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
      daoName: "My DAO",
      daoDescription: "A new DAO for testing",
      metadataURI: "ipfs://...",
      tokenName: "Vote Token",
      tokenSymbol: "VOTE",
      initialSupply: BigInt(1000000),
      maxSupply: BigInt(1000000),
      votingDelay: 1,
      votingPeriod: 100,
      proposalThreshold: BigInt(1000),
      timelockDelay: 86400, // 1 day
      quorumPercentage: 4, // 4%
      tokenType: 0, // ERC20
    });
    console.log("Transaction submitted:", txHash);
    // Wait for isCreatingDAO to become false
    // Check createdDAO for the deployed addresses
  } catch (error) {
    console.error("Failed to create DAO:", error);
  }
};

*/