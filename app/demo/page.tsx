"use client";
import React from 'react';
import { useDemo } from '@/lib/demo/demo-context';
import { DemoSelector } from './components/DemoSelector';
import { DemoControlPanel } from './components/DemoControlPanel';
import { DemoProgress } from './components/DemoProgress';

const DemoPage = () => {
  const { isDemoMode, currentScenario } = useDemo();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Interactive Demo System</h1>
      {!isDemoMode ? (
        <DemoSelector />
      ) : (
        <div>
          <p className="text-lg">Demo in progress...</p>
        </div>
      )}
      {isDemoMode && currentScenario && (
        <>
          <DemoProgress />
          <DemoControlPanel />
        </>
      )}
    </div>
  );
};

export default DemoPage;
