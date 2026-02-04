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

    // Generate Frame HTML based on state
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://donny.vercel.app";
    const imageUrl = `${baseUrl}/api/frame/image?state=${roundState}`;

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="Donny - Tap-to-Earn for Good" />
  <meta property="og:description" content="Compete in 24h tap-to-earn rounds. 60% prizes, 40% charity donations on CELO." />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
`;

    if (roundState === "active_round" && roundInfo) {
      const hours = Math.floor(roundInfo.timeRemaining / 3600);
      const minutes = Math.floor((roundInfo.timeRemaining % 3600) / 60);
      const seconds = roundInfo.timeRemaining % 60;
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      html += `
  <meta property="fc:frame:button:1" content="Join & Tap (2 cUSD)" />
  <meta property="fc:frame:button:1:action" content="launch_frame" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}" />
  <meta property="fc:frame:button:2" content="View Leaderboard" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${baseUrl}/tapping" />
`;
    } else if (roundState === "round_finished") {
      html += `
  <meta property="fc:frame:button:1" content="View Results" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}/results" />
`;
    } else {
      html += `
  <meta property="fc:frame:button:1" content="Next Round Soon" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}" />
`;
    }

    html += `</head>
<body>
  <h1>Donny - Tap-to-Earn for Good</h1>
  ${roundState === "active_round" && roundInfo ? `
    <p>Prize Pool: ${roundInfo.prizePool} cUSD</p>
    <p>Players: ${roundInfo.totalEntries}</p>
    <p>Time Remaining: ${Math.floor(roundInfo.timeRemaining / 3600)}h ${Math.floor((roundInfo.timeRemaining % 3600) / 60)}m</p>
  ` : roundState === "round_finished" ? `
    <p>Round finished! Check results.</p>
  ` : `
    <p>No active round. Next round starting soon!</p>
  `}
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

