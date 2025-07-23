"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { WebDemoExecutor } from './demo-executor';

// Core Demo Interfaces from documentation
export interface DemoConfig {
  scenario: 'manufacturing' | 'healthcare' | 'technology' | 'legal' | 'error-demo';
  speed: 'slow' | 'medium' | 'fast' | 'presentation';
  mode: 'auto' | 'manual' | 'hybrid';
  highlightElements: boolean;
  showTooltips: boolean;
  pausePoints: string[];
}

export interface DemoAction {
  type: 'navigate' | 'fill' | 'click' | 'select' | 'wait' | 'highlight';
  target: string;
  value?: string;
  duration?: number;
  animation?: 'typing' | 'fade' | 'slide';
  narrationText?: string;
}

export interface DemoValidation {
  type: 'element-exists' | 'element-value' | 'url-contains';
  target: string;
  expectedValue?: any;
}

export interface DemoStep {
  stepNumber: number;
  title: string;
  description: string;
  component: string;
  actions: DemoAction[];
  validations: DemoValidation[];
  pauseAfter?: boolean;
  narrationText?: string;
}

export interface DemoDataSet {
  [key: string]: any;
}

export interface DemoScenario {
  name: string;
  id: string;
  description: string;
  steps: DemoStep[];
  expectedDuration: number;
  demoData: DemoDataSet;
}

export interface DemoProgress {
  currentStep: number;
  totalSteps: number;
  percentComplete: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

// Demo Controller Interface
export interface DemoController {
  startDemo: (scenario: DemoScenario, config: Partial<DemoConfig>) => Promise<void>;
  pauseDemo: () => Promise<void>;
  resumeDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  setSpeed: (speed: DemoConfig['speed']) => Promise<void>;
  getCurrentStep: () => DemoStep | null;
  getDemoProgress: () => DemoProgress;
}

// Demo Context Type
export interface DemoContextType {
  isDemoMode: boolean;
  isDemoRunning: boolean;
  currentScenario: DemoScenario | null;
  demoProgress: DemoProgress;
  demoController: DemoController | null;
  demoConfig: DemoConfig | null;
  setIsDemoMode: (isDemoMode: boolean) => void;
}

// Create the context with a default value
const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Demo Provider Props
interface DemoProviderProps {
  children: ReactNode;
}

// Demo Provider Component
export const DemoProvider = ({ children }: DemoProviderProps) => {
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<DemoScenario | null>(null);
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const demoProgress: DemoProgress = {
    currentStep: currentStepIndex + 1,
    totalSteps: currentScenario?.steps.length ?? 0,
    percentComplete: currentScenario ? ((currentStepIndex + 1) / currentScenario.steps.length) * 100 : 0,
    timeElapsed: 0, // Placeholder
    estimatedTimeRemaining: 0, // Placeholder
  };

  // Function to execute all steps in sequence
  const executeAllSteps = async (scenario: DemoScenario, stepIndex: number, forceRun = false) => {
    if (stepIndex >= scenario.steps.length) {
      console.log('[DEMO] All steps completed');
      return;
    }
    
    // Only check isDemoRunning after the first step, or if forceRun is false
    if (!forceRun && !isDemoRunning) {
      console.log('[DEMO] Demo paused, stopping execution');
      return;
    }
    
    try {
      console.log(`[DEMO] Executing step ${stepIndex + 1}/${scenario.steps.length}: ${scenario.steps[stepIndex].title}`);
      setCurrentStepIndex(stepIndex);
      
      const executor = new WebDemoExecutor(router);
      await executor.executeStep(scenario.steps[stepIndex]);
      
      // Auto-advance to next step after delay
      setTimeout(() => {
        executeAllSteps(scenario, stepIndex + 1, false);
      }, 3000);
    } catch (error) {
      console.error(`[DEMO] Error executing step ${stepIndex + 1}:`, error);
    }
  };

  const demoController: DemoController = {
    startDemo: async (scenario, config) => {
      console.log(`[DEMO] Starting demo: ${scenario.name}`, { config });
      setIsDemoMode(true);
      setIsDemoRunning(true);
      setCurrentScenario(scenario);
      setDemoConfig({
        scenario: 'manufacturing', // default
        speed: 'medium',
        mode: 'auto',
        highlightElements: true,
        showTooltips: true,
        pausePoints: [],
        ...config,
      });
      setCurrentStepIndex(0);
      
      // Start executing the demo steps
      if (scenario.steps.length > 0) {
        // Navigate to shipping page first
        router.push('/shipping');
        
        // Start the demo step execution sequence
        setTimeout(() => {
          executeAllSteps(scenario, 0, true); // Force run the first step
        }, 1500);
      }
    },
    pauseDemo: async () => {
      console.log('[DEMO] Pausing demo');
      setIsDemoRunning(false);
    },
    resumeDemo: async () => {
      console.log('[DEMO] Resuming demo');
      setIsDemoRunning(true);
    },
    resetDemo: async () => {
      console.log('[DEMO] Resetting demo');
      setIsDemoMode(false);
      setIsDemoRunning(false);
      setCurrentScenario(null);
      setCurrentStepIndex(0);
      setDemoConfig(null);
    },
    nextStep: async () => {
      if (currentScenario && currentStepIndex < currentScenario.steps.length - 1) {
        const nextIndex = currentStepIndex + 1;
        console.log(`[DEMO] Advancing to next step: ${nextIndex + 1}`);
        setCurrentStepIndex(nextIndex);
        
        // Execute the next step
        try {
          const executor = new WebDemoExecutor(router);
          await executor.executeStep(currentScenario.steps[nextIndex]);
        } catch (error) {
          console.error('[DEMO] Error executing next step:', error);
        }
      }
    },
    previousStep: async () => {
      if (currentStepIndex > 0) {
        console.log(`[DEMO] Returning to previous step: ${currentStepIndex}`);
        setCurrentStepIndex(prev => prev - 1);
      }
    },
    setSpeed: async (speed) => {
      if (demoConfig) {
        console.log(`[DEMO] Setting speed to: ${speed}`);
        setDemoConfig(prev => ({ ...prev!, speed }));
      }
    },
    getCurrentStep: () => {
      return currentScenario?.steps[currentStepIndex] || null;
    },
    getDemoProgress: () => demoProgress,
  };

  const value = {
    isDemoMode,
    isDemoRunning,
    currentScenario,
    demoProgress,
    demoController,
    demoConfig,
    setIsDemoMode,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

// Custom hook to use the DemoContext
export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
