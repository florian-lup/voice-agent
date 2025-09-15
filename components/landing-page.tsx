"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, SquareUser } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";

export function LandingPage() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleContactClick = () => {
    setIsDrawerOpen(false);
    // Navigate to the Andrew Tate voice chat page
    router.push("/chat//call/tate");
  };

  return (
    <>
      <Header />
       <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-8 px-4 bg-background">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'Mokoto, sans-serif' }}>
            Mr. Mime
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground">
            Talk with AI-powered Digital Clones
          </p>
        </div>

        {/* Main CTA */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button 
            >
              Open Contact List
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="text-2xl">Contact List</DrawerTitle>
              <DrawerDescription>
                Select a contact to start conversation
              </DrawerDescription>
            </DrawerHeader>

            {/* Phone Book Content */}
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {/* Contact Categories */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">
                    AVAILABLE CONTACTS
                  </h3>
                  
                  {/* Andrew Tate Contact */}
                  <button
                    onClick={handleContactClick}
                    className="w-full p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200 flex items-center gap-4 text-left group"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/tate_mobile.jpg" alt="Andrew Tate" />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        AT
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-lg">Andrew Tate</div>
                      <div className="text-sm text-muted-foreground">
                        Entrepreneur & Motivational Speaker
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-2 bg-waveform-ai rounded-full animate-pulse"></div>
                        <span className="text-xs text-waveform-ai">Available now</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>

                {/* Coming Soon Section */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">
                    COMING SOON
                  </h3>
                  
                  {/* Placeholder contacts */}
                  {[
                    { name: "Tristan Tate", role: "Entrepreneur & Media Personality", initials: "TT" },
                  ].map((contact) => (
                    <div
                      key={contact.name}
                      className="w-full p-4 rounded-lg opacity-50 cursor-not-allowed flex items-center gap-4"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {contact.initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.role}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">Coming soon</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-card-foreground">Real-time Voice</h3>
              <Badge variant="secondary">
                Voice
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Natural conversations with minimal latency
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-card-foreground">Instant Messaging</h3>
              <Badge variant="secondary">
                Text
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Text-based interactions for quick conversations
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-card-foreground">Digital Personas</h3>
              <Badge variant="secondary">
                AI
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Realistic personalities with speech patterns
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto">
            This app is for educational and entertainment purposes only
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
