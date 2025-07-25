'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Shield, Clock, MapPin, Package, AlertCircle, Check, Plus } from 'lucide-react';
import type { 
  AdditionalServicesPortfolio, 
  AdditionalService, 
  ServiceRecommendation,
  ServiceBundle,
  ShippingTransaction,
  ServiceCategory 
} from '@/lib/types';

interface AdditionalServicesSectionProps {
  transaction: ShippingTransaction;
  className?: string;
}

export default function AdditionalServicesSection({ transaction, className = '' }: AdditionalServicesSectionProps) {
  console.log('AdditionalServicesSection: Rendering with transaction:', transaction.id);
  
  const [servicesPortfolio, setServicesPortfolio] = useState<AdditionalServicesPortfolio | null>(null);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('insurance-enhancement');
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    console.log('AdditionalServicesSection: Loading services portfolio');
    loadServicesPortfolio();
  }, [transaction.id]);

  useEffect(() => {
    calculateOrderTotal();
  }, [selectedServices, selectedBundle, servicesPortfolio]);

  const loadServicesPortfolio = async () => {
    try {
      console.log('AdditionalServicesSection: Fetching services portfolio');
      
      // Mock services portfolio based on shipment characteristics
      const mockPortfolio: AdditionalServicesPortfolio = {
        availableServices: generateAvailableServices(transaction),
        recommendations: generateRecommendations(transaction),
        bundleOffers: generateBundleOffers(transaction),
        limitations: {
          geographicRestrictions: ['AK', 'HI', 'PR'],
          shipmentTypeRestrictions: ['hazmat'],
          customerTypeRestrictions: [],
          timeRestrictions: [
            {
              type: 'booking-window',
              startTime: '08:00',
              endTime: '17:00',
              description: 'Services can only be added during business hours'
            }
          ]
        }
      };

      setServicesPortfolio(mockPortfolio);
      console.log('AdditionalServicesSection: Portfolio loaded successfully');
    } catch (error) {
      console.error('AdditionalServicesSection: Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableServices = (transaction: ShippingTransaction): AdditionalService[] => {
    console.log('AdditionalServicesSection: Generating available services');
    
    const baseServices: AdditionalService[] = [
      {
        serviceId: 'enhanced-insurance',
        serviceName: 'Enhanced Insurance Coverage',
        category: 'insurance-enhancement',
        description: 'Increase insurance coverage up to $10,000 with lower deductible',
        pricing: {
          basePrice: 25.00,
          currency: 'USD',
          discounts: [],
          calculationMethod: 'percentage',
          priceBreakdown: [
            { label: 'Base Coverage Fee', amount: 25.00, type: 'base' },
            { label: 'Processing Fee', amount: 2.50, type: 'fee' }
          ]
        },
        availability: {
          available: true,
          timeConstraints: {
            cutoffTime: '24',
            businessHoursOnly: false,
            excludedDays: [],
            processingTime: 0
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
        requirements: [
          {
            type: 'shipment',
            condition: 'declaredValue',
            value: 1000,
            operator: 'greater'
          }
        ],
        benefits: [
          'Coverage up to $10,000',
          'Reduced deductible to $25',
          'Expedited claims processing',
          'Direct reimbursement'
        ]
      },
      {
        serviceId: 'address-change',
        serviceName: 'Delivery Address Change',
        category: 'delivery-modification',
        description: 'Change delivery address after pickup (within same zip code)',
        pricing: {
          basePrice: 15.00,
          currency: 'USD',
          discounts: [],
          calculationMethod: 'fixed',
          priceBreakdown: [
            { label: 'Address Change Fee', amount: 15.00, type: 'base' }
          ]
        },
        availability: {
          available: true,
          timeConstraints: {
            cutoffTime: '12',
            businessHoursOnly: true,
            excludedDays: ['Saturday', 'Sunday'],
            processingTime: 2
          },
          locationConstraints: ['same-zip-code'],
          capacityLimits: {
            dailyLimit: 100,
            currentBookings: 23,
            nextAvailableSlot: new Date(),
            waitlistAvailable: true
          },
          seasonalAvailability: []
        },
        requirements: [
          {
            type: 'timing',
            condition: 'hoursAfterPickup',
            value: 12,
            operator: 'less'
          }
        ],
        benefits: [
          'Change address after pickup',
          'Same-day processing',
          'Email confirmation',
          'Updated tracking information'
        ]
      },
      {
        serviceId: 'hold-at-location',
        serviceName: 'Hold at Pickup Location',
        category: 'convenience-services',
        description: 'Hold package at nearby pickup location for customer collection',
        pricing: {
          basePrice: 5.00,
          currency: 'USD',
          discounts: [
            {
              type: 'loyalty',
              amount: 2.00,
              conditions: ['Gold member or higher'],
              validUntil: new Date('2025-12-31')
            }
          ],
          calculationMethod: 'fixed',
          priceBreakdown: [
            { label: 'Hold Fee', amount: 5.00, type: 'base' },
            { label: 'Loyalty Discount', amount: -2.00, type: 'discount' }
          ]
        },
        availability: {
          available: true,
          timeConstraints: {
            cutoffTime: '48',
            businessHoursOnly: false,
            excludedDays: [],
            processingTime: 4
          },
          locationConstraints: [],
          capacityLimits: {
            dailyLimit: 200,
            currentBookings: 67,
            nextAvailableSlot: new Date(),
            waitlistAvailable: false
          },
          seasonalAvailability: []
        },
        requirements: [],
        benefits: [
          'Secure package storage',
          'Extended hold period (7 days)',
          'Convenient pickup hours',
          'Photo ID verification'
        ]
      },
      {
        serviceId: 'packaging-consultation',
        serviceName: 'Packaging Optimization Consultation',
        category: 'value-added-services',
        description: 'Expert analysis and recommendations for optimal packaging',
        pricing: {
          basePrice: 75.00,
          currency: 'USD',
          discounts: [],
          calculationMethod: 'fixed',
          priceBreakdown: [
            { label: 'Consultation Fee', amount: 75.00, type: 'base' },
            { label: 'Report Generation', amount: 15.00, type: 'fee' }
          ]
        },
        availability: {
          available: true,
          timeConstraints: {
            cutoffTime: '72',
            businessHoursOnly: true,
            excludedDays: ['Saturday', 'Sunday'],
            processingTime: 24
          },
          locationConstraints: [],
          capacityLimits: {
            dailyLimit: 10,
            currentBookings: 3,
            nextAvailableSlot: new Date(),
            waitlistAvailable: true
          },
          seasonalAvailability: []
        },
        requirements: [
          {
            type: 'customer',
            condition: 'monthlyVolume',
            value: 50,
            operator: 'greater'
          }
        ],
        benefits: [
          'Expert packaging analysis',
          'Cost optimization recommendations',
          'Damage reduction strategies',
          'Custom packaging solutions'
        ]
      }
    ];

    // Add white glove services if applicable
    if (transaction.shipmentDetails.package.specialHandling.includes('white-glove')) {
      baseServices.push({
        serviceId: 'premium-white-glove',
        serviceName: 'Premium White Glove Enhancement',
        category: 'value-added-services',
        description: 'Enhanced white glove service with assembly and placement',
        pricing: {
          basePrice: 150.00,
          currency: 'USD',
          discounts: [],
          calculationMethod: 'fixed',
          priceBreakdown: [
            { label: 'Enhanced Service Fee', amount: 150.00, type: 'base' },
            { label: 'Insurance Upgrade', amount: 25.00, type: 'fee' }
          ]
        },
        availability: {
          available: true,
          timeConstraints: {
            cutoffTime: '48',
            businessHoursOnly: true,
            excludedDays: ['Sunday'],
            processingTime: 12
          },
          locationConstraints: [],
          capacityLimits: {
            dailyLimit: 5,
            currentBookings: 1,
            nextAvailableSlot: new Date(),
            waitlistAvailable: false
          },
          seasonalAvailability: []
        },
        requirements: [],
        benefits: [
          'Professional assembly service',
          'Room-of-choice placement',
          'Packaging removal',
          'Enhanced insurance coverage'
        ]
      });
    }

    return baseServices;
  };

  const generateRecommendations = (transaction: ShippingTransaction): ServiceRecommendation[] => {
    console.log('AdditionalServicesSection: Generating service recommendations');
    
    const recommendations: ServiceRecommendation[] = [];
    
    // High-value shipment insurance recommendation
    if (transaction.shipmentDetails.package.declaredValue > 2000) {
      recommendations.push({
        serviceId: 'enhanced-insurance',
        recommendationScore: 0.9,
        reasonCode: 'value-optimization',
        personalizedMessage: 'Your shipment value exceeds $2,000. Enhanced insurance provides better protection.',
        urgency: 'high'
      });
    }

    // Geographic risk assessment
    const destination = transaction.shipmentDetails.destination;
    if (['AK', 'HI', 'MT', 'WY'].includes(destination.state)) {
      recommendations.push({
        serviceId: 'hold-at-location',
        recommendationScore: 0.7,
        reasonCode: 'geographic-risk',
        personalizedMessage: 'Remote delivery location detected. Hold at location ensures secure delivery.',
        urgency: 'medium'
      });
    }

    // Fragile handling recommendation
    if (transaction.shipmentDetails.package.specialHandling.includes('fragile')) {
      recommendations.push({
        serviceId: 'packaging-consultation',
        recommendationScore: 0.8,
        reasonCode: 'compliance-requirement',
        personalizedMessage: 'Fragile items benefit from packaging optimization to prevent damage.',
        urgency: 'medium'
      });
    }

    return recommendations;
  };

  const generateBundleOffers = (transaction: ShippingTransaction): ServiceBundle[] => {
    console.log('AdditionalServicesSection: Generating bundle offers');
    
    return [
      {
        bundleId: 'peace-of-mind',
        bundleName: 'Peace of Mind Bundle',
        services: ['enhanced-insurance', 'hold-at-location'],
        totalPrice: 25.00,
        savings: 5.00,
        description: 'Enhanced insurance plus flexible delivery options',
        benefits: [
          'Maximum insurance protection',
          'Flexible delivery location',
          'Priority customer support',
          'Extended tracking notifications'
        ],
        limitations: [
          'Available within 48 hours of pickup',
          'Geographic restrictions may apply'
        ]
      },
      {
        bundleId: 'business-optimization',
        bundleName: 'Business Optimization Package',
        services: ['packaging-consultation', 'enhanced-insurance'],
        totalPrice: 85.00,
        savings: 15.00,
        description: 'Comprehensive shipping optimization for business customers',
        benefits: [
          'Expert packaging analysis',
          'Enhanced insurance coverage',
          'Cost optimization report',
          'Quarterly review session'
        ],
        limitations: [
          'Minimum 50 shipments per month required',
          'Business hours consultation only'
        ]
      }
    ];
  };

  const calculateOrderTotal = () => {
    if (!servicesPortfolio) return;
    
    let total = 0;
    
    if (selectedBundle) {
      const bundle = servicesPortfolio.bundleOffers.find(b => b.bundleId === selectedBundle);
      if (bundle) {
        total = bundle.totalPrice;
      }
    } else {
      selectedServices.forEach(serviceId => {
        const service = servicesPortfolio.availableServices.find(s => s.serviceId === serviceId);
        if (service) {
          total += service.pricing.basePrice;
          // Apply discounts
          service.pricing.discounts.forEach(discount => {
            total -= discount.amount;
          });
        }
      });
    }
    
    setOrderTotal(total);
    console.log('AdditionalServicesSection: Order total calculated:', total);
  };

  const toggleService = (serviceId: string) => {
    console.log('AdditionalServicesSection: Toggling service:', serviceId);
    
    if (selectedBundle) {
      setSelectedBundle(null);
    }
    
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const selectBundle = (bundleId: string) => {
    console.log('AdditionalServicesSection: Selecting bundle:', bundleId);
    
    if (selectedBundle === bundleId) {
      setSelectedBundle(null);
    } else {
      setSelectedBundle(bundleId);
      setSelectedServices(new Set());
    }
  };

  const getServiceIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'insurance-enhancement':
        return <Shield className="w-5 h-5" />;
      case 'delivery-modification':
        return <MapPin className="w-5 h-5" />;
      case 'convenience-services':
        return <Clock className="w-5 h-5" />;
      case 'value-added-services':
        return <Package className="w-5 h-5" />;
      case 'emergency-services':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryServices = (category: ServiceCategory) => {
    if (!servicesPortfolio) return [];
    return servicesPortfolio.availableServices.filter(service => service.category === category);
  };

  const renderServiceCard = (service: AdditionalService) => {
    const isSelected = selectedServices.has(service.serviceId) || 
                     (selectedBundle && servicesPortfolio?.bundleOffers
                       .find(b => b.bundleId === selectedBundle)?.services.includes(service.serviceId));
    
    const finalPrice = service.pricing.basePrice - 
                      service.pricing.discounts.reduce((sum, discount) => sum + discount.amount, 0);
    
    return (
      <div
        key={service.serviceId}
        className={`border rounded-lg p-6 transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
        }`}
        onClick={() => toggleService(service.serviceId)}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {getServiceIcon(service.category)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{service.serviceName}</h4>
              <div className="flex items-center gap-2">
                {service.pricing.discounts.length > 0 && (
                  <span className="text-sm line-through text-gray-500">
                    ${service.pricing.basePrice.toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-bold text-gray-900">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{service.description}</p>
            
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Benefits:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {service.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              {service.pricing.discounts.length > 0 && (
                <div className="bg-green-50 rounded p-2">
                  <span className="text-sm font-medium text-green-800">
                    Save ${service.pricing.discounts.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-green-600 ml-2">
                    ({service.pricing.discounts[0].conditions.join(', ')})
                  </span>
                </div>
              )}
              
              {!service.availability.available && (
                <div className="bg-yellow-50 rounded p-2">
                  <span className="text-sm text-yellow-800">
                    Available within {service.availability.timeConstraints.processingTime} hours
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {isSelected ? (
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBundleCard = (bundle: ServiceBundle) => {
    const isSelected = selectedBundle === bundle.bundleId;
    
    return (
      <div
        key={bundle.bundleId}
        className={`border rounded-lg p-6 transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-green-500 bg-green-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-green-200 hover:shadow-sm'
        }`}
        onClick={() => selectBundle(bundle.bundleId)}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Package className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{bundle.bundleName}</h4>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Save ${bundle.savings.toFixed(2)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${bundle.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
            
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Included Benefits:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {bundle.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              {bundle.limitations.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Limitations:</span>
                  <ul className="mt-1 space-y-1">
                    {bundle.limitations.map((limitation, index) => (
                      <li key={index}>• {limitation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {isSelected ? (
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!servicesPortfolio || servicesPortfolio.recommendations.length === 0) return null;
    
    return (
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Recommended for You
        </h3>
        
        <div className="space-y-3">
          {servicesPortfolio.recommendations.map((rec, index) => {
            const service = servicesPortfolio.availableServices.find(s => s.serviceId === rec.serviceId);
            if (!service) return null;
            
            return (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    rec.urgency === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : rec.urgency === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.urgency} priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.personalizedMessage}</p>
                <button
                  onClick={() => toggleService(rec.serviceId)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add to Order →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!servicesPortfolio) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load additional services</p>
      </div>
    );
  }

  const categories: ServiceCategory[] = ['insurance-enhancement', 'delivery-modification', 'convenience-services', 'value-added-services'];
  const categoryTitles: Record<ServiceCategory, string> = {
    'insurance-enhancement': 'Insurance & Protection',
    'delivery-modification': 'Delivery Options',
    'convenience-services': 'Convenience Services',
    'value-added-services': 'Value-Added Services',
    'emergency-services': 'Emergency Services'
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Services</h2>
        <p className="text-gray-600">
          Enhance your shipping experience with our optional services and protection plans.
        </p>
      </div>

      {/* Recommendations */}
      {renderRecommendations()}

      {/* Bundle Offers */}
      {servicesPortfolio.bundleOffers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Offers</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {servicesPortfolio.bundleOffers.map(renderBundleCard)}
          </div>
        </div>
      )}

      {/* Service Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Services</h3>
        
        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => {
            const services = getCategoryServices(category);
            if (services.length === 0) return null;
            
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryTitles[category]} ({services.length})
              </button>
            );
          })}
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getCategoryServices(activeCategory).map(renderServiceCard)}
        </div>
      </div>

      {/* Order Summary */}
      {(selectedServices.size > 0 || selectedBundle) && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Summary
          </h3>
          
          <div className="space-y-2 mb-4">
            {selectedBundle && (
              <div className="flex justify-between">
                <span className="text-gray-700">
                  {servicesPortfolio.bundleOffers.find(b => b.bundleId === selectedBundle)?.bundleName}
                </span>
                <span className="font-medium">${orderTotal.toFixed(2)}</span>
              </div>
            )}
            
            {Array.from(selectedServices).map(serviceId => {
              const service = servicesPortfolio.availableServices.find(s => s.serviceId === serviceId);
              if (!service) return null;
              
              const finalPrice = service.pricing.basePrice - 
                                service.pricing.discounts.reduce((sum, discount) => sum + discount.amount, 0);
              
              return (
                <div key={serviceId} className="flex justify-between">
                  <span className="text-gray-700">{service.serviceName}</span>
                  <span className="font-medium">${finalPrice.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
            Add Services to Order
          </button>
        </div>
      )}
    </div>
  );
}
