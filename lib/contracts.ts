// Contract addresses on CELO
// Alfajores testnet cUSD: 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
// CELO mainnet cUSD: 0x765DE816845861e75A25fCA122bb6bEB168b3DF4

export const CUSD_ADDRESS_ALFAJORES = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" as const
export const CUSD_ADDRESS_CELO = "0x765DE816845861e75A25fCA122bb6bEB168b3DF4" as const

// CELO network IDs
export const CELO_ALFAJORES_CHAIN_ID = 44787
export const CELO_MAINNET_CHAIN_ID = 42220

// Donny game contract address (update after deployment)
export const DONNY_GAME_ADDRESS = process.env.NEXT_PUBLIC_DONNY_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000" as const

// Charity wallet address
export const CHARITY_WALLET = process.env.NEXT_PUBLIC_CHARITY_WALLET || "0x0000000000000000000000000000000000000000" as const

// USDC Contract ABI (ERC20 standard)
export const USDC_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Donny Game Contract ABI
export const DONNY_GAME_ABI = [
  {
    inputs: [],
    name: "enterRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "settleRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getRoundInfo",
    outputs: [
      { name: "_roundStartTime", type: "uint256" },
      { name: "_roundEndTime", type: "uint256" },
      { name: "_prizePool", type: "uint256" },
      { name: "_donationPool", type: "uint256" },
      { name: "_totalEntries", type: "uint256" },
      { name: "_isActive", type: "bool" },
      { name: "_isSettled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserTaps",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "topN", type: "uint256" }],
    name: "getTopPlayers",
    outputs: [
      { name: "addresses", type: "address[]" },
      { name: "tapCounts", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllParticipants",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "hasEntered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "taps",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const
