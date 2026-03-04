"use client"

import "@farcaster/auth-kit/styles.css"
import { AuthKitProvider as FarcasterAuthKitProvider } from "@farcaster/auth-kit"

function getAuthConfig() {
  if (typeof window === "undefined") {
    return {
      domain: process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ?? "localhost",
      siweUri: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      rpcUrl: "https://mainnet.optimism.io",
    }
  }
  const origin = window.location.origin
  const domain = window.location.hostname
  return {
    domain,
    siweUri: `${origin}/api/auth/callback`,
    rpcUrl: "https://mainnet.optimism.io",
  }
}

export function FarcasterAuthProvider({ children }: { children: React.ReactNode }) {
  const config = getAuthConfig()
  return (
    <FarcasterAuthKitProvider config={config}>
      {children}
    </FarcasterAuthKitProvider>
  )
}
