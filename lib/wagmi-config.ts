import { createConfig, http } from "wagmi"
import { injected } from "wagmi/connectors"
import { miniapp } from "@farcaster/miniapp-wagmi-connector"

export const celoSepolia = {
  id: 11142220,
  name: "Celo Sepolia Testnet",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "CeloScan", url: "https://sepolia.celoscan.io" },
  },
  testnet: true,
} as const

// CELO Alfajores testnet
export const celoAlfajores = {
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: {
    default: { http: ["https://alfajores-forno.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "CeloScan", url: "https://alfajores.celoscan.io" },
  },
  testnet: true,
} as const

// CELO Mainnet
export const celo = {
  id: 42220,
  name: "Celo",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] },
  },
  blockExplorers: {
    default: { name: "CeloScan", url: "https://celoscan.io" },
  },
  testnet: false,
} as const

// Use Alfajores for testnet, CELO for mainnet
const chain = process.env.NEXT_PUBLIC_CHAIN === "mainnet" ? celo : celoAlfajores

export const config = createConfig({
  chains: [chain],
  connectors: [
    // Farcaster Mini App connector (prioritized when in Mini App context)
    miniapp(),
    // Fallback to injected connector for regular web usage
    injected(),
  ],
  transports: {
    [chain.id]: http(),
  },
})
