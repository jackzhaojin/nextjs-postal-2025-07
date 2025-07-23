"use client";
import React from 'react';
import { useDemo } from '@/lib/demo/demo-context';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward, ChevronsRight, ChevronsLeft, X } from 'lucide-react';

export const DemoControlPanel = () => {
  const { demoController, isDemoRunning, currentScenario, demoConfig, setIsDemoMode } = useDemo();

  if (!currentScenario || !demoController) {
    return null;
  }

  const handleExit = () => {
    demoController.resetDemo();
    setIsDemoMode(false);
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-2xl z-50 w-96">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Demo Controls: {currentScenario.name}</h3>
        <Button variant="ghost" size="icon-md" onClick={handleExit} title="Exit demo">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-around">
        <Button variant="outline" size="icon-md" onClick={() => demoController.previousStep()} title="Previous Step">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon-md" onClick={() => demoController.resetDemo()} title="Reset Demo">
          <Rewind className="h-4 w-4" />
        </Button>
        {
          isDemoRunning ? (
            <Button variant="outline" size="icon-md" onClick={() => demoController.pauseDemo()} title="Pause Demo">
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="icon-md" onClick={() => demoController.resumeDemo()} title="Resume Demo">
              <Play className="h-4 w-4" />
            </Button>
          )
        }
        <Button variant="outline" size="icon-md" onClick={() => demoController.setSpeed('fast')} title="Fast Forward">
          <FastForward className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon-md" onClick={() => demoController.nextStep()} title="Next Step">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 text-sm">
        <p>Speed: {demoConfig?.speed}</p>
      </div>
    </div>
  );
};
