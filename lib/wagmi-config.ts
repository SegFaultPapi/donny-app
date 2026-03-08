import { createConfig, http } from "wagmi"
import { injected, walletConnect } from "wagmi/connectors"
import farcasterMiniApp from "@farcaster/miniapp-wagmi-connector"

export const celoSepolia = {
  id: 11142220,
  name: "Celo Sepolia Testnet",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" },
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

// Use Celo Sepolia for testnet (faucet activo), CELO for mainnet
const chain = process.env.NEXT_PUBLIC_CHAIN === "mainnet" ? celo : celoSepolia

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

export const config = createConfig({
  chains: [chain],
  connectors: [
    // Farcaster Mini App connector (used when in Farcaster client)
    farcasterMiniApp(),
    // Web: injected (MetaMask, etc.) and WalletConnect
    injected(),
    ...(projectId
      ? [walletConnect({ projectId, showQrModal: true })]
      : []),
  ],
  transports: {
    [chain.id]: http(),
  },
})
