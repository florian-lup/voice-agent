"use client";

import React from "react";
import { useStreamingText } from "@/hooks/use-streaming-text";

interface StreamingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  onUpdate?: () => void; // Called when text updates during streaming
  className?: string;
  as?: React.ElementType; // Allow different HTML elements
}

export function StreamingText({ 
  text, 
  speed = 30, 
  onComplete,
  onUpdate,
  className = "",
  as: Element = "span"
}: StreamingTextProps) {
  const { displayedText } = useStreamingText({
    text,
    speed,
    onComplete,
    onUpdate,
  });

  return <Element className={className}>{displayedText}</Element>;
}
