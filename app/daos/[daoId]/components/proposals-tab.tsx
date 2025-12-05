'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, FileText, Plus, Search } from "lucide-react"
import { CreateProposalModal } from "@/components/proposal/create-proposal-modal"

type Proposal = {
  id: number
  title: string
  status: 'active' | 'passed' | 'rejected' | 'executed' | 'queued'
  type: 'core' | 'funding' | 'membership' | 'governance'
  startDate: string
  endDate: string
  forVotes: number
  againstVotes: number
  abstainVotes: number
  quorum: number
}

interface ProposalsTabProps {
  daoId: string;
}

export function ProposalsTab({ daoId }: ProposalsTabProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // TODO: Fetch proposals from contract or API
  const proposals: Proposal[] = [
    {
      id: 145,
      title: "Marketing Budget Allocation for Q4 2025",
      status: "active",
      type: "funding",
      startDate: "2025-10-20T12:00:00Z",
      endDate: "2025-10-27T12:00:00Z",
      forVotes: 1200000,
      againstVotes: 400000,
      abstainVotes: 200000,
      quorum: 1000000
    },
    {
      id: 144,
      title: "Update Protocol Fee Structure",
      status: "passed",
      type: "governance",
      startDate: "2025-10-15T12:00:00Z",
      endDate: "2025-10-22T12:00:00Z",
      forVotes: 1800000,
      againstVotes: 200000,
      abstainVotes: 100000,
      quorum: 1000000
    },
    {
      id: 143,
      title: "Onboard New Core Team Member",
      status: "rejected",
      type: "membership",
      startDate: "2025-10-10T12:00:00Z",
      endDate: "2025-10-17T12:00:00Z",
      forVotes: 600000,
      againstVotes: 900000,
      abstainVotes: 100000,
      quorum: 1000000
    },
    {
      id: 142,
      title: "Upgrade Governance Module",
      status: "executed",
      type: "core",
      startDate: "2025-10-05T12:00:00Z",
      endDate: "2025-10-12T12:00:00Z",
      forVotes: 2000000,
      againstVotes: 300000,
      abstainVotes: 100000,
      quorum: 1000000
    },
  ]

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         `#${proposal.id}`.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    if (sortBy === "oldest") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    if (sortBy === "votes") return (b.forVotes + b.againstVotes) - (a.forVotes + a.againstVotes)
    return 0
  })

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'passed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'executed':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'queued':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (type) {
      case 'core':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'funding':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'membership':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'governance':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateVotePercentage = (forVotes: number, againstVotes: number, abstainVotes: number) => {
    const totalVotes = forVotes + againstVotes + abstainVotes
    if (totalVotes === 0) return { for: 0, against: 0, abstain: 0 }
    return {
      for: Math.round((forVotes / totalVotes) * 100),
      against: Math.round((againstVotes / totalVotes) * 100),
      abstain: Math.round((abstainVotes / totalVotes) * 100)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proposals</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="executed">Executed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="mostVotes">Most Votes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full sm:w-auto mt-2 sm:mt-0"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Proposal
          </Button>
        </div>
      </div>

      <Tabs 
        value={statusFilter} 
        onValueChange={setStatusFilter}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="executed">Executed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {sortedProposals.length > 0 ? (
          sortedProposals.map((proposal) => {
            const votePercentages = calculateVotePercentage(
              proposal.forVotes,
              proposal.againstVotes,
              proposal.abstainVotes
            )
            
            return (
              <div 
                key={proposal.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/daos/${daoId}/proposals/${proposal.id}`)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        #{proposal.id}: {proposal.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={getStatusBadge(proposal.status)}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                        <span className={getTypeBadge(proposal.type)}>
                          {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(proposal.startDate)} - {formatDate(proposal.endDate)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {proposal.status === 'active' && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>For {votePercentages.for}%</span>
                        <span>Against {votePercentages.against}%</span>
                        <span>Abstain {votePercentages.abstain}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${votePercentages.for}%` }}
                          />
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${votePercentages.against}%` }}
                          />
                          <div 
                            className="bg-gray-400" 
                            style={{ width: `${votePercentages.abstain}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{proposal.forVotes.toLocaleString()} votes</span>
                        <span>Quorum: {proposal.quorum.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No proposals found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new proposal.'}
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Proposal
              </Button>
            </div>
          </div>
        )}
      </div>
      <CreateProposalModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        daoId={daoId}
      />
    </div>
  )
}
