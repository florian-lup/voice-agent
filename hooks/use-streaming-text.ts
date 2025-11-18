"use client";

import { useState, useEffect, useRef } from "react";

interface UseStreamingTextOptions {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  onUpdate?: () => void;
}

export function useStreamingText({
  text,
  speed = 30,
  onComplete,
  onUpdate,
}: UseStreamingTextOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    // If text is empty, don't display anything
    if (!text) {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsComplete(true);
      return;
    }

    // Reset state when text changes and start streaming immediately
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
    hasCompletedRef.current = false;

    // Start streaming
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= text.length) {
          // Clear interval when complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Mark as complete
          setIsComplete(true);

          return text.length;
        }

        return nextIndex;
      });
    }, speed);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed]);

  // Update displayed text when index changes
  useEffect(() => {
    setDisplayedText(text.slice(0, currentIndex));
    // Notify parent of text update for scroll optimization
    if (onUpdate && currentIndex > 0 && currentIndex < text.length) {
      onUpdate();
    }
  }, [currentIndex, text, onUpdate]);

  // Handle completion callback - deferred to avoid render-phase state updates
  useEffect(() => {
    if (isComplete && !hasCompletedRef.current && onComplete) {
      hasCompletedRef.current = true;
      // Defer the callback to next tick to avoid render-phase state updates
      const timeoutId = setTimeout(() => {
        onComplete();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isComplete, onComplete]);

  return {
    displayedText,
    isComplete,
    isStreaming: !isComplete && currentIndex < text.length,
  };
}
