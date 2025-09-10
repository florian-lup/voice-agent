"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useElevenLabsAPI } from "@/hooks/use-elevenlabs-official";
import { Mic, Phone, PhoneOff, Volume2, AlertCircle, CheckCircle } from "lucide-react";

export function VoiceChat() {
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [agentResponse, setAgentResponse] = useState<string>("");
  const [isListening, setIsListening] = useState(false);

  const {
    isConnected,
    isListening: isRecording,
    isProcessing,
    isSpeaking,
    connect,
    disconnect,
  } = useElevenLabsAPI({
    autoReconnect: true, // Enable auto-reconnect on unexpected disconnection
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    },
    onMessage: (message) => {
      // Update current transcript or response based on role
      if (message.role === "user") {
        setCurrentTranscript(message.content);
        setAgentResponse(""); // Clear agent response when user speaks
      } else if (message.role === "assistant") {
        setAgentResponse(message.content);
        setCurrentTranscript(""); // Clear user transcript when agent responds
      }
    },
  });

  // Pre-warm the API route on component mount
  useEffect(() => {
    // Pre-fetch config to warm up the serverless function
    fetch("/api/elevenlabs/config")
      .then(() => console.log("✅ API route pre-warmed"))
      .catch(() => console.log("Pre-warm failed, will retry on connect"));
  }, []);

  // Update listening state when connection changes
  useEffect(() => {
    setIsListening(isConnected && isRecording);
  }, [isConnected, isRecording]);

  const handleConnect = async () => {
    setError(null);
    await connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setCurrentTranscript("");
    setAgentResponse("");
    setIsListening(false);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-tate-responsive overflow-hidden">
      <Card className="w-full max-w-2xl shadow-2xl backdrop-blur-[2px] bg-card/60">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold">Andrew Tate</CardTitle>

          {/* Connection Status Badge */}
          <div className="flex justify-center mt-4 gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="px-4 py-1">
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
            {isConnected && isSpeaking && (
              <Badge variant="destructive" className="px-4 py-1 animate-pulse">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
            {isConnected && !isSpeaking && isListening && (
              <Badge variant="outline" className="px-4 py-1 animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Voice Visualization Area */}
          <div className="relative h-32 bg-secondary/10 rounded-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-1">
                {[...Array(7)].map((_, i) => {
                  // Determine the state and corresponding styles
                  let barColor = "bg-muted-foreground/30"; // Default idle state
                  let animationClass = "";
                  let animationDuration = "2s";
                  let barHeight = 40; // Default steady height for idle

                  if (isConnected && isListening && !isProcessing && !isSpeaking) {
                    // Listening state - blue animated bars
                    barColor = "bg-primary";
                    animationClass = "animate-pulse";
                    animationDuration = "0.8s";
                    barHeight = Math.random() * 60 + 20;
                  } else if (isConnected && isSpeaking && !isProcessing) {
                    // Speaking state - red animated bars
                    barColor = "bg-destructive";
                    animationClass = "animate-pulse";
                    animationDuration = "0.6s";
                    barHeight = Math.random() * 60 + 20;
                  } else if (isProcessing) {
                    // Processing state - subtle animation
                    barColor = "bg-primary/50";
                    animationClass = "animate-pulse";
                    animationDuration = "1.5s";
                    barHeight = 30 + (i % 2) * 20; // Alternating heights
                  } else if (isConnected && !isListening && !isProcessing && !isSpeaking) {
                    // Initializing state
                    barColor = "bg-primary/40";
                    animationClass = "animate-pulse";
                    animationDuration = "1s";
                    barHeight = 35;
                  } else {
                    // Default idle state (not connected) - subtle breathing effect
                    animationClass = "animate-pulse";
                    animationDuration = "3s";
                    // Create a wave pattern for idle state
                    const waveHeights = [30, 45, 55, 60, 55, 45, 30];
                    barHeight = waveHeights[i];
                  }

                  return (
                    <div
                      key={i}
                      className={`w-1 ${barColor} rounded-full transition-all duration-300 ${animationClass}`}
                      style={{
                        height: `${barHeight}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: animationDuration,
                      }}
                    />
                  );
                })}
              </div>

              {/* Overlay text for specific states */}
              {!isConnected && (
                <div className="absolute bottom-2 text-center">
                  <p className="text-xs text-muted-foreground">Ready to call Tate</p>
                </div>
              )}

              {isProcessing && (
                <div className="absolute top-2">
                  <span className="text-xs font-medium text-primary">Processing...</span>
                </div>
              )}

              {isConnected && !isListening && !isProcessing && !isSpeaking && (
                <div className="absolute top-2">
                  <span className="text-xs font-medium text-primary">Initializing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Transcript/Response Display */}
          {(currentTranscript || agentResponse) && (
            <div className="p-4 bg-secondary/10 rounded-lg min-h-[80px]">
              {currentTranscript && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    You said:
                  </p>
                  <p className="text-lg">{currentTranscript}</p>
                </div>
              )}

              {agentResponse && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    AI Response:
                  </p>
                  <p className="text-lg">{agentResponse}</p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/5 border border-destructive/10 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm text-destructive whitespace-pre-wrap">{error}</div>
              </div>
            </div>
          )}

          {/* Control Buttons - Connected State */}
          {isConnected && (
            <div className="flex flex-col items-center gap-4">
              {/* Disconnect Button */}
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Conversation
              </Button>
            </div>
          )}

          {/* Call Button */}
          {!isConnected && (
            <div className="flex flex-col items-center">
              <Button onClick={handleConnect} variant="default" size="lg" className="min-w-[200px]">
                <Phone className="h-5 w-5 mr-2" />
                Start Conversation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
