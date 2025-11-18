/**
 * Hook to optimize connection performance through various strategies
 */

import { useEffect, useRef } from "react";

interface OptimizationOptions {
  preWarmOnHover?: boolean;
  preWarmOnFocus?: boolean;
  cacheConfig?: boolean;
  prefetchDNS?: boolean;
}

export function useConnectionOptimizer(options: OptimizationOptions = {}) {
  const configCacheRef = useRef<{ data: any; timestamp: number } | null>(null);
  const preWarmedRef = useRef(false);

  useEffect(() => {
    // Prefetch DNS for ElevenLabs domains
    if (options.prefetchDNS !== false) {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = "https://api.elevenlabs.io";
      document.head.appendChild(link);

      const link2 = document.createElement("link");
      link2.rel = "preconnect";
      link2.href = "https://api.elevenlabs.io";
      document.head.appendChild(link2);

      console.log("🌐 DNS prefetch and preconnect initiated for ElevenLabs");
    }
  }, [options.prefetchDNS]);

  /**
   * Pre-warm the connection when user shows intent
   */
  const preWarmConnection = async () => {
    if (preWarmedRef.current) return;

    try {
      preWarmedRef.current = true;
      console.log("🔥 Pre-warming connection...");

      // Check cache first
      if (options.cacheConfig && configCacheRef.current) {
        const cacheAge = Date.now() - configCacheRef.current.timestamp;
        if (cacheAge < 60000) {
          // Cache valid for 1 minute
          console.log("✅ Using cached config");
          return configCacheRef.current.data;
        }
      }

      // Fetch and cache config
      const response = await fetch("/api/elevenlabs/config", {
        priority: "high",
      } as RequestInit);

      if (response.ok) {
        const config = await response.json();

        if (options.cacheConfig) {
          configCacheRef.current = {
            data: config,
            timestamp: Date.now(),
          };
        }

        console.log("✅ Connection pre-warmed");
        return config;
      }
    } catch (error) {
      console.error("Pre-warm failed:", error);
    } finally {
      // Reset after 30 seconds to allow re-warming
      setTimeout(() => {
        preWarmedRef.current = false;
      }, 30000);
    }
  };

  /**
   * Get cached config if available
   */
  const getCachedConfig = () => {
    if (configCacheRef.current) {
      const cacheAge = Date.now() - configCacheRef.current.timestamp;
      if (cacheAge < 60000) {
        return configCacheRef.current.data;
      }
    }
    return null;
  };

  return {
    preWarmConnection,
    getCachedConfig,
  };
}

/**
 * Hook to add pre-warming triggers to an element
 */
export function usePreWarmTriggers(
  elementRef: React.RefObject<HTMLElement | null>,
  onPreWarm: () => void,
) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const trigger = () => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onPreWarm();

        // Reset after 60 seconds
        setTimeout(() => {
          hasTriggeredRef.current = false;
        }, 60000);
      }
    };

    // Trigger on hover (desktop)
    element.addEventListener("mouseenter", trigger);

    // Trigger on touch start (mobile)
    element.addEventListener("touchstart", trigger, { passive: true } as AddEventListenerOptions);

    // Trigger when element comes into viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trigger();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => {
      element.removeEventListener("mouseenter", trigger);
      element.removeEventListener("touchstart", trigger, { passive: true } as EventListenerOptions);
      observer.disconnect();
    };
  }, [elementRef, onPreWarm]);
}
