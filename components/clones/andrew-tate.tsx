"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Volume2, AlertCircle, Loader2 } from "lucide-react";
import { Header } from "./header";

interface AndrewTateUIProps {
  // Connection state
  isConnected: boolean;
  isListening: boolean;
  isUserSpeaking: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  
  // Data
  error: string | null;
  agentResponse: string;
  
  // Handlers
  onConnect: () => void;
  onDisconnect: () => void;
  
  // Button ref for optimization
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function AndrewTateUI({
  isConnected,
  isListening,
  isUserSpeaking,
  isConnecting,
  isSpeaking,
  error,
  agentResponse,
  onConnect,
  onDisconnect,
  buttonRef,
}: AndrewTateUIProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect for tracking connection duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isConnected) {
      // Start timer when connected
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Reset timer when disconnected
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected]);

  // Format elapsed time as mm:ss
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header 
        isConnected={isConnected}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Voice Visualization Area - At the top */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="relative h-60 rounded-xl overflow-hidden backdrop-blur-[2px] bg-secondary/10">
            {/* Background image - static, no animation */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/andrew-tate.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            
            {/* Animated border overlay */}
            <div 
              className={`absolute inset-0 rounded-xl border-4 transition-all duration-300 ${
                (() => {
                  if (!isConnected) {
                    // Always show gray border when disconnected
                    return "border-gray-700 animate-pulse";
                  } else if (isUserSpeaking) {
                    // User actively speaking - blue animated border
                    return "border-blue-400 animate-pulse";
                  } else if (isSpeaking) {
                    // Speaking state - green animated border (AI speaking)
                    return "border-green-400 animate-pulse";
                  } else {
                    // Default state (idle/just listening) - subtle gray border
                    return "border-gray-700 animate-pulse";
                  }
                })()
              }`}
              style={{
                animationDuration: (() => {
                  if (!isConnected) {
                    return "3s";
                  } else if (isUserSpeaking) {
                    return "0.8s";
                  } else if (isSpeaking) {
                    return "0.8s";
                  } else {
                    return "3s";
                  }
                })()
              }}
            ></div>
          </div>
        </div>

        {/* Card Container - Centered in remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl shadow-2xl backdrop-blur-[2px] bg-card/60">
            <CardContent className="space-y-6 pb-8 pt-8">
            {/* Current Response Display */}
            {agentResponse && (
              <div className="p-4 bg-secondary/10 rounded-lg min-h-[80px]">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    AI Response:
                  </p>
                  <p className="text-lg">{agentResponse}</p>
                </div>
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
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons - Fixed at Bottom */}
        <div className="flex flex-col items-center gap-3 pb-4">
          {/* Timer - Reserve space to prevent layout shift */}
          <div className={`text-sm font-mono px-3 py-2 rounded-md transition-opacity duration-200 ${
            isConnected 
              ? "text-muted-foreground bg-secondary/20 opacity-100" 
              : "text-transparent opacity-0"
          }`}>
            {isConnected ? formatElapsedTime(elapsedSeconds) : "00:00"}
          </div>

          {/* Buttons */}
          {isConnected && (
            <Button
              onClick={onDisconnect}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              End Conversation
            </Button>
          )}

          {!isConnected && (
            <Button 
              ref={buttonRef}
              onClick={onConnect} 
              variant="default" 
              size="lg" 
              className="min-w-[200px]"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Calling...
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5 mr-2" />
                  Start Conversation
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
