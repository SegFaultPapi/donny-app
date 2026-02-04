// Contract addresses on CELO Sepolia
export const USDC_ADDRESS = "0x01C5C0122039549AD1493B8220cABEdD739BC44E" as const
export const CELO_SEPOLIA_CHAIN_ID = 11142220
export const CREATOR_ADDRESS = "YOUR_WALLET_ADDRESS_HERE" as const

// Mock Donny game contract address (replace with actual deployed contract)
export const DONNY_GAME_ADDRESS = "0x0000000000000000000000000000000000000000" as const

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

// Donny Game Contract ABI (mock - replace with actual ABI)
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
    name: "getCurrentRound",
    outputs: [
      { name: "roundId", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "totalPool", type: "uint256" },
      { name: "entryFee", type: "uint256" },
      { name: "isActive", type: "bool" },
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
    inputs: [],
    name: "getLeaderboard",
    outputs: [
      { name: "addresses", type: "address[]" },
      { name: "taps", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
