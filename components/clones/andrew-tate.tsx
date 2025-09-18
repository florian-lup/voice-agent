"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Loader2 } from "lucide-react";
import { Header } from "./header";
import { type Message } from "@/hooks/use-elevenlabs-official";
import { StreamingText } from "@/components/ui/streaming-text";

interface AndrewTateUIProps {
  // Connection state
  isConnected: boolean;
  isListening: boolean;
  isUserSpeaking: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  
  // Data
  messages: Message[];
  
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
  messages,
  onConnect,
  onDisconnect,
  buttonRef,
}: AndrewTateUIProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [streamingMessageIds, setStreamingMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track new messages for streaming effect
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      // Only stream assistant messages (not user messages)
      if (latestMessage.role === "assistant") {
        setStreamingMessageIds((prev) => {
          if (!prev.has(latestMessage.id)) {
            return new Set(prev).add(latestMessage.id);
          }
          return prev; // Return same set if message already exists
        });
      }
    } else {
      // Clear streaming state when messages are cleared
      setStreamingMessageIds(new Set());
    }
  }, [messages]);

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

  // Handle streaming completion
  const handleStreamComplete = (messageId: string) => {
    setStreamingMessageIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <Header 
        isConnected={isConnected}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 pt-20 overflow-hidden">
        {/* Voice Visualization Area - At the top */}
        <div className="w-full max-w-4xl mx-auto mb-6">
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

        {/* Messages Section */}
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-2 pb-24 space-y-4">
            {messages.length > 0 && (
              <>
                {messages.map((message) => (
                  <div key={message.id} className="w-full">
                    {message.role === "assistant" && streamingMessageIds.has(message.id) ? (
                      <StreamingText
                        text={message.content}
                        speed={20}
                        className="text-3xl whitespace-pre-wrap w-full"
                        isActive={true}
                        onComplete={() => handleStreamComplete(message.id)}
                      />
                    ) : (
                      <p className="text-3xl whitespace-pre-wrap w-full">{message.content}</p>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Control Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        {/* Buttons */}
        {isConnected && (
          <Button
            onClick={onDisconnect}
            variant="outline"
            size="lg"
            className="min-w-[200px] shadow-2xl backdrop-blur-sm bg-background/90 border-2"
          >
            <span className="font-mono mr-2">{formatElapsedTime(elapsedSeconds)}</span>
            End Conversation
          </Button>
        )}

        {!isConnected && (
          <Button 
            ref={buttonRef}
            onClick={onConnect} 
            variant="default" 
            size="lg" 
            className="min-w-[200px] shadow-2xl backdrop-blur-sm"
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
  );
}
