import { NextResponse } from "next/server";

/**
 * GET /api/elevenlabs/config
 * Returns the ElevenLabs configuration needed to start a session
 * This keeps the API key secure on the server side
 */
export async function GET() {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId) {
      return NextResponse.json(
        { error: "ElevenLabs Agent ID not configured" },
        { status: 500 }
      );
    }

    // Return configuration for client-side connection
    return NextResponse.json({
      agentId,
      apiKey, // The SDK needs this for authentication
    });
  } catch (error) {
    console.error("Error fetching ElevenLabs config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}
