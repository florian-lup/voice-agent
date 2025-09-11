/**
 * Performance logging utility to track timing of various operations
 * Helps identify bottlenecks in the conversation initialization flow
 */

interface TimingEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class PerformanceLogger {
  private timings: Map<string, TimingEntry> = new Map();
  private sequence: TimingEntry[] = [];

  /**
   * Start timing an operation
   */
  start(name: string, metadata?: Record<string, unknown>) {
    const startTime = performance.now();
    const entry: TimingEntry = {
      name,
      startTime,
      metadata,
    };
    
    this.timings.set(name, entry);
    this.sequence.push(entry);
    
    console.log(`⏱️ [START] ${name}`, {
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * End timing an operation
   */
  end(name: string, metadata?: Record<string, unknown>) {
    const entry = this.timings.get(name);
    if (!entry) {
      console.warn(`⚠️ No timing entry found for: ${name}`);
      return;
    }

    const endTime = performance.now();
    entry.endTime = endTime;
    entry.duration = endTime - entry.startTime;
    
    if (metadata) {
      entry.metadata = { ...entry.metadata, ...metadata };
    }

    console.log(`⏱️ [END] ${name}`, {
      duration: `${entry.duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      ...entry.metadata,
    });

    // Log warning for slow operations
    if (entry.duration > 1000) {
      console.warn(`🐌 SLOW OPERATION: ${name} took ${entry.duration.toFixed(2)}ms`);
    }

    return entry.duration;
  }

  /**
   * Mark a point in time without start/end
   */
  mark(name: string, metadata?: Record<string, unknown>) {
    const timestamp = performance.now();
    console.log(`📍 [MARK] ${name}`, {
      timestamp: new Date().toISOString(),
      relativeTime: `${timestamp.toFixed(2)}ms`,
      ...metadata,
    });
  }

  /**
   * Get all timings
   */
  getTimings(): TimingEntry[] {
    return this.sequence.filter(entry => entry.duration !== undefined);
  }

  /**
   * Get summary of all completed timings
   */
  getSummary() {
    const completed = this.getTimings();
    const total = completed.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    
    const summary = {
      totalDuration: `${total.toFixed(2)}ms`,
      operations: completed.map(entry => ({
        name: entry.name,
        duration: `${entry.duration?.toFixed(2)}ms`,
        percentage: `${((entry.duration || 0) / total * 100).toFixed(1)}%`,
      })),
    };

    console.table(summary.operations);
    console.log(`📊 TOTAL TIME: ${summary.totalDuration}`);
    
    return summary;
  }

  /**
   * Reset all timings
   */
  reset() {
    this.timings.clear();
    this.sequence = [];
    console.log('🔄 Performance logger reset');
  }

  /**
   * Log network timing information
   */
  logNetworkTiming(url: string, startTime: number, endTime: number) {
    const duration = endTime - startTime;
    console.log(`🌐 [NETWORK] ${url}`, {
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    });

    // Try to get detailed timing from Performance API
    if (typeof window !== 'undefined' && window.performance) {
      const entries = performance.getEntriesByType('resource');
      const entry = entries.find(e => e.name.includes(url));
      
      if (entry && 'domainLookupStart' in entry) {
        const resourceTiming = entry as PerformanceResourceTiming;
        console.log(`🌐 [NETWORK DETAILS] ${url}`, {
          dns: `${(resourceTiming.domainLookupEnd - resourceTiming.domainLookupStart).toFixed(2)}ms`,
          tcp: `${(resourceTiming.connectEnd - resourceTiming.connectStart).toFixed(2)}ms`,
          ssl: resourceTiming.secureConnectionStart > 0 
            ? `${(resourceTiming.connectEnd - resourceTiming.secureConnectionStart).toFixed(2)}ms`
            : 'N/A',
          ttfb: `${(resourceTiming.responseStart - resourceTiming.requestStart).toFixed(2)}ms`,
          download: `${(resourceTiming.responseEnd - resourceTiming.responseStart).toFixed(2)}ms`,
          total: `${resourceTiming.duration.toFixed(2)}ms`,
        });
      }
    }
  }

  /**
   * Log device and network information
   */
  logEnvironment() {
    if (typeof window === 'undefined') return;

    const info: Record<string, unknown> = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 'N/A',
      hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
      connection: (() => {
        const navWithConnection = navigator as Navigator & {
          connection?: {
            effectiveType?: string;
            downlink?: number;
            rtt?: number;
          };
        };
        return navWithConnection.connection ? {
          effectiveType: navWithConnection.connection.effectiveType,
          downlink: navWithConnection.connection.downlink,
          rtt: navWithConnection.connection.rtt,
        } : 'N/A';
      })(),
    };

    console.log('📱 [ENVIRONMENT]', info);
    return info;
  }
}

// Create singleton instance
export const perfLogger = new PerformanceLogger();

// Export for use in other files
export default PerformanceLogger;
