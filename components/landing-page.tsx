"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, User, ChevronRight, MessageSquare } from "lucide-react";
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

export function LandingPage() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleContactClick = () => {
    setIsDrawerOpen(false);
    // Navigate to the Andrew Tate voice chat page
    router.push("/chat/tate");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
            Mr. Mime
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Talk with AI-powered Digital Clones
          </p>
        </div>

        {/* Main CTA */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
            >
              <Phone className="mr-2 h-5 w-5" />
              Open Phone Book
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="text-2xl">Phone Book</DrawerTitle>
              <DrawerDescription>
                Select a contact to start a voice conversation
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
                    { name: "Elon Musk", role: "Tech Entrepreneur", initials: "EM" },
                    { name: "Naval Ravikant", role: "Philosopher & Investor", initials: "NR" },
                    { name: "Tony Robbins", role: "Life Coach", initials: "TR" },
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
        <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
            <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Real-time Voice</h3>
            <p className="text-sm text-muted-foreground">
              Natural, flowing conversations with minimal latency
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
            <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Instant Messaging</h3>
            <p className="text-sm text-muted-foreground">
              Text-based interactions for quick conversations
            </p>
          </div>

                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border">
            <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Digital Personas</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered personalities with unique voices and knowledge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
