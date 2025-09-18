"use client";

import React, { useState, useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
  isActive?: boolean; // Control whether to show streaming effect
}

export function StreamingText({ 
  text, 
  speed = 30, 
  onComplete,
  className = "",
  isActive = true
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    // If not active or text is empty, show full text immediately
    if (!isActive || !text) {
      setDisplayedText(text || "");
      setCurrentIndex(text?.length || 0);
      setIsComplete(true);
      return;
    }

    // Reset state when text changes
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
  }, [text, speed, isActive]);

  // Update displayed text when index changes
  useEffect(() => {
    setDisplayedText(text.slice(0, currentIndex));
  }, [currentIndex, text]);

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

  return (
    <span className={className}>
      {displayedText}
    </span>
  );
}
