import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mic, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-background text-foreground">
      {/* Theme toggle in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="flex flex-col gap-8 row-start-2 items-center max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            Powered by ElevenLabs
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Voice AI Assistant</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Speak naturally with your AI agent - no typing required
          </p>
        </div>

        {/* Main CTA */}
        <Card className="w-full max-w-2xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Mic className="h-6 w-6" />
              Start Talking
            </CardTitle>
            <CardDescription>Connect to your ElevenLabs voice assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/voice-chat">
                <Mic className="mr-2 h-5 w-5" />
                Launch Voice Assistant
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Mic className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Voice Only</h3>
                <p className="text-sm text-muted-foreground">
                  No typing needed - just press and speak
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Instant Response</h3>
                <p className="text-sm text-muted-foreground">Real-time AI voice responses</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Natural Voice</h3>
                <p className="text-sm text-muted-foreground">
                  Human-like voice powered by ElevenLabs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Quick Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Get your Agent ID from{" "}
                <a
                  href="https://elevenlabs.io/app/conversational-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ElevenLabs Dashboard
                </a>
              </li>
              <li>
                Update the configuration in{" "}
                <Badge variant="outline" className="font-mono">
                  lib/elevenlabs-config.ts
                </Badge>
              </li>
              <li>Click &quot;Launch Voice Assistant&quot; and press-and-hold the mic to speak</li>
            </ol>
          </CardContent>
        </Card>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center border-t border-border pt-6 mt-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-auto p-2"
        >
          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
              className="opacity-70"
            />
            Learn
          </a>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-auto p-2"
        >
          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
              className="opacity-70"
            />
            Examples
          </a>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-auto p-2"
        >
          <a
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
              className="opacity-70"
            />
            Go to nextjs.org →
          </a>
        </Button>
      </footer>
    </div>
  );
}
