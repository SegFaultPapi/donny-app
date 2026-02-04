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

interface EntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntryModal({ open, onOpenChange }: EntryModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleEnter = async () => {
    setIsProcessing(true)
    
    // TODO: Integrate with smart contract
    // await writeContract({
    //   address: GAME_CONTRACT_ADDRESS,
    //   abi: GAME_ABI,
    //   functionName: 'enterRound',
    // })
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    onOpenChange(false)
    
    // Redirect to tapping page
    router.push("/tapping")
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
                <div className="font-serif text-3xl font-bold text-foreground">5 cUSD</div>
                <div className="text-xs text-muted-foreground">≈ $5.00 USD</div>
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
              <span className="font-serif text-base font-bold text-foreground">3 cUSD</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                Charity (40%)
              </span>
              <span className="font-serif text-base font-bold text-primary">2 cUSD</span>
            </div>
          </div>

          {/* Round Info */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>47 players</span>
            </div>
            <Badge variant="outline" className="border-primary/50 bg-primary/5 text-primary font-medium">
              23:45:12 left
            </Badge>
          </div>
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
            disabled={isProcessing}
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
