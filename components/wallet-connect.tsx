"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet } from "lucide-react"
import { useMiniapp } from "@/components/miniapp-provider"
import type { Connector } from "wagmi"

const FARCASTER_IDS = ["farcasterMiniApp", "farcasterFrame"]

function connectorLabel(connector: Connector): string {
  const id = connector.id.toLowerCase()
  const name = connector.name || connector.id
  if (FARCASTER_IDS.some((f) => id.includes(f.toLowerCase()))) return "Farcaster"
  if (id.includes("walletconnect")) return "WalletConnect"
  if (id.includes("injected") || id.includes("metamask")) return "Browser Wallet"
  return name
}

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
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
          <span className="sm:hidden">{address.slice(0, 4)}...</span>
        </Button>
      </div>
    )
  }

  // Farcaster Mini App: single button, use Farcaster wallet (no picker)
  if (isMiniApp) {
    const connector =
      connectors.find((c) => FARCASTER_IDS.includes(c.id)) || connectors[0]
    return (
      <Button
        onClick={() => connector && connect({ connector })}
        disabled={isPending}
        size="sm"
        className="gap-1.5 text-xs"
      >
        <Wallet className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    )
  }

  // Web: wallet selector (dropdown) or single connect button
  const webConnectors = connectors.filter(
    (c) => !FARCASTER_IDS.includes(c.id)
  )

  // Si solo hay un connector (p. ej. Browser Wallet), conectar al clic sin abrir menú
  if (webConnectors.length === 1) {
    return (
      <Button
        onClick={() => connect({ connector: webConnectors[0] })}
        disabled={isPending}
        size="sm"
        className="gap-1.5 text-xs"
      >
        <Wallet className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    )
  }

  // Varios connectors: mostrar menú para elegir
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 text-xs"
          disabled={isPending}
          variant="outline"
        >
          <Wallet className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]" sideOffset={8}>
        {webConnectors.map((connector) => (
          <DropdownMenuItem
            key={connector.uid}
            onSelect={(e) => {
              e.preventDefault()
              connect({ connector })
            }}
            disabled={isPending}
          >
            {connectorLabel(connector)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
