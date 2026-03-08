"use client"

import { useMemo } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { Heart, Trophy, ExternalLink, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { useAccount, useReadContract } from "wagmi"
import { formatEther } from "viem"
import { DONNY_GAME_ADDRESS, DONNY_GAME_ABI } from "@/lib/contracts"

const EXPLORER_URL = "https://celo-sepolia.blockscout.com"

export default function ResultsPage() {
  const { address } = useAccount()

  const { data: roundInfo } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "getRoundInfo",
  })
  const { data: topPlayersData } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "getTopPlayers",
    args: [BigInt(3)],
  })
  const { data: userTaps } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "getUserTaps",
    args: address ? [address] : undefined,
  })

  const [, , , donationPool, totalEntries, , isSettled] = roundInfo ?? []
  const donationPoolNum = donationPool != null ? Number(formatEther(donationPool)) : 0
  const prizePoolNum = prizePool != null ? Number(formatEther(prizePool)) : 0
  const totalEntriesNum = totalEntries != null ? Number(totalEntries) : 0

  const winners = useMemo(() => {
    if (!topPlayersData || !Array.isArray(topPlayersData)) return []
    const [addresses, tapCounts] = topPlayersData
    const addrs = addresses as readonly `0x${string}`[]
    const taps = tapCounts as readonly bigint[]
    let firstPrize = 0, secondPrize = 0, thirdPrize = 0
    if (totalEntriesNum === 1) firstPrize = prizePoolNum
    else if (totalEntriesNum === 2) { firstPrize = prizePoolNum * 0.7; secondPrize = prizePoolNum * 0.3 }
    else if (totalEntriesNum >= 3) { firstPrize = prizePoolNum * 0.5; secondPrize = prizePoolNum * 0.3; thirdPrize = prizePoolNum * 0.2 }
    const prizes = [firstPrize, secondPrize, thirdPrize]
    return addrs
      .map((addr, i) => ({ rank: i + 1, address: addr, taps: Number(taps[i] ?? 0), prize: prizes[i] ?? 0 }))
      .filter((w) => w.address !== "0x0000000000000000000000000000000000000000")
  }, [topPlayersData, totalEntriesNum, prizePoolNum])

  const userTapsNum = userTaps !== undefined ? Number(userTaps) : 0
  const userWinner = winners.find((w) => address && w.address.toLowerCase() === address.toLowerCase())
  const userRank = userWinner?.rank ?? null
  const userPrize = userWinner?.prize ?? 0

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
              Round complete
            </Badge>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              {userRank != null ? "Congratulations!" : "Round results"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {userRank != null ? (
                <>You finished <span className="font-bold text-primary">#{userRank}</span> and won <span className="font-bold text-primary">{userPrize.toFixed(1)} USDC</span></>
              ) : (
                <>You made <span className="font-bold text-primary">{userTapsNum.toLocaleString()}</span> taps this round</>
              )}
            </p>
          </div>

          {/* User Stats - Compact */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1.5">
                  <Trophy className="h-8 w-8 mx-auto text-orange-500" />
                  <div className="text-3xl font-bold text-foreground">{userRank ?? "—"}</div>
                  <div className="text-[10px] text-muted-foreground">Rank</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground">Taps</div>
                  <div className="text-3xl font-bold text-primary">{userTapsNum.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground">Prize</div>
                  <div className="text-3xl font-bold text-primary">{userPrize > 0 ? `${userPrize.toFixed(1)}` : "—"}</div>
                  <div className="text-[10px] text-muted-foreground">USDC</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winners - Mobile Optimized */}
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Top 3</h3>
                <Badge variant="secondary" className="text-xs">{totalEntriesNum} Players</Badge>
              </div>

              <div className="space-y-2">
                {winners.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No winners yet.</p>
                ) : (
                  winners.map((winner) => (
                  <div
                    key={`${winner.address}-${winner.rank}`}
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
                          {winner.rank === userRank ? 'You' : `${winner.address.slice(0, 6)}...${winner.address.slice(-4)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {winner.taps.toLocaleString()} taps
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <div className="text-lg font-bold text-primary">{winner.prize > 0 ? `${winner.prize.toFixed(1)}` : "—"}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {winner.rank === 1 ? '50%' : winner.rank === 2 ? '30%' : '20%'}
                      </div>
                    </div>
                  </div>
                  ))
                )}
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
                  <div className="text-4xl font-bold text-primary">{donationPoolNum.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    USDC donated to charity wallet
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border border-primary/30 bg-card/50 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Contract</span>
                    <Badge variant="outline" className="border-primary/50 text-primary text-[10px]">
                      On-chain
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate text-[10px] font-mono text-foreground bg-muted px-2 py-1 rounded">
                      {DONNY_GAME_ADDRESS.slice(0, 10)}...{DONNY_GAME_ADDRESS.slice(-8)}
                    </code>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                      <a
                        href={`${EXPLORER_URL}/address/${DONNY_GAME_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-center text-muted-foreground text-pretty">
                  40% of every entry goes to the charity wallet. 100% transparent on-chain.
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
