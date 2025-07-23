"use client";
import React from 'react';
import { useDemo } from '@/lib/demo/demo-context';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward, ChevronsRight, ChevronsLeft, X } from 'lucide-react';

export const DemoControlPanel = () => {
  const { demoController, isDemoRunning, currentScenario, demoConfig, setIsDemoMode, demoProgress, isDemoMode } = useDemo();

  if (!isDemoMode || !currentScenario || !demoController) {
    return null;
  }

  const handleExit = () => {
    demoController.resetDemo();
    setIsDemoMode(false);
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl z-50 w-96 border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-blue-300">Demo Controls</h3>
        <Button variant="ghost" size="icon-md" onClick={handleExit} title="Exit demo" className="text-red-400 hover:text-red-300">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-gray-300 mb-1">{currentScenario.name}</div>
        <div className="text-xs text-gray-400">
          Step {demoProgress.currentStep} of {demoProgress.totalSteps} • 
          Status: <span className={`font-medium ${isDemoRunning ? 'text-green-400' : 'text-yellow-400'}`}>
            {isDemoRunning ? 'Running' : 'Paused'}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${demoProgress.percentComplete}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-around gap-2">
        <Button variant="outline" size="sm" onClick={() => demoController.previousStep()} title="Previous Step" className="text-white border-gray-600 hover:bg-gray-700">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => demoController.resetDemo()} title="Reset Demo" className="text-white border-gray-600 hover:bg-gray-700">
          <Rewind className="h-4 w-4" />
        </Button>
        {
          isDemoRunning ? (
            <Button variant="outline" size="sm" onClick={() => demoController.pauseDemo()} title="Pause Demo" className="text-yellow-400 border-yellow-600 hover:bg-yellow-900">
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => demoController.resumeDemo()} title="Resume Demo" className="text-green-400 border-green-600 hover:bg-green-900">
              <Play className="h-4 w-4" />
            </Button>
          )
        }
        <Button variant="outline" size="sm" onClick={() => demoController.setSpeed('fast')} title="Fast Forward" className="text-white border-gray-600 hover:bg-gray-700">
          <FastForward className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => demoController.nextStep()} title="Next Step" className="text-white border-gray-600 hover:bg-gray-700">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-center">
        Speed: {demoConfig?.speed} • Click Resume to continue if paused
      </div>
    </div>
  );
};
