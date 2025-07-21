'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HelpCircle, Info, AlertTriangle, BookOpen, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface HelpContent {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'tip' | 'regulation' | 'best-practice';
  content: string[];
  links?: { label: string; url: string }[];
  examples?: string[];
  regulations?: string[];
}

interface ContextualHelpProps {
  fieldId: string;
  fieldLabel?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'click' | 'hover' | 'focus';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onHelpUsed?: (fieldId: string, helpId: string) => void;
}

const HELP_DATABASE: Record<string, HelpContent[]> = {
  'origin-address': [
    {
      id: 'address-format',
      title: 'Address Format Requirements',
      description: 'Proper address formatting ensures accurate delivery',
      type: 'info',
      content: [
        'Include building number and street name',
        'Use standard abbreviations (St, Ave, Blvd)',
        'Avoid special characters or symbols',
        'Double-check spelling for accuracy'
      ],
      examples: ['123 Main St', '456 Business Ave Suite 200', '789 Industrial Blvd Unit A']
    },
    {
      id: 'commercial-vs-residential',
      title: 'Commercial vs Residential Addresses',
      description: 'Address type affects shipping costs and delivery options',
      type: 'tip',
      content: [
        'Commercial addresses typically have lower delivery costs',
        'Residential addresses may require signature confirmation',
        'Business hours affect delivery windows',
        'Loading dock availability impacts pickup times'
      ]
    }
  ],
  'destination-address': [
    {
      id: 'address-validation',
      title: 'Address Validation Best Practices',
      description: 'Validate addresses to prevent delivery delays',
      type: 'best-practice',
      content: [
        'Verify address exists using postal service tools',
        'Confirm business hours for commercial deliveries',
        'Check for access restrictions or security requirements',
        'Validate ZIP codes match city and state'
      ]
    }
  ],
  'package-weight': [
    {
      id: 'dimensional-weight',
      title: 'Understanding Dimensional Weight',
      description: 'Large packages may be charged by dimensional weight instead of actual weight',
      type: 'info',
      content: [
        'Dimensional weight = (L × W × H) ÷ 166',
        'Billing weight is the greater of actual or dimensional weight',
        'Optimize packaging to reduce dimensional weight',
        'Consider package consolidation for multiple items'
      ],
      examples: ['24" × 18" × 12" package = 31.3 lbs dimensional weight']
    },
    {
      id: 'weight-accuracy',
      title: 'Accurate Weight Reporting',
      description: 'Incorrect weights can result in additional charges',
      type: 'warning',
      content: [
        'Use a certified scale for accurate measurements',
        'Include packaging weight in total',
        'Round up to nearest 0.1 lb for safety margin',
        'Underreporting weight may result in penalties'
      ],
      regulations: ['DOT regulations require accurate weight reporting for commercial shipments']
    }
  ],
  'package-dimensions': [
    {
      id: 'measurement-tips',
      title: 'Accurate Dimension Measurement',
      description: 'Proper measurement prevents unexpected charges',
      type: 'best-practice',
      content: [
        'Measure the longest, widest, and highest points',
        'Include any protruding parts or irregular shapes',
        'Round up to the nearest inch',
        'Account for packaging materials and padding'
      ]
    },
    {
      id: 'size-restrictions',
      title: 'Size Restrictions and Limitations',
      description: 'Different carriers have varying size limits',
      type: 'regulation',
      content: [
        'Standard packages: maximum 108" in length + girth',
        'Oversized packages require special handling',
        'Some carriers limit total dimensions (L+W+H)',
        'Extremely large items may require freight service'
      ],
      regulations: ['IATA regulations for air transport', 'DOT ground transportation limits']
    }
  ],
  'declared-value': [
    {
      id: 'insurance-requirements',
      title: 'Declared Value and Insurance',
      description: 'Proper valuation protects your shipment',
      type: 'info',
      content: [
        'Declared value should reflect actual replacement cost',
        'Include tax and shipping in total value',
        'Insurance premiums are based on declared value',
        'Document high-value items with photos/receipts'
      ]
    },
    {
      id: 'value-restrictions',
      title: 'Value Limitations and Requirements',
      description: 'High-value shipments have special requirements',
      type: 'warning',
      content: [
        'Values over $1,000 may require additional documentation',
        'Some items have coverage limitations',
        'Antiques and art require special appraisal',
        'Electronics may need original purchase receipts'
      ],
      regulations: ['Customs regulations for international shipments over $2,500']
    }
  ],
  'special-handling': [
    {
      id: 'fragile-handling',
      title: 'Fragile Item Best Practices',
      description: 'Proper handling reduces damage risk',
      type: 'best-practice',
      content: [
        'Use appropriate cushioning materials',
        'Mark "This Side Up" for orientation-sensitive items',
        'Consider double-boxing for extra protection',
        'Document condition with photos before shipping'
      ]
    },
    {
      id: 'hazmat-requirements',
      title: 'Hazardous Materials Regulations',
      description: 'Special requirements for dangerous goods',
      type: 'regulation',
      content: [
        'Proper classification required (UN numbers)',
        'Special packaging and labeling mandatory',
        '24/7 emergency contact information needed',
        'Training certification may be required'
      ],
      regulations: ['DOT Hazmat regulations 49 CFR', 'IATA Dangerous Goods Regulations'],
      links: [
        { label: 'DOT Hazmat Guide', url: 'https://www.transportation.gov/hazmat' },
        { label: 'IATA Guidelines', url: 'https://www.iata.org/en/cargo/dgr/' }
      ]
    }
  ],
  'contact-phone': [
    {
      id: 'phone-requirements',
      title: 'Contact Phone Best Practices',
      description: 'Accurate contact info ensures smooth delivery',
      type: 'info',
      content: [
        'Provide a number that will be answered during business hours',
        'Include area code for all phone numbers',
        'Mobile numbers preferred for real-time communication',
        'Backup contact recommended for high-value shipments'
      ]
    }
  ],
  'contact-email': [
    {
      id: 'email-notifications',
      title: 'Email Notifications and Tracking',
      description: 'Stay informed about your shipment status',
      type: 'tip',
      content: [
        'Use a monitored email address',
        'Check spam/junk folders for shipping notifications',
        'Add carrier domains to safe sender list',
        'Multiple email addresses can receive updates'
      ]
    }
  ]
};

export function ContextualHelp({
  fieldId,
  fieldLabel,
  position = 'right',
  trigger = 'click',
  size = 'md',
  className = '',
  onHelpUsed
}: ContextualHelpProps) {
  console.log('ContextualHelp: Rendering for field:', fieldId);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedHelpId, setSelectedHelpId] = useState<string | null>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const helpContent = HELP_DATABASE[fieldId] || [];
  
  const handleOpen = useCallback(() => {
    console.log('ContextualHelp: Opening help for field:', fieldId);
    setIsOpen(true);
  }, [fieldId]);

  const handleClose = useCallback(() => {
    console.log('ContextualHelp: Closing help');
    setIsOpen(false);
    setSelectedHelpId(null);
  }, []);

  const handleHelpSelect = useCallback((helpId: string) => {
    console.log('ContextualHelp: Help item selected:', helpId);
    setSelectedHelpId(helpId);
    onHelpUsed?.(fieldId, helpId);
  }, [fieldId, onHelpUsed]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleClose]);

  const getHelpIcon = (type: HelpContent['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'tip': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'regulation': return <BookOpen className="h-4 w-4 text-red-500" />;
      case 'best-practice': return <Info className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPositionClasses = () => {
    const sizeClasses = {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96'
    };

    const positionClasses = {
      top: 'bottom-full mb-2 left-0',
      bottom: 'top-full mt-2 left-0',
      left: 'right-full mr-2 top-0',
      right: 'left-full ml-2 top-0'
    };

    return `${sizeClasses[size]} ${positionClasses[position]}`;
  };

  if (helpContent.length === 0) {
    return null;
  }

  const selectedHelp = helpContent.find(h => h.id === selectedHelpId);

  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        onClick={trigger === 'click' ? handleOpen : undefined}
        onMouseEnter={trigger === 'hover' ? handleOpen : undefined}
        onMouseLeave={trigger === 'hover' ? handleClose : undefined}
        onFocus={trigger === 'focus' ? handleOpen : undefined}
        aria-label={`Help for ${fieldLabel || fieldId}`}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          ref={helpRef}
          className={`absolute z-50 ${getPositionClasses()}`}
          role="dialog"
          aria-labelledby="help-title"
        >
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle id="help-title" className="text-sm font-medium">
                  Help: {fieldLabel || fieldId}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleClose}
                  aria-label="Close help"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {!selectedHelpId ? (
                // Help topics list
                <div className="space-y-2">
                  {helpContent.map((help) => (
                    <button
                      key={help.id}
                      className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                      onClick={() => handleHelpSelect(help.id)}
                    >
                      <div className="flex items-start gap-2">
                        {getHelpIcon(help.type)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{help.title}</div>
                          <div className="text-xs text-gray-600">{help.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Selected help content
                selectedHelp && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setSelectedHelpId(null)}
                      >
                        ←
                      </Button>
                      <div className="flex items-center gap-2 flex-1">
                        {getHelpIcon(selectedHelp.type)}
                        <h4 className="font-medium text-sm">{selectedHelp.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedHelp.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {selectedHelp.description}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      {selectedHelp.content.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    {selectedHelp.examples && (
                      <>
                        <Separator />
                        <div>
                          <h5 className="font-medium text-sm mb-2">Examples:</h5>
                          <div className="space-y-1">
                            {selectedHelp.examples.map((example, index) => (
                              <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedHelp.regulations && (
                      <>
                        <Separator />
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            Regulations:
                          </h5>
                          <div className="space-y-1">
                            {selectedHelp.regulations.map((reg, index) => (
                              <div key={index} className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                {reg}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedHelp.links && (
                      <>
                        <Separator />
                        <div>
                          <h5 className="font-medium text-sm mb-2">Related Links:</h5>
                          <div className="space-y-1">
                            {selectedHelp.links.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline block"
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}