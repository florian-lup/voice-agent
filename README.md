# AI Voice Agent

A real-time voice conversation app powered by ElevenLabs AI agents. Talk naturally with AI using voice cloning and speech recognition.

## Features

- **Real-time voice conversations** with ElevenLabs AI agents
- **Voice activity detection** and input volume monitoring
- **Performance optimized** with API pre-warming and connection optimization
- **Modern UI** built with Next.js, React, and Tailwind CSS

## Getting Started

1. **Clone and install:**

   ```bash
   git clone <your-repo>
   cd voice-agent
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   # .env.local
   ELEVENLABS_API_KEY=your_api_key
   ELEVENLABS_AGENT_ID=your_agent_id
   ```

3. **Run the development server:**

   ```bash
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** and start talking!

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Voice API:** ElevenLabs React SDK
- **UI:** Radix UI + Tailwind CSS
- **Language:** TypeScript
