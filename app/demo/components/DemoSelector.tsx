"use client";
import React from 'react';
import { useDemo, DemoConfig } from '@/lib/demo/demo-context';
import { demoScenarios } from '@/lib/demo/demo-data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export const DemoSelector = () => {
  const { demoController } = useDemo();

  const handleStartDemo = (scenarioId: string) => {
    const scenario = demoScenarios.find(s => s.id === scenarioId);
    if (scenario && demoController) {
      const config: Partial<DemoConfig> = {
        speed: 'medium',
        mode: 'auto',
      };
      demoController.startDemo(scenario, config);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {demoScenarios.map(scenario => (
        <Card key={scenario.id}>
          <CardHeader>
            <CardTitle>{scenario.name}</CardTitle>
            <CardDescription>{scenario.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Expected duration: {scenario.expectedDuration} minutes</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleStartDemo(scenario.id)}>Start Demo</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
