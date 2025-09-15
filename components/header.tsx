"use client";

import React from "react";
import Image from "next/image";

export function Header() {
  return (
    <header className="w-full py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/mr-mime-logo.svg"
            alt="Mr. Mime Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold text-foreground">
            Mr. Mime
          </span>
        </div>
      </div>
    </header>
  );
}
