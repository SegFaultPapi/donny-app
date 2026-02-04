"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useMiniapp } from "@/components/miniapp-provider"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isMiniApp, user } = useMiniapp()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {isMiniApp && user && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            @{user.username || `fid:${user.fid}`}
          </span>
        )}
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
      </div>
    )
  }

  // In Mini App, prioritize the miniapp connector
  const connector = isMiniApp 
    ? connectors.find(c => c.id === "miniapp") || connectors[0]
    : connectors[0]

  return (
    <Button
      onClick={() => {
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
