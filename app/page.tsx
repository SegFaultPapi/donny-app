"use client"

import { useEffect } from "react"

import { useState } from "react"

import { WalletConnect } from "@/components/wallet-connect"
import { EntryModal } from "@/components/entry-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { useAccount } from "wagmi"
import { Heart, Trophy, Users, Clock } from "lucide-react"

export default function Home() {
  const { isConnected } = useAccount()
  const [showEntryModal, setShowEntryModal] = useState(false)

  // Auto-open modal when wallet connects
  useEffect(() => {
    if (isConnected) {
      setShowEntryModal(true)
    }
  }, [isConnected])

  return (
    <div className="relative min-h-screen bg-background">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="fixed inset-0 z-0 opacity-40 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="rgb(251, 204, 92)"
        maxOpacity={0.18}
        flickerChance={0.1}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Mobile First */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none text-foreground">Donny</h1>
                <p className="text-[10px] text-muted-foreground">Tap to Give</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </header>

        {/* Hero Section - Mobile Optimized */}
        <main className="px-4 pb-20 pt-6">
          <div className="mx-auto max-w-lg space-y-6">
            {/* Main Hero */}
            <div className="space-y-4 text-center">
              <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary text-xs font-medium px-3 py-1">
                Round #1 Active
              </Badge>
              <h2 className="font-serif text-5xl font-bold leading-[1.1] text-balance tracking-tight sm:text-6xl">
                Tap to win.
                <br />
                <span className="text-primary">Give back.</span>
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground text-pretty max-w-md mx-auto">
                A high-energy challenge where tapping fast means winning big and supporting verified charities.
              </p>
            </div>

            {/* Stats Grid - Compact Mobile */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="font-serif text-2xl font-bold text-primary">$2.5k</div>
                  <div className="text-[10px] uppercase tracking-wider leading-tight text-muted-foreground">Prize Pool</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="font-serif text-2xl font-bold text-foreground">47</div>
                  <div className="text-[10px] uppercase tracking-wider leading-tight text-muted-foreground">Players</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="font-serif text-2xl font-bold text-primary">$1k</div>
                  <div className="text-[10px] uppercase tracking-wider leading-tight text-muted-foreground">Charity</div>
                </CardContent>
              </Card>
            </div>

            {/* Round Info - Mobile Optimized */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-bold text-foreground">Round #1</h3>
                    <p className="text-sm text-muted-foreground">Entry fee: <span className="font-semibold text-primary">5 cUSD</span></p>
                  </div>
                  <Badge variant="secondary" className="gap-1.5 px-3 py-2 shrink-0 border border-border/50">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono text-sm font-bold">23:45:12</span>
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">🥇 First place</span>
                      <span className="font-serif text-base font-bold text-foreground">$750</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">🥈 Second place</span>
                      <span className="font-serif text-base font-bold text-foreground">$450</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">🥉 Third place</span>
                      <span className="font-serif text-base font-bold text-foreground">$300</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary/30 pt-3 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                      Charity impact
                    </span>
                    <span className="font-serif text-base font-bold text-primary">$1,000</span>
                  </div>
                </div>

                {isConnected ? (
                  <Button 
                    size="lg" 
                    className="h-14 w-full text-base font-bold uppercase tracking-wide"
                    onClick={() => setShowEntryModal(true)}
                  >
                    Enter Round
                  </Button>
                ) : (
                  <Button size="lg" className="h-14 w-full text-base font-bold uppercase tracking-wide" disabled>
                    Connect Wallet
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* How It Works - Simplified */}
            <div className="space-y-4 py-4">
              <h3 className="font-serif text-2xl font-bold text-foreground text-center">How it works</h3>
              <div className="space-y-3">
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    1
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="text-base font-bold text-foreground">Enter the round</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Pay 5 cUSD to join the 24-hour competition
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    2
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="text-base font-bold text-foreground">Tap as fast as you can</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Climb the leaderboard to secure your spot
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    3
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="text-base font-bold text-foreground">Win prizes, support charity</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Top 3 split 60% of pool, 40% goes to verified charities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

      {/* Entry Modal */}
      <EntryModal open={showEntryModal} onOpenChange={setShowEntryModal} />
      </div>
    </div>
  )
}
