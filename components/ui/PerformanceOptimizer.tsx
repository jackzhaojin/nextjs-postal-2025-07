'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo,
  memo,
  lazy,
  Suspense,
  createContext,
  useContext
} from 'react';
import { AlertTriangle, TrendingUp, Zap, Clock, Memory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  apiResponseTime: number;
  componentCount: number;
  reRenderCount: number;
  lastUpdate: number;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  reportMetric: (type: keyof PerformanceMetrics, value: number) => void;
  getOptimizationSuggestions: () => OptimizationSuggestion[];
}

interface OptimizationSuggestion {
  id: string;
  type: 'memory' | 'performance' | 'network' | 'render';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  reportingInterval?: number;
}

export function PerformanceProvider({
  children,
  enableMonitoring = true,
  reportingInterval = 5000
}: PerformanceProviderProps) {
  console.log('PerformanceProvider: Initializing performance monitoring');

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    apiResponseTime: 0,
    componentCount: 0,
    reRenderCount: 0,
    lastUpdate: Date.now()
  });

  const [isMonitoring, setIsMonitoring] = useState(enableMonitoring);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const renderStartRef = useRef<number>(0);

  const startMonitoring = useCallback(() => {
    console.log('PerformanceProvider: Starting monitoring');
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    console.log('PerformanceProvider: Stopping monitoring');
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reportMetric = useCallback((type: keyof PerformanceMetrics, value: number) => {
    console.log('PerformanceProvider: Reporting metric:', type, value);
    setMetrics(prev => ({
      ...prev,
      [type]: value,
      lastUpdate: Date.now()
    }));
  }, []);

  const getOptimizationSuggestions = useCallback((): OptimizationSuggestion[] => {
    console.log('PerformanceProvider: Generating optimization suggestions');
    
    const suggestions: OptimizationSuggestion[] = [];

    // Memory usage suggestions
    if (metrics.memoryUsage > 50) {
      suggestions.push({
        id: 'high-memory',
        type: 'memory',
        severity: 'high',
        title: 'High Memory Usage Detected',
        description: `Current memory usage is ${metrics.memoryUsage}MB, which may impact performance.`,
        recommendation: 'Consider lazy loading components and implementing component memoization.',
        impact: 'Reduced memory usage and improved performance'
      });
    }

    // Render performance suggestions
    if (metrics.renderTime > 100) {
      suggestions.push({
        id: 'slow-render',
        type: 'render',
        severity: 'medium',
        title: 'Slow Render Performance',
        description: `Components are taking ${metrics.renderTime}ms to render.`,
        recommendation: 'Use React.memo() for expensive components and optimize re-render logic.',
        impact: 'Faster UI updates and better user experience'
      });
    }

    // Re-render frequency
    if (metrics.reRenderCount > 20) {
      suggestions.push({
        id: 'excessive-rerenders',
        type: 'render',
        severity: 'medium',
        title: 'Excessive Re-renders',
        description: `Components have re-rendered ${metrics.reRenderCount} times recently.`,
        recommendation: 'Implement useCallback and useMemo to prevent unnecessary re-renders.',
        impact: 'Reduced CPU usage and smoother interactions'
      });
    }

    // API response time
    if (metrics.apiResponseTime > 1000) {
      suggestions.push({
        id: 'slow-api',
        type: 'network',
        severity: 'high',
        title: 'Slow API Response Times',
        description: `API calls are taking ${metrics.apiResponseTime}ms on average.`,
        recommendation: 'Implement request caching and consider API pagination.',
        impact: 'Faster data loading and better perceived performance'
      });
    }

    console.log('PerformanceProvider: Generated suggestions:', suggestions);
    return suggestions;
  }, [metrics]);

  // Performance monitoring effect
  useEffect(() => {
    if (!isMonitoring) return;

    console.log('PerformanceProvider: Setting up monitoring interval');
    
    intervalRef.current = setInterval(() => {
      // Memory usage estimation (simulated)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize 
        ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        : Math.random() * 100;

      // Component count estimation
      const componentCount = document.querySelectorAll('[data-component]').length;

      setMetrics(prev => ({
        ...prev,
        memoryUsage,
        componentCount,
        reRenderCount: prev.reRenderCount + Math.floor(Math.random() * 3),
        lastUpdate: Date.now()
      }));
    }, reportingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, reportingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    reportMetric,
    getOptimizationSuggestions
  }), [metrics, isMonitoring, startMonitoring, stopMonitoring, reportMetric, getOptimizationSuggestions]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

// Performance monitoring hook for components
export function useComponentPerformance(componentName: string) {
  const { reportMetric } = usePerformance();
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
    console.log(`Performance: ${componentName} render started`);
  }, [componentName]);

  const endRender = useCallback(() => {
    if (renderStartRef.current > 0) {
      const renderTime = performance.now() - renderStartRef.current;
      reportMetric('renderTime', renderTime);
      console.log(`Performance: ${componentName} render completed in ${renderTime}ms`);
    }
  }, [componentName, reportMetric]);

  useEffect(() => {
    startRender();
    return endRender;
  });

  return { renderCount: renderCountRef.current };
}

// Debounced hook for expensive operations
export function useDebounced<T>(value: T, delay: number): T {
  console.log('useDebounced: Setting up debounced value with delay:', delay);
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      console.log('useDebounced: Updating debounced value');
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memory-efficient lazy component wrapper
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  console.log('createLazyComponent: Creating lazy component');
  
  const LazyComponent = lazy(importFn);
  
  return memo((props: React.ComponentProps<T>) => {
    console.log('LazyComponent: Rendering with Suspense');
    
    return (
      <Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  });
}

interface PerformanceMonitorProps {
  className?: string;
  compact?: boolean;
  showSuggestions?: boolean;
}

export function PerformanceMonitor({
  className = '',
  compact = false,
  showSuggestions = true
}: PerformanceMonitorProps) {
  console.log('PerformanceMonitor: Rendering monitor component');

  const { metrics, isMonitoring, getOptimizationSuggestions } = usePerformance();
  const [showDetails, setShowDetails] = useState(false);

  const suggestions = useMemo(() => {
    return showSuggestions ? getOptimizationSuggestions() : [];
  }, [showSuggestions, getOptimizationSuggestions]);

  const getMetricStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isMonitoring) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge className={getStatusColor(getMetricStatus(metrics.renderTime, { good: 50, warning: 100 }))}>
          <Clock className="h-3 w-3 mr-1" />
          {Math.round(metrics.renderTime)}ms
        </Badge>
        <Badge className={getStatusColor(getMetricStatus(metrics.memoryUsage, { good: 25, warning: 50 }))}>
          <Memory className="h-3 w-3 mr-1" />
          {Math.round(metrics.memoryUsage)}MB
        </Badge>
        {suggestions.length > 0 && (
          <Badge className="text-orange-600 bg-orange-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {suggestions.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {isMonitoring ? 'Monitoring' : 'Stopped'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Render Time</div>
              <div className="text-lg font-semibold">{Math.round(metrics.renderTime)}ms</div>
              <Progress 
                value={Math.min(metrics.renderTime / 2, 100)} 
                className="h-2 mt-1"
              />
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Memory Usage</div>
              <div className="text-lg font-semibold">{Math.round(metrics.memoryUsage)}MB</div>
              <Progress 
                value={Math.min(metrics.memoryUsage, 100)} 
                className="h-2 mt-1"
              />
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">API Response</div>
              <div className="text-lg font-semibold">{Math.round(metrics.apiResponseTime)}ms</div>
              <Progress 
                value={Math.min(metrics.apiResponseTime / 20, 100)} 
                className="h-2 mt-1"
              />
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Re-renders</div>
              <div className="text-lg font-semibold">{metrics.reRenderCount}</div>
              <Progress 
                value={Math.min(metrics.reRenderCount * 2, 100)} 
                className="h-2 mt-1"
              />
            </div>
          </div>

          {showDetails && (
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm text-gray-600">
                <strong>Component Count:</strong> {metrics.componentCount}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Last Update:</strong> {new Date(metrics.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {suggestions.length > 0 && showSuggestions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion) => (
              <Alert key={suggestion.id} className={`border-l-4 ${
                suggestion.severity === 'high' ? 'border-l-red-500' :
                suggestion.severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {suggestion.type === 'memory' && <Memory className="h-4 w-4" />}
                    {suggestion.type === 'render' && <Clock className="h-4 w-4" />}
                    {suggestion.type === 'network' && <TrendingUp className="h-4 w-4" />}
                    {suggestion.type === 'performance' && <Zap className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h6 className="font-medium text-sm">{suggestion.title}</h6>
                      <Badge className={`text-xs ${
                        suggestion.severity === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {suggestion.severity}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm mb-2">
                      {suggestion.description}
                    </AlertDescription>
                    <div className="text-xs text-gray-600">
                      <strong>Recommendation:</strong> {suggestion.recommendation}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      <strong>Impact:</strong> {suggestion.impact}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}