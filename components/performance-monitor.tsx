"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X, Activity, Smartphone, Monitor, Copy, Check } from "lucide-react";

interface LogEntry {
  timestamp: string;
  type: 'start' | 'end' | 'mark' | 'network' | 'summary' | 'warning' | 'info';
  message: string;
  duration?: string;
  metadata?: Record<string, unknown>;
}

export function PerformanceMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    isMobile: boolean;
    browser: string;
    network?: string;
  }>({ isMobile: false, browser: 'unknown' });

  useEffect(() => {
    // Detect device info
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    
    let network: string | undefined;
    if ('connection' in navigator) {
      const navWithConnection = navigator as Navigator & {
        connection?: { effectiveType?: string };
      };
      network = navWithConnection.connection?.effectiveType;
    }
    
    setDeviceInfo({ isMobile, browser, network });

    // Override console methods to capture logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalTable = console.table;
    const originalGroup = console.group;
    const originalGroupEnd = console.groupEnd;

    console.log = (...args) => {
      originalLog(...args);
      
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Capture ALL logs with emojis or performance-related keywords
      if (message.includes('⏱️')) {
        const isStart = message.includes('[START]');
        const isEnd = message.includes('[END]');
        
        if (isStart || isEnd) {
          const match = message.match(/\[(?:START|END)\]\s+([^\s]+)/);
          const name = match?.[1] || 'unknown';
          
          if (isEnd) {
            const durationMatch = message.match(/duration:\s*"?([^"]+)"?/);
            const duration = durationMatch?.[1];
            
            setLogs(prev => [...prev, {
              timestamp: new Date().toISOString().split('T')[1].split('.')[0],
              type: 'end',
              message: `${name}`,
              duration,
              metadata: args[1] as Record<string, unknown>
            }]);
          } else {
            setLogs(prev => [...prev, {
              timestamp: new Date().toISOString().split('T')[1].split('.')[0],
              type: 'start',
              message: `Starting: ${name}`,
              metadata: args[1] as Record<string, unknown>
            }]);
          }
        }
      } else if (message.includes('📍')) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'mark',
          message: message.replace('📍', '').trim(),
          metadata: args[1] as Record<string, unknown>
        }]);
      } else if (message.includes('🌐')) {
        const durationMatch = message.match(/duration:\s*"?([^"]+)"?/);
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'network',
          message: 'Network request',
          duration: durationMatch?.[1],
          metadata: args[1] as Record<string, unknown>
        }]);
      } else if (message.includes('📊 TOTAL TIME:')) {
        const timeMatch = message.match(/TOTAL TIME:\s*([^\s]+)/);
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'summary',
          message: `Total Time: ${timeMatch?.[1] || 'unknown'}`,
        }]);
      } else if (message.includes('📱') || message.includes('[ENVIRONMENT]')) {
        // Capture environment logs
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'info',
          message: message.replace(/📱|\[ENVIRONMENT\]/g, '').trim(),
        }]);
      } else if (message.includes('✅') || message.includes('🔌') || message.includes('💬') || 
                 message.includes('🔄') || message.includes('🏓') || message.includes('📋')) {
        // Capture other status logs
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'info',
          message: message,
        }]);
      } else if (message.includes('[API]')) {
        // Capture server-side API logs
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'info',
          message: message.replace('[API]', '').trim(),
        }]);
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Capture all warnings, not just slow operations
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString().split('T')[1].split('.')[0],
        type: 'warning',
        message: message.replace(/🐌|⚠️/g, '').trim(),
      }]);
    };

    console.table = (data: unknown) => {
      originalTable(data);
      
      if (Array.isArray(data)) {
        data.forEach((item: unknown) => {
          const entry = item as { name?: string; duration?: string; percentage?: string };
          if (entry.name && entry.duration) {
            setLogs(prev => [...prev, {
              timestamp: new Date().toISOString().split('T')[1].split('.')[0],
              type: 'info',
              message: `${entry.name}: ${entry.duration} (${entry.percentage || ''})`,
            }]);
          }
        });
      }
    };

    // Capture console.group for performance analysis
    console.group = (...args) => {
      originalGroup(...args);
      const message = args.join(' ');
      
      if (message.includes('🎯') || message.includes('🚨') || message.includes('💡')) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          type: 'info',
          message: `--- ${message} ---`,
        }]);
      }
    };

    console.groupEnd = () => {
      originalGroupEnd();
    };

    // Cleanup
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.table = originalTable;
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = async () => {
    try {
      // Format logs for copying
      const timestamp = new Date().toISOString();
      const deviceStr = `${deviceInfo.isMobile ? 'Mobile' : 'Desktop'} - ${deviceInfo.browser}${deviceInfo.network ? ` (${deviceInfo.network})` : ''}`;
      
      let logText = `=== Performance Monitor Export ===\n`;
      logText += `Generated: ${timestamp}\n`;
      logText += `Device: ${deviceStr}\n`;
      logText += `Total Logs: ${logs.length}\n`;
      logText += `${'='.repeat(35)}\n\n`;
      
      // Add detailed logs
      logText += `DETAILED LOGS:\n`;
      logText += `--------------\n`;
      logs.forEach((log, index) => {
        logText += `${index + 1}. [${log.timestamp}] ${getTypeLabel(log.type)}: ${log.message}`;
        if (log.duration) {
          logText += ` (${log.duration})`;
          if (parseFloat(log.duration) > 1000) {
            logText += ' ⚠️ SLOW';
          }
        }
        logText += '\n';
      });
      
      // Add summary section
      const summaryLogs = logs.filter(l => l.type === 'end' || l.type === 'summary');
      if (summaryLogs.length > 0) {
        logText += `\n${'='.repeat(35)}\n`;
        logText += `PERFORMANCE SUMMARY:\n`;
        logText += `-------------------\n`;
        summaryLogs.forEach(log => {
          logText += `• ${log.message}`;
          if (log.duration) {
            logText += `: ${log.duration}`;
            const ms = parseFloat(log.duration);
            if (ms > 2000) {
              logText += ' 🔴 CRITICAL';
            } else if (ms > 1000) {
              logText += ' 🟡 SLOW';
            } else if (ms < 200) {
              logText += ' 🟢 FAST';
            }
          }
          logText += '\n';
        });
        
        // Add total time if available
        const totalLog = logs.find(l => l.message.includes('Total Time'));
        if (totalLog && totalLog.duration) {
          logText += `\n🎯 TOTAL TIME: ${totalLog.duration || totalLog.message.split(':')[1]?.trim()}\n`;
        }
      }
      
      // Add bottleneck warnings
      const warnings = logs.filter(l => l.type === 'warning');
      if (warnings.length > 0) {
        logText += `\n⚠️ BOTTLENECKS DETECTED:\n`;
        logText += `------------------------\n`;
        warnings.forEach(warning => {
          logText += `• ${warning.message}\n`;
        });
      }
      
      // Copy to clipboard
      await navigator.clipboard.writeText(logText);
      setIsCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
      
      console.log('📋 Logs copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy logs:', error);
      
      // Fallback for older browsers or mobile
      try {
        const textArea = document.createElement('textarea');
        textArea.value = logs.map(log => 
          `[${log.timestamp}] ${getTypeLabel(log.type)}: ${log.message}${log.duration ? ` (${log.duration})` : ''}`
        ).join('\n');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        alert('Could not copy logs. Please try selecting and copying manually.');
      }
    }
  };

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'start': return 'bg-blue-500';
      case 'end': return 'bg-green-500';
      case 'mark': return 'bg-purple-500';
      case 'network': return 'bg-cyan-500';
      case 'summary': return 'bg-yellow-500';
      case 'warning': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: LogEntry['type']) => {
    switch (type) {
      case 'start': return 'START';
      case 'end': return 'DONE';
      case 'mark': return 'MARK';
      case 'network': return 'NET';
      case 'summary': return 'TOTAL';
      case 'warning': return 'SLOW';
      default: return type.toUpperCase();
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="shadow-lg"
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
              {deviceInfo.isMobile ? (
                <Smartphone className="h-3 w-3" />
              ) : (
                <Monitor className="h-3 w-3" />
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={copyLogs}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                disabled={logs.length === 0}
                title={isCopied ? "Copied!" : "Copy all logs"}
              >
                {isCopied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
              <Button
                onClick={clearLogs}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
              >
                Clear
              </Button>
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-2 text-xs">
            <Badge variant="outline">{deviceInfo.browser}</Badge>
            {deviceInfo.network && (
              <Badge variant="outline">{deviceInfo.network}</Badge>
            )}
            <Badge variant="outline">{logs.length} logs</Badge>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Waiting for performance logs...
                </p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs font-mono p-2 bg-muted/50 rounded"
                  >
                    <span className="text-muted-foreground shrink-0">
                      {log.timestamp}
                    </span>
                    <Badge 
                      className={`${getTypeColor(log.type)} text-white px-1 py-0 h-4 text-[10px] shrink-0`}
                    >
                      {getTypeLabel(log.type)}
                    </Badge>
                    <div className="flex-1 break-all">
                      <span className={log.type === 'warning' ? 'text-red-600 font-semibold' : ''}>
                        {log.message}
                      </span>
                      {log.duration && (
                        <span className="ml-1 text-green-600 font-semibold">
                          {log.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Summary section for key metrics */}
            {logs.some(l => l.type === 'summary') && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold mb-1">Summary:</p>
                {logs.filter(l => l.type === 'end' || l.type === 'summary').map((log, index) => (
                  <div key={index} className="text-xs">
                    {log.message}: {log.duration && (
                      <span className={
                        parseFloat(log.duration) > 1000 ? 'text-red-600' : 'text-green-600'
                      }>
                        {log.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
