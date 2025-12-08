import { Proposal } from "./types/dao";

// Helper functions for generating proposal data
const randomAddress = () => {
  const chars = "0123456789abcdef";
  return (
    "0x" +
    Array.from(
      { length: 40 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("")
  );
};

const randomDate = (start: Date, end: Date): string => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
};

const now = new Date();
const oneYearAgo = new Date(now);
oneYearAgo.setFullYear(now.getFullYear() - 1);

// Status distribution with more active/pending proposals
const getRandomStatus = (): Proposal["status"] => {
  const rand = Math.random();
  if (rand < 0.4) return "active";
  if (rand < 0.6) return "pending";
  if (rand < 0.8) return "succeeded";
  if (rand < 0.9) return "executed";
  if (rand < 0.95) return "defeated";
  return "canceled";
};

// Generate votes based on status
const generateVotes = (status: string) => {
  if (status === "pending")
    return { forVotes: 0, againstVotes: 0, abstainVotes: 0 };

  const forVotes = Math.floor(Math.random() * 10000000) + 1000000;
  let againstVotes, abstainVotes;

  if (status === "defeated") {
    againstVotes = forVotes * (1 + Math.random());
    abstainVotes = Math.floor(Math.random() * (forVotes * 0.5));
  } else if (status === "succeeded" || status === "executed") {
    againstVotes = Math.floor(Math.random() * (forVotes * 0.3));
    abstainVotes = Math.floor(Math.random() * (forVotes * 0.1));
  } else {
    // active
    againstVotes = Math.floor(Math.random() * (forVotes * 0.7));
    abstainVotes = Math.floor(Math.random() * (forVotes * 0.2));
  }

  return {
    forVotes: Math.floor(forVotes),
    againstVotes: Math.floor(againstVotes),
    abstainVotes: Math.floor(abstainVotes),
  };
};

// Generate blocks (current block ~15.7M as of Oct 2025)
const generateBlocks = (status: string) => {
  const currentBlock = 15700000;
  const blocksPerDay = 7200; // ~12s block time

  if (status === "pending") {
    const startBlock = currentBlock + Math.floor(Math.random() * 1000) + 100;
    return {
      startBlock,
      endBlock: startBlock + blocksPerDay * 7, // 1 week voting period
    };
  }

  if (status === "active") {
    const startBlock = currentBlock - Math.floor(Math.random() * 1000) - 1;
    return {
      startBlock,
      endBlock: startBlock + blocksPerDay * 7, // 1 week voting period
    };
  }

  // For past proposals
  const daysAgo = Math.floor(Math.random() * 90) + 1; // 1-90 days ago
  const endBlock = currentBlock - daysAgo * blocksPerDay;
  return {
    startBlock: endBlock - blocksPerDay * 7, // 1 week voting period
    endBlock,
  };
};

// Generate proposals for a DAO
const generateProposalsForDAO = (
  daoId: string,
  count: number = 4
): Proposal[] => {
  // const proposals: Proposal[] = [];
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  // Ensure at least one active proposal
  const statuses: Proposal["status"][] = ["active"];

  // Add other statuses
  for (let i = 1; i < count; i++) {
    statuses.push(getRandomStatus());
  }

  // Shuffle to ensure active isn't always first
  statuses.sort(() => Math.random() - 0.5);

  return statuses.map((status, index) => {
    const { startBlock, endBlock } = generateBlocks(status);
    const { forVotes, againstVotes, abstainVotes } = generateVotes(status);
    const createdAt = randomDate(oneYearAgo, now);

    // Generate proposal data based on DAO category
    const daoCategory =
      daoId === "1"
        ? "defi"
        : daoId === "2"
        ? "nft"
        : daoId === "3"
        ? "gaming"
        : daoId === "4"
        ? "social"
        : daoId === "5"
        ? "governance"
        : "other";

    const proposalData = generateProposalData(daoCategory, status);

    // Generate a quorum percentage based on the proposal type and status
    // Important proposals have higher quorum requirements
    const isImportant = Math.random() > 0.7; // 30% chance of being an important proposal
    let quorum: number;
    
    if (isImportant) {
      // Important proposals have higher quorum (40-60%)
      quorum = Math.floor(Math.random() * 21) + 40; // 40-60%
    } else {
      // Regular proposals have lower quorum (20-40%)
      quorum = Math.floor(Math.random() * 21) + 20; // 20-40%
    }

    return {
      id: `p${parseInt(daoId) * 10 + index + 1}`,
      daoId,
      status,
      startBlock,
      endBlock,
      forVotes,
      againstVotes,
      abstainVotes,
      quorum, // Add quorum to the proposal
      proposer: randomAddress(),
      createdAt,
      updatedAt: randomDate(new Date(createdAt), now),
      ...proposalData,
    };
  });
};

// Generate proposal title and description based on category and index
const generateProposalData = (category: string, status: string) => {
  const commonTitles = {
    treasury: [
      "Treasury Management Update",
      "Treasury Diversification Proposal",
      "Treasury Allocation Strategy",
    ],
    security: [
      "Security Audit Funding",
      "Bug Bounty Program Expansion",
      "Security Best Practices Update",
    ],
    governance: [
      "Governance Process Improvements",
      "Voting Mechanism Update",
      "Delegation Incentives Program",
    ],
    partnership: [
      "Strategic Partnership Announcement",
      "Cross-Protocol Collaboration",
      "Integration with External Protocol",
    ],
  };

  const categoryTitles: Record<string, string[]> = {
    defi: [
      "Update Interest Rate Model",
      "Add New Collateral Type",
      "Adjust Liquidation Parameters",
      "Update Oracle Configuration",
      "Modify Reserve Factor",
      "Whitelist New Market",
    ],
    nft: [
      "New Collection Launch",
      "Royalty Structure Update",
      "Marketplace Integration",
      "Rarity System Update",
      "Staking Mechanism",
      "Airdrop Distribution",
    ],
    gaming: [
      "New Game Mode",
      "In-Game Economy Update",
      "Land Sale Event",
      "Tournament Structure",
      "Item Balancing Changes",
      "Partnership Announcement",
    ],
    social: [
      "Content Moderation Policy",
      "Creator Monetization Update",
      "Platform Features Roadmap",
      "Community Guidelines Update",
      "Token Utility Expansion",
      "Governance Participation Rewards",
    ],
    governance: [
      "Governance Framework Update",
      "Treasury Management",
      "Delegation Program",
      "Governance Tokenomics",
      "Proposal Process Improvements",
      "Emergency Measures",
    ],
  };

  // Select a title
  let title: string;
  const commonTitleType =
    Math.random() > 0.7
      ? Object.keys(commonTitles)[Math.floor(Math.random() * 3)]
      : null;

  if (commonTitleType) {
    const titles = commonTitles[commonTitleType as keyof typeof commonTitles];
    title = titles[Math.floor(Math.random() * titles.length)];
  } else {
    const titles = categoryTitles[category] || categoryTitles.defi;
    title = titles[Math.floor(Math.random() * titles.length)];

    // Add status-specific suffix if needed
    if (status === "pending") {
      title = `[DRAFT] ${title}`;
    } else if (status === "succeeded" && Math.random() > 0.7) {
      title = `${title} - Implementation`;
    }
  }

  // Generate description
  const description = `This proposal ${
    status === "pending" ? "aims to" : "aimed to"
  } ${title.toLowerCase()}.
  
${generateProposalDetails(category)}`;

  return { title, description };
};

const generateProposalDetails = (category: string): string => {
  const details: Record<string, string[]> = {
    defi: [
      "This change will help optimize capital efficiency and improve protocol sustainability.",
      "The proposed parameters have been carefully modeled to balance risk and capital efficiency.",
      "This update aligns with our long-term strategy to maintain a healthy and competitive protocol.",
      "Community feedback has been incorporated into this proposal through our governance forums.",
    ],
    nft: [
      "This update reflects community feedback and market analysis to ensure long-term collection value.",
      "The proposed changes aim to enhance holder benefits and ecosystem growth.",
      "This initiative is part of our roadmap to expand utility and engagement with our community.",
      "We believe this update will drive adoption and strengthen our position in the NFT space.",
    ],
    gaming: [
      "This update is designed to improve player experience and engagement based on community feedback.",
      "The proposed changes have been tested in our development environment with positive results.",
      "This initiative supports our vision of creating a sustainable in-game economy.",
      "We expect these changes to increase player retention and attract new participants.",
    ],
    social: [
      "This proposal reflects our commitment to creating a vibrant and inclusive community.",
      "The changes have been designed with extensive community consultation and feedback.",
      "This update aligns with our mission to empower creators and engage our community.",
      "We believe these improvements will enhance the overall user experience on our platform.",
    ],
    governance: [
      "This proposal has been developed through community discussion and expert review.",
      "The changes are designed to improve governance participation and decision-making.",
      "This update reflects our commitment to decentralization and community-led development.",
      "We believe these improvements will strengthen our governance framework for the future.",
    ],
  };

  const categoryDetails = details[category] || details.defi;
  const selectedDetails = [...categoryDetails]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 2);

  return selectedDetails.join("\n\n");
};

// Generate all proposals
export const dummyProposals: Proposal[] = [];

// Generate 4-6 proposals for each DAO
for (let i = 1; i <= 20; i++) {
  const proposalCount = Math.floor(Math.random() * 3) + 4; // 4-6 proposals per DAO
  dummyProposals.push(...generateProposalsForDAO(i.toString(), proposalCount));
}

// Ensure at least one active proposal exists
if (!dummyProposals.some((p) => p.status === "active")) {
  const activeIndex = Math.floor(Math.random() * dummyProposals.length);
  dummyProposals[activeIndex].status = "active";
  const { startBlock, endBlock } = generateBlocks("active");
  dummyProposals[activeIndex].startBlock = startBlock;
  dummyProposals[activeIndex].endBlock = endBlock;
}

export const getProposalsByDAO = (daoId: string): Proposal[] => {
  return dummyProposals.filter((proposal) => proposal.daoId === daoId);
};

export const getActiveProposals = (daoId?: string): Proposal[] => {
  const proposals = daoId
    ? dummyProposals.filter((p) => p.daoId === daoId)
    : [...dummyProposals];

  return proposals.filter(
    (p) => p.status === "active" || p.status === "pending"
  );
};

export const getProposalById = (id: string): Proposal | undefined => {
  return dummyProposals.find((proposal) => proposal.id === id);
};
