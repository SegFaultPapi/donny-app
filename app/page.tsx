"use client"

import { useEffect, useState, useMemo } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { EntryModal } from "@/components/entry-modal"
import { SignInWithFarcasterGate } from "@/components/sign-in-with-farcaster"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { useAccount, useReadContract } from "wagmi"
import { useMiniapp } from "@/components/miniapp-provider"
import { useProfile, useSignIn } from "@farcaster/auth-kit"
import { Heart, Trophy, Users, Clock, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatEther } from "viem"
import { DONNY_GAME_ADDRESS, DONNY_GAME_ABI } from "@/lib/contracts"
import Link from "next/link"

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00:00"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [tick, setTick] = useState(0)
  const { isMiniApp, user: miniappUser } = useMiniapp()
  const { isAuthenticated, profile } = useProfile()
  const { signOut: authKitSignOut } = useSignIn({})
  const isSignedIn = isMiniApp ? !!miniappUser : isAuthenticated

  const { data: roundInfo } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "getRoundInfo",
  })
  const { data: hasEntered } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "hasEntered",
    args: address ? [address] : undefined,
  })

  const [roundStartTime, roundEndTime, prizePool, donationPool, totalEntries, isActive, isSettled] = roundInfo ?? []
  const timeRemaining = useMemo(
    () => (roundEndTime !== undefined ? Math.max(0, Number(roundEndTime) - Math.floor(Date.now() / 1000)) : 0),
    [roundEndTime, tick]
  )
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const noRound = roundStartTime !== undefined && Number(roundStartTime) === 0
  const roundFinished = isSettled === true
  const userAlreadyEntered = hasEntered === true

  useEffect(() => {
    if (isConnected && !userAlreadyEntered && !roundFinished && !noRound) setShowEntryModal(true)
  }, [isConnected, userAlreadyEntered, roundFinished, noRound])

  const handleSignOut = () => {
    if (isMiniApp) {
      window.location.reload()
      return
    }
    authKitSignOut()
  }

  const prizePoolNum = prizePool != null ? Number(formatEther(prizePool)) : 0
  const donationPoolNum = donationPool != null ? Number(formatEther(donationPool)) : 0
  const totalEntriesNum = totalEntries != null ? Number(totalEntries) : 0
  const firstPrize = totalEntriesNum >= 3 ? prizePoolNum * 0.5 : totalEntriesNum === 1 ? prizePoolNum : totalEntriesNum === 2 ? prizePoolNum * 0.7 : 0
  const secondPrize = totalEntriesNum >= 2 ? (totalEntriesNum === 2 ? prizePoolNum * 0.3 : prizePoolNum * 0.3) : 0
  const thirdPrize = totalEntriesNum >= 3 ? prizePoolNum * 0.2 : 0

  return (
    <SignInWithFarcasterGate>
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
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 min-w-0 rounded-lg p-1 -m-1 hover:bg-muted/80 transition-colors outline-none focus-visible:ring-2 ring-ring"
                    >
                      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-border">
                        {(miniappUser?.pfpUrl ?? profile?.pfpUrl) ? (
                          <AvatarImage
                            src={miniappUser?.pfpUrl ?? profile?.pfpUrl}
                            alt={miniappUser?.displayName ?? profile?.displayName ?? "Farcaster user"}
                          />
                        ) : null}
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {(miniappUser?.displayName ?? profile?.displayName ?? miniappUser?.username ?? profile?.username)
                            ?.slice(0, 2)
                            .toUpperCase() ?? <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground truncate max-w-[100px] sm:max-w-[140px]" title={miniappUser?.username ?? profile?.username ? `@${miniappUser?.username ?? profile?.username}` : undefined}>
                        {miniappUser?.displayName ?? profile?.displayName ?? `@${miniappUser?.username ?? profile?.username ?? "user"}`}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8}>
                    <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-muted-foreground">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <WalletConnect />
              )}
            </div>
          </div>
        </header>

        {/* Hero Section - Mobile Optimized */}
        <main className="px-4 pb-20 pt-6">
          <div className="mx-auto max-w-lg space-y-6">
            {/* Main Hero */}
            <div className="space-y-4 text-center">
              <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary text-xs font-medium px-3 py-1">
                {noRound ? "No active round" : roundFinished ? "Round finished" : isActive ? "Round active" : "Waiting to start"}
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
                  <div className="font-serif text-2xl font-bold text-primary">{prizePoolNum > 0 ? prizePoolNum.toFixed(1) : "—"}</div>
                  <div className="text-[10px] uppercase tracking-wider leading-tight text-muted-foreground">Prize Pool</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="font-serif text-2xl font-bold text-foreground">{totalEntriesNum}</div>
                  <div className="text-[10px] uppercase tracking-wider leading-tight text-muted-foreground">Players</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="font-serif text-2xl font-bold text-primary">{donationPoolNum > 0 ? donationPoolNum.toFixed(1) : "—"}</div>
                  <div className="text-[10px] uppercase tracking-wider leading-tight text-muted-foreground">Charity</div>
                </CardContent>
              </Card>
            </div>

            {/* Round Info - Mobile Optimized */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-bold text-foreground">Current round</h3>
                    <p className="text-sm text-muted-foreground">Entry fee: <span className="font-semibold text-primary">2 USDC</span></p>
                  </div>
                  {!noRound && (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-2 shrink-0 border border-border/50">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-mono text-sm font-bold">{formatTimeRemaining(timeRemaining)}</span>
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">🥇 First place</span>
                      <span className="font-serif text-base font-bold text-foreground">{firstPrize > 0 ? firstPrize.toFixed(1) : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">🥈 Second place</span>
                      <span className="font-serif text-base font-bold text-foreground">{secondPrize > 0 ? secondPrize.toFixed(1) : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">🥉 Third place</span>
                      <span className="font-serif text-base font-bold text-foreground">{thirdPrize > 0 ? thirdPrize.toFixed(1) : "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary/30 pt-3 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                      Charity impact
                    </span>
                    <span className="font-serif text-base font-bold text-primary">{donationPoolNum > 0 ? donationPoolNum.toFixed(1) : "—"}</span>
                  </div>
                </div>

                {roundFinished ? (
                  <Button size="lg" className="h-14 w-full text-base font-bold uppercase tracking-wide" asChild>
                    <Link href="/results">View results</Link>
                  </Button>
                ) : userAlreadyEntered && isActive ? (
                  <Button size="lg" className="h-14 w-full text-base font-bold uppercase tracking-wide" asChild>
                    <Link href="/tapping">Continue tapping</Link>
                  </Button>
                ) : noRound ? (
                  <Button size="lg" className="h-14 w-full text-base font-bold uppercase tracking-wide" onClick={() => setShowEntryModal(true)}>
                    Be the first — join round
                  </Button>
                ) : (
                  <Button size="lg" className="h-14 w-full text-base font-bold uppercase tracking-wide" onClick={() => setShowEntryModal(true)}>
                    Join current round
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
                      Pay 2 USDC to join the 24-hour competition
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
    </SignInWithFarcasterGate>
  )
}
