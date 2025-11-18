/**
 * Performance analysis utilities for identifying bottlenecks
 */

export interface PerformanceMetrics {
  device: "mobile" | "desktop";
  browser: string;
  networkType?: string;
  timings: {
    buttonClick: number;
    configFetch: number;
    sessionCreation: number;
    websocketConnection: number;
    firstMessage: number;
    total: number;
  };
}

/**
 * Analyze performance metrics and identify bottlenecks
 */
export function analyzeBottlenecks(metrics: PerformanceMetrics): string[] {
  const bottlenecks: string[] = [];
  const { timings, device } = metrics;

  // Define thresholds (ms)
  const thresholds = {
    configFetch: device === "mobile" ? 500 : 200,
    sessionCreation: device === "mobile" ? 2000 : 1000,
    websocketConnection: device === "mobile" ? 1000 : 500,
    firstMessage: device === "mobile" ? 3000 : 1500,
    total: device === "mobile" ? 5000 : 2000,
  };

  // Check each timing against thresholds
  if (timings.configFetch > thresholds.configFetch) {
    bottlenecks.push(
      `Config fetch is slow (${timings.configFetch}ms). Consider edge caching or CDN.`,
    );
  }

  if (timings.sessionCreation > thresholds.sessionCreation) {
    bottlenecks.push(
      `Session creation is slow (${timings.sessionCreation}ms). Check ElevenLabs API latency.`,
    );
  }

  if (timings.websocketConnection > thresholds.websocketConnection) {
    bottlenecks.push(
      `WebSocket connection is slow (${timings.websocketConnection}ms). Check network conditions.`,
    );
  }

  if (timings.firstMessage > thresholds.firstMessage) {
    bottlenecks.push(
      `Time to first message is slow (${timings.firstMessage}ms). Check agent configuration.`,
    );
  }

  return bottlenecks;
}

/**
 * Get device and browser information
 */
export function getDeviceInfo(): {
  device: "mobile" | "desktop";
  browser: string;
  networkType?: string;
} {
  if (typeof window === "undefined") {
    return { device: "desktop", browser: "unknown" };
  }

  const userAgent = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

  let browser = "unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edge")) browser = "Edge";

  // Get network type if available
  let networkType: string | undefined;
  if ("connection" in navigator) {
    const navWithConnection = navigator as Navigator & {
      connection?: { effectiveType?: string };
    };
    networkType = navWithConnection.connection?.effectiveType;
  }

  return {
    device: isMobile ? "mobile" : "desktop",
    browser,
    networkType,
  };
}

/**
 * Recommendations based on performance analysis
 */
export function getPerformanceRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];
  const { timings, device, networkType } = metrics;

  // Mobile-specific recommendations
  if (device === "mobile") {
    if (timings.total > 5000) {
      recommendations.push("Consider implementing a loading skeleton or progressive UI");
    }
    if (networkType && ["slow-2g", "2g", "3g"].includes(networkType)) {
      recommendations.push(
        "Detected slow network. Consider offline-first approach or service workers",
      );
    }
  }

  // General recommendations
  if (timings.configFetch > 300) {
    recommendations.push("Implement config pre-warming on app load");
    recommendations.push("Consider caching config with stale-while-revalidate strategy");
  }

  if (timings.sessionCreation > 1500) {
    recommendations.push("Pre-establish WebSocket connection before user interaction");
    recommendations.push("Consider connection pooling or persistent sessions");
  }

  if (timings.firstMessage > 2000) {
    recommendations.push("Optimize ElevenLabs agent configuration for faster response");
    recommendations.push("Consider streaming initial response while processing");
  }

  // Cold start detection
  if (timings.configFetch > 500 && timings.sessionCreation > 2000) {
    recommendations.push("Likely cold start detected. Implement warm-up strategies");
  }

  return recommendations;
}

/**
 * Log performance summary with recommendations
 */
export function logPerformanceSummary(timings: Record<string, number>) {
  const deviceInfo = getDeviceInfo();

  const metrics: PerformanceMetrics = {
    ...deviceInfo,
    timings: {
      buttonClick: 0,
      configFetch: timings["fetch_config"] || 0,
      sessionCreation: timings["elevenlabs_session_creation"] || 0,
      websocketConnection: timings["websocket_connection"] || 0,
      firstMessage: timings["time_to_first_message"] || 0,
      total: timings["total_connection_time"] || 0,
    },
  };

  const bottlenecks = analyzeBottlenecks(metrics);
  const recommendations = getPerformanceRecommendations(metrics);

  console.group("🎯 Performance Analysis");
  console.log("Device:", deviceInfo.device);
  console.log("Browser:", deviceInfo.browser);
  if (deviceInfo.networkType) {
    console.log("Network:", deviceInfo.networkType);
  }

  if (bottlenecks.length > 0) {
    console.group("🚨 Bottlenecks Detected");
    bottlenecks.forEach((b) => console.warn(b));
    console.groupEnd();
  }

  if (recommendations.length > 0) {
    console.group("💡 Recommendations");
    recommendations.forEach((r) => console.log(r));
    console.groupEnd();
  }

  console.groupEnd();
}
