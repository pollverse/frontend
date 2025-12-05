'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Activity, DollarSign, FileText, UserPlus, Users, Vote, Wallet, Zap } from "lucide-react"
import { DAO, Proposal, ProposalStatus } from "@/lib/types/dao"
import { formatDistanceToNow } from "date-fns"

type Activity = {
  id: string
  type: 'proposal' | 'vote' | 'transfer' | 'member'
  title: string
  description: string
  timestamp: string
  user: {
    address: string
    ensName?: string
    avatar?: string
  }
}

interface OverviewTabProps {
  dao: DAO;
  proposals: Proposal[];
}

export function OverviewTab({ dao, proposals }: OverviewTabProps) {
  // Get active proposals
  const activeProposals = proposals.filter(p => p.status === 'active');
  
  // Get recent proposals (sorted by creation date, newest first)
  const recentProposals = [...proposals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Mock activities (replace with real data when available)
  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'proposal',
      title: 'New proposal created',
      description: 'Proposal #42: Increase grant funding for Q4',
      timestamp: new Date().toISOString(),
      user: {
        address: '0x742d35Ce1339C8B7D2e8aE9B4eD4d1b1D4A5F4798',
        ensName: 'alice.eth',
        avatar: '/avatars/alice.png'
      }
    },
    // Add more mock activities as needed
  ];

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get status badge
  const getStatusBadge = (status: ProposalStatus) => {
    const statusConfig = {
      active: { bg: 'bg-blue-100', text: 'text-blue-800' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      succeeded: { bg: 'bg-green-100', text: 'text-green-800' },
      executed: { bg: 'bg-purple-100', text: 'text-purple-800' },
      defeated: { bg: 'bg-red-100', text: 'text-red-800' },
      canceled: { bg: 'bg-gray-100', text: 'text-gray-800' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'proposal':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'vote':
        return <Vote className="h-4 w-4 text-green-500" />;
      case 'transfer':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      case 'member':
        return <UserPlus className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dao.members)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProposals.length}</div>
            <p className="text-xs text-muted-foreground">{dao.activeProposals} total active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dao.proposals}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treasury</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatNumber(1000000)}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Proposals</CardTitle>
          <CardDescription>Latest proposals in this DAO</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Votes For</TableHead>
                <TableHead>Votes Against</TableHead>
                <TableHead>Ends In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">{proposal.title}</TableCell>
                  <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                  <TableCell>{formatNumber(proposal.forVotes)}</TableCell>
                  <TableCell>{formatNumber(proposal.againstVotes)}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(proposal.endBlock), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest activities in this DAO</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
