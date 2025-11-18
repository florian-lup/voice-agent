import { NextResponse } from "next/server";

// Use Edge Runtime for faster cold starts
export const runtime = "edge";

/**
 * GET /api/elevenlabs/config
 * Returns the ElevenLabs configuration needed to start a session
 * This keeps the API key secure on the server side
 */
export async function GET() {
  const startTime = Date.now();

  // Log request details (disabled to reduce log noise)
  // console.log("[API] Config request received", {
  //   timestamp: new Date().toISOString(),
  //   headers: {
  //     userAgent: request.headers.get("user-agent"),
  //     origin: request.headers.get("origin"),
  //     referer: request.headers.get("referer"),
  //   },
  // });

  try {
    // Time environment variable access
    const envStartTime = Date.now();
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const envDuration = Date.now() - envStartTime;

    // console.log("[API] Environment variables accessed", {
    //   duration: `${envDuration}ms`,
    //   hasAgentId: !!agentId,
    //   hasApiKey: !!apiKey,
    // });

    if (!agentId) {
      const errorDuration = Date.now() - startTime;
      console.error("[API] Missing agent ID", {
        totalDuration: `${errorDuration}ms`,
      });

      return NextResponse.json({ error: "ElevenLabs Agent ID not configured" }, { status: 500 });
    }

    // Prepare response
    const responseData = {
      agentId,
      apiKey, // The SDK needs this for authentication
    };

    const totalDuration = Date.now() - startTime;

    // Create response with timing headers
    const response = NextResponse.json(responseData);

    // Add server timing header for browser dev tools
    response.headers.set("Server-Timing", `total;dur=${totalDuration}, env;dur=${envDuration}`);

    // Add custom timing headers
    response.headers.set("X-Response-Time", `${totalDuration}ms`);

    // console.log("[API] Config response sent", {
    //   totalDuration: `${totalDuration}ms`,
    //   envDuration: `${envDuration}ms`,
    //   timestamp: new Date().toISOString(),
    // });

    return response;
  } catch (error) {
    const errorDuration = Date.now() - startTime;
    console.error("[API] Error fetching ElevenLabs config:", {
      error,
      totalDuration: `${errorDuration}ms`,
    });

    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
  }
}
