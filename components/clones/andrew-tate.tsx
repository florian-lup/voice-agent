"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "./header";
import { type Message } from "@/hooks/use-elevenlabs-official";
import { StreamingText } from "@/components/streaming-text";
import Image from "next/image";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Smooth scroll to bottom function
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track if user has manually scrolled up
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
  };

  // Handle streaming text scroll optimization
  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    let animationFrameId: number;
    let lastContentHeight = container.scrollHeight;


    // Check for content height changes (during streaming)
    const checkContentChanges = () => {
      const currentHeight = container.scrollHeight;
      if (currentHeight !== lastContentHeight) {
        lastContentHeight = currentHeight;
        if (isStreamingActive && isNearBottom()) {
          scrollToBottom("auto");
        }
      }
      // Continue checking while streaming
      if (isStreamingActive) {
        animationFrameId = requestAnimationFrame(checkContentChanges);
      }
    };

    // Start monitoring when streaming begins
    if (isStreamingActive) {
      checkContentChanges();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isStreamingActive]);

  // Detect streaming activity based on isSpeaking state
  useEffect(() => {
    setIsStreamingActive(isSpeaking);
  }, [isSpeaking]);


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



  return (
    <div className="min-h-dvh h-dvh flex flex-col overflow-hidden">
      {/* Header */}
      <Header 
        isConnected={isConnected}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isConnecting={isConnecting}
        elapsedSeconds={elapsedSeconds}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        buttonRef={buttonRef}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 pt-20 overflow-hidden">
        {/* Voice Visualization Area - At the top */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="relative rounded-xl overflow-hidden backdrop-blur-[2px] bg-secondary/10 flex items-center p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Left side - Avatar, Counter and Name */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 z-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Image
                  src="/mr-mime-avatar.svg"
                  alt="Mr. Mime Avatar"
                  width={120}
                  height={120}
                  priority
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-30 xl:h-30 rounded-lg"
                />
              </div>
              
              {/* Counter and name */}
              <div className="flex flex-col justify-center">
                {/* Counter */}
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-mono font-bold mb-1 sm:mb-2">
                  {(() => {
                    const mins = Math.floor(elapsedSeconds / 60);
                    const secs = elapsedSeconds % 60;
                    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                  })()}
                </div>
                
                {/* Mr. Mime text */}
                <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-muted-foreground">
                  Mr. Mime
                </div>
              </div>
            </div>

            {/* Right side - Waveform */}
            <div className="flex-1 flex items-center justify-end pr-4 sm:pr-6 md:pr-8 z-10">
              <div className="flex items-center gap-1 h-16 sm:h-20 md:h-24">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 sm:w-1.5 md:w-2 rounded-full transition-all duration-300 ${
                      (() => {
                        if (!isConnected) {
                          // Disconnected - minimal static bars
                          return "h-2 bg-gray-400";
                        } else if (isUserSpeaking) {
                          // User speaking - blue wave pattern
                          const heights = ["h-4", "h-6", "h-8", "h-10", "h-12", "h-12", "h-12", "h-10", "h-8", "h-6", "h-4", "h-3"];
                          return `${heights[i]} bg-blue-400 animate-pulse`;
                        } else if (isSpeaking) {
                          // AI speaking - green wave pattern
                          const heights = ["h-3", "h-5", "h-7", "h-9", "h-12", "h-14", "h-14", "h-12", "h-9", "h-7", "h-5", "h-3"];
                          return `${heights[i]} bg-green-400 animate-pulse`;
                        } else {
                          // Connected but idle - gentle wave pattern
                          const heights = ["h-2", "h-3", "h-5", "h-6", "h-8", "h-8", "h-8", "h-6", "h-5", "h-3", "h-2", "h-2"];
                          return `${heights[i]} bg-primary/50 animate-pulse`;
                        }
                      })()
                    }`}
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animationDuration: (() => {
                        if (!isConnected) return "3s";
                        if (isUserSpeaking || isSpeaking) return "0.8s";
                        return "2s";
                      })()
                    }}
                  ></div>
                ))}
              </div>
            </div>

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
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-2 space-y-4"
          >
            {messages.length > 0 && (
              <>
                {messages.map((message) => (
                  <div key={message.id} className="w-full">
                    {message.role === "assistant" ? (
                      <StreamingText
                        text={message.content}
                        speed={45}
                        className="text-3xl whitespace-pre-wrap w-full"
                        onUpdate={() => {
                          // Trigger scroll when streaming text updates
                          if (isNearBottom()) {
                            scrollToBottom("auto");
                          }
                        }}
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

    </div>
  );
}
