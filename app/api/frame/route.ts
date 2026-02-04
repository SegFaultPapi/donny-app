import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { celoAlfajores } from "viem/chains";
import { DONNY_GAME_ADDRESS, DONNY_GAME_ABI } from "@/lib/contracts";

// Initialize public client for reading contract state
const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http("https://alfajores-forno.celo-testnet.org"),
});

export async function GET(request: NextRequest) {
  try {
    // Read round info from contract
    let roundInfo = null;
    let roundState = "no_round";

    if (DONNY_GAME_ADDRESS && DONNY_GAME_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      try {
        const result = await publicClient.readContract({
          address: DONNY_GAME_ADDRESS as `0x${string}`,
          abi: DONNY_GAME_ABI,
          functionName: "getRoundInfo",
        });

        const [startTime, endTime, prizePool, donationPool, totalEntries, isActive, isSettled] = result as [
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
          boolean,
          boolean,
        ];

        const now = BigInt(Math.floor(Date.now() / 1000));
        const timeRemaining = endTime > now ? Number(endTime - now) : 0;

        roundInfo = {
          startTime: Number(startTime),
          endTime: Number(endTime),
          prizePool: formatEther(prizePool),
          donationPool: formatEther(donationPool),
          totalEntries: Number(totalEntries),
          isActive,
          isSettled,
          timeRemaining,
        };

        if (isSettled) {
          roundState = "round_finished";
        } else if (isActive && timeRemaining > 0) {
          roundState = "active_round";
        } else if (startTime === 0) {
          roundState = "no_round";
        } else {
          roundState = "round_finished";
        }
      } catch (error) {
        console.error("Error reading contract:", error);
        roundState = "no_round";
      }
    }

    // Generate Open Graph HTML for embeds and social sharing
    // Note: Mini Apps don't use Frame endpoints, but this is useful for OG tags
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://donny-app-rosy.vercel.app";
    const imageUrl = `${baseUrl}/api/frame/image?state=${roundState}`;

    // Build description based on round state
    let description = "Compete in 24h tap-to-earn rounds. 60% prizes, 40% charity donations on CELO.";
    if (roundState === "active_round" && roundInfo) {
      const hours = Math.floor(roundInfo.timeRemaining / 3600);
      const minutes = Math.floor((roundInfo.timeRemaining % 3600) / 60);
      description = `Active round! Prize Pool: ${roundInfo.prizePool} cUSD | ${roundInfo.totalEntries} players | ${hours}h ${minutes}m remaining`;
    } else if (roundState === "round_finished") {
      description = "Round finished! Check results and see who won.";
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Donny - Tap-to-Earn for Good</title>
  <meta property="og:title" content="Donny - Tap-to-Earn for Good" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${baseUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Donny - Tap-to-Earn for Good" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <!-- Mini App meta tag -->
  <meta property="fc:miniapp" content="${baseUrl}" />
  <meta http-equiv="refresh" content="0; url=${baseUrl}" />
</head>
<body>
  <h1>Donny - Tap-to-Earn for Good</h1>
  <p>${description}</p>
  <p><a href="${baseUrl}">Open Mini App</a></p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Frame error:", error);
    return new NextResponse("Error generating frame", { status: 500 });
  }
}

