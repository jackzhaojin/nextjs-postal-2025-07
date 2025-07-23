"use client";
import React from 'react';
import { useDemo } from '@/lib/demo/demo-context';
import { Progress } from '@/components/ui/progress';

export const DemoProgress = () => {
  const { demoProgress, currentScenario } = useDemo();

  if (!currentScenario) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-2 z-50">
      <Progress value={demoProgress.percentComplete} className="w-full" />
    </div>
  );
};
