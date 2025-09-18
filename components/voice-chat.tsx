"use client";

import React, { useState, useEffect, useRef } from "react";
import { useElevenLabsAPI } from "@/hooks/use-elevenlabs-official";
import { perfLogger } from "@/lib/performance-logger";
import { useConnectionOptimizer, usePreWarmTriggers } from "@/hooks/use-connection-optimizer";
import { AndrewTateUI } from "@/components/clones/andrew-tate";

export function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { preWarmConnection } = useConnectionOptimizer({
    preWarmOnHover: true,
    cacheConfig: true,
    prefetchDNS: true,
  });

  const {
    isConnected,
    isListening: isRecording,
    isProcessing,
    isSpeaking,
    messages,
    connect,
    disconnect,
    getInputVolume,
  } = useElevenLabsAPI({
    autoReconnect: true, // Enable auto-reconnect on unexpected disconnection
    onMessage: (message) => {
      console.log("🎯 VoiceChat received message:", message);
      // Update agent response based on role
      if (message.role === "assistant") {
        console.log("🎯 Setting agent response:", message.content);
        setIsUserSpeaking(false); // Ensure user speaking state is cleared
      }
    },
  });

  // Use pre-warm triggers on the button
  usePreWarmTriggers(buttonRef as React.RefObject<HTMLElement>, preWarmConnection);

  // Pre-warm the API route on component mount
  useEffect(() => {
    const preWarm = async () => {
      perfLogger.mark("pre_warming_start", {
        timestamp: new Date().toISOString(),
      });
      
      try {
        // Pre-fetch config to warm up the serverless function
        const startTime = performance.now();
        const response = await fetch("/api/elevenlabs/config", {
          // Use priority hints if supported
          priority: "high",
        } as RequestInit);
        const endTime = performance.now();
        
        if (response.ok) {
          const warmUpTime = endTime - startTime;
          console.log(`✅ API route pre-warmed in ${warmUpTime.toFixed(2)}ms`);
          
          // If cold start detected (>500ms), warm it again
          if (warmUpTime > 500) {
            console.log("🔄 Cold start detected, warming again...");
            setTimeout(() => {
              fetch("/api/elevenlabs/config").catch(() => {});
            }, 100);
          }
        }
      } catch {
        console.log("Pre-warm failed, will retry on connect");
      }
      
      perfLogger.mark("pre_warming_end", {
        timestamp: new Date().toISOString(),
      });
    };
    
    // Start pre-warming immediately
    preWarm();
    
    // Also pre-warm on visibility change (when tab becomes active)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetch("/api/elevenlabs/config").catch(() => {});
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Update listening state when connection changes
  useEffect(() => {
    setIsListening(isConnected && isRecording);
    // Clear connecting state when connected
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected, isRecording]);

  // Monitor input volume to detect when user is actively speaking
  useEffect(() => {
    if (!isConnected || !isRecording || isSpeaking || isProcessing) {
      setIsUserSpeaking(false);
      return;
    }

    const interval = setInterval(() => {
      if (getInputVolume) {
        const volume = getInputVolume();
        // Threshold for detecting speech (adjust as needed)
        const speechThreshold = 0.01;
        setIsUserSpeaking(volume > speechThreshold);
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [isConnected, isRecording, isSpeaking, isProcessing, getInputVolume]);

  const handleConnect = async () => {
    perfLogger.mark("button_clicked", {
      timestamp: new Date().toISOString(),
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    });
    
    setIsConnecting(true);
    try {
      await connect();
    } catch (err) {
      setIsConnecting(false);
      console.error("Failed to connect:", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsListening(false);
  };

  console.log("🔍 VoiceChat passing messages to AndrewTateUI:", messages);
  
  return (
    <AndrewTateUI
      isConnected={isConnected}
      isListening={isListening}
      isUserSpeaking={isUserSpeaking}
      isConnecting={isConnecting}
      isSpeaking={isSpeaking}
      messages={messages}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      buttonRef={buttonRef}
    />
  );
}
