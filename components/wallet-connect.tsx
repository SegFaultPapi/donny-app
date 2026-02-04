"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <Button 
        onClick={() => disconnect()} 
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs bg-transparent"
      >
        <Wallet className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline">
          {address.slice(0, 4)}...{address.slice(-4)}
        </span>
        <span className="sm:hidden">
          {address.slice(0, 4)}...
        </span>
      </Button>
    )
  }

  return (
    <Button
      onClick={() => {
        const connector = connectors[0]
        if (connector) {
          connect({ connector })
        }
      }}
      size="sm"
      className="gap-1.5 text-xs"
    >
      <Wallet className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </Button>
  )
}
