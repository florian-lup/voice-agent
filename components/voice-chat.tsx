"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useElevenLabsOfficial } from "@/hooks/use-elevenlabs-official";
import {
  Mic,
  Phone,
  PhoneOff,
  Volume2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Radio,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  } = useElevenLabsOfficial({
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
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/tate_background.jpeg')"
      }}
    >
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
              {isConnected && isListening && !isProcessing && !isSpeaking && (
                <div className="flex items-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 60 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "0.8s",
                      }}
                    />
                  ))}
                </div>
              )}

              {isConnected && isSpeaking && !isProcessing && (
                <div className="flex items-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-destructive rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 60 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "0.6s",
                      }}
                    />
                  ))}
                </div>
              )}

              {!isConnected && (
                <div className="text-center">
                  <Radio className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click Connect to start</p>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium">AI is processing...</span>
                </div>
              )}

              {isConnected && !isListening && !isProcessing && !isSpeaking && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <span className="text-sm font-medium">Initializing microphone...</span>
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
              <Button
                onClick={handleConnect}
                variant="default"
                size="lg"
                className="min-w-[200px]"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Tate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
