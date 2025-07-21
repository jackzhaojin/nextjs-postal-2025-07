'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo,
  createContext,
  useContext
} from 'react';
import { BarChart3, Clock, MousePointer, AlertCircle, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface UserInteraction {
  id: string;
  type: 'field_focus' | 'field_blur' | 'field_change' | 'form_submit' | 'help_used' | 'error_encountered' | 'step_change';
  fieldId?: string;
  timestamp: number;
  duration?: number;
  value?: any;
  metadata?: Record<string, any>;
}

interface FieldAnalytics {
  fieldId: string;
  focusCount: number;
  totalFocusTime: number;
  averageFocusTime: number;
  errorCount: number;
  helpUsageCount: number;
  completionRate: number;
  abandonmentRate: number;
  lastInteraction: number;
}

interface FormAnalytics {
  sessionId: string;
  startTime: number;
  totalTime: number;
  stepCompletionTimes: Record<string, number>;
  errorFrequency: Record<string, number>;
  helpUsageStats: Record<string, number>;
  abandonmentPoints: string[];
  conversionFunnel: Record<string, number>;
  userBehaviorPattern: 'efficient' | 'exploratory' | 'struggling' | 'expert';
}

interface AnalyticsContextType {
  isEnabled: boolean;
  interactions: UserInteraction[];
  fieldAnalytics: Record<string, FieldAnalytics>;
  formAnalytics: FormAnalytics;
  trackInteraction: (interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => void;
  getFieldInsights: (fieldId: string) => FieldAnalytics | null;
  getFormInsights: () => FormAnalytics;
  exportAnalytics: () => string;
  clearAnalytics: () => void;
  setEnabled: (enabled: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  storageKey?: string;
  maxInteractions?: number;
}

export function AnalyticsProvider({
  children,
  enabled = true,
  storageKey = 'user-analytics',
  maxInteractions = 1000
}: AnalyticsProviderProps) {
  console.log('AnalyticsProvider: Initializing with enabled:', enabled);

  const [isEnabled, setIsEnabled] = useState(enabled);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionStartTime] = useState(Date.now());

  const fieldAnalytics = useMemo(() => {
    console.log('AnalyticsProvider: Calculating field analytics');
    
    const analytics: Record<string, FieldAnalytics> = {};

    interactions.forEach(interaction => {
      if (!interaction.fieldId) return;

      if (!analytics[interaction.fieldId]) {
        analytics[interaction.fieldId] = {
          fieldId: interaction.fieldId,
          focusCount: 0,
          totalFocusTime: 0,
          averageFocusTime: 0,
          errorCount: 0,
          helpUsageCount: 0,
          completionRate: 0,
          abandonmentRate: 0,
          lastInteraction: 0
        };
      }

      const field = analytics[interaction.fieldId];

      switch (interaction.type) {
        case 'field_focus':
          field.focusCount += 1;
          break;
        case 'field_blur':
          if (interaction.duration) {
            field.totalFocusTime += interaction.duration;
            field.averageFocusTime = field.totalFocusTime / field.focusCount;
          }
          break;
        case 'error_encountered':
          field.errorCount += 1;
          break;
        case 'help_used':
          field.helpUsageCount += 1;
          break;
      }

      field.lastInteraction = Math.max(field.lastInteraction, interaction.timestamp);
    });

    console.log('AnalyticsProvider: Field analytics calculated:', Object.keys(analytics).length, 'fields');
    return analytics;
  }, [interactions]);

  const formAnalytics = useMemo((): FormAnalytics => {
    console.log('AnalyticsProvider: Calculating form analytics');

    const stepCompletionTimes: Record<string, number> = {};
    const errorFrequency: Record<string, number> = {};
    const helpUsageStats: Record<string, number> = {};
    const abandonmentPoints: string[] = [];
    const conversionFunnel: Record<string, number> = {};

    let currentStepStart = sessionStartTime;
    let currentStep = 'step-1';

    interactions.forEach(interaction => {
      // Track step changes
      if (interaction.type === 'step_change' && interaction.metadata?.step) {
        const stepTime = interaction.timestamp - currentStepStart;
        stepCompletionTimes[currentStep] = stepTime;
        
        currentStep = interaction.metadata.step;
        currentStepStart = interaction.timestamp;
        
        conversionFunnel[currentStep] = (conversionFunnel[currentStep] || 0) + 1;
      }

      // Track errors
      if (interaction.type === 'error_encountered' && interaction.fieldId) {
        errorFrequency[interaction.fieldId] = (errorFrequency[interaction.fieldId] || 0) + 1;
      }

      // Track help usage
      if (interaction.type === 'help_used' && interaction.fieldId) {
        helpUsageStats[interaction.fieldId] = (helpUsageStats[interaction.fieldId] || 0) + 1;
      }
    });

    // Determine user behavior pattern
    const totalErrors = Object.values(errorFrequency).reduce((sum, count) => sum + count, 0);
    const totalHelpUsage = Object.values(helpUsageStats).reduce((sum, count) => sum + count, 0);
    const averageStepTime = Object.values(stepCompletionTimes).reduce((sum, time) => sum + time, 0) / Math.max(Object.keys(stepCompletionTimes).length, 1);

    let userBehaviorPattern: FormAnalytics['userBehaviorPattern'] = 'efficient';
    
    if (totalErrors > 5) {
      userBehaviorPattern = 'struggling';
    } else if (totalHelpUsage > 3) {
      userBehaviorPattern = 'exploratory';
    } else if (averageStepTime < 30000) { // Less than 30 seconds per step
      userBehaviorPattern = 'expert';
    }

    const result = {
      sessionId,
      startTime: sessionStartTime,
      totalTime: Date.now() - sessionStartTime,
      stepCompletionTimes,
      errorFrequency,
      helpUsageStats,
      abandonmentPoints,
      conversionFunnel,
      userBehaviorPattern
    };

    console.log('AnalyticsProvider: Form analytics calculated:', result);
    return result;
  }, [interactions, sessionId, sessionStartTime]);

  const trackInteraction = useCallback((interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => {
    if (!isEnabled) return;

    console.log('AnalyticsProvider: Tracking interaction:', interaction);

    const newInteraction: UserInteraction = {
      ...interaction,
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setInteractions(prev => {
      const updated = [...prev, newInteraction];
      // Keep only the last maxInteractions
      if (updated.length > maxInteractions) {
        return updated.slice(-maxInteractions);
      }
      return updated;
    });
  }, [isEnabled, maxInteractions]);

  const getFieldInsights = useCallback((fieldId: string): FieldAnalytics | null => {
    console.log('AnalyticsProvider: Getting field insights for:', fieldId);
    return fieldAnalytics[fieldId] || null;
  }, [fieldAnalytics]);

  const getFormInsights = useCallback((): FormAnalytics => {
    console.log('AnalyticsProvider: Getting form insights');
    return formAnalytics;
  }, [formAnalytics]);

  const exportAnalytics = useCallback((): string => {
    console.log('AnalyticsProvider: Exporting analytics data');
    
    const exportData = {
      sessionId,
      timestamp: Date.now(),
      interactions: interactions.slice(-100), // Last 100 interactions
      fieldAnalytics,
      formAnalytics,
      metadata: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    return JSON.stringify(exportData, null, 2);
  }, [sessionId, interactions, fieldAnalytics, formAnalytics]);

  const clearAnalytics = useCallback(() => {
    console.log('AnalyticsProvider: Clearing analytics data');
    setInteractions([]);
  }, []);

  // Save to localStorage periodically
  useEffect(() => {
    if (!isEnabled) return;

    const saveData = () => {
      try {
        const data = {
          interactions: interactions.slice(-100),
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log('AnalyticsProvider: Data saved to localStorage');
      } catch (error) {
        console.error('AnalyticsProvider: Error saving to localStorage:', error);
      }
    };

    const interval = setInterval(saveData, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [isEnabled, interactions, storageKey]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!isEnabled) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.interactions && Array.isArray(data.interactions)) {
          setInteractions(data.interactions);
          console.log('AnalyticsProvider: Data loaded from localStorage');
        }
      }
    } catch (error) {
      console.error('AnalyticsProvider: Error loading from localStorage:', error);
    }
  }, [isEnabled, storageKey]);

  const value = useMemo(() => ({
    isEnabled,
    interactions,
    fieldAnalytics,
    formAnalytics,
    trackInteraction,
    getFieldInsights,
    getFormInsights,
    exportAnalytics,
    clearAnalytics,
    setEnabled: setIsEnabled
  }), [
    isEnabled,
    interactions,
    fieldAnalytics,
    formAnalytics,
    trackInteraction,
    getFieldInsights,
    getFormInsights,
    exportAnalytics,
    clearAnalytics
  ]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook for tracking field interactions
export function useFieldAnalytics(fieldId: string) {
  const { trackInteraction, getFieldInsights } = useAnalytics();
  const focusStartRef = useRef<number | null>(null);

  const handleFocus = useCallback(() => {
    console.log('useFieldAnalytics: Field focused:', fieldId);
    focusStartRef.current = Date.now();
    trackInteraction({
      type: 'field_focus',
      fieldId
    });
  }, [fieldId, trackInteraction]);

  const handleBlur = useCallback(() => {
    console.log('useFieldAnalytics: Field blurred:', fieldId);
    const duration = focusStartRef.current ? Date.now() - focusStartRef.current : undefined;
    trackInteraction({
      type: 'field_blur',
      fieldId,
      duration
    });
    focusStartRef.current = null;
  }, [fieldId, trackInteraction]);

  const handleChange = useCallback((value: any) => {
    console.log('useFieldAnalytics: Field changed:', fieldId);
    trackInteraction({
      type: 'field_change',
      fieldId,
      value
    });
  }, [fieldId, trackInteraction]);

  const handleError = useCallback((error: string) => {
    console.log('useFieldAnalytics: Field error:', fieldId, error);
    trackInteraction({
      type: 'error_encountered',
      fieldId,
      metadata: { error }
    });
  }, [fieldId, trackInteraction]);

  const handleHelpUsed = useCallback((helpId: string) => {
    console.log('useFieldAnalytics: Help used for field:', fieldId, helpId);
    trackInteraction({
      type: 'help_used',
      fieldId,
      metadata: { helpId }
    });
  }, [fieldId, trackInteraction]);

  const insights = useMemo(() => getFieldInsights(fieldId), [fieldId, getFieldInsights]);

  return {
    insights,
    handleFocus,
    handleBlur,
    handleChange,
    handleError,
    handleHelpUsed
  };
}

interface AnalyticsDashboardProps {
  className?: string;
  showFieldDetails?: boolean;
  showExportButton?: boolean;
}

export function AnalyticsDashboard({
  className = '',
  showFieldDetails = true,
  showExportButton = true
}: AnalyticsDashboardProps) {
  console.log('AnalyticsDashboard: Rendering dashboard');

  const { 
    isEnabled, 
    interactions, 
    fieldAnalytics, 
    formAnalytics, 
    exportAnalytics, 
    clearAnalytics,
    setEnabled
  } = useAnalytics();

  const [showDetails, setShowDetails] = useState(false);

  const handleExport = useCallback(() => {
    console.log('AnalyticsDashboard: Exporting analytics');
    const data = exportAnalytics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${formAnalytics.sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportAnalytics, formAnalytics.sessionId]);

  const getBehaviorColor = (pattern: FormAnalytics['userBehaviorPattern']) => {
    switch (pattern) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'efficient': return 'bg-blue-100 text-blue-800';
      case 'exploratory': return 'bg-yellow-100 text-yellow-800';
      case 'struggling': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isEnabled) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">Analytics tracking is disabled</p>
          <Button onClick={() => setEnabled(true)} variant="outline">
            Enable Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              {showExportButton && (
                <Button size="sm" variant="outline" onClick={handleExport}>
                  Export Data
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Session Time</div>
              <div className="text-lg font-semibold">
                {Math.round(formAnalytics.totalTime / 1000 / 60)}m
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Interactions</div>
              <div className="text-lg font-semibold">{interactions.length}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Fields Tracked</div>
              <div className="text-lg font-semibold">{Object.keys(fieldAnalytics).length}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Behavior Pattern</div>
              <Badge className={getBehaviorColor(formAnalytics.userBehaviorPattern)}>
                {formAnalytics.userBehaviorPattern}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Error Frequency</h4>
              <div className="space-y-2">
                {Object.entries(formAnalytics.errorFrequency)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([field, count]) => (
                    <div key={field} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{field}:</span>
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {count}
                      </Badge>
                    </div>
                  ))}
                {Object.keys(formAnalytics.errorFrequency).length === 0 && (
                  <p className="text-sm text-gray-500">No errors recorded</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Help Usage</h4>
              <div className="space-y-2">
                {Object.entries(formAnalytics.helpUsageStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([field, count]) => (
                    <div key={field} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{field}:</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {count}
                      </Badge>
                    </div>
                  ))}
                {Object.keys(formAnalytics.helpUsageStats).length === 0 && (
                  <p className="text-sm text-gray-500">No help usage recorded</p>
                )}
              </div>
            </div>
          </div>

          {showFieldDetails && showDetails && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Field Analytics Details</h4>
              <div className="space-y-3">
                {Object.values(fieldAnalytics)
                  .sort((a, b) => b.focusCount - a.focusCount)
                  .slice(0, 10)
                  .map((field) => (
                    <div key={field.fieldId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{field.fieldId}</h5>
                        <div className="flex gap-2">
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            <MousePointer className="h-3 w-3 mr-1" />
                            {field.focusCount} focuses
                          </Badge>
                          <Badge className="text-xs bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.round(field.averageFocusTime / 1000)}s avg
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                        <div>Errors: {field.errorCount}</div>
                        <div>Help Used: {field.helpUsageCount}</div>
                        <div>Total Time: {Math.round(field.totalFocusTime / 1000)}s</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={clearAnalytics}>
                Clear Data
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEnabled(false)}>
                Disable Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}