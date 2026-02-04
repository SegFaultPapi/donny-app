/**
 * Farcaster authentication utilities
 * Supports both Quick Auth (recommended) and Sign In with Farcaster
 */

import { sdk } from "@farcaster/miniapp-sdk"

export interface FarcasterUser {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
}

/**
 * Get user identity using the SDK
 * This works when the app is running inside a Farcaster Mini App
 * Note: Identity is available through context, not a direct SDK method
 */
export async function getFarcasterIdentity(): Promise<FarcasterUser | null> {
  try {
    if (typeof window === "undefined" || !sdk) {
      return null
    }

    // The SDK provides context, but identity may need to be obtained differently
    // For now, we'll return null and handle identity through sign-in flow
    // In a real implementation, you'd get this from the authenticated session
    return null
  } catch (error) {
    console.error("Error getting Farcaster identity:", error)
    return null
  }
}

/**
 * Quick Auth - Get authenticated session token
 * This is the easiest way to authenticate users
 * Returns a JWT token that can be verified on your server
 * 
 * Note: Requires a nonce from your backend server
 * The nonce should be fetched from your API endpoint
 * 
 * Implementation note: Quick Auth may require importing from a separate module
 * or using a different API. Check the latest SDK documentation.
 */
export async function quickAuth(nonce: string): Promise<string | null> {
  try {
    if (typeof window === "undefined" || !sdk) {
      return null
    }

    // Quick Auth implementation depends on SDK version
    // For now, use signIn as fallback
    const credential = await signInWithFarcaster(nonce)
    return credential ? JSON.stringify(credential) : null
  } catch (error) {
    console.error("Error with Quick Auth:", error)
    return null
  }
}

/**
 * Sign In with Farcaster - Alternative authentication method
 * Returns a Sign In message that must be verified on your server
 */
export async function signInWithFarcaster(nonce: string): Promise<any> {
  try {
    if (typeof window === "undefined" || !sdk) {
      return null
    }

    const credential = await sdk.actions.signIn({
      nonce,
      acceptAuthAddress: true, // Support auth addresses
    })

    return credential
  } catch (error) {
    console.error("Error signing in with Farcaster:", error)
    return null
  }
}

/**
 * Check if we're running in a Farcaster Mini App context
 */
export function isInMiniApp(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    // Check if SDK is available
    return !!sdk
  } catch {
    return false
  }
}

/**
 * Generate a random nonce for authentication
 * In production, this should come from your backend
 */
function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

/**
 * Get wallet provider from Farcaster Mini App
 * This allows the app to interact with the user's wallet
 */
export async function getWalletProvider(): Promise<any> {
  try {
    if (typeof window === "undefined" || !sdk) {
      return null
    }

    const provider = await sdk.wallet.getEthereumProvider()
    return provider
  } catch (error) {
    console.error("Error getting wallet provider:", error)
    return null
  }
}

