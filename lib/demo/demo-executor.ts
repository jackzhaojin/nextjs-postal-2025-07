"use client";
import { DemoStep, DemoAction } from './demo-context';

export interface DemoExecutor {
  executeStep: (step: DemoStep) => Promise<void>;
  executeAction: (action: DemoAction) => Promise<void>;
}

export class WebDemoExecutor implements DemoExecutor {
  private router: any;
  private onStepComplete?: () => void;

  constructor(router: any, onStepComplete?: () => void) {
    this.router = router;
    this.onStepComplete = onStepComplete;
  }

  async executeStep(step: DemoStep): Promise<void> {
    console.log(`[DEMO] Executing step: ${step.title}`);
    
    // Execute all actions in the step sequentially
    for (const action of step.actions) {
      await this.executeAction(action);
      
      // Add delay between actions based on demo speed
      await this.delay(this.getActionDelay(action));
    }
    
    // Notify that step is complete and trigger auto-progression after a delay
    if (this.onStepComplete) {
      setTimeout(() => {
        this.onStepComplete?.();
      }, 2000); // Wait 2 seconds before auto-advancing
    }
  }

  async executeAction(action: DemoAction): Promise<void> {
    console.log(`[DEMO] Executing action: ${action.type} -> ${action.target}`);
    
    switch (action.type) {
      case 'navigate':
        await this.navigateAction(action);
        break;
      case 'fill':
        await this.fillAction(action);
        break;
      case 'click':
        await this.clickAction(action);
        break;
      case 'select':
        await this.selectAction(action);
        break;
      case 'wait':
        await this.waitAction(action);
        break;
      case 'highlight':
        await this.highlightAction(action);
        break;
      default:
        console.warn(`[DEMO] Unknown action type: ${action.type}`);
    }
  }

  private async navigateAction(action: DemoAction): Promise<void> {
    if (this.router && action.target) {
      console.log(`[DEMO] Navigating to: ${action.target}`);
      this.router.push(action.target);
      // Wait for navigation to complete
      await this.delay(1000);
    }
  }

  private async fillAction(action: DemoAction): Promise<void> {
    if (!action.target) {
      console.warn('Fill action requires a target selector');
      return;
    }
    
    const element = document.querySelector(action.target) as HTMLInputElement;
    if (element && action.value) {
      // Simulate typing animation
      if (action.animation === 'typing') {
        await this.simulateTyping(element, action.value);
      } else {
        element.value = action.value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  private async clickAction(action: DemoAction): Promise<void> {
    if (!action.target) {
      console.warn('Click action requires a target selector');
      return;
    }
    
    const element = document.querySelector(action.target) as HTMLElement;
    if (element) {
      // Highlight the element briefly before clicking
      await this.highlightElement(element, 500);
      element.click();
    }
  }

  private async selectAction(action: DemoAction): Promise<void> {
    if (!action.target) {
      console.warn('Select action requires a target selector');
      return;
    }
    
    const element = document.querySelector(action.target) as HTMLSelectElement;
    if (element && action.value) {
      element.value = action.value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  private async waitAction(action: DemoAction): Promise<void> {
    const duration = action.duration || 1000;
    await this.delay(duration);
  }

  private async highlightAction(action: DemoAction): Promise<void> {
    if (!action.target) {
      console.warn('Highlight action requires a target selector');
      return;
    }
    
    const element = document.querySelector(action.target) as HTMLElement;
    if (element) {
      const duration = action.duration || 2000;
      await this.highlightElement(element, duration);
    }
  }

  private async simulateTyping(element: HTMLInputElement, text: string): Promise<void> {
    element.value = '';
    element.focus();
    
    for (let i = 0; i < text.length; i++) {
      element.value = text.substring(0, i + 1);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await this.delay(50); // 50ms per character
    }
    
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  private async highlightElement(element: HTMLElement, duration: number): Promise<void> {
    const originalStyle = element.style.cssText;
    
    // Add highlight styling
    element.style.cssText += `
      outline: 3px solid #3b82f6 !important;
      outline-offset: 2px !important;
      background-color: rgba(59, 130, 246, 0.1) !important;
      transition: all 0.3s ease !important;
    `;
    
    // Remove highlight after duration
    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, duration);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getActionDelay(action: DemoAction): number {
    // Return delay based on action type and duration
    if (action.duration) {
      return action.duration;
    }
    
    switch (action.type) {
      case 'navigate':
        return 1500;
      case 'fill':
        return 800;
      case 'click':
        return 600;
      case 'select':
        return 500;
      default:
        return 300;
    }
  }
}