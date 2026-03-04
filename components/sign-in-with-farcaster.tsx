"use client"

import { useEffect, useState } from "react"
import { SignInButton, useProfile } from "@farcaster/auth-kit"
import { useMiniapp } from "@/components/miniapp-provider"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { Heart, Smartphone } from "lucide-react"

/**
 * In miniapp: user is already in Farcaster → no login screen, just children.
 * On web: if not authenticated, show "Sign in with Farcaster" screen (QR / Warpcast, etc.).
 */
export function SignInWithFarcasterGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { isMiniApp, user: miniappUser } = useMiniapp()
  const { isAuthenticated, profile } = useProfile()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isSignedIn = isMiniApp ? !!miniappUser : isAuthenticated

  if (isSignedIn) {
    return <>{children}</>
  }

  // Web: "Sign in with Farcaster" screen (QR / Warpcast)
  // SignInButton only after mount to avoid hydration mismatch (AuthKit generates different IDs on server vs client)
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <FlickeringGrid
        className="fixed inset-0 z-0 h-screen w-screen opacity-70 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,white_0%,transparent_75%)]"
        squareSize={4}
        gridGap={6}
        color="rgb(251, 204, 92)"
        maxOpacity={0.4}
        flickerChance={0.12}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        {/* Minimal header aligned with the rest of the app */}
        <div className="absolute left-4 top-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </div>
          <div>
            <span className="text-base font-bold leading-none text-foreground">Donny</span>
            <p className="text-[10px] text-muted-foreground">Tap to Give</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8 text-center">
          {/* Main block in card */}
          <div className="rounded-2xl border border-primary/30 bg-card/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                <Heart className="h-7 w-7 text-primary" fill="currentColor" />
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                  Tap to win.
                  <br />
                  <span className="text-primary">Give back.</span>
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sign in with your Farcaster account to compete and donate to verified charities.
                </p>
              </div>

              {/* AuthKit button: only render on client to avoid hydration mismatch (AuthKit SVG IDs differ server vs client) */}
              <div className="sign-in-farcaster-wrapper [&_button]:!h-12 [&_button]:!w-full [&_button]:!rounded-lg [&_button]:!font-semibold [&_button]:!text-base min-h-12">
                {mounted && (
                  <SignInButton
                    onSuccess={({ username }) => {
                      if (username) console.log("Signed in:", username)
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Smartphone className="h-4 w-4 shrink-0" />
            <p className="text-xs">
              Scan the QR code with Warpcast or open the link in the Farcaster app.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
