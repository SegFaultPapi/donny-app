"use client"

import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { Heart, Trophy, ExternalLink, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"

export default function ResultsPage() {
  // Mock results data
  const winners = [
    { rank: 1, address: "0x1234...5678", taps: 5420, prize: 750 },
    { rank: 2, address: "0xabcd...efgh", taps: 4890, prize: 450 },
    { rank: 3, address: "0x9876...4321", taps: 3256, prize: 300 },
  ]

  const charityDonation = {
    amount: 1000,
    txHash: "0xabc123def456...",
    charity: "charity: water",
  }

  const userRank = 3
  const userTaps = 3256
  const userPrize = 300

  return (
    <div className="relative min-h-screen bg-background">
      <FlickeringGrid
        className="fixed inset-0 z-0 h-screen w-screen opacity-70 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,white_0%,transparent_75%)]"
        squareSize={4}
        gridGap={6}
        color="rgb(251, 204, 92)"
        maxOpacity={0.4}
        flickerChance={0.12}
      />

      {/* Content */}
      <div className="relative z-10">
      {/* Header - Mobile First */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none text-foreground">Donny</h1>
                <p className="text-[10px] text-muted-foreground">Round #1 Results</p>
              </div>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="px-4 pb-20 pt-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Congrats Banner - Mobile */}
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="border-primary/50 text-primary text-xs">
              Round #1 Complete
            </Badge>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Congratulations!
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You finished <span className="font-bold text-primary">3rd</span> and won <span className="font-bold text-primary">$300</span>
            </p>
          </div>

          {/* User Stats - Compact */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1.5">
                  <Trophy className="h-8 w-8 mx-auto text-orange-500" />
                  <div className="text-3xl font-bold text-foreground">3rd</div>
                  <div className="text-[10px] text-muted-foreground">Rank</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground">Taps</div>
                  <div className="text-3xl font-bold text-primary">{userTaps.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Great!</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground">Prize</div>
                  <div className="text-3xl font-bold text-primary">${userPrize}</div>
                  <div className="text-[10px] text-muted-foreground">20%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winners - Mobile Optimized */}
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Top 3</h3>
                <Badge variant="secondary" className="text-xs">47 Players</Badge>
              </div>

              <div className="space-y-2">
                {winners.map((winner) => (
                  <div
                    key={winner.rank}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      winner.rank === userRank
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-card/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                          winner.rank === 1
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : winner.rank === 2
                            ? 'bg-gray-400/20 text-gray-400'
                            : 'bg-orange-500/20 text-orange-500'
                        }`}
                      >
                        {winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-sm font-semibold text-foreground">
                          {winner.rank === userRank ? 'You' : winner.address}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {winner.taps.toLocaleString()} taps
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <div className="text-lg font-bold text-primary">${winner.prize}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {winner.rank === 1 ? '50%' : winner.rank === 2 ? '30%' : '20%'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charity Impact - Mobile */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                <h3 className="text-lg font-bold text-foreground">Charity Impact</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1 text-center">
                  <div className="text-4xl font-bold text-primary">${charityDonation.amount}</div>
                  <p className="text-xs text-muted-foreground">
                    donated to <span className="font-semibold text-foreground">{charityDonation.charity}</span>
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border border-primary/30 bg-card/50 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Transaction</span>
                    <Badge variant="outline" className="border-primary/50 text-primary text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate text-[10px] font-mono text-foreground bg-muted px-2 py-1 rounded">
                      {charityDonation.txHash}
                    </code>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                      <a
                        href={`https://sepolia.celoscan.io/tx/${charityDonation.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-center text-muted-foreground text-pretty">
                  40% of every prize pool goes to verified charities building clean water worldwide.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions - Mobile */}
          <div className="flex flex-col gap-3">
            <Button size="lg" className="h-12 w-full gap-2" asChild>
              <Link href="/">
                Play Next Round
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 w-full gap-2 bg-transparent">
              <Share2 className="h-4 w-4" />
              Share Results
            </Button>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
