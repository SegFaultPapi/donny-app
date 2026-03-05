"use client"

import React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { Heart, Clock, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { formatEther } from "viem"
import { DONNY_GAME_ADDRESS, DONNY_GAME_ABI } from "@/lib/contracts"

interface TapAnimation {
  id: number
  x: number
  y: number
}

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00:00"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function TappingPage() {
  const [canTap, setCanTap] = useState(true)
  const [tapAnimations, setTapAnimations] = useState<TapAnimation[]>([])
  const { address } = useAccount()

  const { data: roundInfo } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "getRoundInfo",
  })
  const { data: userTaps, refetch: refetchUserTaps } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "getUserTaps",
    args: address ? [address] : undefined,
  })
  const { data: topPlayersData, refetch: refetchTopPlayers } = useReadContract({
    address: DONNY_GAME_ADDRESS as `0x${string}`,
    abi: DONNY_GAME_ABI,
    functionName: "getTopPlayers",
    args: [BigInt(10)],
  })

  const { writeContractAsync, isPending: isTapPending } = useWriteContract()

  const [
    roundStartTime,
    roundEndTime,
    prizePool,
    donationPool,
    totalEntries,
    isActive,
    isSettled,
  ] = roundInfo ?? []

  const taps = userTaps !== undefined ? Number(userTaps) : 0
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const timeRemaining = useMemo(() => {
    if (roundEndTime === undefined) return 0
    const end = Number(roundEndTime)
    return Math.max(0, end - Math.floor(Date.now() / 1000))
  }, [roundEndTime, tick])

  const leaderboard = useMemo(() => {
    if (!topPlayersData || !Array.isArray(topPlayersData)) return []
    const [addresses, tapCounts] = topPlayersData
    return (addresses as readonly `0x${string}`[]).map((addr, i) => ({
      rank: i + 1,
      address: addr,
      taps: Number((tapCounts as readonly bigint[])[i] ?? 0),
      isMe: address ? addr.toLowerCase() === address.toLowerCase() : false,
    })).filter((p) => p.address !== "0x0000000000000000000000000000000000000000")
  }, [topPlayersData, address])

  const myRank = useMemo(() => {
    const found = leaderboard.find((p) => p.isMe)
    return found ? found.rank : null
  }, [leaderboard])

  const refetchAll = useCallback(() => {
    refetchUserTaps()
    refetchTopPlayers()
  }, [refetchUserTaps, refetchTopPlayers])

  const handleTap = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!address || DONNY_GAME_ADDRESS === "0x0000000000000000000000000000000000000000") return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const animationId = Date.now()
      setTapAnimations((prev) => [...prev, { id: animationId, x, y }])
      setTimeout(() => {
        setTapAnimations((prev) => prev.filter((anim) => anim.id !== animationId))
      }, 1000)
      setCanTap(false)
      setTimeout(() => setCanTap(true), 300)
      try {
        await writeContractAsync({
          address: DONNY_GAME_ADDRESS as `0x${string}`,
          abi: DONNY_GAME_ABI,
          functionName: "tap",
        })
        refetchAll()
      } catch {
        // User rejected or tx failed; refetch to stay in sync
        refetchAll()
      }
    },
    [address, writeContractAsync, refetchAll]
  )

  return (
    <div className="relative min-h-screen bg-background">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="fixed inset-0 z-0 opacity-35 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="rgb(251, 204, 92)"
        maxOpacity={0.15}
        flickerChance={0.1}
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
                  <p className="text-[10px] text-muted-foreground">Round #1</p>
                </div>
              </div>
            </div>
            <WalletConnect />
          </div>
        </header>

        <main className="px-4 pb-6 pt-4">
          <div className="mx-auto max-w-lg space-y-4">
            {/* Time Remaining - Compact */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-xl font-bold text-foreground">
                  {roundEndTime != null ? formatTimeRemaining(timeRemaining) : "—"}
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-primary/50 bg-primary/5 text-primary text-xs font-medium px-3 py-1"
              >
                {isSettled ? "Ended" : isActive ? "Active" : "Waiting"}
              </Badge>
            </div>

            {/* Tap Button - Mobile Optimized */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center space-y-8 py-12">
                <div className="space-y-2 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Taps</p>
                  <div className="font-serif text-7xl font-bold text-primary">{taps.toLocaleString()}</div>
                </div>

                <div className="relative flex items-center justify-center h-64 w-64">
                  {/* Tap animations - Outside button */}
                  {tapAnimations.map((anim) => (
                    <div
                      key={anim.id}
                      className="pointer-events-none absolute font-bold text-3xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-float-up-right z-50"
                      style={{
                        left: `${anim.x}px`,
                        top: `${anim.y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      +1
                    </div>
                  ))}

                  <button
                    onClick={handleTap}
                    disabled={!canTap || !address || isTapPending || !isActive || isSettled}
                    className={`group relative h-56 w-56 shrink-0 rounded-full bg-gradient-to-b from-primary via-[rgb(251,204,92)] to-[rgb(230,180,60)] shadow-[0_12px_32px_rgba(251,204,92,0.4),0_6px_12px_rgba(0,0,0,0.25),inset_0_-6px_12px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(255,255,255,0.4)] transition-all duration-150 ease-out hover:shadow-[0_14px_36px_rgba(251,204,92,0.5),0_7px_14px_rgba(0,0,0,0.3),inset_0_-6px_12px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(255,255,255,0.4)] active:scale-[0.97] active:shadow-[0_6px_16px_rgba(251,204,92,0.3),0_3px_6px_rgba(0,0,0,0.3),inset_0_2px_8px_rgba(0,0,0,0.2)] disabled:opacity-50 touch-none ${
                      !canTap ? 'scale-[0.97]' : ''
                    }`}
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/* Center content */}
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                      {/* Top glossy highlight */}
                      <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
                      
                      {/* Bottom inner shadow */}
                      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent" />
                      
                      {/* TAP text */}
                      <span className="font-black text-5xl text-primary-foreground/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] tracking-widest transition-transform duration-150 group-active:scale-95">
                        TAP
                      </span>
                    </div>
                  </button>
                </div>

              </CardContent>
            </Card>

            {/* Stats - Compact */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="text-xs text-orange-500 font-bold">Rank</div>
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {myRank != null ? `#${myRank}` : "—"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">You</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Prize pool</div>
                  <div className="font-serif text-2xl font-bold text-primary">
                    {prizePool != null ? `${Number(formatEther(prizePool)).toFixed(1)}` : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">cUSD</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <Heart className="h-4 w-4 mx-auto text-primary" fill="currentColor" />
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {donationPool != null ? `${Number(formatEther(donationPool)).toFixed(1)}` : "—"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Charity</div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard - Mobile */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-foreground">Leaderboard</h3>
                  <Badge variant="secondary" className="text-xs border border-border/50">
                    {totalEntries != null ? `${Number(totalEntries)} Players` : "—"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {leaderboard.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No players yet. Tap to climb!</p>
                  ) : (
                    leaderboard.map((player) => (
                      <div
                        key={`${player.address}-${player.rank}`}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          player.isMe
                            ? "border-primary/50 bg-primary/10"
                            : "border-border/50 bg-card/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                              player.rank === 1
                                ? "bg-yellow-500/20 text-yellow-500"
                                : player.rank === 2
                                ? "bg-gray-400/20 text-gray-300"
                                : player.rank === 3
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {player.rank}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="text-sm font-bold text-foreground">
                              {player.isMe
                                ? "You"
                                : `${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {player.taps.toLocaleString()} taps
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
      </div>
    </div>
  )
}
