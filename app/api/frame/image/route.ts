import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state") || "no_round";

  // For MVP, return a simple SVG image
  // In production, you'd generate a dynamic image with round data
  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FBCF5C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E6B43C;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad)"/>
  <text x="600" y="300" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">
    Donny - Tap to Earn for Good
  </text>
  <text x="600" y="400" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="white" opacity="0.9">
    ${state === "active_round" ? "Round Active - Join Now!" : state === "round_finished" ? "Round Finished" : "Next Round Soon"}
  </text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=30",
    },
  });
}



