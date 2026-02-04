"use client"

import React from "react"

import { useState, useCallback } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { Heart, Clock, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface TapAnimation {
  id: number
  x: number
  y: number
}

export default function TappingPage() {
  const [taps, setTaps] = useState(0)
  const [canTap, setCanTap] = useState(true)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [tapAnimations, setTapAnimations] = useState<TapAnimation[]>([])

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, address: "0x1234...5678", taps: 5420, isMe: false },
    { rank: 2, address: "0xabcd...efgh", taps: 4890, isMe: false },
    { rank: 3, address: "0x9876...4321", taps: 3256, isMe: true },
    { rank: 4, address: "0xfedc...ba98", taps: 2847, isMe: false },
    { rank: 5, address: "0x5555...6666", taps: 2103, isMe: false },
  ]

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const now = Date.now()
    
    // 100ms cooldown
    if (now - lastTapTime < 100) {
      return
    }

    setTaps(prev => prev + 1)
    setLastTapTime(now)
    
    // Get button position and click coordinates
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Add tap animation
    const animationId = Date.now()
    setTapAnimations(prev => [...prev, { id: animationId, x, y }])
    
    // Remove animation after duration
    setTimeout(() => {
      setTapAnimations(prev => prev.filter(anim => anim.id !== animationId))
    }, 1000)
    
    // Visual feedback
    setCanTap(false)
    setTimeout(() => setCanTap(true), 100)
  }, [lastTapTime])

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
                <span className="font-mono text-xl font-bold text-foreground">23:45:12</span>
              </div>
              <Badge variant="outline" className="border-primary/50 bg-primary/5 text-primary text-xs font-medium px-3 py-1">
                Active
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
                    disabled={!canTap}
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

                <div className="w-full max-w-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Rate limit</span>
                    <span className="font-mono font-medium text-foreground">{taps % 600}/600 per min</span>
                  </div>
                  <Progress value={(taps % 600) / 600} className="h-2 bg-secondary" />
                </div>
              </CardContent>
            </Card>

            {/* Stats - Compact */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="text-xs text-orange-500 font-bold">🥉</div>
                  <div className="font-serif text-2xl font-bold text-foreground">3rd</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rank</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Prize</div>
                  <div className="font-serif text-2xl font-bold text-primary">$300</div>
                  <div className="text-[10px] text-muted-foreground">20%</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-3 text-center space-y-1">
                  <Heart className="h-4 w-4 mx-auto text-primary" fill="currentColor" />
                  <div className="font-serif text-2xl font-bold text-foreground">$1k</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Charity</div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard - Mobile */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-foreground">Leaderboard</h3>
                  <Badge variant="secondary" className="text-xs border border-border/50">47 Players</Badge>
                </div>

                <div className="space-y-2">
                  {leaderboard.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        player.isMe
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border/50 bg-card/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                            player.rank === 1
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : player.rank === 2
                              ? 'bg-gray-400/20 text-gray-300'
                              : player.rank === 3
                              ? 'bg-orange-500/20 text-orange-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {player.rank}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-sm font-bold text-foreground">
                            {player.isMe ? 'You' : player.address}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {player.taps.toLocaleString()} taps
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
      </div>
    </div>
  )
}
