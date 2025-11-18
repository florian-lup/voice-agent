"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Volume2, Mic, Phone, Loader2, PhoneOff } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isConnecting: boolean;
  elapsedSeconds: number;
  onConnect: () => void;
  onDisconnect: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function Header({
  isConnected,
  isSpeaking,
  isConnecting,
  onConnect,
  onDisconnect,
  buttonRef,
}: HeaderProps) {
  // Format elapsed time as mm:ss

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between p-4">
      {/* Left side - Status Badge */}
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

      {/* Right side - Control Button */}
      <div className="flex items-center">
        {isConnected && (
          <Button onClick={onDisconnect} variant="destructive" size="sm">
            <PhoneOff />
          </Button>
        )}

        {!isConnected && (
          <Button
            ref={buttonRef}
            onClick={onConnect}
            variant="default"
            size="sm"
            disabled={isConnecting}
          >
            {isConnecting ? <Loader2 /> : <Phone />}
          </Button>
        )}
      </div>
    </div>
  );
}
