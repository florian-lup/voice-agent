// ElevenLabs Configuration
// Replace these with your actual ElevenLabs credentials
// You can get these from your ElevenLabs dashboard

export const elevenLabsConfig = {
  // Your ElevenLabs Agent ID
  // Get this from: https://elevenlabs.io/app/conversational-ai
  // Format: Should be a UUID like "abc123de-4567-89fg-hij0-123456789012"
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "your_agent_id_here",

  // Your ElevenLabs API Key (optional, for authenticated access)
  // Get this from: https://elevenlabs.io/app/settings/api-keys
  // Leave empty for public agents that don't require authentication
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",

  // WebSocket URL for the conversational AI
  // Default URL for ElevenLabs conversational AI WebSocket endpoint
  wsUrl:
    process.env.NEXT_PUBLIC_ELEVENLABS_WS_URL || "wss://api.elevenlabs.io/v1/convai/conversation",
};

// Validate configuration
export const validateConfig = () => {
  if (!elevenLabsConfig.agentId || elevenLabsConfig.agentId === "your_agent_id_here") {
    console.error("❌ ElevenLabs Agent ID is not configured!");
    console.log("Please follow these steps:");
    console.log("1. Go to https://elevenlabs.io/app/conversational-ai");
    console.log("2. Create or select your agent");
    console.log("3. Copy the Agent ID");
    console.log("4. Either:");
    console.log(
      "   a) Create a .env.local file with: NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id",
    );
    console.log("   b) Update the agentId in lib/elevenlabs-config.ts directly");
    return false;
  }

  console.log("✅ ElevenLabs configuration validated");
  console.log("Agent ID:", elevenLabsConfig.agentId.substring(0, 8) + "...");

  if (elevenLabsConfig.apiKey) {
    console.log("API Key: Configured (using authenticated access)");
  } else {
    console.log("API Key: Not configured (using public access)");
  }

  return true;
};
