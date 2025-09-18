"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Volume2, Mic } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

export function Header({ isConnected, isSpeaking }: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between p-4">
      {/* Left side - Logo and Title */}
      <div className="flex items-center gap-3">
        <Image
          src="/mr-mime-logo.svg"
          alt="Mr. Mime Logo"
          width={40}
          height={40}
          className="w-10 h-10"
        />
        <h1 className="text-2xl font-bold">Andrew Tate</h1>
      </div>

      {/* Right side - Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={(() => {
            if (!isConnected) return "secondary";
            return "outline"; // Use outline as base for custom colors
          })()} 
          className={`px-4 py-1 ${(() => {
            if (!isConnected) return "";
            if (isSpeaking) return "animate-pulse bg-green-400 text-white border-green-400";
            return "animate-pulse bg-blue-400 text-white border-blue-400";
          })()}`}
        >
          {(() => {
            if (!isConnected) {
              return (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              );
            } else if (isSpeaking) {
              return (
                <>
                  <Volume2 className="h-3 w-3 mr-1" />
                  Speaking
                </>
              );
            } else {
              return (
                <>
                  <Mic className="h-3 w-3 mr-1" />
                  Listening
                </>
              );
            }
          })()}
        </Badge>
      </div>
    </div>
  );
}
