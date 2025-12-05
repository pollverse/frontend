export type DAO = {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: 'defi' | 'nft' | 'gaming' | 'social' | 'governance' | 'other';
  members: number;
  proposals: number;
  activeProposals: number;
  status: 'active' | 'new' | 'trending';
  tags: string[];
  website?: string;
  twitter?: string;
  discord?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type ProposalStatus = 'pending' | 'active' | 'succeeded' | 'executed' | 'defeated' | 'canceled';

export type Proposal = {
  id: string;
  daoId: string;
  title: string;
  description: string;
  status: ProposalStatus;
  startBlock: number;
  endBlock: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  proposer: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  quorum: number;
};

export enum TokenType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721'
}
