"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { getFarcasterIdentity, type FarcasterUser } from "@/lib/farcaster-auth"

interface MiniappContextType {
  isMiniApp: boolean
  user: FarcasterUser | null
  isLoading: boolean
}

const MiniappContext = createContext<MiniappContextType>({
  isMiniApp: false,
  user: null,
  isLoading: true,
})

export const useMiniapp = () => useContext(MiniappContext)

interface MiniappProviderProps {
  children: React.ReactNode
}

export function MiniappProvider({ children }: MiniappProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Detect if we're running inside a Farcaster Mini App
    const checkMiniApp = () => {
      try {
        // Check if SDK is available (indicates we're in a Mini App context)
        if (typeof window !== "undefined" && sdk) {
          setIsMiniApp(true)
          return true
        }
      } catch (error) {
        // SDK not available, not in Mini App context
        setIsMiniApp(false)
        return false
      }
      return false
    }

    const initializeMiniApp = async () => {
      const inMiniApp = checkMiniApp()
      setIsMiniApp(inMiniApp)

      if (inMiniApp) {
        try {
          // Call ready() to hide the splash screen and display the app
          // This must be called when the app is fully loaded
          await sdk.actions.ready()
          
          // Get user identity
          const farcasterUser = await getFarcasterIdentity()
          setUser(farcasterUser)
          
          setIsReady(true)
          setIsLoading(false)
        } catch (error) {
          console.error("Error initializing Mini App:", error)
          // Even if ready() fails, show the app
          setIsReady(true)
          setIsLoading(false)
        }
      } else {
        // Not in Mini App context, show immediately
        setIsReady(true)
        setIsLoading(false)
      }
    }

    // Initialize after component mounts
    initializeMiniApp()
  }, [])

  // Show loading state only if we're in a Mini App and not ready yet
  if (isMiniApp && !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <MiniappContext.Provider value={{ isMiniApp, user, isLoading }}>
      {children}
    </MiniappContext.Provider>
  )
}

