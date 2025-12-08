import { useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient } from 'wagmi';
import { Address, Hash, keccak256, encodePacked } from 'viem';
import { timelockAbi } from '@/lib/abi/core/timelock';

export type OperationState = 0 | 1 | 2 | 3; // 0=Unset(Unknown), 1=Waiting(Pending), 2=Ready, 3=Done

export interface OperationDetails {
  id: Hash;
  target: Address;
  value: bigint;
  data: string;
  predecessor: Hash;
  salt: Hash;
  delay: bigint;
  timestamp: bigint;
  state: OperationState;
}

export interface BatchOperationDetails {
  id: Hash;
  targets: Address[];
  values: bigint[];
  payloads: string[];
  predecessor: Hash;
  salt: Hash;
  delay: bigint;
  timestamp: bigint;
  state: OperationState;
}

export interface ScheduleParams {
  target: Address;
  value: bigint;
  data: string;
  predecessor?: Hash;
  salt?: Hash;
  delay?: bigint;
}

export interface ScheduleBatchParams {
  targets: Address[];
  values: bigint[];
  payloads: string[];
  predecessor?: Hash;
  salt?: Hash;
  delay?: bigint;
}

const ZERO_HASH: Hash = '0x0000000000000000000000000000000000000000000000000000000000000000';

export function useTimelock(contractAddress?: Address) {
  const { address: account } = useAccount();
  const [operations, setOperations] = useState<Record<string, OperationDetails>>({});
  const [
    batchOperations, 
    // setBatchOperations
  ] = useState<Record<string, BatchOperationDetails>>({});
  const publicClient = usePublicClient();

  // Get role hashes (constants)
  const {
    data: adminRole,
    isLoading: isLoadingAdminRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: proposerRole,
    isLoading: isLoadingProposerRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'PROPOSER_ROLE',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: executorRole,
    isLoading: isLoadingExecutorRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'EXECUTOR_ROLE',
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: cancellerRole,
    isLoading: isLoadingCancellerRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'CANCELLER_ROLE',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Get minimum delay
  const {
    data: minDelayData,
    isLoading: isLoadingMinDelay,
    refetch: refetchMinDelay,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'getMinDelay',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Check if account has role
  const {
    data: hasAdminRoleData,
    refetch: refetchHasAdminRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'hasRole',
    args: [adminRole as Hash, account as Address],
    query: {
      enabled: !!contractAddress && !!account && !!adminRole,
    },
  });

  const {
    data: hasProposerRoleData,
    refetch: refetchHasProposerRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'hasRole',
    args: [proposerRole as Hash, account as Address],
    query: {
      enabled: !!contractAddress && !!account && !!proposerRole,
    },
  });

  const {
    data: hasExecutorRoleData,
    refetch: refetchHasExecutorRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'hasRole',
    args: [executorRole as Hash, account as Address],
    query: {
      enabled: !!contractAddress && !!account && !!executorRole,
    },
  });

  const {
    data: hasCancellerRoleData,
    refetch: refetchHasCancellerRole,
  } = useReadContract({
    address: contractAddress,
    abi: timelockAbi,
    functionName: 'hasRole',
    args: [cancellerRole as Hash, account as Address],
    query: {
      enabled: !!contractAddress && !!account && !!cancellerRole,
    },
  });

  // Write operations
  const { 
    writeContractAsync: scheduleAsync, 
    data: scheduleTxHash,
    isPending: isSchedulePending,
    error: scheduleError,
    reset: resetSchedule
  } = useWriteContract();

  const { 
    writeContractAsync: scheduleBatchAsync, 
    data: scheduleBatchTxHash,
    isPending: isScheduleBatchPending,
    error: scheduleBatchError,
    reset: resetScheduleBatch
  } = useWriteContract();

  const { 
    writeContractAsync: executeAsync, 
    data: executeTxHash,
    isPending: isExecutePending,
    error: executeError,
    reset: resetExecute
  } = useWriteContract();

  const { 
    writeContractAsync: executeBatchAsync, 
    data: executeBatchTxHash,
    isPending: isExecuteBatchPending,
    error: executeBatchError
  } = useWriteContract();

  const { 
    writeContractAsync: cancelAsync, 
    data: cancelTxHash,
    isPending: isCancelPending,
    error: cancelError
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isWaitingForSchedule, isSuccess: isScheduleSuccess } = useWaitForTransactionReceipt({
    hash: scheduleTxHash,
  });

  const { isLoading: isWaitingForScheduleBatch, isSuccess: isScheduleBatchSuccess } = useWaitForTransactionReceipt({
    hash: scheduleBatchTxHash,
  });

  const { isLoading: isWaitingForExecute, isSuccess: isExecuteSuccess } = useWaitForTransactionReceipt({
    hash: executeTxHash || executeBatchTxHash,
  });

  const { isLoading: isWaitingForCancel, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelTxHash,
  });

  // Refresh operations after successful transactions
  useEffect(() => {
    if (isScheduleSuccess || isScheduleBatchSuccess || isExecuteSuccess || isCancelSuccess) {
      // Operations will be updated by event listeners
    }
  }, [isScheduleSuccess, isScheduleBatchSuccess, isExecuteSuccess, isCancelSuccess]);

  // Event listeners
  useWatchContractEvent({
    address: contractAddress,
    abi: timelockAbi,
    eventName: 'CallScheduled',
    onLogs(logs) {
      logs.forEach(log => {
        if ('args' in log && log.args) {
          const args = log.args as { id?: Hash; index?: bigint; target?: Address; value?: bigint; data?: string; predecessor?: Hash; delay?: bigint };
          const { id, target, value, data, predecessor, delay } = args;
          const operation: OperationDetails = {
            id: id as Hash,
            target: target as Address,
            value: (value as bigint) || 0n,
            data: data as string,
            predecessor: (predecessor as Hash) || ZERO_HASH,
            salt: ZERO_HASH, // Not available in event
            delay: (delay as bigint) || 0n,
            timestamp: BigInt(Math.floor(Date.now() / 1000)),
            state: 1, // Waiting/Pending
          };
          setOperations(prev => ({ ...prev, [operation.id]: operation }));
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: timelockAbi,
    eventName: 'CallExecuted',
    onLogs(logs) {
      logs.forEach(log => {
        if ('args' in log && log.args) {
          const args = log.args as { id?: Hash };
          const { id } = args;
          setOperations(prev => {
            const updated = { ...prev };
            if (updated[id as string]) {
              updated[id as string].state = 3; // Done
            }
            return updated;
          });
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: timelockAbi,
    eventName: 'Cancelled',
    onLogs(logs) {
      logs.forEach(log => {
        if ('args' in log && log.args) {
          const args = log.args as { id?: Hash };
          const { id } = args;
          setOperations(prev => {
            const updated = { ...prev };
            if (updated[id as string]) {
              // Remove cancelled operations
              delete updated[id as string];
            }
            return updated;
          });
        }
      });
    },
  });

  // Helper to compute operation ID
  const hashOperation = useCallback((
    target: Address,
    value: bigint,
    data: string,
    predecessor: Hash,
    salt: Hash
  ): Hash => {
    return keccak256(
      encodePacked(
        ['address', 'uint256', 'bytes', 'bytes32', 'bytes32'],
      [target, value, data as `0x${string}`, predecessor, salt]
      )
    ) as Hash;
  }, []);

  // Helper to compute batch operation ID
  const hashOperationBatch = useCallback((
    targets: Address[],
    values: bigint[],
    payloads: string[],
    predecessor: Hash,
    salt: Hash
  ): Hash => {
    return keccak256(
      encodePacked(
        ['address[]', 'uint256[]', 'bytes[]', 'bytes32', 'bytes32'],
        [targets, values, payloads as `0x${string}`[], predecessor, salt]
      )
    ) as Hash;
  }, []);

  // Check operation state
  const getOperationState = useCallback(async (id: Hash): Promise<OperationState> => {
    if (!contractAddress || !publicClient) return 0;
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'getOperationState',
        args: [id],
      });
      return (result as OperationState) || 0;
    } catch (error) {
      console.error('Error getting operation state:', error);
      return 0;
    }
  }, [contractAddress, publicClient]);

  // Check if operation is ready
  const isOperationReady = useCallback(async (id: Hash): Promise<boolean> => {
    if (!contractAddress || !publicClient) return false;
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'isOperationReady',
        args: [id],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking if operation is ready:', error);
      return false;
    }
  }, [contractAddress, publicClient]);

  // Check if operation is pending
  const isOperationPending = useCallback(async (id: Hash): Promise<boolean> => {
    if (!contractAddress || !publicClient) return false;
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'isOperationPending',
        args: [id],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking if operation is pending:', error);
      return false;
    }
  }, [contractAddress, publicClient]);

  // Check if operation is done
  const isOperationDone = useCallback(async (id: Hash): Promise<boolean> => {
    if (!contractAddress || !publicClient) return false;
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'isOperationDone',
        args: [id],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking if operation is done:', error);
      return false;
    }
  }, [contractAddress, publicClient]);

  // Get timestamp when operation becomes ready
  const getTimestamp = useCallback(async (id: Hash): Promise<bigint> => {
    if (!contractAddress || !publicClient) return 0n;
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'getTimestamp',
        args: [id],
      });
      return BigInt(result?.toString() || '0');
    } catch (error) {
      console.error('Error getting timestamp:', error);
      return 0n;
    }
  }, [contractAddress, publicClient]);

  // Schedule a new operation
  const schedule = useCallback(async (params: ScheduleParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    const {
      target,
      value,
      data,
      predecessor = ZERO_HASH,
      salt = ZERO_HASH,
      delay
    } = params;

    const actualDelay = delay !== undefined ? delay : (minDelayData ? BigInt(minDelayData.toString()) : 0n);

    resetSchedule();

    try {
      const hash = await scheduleAsync({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'schedule',
        args: [target, value, data, predecessor, salt, actualDelay],
      });

      return hash;
    } catch (error) {
      console.error('Error scheduling operation:', error);
      throw error;
    }
  }, [contractAddress, scheduleAsync, minDelayData, resetSchedule]);

  // Schedule a batch operation
  const scheduleBatch = useCallback(async (params: ScheduleBatchParams) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    const {
      targets,
      values,
      payloads,
      predecessor = ZERO_HASH,
      salt = ZERO_HASH,
      delay
    } = params;

    const actualDelay = delay !== undefined ? delay : (minDelayData ? BigInt(minDelayData.toString()) : 0n);

    resetScheduleBatch();

    try {
      const hash = await scheduleBatchAsync({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'scheduleBatch',
        args: [targets, values, payloads, predecessor, salt, actualDelay],
      });

      return hash;
    } catch (error) {
      console.error('Error scheduling batch operation:', error);
      throw error;
    }
  }, [contractAddress, scheduleBatchAsync, minDelayData, resetScheduleBatch]);

  // Execute an operation
  const execute = useCallback(async (
    target: Address,
    value: bigint,
    data: string,
    predecessor: Hash = ZERO_HASH,
    salt: Hash = ZERO_HASH
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    resetExecute();

    try {
      const hash = await executeAsync({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'execute',
        args: [target, value, data, predecessor, salt],
        value, // Include value for payable operations
      });

      return hash;
    } catch (error) {
      console.error('Error executing operation:', error);
      throw error;
    }
  }, [contractAddress, executeAsync, resetExecute]);

  // Execute a batch operation
  const executeBatch = useCallback(async (
    targets: Address[],
    values: bigint[],
    payloads: string[],
    predecessor: Hash = ZERO_HASH,
    salt: Hash = ZERO_HASH
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      // Calculate total value for payable operations
      const totalValue = values.reduce((sum, val) => sum + val, 0n);

      const hash = await executeBatchAsync({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'executeBatch',
        args: [targets, values, payloads, predecessor, salt],
        value: totalValue,
      });

      return hash;
    } catch (error) {
      console.error('Error executing batch operation:', error);
      throw error;
    }
  }, [contractAddress, executeBatchAsync]);

  // Cancel an operation
  const cancel = useCallback(async (id: Hash) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await cancelAsync({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'cancel',
        args: [id],
      });

      return hash;
    } catch (error) {
      console.error('Error cancelling operation:', error);
      throw error;
    }
  }, [contractAddress, cancelAsync]);

  // Update delay
  const updateDelay = useCallback(async (newDelay: bigint) => {
    if (!contractAddress) {
      throw new Error('Contract address not provided');
    }

    try {
      const hash = await scheduleAsync({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'updateDelay',
        args: [newDelay],
      });

      return hash;
    } catch (error) {
      console.error('Error updating delay:', error);
      throw error;
    }
  }, [contractAddress, scheduleAsync]);

  // Check if user has specific role
  const hasRole = useCallback(async (role: Hash, accountAddress?: Address): Promise<boolean> => {
    if (!contractAddress || !publicClient) return false;
    
    const addressToCheck = accountAddress || account;
    if (!addressToCheck) return false;

    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: timelockAbi,
        functionName: 'hasRole',
        args: [role, addressToCheck],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }, [contractAddress, account, publicClient]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      refetchMinDelay(),
      refetchHasAdminRole(),
      refetchHasProposerRole(),
      refetchHasExecutorRole(),
      refetchHasCancellerRole(),
    ]);
  }, [
    refetchMinDelay,
    refetchHasAdminRole,
    refetchHasProposerRole,
    refetchHasExecutorRole,
    refetchHasCancellerRole,
  ]);

  return {
    // State
    minDelay: minDelayData ? BigInt(minDelayData.toString()) : 0n,
    operations,
    batchOperations,
    isLoading: isLoadingMinDelay || isLoadingAdminRole || isLoadingProposerRole || 
               isLoadingExecutorRole || isLoadingCancellerRole,
    
    // Loading states per operation
    isScheduling: isSchedulePending || isWaitingForSchedule,
    isSchedulingBatch: isScheduleBatchPending || isWaitingForScheduleBatch,
    isExecuting: isExecutePending || isExecuteBatchPending || isWaitingForExecute,
    isCancelling: isCancelPending || isWaitingForCancel,
    
    // Errors
    scheduleError: scheduleError?.message || null,
    scheduleBatchError: scheduleBatchError?.message || null,
    executeError: executeError?.message || executeBatchError?.message || null,
    cancelError: cancelError?.message || null,
    
    // Role information
    roles: {
      admin: adminRole as Hash | undefined,
      proposer: proposerRole as Hash | undefined,
      executor: executorRole as Hash | undefined,
      canceller: cancellerRole as Hash | undefined,
    },
    
    // User's roles
    userRoles: {
      hasAdminRole: hasAdminRoleData as boolean,
      hasProposerRole: hasProposerRoleData as boolean,
      hasExecutorRole: hasExecutorRoleData as boolean,
      hasCancellerRole: hasCancellerRoleData as boolean,
    },

    // Actions
    schedule,
    scheduleBatch,
    execute,
    executeBatch,
    cancel,
    updateDelay,
    hasRole,
    
    // Query functions
    getOperationState,
    isOperationReady,
    isOperationPending,
    isOperationDone,
    getTimestamp,
    
    // Helpers
    hashOperation,
    hashOperationBatch,
    refresh,

    // Contract info
    contract: {
      address: contractAddress,
      abi: timelockAbi,
    },
  };
}

export default useTimelock;

/* Usage Example:

const { 
  minDelay,
  operations,
  schedule,
  execute,
  cancel,
  isOperationReady,
  hasRole,
  userRoles,
  roles,
  isScheduling,
  isExecuting,
  hashOperation
} = useTimelock(timelockAddress);

// Check if current user is a proposer
const canPropose = userRoles.hasProposerRole;

// Schedule a new operation
const handleSchedule = async () => {
  try {
    const hash = await schedule({
      target: targetAddress,
      value: 0n,
      data: encodedFunctionData,
      predecessor: ZERO_HASH,
      salt: ZERO_HASH,
      // delay is optional, uses minDelay by default
    });
    
    console.log("Scheduled:", hash);
    // Wait for isScheduling to become false
  } catch (error) {
    console.error('Failed to schedule operation:', error);
  }
};

// Schedule a batch operation
const handleScheduleBatch = async () => {
  try {
    const hash = await scheduleBatch({
      targets: [address1, address2],
      values: [0n, 0n],
      payloads: [data1, data2],
    });
    
    console.log("Batch scheduled:", hash);
  } catch (error) {
    console.error('Failed to schedule batch:', error);
  }
};

// Execute an operation after delay
const handleExecute = async (operation: OperationDetails) => {
  try {
    const ready = await isOperationReady(operation.id);
    if (!ready) {
      throw new Error('Operation is not ready to execute');
    }
    
    const hash = await execute(
      operation.target,
      operation.value,
      operation.data,
      operation.predecessor,
      operation.salt
    );
    
    console.log("Executed:", hash);
  } catch (error) {
    console.error('Failed to execute operation:', error);
  }
};

// Calculate operation ID
const operationId = hashOperation(
  targetAddress,
  0n,
  encodedData,
  ZERO_HASH,
  ZERO_HASH
);

*/