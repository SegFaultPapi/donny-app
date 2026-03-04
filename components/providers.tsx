"use client"

import React from "react"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "@/lib/wagmi-config"
import { MiniappProvider } from "@/components/miniapp-provider"
import { FarcasterAuthProvider } from "@/components/farcaster-auth-provider"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <MiniappProvider>
      <FarcasterAuthProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </FarcasterAuthProvider>
    </MiniappProvider>
  )
}
