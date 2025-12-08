'use client'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Check, Plus, Share2, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { CreateProposalModal } from "@/components/proposal/create-proposal-modal"
import { useState } from "react"
import { DAO } from "@/lib/types/dao"

interface DaoHeaderProps {
  dao: DAO
}

export function DaoHeader({ dao }: DaoHeaderProps) {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const id = dao.id
  const name = dao.name
  const description = dao.description

  console.log("details:", dao)

  return (
    <header className="border-b">
      <div className="">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600" />
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="absolute top-16 left-4 text-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 mb-8">
          <div className="flex items-end space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src="/placeholder-avatar.png" alt={name} />
                <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-2 border-background">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="pb-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-muted-foreground max-w-2xl">{description}</p>
            </div>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>

            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Proposal
            </Button>

            <CreateProposalModal 
              isOpen={isCreateModalOpen} 
              onClose={() => setIsCreateModalOpen(false)}
              daoId={id}
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <div className="text-muted-foreground">Treasury</div>
              <div className="font-medium">$1,245,890.00</div>
            </div>
            <div>
              <div className="text-muted-foreground">Members</div>
              <div className="font-medium">1,245</div>
            </div>
            <div>
              <div className="text-muted-foreground">Proposals</div>
              <div className="font-medium">89</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Star className="mr-2 h-4 w-4" />
              Follow
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
