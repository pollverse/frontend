import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/icons'

interface DaoHeaderProps {
  name: string
  description: string
  members: number
  proposals: number
  logo?: string
}

export function DaoHeader({ 
  name, 
  description, 
  members, 
  proposals,
  logo 
}: DaoHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end pb-6 border-b">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-background">
          {logo ? (
            <img src={logo} alt={`${name} logo`} />
          ) : (
            <AvatarFallback className="text-2xl bg-muted">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <Badge className="absolute -bottom-2 -right-2">DAO</Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Icons.link className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Icons.star className="mr-2 h-4 w-4" />
              Follow
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground max-w-2xl">{description}</p>
        
        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icons.users className="h-4 w-4" />
            <span>{members.toLocaleString()} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.fileText className="h-4 w-4" />
            <span>{proposals} proposals</span>
          </div>
        </div>
      </div>
    </div>
  )
}
