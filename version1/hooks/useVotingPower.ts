import { useState, useCallback, useEffect } from "react";
import { Address, Hash } from "viem";
import { erc20VotingPower } from "@/lib/abi/core/votingPower/erc20";
import { erc721VotingPower } from "@/lib/abi/core/votingPower/erc721";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useConfig,
} from "wagmi";
import { readContract } from "wagmi/actions";

export interface Checkpoint {
  fromBlock: bigint;
  votes: bigint;
}

export interface Delegation {
  delegatee: Address;
  nonce: bigint;
  expiry: bigint;
}

export interface TransferParams {
  to: Address;
  amount: bigint;
}
export interface TransferNFTParams {
  from: Address;
  to: Address;
  tokenId: bigint;
}

export interface ApproveParams {
  spender: Address;
  amount: bigint;
}
export interface ApproveParams {
  to: Address;
  tokenId: bigint;
}

export interface DelegateBySigParams {
  delegatee: Address;
  nonce: bigint;
  expiry: bigint;
  v: number;
  r: Hash;
  s: Hash;
}

export interface NFT {
  tokenId: bigint;
  owner: Address;
  tokenURI: string;
  approved?: Address;
  metadata?: NFTMetadata;
}

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface SetApprovalForAllParams {
  operator: Address;
  approved: boolean;
}

export function useERC20VotingPower(contractAddress?: Address) {
  const { address: account } = useAccount();
  const [delegateCache, setDelegateCache] = useState<Record<Address, Address>>(
    {}
  );
  const config = useConfig();

  // Token metadata
  const {
    data: tokenName,
    isLoading: isLoadingName,
    refetch: refetchName,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "name",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: tokenSymbol,
    isLoading: isLoadingSymbol,
    refetch: refetchSymbol,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "symbol",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: tokenDecimals,
    isLoading: isLoadingDecimals,
    refetch: refetchDecimals,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "decimals",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: tokenTotalSupply,
    isLoading: isLoadingTotalSupply,
    refetch: refetchTotalSupply,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "totalSupply",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: tokenMaxSupply,
    isLoading: isLoadingMaxSupply,
    refetch: refetchMaxSupply,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "maxSupply",
    query: {
      enabled: !!contractAddress,
    },
  });

  // Account balance and voting power
  const {
    data: accountBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: {
      enabled: !!contractAddress && !!account,
    },
  });

  const {
    data: currentVotes,
    isLoading: isLoadingVotes,
    refetch: refetchVotes,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "getVotes",
    args: account ? [account] : undefined,
    query: {
      enabled: !!contractAddress && !!account,
    },
  });

  const {
    data: currentDelegate,
    isLoading: isLoadingDelegate,
    refetch: refetchCurrentDelegate,
  } = useReadContract({
    address: contractAddress,
    abi: erc20VotingPower,
    functionName: "delegates",
    args: account ? [account] : undefined,
    query: {
      enabled: !!contractAddress && !!account,
    },
  });

  // Write operations
  const {
    writeContractAsync: transferAsync,
    data: transferTxHash,
    isPending: isTransferPending,
    error: transferError,
    reset: resetTransfer,
  } = useWriteContract();

  const {
    writeContractAsync: approveAsync,
    data: approveTxHash,
    isPending: isApprovePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    writeContractAsync: delegateAsync,
    data: delegateTxHash,
    isPending: isDelegatePending,
    error: delegateError,
    reset: resetDelegate,
  } = useWriteContract();

  const {
    writeContractAsync: delegateBySigAsync,
    data: delegateBySigTxHash,
    isPending: isDelegateBySigPending,
    error: delegateBySigError,
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isWaitingForTransfer, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferTxHash,
    });

  const { isLoading: isWaitingForApprove, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
    });

  const { isLoading: isWaitingForDelegate, isSuccess: isDelegateSuccess } =
    useWaitForTransactionReceipt({
      hash: delegateTxHash || delegateBySigTxHash,
    });

  // Refresh data after successful transactions
  useEffect(() => {
    if (isTransferSuccess) {
      refetchBalance();
      refetchTotalSupply();
      refetchVotes();
    }
  }, [isTransferSuccess, refetchBalance, refetchTotalSupply, refetchVotes]);

  useEffect(() => {
    if (isDelegateSuccess) {
      refetchVotes();
      refetchCurrentDelegate();
    }
  }, [isDelegateSuccess, refetchVotes, refetchCurrentDelegate]);

  // Event listeners
  useWatchContractEvent({
    address: contractAddress,
    abi: erc20VotingPower,
    eventName: "Transfer",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { from, to, value } = log.args as { from: Address; to: Address; value: bigint };
          // Refresh balance if this account is involved
          if (account && (from === account || to === account || value === value)) {
            refetchBalance();
            refetchVotes();
            refetchTotalSupply();
          }
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: erc20VotingPower,
    eventName: "DelegateChanged",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { delegator, fromDelegate, toDelegate } = log.args as {
            delegator: Address;
            fromDelegate: Address;
            toDelegate: Address;
          };
          // Update cache
          if (delegator) {
            setDelegateCache((prev) => ({
              ...prev,
              [delegator]: toDelegate
            }));
          }
          // Refresh if this is the current account
          if (account && delegator === account) {
            refetchVotes();
            refetchCurrentDelegate();
          }
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: erc20VotingPower,
    eventName: "DelegateVotesChanged",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { delegate } = log.args as { delegate: Address };
          // Refresh if this account's voting power changed
          if (account && delegate === account) {
            refetchVotes();
          }
        }
      });
    },
  });

  // Get voting power at a specific block
  const getVotesAtBlock = useCallback(
    async (accountAddress: Address, blockNumber: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "getPastVotes",
          args: [accountAddress, blockNumber],
        });
        return BigInt(String(result) || "0");
      } catch (error) {
        console.error("Error getting past votes:", error);
        return 0n;
      }
    },
    [contractAddress, config]
  );

  // Get total supply at a specific block
  const getPastTotalSupply = useCallback(
    async (blockNumber: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "getPastTotalSupply",
          args: [blockNumber],
        });
        return BigInt(String(result) || "0");
      } catch (error) {
        console.error("Error getting past total supply:", error);
        return 0n;
      }
    },
    [contractAddress, config]
  );

  // Get checkpoints for an account
  const getCheckpoints = useCallback(
    async (
      accountAddress: Address,
      start: number = 0,
      count: number = 10
    ): Promise<Checkpoint[]> => {
      if (!contractAddress) return [];

      try {
        const checkpoints: Checkpoint[] = [];

        // Get total number of checkpoints
        const numCheckpointsResult = await readContract(config, {
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "numCheckpoints",
          args: [accountAddress],
        });

        const totalCheckpoints = Number(numCheckpointsResult || 0);

        if (totalCheckpoints === 0) return [];

        const end = Math.min(start + count, totalCheckpoints);

        // Fetch each checkpoint
        for (let i = start; i < end; i++) {
          const checkpointResult = await readContract(config, {
            address: contractAddress,
            abi: erc20VotingPower,
            functionName: "checkpoints",
            args: [accountAddress, i],
          });

          if (checkpointResult) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = checkpointResult as any;
            checkpoints.push({
              fromBlock: BigInt(
                data.fromBlock?.toString() || data[0]?.toString() || "0"
              ),
              votes: BigInt(
                data.votes?.toString() || data[1]?.toString() || "0"
              ),
            });
          }
        }

        return checkpoints;
      } catch (error) {
        console.error("Error getting checkpoints:", error);
        return [];
      }
    },
    [contractAddress, config]
  );

  // Transfer tokens
  const transfer = useCallback(
    async (params: TransferParams) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { to, amount } = params;
      resetTransfer();

      try {
        const hash = await transferAsync({
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "transfer",
          args: [to, amount],
        });
        return hash;
      } catch (error) {
        console.error("Error transferring tokens:", error);
        throw error;
      }
    },
    [contractAddress, transferAsync, resetTransfer]
  );

  // Approve spender
  const approve = useCallback(
    async (params: ApproveParams) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { spender, amount } = params;
      resetApprove();

      try {
        const hash = await approveAsync({
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "approve",
          args: [spender, amount],
        });
        return hash;
      } catch (error) {
        console.error("Error approving spender:", error);
        throw error;
      }
    },
    [contractAddress, approveAsync, resetApprove]
  );

  // Delegate voting power
  const delegate = useCallback(
    async (delegatee: Address) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      resetDelegate();

      try {
        const hash = await delegateAsync({
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "delegate",
          args: [delegatee],
        });

        // Update cache
        if (account) {
          setDelegateCache((prev) => ({
            ...prev,
            [account]: delegatee,
          }));
        }

        return hash;
      } catch (error) {
        console.error("Error delegating votes:", error);
        throw error;
      }
    },
    [contractAddress, delegateAsync, account, resetDelegate]
  );

  // Delegate votes by signature
  const delegateBySig = useCallback(
    async (params: DelegateBySigParams) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { delegatee, nonce, expiry, v, r, s } = params;

      try {
        const hash = await delegateBySigAsync({
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "delegateBySig",
          args: [delegatee, nonce, expiry, v, r, s],
        });
        return hash;
      } catch (error) {
        console.error("Error delegating votes by signature:", error);
        throw error;
      }
    },
    [contractAddress, delegateBySigAsync]
  );

  // Get current delegate for an account
  const getDelegate = useCallback(
    async (accountAddress: Address): Promise<Address> => {
      if (!contractAddress) return "0x0000000000000000000000000000000000000000";

      // Check cache first
      if (delegateCache[accountAddress]) {
        return delegateCache[accountAddress];
      }

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "delegates",
          args: [accountAddress],
        });

        const delegate = result as Address;

        // Update cache
        setDelegateCache((prev) => ({
          ...prev,
          [accountAddress]: delegate,
        }));

        return delegate;
      } catch (error) {
        console.error("Error getting delegate:", error);
        return "0x0000000000000000000000000000000000000000";
      }
    },
    [contractAddress, delegateCache, config]
  );

  // Get allowance for a spender
  const getAllowance = useCallback(
    async (owner: Address, spender: Address): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "allowance",
          args: [owner, spender],
        });
        return BigInt(result as string || "0");
      } catch (error) {
        console.error("Error getting allowance:", error);
        return 0n;
      }
    },
    [contractAddress, config]
  );

  // Get nonce for delegateBySig
  const getNonce = useCallback(
    async (accountAddress: Address): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc20VotingPower,
          functionName: "nonces",
          args: [accountAddress],
        });
        return BigInt(result as string || "0");
      } catch (error) {
        console.error("Error getting nonce:", error);
        return 0n;
      }
    },
    [contractAddress, config]
  );

  // Refresh all data
  const refresh = useCallback(async () => {
    const promises = [
      refetchName(),
      refetchSymbol(),
      refetchDecimals(),
      refetchTotalSupply(),
      refetchMaxSupply(),
    ];

    if (account) {
      promises.push(refetchBalance(), refetchVotes(), refetchCurrentDelegate());
    }

    await Promise.all(promises);
  }, [
    refetchName,
    refetchSymbol,
    refetchDecimals,
    refetchTotalSupply,
    refetchMaxSupply,
    refetchBalance,
    refetchVotes,
    refetchCurrentDelegate,
    account,
  ]);

  return {
    // Token metadata
    name: tokenName as string | undefined,
    symbol: tokenSymbol as string | undefined,
    decimals: tokenDecimals ? Number(tokenDecimals) : 18,
    totalSupply: tokenTotalSupply ? BigInt(tokenTotalSupply.toString()) : 0n,
    maxSupply: tokenMaxSupply ? BigInt(tokenMaxSupply.toString()) : 0n,

    // Account data
    balance: accountBalance ? BigInt(accountBalance.toString()) : 0n,
    votingPower: currentVotes ? BigInt(currentVotes.toString()) : 0n,
    currentDelegate: currentDelegate as Address | undefined,
    delegateCache,

    // Loading states
    isLoading:
      isLoadingName ||
      isLoadingSymbol ||
      isLoadingDecimals ||
      isLoadingTotalSupply ||
      isLoadingMaxSupply,
    isLoadingBalance: isLoadingBalance,
    isLoadingVotingPower: isLoadingVotes,
    isLoadingDelegate: isLoadingDelegate,
    isTransferring: isTransferPending || isWaitingForTransfer,
    isApproving: isApprovePending || isWaitingForApprove,
    isDelegating:
      isDelegatePending || isDelegateBySigPending || isWaitingForDelegate,

    // Errors
    transferError: transferError?.message || null,
    approveError: approveError?.message || null,
    delegateError:
      delegateError?.message || delegateBySigError?.message || null,

    // Actions
    transfer,
    approve,
    delegate,
    delegateBySig,
    getVotesAtBlock,
    getPastTotalSupply,
    getCheckpoints,
    getDelegate,
    getAllowance,
    getNonce,
    refresh,

    // Contract info
    contract: {
      address: contractAddress,
      abi: erc20VotingPower,
    },
  };
}

/* Usage Example:

import { parseUnits, formatUnits } from 'viem';

const { 
  name,
  symbol,
  decimals,
  totalSupply,
  balance,
  votingPower,
  currentDelegate,
  transfer,
  approve,
  delegate,
  getVotesAtBlock,
  isTransferring,
  isDelegating,
  transferError
} = useERC20VotingPower(tokenAddress);

// Display token info
console.log(`Token: ${name} (${symbol})`);
console.log(`Balance: ${formatUnits(balance, decimals)}`);
console.log(`Voting Power: ${formatUnits(votingPower, decimals)}`);

// Transfer tokens
const handleTransfer = async () => {
  try {
    const hash = await transfer({
      to: recipientAddress,
      amount: parseUnits('100', decimals)
    });
    
    console.log('Transfer transaction:', hash);
    // Wait for isTransferring to become false
  } catch (error) {
    console.error('Transfer failed:', error);
  }
};

// Approve spender
const handleApprove = async () => {
  try {
    const hash = await approve({
      spender: spenderAddress,
      amount: parseUnits('1000', decimals)
    });
    
    console.log('Approval transaction:', hash);
  } catch (error) {
    console.error('Approval failed:', error);
  }
};

// Delegate voting power
const handleDelegate = async (delegatee: Address) => {
  try {
    const hash = await delegate(delegatee);
    console.log('Delegation transaction:', hash);
    // currentDelegate will update after confirmation
  } catch (error) {
    console.error('Delegation failed:', error);
  }
};

// Self-delegate (delegate to own address)
const handleSelfDelegate = async () => {
  if (account) {
    await handleDelegate(account);
  }
};

// Get historical voting power
const checkHistoricalVotingPower = async (blockNumber: bigint) => {
  const votes = await getVotesAtBlock(account, blockNumber);
  console.log(`Voting power at block ${blockNumber}:`, formatUnits(votes, decimals));
};

// Get checkpoints
const loadCheckpoints = async () => {
  if (account) {
    const checkpoints = await getCheckpoints(account, 0, 10);
    checkpoints.forEach(cp => {
      console.log(`Block ${cp.fromBlock}: ${formatUnits(cp.votes, decimals)} votes`);
    });
  }
};

*/

export function useERC721VotingPower(contractAddress?: Address) {
  const { address: account } = useAccount();
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [isFetchingNFTs, setIsFetchingNFTs] = useState(false);
  const config = useConfig();

  // Token metadata
  const {
    data: tokenName,
    isLoading: isLoadingName,
    refetch: refetchName,
  } = useReadContract({
    address: contractAddress,
    abi: erc721VotingPower,
    functionName: "name",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: tokenSymbol,
    isLoading: isLoadingSymbol,
    refetch: refetchSymbol,
  } = useReadContract({
    address: contractAddress,
    abi: erc721VotingPower,
    functionName: "symbol",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: tokenTotalSupply,
    isLoading: isLoadingTotalSupply,
    refetch: refetchTotalSupply,
  } = useReadContract({
    address: contractAddress,
    abi: erc721VotingPower,
    functionName: "totalSupply",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    data: tokenMaxSupply,
    isLoading: isLoadingMaxSupply,
    refetch: refetchMaxSupply,
  } = useReadContract({
    address: contractAddress,
    abi: erc721VotingPower,
    functionName: "maxSupply",
    query: {
      enabled: !!contractAddress,
    },
  });

  // Account balance and voting power
  const {
    data: accountBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: contractAddress,
    abi: erc721VotingPower,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: {
      enabled: !!contractAddress && !!account,
    },
  });

  const {
    data: currentVotes,
    isLoading: isLoadingVotes,
    refetch: refetchVotes,
  } = useReadContract({
    address: contractAddress,
    abi: erc721VotingPower,
    functionName: "getVotes",
    args: account ? [account] : undefined,
    query: {
      enabled: !!contractAddress && !!account,
    },
  });

  const {
    data: currentDelegate,
    isLoading: isLoadingDelegate,
    refetch: refetchDelegate,
  } = useReadContract({
    address: contractAddress,
    abi: erc721VotingPower,
    functionName: "delegates",
    args: account ? [account] : undefined,
    query: {
      enabled: !!contractAddress && !!account,
    },
  });

  // Write operations
  const {
    writeContractAsync: transferAsync,
    data: transferTxHash,
    isPending: isTransferPending,
    error: transferError,
    reset: resetTransfer,
  } = useWriteContract();

  const {
    writeContractAsync: approveAsync,
    data: approveTxHash,
    isPending: isApprovePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    writeContractAsync: setApprovalForAllAsync,
    data: approvalForAllTxHash,
    isPending: isApprovalForAllPending,
    error: approvalForAllError,
    reset: resetApprovalForAll,
  } = useWriteContract();

  const {
    writeContractAsync: delegateAsync,
    data: delegateTxHash,
    isPending: isDelegatePending,
    error: delegateError,
    reset: resetDelegate,
  } = useWriteContract();

  const {
    writeContractAsync: mintAsync,
    data: mintTxHash,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isWaitingForTransfer, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferTxHash,
    });

  const { isLoading: isWaitingForApprove } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isLoading: isWaitingForApprovalForAll } =
    useWaitForTransactionReceipt({
      hash: approvalForAllTxHash,
    });

  const { isLoading: isWaitingForDelegate, isSuccess: isDelegateSuccess } =
    useWaitForTransactionReceipt({
      hash: delegateTxHash,
    });

  const {
    isLoading: isWaitingForMint,
    isSuccess: isMintSuccess,
    data: mintReceipt,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  // Fetch NFT metadata from tokenURI
  const fetchNFTMetadata = useCallback(
    async (tokenURI: string): Promise<NFTMetadata | undefined> => {
      try {
        // Handle IPFS URLs
        let url = tokenURI;
        if (tokenURI.startsWith("ipfs://")) {
          url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        const response = await fetch(url);
        if (!response.ok) return undefined;

        const metadata = await response.json();
        return metadata as NFTMetadata;
      } catch (error) {
        console.error("Error fetching NFT metadata:", error);
        return undefined;
      }
    },
    []
  );

  // Fetch single NFT details
  const fetchNFT = useCallback(
    async (tokenId: bigint): Promise<NFT | null> => {
      if (!contractAddress) return null;

      try {
        const [ownerResult, tokenURIResult, approvedResult] = await Promise.all(
          [
            readContract(config, {
              address: contractAddress,
              abi: erc721VotingPower,
              functionName: "ownerOf",
              args: [tokenId],
            }),
            readContract(config, {
              address: contractAddress,
              abi: erc721VotingPower,
              functionName: "tokenURI",
              args: [tokenId],
            }),
            readContract(config, {
              address: contractAddress,
              abi: erc721VotingPower,
              functionName: "getApproved",
              args: [tokenId],
            }),
          ]
        );

        const owner = ownerResult as Address;
        const tokenURI = tokenURIResult as string;
        const approved = approvedResult as Address;

        // Optionally fetch metadata
        let metadata: NFTMetadata | undefined;
        if (tokenURI) {
          metadata = await fetchNFTMetadata(tokenURI);
        }

        return {
          tokenId,
          owner,
          tokenURI,
          approved,
          metadata,
        };
      } catch (error) {
        console.error("Error fetching NFT:", error);
        return null;
      }
    },
    [contractAddress, fetchNFTMetadata, config]
  );

  // Fetch all owned NFTs
  const fetchOwnedNFTs = useCallback(async () => {
    if (!contractAddress || !account || !accountBalance) {
      setOwnedNFTs([]);
      return;
    }

    setIsFetchingNFTs(true);

    try {
      const balance = Number(accountBalance);
      const nfts: NFT[] = [];

      // Fetch token IDs in parallel (in batches to avoid overwhelming the RPC)
      const batchSize = 10;
      for (let i = 0; i < balance; i += batchSize) {
        const batch = Math.min(batchSize, balance - i);
        const promises = [];

        for (let j = 0; j < batch; j++) {
          const index = i + j;
          if (index < balance) {
            promises.push(
              readContract(config, {
                address: contractAddress,
                abi: erc721VotingPower,
                functionName: "tokenOfOwnerByIndex",
                args: [account, BigInt(index)],
              })
            );
          }
        }

        const results = await Promise.all(promises);

        // Fetch NFT details for each token ID
        const nftPromises = results
          .filter((result) => result)
          .map((result) => fetchNFT(BigInt(result as string)));

        const batchNFTs = await Promise.all(nftPromises);
        nfts.push(...batchNFTs.filter((nft): nft is NFT => nft !== null));
      }

      setOwnedNFTs(nfts);
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
      setOwnedNFTs([]);
    } finally {
      setIsFetchingNFTs(false);
    }
  }, [contractAddress, account, accountBalance, fetchNFT, config]);

  // Refresh data after successful transactions
  useEffect(() => {
    if (isTransferSuccess) {
      refetchBalance();
      refetchTotalSupply();
      refetchVotes();
      fetchOwnedNFTs();
    }
  }, [
    isTransferSuccess,
    refetchBalance,
    refetchTotalSupply,
    refetchVotes,
    fetchOwnedNFTs,
  ]);

  useEffect(() => {
    if (isDelegateSuccess) {
      refetchVotes();
      refetchDelegate();
    }
  }, [isDelegateSuccess, refetchVotes, refetchDelegate]);

  useEffect(() => {
    if (isMintSuccess) {
      refetchBalance();
      refetchTotalSupply();
      fetchOwnedNFTs();
    }
  }, [isMintSuccess, refetchBalance, refetchTotalSupply, fetchOwnedNFTs]);

  // Event listeners
  useWatchContractEvent({
    address: contractAddress,
    abi: erc721VotingPower,
    eventName: "Transfer",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { from, to } = log.args as { 
            from: Address; 
            to: Address 
          };
          // Refresh if this account is involved
          if (account && (from === account || to === account)) {
            refetchBalance();
            refetchVotes();
            refetchTotalSupply();
            fetchOwnedNFTs();
          }
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: erc721VotingPower,
    eventName: "DelegateChanged",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { delegator } = log.args as { 
            delegator: Address 
          };
          if (account && delegator === account) {
            refetchVotes();
            refetchDelegate();
          }
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: erc721VotingPower,
    eventName: "DelegateVotesChanged",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { delegate } = log.args as { 
            delegate: Address 
          };
          if (account && delegate === account) {
            refetchVotes();
          }
        }
      });
    },
  });

  // Auto-fetch NFTs when balance changes
  useEffect(() => {
    if (accountBalance && Number(accountBalance) > 0) {
      fetchOwnedNFTs();
    } else {
      setOwnedNFTs([]);
    }
  }, [accountBalance, fetchOwnedNFTs]);

  // Get voting power at a specific block
  const getVotesAtBlock = useCallback(
    async (accountAddress: Address, blockNumber: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "getPastVotes",
          args: [accountAddress, blockNumber],
        });
        return BigInt((result as string) || "0");
      } catch (error) {
        console.error("Error getting past votes:", error);
        return 0n;
      }
    },
    [contractAddress, config]
  );

  // Get past total supply
  const getPastTotalSupply = useCallback(
    async (blockNumber: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "getPastTotalSupply",
          args: [blockNumber],
        });
        return BigInt((result as string) || "0");
      } catch (error) {
        console.error("Error getting past total supply:", error);
        return 0n;
      }
    },
    [contractAddress, config]
  );

  // Transfer NFT
  const transfer = useCallback(
    async (params: TransferNFTParams) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { from, to, tokenId } = params;
      resetTransfer();

      try {
        const hash = await transferAsync({
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "safeTransferFrom",
          args: [from, to, tokenId],
        });
        return hash;
      } catch (error) {
        console.error("Error transferring NFT:", error);
        throw error;
      }
    },
    [contractAddress, transferAsync, resetTransfer]
  );

  // Approve address to manage NFT
  const approve = useCallback(
    async (params: ApproveParams) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { to, tokenId } = params;
      resetApprove();

      try {
        const hash = await approveAsync({
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "approve",
          args: [to, tokenId],
        });
        return hash;
      } catch (error) {
        console.error("Error approving address:", error);
        throw error;
      }
    },
    [contractAddress, approveAsync, resetApprove]
  );

  // Set approval for all tokens
  const setApprovalForAll = useCallback(
    async (params: SetApprovalForAllParams) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { operator, approved } = params;
      resetApprovalForAll();

      try {
        const hash = await setApprovalForAllAsync({
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "setApprovalForAll",
          args: [operator, approved],
        });
        return hash;
      } catch (error) {
        console.error("Error setting operator approval:", error);
        throw error;
      }
    },
    [contractAddress, setApprovalForAllAsync, resetApprovalForAll]
  );

  // Delegate voting power
  const delegate = useCallback(
    async (delegatee: Address) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      resetDelegate();

      try {
        const hash = await delegateAsync({
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "delegate",
          args: [delegatee],
        });

        return hash;
      } catch (error) {
        console.error("Error delegating votes:", error);
        throw error;
      }
    },
    [contractAddress, delegateAsync, resetDelegate]
  );

  // Mint new NFT
  const mint = useCallback(
    async (to: Address) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      try {
        const hash = await mintAsync({
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "mint",
          args: [to],
        });

        return hash;
      } catch (error) {
        console.error("Error minting NFT:", error);
        throw error;
      }
    },
    [contractAddress, mintAsync]
  );

  // Get token URI
  const getTokenURI = useCallback(
    async (tokenId: bigint): Promise<string> => {
      if (!contractAddress) return "";

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "tokenURI",
          args: [tokenId],
        });
        return (result as string) || "";
      } catch (error) {
        console.error("Error getting token URI:", error);
        return "";
      }
    },
    [contractAddress, config]
  );

  // Get owner of token
  const getOwnerOf = useCallback(
    async (tokenId: bigint): Promise<Address | null> => {
      if (!contractAddress) return null;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "ownerOf",
          args: [tokenId],
        });
        return result as Address;
      } catch (error) {
        console.error("Error getting owner:", error);
        return null;
      }
    },
    [contractAddress, config]
  );

  // Check if operator is approved for all
  const isApprovedForAll = useCallback(
    async (owner: Address, operator: Address): Promise<boolean> => {
      if (!contractAddress) return false;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "isApprovedForAll",
          args: [owner, operator],
        });
        return result as boolean;
      } catch (error) {
        console.error("Error checking approval for all:", error);
        return false;
      }
    },
    [contractAddress, config]
  );

  // Get approved address for token
  const getApproved = useCallback(
    async (tokenId: bigint): Promise<Address | null> => {
      if (!contractAddress) return null;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: erc721VotingPower,
          functionName: "getApproved",
          args: [tokenId],
        });
        return result as Address;
      } catch (error) {
        console.error("Error getting approved address:", error);
        return null;
      }
    },
    [contractAddress, config]
  );

  // Refresh all data
  const refresh = useCallback(async () => {
    const promises = [
      refetchName(),
      refetchSymbol(),
      refetchTotalSupply(),
      refetchMaxSupply(),
    ];

    if (account) {
      promises.push(refetchBalance(), refetchVotes(), refetchDelegate());
    }

    await Promise.all(promises);

    // Fetch NFTs after balance is updated
    if (account && accountBalance) {
      await fetchOwnedNFTs();
    }
  }, [
    refetchName,
    refetchSymbol,
    refetchTotalSupply,
    refetchMaxSupply,
    refetchBalance,
    refetchVotes,
    refetchDelegate,
    fetchOwnedNFTs,
    account,
    accountBalance,
  ]);

  return {
    // Token metadata
    name: tokenName as string | undefined,
    symbol: tokenSymbol as string | undefined,
    totalSupply: tokenTotalSupply ? BigInt(tokenTotalSupply.toString()) : 0n,
    maxSupply: tokenMaxSupply ? BigInt(tokenMaxSupply.toString()) : 0n,

    // Account data
    balance: accountBalance ? BigInt(accountBalance.toString()) : 0n,
    votingPower: currentVotes ? BigInt(currentVotes.toString()) : 0n,
    currentDelegate: currentDelegate as Address | undefined,
    ownedNFTs,

    // Loading states
    isLoading:
      isLoadingName ||
      isLoadingSymbol ||
      isLoadingTotalSupply ||
      isLoadingMaxSupply,
    isLoadingBalance: isLoadingBalance,
    isLoadingVotingPower: isLoadingVotes,
    isLoadingDelegate: isLoadingDelegate,
    isFetchingNFTs,
    isTransferring: isTransferPending || isWaitingForTransfer,
    isApproving: isApprovePending || isWaitingForApprove,
    isSettingApprovalForAll:
      isApprovalForAllPending || isWaitingForApprovalForAll,
    isDelegating: isDelegatePending || isWaitingForDelegate,
    isMinting: isMintPending || isWaitingForMint,

    // Errors
    transferError: transferError?.message || null,
    approveError: approveError?.message || null,
    approvalForAllError: approvalForAllError?.message || null,
    delegateError: delegateError?.message || null,
    mintError: mintError?.message || null,

    // Actions
    transfer,
    approve,
    setApprovalForAll,
    delegate,
    mint,

    // Query functions
    getTokenURI,
    getOwnerOf,
    getApproved,
    isApprovedForAll,
    getVotesAtBlock,
    getPastTotalSupply,
    fetchNFT,
    fetchOwnedNFTs,
    refresh,

    // Contract info
    contract: {
      address: contractAddress,
      abi: erc721VotingPower,
    },
  };
}

export default useERC721VotingPower;

/* Usage Example:

const { 
  name,
  symbol,
  balance,
  votingPower,
  ownedNFTs,
  currentDelegate,
  transfer,
  approve,
  delegate,
  mint,
  isTransferring,
  isDelegating,
  isFetchingNFTs
} = useERC721VotingPower(nftAddress);

// Display NFT collection info
console.log(`Collection: ${name} (${symbol})`);
console.log(`Owned NFTs: ${balance.toString()}`);
console.log(`Voting Power: ${votingPower.toString()}`);

// Transfer NFT
const handleTransfer = async (tokenId: bigint, recipient: Address) => {
  if (!account) return;
  
  try {
    const hash = await transfer({
      from: account,
      to: recipient,
      tokenId
    });
    
    console.log('Transfer transaction:', hash);
  } catch (error) {
    console.error('Transfer failed:', error);
  }
};

// Approve operator for specific NFT
const handleApprove = async (tokenId: bigint, operator: Address) => {
  try {
    const hash = await approve({
      to: operator,
      tokenId
    });
    
    console.log('Approval transaction:', hash);
  } catch (error) {
    console.error('Approval failed:', error);
  }
};

// Delegate voting power
const handleDelegate = async (delegatee: Address) => {
  try {
    const hash = await delegate(delegatee);
    console.log('Delegation transaction:', hash);
  } catch (error) {
    console.error('Delegation failed:', error);
  }
};

// Display owned NFTs
ownedNFTs.forEach(nft => {
  console.log(`Token ID: ${nft.tokenId}`);
  console.log(`URI: ${nft.tokenURI}`);
  if (nft.metadata) {
    console.log(`Name: ${nft.metadata.name}`);
    console.log(`Image: ${nft.metadata.image}`);
  }
});

// Mint new NFT (requires MINTER_ROLE)
const handleMint = async (recipient: Address) => {
  try {
    const hash = await mint(recipient);
    console.log('Mint transaction:', hash);
    // New NFT will appear in ownedNFTs after confirmation
  } catch (error) {
    console.error('Mint failed:', error);
  }
};

*/
