"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Trophy, Users, Loader2 } from "lucide-react"
import { useAccount, useChainId, useWriteContract } from "wagmi"
import { parseUnits } from "viem"
import {
  DONNY_GAME_ADDRESS,
  DONNY_GAME_ABI,
  CUSD_ADDRESS_ALFAJORES,
  CUSD_ADDRESS_CELO,
  USDC_ABI,
  CELO_ALFAJORES_CHAIN_ID,
} from "@/lib/contracts"

const ENTRY_FEE = parseUnits("2", 18)

interface EntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntryModal({ open, onOpenChange }: EntryModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const chainId = useChainId()
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const cUSDAddress = chainId === CELO_ALFAJORES_CHAIN_ID ? CUSD_ADDRESS_ALFAJORES : CUSD_ADDRESS_CELO

  const handleEnter = async () => {
    if (!address || DONNY_GAME_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setError("Contract not configured. Connect wallet and ensure the game is deployed.")
      return
    }
    setIsProcessing(true)
    setError(null)
    try {
      await writeContractAsync({
        address: cUSDAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: "approve",
        args: [DONNY_GAME_ADDRESS as `0x${string}`, ENTRY_FEE],
      })
      await writeContractAsync({
        address: DONNY_GAME_ADDRESS as `0x${string}`,
        abi: DONNY_GAME_ABI,
        functionName: "enterRound",
      })
      onOpenChange(false)
      router.push("/tapping")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold">
            Enter Round #1
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Confirm your entry to start competing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Entry Fee */}
          <div className="rounded-lg border border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Entry Fee</span>
              <div className="text-right">
                <div className="font-serif text-3xl font-bold text-foreground">2 cUSD</div>
                <div className="text-xs text-muted-foreground">≈ $2.00 USD</div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3 rounded-lg border border-border/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4 text-primary" />
                Prize Pool (60%)
              </span>
              <span className="font-serif text-base font-bold text-foreground">1.2 cUSD</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                Charity (40%)
              </span>
              <span className="font-serif text-base font-bold text-primary">0.8 cUSD</span>
            </div>
          </div>

          {/* Round Info - optional: could be filled from getRoundInfo */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>2 cUSD entry · 24h round</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="bg-transparent border-border/50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleEnter}
            disabled={isProcessing || !address}
            className="gap-2 font-bold"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isProcessing ? "Processing..." : "Confirm & Enter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
