"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useConversation } from "@elevenlabs/react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseElevenLabsOptions {
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
  autoReconnect?: boolean;
}

/**
 * Hook that uses the API route to securely fetch ElevenLabs configuration
 * This keeps API keys on the server side only
 */
export const useElevenLabsAPI = (options?: UseElevenLabsOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const keepAliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConnectionRef = useRef<{ agentId?: string; apiKey?: string }>({});

  // Use the official ElevenLabs React hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs");
      setIsConnected(true);
      setIsListening(true);
      options?.onConnectionChange?.(true);

      // Start keep-alive mechanism
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      keepAliveIntervalRef.current = setInterval(() => {
        if (conversation.status === "connected") {
          console.log("🔄 Sending keep-alive signal");
          conversation.sendUserActivity();
        }
      }, 30000);
    },
    onDisconnect: (disconnectionDetails?: any) => {
      console.log("🔌 Disconnected from ElevenLabs");

      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }

      setIsConnected(false);
      setIsListening(false);
      setIsProcessing(false);
      options?.onConnectionChange?.(false);

      // Auto-reconnect if enabled and it was an unexpected disconnection
      if (options?.autoReconnect && disconnectionDetails?.code === 1006) {
        console.log("🔄 Attempting to reconnect in 3 seconds...");
        reconnectTimeoutRef.current = setTimeout(() => {
          if (lastConnectionRef.current.agentId) {
            conversation
              .startSession(lastConnectionRef.current as any)
              .then((sessionId) => {
                console.log("✅ Reconnected successfully:", sessionId);
                setConversationId(sessionId);
              })
              .catch((error) => {
                console.error("❌ Reconnection failed:", error);
                options?.onError?.(new Error("Auto-reconnection failed"));
              });
          }
        }, 3000);
      }
    },
    onMessage: (message: any) => {
      console.log("📨 Message received:", message);

      // Handle agent responses
      if (message.type === "agent_response" && message.agent_response) {
        const agentMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: message.agent_response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMessage]);
        options?.onMessage?.(agentMessage);
      }

      // Handle text messages
      if (message.type === "text" && message.text) {
        const textMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: message.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, textMessage]);
        options?.onMessage?.(textMessage);
      }
    },
    onError: (error: any) => {
      console.error("❌ Conversation error:", error);
      const errorMessage = error?.message || error?.error || "Conversation error occurred";
      options?.onError?.(new Error(errorMessage));
    },
    onStatusChange: (status: any) => {
      console.log("📊 Status change:", status);
      if (status?.status === "thinking" || status?.status === "processing") {
        setIsProcessing(true);
      } else {
        setIsProcessing(false);
      }
    },
    onModeChange: (mode: any) => {
      console.log("🔄 Mode change:", mode);
      if (mode?.mode === "listening" || mode?.mode === "speaking") {
        setIsListening(mode.mode === "listening");
      }
    },
  });

  // Connect to ElevenLabs using API route for config
  const connect = useCallback(async () => {
    try {
      console.log("🔌 Fetching ElevenLabs configuration from API...");
      
      // Fetch configuration from API route (keeps API key secure)
      const response = await fetch("/api/elevenlabs/config");
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch configuration");
      }

      const config = await response.json();
      
      if (!config.agentId) {
        throw new Error("Agent ID not configured");
      }

      console.log("🔌 Connecting to ElevenLabs Agent...");
      console.log("Agent ID:", config.agentId);

      // Store connection config for potential reconnection
      lastConnectionRef.current = config;

      // Start session with the agent
      const sessionId = await conversation.startSession(config);

      setConversationId(sessionId);
      console.log("💬 Conversation started with session ID:", sessionId);
    } catch (error) {
      console.error("Failed to connect:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect to ElevenLabs";
      options?.onError?.(new Error(errorMessage));
    }
  }, [conversation, options]);

  // Disconnect from ElevenLabs
  const disconnect = useCallback(async () => {
    try {
      console.log("👋 Ending conversation...");

      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      await conversation.endSession();
      setConversationId(null);
      setMessages([]);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }, [conversation]);

  // Send text message
  const sendTextMessage = useCallback(
    (text: string) => {
      if (!isConnected) {
        console.error("Not connected to conversation");
        return;
      }

      console.log("📤 Sending text message:", text);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      options?.onMessage?.(userMessage);

      conversation.sendUserMessage(text);
    },
    [conversation, isConnected, options],
  );

  // Send contextual update
  const sendContextualUpdate = useCallback(
    (text: string) => {
      if (!isConnected) {
        console.error("Not connected to conversation");
        return;
      }

      console.log("📋 Sending contextual update:", text);
      conversation.sendContextualUpdate(text);
    },
    [conversation, isConnected],
  );

  // Control microphone mute
  const toggleMute = useCallback(() => {
    console.log("🎙️ Toggle mute - current state:", conversation.micMuted);
  }, [conversation.micMuted]);

  // Set volume
  const setVolume = useCallback(
    (volume: number) => {
      conversation.setVolume({ volume });
      console.log("🔊 Volume set to:", volume);
    },
    [conversation],
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Get conversation status
  const getStatus = () => conversation.status;

  // Check if agent is speaking
  const isSpeaking = conversation.isSpeaking;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isConnected,
    isListening,
    isProcessing,
    isSpeaking,
    messages,
    conversationId,
    status: conversation.status,
    canSendFeedback: conversation.canSendFeedback,
    micMuted: conversation.micMuted,

    // Actions
    connect,
    disconnect,
    sendTextMessage,
    sendContextualUpdate,
    toggleMute,
    setVolume,
    clearMessages,
    getStatus,

    // Audio analysis
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
    getInputByteFrequencyData: conversation.getInputByteFrequencyData,
    getOutputByteFrequencyData: conversation.getOutputByteFrequencyData,

    // Feedback
    sendFeedback: conversation.sendFeedback,
  };
};
