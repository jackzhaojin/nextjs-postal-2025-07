'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';
import type { 
  NextStepsConfiguration, 
  ChecklistItem, 
  ProcessMilestone,
  ChecklistCategory,
  HelpResource,
  ShippingTransaction 
} from '@/lib/types';

interface NextStepsSectionProps {
  transaction: ShippingTransaction;
  className?: string;
}

export default function NextStepsSection({ transaction, className = '' }: NextStepsSectionProps) {
  console.log('NextStepsSection: Rendering with transaction:', transaction.id);
  
  const [nextStepsConfig, setNextStepsConfig] = useState<NextStepsConfiguration | null>(null);
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<ChecklistCategory>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('NextStepsSection: Loading next steps configuration');
    loadNextStepsConfiguration();
    loadChecklistProgress();
  }, [transaction.id]);

  const loadNextStepsConfiguration = async () => {
    try {
      console.log('NextStepsSection: Fetching next steps configuration');
      
      // Mock configuration based on shipment characteristics
      const mockConfig: NextStepsConfiguration = {
        prePickupChecklist: generateChecklistItems(transaction),
        postPickupProcess: generateProcessMilestones(transaction),
        timelineEstimates: {
          trackingNumberAvailability: 4,
          deliveryConfirmationProcess: 'Confirmation sent within 1 hour of delivery',
          invoiceProcessingTimeline: 24,
          followUpCommunicationSchedule: [
            {
              milestone: 'pickup-confirmation',
              timing: 2,
              channels: ['email', 'sms'],
              content: 'Pickup completed successfully'
            },
            {
              milestone: 'in-transit-update',
              timing: 24,
              channels: ['email'],
              content: 'Package in transit with tracking details'
            },
            {
              milestone: 'delivery-confirmation',
              timing: 0,
              channels: ['email', 'sms'],
              content: 'Package delivered successfully'
            }
          ]
        },
        emergencyContacts: {
          support24x7: {
            name: 'Emergency Support',
            company: 'PostalFlow Support',
            phone: '1-800-POSTAL-1',
            email: 'emergency@postalflow.com'
          },
          claimsDepartment: {
            name: 'Claims Processing',
            company: 'PostalFlow Claims',
            phone: '1-800-POSTAL-2',
            email: 'claims@postalflow.com'
          },
          regulatoryCompliance: {
            name: 'Compliance Team',
            company: 'PostalFlow Compliance',
            phone: '1-800-POSTAL-3',
            email: 'compliance@postalflow.com'
          },
          legalInsurance: {
            name: 'Legal & Insurance',
            company: 'PostalFlow Legal',
            phone: '1-800-POSTAL-4',
            email: 'legal@postalflow.com'
          }
        }
      };

      setNextStepsConfig(mockConfig);
      console.log('NextStepsSection: Configuration loaded successfully');
    } catch (error) {
      console.error('NextStepsSection: Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChecklistItems = (transaction: ShippingTransaction): ChecklistItem[] => {
    console.log('NextStepsSection: Generating checklist items for transaction');
    
    const baseItems: ChecklistItem[] = [
      {
        id: 'package-secure',
        category: 'package-preparation',
        title: 'Secure Package Contents',
        description: 'Ensure all items are properly cushioned and package is sealed',
        completed: false,
        required: true,
        dependencies: [],
        estimatedTime: 15,
        helpResources: [
          {
            type: 'article',
            title: 'Proper Packaging Guidelines',
            url: '/help/packaging-guidelines',
            description: 'Learn how to properly package your items for shipping'
          }
        ]
      },
      {
        id: 'labeling-complete',
        category: 'package-preparation',
        title: 'Apply Shipping Labels',
        description: 'Print and attach all required shipping labels to package',
        completed: false,
        required: true,
        dependencies: ['package-secure'],
        estimatedTime: 5,
        helpResources: [
          {
            type: 'article',
            title: 'Label Placement Guide',
            url: '/help/label-placement',
            description: 'Proper label placement for successful delivery'
          }
        ]
      },
      {
        id: 'contents-documented',
        category: 'documentation',
        title: 'Document Package Contents',
        description: 'Create detailed inventory of package contents for insurance purposes',
        completed: false,
        required: transaction.shipmentDetails.package.declaredValue > 1000,
        dependencies: [],
        estimatedTime: 10,
        helpResources: [
          {
            type: 'checklist',
            title: 'Contents Documentation Checklist',
            url: '/help/contents-checklist',
            description: 'Step-by-step contents documentation'
          }
        ]
      },
      {
        id: 'authorization-setup',
        category: 'authorization',
        title: 'Set Up Authorized Personnel',
        description: 'Ensure authorized personnel are available during pickup window',
        completed: false,
        required: true,
        dependencies: [],
        estimatedTime: 5,
        helpResources: [
          {
            type: 'contact',
            title: 'Contact Support',
            url: 'tel:1-800-POSTAL-1',
            description: 'Call for assistance with authorization setup'
          }
        ]
      },
      {
        id: 'access-prepared',
        category: 'access-coordination',
        title: 'Prepare Access Instructions',
        description: 'Verify gate codes, parking instructions, and carrier notifications',
        completed: false,
        required: transaction.pickupDetails?.accessInstructions.securityRequired || false,
        dependencies: [],
        estimatedTime: 10,
        helpResources: [
          {
            type: 'article',
            title: 'Access Coordination Guide',
            url: '/help/access-coordination',
            description: 'How to prepare your location for pickup'
          }
        ]
      }
    ];

    // Add special handling requirements
    if (transaction.shipmentDetails.package.specialHandling.includes('hazmat')) {
      baseItems.push({
        id: 'hazmat-documentation',
        category: 'documentation',
        title: 'Complete Hazmat Documentation',
        description: 'Ensure all hazardous materials documentation is complete and accessible',
        completed: false,
        required: true,
        dependencies: ['contents-documented'],
        estimatedTime: 20,
        helpResources: [
          {
            type: 'article',
            title: 'Hazmat Documentation Requirements',
            url: '/help/hazmat-docs',
            description: 'Complete guide to hazmat shipping requirements'
          }
        ]
      });
    }

    if (transaction.shipmentDetails.package.specialHandling.includes('white-glove')) {
      baseItems.push({
        id: 'white-glove-coordination',
        category: 'access-coordination',
        title: 'Coordinate White Glove Service',
        description: 'Confirm special handling requirements and access needs',
        completed: false,
        required: true,
        dependencies: ['access-prepared'],
        estimatedTime: 15,
        helpResources: [
          {
            type: 'contact',
            title: 'White Glove Coordination',
            url: 'tel:1-800-POSTAL-5',
            description: 'Specialized support for white glove services'
          }
        ]
      });
    }

    return baseItems;
  };

  const generateProcessMilestones = (transaction: ShippingTransaction): ProcessMilestone[] => {
    console.log('NextStepsSection: Generating process milestones');
    
    const now = new Date();
    const pickupTime = new Date(transaction.pickupDetails?.date || now);
    
    return [
      {
        id: 'pickup-completion',
        title: 'Package Pickup',
        description: 'Driver collects package from your location',
        estimatedCompletion: pickupTime,
        status: 'pending',
        dependencies: [],
        notifications: [
          {
            type: 'sms',
            timing: -0.5, // 30 minutes before
            template: 'pickup-reminder',
            recipient: transaction.shipmentDetails.origin.contactInfo.phone
          }
        ]
      },
      {
        id: 'tracking-availability',
        title: 'Tracking Number Available',
        description: 'Tracking information becomes available for monitoring',
        estimatedCompletion: new Date(pickupTime.getTime() + 4 * 60 * 60 * 1000), // 4 hours after pickup
        status: 'pending',
        dependencies: ['pickup-completion'],
        notifications: [
          {
            type: 'email',
            timing: 0,
            template: 'tracking-available',
            recipient: transaction.shipmentDetails.origin.contactInfo.email
          }
        ]
      },
      {
        id: 'in-transit',
        title: 'Package In Transit',
        description: 'Package is moving through our network toward destination',
        estimatedCompletion: new Date(pickupTime.getTime() + 24 * 60 * 60 * 1000), // 24 hours after pickup
        status: 'pending',
        dependencies: ['tracking-availability'],
        notifications: [
          {
            type: 'email',
            timing: 0,
            template: 'in-transit-update',
            recipient: transaction.shipmentDetails.origin.contactInfo.email
          }
        ]
      },
      {
        id: 'delivery-completion',
        title: 'Package Delivered',
        description: 'Package successfully delivered to destination',
        estimatedCompletion: new Date(transaction.selectedOption?.estimatedDelivery || pickupTime.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        dependencies: ['in-transit'],
        notifications: [
          {
            type: 'email',
            timing: 0,
            template: 'delivery-confirmation',
            recipient: transaction.shipmentDetails.origin.contactInfo.email
          },
          {
            type: 'sms',
            timing: 0,
            template: 'delivery-confirmation-sms',
            recipient: transaction.shipmentDetails.origin.contactInfo.phone
          }
        ]
      }
    ];
  };

  const loadChecklistProgress = () => {
    try {
      console.log('NextStepsSection: Loading checklist progress from localStorage');
      const stored = localStorage.getItem(`checklist-progress-${transaction.id}`);
      if (stored) {
        const progress = JSON.parse(stored);
        setChecklistProgress(progress);
        console.log('NextStepsSection: Loaded progress:', progress);
      }
    } catch (error) {
      console.error('NextStepsSection: Error loading checklist progress:', error);
    }
  };

  const updateChecklistItem = (itemId: string, completed: boolean) => {
    console.log('NextStepsSection: Updating checklist item:', itemId, completed);
    
    const newProgress = { ...checklistProgress, [itemId]: completed };
    setChecklistProgress(newProgress);
    
    try {
      localStorage.setItem(`checklist-progress-${transaction.id}`, JSON.stringify(newProgress));
      console.log('NextStepsSection: Progress saved to localStorage');
    } catch (error) {
      console.error('NextStepsSection: Error saving progress:', error);
    }
  };

  const toggleCategory = (category: ChecklistCategory) => {
    console.log('NextStepsSection: Toggling category:', category);
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryItems = (category: ChecklistCategory) => {
    if (!nextStepsConfig) return [];
    return nextStepsConfig.prePickupChecklist.filter(item => item.category === category);
  };

  const getCategoryProgress = (category: ChecklistCategory) => {
    const items = getCategoryItems(category);
    if (items.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = items.filter(item => checklistProgress[item.id] || false).length;
    return {
      completed,
      total: items.length,
      percentage: Math.round((completed / items.length) * 100)
    };
  };

  const getOverallProgress = () => {
    if (!nextStepsConfig) return { completed: 0, total: 0, percentage: 0 };
    
    const total = nextStepsConfig.prePickupChecklist.length;
    const completed = nextStepsConfig.prePickupChecklist.filter(item => 
      checklistProgress[item.id] || false
    ).length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const renderHelpResource = (resource: HelpResource, index: number) => (
    <a
      key={index}
      href={resource.url}
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
      target={resource.type === 'contact' ? '_self' : '_blank'}
      rel={resource.type === 'contact' ? '' : 'noopener noreferrer'}
    >
      {resource.type === 'article' && <ExternalLink className="w-3 h-3" />}
      {resource.type === 'contact' && <HelpCircle className="w-3 h-3" />}
      {resource.title}
    </a>
  );

  const renderChecklistItem = (item: ChecklistItem) => {
    const isCompleted = checklistProgress[item.id] || false;
    const canComplete = item.dependencies.every(dep => checklistProgress[dep] || false);
    
    return (
      <div
        key={item.id}
        className={`border rounded-lg p-4 transition-all duration-200 ${
          isCompleted 
            ? 'border-green-200 bg-green-50' 
            : canComplete 
              ? 'border-gray-200 bg-white hover:border-blue-200' 
              : 'border-gray-100 bg-gray-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => canComplete && updateChecklistItem(item.id, !isCompleted)}
            disabled={!canComplete}
            className={`mt-1 flex-shrink-0 transition-colors duration-200 ${
              canComplete 
                ? 'cursor-pointer hover:scale-110' 
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                {item.title}
              </h4>
              {item.required && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  Required
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {item.estimatedTime}m
              </div>
            </div>
            
            <p className={`text-sm mb-3 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
              {item.description}
            </p>
            
            {!canComplete && item.dependencies.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mb-2">
                <AlertCircle className="w-3 h-3" />
                Complete prerequisite items first
              </div>
            )}
            
            {item.helpResources.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {item.helpResources.map(renderHelpResource)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategorySection = (category: ChecklistCategory) => {
    const items = getCategoryItems(category);
    if (items.length === 0) return null;
    
    const progress = getCategoryProgress(category);
    const isExpanded = expandedCategories.has(category);
    
    const categoryTitles: Record<ChecklistCategory, string> = {
      'package-preparation': 'Package Preparation',
      'documentation': 'Documentation',
      'authorization': 'Authorization Setup',
      'access-coordination': 'Access Coordination',
      'final-verification': 'Final Verification'
    };
    
    return (
      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">{categoryTitles[category]}</h3>
            <span className="text-sm text-gray-500">
              {progress.completed}/{progress.total} completed
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {progress.percentage}%
            </span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-4 bg-white">
            {items.map(renderChecklistItem)}
          </div>
        )}
      </div>
    );
  };

  const renderProcessTimeline = () => {
    if (!nextStepsConfig) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Process Timeline</h3>
        
        <div className="relative">
          {nextStepsConfig.postPickupProcess.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start gap-4 relative">
              {index < nextStepsConfig.postPickupProcess.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200" />
              )}
              
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.status === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : milestone.status === 'in-progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {milestone.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                <p className="text-xs text-gray-500">
                  Estimated: {milestone.estimatedCompletion.toLocaleDateString()} at{' '}
                  {milestone.estimatedCompletion.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Timeline Estimates</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tracking number available within {nextStepsConfig.timelineEstimates.trackingNumberAvailability} hours of pickup</li>
            <li>• {nextStepsConfig.timelineEstimates.deliveryConfirmationProcess}</li>
            <li>• Invoice processed within {nextStepsConfig.timelineEstimates.invoiceProcessingTimeline} hours</li>
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!nextStepsConfig) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load next steps information</p>
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const categories: ChecklistCategory[] = ['package-preparation', 'documentation', 'authorization', 'access-coordination', 'final-verification'];

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Next Steps</h2>
        <p className="text-gray-600">
          Complete these steps to ensure a smooth pickup and delivery process.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Pre-Pickup Preparation</h3>
          <span className="text-sm font-medium text-gray-700">
            {overallProgress.completed}/{overallProgress.total} completed
          </span>
        </div>
        
        <div className="w-full bg-white rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress.percentage}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          {overallProgress.percentage === 100 
            ? 'All preparation steps completed! You\'re ready for pickup.'
            : `${100 - overallProgress.percentage}% remaining to complete your preparation.`
          }
        </p>
      </div>

      {/* Checklist Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Preparation Checklist</h3>
        {categories.map(renderCategorySection)}
      </div>

      {/* Process Timeline */}
      {renderProcessTimeline()}

      {/* Emergency Contacts */}
      <div className="bg-red-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Emergency Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-red-800">24/7 Support</h4>
            <p className="text-sm text-red-700">{nextStepsConfig.emergencyContacts.support24x7.phone}</p>
            <p className="text-sm text-red-700">{nextStepsConfig.emergencyContacts.support24x7.email}</p>
          </div>
          <div>
            <h4 className="font-medium text-red-800">Claims Department</h4>
            <p className="text-sm text-red-700">{nextStepsConfig.emergencyContacts.claimsDepartment.phone}</p>
            <p className="text-sm text-red-700">{nextStepsConfig.emergencyContacts.claimsDepartment.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
