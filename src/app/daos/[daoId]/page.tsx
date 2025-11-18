import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { useAccount } from 'wagmi'
import { DaoHeader } from '@/components/dao/DaoHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useGovernor } from '@/hooks/useGovernor'
import { useTreasury } from '@/hooks/useTreasury'
import { useERC20VotingPower } from '@/hooks/votingPower/useERC20VotingPower'
import { useERC721VotingPower } from '@/hooks/votingPower/useERC721VotingPower'

interface DaoPageProps {
  params: {
    daoId: string
  }
}

export default function DaoPage({ params }: DaoPageProps) {
  const { daoId } = params
  const { address } = useAccount()
  
  // Fetch DAO data using the governor hook
  const { 
    data: governorData, 
    isLoading: isGovernorLoading, 
    error: governorError 
  } = useGovernor()
  
  // Fetch treasury data
  const { 
    data: treasuryData, 
    isLoading: isTreasuryLoading 
  } = useTreasury()
  
  // Fetch voting power data if wallet is connected
  const { 
    balance: tokenBalance,
    totalSupply: tokenTotalSupply,
    decimals: tokenDecimals
  } = useERC20VotingPower(address)
  
  const { 
    balance: nftBalance,
    totalSupply: nftTotalSupply
  } = useERC721VotingPower(address)
  
  const isLoading = isGovernorLoading || isTreasuryLoading
  
  if (isLoading) return <DaoPageSkeleton />
  if (governorError) return notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<DaoHeaderSkeleton />}>
        <DaoHeader 
          name={governorData?.name || 'Unnamed DAO'}
          description={governorData?.description || 'A decentralized autonomous organization'}
          members={nftTotalSupply?.toNumber() || 0}
          proposals={governorData?.proposalCount || 0}
        />
      </Suspense>

      <div className="mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
            <TabsTrigger value="token">Token</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">DAO Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Governance</h3>
                  <div className="space-y-2">
                    <p>Voting Delay: {governorData?.votingDelay?.toString()} blocks</p>
                    <p>Voting Period: {governorData?.votingPeriod?.toString()} blocks</p>
                    <p>Proposal Threshold: {governorData?.proposalThreshold?.toString()} tokens</p>
                    <p>Quorum: {governorData?.quorumNumerator?.toString()}% of total supply</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Voting Power</h3>
                  <div className="space-y-2">
                    {tokenBalance && (
                      <p>Token Balance: {tokenBalance?.toString()} {governorData?.tokenSymbol || 'tokens'}</p>
                    )}
                    {nftBalance && (
                      <p>NFT Balance: {nftBalance?.toString()} NFTs</p>
                    )}
                    <p>Total Supply: {tokenTotalSupply?.toString()} {governorData?.tokenSymbol || 'tokens'}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="proposals" className="mt-6">
            <div className="rounded-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Proposals</h2>
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Create Proposal
                </Button>
              </div>
              <div className="space-y-4">
                {governorData?.proposals?.length > 0 ? (
                  governorData.proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{proposal.title || `Proposal #${proposal.id}`}</h3>
                        <Badge variant={proposal.state === 'Active' ? 'default' : 'secondary'}>
                          {proposal.state}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ends in {proposal.endBlock - proposal.startBlock} blocks
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No proposals yet</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Add other tab contents */}
          
        </Tabs>
      </div>
    </div>
  )
}

function DaoHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end pb-6 border-b">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  )
}

function DaoPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DaoHeaderSkeleton />
      <div className="mt-8">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
