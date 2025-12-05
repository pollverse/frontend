'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, Search, UserPlus, Users } from "lucide-react"

type Member = {
  id: string
  address: string
  ensName?: string
  votingPower: number
  votingPowerPercentage: number
  role: 'admin' | 'member' | 'delegate' | 'founder'
  joinedAt: string
  proposals: number
  votes: number
  avatar?: string
}

interface MembersTabProps {
  daoId: string;
}

export function MembersTab({ }: MembersTabProps) {
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState<{ key: 'votingPower' | 'joinedAt' | 'proposals'; order: 'asc' | 'desc' }>({ 
    key: 'votingPower', 
    order: 'desc' 
  })
  
  // TODO: Fetch members from contract or API
  const members: Member[] = [
    {
      id: '1',
      address: '0x742d35Ce1339C8B7D2e8aE9B4eD4d1b1D4A5F4798',
      ensName: 'alice.eth',
      votingPower: 1500000,
      votingPowerPercentage: 15.2,
      role: 'founder',
      joinedAt: '2025-01-15T10:30:00Z',
      proposals: 24,
      votes: 156,
      avatar: '/avatars/alice.png'
    },
    {
      id: '2',
      address: '0x1234567890123456789012345678901234567890',
      votingPower: 1200000,
      votingPowerPercentage: 12.1,
      role: 'admin',
      joinedAt: '2025-02-20T14:15:00Z',
      proposals: 18,
      votes: 132,
      avatar: '/avatars/bob.png'
    },
    {
      id: '3',
      address: '0x0987654321098765432109876543210987654321',
      ensName: 'charlie.eth',
      votingPower: 980000,
      votingPowerPercentage: 9.8,
      role: 'delegate',
      joinedAt: '2025-03-10T09:45:00Z',
      proposals: 15,
      votes: 98,
      avatar: '/avatars/charlie.png'
    },
    {
      id: '4',
      address: '0x13579bdf02468acf159d0987654bafe642b4df3e',
      votingPower: 750000,
      votingPowerPercentage: 7.5,
      role: 'member',
      joinedAt: '2025-04-05T16:20:00Z',
      proposals: 8,
      votes: 67,
      avatar: '/avatars/dave.png'
    },
    {
      id: '5',
      address: '0x24680acf159d0987654bafe642b4df3e13579bdf',
      ensName: 'eve.eth',
      votingPower: 500000,
      votingPowerPercentage: 5.0,
      role: 'member',
      joinedAt: '2025-05-12T11:10:00Z',
      proposals: 5,
      votes: 42,
      avatar: '/avatars/eve.png'
    },
  ]

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.ensName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'delegates' && member.role === 'delegate') ||
      (activeFilter === 'admins' && (member.role === 'admin' || member.role === 'founder')) ||
      (activeFilter === 'members' && member.role === 'member')
    
    return matchesSearch && matchesFilter
  })

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy.key === 'votingPower') {
      return sortBy.order === 'desc' 
        ? b.votingPower - a.votingPower 
        : a.votingPower - b.votingPower
    } else if (sortBy.key === 'joinedAt') {
      return sortBy.order === 'desc'
        ? new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        : new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    } else if (sortBy.key === 'proposals') {
      return sortBy.order === 'desc' 
        ? b.proposals - a.proposals 
        : a.proposals - b.proposals
    }
    return 0
  })

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (role) {
      case 'founder':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'admin':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'delegate':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'member':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const handleSort = (key: 'votingPower' | 'joinedAt' | 'proposals') => {
    if (sortBy.key === key) {
      setSortBy(prev => ({
        key,
        order: prev.order === 'asc' ? 'desc' : 'asc'
      }))
    } else {
      setSortBy({
        key,
        order: 'desc'
      })
    }
  }

  const SortIcon = ({ column }: { column: 'votingPower' | 'joinedAt' | 'proposals' }) => {
    if (sortBy.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />
    
    return sortBy.order === 'asc' 
      ? <ArrowUp className="ml-2 h-3 w-3" />
      : <ArrowDown className="ml-2 h-3 w-3" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-9 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 rounded-md bg-muted p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'admins', label: 'Admins' },
              { id: 'delegates', label: 'Delegates' },
              { id: 'members', label: 'Members' },
            ].map((filter) => (
              <button
                key={filter.id}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeFilter === filter.id 
                    ? 'bg-background text-foreground shadow' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end w-full hover:text-foreground"
                  onClick={() => handleSort('votingPower')}
                >
                  Voting Power
                  <SortIcon column="votingPower" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end w-full hover:text-foreground"
                  onClick={() => handleSort('proposals')}
                >
                  Proposals
                  <SortIcon column="proposals" />
                </button>
              </TableHead>
              <TableHead className="text-right">Votes</TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center justify-end w-full hover:text-foreground"
                  onClick={() => handleSort('joinedAt')}
                >
                  Joined
                  <SortIcon column="joinedAt" />
                </button>
              </TableHead>
              <TableHead className="text-right">Role</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMembers.length > 0 ? (
              sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar} alt={member.ensName || member.address} />
                        <AvatarFallback>
                          {(member.ensName || member.address).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.ensName || formatAddress(member.address)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.ensName && formatAddress(member.address)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">
                      {member.votingPower.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.votingPowerPercentage.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {member.proposals}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.votes}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(member.joinedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={getRoleBadge(member.role)}>
                      {getRoleLabel(member.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 py-8">
                    <Users className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No members found
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Members
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing {sortedMembers.length} of {members.length} members</div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
