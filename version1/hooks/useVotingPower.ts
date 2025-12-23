import { useState, useCallback, useEffect } from "react";
import { Address, Hash } from "viem";
import { ERC20VotingPower, ERC721VotingPower } from "@/lib/abis";
import {
  useConnection,
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

export interface ApproveERC20Params {
  spender: Address;
  amount: bigint;
}

export interface ApproveERC721Params {
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
  const { address: account } = useConnection();
  const [delegateCache, setDelegateCache] = useState<Record<Address, Address>>({});
  const config = useConfig();

  // Token metadata
  const {
    data: tokenName,
    isLoading: isLoadingName,
    refetch: refetchName,
  } = useReadContract({
    address: contractAddress,
    abi: ERC20VotingPower,
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
    abi: ERC20VotingPower,
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
    abi: ERC20VotingPower,
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
    abi: ERC20VotingPower,
    functionName: "totalSupply",
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
    abi: ERC20VotingPower,
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
    abi: ERC20VotingPower,
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
    abi: ERC20VotingPower,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    abi: ERC20VotingPower,
    eventName: "Transfer",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { from, to } = log.args as { from: Address; to: Address; value: bigint };
          if (account && (from === account || to === account)) {
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
    abi: ERC20VotingPower,
    eventName: "DelegateChanged",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { delegator, toDelegate } = log.args as {
            delegator: Address;
            fromDelegate: Address;
            toDelegate: Address;
          };
          if (delegator) {
            setDelegateCache((prev) => ({
              ...prev,
              [delegator]: toDelegate
            }));
          }
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
    abi: ERC20VotingPower,
    eventName: "DelegateVotesChanged",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { delegate } = log.args as { delegate: Address };
          if (account && delegate === account) {
            refetchVotes();
          }
        }
      });
    },
  });

  // Get voting power at a specific block
  const getVotesAtBlock = useCallback(
    async (accountAddress: Address, timepoint: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: ERC20VotingPower,
          functionName: "getPastVotes",
          args: [accountAddress, timepoint],
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
    async (timepoint: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: ERC20VotingPower,
          functionName: "getPastTotalSupply",
          args: [timepoint],
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

        const numCheckpointsResult = await readContract(config, {
          address: contractAddress,
          abi: ERC20VotingPower,
          functionName: "numCheckpoints",
          args: [accountAddress],
        });

        const totalCheckpoints = Number(numCheckpointsResult || 0);

        if (totalCheckpoints === 0) return [];

        const end = Math.min(start + count, totalCheckpoints);

        for (let i = start; i < end; i++) {
          const checkpointResult = await readContract(config, {
            address: contractAddress,
            abi: ERC20VotingPower,
            functionName: "checkpoints",
            args: [accountAddress, i],
          });

          if (checkpointResult) {
            const data = checkpointResult as { _key: bigint; _value: bigint };
            checkpoints.push({
              fromBlock: data._key,
              votes: data._value,
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
          abi: ERC20VotingPower,
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
    async (params: ApproveERC20Params) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { spender, amount } = params;
      resetApprove();

      try {
        const hash = await approveAsync({
          address: contractAddress,
          abi: ERC20VotingPower,
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
          abi: ERC20VotingPower,
          functionName: "delegate",
          args: [delegatee],
        });

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
          abi: ERC20VotingPower,
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

      if (delegateCache[accountAddress]) {
        return delegateCache[accountAddress];
      }

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: ERC20VotingPower,
          functionName: "delegates",
          args: [accountAddress],
        });

        const delegate = result as Address;

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
          abi: ERC20VotingPower,
          functionName: "allowance",
          args: [owner, spender],
        });
        return BigInt(String(result) || "0");
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
          abi: ERC20VotingPower,
          functionName: "nonces",
          args: [accountAddress],
        });
        return BigInt(String(result) || "0");
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
      isLoadingTotalSupply,
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
      abi: ERC20VotingPower,
    },
  };
}

export function useERC721VotingPower(contractAddress?: Address) {
  const { address: account } = useConnection();
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
    abi: ERC721VotingPower,
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
    abi: ERC721VotingPower,
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
    abi: ERC721VotingPower,
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
    abi: ERC721VotingPower,
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
    abi: ERC721VotingPower,
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
    abi: ERC721VotingPower,
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
    abi: ERC721VotingPower,
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
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  // Fetch NFT metadata from tokenURI
  const fetchNFTMetadata = useCallback(
    async (tokenURI: string): Promise<NFTMetadata | undefined> => {
      try {
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
        const [ownerResult, tokenURIResult, approvedResult] = await Promise.all([
          readContract(config, {
            address: contractAddress,
            abi: ERC721VotingPower,
            functionName: "ownerOf",
            args: [tokenId],
          }),
          readContract(config, {
            address: contractAddress,
            abi: ERC721VotingPower,
            functionName: "tokenURI",
            args: [tokenId],
          }),
          readContract(config, {
            address: contractAddress,
            abi: ERC721VotingPower,
            functionName: "getApproved",
            args: [tokenId],
          }),
        ]);

        const owner = ownerResult as Address;
        const tokenURI = tokenURIResult as string;
        const approved = approvedResult as Address;

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

  // Fetch owned NFTs by checking Transfer events
  const fetchOwnedNFTs = useCallback(async () => {
    if (!contractAddress || !account) {
      setOwnedNFTs([]);
      return;
    }

    setIsFetchingNFTs(true);

    try {
      // Note: Since tokenOfOwnerByIndex is not in the ABI,
      // we'd need to track NFTs via Transfer events or other means
      // For now, this is a simplified version that you'd need to enhance
      // based on your specific needs (e.g., using an indexer or subgraph)
      
      setOwnedNFTs([]);
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
      setOwnedNFTs([]);
    } finally {
      setIsFetchingNFTs(false);
    }
  }, [contractAddress, account]);

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
    abi: ERC721VotingPower,
    eventName: "Transfer",
    onLogs(logs) {
      logs.forEach((log) => {
        if ("args" in log && log.args) {
          const { from, to } = log.args as { 
            from: Address; 
            to: Address 
          };
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
    abi: ERC721VotingPower,
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
    abi: ERC721VotingPower,
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

  // Get voting power at a specific timepoint
  const getVotesAtBlock = useCallback(
    async (accountAddress: Address, timepoint: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: ERC721VotingPower,
          functionName: "getPastVotes",
          args: [accountAddress, timepoint],
        });
        return BigInt(String(result) || "0");
      } catch (error) {
        console.error("Error getting past votes:", error);
        return 0n;
      }
    },
    [contractAddress, config]
  );

  // Get past total supply
  const getPastTotalSupply = useCallback(
    async (timepoint: bigint): Promise<bigint> => {
      if (!contractAddress) return 0n;

      try {
        const result = await readContract(config, {
          address: contractAddress,
          abi: ERC721VotingPower,
          functionName: "getPastTotalSupply",
          args: [timepoint],
        });
        return BigInt(String(result) || "0");
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
          abi: ERC721VotingPower,
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
    async (params: ApproveERC721Params) => {
      if (!contractAddress) {
        throw new Error("Contract address not provided");
      }

      const { to, tokenId } = params;
      resetApprove();

      try {
        const hash = await approveAsync({
          address: contractAddress,
          abi: ERC721VotingPower,
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
          abi: ERC721VotingPower,
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
          abi: ERC721VotingPower,
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
          abi: ERC721VotingPower,
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
          abi: ERC721VotingPower,
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
          abi: ERC721VotingPower,
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
          abi: ERC721VotingPower,
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
          abi: ERC721VotingPower,
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
      abi: ERC721VotingPower,
    },
  };
}

export default useERC20VotingPower;