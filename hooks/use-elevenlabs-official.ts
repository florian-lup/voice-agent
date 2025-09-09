"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { elevenLabsConfig, validateConfig } from "@/lib/elevenlabs-config";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseElevenLabsOfficialOptions {
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
  autoReconnect?: boolean; // Enable auto-reconnect on unexpected disconnection
}

export const useElevenLabsOfficial = (options?: UseElevenLabsOfficialOptions) => {
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
      console.log("✅ Connected to ElevenLabs via official SDK");
      setIsConnected(true);
      setIsListening(true); // Auto-start listening for hands-free mode
      options?.onConnectionChange?.(true);

      // Start keep-alive mechanism to prevent idle timeout
      // Send user activity signal every 30 seconds
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      keepAliveIntervalRef.current = setInterval(() => {
        if (conversation.status === "connected") {
          console.log("🔄 Sending keep-alive signal");
          conversation.sendUserActivity(); // Signal that user is still present
        }
      }, 30000); // Every 30 seconds
    },
    onDisconnect: (disconnectionDetails?: any) => {
      console.log("🔌 Disconnected from ElevenLabs");

      // Log disconnection reason
      if (disconnectionDetails) {
        console.log("Disconnection details:", disconnectionDetails);
        if (disconnectionDetails.code === 1000) {
          console.log("Normal closure");
        } else if (disconnectionDetails.code === 1001) {
          console.log("Going away - page closed or navigated away");
        } else if (disconnectionDetails.code === 1006) {
          console.log("Abnormal closure - possible timeout or network issue");
          console.log("💡 Tip: The connection may have timed out due to inactivity");
        } else if (disconnectionDetails.code === 1008) {
          console.log("Policy violation");
        } else if (disconnectionDetails.code === 1011) {
          console.log("Server error");
        }
      }

      // Clear keep-alive interval
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
          console.log("🔄 Reconnecting...");
          // Reconnect with last used configuration
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

      // Handle user transcripts
      if (message.type === "user_transcript" && message.user_transcript) {
        console.log("📝 User said:", message.user_transcript);
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: message.user_transcript,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        options?.onMessage?.(userMessage);
      }

      // Handle agent responses
      if (message.type === "agent_response" && message.agent_response) {
        console.log("🤖 Agent said:", message.agent_response);
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
        console.log("💬 Text message:", message.text);
        // Determine role based on context or default to assistant
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

      // Update processing state based on status
      if (status?.status === "thinking" || status?.status === "processing") {
        setIsProcessing(true);
      } else {
        setIsProcessing(false);
      }
    },
    onModeChange: (mode: any) => {
      console.log("🔄 Mode change:", mode);

      // Update listening state based on mode
      if (mode?.mode === "listening" || mode?.mode === "speaking") {
        setIsListening(mode.mode === "listening");
      }
    },
    onDebug: (debug: any) => {
      console.log("🐛 Debug:", debug);
    },
  });

  // Connect to ElevenLabs
  const connect = useCallback(async () => {
    if (!validateConfig()) {
      const error = new Error(
        "Invalid ElevenLabs configuration. Please set your Agent ID in lib/elevenlabs-config.ts",
      );
      console.error(error.message);
      options?.onError?.(error);
      return;
    }

    try {
      console.log("🔌 Connecting to ElevenLabs Agent...");
      console.log("Agent ID:", elevenLabsConfig.agentId);

      // Store connection config for potential reconnection
      lastConnectionRef.current = {
        agentId: elevenLabsConfig.agentId,
        ...(elevenLabsConfig.apiKey && { apiKey: elevenLabsConfig.apiKey }),
      };

      // Start session with the agent
      const sessionId = await conversation.startSession(lastConnectionRef.current as any); // The SDK types are complex, using any for now

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

      // Clear intervals and timeouts before disconnecting
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

      // Add user message to local state immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      options?.onMessage?.(userMessage);

      // Send via SDK
      conversation.sendUserMessage(text);
    },
    [conversation, isConnected, options],
  );

  // Send contextual update (for context without showing in UI)
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
    // The SDK handles muting internally based on the micMuted prop
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
      // Clear all intervals and timeouts on unmount
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

    // Audio analysis (for visualizations)
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
    getInputByteFrequencyData: conversation.getInputByteFrequencyData,
    getOutputByteFrequencyData: conversation.getOutputByteFrequencyData,

    // Feedback
    sendFeedback: conversation.sendFeedback,
  };
};
