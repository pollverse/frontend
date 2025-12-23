// version1/types/dao.ts
export interface DAO {
    id: string;
    name: string;
    description: string;
    category: string;
    tags?: string[];
    status: 'trending' | 'new' | 'active';
    members: number;
    logo?: string;
    address: string;
  }
  
  export interface Proposal {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'queued' | 'executed';
    forVotes: number;
    againstVotes: number;
    startBlock: number;
    endBlock: number;
  }