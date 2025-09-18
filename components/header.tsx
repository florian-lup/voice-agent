"use client";

import React from "react";
import Image from "next/image";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/mr-mime-logo.svg"
            alt="Mr. Mime Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div className="flex items-center gap-4">
            <FaInstagram className="w-5 h-5 text-foreground hover:text-primary transition-colors cursor-pointer" />
            <FaTiktok className="w-5 h-5 text-foreground hover:text-primary transition-colors cursor-pointer" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Login
          </Button>
          <Button size="sm">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
