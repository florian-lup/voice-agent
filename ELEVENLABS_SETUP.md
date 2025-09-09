# ElevenLabs Voice Assistant Integration

This application integrates with the ElevenLabs Agent Platform to provide a voice-only AI assistant experience.

## Features

- 🎤 **Voice-Only Interface**: Press and hold to speak - no typing required
- 🔊 **Natural Voice Responses**: High-quality AI voice powered by ElevenLabs
- ⚡ **Real-time Interaction**: Low-latency voice conversation
- 📊 **Visual Feedback**: See transcriptions and responses
- 🎨 **Modern UI**: Clean, focused interface with dark mode support
- 🔌 **WebSocket Connection**: Stable real-time communication

## Prerequisites

1. An ElevenLabs account (free tier available)
2. A configured conversational agent on the ElevenLabs platform
3. Node.js 18+ and pnpm installed

## Setup Instructions

### 1. Get Your ElevenLabs Agent ID

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Create or select your conversational agent
3. Copy your Agent ID from the agent settings

### 2. Configure the Application

There are two ways to configure your credentials:

#### Option A: Environment Variables (Recommended)

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here  # Optional, for authenticated access
```

#### Option B: Direct Configuration

Edit `lib/elevenlabs-config.ts` and replace the placeholder values:

```typescript
export const elevenLabsConfig = {
  agentId: "your_agent_id_here",
  apiKey: "your_api_key_here", // Optional
  // ... other settings
};
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Launch Voice Chat" on the home page
2. Click "Connect" to establish connection with your ElevenLabs agent
3. Use the microphone button to record voice messages, or type in the text input
4. Your agent will respond with both text and voice

## Architecture

### Real-time Conversation API

This application uses the **ElevenLabs Real-time Conversation API** which provides:

- **WebSocket endpoint**: `wss://api.elevenlabs.io/v1/convai/conversation`
- **Bidirectional audio streaming**: Send voice input and receive AI responses in real-time
- **Agent-based processing**: Your configured agent handles all conversation logic
- **Low-latency communication**: Optimized for natural voice conversations

### Components

- **`components/voice-chat.tsx`**: Voice-only UI with press-to-talk interface
- **`hooks/use-elevenlabs-agent.ts`**: WebSocket connection and real-time audio streaming
- **`lib/elevenlabs-config.ts`**: Configuration for your ElevenLabs agent
- **`app/voice-chat/page.tsx`**: Voice assistant page

### How It Works

1. **WebSocket Connection**: Persistent connection to ElevenLabs real-time API
2. **Audio Streaming**:
   - Captures audio at 16kHz sample rate (optimal for ElevenLabs)
   - Streams audio chunks every 50ms for minimal latency
   - Sends as base64-encoded chunks via WebSocket
3. **Agent Processing**: Your ElevenLabs agent processes voice input and generates responses
4. **Response Streaming**:
   - Receives audio chunks from the agent
   - Queues and plays audio seamlessly using Web Audio API
   - Displays transcriptions in real-time

## Customization

### Voice Settings

Modify voice settings in `lib/elevenlabs-config.ts`:

```typescript
voiceSettings: {
  stability: 0.5,        // Voice consistency (0-1)
  similarity_boost: 0.75, // Voice clarity (0-1)
}
```

### UI Theming

The app uses shadcn/ui components which can be customized via:

- `app/globals.css` for global styles
- `tailwind.config.ts` for theme configuration
- Individual component styling in `components/ui/`

## API Reference

### useElevenLabsAgent Hook

```typescript
const {
  isConnected, // Connection status
  isRecording, // Recording status
  isProcessing, // Agent processing status
  messages, // Conversation history
  connect, // Connect to agent
  disconnect, // Disconnect from agent
  startRecording, // Start voice recording
  stopRecording, // Stop voice recording
  sendTextMessage, // Send text message
  clearMessages, // Clear conversation
} = useElevenLabsAgent(options);
```

## Troubleshooting

### Common Issues

1. **"Invalid ElevenLabs configuration"**
   - Ensure your Agent ID is correctly set in the configuration
   - Check that the agent exists and is active in your ElevenLabs dashboard

2. **Microphone not working**
   - Ensure your browser has microphone permissions
   - Check that your microphone is properly connected and selected

3. **No audio playback**
   - Check your browser's audio permissions
   - Ensure your system audio is not muted

4. **WebSocket connection failed**
   - Verify your internet connection
   - Check if your firewall allows WebSocket connections
   - Ensure your Agent ID is valid

## Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs/agents-platform/overview)
- [Agent Platform Dashboard](https://elevenlabs.io/app/conversational-ai)
- [API Reference](https://elevenlabs.io/docs/api-reference/websockets)

## Support

For issues related to:

- This integration: Create an issue in this repository
- ElevenLabs platform: Contact [ElevenLabs Support](https://help.elevenlabs.io/)

## License

This integration is provided as-is for use with the ElevenLabs platform.
