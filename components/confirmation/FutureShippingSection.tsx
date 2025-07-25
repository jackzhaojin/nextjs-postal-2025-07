'use client';

import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Bookmark, 
  MapPin, 
  Star, 
  Settings, 
  MessageSquare,
  Gift,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Heart,
  Plus,
  Check,
  Edit
} from 'lucide-react';
import type { 
  FutureShippingTools, 
  ShipmentTemplate, 
  SavedAddress,
  ReorderOption,
  UserPreferences,
  ShippingTransaction,
  LoyaltyProgram,
  FeedbackCollection 
} from '@/lib/types';

interface FutureShippingSectionProps {
  transaction: ShippingTransaction;
  className?: string;
}

export default function FutureShippingSection({ transaction, className = '' }: FutureShippingSectionProps) {
  console.log('FutureShippingSection: Rendering with transaction:', transaction.id);
  
  const [shippingTools, setShippingTools] = useState<FutureShippingTools | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    console.log('FutureShippingSection: Loading future shipping tools');
    loadFutureShippingTools();
  }, [transaction.id]);

  const loadFutureShippingTools = async () => {
    try {
      console.log('FutureShippingSection: Fetching future shipping tools');
      
      // Mock future shipping tools
      const mockTools: FutureShippingTools = {
        shipmentTemplates: generateShipmentTemplates(transaction),
        savedAddresses: generateSavedAddresses(transaction),
        quickReorderOptions: generateReorderOptions(transaction),
        preferenceSettings: {
          defaultOrigin: 'address-1',
          defaultPackageType: transaction.shipmentDetails.package.type,
          preferredServiceLevel: 'reliable',
          communicationChannels: ['email', 'sms'],
          notificationSettings: {
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: false,
            frequency: 'important',
            businessHoursOnly: false,
            languagePreference: 'en-US'
          },
          displayPreferences: {
            theme: 'light',
            density: 'comfortable',
            units: 'imperial',
            currency: 'USD',
            timezone: 'America/New_York'
          },
          privacySettings: {
            dataCollection: 'functional',
            analyticsOptIn: true,
            marketingOptIn: false,
            thirdPartySharing: false,
            dataRetentionPeriod: 2555
          }
        }
      };

      setShippingTools(mockTools);
      console.log('FutureShippingSection: Tools loaded successfully');
    } catch (error) {
      console.error('FutureShippingSection: Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShipmentTemplates = (transaction: ShippingTransaction): ShipmentTemplate[] => {
    console.log('FutureShippingSection: Generating shipment templates');
    
    return [
      {
        templateId: 'template-1',
        templateName: 'Similar to This Shipment',
        description: 'Template based on your current shipment details',
        shipmentDetails: {
          origin: transaction.shipmentDetails.origin,
          destination: { ...transaction.shipmentDetails.destination, contactInfo: { ...transaction.shipmentDetails.destination.contactInfo, name: '', phone: '', email: '' } },
          package: transaction.shipmentDetails.package,
          deliveryPreferences: transaction.shipmentDetails.deliveryPreferences
        },
        defaultServices: transaction.selectedOption ? [transaction.selectedOption.serviceType] : [],
        usageCount: 0,
        lastUsed: new Date(),
        createdDate: new Date(),
        tags: ['auto-generated', 'current-shipment']
      },
      {
        templateId: 'template-2',
        templateName: 'Standard Business Shipment',
        description: 'Common business shipment configuration',
        shipmentDetails: {
          origin: transaction.shipmentDetails.origin,
          destination: { ...transaction.shipmentDetails.destination, contactInfo: { ...transaction.shipmentDetails.destination.contactInfo, name: '', phone: '', email: '' } },
          package: {
            type: 'medium',
            dimensions: { length: 12, width: 9, height: 6, unit: 'in' },
            weight: { value: 5, unit: 'lbs' },
            declaredValue: 100,
            currency: 'USD',
            specialHandling: []
          },
          deliveryPreferences: {
            signatureRequired: true,
            adultSignatureRequired: false,
            smsConfirmation: true,
            photoProof: false,
            saturdayDelivery: false,
            holdAtLocation: false,
            serviceLevel: 'reliable'
          }
        },
        defaultServices: ['ground-business'],
        usageCount: 0,
        lastUsed: new Date(),
        createdDate: new Date(),
        tags: ['business', 'standard']
      }
    ];
  };

  const generateSavedAddresses = (transaction: ShippingTransaction): SavedAddress[] => {
    console.log('FutureShippingSection: Generating saved addresses');
    
    return [
      {
        addressId: 'address-1',
        nickname: 'My Business',
        address: transaction.shipmentDetails.origin,
        usageFrequency: 15,
        lastUsed: new Date(),
        verified: true,
        addressType: 'origin',
        defaultForType: true
      },
      {
        addressId: 'address-2',
        nickname: 'Current Destination',
        address: transaction.shipmentDetails.destination,
        usageFrequency: 1,
        lastUsed: new Date(),
        verified: true,
        addressType: 'destination',
        defaultForType: false
      }
    ];
  };

  const generateReorderOptions = (transaction: ShippingTransaction): ReorderOption[] => {
    console.log('FutureShippingSection: Generating reorder options');
    
    return [
      {
        reorderId: 'reorder-1',
        baseShipment: transaction,
        modifications: [],
        estimatedPrice: transaction.selectedOption?.pricing.total || 0,
        availability: {
          available: true,
          timeConstraints: {
            cutoffTime: '24',
            businessHoursOnly: false,
            excludedDays: [],
            processingTime: 1
          },
          locationConstraints: [],
          capacityLimits: {
            dailyLimit: 1000,
            currentBookings: 45,
            nextAvailableSlot: new Date(),
            waitlistAvailable: false
          },
          seasonalAvailability: []
        },
        quickOrderEnabled: true
      }
    ];
  };

  const submitFeedback = async () => {
    if (feedbackRating === 0) return;
    
    console.log('FutureShippingSection: Submitting feedback:', {
      rating: feedbackRating,
      comment: feedbackComment
    });
    
    try {
      // Mock feedback submission
      const feedbackData: FeedbackCollection = {
        overallRating: feedbackRating,
        serviceQuality: feedbackRating,
        deliveryPerformance: feedbackRating,
        customerSatisfaction: feedbackRating,
        detailedFeedback: [
          {
            category: 'booking-experience',
            rating: feedbackRating,
            comment: feedbackComment,
            severity: feedbackRating >= 4 ? 'positive' : feedbackRating >= 3 ? 'neutral' : 'negative'
          }
        ],
        improvementSuggestions: feedbackComment ? [feedbackComment] : [],
        submissionDate: new Date()
      };
      
      // Save to localStorage for persistence
      localStorage.setItem(`feedback-${transaction.id}`, JSON.stringify(feedbackData));
      
      setShowFeedbackForm(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      
      console.log('FutureShippingSection: Feedback submitted successfully');
    } catch (error) {
      console.error('FutureShippingSection: Error submitting feedback:', error);
    }
  };

  const createTemplate = () => {
    if (!newTemplateName.trim() || !shippingTools) return;
    
    console.log('FutureShippingSection: Creating new template:', newTemplateName);
    
    const newTemplate: ShipmentTemplate = {
      templateId: `template-${Date.now()}`,
      templateName: newTemplateName,
      description: `Custom template created from shipment ${transaction.confirmationNumber}`,
      shipmentDetails: transaction.shipmentDetails,
      defaultServices: transaction.selectedOption ? [transaction.selectedOption.serviceType] : [],
      usageCount: 0,
      lastUsed: new Date(),
      createdDate: new Date(),
      tags: ['custom', 'user-created']
    };
    
    const updatedTools = {
      ...shippingTools,
      shipmentTemplates: [...shippingTools.shipmentTemplates, newTemplate]
    };
    
    setShippingTools(updatedTools);
    setTemplateModalOpen(false);
    setNewTemplateName('');
  };

  const startReorder = (reorderId: string) => {
    console.log('FutureShippingSection: Starting reorder:', reorderId);
    
    // Navigate to shipping form with pre-filled data
    const reorderOption = shippingTools?.quickReorderOptions.find(opt => opt.reorderId === reorderId);
    if (reorderOption) {
      // Store reorder data in localStorage
      localStorage.setItem('reorder-data', JSON.stringify(reorderOption.baseShipment));
      
      // Navigate to shipping page
      window.location.href = '/shipping?reorder=true';
    }
  };

  const renderStarRating = (rating: number, onRate?: (rating: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onRate?.(star)}
          className={`transition-colors duration-200 ${
            onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          disabled={!onRate}
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderTemplate = (template: ShipmentTemplate) => (
    <div key={template.templateId} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-200 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{template.templateName}</h4>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        </div>
        <Bookmark className="w-5 h-5 text-blue-600" />
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Package Type:</span>
          <span className="font-medium capitalize">{template.shipmentDetails?.package?.type || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Used:</span>
          <span className="font-medium">{template.usageCount} times</span>
        </div>
        <div className="flex justify-between">
          <span>Last Used:</span>
          <span className="font-medium">{template.lastUsed.toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {template.tags.map(tag => (
          <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      
      <button
        onClick={() => {
          // Store template data and navigate to shipping form
          localStorage.setItem('template-data', JSON.stringify(template));
          window.location.href = '/shipping?template=' + template.templateId;
        }}
        className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors duration-200"
      >
        Use Template
      </button>
    </div>
  );

  const renderSavedAddress = (address: SavedAddress) => (
    <div key={address.addressId} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-green-200 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{address.nickname}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <div>{address.address.address}</div>
            {address.address.suite && <div>Suite {address.address.suite}</div>}
            <div>{address.address.city}, {address.address.state} {address.address.zip}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {address.verified && <Check className="w-4 h-4 text-green-600" />}
          <MapPin className="w-5 h-5 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium capitalize">{address.addressType}</span>
        </div>
        <div className="flex justify-between">
          <span>Used:</span>
          <span className="font-medium">{address.usageFrequency} times</span>
        </div>
        {address.defaultForType && (
          <div className="text-xs text-green-600 font-medium">Default {address.addressType} address</div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => {
            // Store address data and navigate to shipping form
            localStorage.setItem('selected-address', JSON.stringify(address));
            window.location.href = '/shipping?address=' + address.addressId;
          }}
          className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors duration-200"
        >
          Use Address
        </button>
        <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200">
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );

  const renderReorderOption = (option: ReorderOption) => (
    <div key={option.reorderId} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-purple-200 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">Repeat This Shipment</h4>
          <p className="text-sm text-gray-600 mt-1">
            Ship to {option.baseShipment.shipmentDetails.destination.city}, {option.baseShipment.shipmentDetails.destination.state}
          </p>
        </div>
        <RotateCcw className="w-5 h-5 text-purple-600" />
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Package:</span>
          <span className="font-medium capitalize">{option.baseShipment.shipmentDetails.package.type}</span>
        </div>
        <div className="flex justify-between">
          <span>Service:</span>
          <span className="font-medium">{option.baseShipment.selectedOption?.serviceType}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Cost:</span>
          <span className="font-medium">${option.estimatedPrice.toFixed(2)}</span>
        </div>
      </div>
      
      {option.modifications.length > 0 && (
        <div className="bg-yellow-50 rounded p-2 mb-4">
          <div className="text-xs text-yellow-800 font-medium mb-1">Suggested Updates:</div>
          {option.modifications.map((mod, index) => (
            <div key={index} className="text-xs text-yellow-700">
              • {mod.reason}
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={() => startReorder(option.reorderId)}
        className="w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700 transition-colors duration-200"
      >
        {option.quickOrderEnabled ? 'Quick Reorder' : 'Start Reorder'}
      </button>
    </div>
  );

  const renderEngagementSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Feedback */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Share Feedback</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Help us improve our service by sharing your experience.
        </p>
        
        {!showFeedbackForm ? (
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Rate Experience
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating:
              </label>
              {renderStarRating(feedbackRating, setFeedbackRating)}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (optional):
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={submitFeedback}
                disabled={feedbackRating === 0}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowFeedbackForm(false);
                  setFeedbackRating(0);
                  setFeedbackComment('');
                }}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loyalty Program */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-6 h-6 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Loyalty Rewards</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Current Level:</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              Bronze
            </span>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Points Balance:</span>
              <span className="font-medium">250 pts</span>
            </div>
            <div className="text-xs text-gray-500">+{Math.round((transaction.selectedOption?.pricing.total || 0) * 10)} pts from this shipment</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }} />
          </div>
          <div className="text-xs text-gray-500">750 pts to Silver level</div>
        </div>
        
        <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700 transition-colors duration-200">
          View Rewards
        </button>
      </div>

      {/* Newsletter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-green-600" />
          <h3 className="font-semibold text-gray-900">Stay Informed</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Get shipping tips, industry updates, and exclusive offers.
        </p>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newsletterSubscribed}
              onChange={(e) => setNewsletterSubscribed(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Subscribe to newsletter</span>
          </label>
          
          <button
            disabled={!newsletterSubscribed}
            className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Community */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Community</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Connect with other shippers and share best practices.
        </p>
        
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline">
            → Join Discussion Forum
          </button>
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline">
            → Attend Webinars
          </button>
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline">
            → Read Success Stories
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shippingTools) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load shipping tools</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Future Shipping & Engagement</h2>
        <p className="text-gray-600">
          Save time on future shipments and stay connected with our community.
        </p>
      </div>

      {/* Quick Reorder */}
      {shippingTools.quickReorderOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reorder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shippingTools.quickReorderOptions.map(renderReorderOption)}
          </div>
        </div>
      )}

      {/* Templates and Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipment Templates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Shipment Templates</h3>
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
          
          <div className="space-y-4">
            {shippingTools.shipmentTemplates.map(renderTemplate)}
          </div>
        </div>

        {/* Saved Addresses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
            <button
              onClick={() => window.location.href = '/shipping?add-address=true'}
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>
          
          <div className="space-y-4">
            {shippingTools.savedAddresses.map(renderSavedAddress)}
          </div>
        </div>
      </div>

      {/* Customer Engagement */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Experience & Community</h3>
        {renderEngagementSection()}
      </div>

      {/* Template Creation Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Shipment Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name:
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  autoFocus
                />
              </div>
              
              <div className="text-sm text-gray-600">
                This template will be based on your current shipment configuration and can be used for future shipments with similar requirements.
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={createTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </button>
              <button
                onClick={() => {
                  setTemplateModalOpen(false);
                  setNewTemplateName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
