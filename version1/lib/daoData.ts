import { DAO } from './types/dao';

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Base current date for relative timestamps
const now = new Date();
const oneYearAgo = new Date(now);
oneYearAgo.setFullYear(now.getFullYear() - 1);

// Categories for DAOs
const categories: Array<DAO['category']> = ['defi', 'nft', 'gaming', 'social', 'governance', 'other'];

// Statuses for DAOs
const statuses: Array<DAO['status']> = ['active', 'new', 'trending'];

// Common tags for DAOs
const commonTags = [
  'defi', 'nft', 'gaming', 'social', 'governance', 'dao', 'web3', 'crypto', 'blockchain',
  'lending', 'borrowing', 'yield', 'art', 'collectibles', 'metaverse', 'gaming', 'virtual-world',
  'community', 'social-impact', 'infrastructure', 'scaling', 'privacy', 'identity', 'oracles',
  'derivatives', 'options', 'insurance', 'prediction-markets', 'dex', 'amm', 'stablecoins', 'staking'
];

// Generate random tags
const getRandomTags = (count: number = 3): string[] => {
  const shuffled = [...commonTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate random member count
const getRandomMembers = () => Math.floor(Math.random() * 100000) + 1000;

// Generate random proposal counts
const getRandomProposals = () => Math.floor(Math.random() * 200) + 10;
const getRandomActiveProposals = () => Math.floor(Math.random() * 5) + 1;

// Generate DAO data
export const dummyDAOs: DAO[] = Array.from({ length: 20 }, (_, i) => {
  const id = (i + 1).toString();
  const category = categories[Math.floor(Math.random() * categories.length)];
  const tags = getRandomTags(3);
  const createdAt = randomDate(oneYearAgo, now);
  const updatedAt = randomDate(new Date(createdAt), now);
  const name = `DAO ${id}`;
  
  return {
    id,
    name,
    description: `A decentralized autonomous organization focused on ${category} and blockchain technology.`,
    logo: `/logos/dao-${id}.png`,
    category,
    members: getRandomMembers(),
    proposals: getRandomProposals(),
    activeProposals: getRandomActiveProposals(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    tags,
    website: `https://${name.toLowerCase().replace(/\s+/g, '')}.xyz`,
    twitter: name.toLowerCase().replace(/\s+/g, ''),
    discord: name.toLowerCase().replace(/\s+/g, ''),
    createdAt,
    updatedAt,
  };
});

// Update specific DAOs with more realistic names and details
dummyDAOs[0] = {
  ...dummyDAOs[0],
  name: 'Nexa Finance',
  description: 'Decentralized lending and borrowing protocol with isolated markets and risk management.',
  category: 'defi',
  tags: ['lending', 'borrowing', 'yield', 'defi'],
  website: 'https://nexafinance.xyz',
  twitter: 'nexafinance',
  discord: 'nexafinance',
};

dummyDAOs[1] = {
  ...dummyDAOs[1],
  name: 'PixelPunks',
  description: 'Community-owned NFT project pushing the boundaries of digital art and ownership.',
  category: 'nft',
  tags: ['art', 'collectibles', 'pfp', 'nft'],
  website: 'https://pixelpunks.io',
  twitter: 'pixelpunks',
  discord: 'pixelpunks',
};

dummyDAOs[2] = {
  ...dummyDAOs[2],
  name: 'MetaLands',
  description: 'Play-to-earn metaverse where players own and monetize virtual real estate.',
  category: 'gaming',
  tags: ['gaming', 'metaverse', 'virtual-world'],
  website: 'https://metalands.game',
  twitter: 'metalands',
  discord: 'metalands',
};

dummyDAOs[3] = {
  ...dummyDAOs[3],
  name: 'SocialChain',
  description: 'Decentralized social network where users control their data and earn from content creation.',
  category: 'social',
  tags: ['social', 'content', 'creator-economy'],
  website: 'https://socialchain.xyz',
  twitter: 'socialchain',
  discord: 'socialchain',
};

dummyDAOs[4] = {
  ...dummyDAOs[4],
  name: 'GovernanceHub',
  description: 'Protocol for creating and managing DAOs with customizable governance parameters.',
  category: 'governance',
  tags: ['governance', 'infrastructure', 'tooling'],
  website: 'https://govhub.org',
  twitter: 'govhub',
  discord: 'govhub',
};

dummyDAOs[5] = {
  ...dummyDAOs[5],
  name: 'DeFi Alliance',
  description: 'Coalition of DeFi protocols working together to improve interoperability and security.',
  category: 'defi',
  tags: ['defi', 'alliance', 'interoperability'],
  website: 'https://defialliance.xyz',
  twitter: 'defialliance',
  discord: 'defialliance',
};

dummyDAOs[6] = {
  ...dummyDAOs[6],
  name: 'CryptoKitties',
  description: 'Blockchain-based virtual pets that can be collected, bred, and traded.',
  category: 'nft',
  tags: ['nft', 'collectibles', 'gaming'],
  website: 'https://cryptokitties.co',
  twitter: 'cryptokitties',
  discord: 'cryptokitties',
};

dummyDAOs[7] = {
  ...dummyDAOs[7],
  name: 'The Sandbox',
  description: 'Decentralized, community-driven platform for creating, selling, and owning digital assets.',
  category: 'gaming',
  tags: ['gaming', 'metaverse', 'virtual-world'],
  website: 'https://sandbox.game',
  twitter: 'thesandboxgame',
  discord: 'thesandboxgame',
};

dummyDAOs[8] = {
  ...dummyDAOs[8],
  name: 'Compound',
  description: 'Decentralized lending protocol that allows users to lend and borrow cryptocurrencies.',
  category: 'defi',
  tags: ['lending', 'borrowing', 'yield'],
  website: 'https://compound.finance',
  twitter: 'compoundfinance',
  discord: 'compoundfinance',
};

dummyDAOs[9] = {
  ...dummyDAOs[9],
  name: 'Aave',
  description: 'Decentralized lending protocol that allows users to lend and borrow cryptocurrencies.',
  category: 'defi',
  tags: ['lending', 'borrowing', 'yield'],
  website: 'https://aave.com',
  twitter: 'aaveaave',
  discord: 'aaveaave',
};

dummyDAOs[10] = {
  ...dummyDAOs[10],
  name: 'MakerDAO',
  description: 'Decentralized lending protocol that allows users to lend and borrow cryptocurrencies.',
  category: 'defi',
  tags: ['lending', 'borrowing', 'yield'],
  website: 'https://makerdao.com',
  twitter: 'makerdao',
  discord: 'makerdao',
};

dummyDAOs[11] = {
  ...dummyDAOs[11],
  name: 'Uniswap',
  description: 'Decentralized exchange protocol that allows users to trade cryptocurrencies.',
  category: 'defi',
  tags: ['dex', 'amm', 'trading'],
  website: 'https://uniswap.org',
  twitter: 'uniswap',
  discord: 'uniswap',
};

dummyDAOs[12] = {
  ...dummyDAOs[12],
  name: 'SushiSwap',
  description: 'Decentralized exchange protocol that allows users to trade cryptocurrencies.',
  category: 'defi',
  tags: ['dex', 'amm', 'trading'],
  website: 'https://sushiswap.fi',
  twitter: 'sushiswap',
  discord: 'sushiswap',
};

dummyDAOs[13] = {
  ...dummyDAOs[13],
  name: 'Curve',
  description: 'Decentralized exchange protocol that allows users to trade cryptocurrencies.',
  category: 'defi',
  tags: ['dex', 'amm', 'trading'],
  website: 'https://curve.fi',
  twitter: 'curvefinance',
  discord: 'curvefinance',
};

dummyDAOs[14] = {
  ...dummyDAOs[14],
  name: 'Yearn.finance',
  description: 'Decentralized yield aggregator that allows users to earn interest on their cryptocurrencies.',
  category: 'defi',
  tags: ['yield', 'aggregator', 'defi'],
  website: 'https://yearn.finance',
  twitter: 'iearnfinance',
  discord: 'iearnfinance',
};

dummyDAOs[15] = {
  ...dummyDAOs[15],
  name: 'Harvest.finance',
  description: 'Decentralized yield aggregator that allows users to earn interest on their cryptocurrencies.',
  category: 'defi',
  tags: ['yield', 'aggregator', 'defi'],
  website: 'https://harvest.finance',
  twitter: 'harvest_finance',
  discord: 'harvest_finance',
};

dummyDAOs[16] = {
  ...dummyDAOs[16],
  name: 'BadgerDAO',
  description: 'Decentralized autonomous organization that focuses on building and maintaining a decentralized finance ecosystem.',
  category: 'governance',
  tags: ['governance', 'dao', 'defi'],
  website: 'https://badgerdao.com',
  twitter: 'badgerdao',
  discord: 'badgerdao',
};

dummyDAOs[17] = {
  ...dummyDAOs[17],
  name: 'Index Coop',
  description: 'Decentralized autonomous organization that focuses on building and maintaining a decentralized finance ecosystem.',
  category: 'governance',
  tags: ['governance', 'dao', 'defi'],
  website: 'https://indexcoop.com',
  twitter: 'indexcoop',
  discord: 'indexcoop',
};

dummyDAOs[18] = {
  ...dummyDAOs[18],
  name: 'Fei Protocol',
  description: 'Decentralized stablecoin protocol that allows users to mint and redeem stablecoins.',
  category: 'defi',
  tags: ['stablecoin', 'defi', 'protocol'],
  website: 'https://fei.money',
  twitter: 'feiprotocol',
  discord: 'feiprotocol',
};

dummyDAOs[19] = {
  ...dummyDAOs[19],
  name: 'Rari Capital',
  description: 'Decentralized lending protocol that allows users to lend and borrow cryptocurrencies.',
  category: 'defi',
  tags: ['lending', 'borrowing', 'yield'],
  website: 'https://rari.capital',
  twitter: 'raricapital',
  discord: 'raricapital',
};

export const getDAOById = (id: string): DAO | undefined => {
  return dummyDAOs.find(dao => dao.id === id);
};

export const getDAOsByCategory = (category: string): DAO[] => {
  if (category === 'all') return dummyDAOs;
  return dummyDAOs.filter(dao => dao.category === category);
};

export const searchDAOs = (query: string): DAO[] => {
  if (!query.trim()) return dummyDAOs;
  
  const lowerQuery = query.toLowerCase();
  return dummyDAOs.filter(
    dao =>
      dao.name.toLowerCase().includes(lowerQuery) ||
      dao.description.toLowerCase().includes(lowerQuery) ||
      dao.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const filterDAOs = (filters: {
  category?: string;
  status?: string[];
  searchQuery?: string;
}): DAO[] => {
  let result = [...dummyDAOs];

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    result = result.filter(dao => dao.category === filters.category);
  }

  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    result = result.filter(dao => filters.status?.includes(dao.status));
  }

  // Apply search query filter
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      dao =>
        dao.name.toLowerCase().includes(query) ||
        dao.description.toLowerCase().includes(query) ||
        (dao.tags && dao.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  return result;
};