'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowUp, ExternalLink, LoaderCircle, Trash2, Upload, UserPlus } from "lucide-react"
import { siGithub, siX, siDiscord } from 'simple-icons'

type SettingSectionProps = {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

const SettingSection = ({ title, description, children, className = "" }: SettingSectionProps) => (
  <div className={`space-y-6 ${className}`}>
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
)

interface SettingsTabProps {
  daoId: string;
}

export function SettingsTab({ }: SettingsTabProps) {
  
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "Nexa DAO",
    description: "A decentralized autonomous organization focused on building the future of web3 governance.",
    website: "https://nexadao.xyz",
    logo: "/logos/nexa-logo.png",
    socials: {
      twitter: "nexadao",
      discord: "nexadao",
      github: "nexadao"
    },
    votingDelay: 1, // in blocks
    votingPeriod: 5, // in days
    quorum: 4, // percentage
    approvalThreshold: 50.1, // percentage
    minVotingPower: 100, // minimum tokens required to create a proposal
    isTransferable: true,
    isPausable: true,
    isUpgradable: true
  })

  interface IconProps {
    path: string;
    title?: string;
  }

  interface SimpleIconProps {
    icon: IconProps;
    size?: number | string;
    className?: string;
  }

  const SimpleIcon: React.FC<SimpleIconProps> = ({ 
    icon, 
    size = 24, 
  }) => {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={icon.path} />
      </svg>
    );
  };

  // TODO: Fetch DAO settings from contract or API
  const daoAdmins = [
    { address: "0x742d35Ce1339C8B7D2e8aE9B4eD4d1b1D4A5F4798", role: "Owner" },
    { address: "0x1234567890123456789012345678901234567890", role: "Admin" },
    { address: "0x0987654321098765432109876543210987654321", role: "Admin" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(prev[parent as keyof typeof prev] as Record<string, any> || {}),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement save to contract or API
      console.log('Saving changes:', formData)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Show success message
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradeContract = () => {
    // TODO: Implement contract upgrade flow
    console.log('Initiating contract upgrade...')
  }

  const handleTransferOwnership = () => {
    // TODO: Implement ownership transfer flow
    console.log('Initiating ownership transfer...')
  }

  const handleDeleteDAO = () => {
    // TODO: Implement DAO deletion flow
    if (confirm('Are you sure you want to delete this DAO? This action cannot be undone.')) {
      console.log('Deleting DAO...')
      // Redirect to DAO list after deletion
      router.push('/daos')
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="governance">Governance</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>DAO Information</CardTitle>
            <CardDescription>
              Update your DAO&apos;s basic information and social links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSection
              title="DAO Details"
              description="Basic information about your DAO"
            >
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <Label htmlFor="logo">Logo</Label>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.logo} alt="DAO Logo" />
                    <AvatarFallback>DAO</AvatarFallback>
                  </Avatar>
                </div>
                <Button variant="outline" size="sm" className="mt-6">
                  <Upload className="mr-2 h-4 w-4" />
                  Change Logo
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">DAO Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter DAO name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your DAO"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
            </SettingSection>

            <Separator />

            <SettingSection
              title="Social Links"
              description="Connect your DAO's social media accounts"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <SimpleIcon icon={siX} className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <Input
                      name="socials.twitter"
                      value={formData.socials.twitter}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="max-w-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <SimpleIcon icon={siDiscord} className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1">
                    <Input
                      name="socials.discord"
                      value={formData.socials.discord}
                      onChange={handleInputChange}
                      placeholder="server-id"
                      className="max-w-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <SimpleIcon icon={siGithub} className="w-5 h-5" />
                  <div className="flex-1">
                    <Input
                      name="socials.github"
                      value={formData.socials.github}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>
            </SettingSection>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="governance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Governance Settings</CardTitle>
            <CardDescription>
              Configure how your DAO handles proposals and voting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSection
              title="Voting Parameters"
              description="Set the rules for creating and passing proposals"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="votingDelay">Voting Delay (blocks)</Label>
                  <Input
                    id="votingDelay"
                    name="votingDelay"
                    type="number"
                    min="0"
                    value={formData.votingDelay}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Delay (in blocks) since proposal is created until voting starts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="votingPeriod">Voting Period (days)</Label>
                  <Input
                    id="votingPeriod"
                    name="votingPeriod"
                    type="number"
                    min="1"
                    value={formData.votingPeriod}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Duration (in days) that the vote will be active for
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quorum">Quorum (%)</Label>
                  <Input
                    id="quorum"
                    name="quorum"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quorum}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum percentage of total supply needed to vote for a proposal to pass
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvalThreshold">Approval Threshold (%)</Label>
                  <Input
                    id="approvalThreshold"
                    name="approvalThreshold"
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    value={formData.approvalThreshold}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of votes in favor required for a proposal to pass
                  </p>
                </div>
              </div>
            </SettingSection>

            <Separator />

            <SettingSection
              title="Proposal Settings"
              description="Configure who can create proposals and under what conditions"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minVotingPower">Minimum Voting Power to Propose</Label>
                  <Input
                    id="minVotingPower"
                    name="minVotingPower"
                    type="number"
                    min="0"
                    value={formData.minVotingPower}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum number of tokens required to create a proposal
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isTransferable" className="text-base">
                      Allow Token Transfers
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable the ability to transfer tokens between wallets
                    </p>
                  </div>
                  <Switch
                    id="isTransferable"
                    checked={formData.isTransferable}
                    onCheckedChange={(checked) => handleSwitchChange('isTransferable', checked)}
                  />
                </div>
              </div>
            </SettingSection>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Update Governance Settings
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>
              Manage administrator roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSection
              title="DAO Administrators"
              description="Manage who has administrative privileges in your DAO"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="0x... or ENS name"
                    className="max-w-md"
                  />
                  <Button>Add Admin</Button>
                </div>

                <div className="border rounded-lg divide-y">
                  {daoAdmins.map((admin, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${admin.address}.png`} />
                          <AvatarFallback>DAO</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {admin.address.slice(0, 8)}...{admin.address.slice(-6)}
                          </p>
                          <Badge variant={admin.role === 'Owner' ? 'default' : 'secondary'} className="text-xs">
                            {admin.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {admin.role !== 'Owner' && (
                          <Button variant="outline" size="sm">
                            Revoke
                          </Button>
                        )}
                        {admin.role === 'Owner' && (
                          <Button variant="outline" size="sm" onClick={handleTransferOwnership}>
                            Transfer Ownership
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SettingSection>

            <Separator />

            <SettingSection
              title="Role Permissions"
              description="Configure what each role can do in your DAO"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Create Proposals</p>
                    <p className="text-sm text-muted-foreground">
                      Who can create new proposals
                    </p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    Token Holders
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Execute Proposals</p>
                    <p className="text-sm text-muted-foreground">
                      Who can execute passed proposals
                    </p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    Anyone
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Update Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Who can update DAO settings
                    </p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    Admins Only
                  </Badge>
                </div>
              </div>
            </SettingSection>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Manage smart contract and other advanced configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSection
              title="Smart Contract"
              description="Manage your DAO's smart contract"
            >
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Contract Address</p>
                      <p className="text-sm text-muted-foreground">
                        0x7a25...9b3f
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Etherscan
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Contract Version</p>
                      <p className="text-sm text-muted-foreground">
                        v2.1.0
                      </p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                      Latest
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Upgrade Available</p>
                      <p className="text-sm text-muted-foreground">
                        v2.2.0 includes security patches and gas optimizations
                      </p>
                    </div>
                    <Button onClick={handleUpgradeContract} variant="default">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            </SettingSection>

            <Separator />

            <SettingSection
              title="Danger Zone"
              description="Irreversible actions that affect your DAO"
              className="text-red-500"
            >
              <div className="space-y-4">
                <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Transfer Ownership</p>
                      <p className="text-sm text-red-500 dark:text-red-400">
                        Transfer ownership of this DAO to another address
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTransferOwnership}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Transfer
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Delete DAO</p>
                      <p className="text-sm text-red-500 dark:text-red-400">
                        Permanently delete this DAO and all its data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteDAO}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete DAO
                    </Button>
                  </div>
                </div>
              </div>
            </SettingSection>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
