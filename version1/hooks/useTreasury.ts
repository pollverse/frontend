import { useState, useCallback, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useBalance, usePublicClient } from 'wagmi';
import { Address } from 'viem';
import { treasuryAbi } from '@/lib/abi/core/treasury';

export interface TreasuryConfig {
  governor: Address;
  timelock: Address;
}

export interface WithdrawETHParams {
  recipient: Address;
  amount: bigint;
}

export interface WithdrawTokenParams {
  token: Address;
  recipient: Address;
  amount: bigint;
}

export function useTreasury(contractAddress?: Address) {
  const [tokenBalances, setTokenBalances] = useState<Record<Address, bigint>>({});
  const [lastWithdrawnToken, setLastWithdrawnToken] = useState<Address | null>(null);
  const publicClient = usePublicClient();

  // Read treasury configuration
  const {
    data: governor,
    isLoading: isLoadingGovernor,
    refetch: refetchGovernor,
  } = useReadContract({
    address: contractAddress,
    abi: treasuryAbi,
    functionName: 'governor',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: timelock,
    isLoading: isLoadingTimelock,
    refetch: refetchTimelock,
  } = useReadContract({
    address: contractAddress,
    abi: treasuryAbi,
    functionName: 'timelock',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Get native ETH balance using wagmi's useBalance hook (more efficient)
  const {
    data: nativeBalance,
    isLoading: isLoadingNativeBalance,
    refetch: refetchNativeBalance,
  } = useBalance({
    address: contractAddress,
    query: {
      enabled: !!contractAddress,
    },
  });

  // Get ETH balance from contract (alternative if contract has getETHBalance)
  const {
    data: ethBalanceData,
    refetch: refetchEthBalance,
    isLoading: isLoadingEthBalance,
  } = useReadContract({
    address: contractAddress,
    abi: treasuryAbi,
    functionName: 'getETHBalance',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Write operations
  const { 
    writeContractAsync: withdrawETHAsync, 
    data: withdrawETHTxHash,
    isPending: isWithdrawETHPending,
    error: withdrawETHError,
    reset: resetWithdrawETH
  } = useWriteContract();

  const { 
    writeContractAsync: withdrawTokenAsync, 
    data: withdrawTokenTxHash,
    isPending: isWithdrawTokenPending,
    error: withdrawTokenError,
    reset: resetWithdrawToken
  } = useWriteContract();

  // Wait for transaction receipts
  const { 
    isLoading: isWaitingForWithdrawETH,
    isSuccess: isWithdrawETHSuccess 
  } = useWaitForTransactionReceipt({
    hash: withdrawETHTxHash,
  });

  const { 
    isLoading: isWaitingForWithdrawToken,
    isSuccess: isWithdrawTokenSuccess,
    // data: withdrawTokenReceipt
  } = useWaitForTransactionReceipt({
    hash: withdrawTokenTxHash,
  });

  // Refresh balances after successful withdrawals
  useEffect(() => {
    if (isWithdrawETHSuccess) {
      refetchEthBalance();
      refetchNativeBalance();
    }
  }, [isWithdrawETHSuccess, refetchEthBalance, refetchNativeBalance]);

  // Event listeners with proper onLogs syntax
  useWatchContractEvent({
    address: contractAddress,
    abi: treasuryAbi,
    eventName: 'ETHReceived',
    onLogs() {
      refetchEthBalance();
      refetchNativeBalance();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: treasuryAbi,
    eventName: 'ETHWithdrawn',
    onLogs() {
      refetchEthBalance();
      refetchNativeBalance();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: treasuryAbi,
    eventName: 'TokenWithdrawn',
    onLogs(logs) {
      logs.forEach(log => {
        if ('args' in log && log.args) {
          const args = log.args as { token?: Address };
          if (args.token) {
            const tokenAddress = args.token;
            getTokenBalance(tokenAddress);
          }
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: treasuryAbi,
    eventName: 'TokenReceived',
    onLogs(logs) {
      logs.forEach(log => {
        if ('args' in log && log.args) {
          const args = log.args as { token?: Address };
          if (args.token) {
            const tokenAddress = args.token;
            getTokenBalance(tokenAddress);
          }
        }
      });
    },
  });

  // Get token balance for a specific token
  const getTokenBalance = useCallback(async (tokenAddress: Address): Promise<bigint> => {
    if (!contractAddress || !publicClient) return 0n;
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: treasuryAbi,
        functionName: 'getTokenBalance',
        args: [tokenAddress],
      });
      
      const balance = result ? BigInt(result.toString()) : 0n;
      
      // Cache the balance
      setTokenBalances(prev => ({
        ...prev,
        [tokenAddress]: balance
      }));
      
      return balance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0n;
    }
  }, [contractAddress, publicClient]);

  useEffect(() => {
    if (isWithdrawTokenSuccess && lastWithdrawnToken) {
      // Refetch the specific token balance
      getTokenBalance(lastWithdrawnToken);
    }
  }, [isWithdrawTokenSuccess, lastWithdrawnToken, getTokenBalance]);

  // Get multiple token balances
  const getTokenBalances = useCallback(async (tokenAddresses: Address[]): Promise<Record<Address, bigint>> => {
    if (!contractAddress) return {};
    
    try {
      const balancePromises = tokenAddresses.map(addr => getTokenBalance(addr));
      const balances = await Promise.all(balancePromises);
      
      const balanceMap: Record<Address, bigint> = {};
      tokenAddresses.forEach((addr, index) => {
        balanceMap[addr] = balances[index];
      });
      
      return balanceMap;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return {};
    }
  }, [contractAddress, getTokenBalance]);

  // Withdraw ETH from treasury
  const withdrawETH = useCallback(async (params: WithdrawETHParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    const { recipient, amount } = params;

    resetWithdrawETH();

    try {
      const hash = await withdrawETHAsync({
        address: contractAddress,
        abi: treasuryAbi,
        functionName: 'withdrawETH',
        args: [recipient, amount],
      });

      return hash;
    } catch (error) {
      console.error('Error withdrawing ETH:', error);
      throw error;
    }
  }, [contractAddress, withdrawETHAsync, resetWithdrawETH]);

  // Withdraw ERC20 tokens from treasury
  const withdrawToken = useCallback(async (params: WithdrawTokenParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    const { token, recipient, amount } = params;

    // Store the token being withdrawn so we can refresh its balance
    setLastWithdrawnToken(token);
    resetWithdrawToken();

    try {
      const hash = await withdrawTokenAsync({
        address: contractAddress,
        abi: treasuryAbi,
        functionName: 'withdrawToken',
        args: [token, recipient, amount],
      });

      return hash;
    } catch (error) {
      console.error('Error withdrawing tokens:', error);
      throw error;
    }
  }, [contractAddress, withdrawTokenAsync, resetWithdrawToken]);

  // Execute arbitrary transaction from treasury (if supported)
  const executeTransaction = useCallback(async (
    target: Address,
    value: bigint,
    data: string
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await withdrawETHAsync({
        address: contractAddress,
        abi: treasuryAbi,
        functionName: 'execute',
        args: [target, value, data],
      });

      return hash;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  }, [contractAddress, withdrawETHAsync]);

  // Check if treasury can receive ETH (has receive/fallback)
  const canReceiveETH = useCallback(async (): Promise<boolean> => {
    if (!contractAddress || !publicClient) return false;
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: treasuryAbi,
        functionName: 'canReceiveETH',
      });
      return result as boolean;
    } catch {
      return false;
    }
  }, [contractAddress, publicClient]);

  // Get all tracked tokens (if contract supports it)
  const getTrackedTokens = useCallback(async (): Promise<Address[]> => {
    if (!contractAddress || !publicClient) return [];
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: treasuryAbi,
        functionName: 'getTrackedTokens',
      });
      return (result as Address[]) || [];
    } catch (error) {
      console.error('Error getting tracked tokens:', error);
      return [];
    }
  }, [contractAddress, publicClient]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      refetchGovernor(),
      refetchTimelock(),
      refetchEthBalance(),
      refetchNativeBalance(),
    ]);
  }, [refetchGovernor, refetchTimelock, refetchEthBalance, refetchNativeBalance]);

  // Refresh specific token balance
  const refreshTokenBalance = useCallback(async (tokenAddress: Address) => {
    return getTokenBalance(tokenAddress);
  }, [getTokenBalance]);

  return {
    // Configuration
    config: {
      governor: governor as Address | undefined,
      timelock: timelock as Address | undefined,
    },
    
    // Balances
    ethBalance: ethBalanceData ? BigInt(ethBalanceData.toString()) : 0n,
    nativeBalance: nativeBalance?.value || 0n, // Direct ETH balance
    tokenBalances,
    
    // Loading states
    isLoading: isLoadingGovernor || isLoadingTimelock || isLoadingEthBalance || isLoadingNativeBalance,
    isWithdrawingETH: isWithdrawETHPending || isWaitingForWithdrawETH,
    isWithdrawingToken: isWithdrawTokenPending || isWaitingForWithdrawToken,
    isWithdrawing: isWithdrawETHPending || isWithdrawTokenPending || 
                   isWaitingForWithdrawETH || isWaitingForWithdrawToken,
    
    // Errors
    withdrawETHError: withdrawETHError?.message || null,
    withdrawTokenError: withdrawTokenError?.message || null,
    error: withdrawETHError?.message || withdrawTokenError?.message || null,

    // Actions
    withdrawETH,
    withdrawToken,
    executeTransaction,
    getTokenBalance,
    getTokenBalances,
    refreshTokenBalance,
    canReceiveETH,
    getTrackedTokens,
    refresh,

    // Contract info
    contract: {
      address: contractAddress,
      abi: treasuryAbi,
    },
  };
}

export default useTreasury;

/* Usage Example:

const { 
  ethBalance,
  nativeBalance,
  tokenBalances,
  getTokenBalance,
  withdrawETH,
  withdrawToken,
  isLoading,
  isWithdrawingETH,
  isWithdrawingToken,
  withdrawETHError,
  withdrawTokenError
} = useTreasury(treasuryAddress);

// Get token balance
useEffect(() => {
  if (tokenAddress) {
    getTokenBalance(tokenAddress);
  }
}, [tokenAddress, getTokenBalance]);

// Get multiple token balances
const loadTokenBalances = async () => {
  const balances = await getTokenBalances([token1, token2, token3]);
  console.log('Token balances:', balances);
};

// Withdraw ETH
const handleWithdrawETH = async () => {
  try {
    const hash = await withdrawETH({
      recipient: recipientAddress,
      amount: parseEther('1.0')
    });
    
    console.log('Withdrawal transaction:', hash);
    // Wait for isWithdrawingETH to become false
  } catch (err) {
    console.error('Withdrawal failed:', err);
  }
};

// Withdraw tokens
const handleWithdrawTokens = async () => {
  try {
    const hash = await withdrawToken({
      token: tokenAddress,
      recipient: recipientAddress,
      amount: parseUnits('100', 18)
    });
    
    console.log('Token withdrawal transaction:', hash);
    // Check tokenBalances[tokenAddress] after transaction confirms
  } catch (err) {
    console.error('Token withdrawal failed:', err);
  }
};

// Display ETH balance
console.log('ETH Balance:', formatEther(ethBalance));

// Display native balance (from useBalance)
console.log('Native Balance:', formatEther(nativeBalance));

// Display token balance
const usdcBalance = tokenBalances[usdcAddress];
console.log('USDC Balance:', formatUnits(usdcBalance || 0n, 6));

*/