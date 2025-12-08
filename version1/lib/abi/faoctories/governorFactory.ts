export const governorFactoryAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_timelockImpl",
        type: "address",
        internalType: "address",
      },
      {
        name: "_treasuryImpl",
        type: "address",
        internalType: "address",
      },
      {
        name: "_governorImpl",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createDAO",
    inputs: [
      { name: "daoName", type: "string", internalType: "string" },
      {
        name: "daoDescription",
        type: "string",
        internalType: "string",
      },
      { name: "metadataURI", type: "string", internalType: "string" },
      { name: "tokenName", type: "string", internalType: "string" },
      { name: "tokenSymbol", type: "string", internalType: "string" },
      {
        name: "initialSupply",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "maxSupply", type: "uint256", internalType: "uint256" },
      { name: "votingDelay", type: "uint256", internalType: "uint256" },
      {
        name: "votingPeriod",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "proposalThreshold",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "timelockDelay",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "quorumPercentage",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokenType",
        type: "uint8",
        internalType: "enum GovernorFactory.TokenType",
      },
      { name: "baseURI", type: "string", internalType: "string" },
    ],
    outputs: [
      { name: "governor", type: "address", internalType: "address" },
      { name: "timelock", type: "address", internalType: "address" },
      { name: "treasury", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deleteDao",
    inputs: [{ name: "daoId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllDaos",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct GovernorFactory.DAOConfig[]",
        components: [
          { name: "daoName", type: "string", internalType: "string" },
          {
            name: "metadataURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "daoDescription",
            type: "string",
            internalType: "string",
          },
          {
            name: "governor",
            type: "address",
            internalType: "address",
          },
          {
            name: "timelock",
            type: "address",
            internalType: "address",
          },
          {
            name: "treasury",
            type: "address",
            internalType: "address",
          },
          { name: "token", type: "address", internalType: "address" },
          {
            name: "tokenType",
            type: "uint8",
            internalType: "enum GovernorFactory.TokenType",
          },
          { name: "creator", type: "address", internalType: "address" },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDao",
    inputs: [{ name: "daoId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct GovernorFactory.DAOConfig",
        components: [
          { name: "daoName", type: "string", internalType: "string" },
          {
            name: "metadataURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "daoDescription",
            type: "string",
            internalType: "string",
          },
          {
            name: "governor",
            type: "address",
            internalType: "address",
          },
          {
            name: "timelock",
            type: "address",
            internalType: "address",
          },
          {
            name: "treasury",
            type: "address",
            internalType: "address",
          },
          { name: "token", type: "address", internalType: "address" },
          {
            name: "tokenType",
            type: "uint8",
            internalType: "enum GovernorFactory.TokenType",
          },
          { name: "creator", type: "address", internalType: "address" },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDaoCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDaosByCreator",
    inputs: [{ name: "creator", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDaosByTokenType",
    inputs: [
      {
        name: "tokenType",
        type: "uint8",
        internalType: "enum GovernorFactory.TokenType",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct GovernorFactory.DAOConfig[]",
        components: [
          { name: "daoName", type: "string", internalType: "string" },
          {
            name: "metadataURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "daoDescription",
            type: "string",
            internalType: "string",
          },
          {
            name: "governor",
            type: "address",
            internalType: "address",
          },
          {
            name: "timelock",
            type: "address",
            internalType: "address",
          },
          {
            name: "treasury",
            type: "address",
            internalType: "address",
          },
          { name: "token", type: "address", internalType: "address" },
          {
            name: "tokenType",
            type: "uint8",
            internalType: "enum GovernorFactory.TokenType",
          },
          { name: "creator", type: "address", internalType: "address" },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "governorImplementation",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDAO",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "timelockImplementation",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "treasuryImplementation",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "DAOCreated",
    inputs: [
      {
        name: "governor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "timelock",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "treasury",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "daoName",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenType",
        type: "uint8",
        indexed: false,
        internalType: "enum GovernorFactory.TokenType",
      },
      {
        name: "creator",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "daoId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "FailedDeployment", inputs: [] },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: [
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "needed", type: "uint256", internalType: "uint256" },
    ],
  },
];
