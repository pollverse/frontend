'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ArrowDown, ArrowRightLeft, ArrowUp, CheckCircle, Circle, CircleDollarSign, Coins, Copy, DollarSign, Download, ExternalLink, Filter, Gift, MinusCircle, Plus, PlusCircle, Send, Users, Wallet } from "lucide-react"

type TokenHolder = {
  address: string
  ensName?: string
  balance: number
  percentage: number
  isCurrentUser?: boolean
}

type TokenTransaction = {
  hash: string
  type: 'mint' | 'burn' | 'transfer'
  from: string
  to: string
  amount: number
  timestamp: string
}

interface TokenTabProps {
  daoId: string;
}

export function TokenTab({ }: TokenTabProps) {
  
  const [activeTab, setActiveTab] = useState('overview')
  
  // TODO: Fetch token data from contract or API
  const tokenData = {
    name: 'Nexa Governance Token',
    symbol: 'NEXA',
    totalSupply: 10000000,
    circulatingSupply: 7500000,
    holders: 1245,
    price: 2.45,
    marketCap: 18375000,
    totalStaked: 4500000,
    stakingApr: 12.5,
    distribution: [
      { label: 'Treasury', value: 40 },
      { label: 'Team & Advisors', value: 20, locked: true, vesting: '4 years' },
      { label: 'Community', value: 25 },
      { label: 'Staking Rewards', value: 10 },
      { label: 'Liquidity', value: 5 },
    ]
  }

  const tokenHolders: TokenHolder[] = [
    { 
      address: '0x742d35Ce1339C8B7D2e8aE9B4eD4d1b1D4A5F4798',
      ensName: 'daotreasury.eth',
      balance: 4000000,
      percentage: 40,
      isCurrentUser: false
    },
    { 
      address: '0x1234567890123456789012345678901234567890',
      balance: 2000000,
      percentage: 20,
      isCurrentUser: true
    },
    { 
      address: '0x0987654321098765432109876543210987654321',
      ensName: 'investor.eth',
      balance: 1000000,
      percentage: 10,
      isCurrentUser: false
    },
    { 
      address: '0x13579bdf02468acf159d0987654bafe642b4df3e',
      balance: 500000,
      percentage: 5,
      isCurrentUser: false
    },
  ]

  const transactions: TokenTransaction[] = [
    {
      hash: '0xabc123...def456',
      type: 'transfer',
      from: '0x742d35Ce1339C8B7D2e8aE9B4eD4d1b1D4A5F4798',
      to: '0x1234567890123456789012345678901234567890',
      amount: 1000,
      timestamp: '2025-10-21T14:32:00Z'
    },
    {
      hash: '0xdef456...abc123',
      type: 'mint',
      from: '0x0000000000000000000000000000000000000000',
      to: '0x742d35Ce1339C8B7D2e8aE9B4eD4d1b1D4A5F4798',
      amount: 50000,
      timestamp: '2025-10-20T09:15:00Z'
    },
    {
      hash: '0x123456...789abc',
      type: 'burn',
      from: '0x13579bdf02468acf159d0987654bafe642b4df3e',
      to: '0x0000000000000000000000000000000000000000',
      amount: 100,
      timestamp: '2025-10-19T16:45:00Z'
    },
  ]

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <PlusCircle className="h-4 w-4 text-green-500" />
      case 'burn':
        return <MinusCircle className="h-4 w-4 text-red-500" />
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(tokenData.totalSupply)} {tokenData.symbol}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(tokenData.totalSupply * tokenData.price)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Circulating Supply</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(tokenData.circulatingSupply)} {tokenData.symbol}</div>
            <p className="text-xs text-muted-foreground">
              {((tokenData.circulatingSupply / tokenData.totalSupply) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(tokenData.price)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              +2.5% (24h)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(tokenData.holders)}</div>
            <p className="text-xs text-muted-foreground">
              {tokenData.totalStaked.toLocaleString()} {tokenData.symbol} staked
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="stake">Staking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Distribution</CardTitle>
                <CardDescription>
                  Allocation of {tokenData.symbol} tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenData.distribution.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <span>{item.label}</span>
                          {item.locked && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              Locked
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                      {item.vesting && (
                        <p className="text-xs text-muted-foreground">
                          Vesting: {item.vesting}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Information</CardTitle>
                <CardDescription>
                  Details about {tokenData.symbol} token
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contract</span>
                    <div className="flex items-center">
                      <span className="text-sm font-mono">0x7a25...9b3f</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Decimals</span>
                    <span className="text-sm font-medium">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Market Cap</span>
                    <span className="text-sm font-medium">{formatCurrency(tokenData.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fully Diluted Valuation</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(tokenData.totalSupply * tokenData.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Staking APR</span>
                    <span className="text-sm font-medium text-green-500">
                      {tokenData.stakingApr}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button className="w-full">
                    <Wallet className="mr-2 h-4 w-4" />
                    Add {tokenData.symbol} to Wallet
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Etherscan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Holders</CardTitle>
                  <CardDescription>
                    Accounts with the largest {tokenData.symbol} balances
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokenHolders.map((holder) => (
                    <TableRow key={holder.address} className={holder.isCurrentUser ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <div className="flex items-center">
                          {holder.isCurrentUser && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                          )}
                          <span className="font-mono">
                            {holder.ensName || formatAddress(holder.address)}
                          </span>
                          {holder.isCurrentUser && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(holder.balance)} {tokenData.symbol}
                      </TableCell>
                      <TableCell className="text-right">
                        {holder.percentage.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-center">
                <Button variant="ghost">
                  Load More
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Token Transfers</CardTitle>
                  <CardDescription>
                    Recent {tokenData.symbol} token transfers
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.hash}>
                      <TableCell className="font-mono text-sm">
                        {tx.hash}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTransactionTypeIcon(tx.type)}
                          <span className="ml-2 capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {tx.from === '0x0000000000000000000000000000000000000000' ? 'Mint' : formatAddress(tx.from)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {tx.to === '0x0000000000000000000000000000000000000000' ? 'Burn' : formatAddress(tx.to)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(tx.amount)} {tokenData.symbol}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-center">
                <Button variant="ghost">
                  View All Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stake {tokenData.symbol}</CardTitle>
              <CardDescription>
                Stake your {tokenData.symbol} tokens to earn rewards and participate in governance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Your Stake</h3>
                      <span className="text-sm text-muted-foreground">
                        Available: 1,250 {tokenData.symbol}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Staked</span>
                        <span className="font-medium">
                          {formatNumber(750)} {tokenData.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rewards</span>
                        <span className="font-medium text-green-500">
                          +{formatNumber(125.5)} {tokenData.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>{formatNumber(875.5)} {tokenData.symbol}</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Stake {tokenData.symbol}
                      </Button>
                      <Button variant="outline" className="w-full">
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Unstake {tokenData.symbol}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-4">Staking Rewards</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current APR</span>
                          <span className="font-medium text-green-500">
                            {tokenData.stakingApr}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Staked</span>
                          <span className="font-medium">
                            {formatNumber(tokenData.totalStaked)} {tokenData.symbol}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your Share</span>
                          <span className="font-medium">
                            {((750 / tokenData.totalStaked) * 100).toFixed(4)}%
                          </span>
                        </div>
                        <Progress value={(750 / tokenData.totalStaked) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-4">Staking History</h3>
                    <div className="space-y-4">
                      {[
                        { 
                          type: 'stake', 
                          amount: 500, 
                          date: '2025-10-15T14:30:00Z',
                          status: 'completed'
                        },
                        { 
                          type: 'reward', 
                          amount: 25.5, 
                          date: '2025-10-14T08:15:00Z',
                          status: 'completed'
                        },
                        { 
                          type: 'stake', 
                          amount: 250, 
                          date: '2025-10-10T16:45:00Z',
                          status: 'completed'
                        },
                      ].map((tx, index) => (
                        <div key={index} className="flex items-center justify-between pb-2 border-b last:border-0 last:pb-0">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              tx.type === 'stake' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {tx.type === 'stake' ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <Gift className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {tx.type === 'stake' ? 'Staked' : 'Reward'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(tx.date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              tx.type === 'reward' ? 'text-green-500' : ''
                            }`}>
                              {tx.type === 'reward' ? '+' : ''}{formatNumber(tx.amount)} {tokenData.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4">
                      View All Transactions
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h3 className="font-medium mb-2">About Staking</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Staking {tokenData.symbol} tokens allows you to earn passive income through staking rewards and participate in governance decisions.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Earn {tokenData.stakingApr}% APR in staking rewards</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Participate in governance proposals and voting</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Unstake at any time (7-day cooldown period applies)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
