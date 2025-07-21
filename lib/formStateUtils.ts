// Form state management utilities
// Provides advanced form state coordination and progress tracking

import { ShipmentDetails } from '@/lib/types';

export interface FormStateManager {
  saveState: (key: string, data: any) => Promise<void>;
  loadState: (key: string) => Promise<any | null>;
  clearState: (key: string) => Promise<void>;
  getStateTimestamp: (key: string) => Promise<number | null>;
  detectConflict: (key: string, instanceId: string, currentData: any) => Promise<boolean>;
}

export interface FormProgressTracker {
  calculateProgress: (data: ShipmentDetails) => FormProgress;
  getRequiredFields: () => string[];
  isFieldComplete: (fieldPath: string, value: any) => boolean;
  getNextIncompleteField: (data: ShipmentDetails) => string | null;
}

export interface FormProgress {
  percentage: number;
  completedFields: number;
  totalFields: number;
  requiredFieldsComplete: boolean;
  nextIncompleteField: string | null;
  completionStatus: 'empty' | 'started' | 'nearly-complete' | 'complete';
}

/**
 * LocalStorage-based form state manager with conflict detection
 */
export class LocalStorageFormStateManager implements FormStateManager {
  
  async saveState(key: string, data: any): Promise<void> {
    console.log('LocalStorageFormStateManager: Saving state for key:', key);
    
    try {
      const serialized = JSON.stringify(data);
      const timestamp = Date.now();
      
      localStorage.setItem(key, serialized);
      localStorage.setItem(`${key}_timestamp`, timestamp.toString());
      localStorage.setItem(`${key}_version`, '1.0');
      
      console.log('LocalStorageFormStateManager: State saved successfully');
    } catch (error) {
      console.error('LocalStorageFormStateManager: Failed to save state:', error);
      
      // Handle quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        throw new Error('Storage quota exceeded. Please clear some data and try again.');
      }
      
      throw error;
    }
  }

  async loadState(key: string): Promise<any | null> {
    console.log('LocalStorageFormStateManager: Loading state for key:', key);
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log('LocalStorageFormStateManager: No stored state found');
        return null;
      }

      const parsed = JSON.parse(stored);
      console.log('LocalStorageFormStateManager: State loaded successfully');
      return parsed;
    } catch (error) {
      console.error('LocalStorageFormStateManager: Failed to load state:', error);
      
      // Clear corrupted data
      this.clearState(key);
      return null;
    }
  }

  async clearState(key: string): Promise<void> {
    console.log('LocalStorageFormStateManager: Clearing state for key:', key);
    
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
    localStorage.removeItem(`${key}_version`);
    localStorage.removeItem(`${key}_instance`);
    
    console.log('LocalStorageFormStateManager: State cleared');
  }

  async getStateTimestamp(key: string): Promise<number | null> {
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  async detectConflict(key: string, instanceId: string, currentData: any): Promise<boolean> {
    console.log('LocalStorageFormStateManager: Checking for conflicts');
    
    try {
      const storedInstanceId = localStorage.getItem(`${key}_instance`);
      const stored = localStorage.getItem(key);
      
      if (!stored || !storedInstanceId) {
        return false;
      }

      // Different instance modified the data
      if (storedInstanceId !== instanceId) {
        const currentSerialized = JSON.stringify(currentData);
        const storedSerialized = stored;
        
        // Data is different from what we have
        if (currentSerialized !== storedSerialized) {
          console.log('LocalStorageFormStateManager: Conflict detected');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('LocalStorageFormStateManager: Error detecting conflicts:', error);
      return false;
    }
  }
}

/**
 * Advanced form progress tracker with field-level analysis
 */
export class ShipmentFormProgressTracker implements FormProgressTracker {
  
  private readonly REQUIRED_FIELDS = [
    'origin.address',
    'origin.city', 
    'origin.state',
    'origin.zip',
    'origin.contactInfo.name',
    'origin.contactInfo.phone',
    'origin.contactInfo.email',
    'destination.address',
    'destination.city',
    'destination.state', 
    'destination.zip',
    'destination.contactInfo.name',
    'destination.contactInfo.phone',
    'destination.contactInfo.email',
    'package.weight.value',
    'package.dimensions.length',
    'package.dimensions.width',
    'package.dimensions.height',
    'package.declaredValue',
    'package.contents'
  ];

  calculateProgress(data: ShipmentDetails): FormProgress {
    console.log('ShipmentFormProgressTracker: Calculating progress');
    
    let completedFields = 0;
    let nextIncompleteField: string | null = null;
    
    for (const fieldPath of this.REQUIRED_FIELDS) {
      const value = this.getNestedValue(data, fieldPath);
      const isComplete = this.isFieldComplete(fieldPath, value);
      
      if (isComplete) {
        completedFields++;
      } else if (!nextIncompleteField) {
        nextIncompleteField = fieldPath;
      }
    }

    const totalFields = this.REQUIRED_FIELDS.length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    const requiredFieldsComplete = completedFields === totalFields;
    
    let completionStatus: FormProgress['completionStatus'] = 'empty';
    if (percentage === 0) {
      completionStatus = 'empty';
    } else if (percentage < 80) {
      completionStatus = 'started';
    } else if (percentage < 100) {
      completionStatus = 'nearly-complete';
    } else {
      completionStatus = 'complete';
    }

    const progress: FormProgress = {
      percentage,
      completedFields,
      totalFields,
      requiredFieldsComplete,
      nextIncompleteField,
      completionStatus
    };

    console.log('ShipmentFormProgressTracker: Progress calculated:', progress);
    return progress;
  }

  getRequiredFields(): string[] {
    return [...this.REQUIRED_FIELDS];
  }

  isFieldComplete(fieldPath: string, value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    // Numeric fields
    if (fieldPath.includes('weight.value') || 
        fieldPath.includes('dimensions.') ||
        fieldPath.includes('declaredValue')) {
      return typeof value === 'number' && value > 0;
    }

    // String fields
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return true;
  }

  getNextIncompleteField(data: ShipmentDetails): string | null {
    for (const fieldPath of this.REQUIRED_FIELDS) {
      const value = this.getNestedValue(data, fieldPath);
      if (!this.isFieldComplete(fieldPath, value)) {
        return fieldPath;
      }
    }
    return null;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * Form navigation controller with step validation
 */
export class FormNavigationController {
  
  constructor(private progressTracker: FormProgressTracker) {}

  canNavigateToStep(currentData: ShipmentDetails, targetStep: number): boolean {
    console.log('FormNavigationController: Checking navigation to step:', targetStep);
    
    const progress = this.progressTracker.calculateProgress(currentData);
    
    switch (targetStep) {
      case 1: // Shipment Details
        return true; // Always can go to first step
        
      case 2: // Pricing
        // Require all shipment details to be complete
        return progress.requiredFieldsComplete;
        
      case 3: // Payment
        // Require pricing selection (mock check)
        return progress.requiredFieldsComplete; // In real app, check pricing selection
        
      case 4: // Pickup
        // Require payment info (mock check)
        return progress.requiredFieldsComplete; // In real app, check payment selection
        
      case 5: // Review
        // Require pickup details (mock check)
        return progress.requiredFieldsComplete; // In real app, check pickup selection
        
      case 6: // Confirmation
        // Require all previous steps
        return progress.requiredFieldsComplete; // In real app, check all steps
        
      default:
        return false;
    }
  }

  getNavigationState(currentData: ShipmentDetails, currentStep: number): {
    canGoNext: boolean;
    canGoPrevious: boolean;
    nextStep: number | null;
    previousStep: number | null;
    blockedReason?: string;
  } {
    console.log('FormNavigationController: Getting navigation state for step:', currentStep);
    
    const progress = this.progressTracker.calculateProgress(currentData);
    
    const canGoPrevious = currentStep > 1;
    const previousStep = canGoPrevious ? currentStep - 1 : null;
    
    const canGoNext = this.canNavigateToStep(currentData, currentStep + 1);
    const nextStep = canGoNext ? currentStep + 1 : null;
    
    let blockedReason: string | undefined;
    if (!canGoNext && currentStep === 1) {
      if (!progress.requiredFieldsComplete) {
        blockedReason = `Complete all required fields. ${progress.completedFields}/${progress.totalFields} completed.`;
      }
    }

    return {
      canGoNext,
      canGoPrevious,
      nextStep,
      previousStep,
      blockedReason
    };
  }
}

/**
 * Auto-save manager with debouncing and conflict resolution
 */
export class AutoSaveManager {
  private timeout: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private stateManager: FormStateManager,
    private debounceMs: number = 2000
  ) {}

  scheduleAutoSave(key: string, data: any, instanceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('AutoSaveManager: Scheduling auto-save');
      
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(async () => {
        try {
          if (this.isRunning) {
            console.log('AutoSaveManager: Auto-save already running, skipping');
            resolve();
            return;
          }

          this.isRunning = true;
          
          // Check for conflicts before saving
          const hasConflict = await this.stateManager.detectConflict(key, instanceId, data);
          if (hasConflict) {
            console.log('AutoSaveManager: Conflict detected, skipping auto-save');
            reject(new Error('Conflict detected'));
            return;
          }

          // Save with instance tracking
          await this.stateManager.saveState(key, data);
          localStorage.setItem(`${key}_instance`, instanceId);
          
          console.log('AutoSaveManager: Auto-save completed');
          resolve();
        } catch (error) {
          console.error('AutoSaveManager: Auto-save failed:', error);
          reject(error);
        } finally {
          this.isRunning = false;
        }
      }, this.debounceMs);
    });
  }

  cancelAutoSave(): void {
    if (this.timeout) {
      console.log('AutoSaveManager: Cancelling auto-save');
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  isAutoSaveScheduled(): boolean {
    return this.timeout !== null;
  }
}

// Default instances for easy consumption
export const defaultStateManager = new LocalStorageFormStateManager();
export const defaultProgressTracker = new ShipmentFormProgressTracker();
export const defaultNavigationController = new FormNavigationController(defaultProgressTracker);
export const defaultAutoSaveManager = new AutoSaveManager(defaultStateManager);
