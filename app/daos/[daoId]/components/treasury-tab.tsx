'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, BarChart2, Download, Filter, MoreHorizontal, Plus, Receipt, RefreshCw, Send, TrendingUp, Upload, Wallet } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Asset = {
  id: string
  name: string
  symbol: string
  amount: number
  value: number
  change24h: number
  icon: string
}

type Transaction = {
  id: string
  type: 'incoming' | 'outgoing' | 'swap'
  amount: number
  symbol: string
  from: string
  to: string
  timestamp: string
  txHash: string
  status: 'completed' | 'pending' | 'failed'
} 

interface TreasuryTabProps {
  daoId: string;
}

export function TreasuryTab({ }: TreasuryTabProps) {
  
  const [activeTab, setActiveTab] = useState('assets')
  
  // TODO: Fetch assets and transactions from contract or API
  const assets: Asset[] = [
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: 450.25,
      value: 1125625.00,
      change24h: 2.5,
      icon: '/tokens/eth.png'
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      amount: 120265.00,
      value: 120265.00,
      change24h: 0.0,
      icon: '/tokens/usdc.png'
    },
    {
      id: 'nexa',
      name: 'Nexa Token',
      symbol: 'NEXA',
      amount: 5000000.00,
      value: 50000.00,
      change24h: 5.2,
      icon: '/tokens/nexa.png'
    },
  ]

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'incoming',
      amount: 100,
      symbol: 'ETH',
      from: '0x1234...5678',
      to: 'Treasury',
      timestamp: '2025-10-21T14:32:00Z',
      txHash: '0xabc...def',
      status: 'completed'
    },
    {
      id: '2',
      type: 'outgoing',
      amount: 50000,
      symbol: 'USDC',
      from: 'Treasury',
      to: '0x5678...1234',
      timestamp: '2025-10-20T09:15:00Z',
      txHash: '0xdef...abc',
      status: 'completed'
    },
    {
      id: '3',
      type: 'swap',
      amount: 10,
      symbol: 'ETH',
      from: 'Treasury',
      to: 'Treasury',
      timestamp: '2025-10-19T16:45:00Z',
      txHash: '0x123...456',
      status: 'completed'
    },
  ]

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatCrypto = (value: number, decimals = 4) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Across {assets.length} assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+1.8%</div>
            <p className="text-xs text-muted-foreground">+$21,240.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30d Volume</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.2M</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">+24 this week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Receive
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assets</CardTitle>
                  <CardDescription>Overview of all assets in the treasury</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">24h</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Image 
                              src={asset.icon} 
                              alt={asset.name} 
                              width={32}
                              height={32}
                              className="h-6 w-6"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.onerror = null
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCrypto(asset.amount)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(asset.value / asset.amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(asset.value)}
                      </TableCell>
                      <TableCell className={`text-right ${
                        asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Recent transactions from the treasury</CardDescription>
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
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {tx.type === 'incoming' && (
                            <ArrowDown className="h-4 w-4 text-green-500" />
                          )}
                          {tx.type === 'outgoing' && (
                            <ArrowUp className="h-4 w-4 text-red-500" />
                          )}
                          {tx.type === 'swap' && (
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="max-w-[120px] truncate">{tx.txHash}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        {tx.from}
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        {tx.to}
                      </TableCell>
                      <TableCell className={`text-right ${
                        tx.type === 'incoming' ? 'text-green-500' : 'text-foreground'
                      }`}>
                        {tx.type === 'incoming' ? '+' : tx.type === 'outgoing' ? '-' : ''}
                        {formatCrypto(tx.amount)} {tx.symbol}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
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

        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Funds</CardTitle>
              <CardDescription>Send assets from the treasury</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asset</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center">
                            <Image 
                              src={asset.icon} 
                              alt={asset.name}
                              width={20}
                              height={20}
                              className="h-5 w-5 mr-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.onerror = null
                                target.style.display = 'none'
                              }}
                            />
                            {asset.name} ({asset.symbol})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Amount</label>
                    <span className="text-sm text-muted-foreground">
                      Available: 450.25 ETH
                    </span>
                  </div>
                  <div className="flex">
                    <input
                      type="number"
                      placeholder="0.0"
                      className="flex h-10 w-full rounded-l-md border border-r-0 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-r-md border border-input bg-background px-3 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground h-10">
                      MAX
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transaction Note (Optional)</label>
                  <textarea
                    placeholder="Add a note about this transfer"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="pt-2">
                  <Button className="w-full">
                    Review Transfer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
