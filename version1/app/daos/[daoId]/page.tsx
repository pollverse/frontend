import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "./components/overview-tab"
import { ProposalsTab } from "./components/proposals-tab"
import { TreasuryTab } from "./components/treasury-tab"
import { MembersTab } from "./components/members-tab"
import { TokenTab } from "./components/token-tab"
import { SettingsTab } from "./components/settings-tab"
import { DaoHeader } from "./components/daoHeader"
import Header from "@/components/Header"
import { DAO, Proposal } from "@/lib/types/dao"
import { getDAOById } from "@/lib/daoData"
import { getProposalsByDAO } from "@/lib/proposalData"
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    daoId: string
  }
}

const DAODashboardPage = async ({ params }: PageProps) => {
  const { daoId } = params
  const dao = await getDAOById(daoId)
  const proposals = await getProposalsByDAO(daoId)
  
  if (!dao) {
    notFound()
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <DaoHeader dao={dao} />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
              <TabsTrigger value="treasury">Treasury</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="token">Token</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <OverviewTab dao={dao} proposals={proposals} />
          </TabsContent>
          
          <TabsContent value="proposals" className="space-y-4">
            <ProposalsTab daoId={dao.id} />
          </TabsContent>
          
          <TabsContent value="treasury" className="space-y-4">
            <TreasuryTab daoId={dao.id} />
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4">
            <MembersTab daoId={dao.id} />
          </TabsContent>
          
          <TabsContent value="token" className="space-y-4">
            <TokenTab daoId={dao.id} />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <SettingsTab daoId={dao.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default DAODashboardPage
