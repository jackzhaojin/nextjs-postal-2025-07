'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Mail, 
  Calendar, 
  Database, 
  Share2, 
  Settings, 
  Check,
  Copy,
  ExternalLink,
  Cloud,
  Printer
} from 'lucide-react';
import type { 
  RecordKeepingOptions, 
  DocumentFormat, 
  ExportOption,
  StorageOption,
  IntegrationOption,
  ShippingTransaction 
} from '@/lib/types';

interface RecordKeepingSectionProps {
  transaction: ShippingTransaction;
  className?: string;
}

export default function RecordKeepingSection({ transaction, className = '' }: RecordKeepingSectionProps) {
  console.log('RecordKeepingSection: Rendering with transaction:', transaction.id);
  
  const [recordOptions, setRecordOptions] = useState<RecordKeepingOptions | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [selectedExports, setSelectedExports] = useState<Set<string>>(new Set());
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [emailDelivery, setEmailDelivery] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);

  useEffect(() => {
    console.log('RecordKeepingSection: Loading record keeping options');
    loadRecordKeepingOptions();
  }, [transaction.id]);

  const loadRecordKeepingOptions = async () => {
    try {
      console.log('RecordKeepingSection: Fetching record keeping options');
      
      // Mock record keeping options
      const mockOptions: RecordKeepingOptions = {
        documentFormats: [
          {
            format: 'pdf',
            displayName: 'PDF Document',
            description: 'Professional formatted document with complete shipment details',
            useCase: 'Business records, accounting, and official documentation',
            customizationOptions: [
              {
                type: 'branding',
                options: ['Standard', 'Company Logo', 'Custom Header'],
                defaultValue: 'Standard',
                premium: false
              },
              {
                type: 'layout',
                options: ['Compact', 'Detailed', 'Summary'],
                defaultValue: 'Detailed',
                premium: false
              }
            ]
          },
          {
            format: 'csv',
            displayName: 'CSV Spreadsheet',
            description: 'Structured data format for accounting and analysis systems',
            useCase: 'ERP integration, expense tracking, and data analysis',
            customizationOptions: [
              {
                type: 'content',
                options: ['Basic Fields', 'Extended Fields', 'Custom Fields'],
                defaultValue: 'Extended Fields',
                premium: false
              }
            ]
          },
          {
            format: 'json',
            displayName: 'JSON Data',
            description: 'Machine-readable format for technical integrations',
            useCase: 'API integration, automated processing, and system synchronization',
            customizationOptions: [
              {
                type: 'content',
                options: ['Standard Schema', 'Extended Schema', 'Custom Schema'],
                defaultValue: 'Standard Schema',
                premium: true
              }
            ]
          },
          {
            format: 'ics',
            displayName: 'Calendar File',
            description: 'Calendar events for pickup and delivery appointments',
            useCase: 'Calendar integration, scheduling, and appointment management',
            customizationOptions: [
              {
                type: 'content',
                options: ['Pickup Only', 'Delivery Only', 'Both Events'],
                defaultValue: 'Both Events',
                premium: false
              }
            ]
          }
        ],
        exportOptions: [
          {
            exportId: 'immediate-download',
            name: 'Immediate Download',
            description: 'Download confirmation documents immediately',
            formats: ['pdf', 'csv', 'json', 'ics'],
            dataInclusion: {
              shipmentDetails: true,
              pricingBreakdown: true,
              trackingInformation: false,
              documentation: true,
              customFields: []
            },
            schedulingOptions: {
              immediate: true,
              scheduled: false,
              recurring: false,
              triggers: []
            }
          },
          {
            exportId: 'email-delivery',
            name: 'Email Delivery',
            description: 'Receive documents via email at specified intervals',
            formats: ['pdf', 'csv'],
            dataInclusion: {
              shipmentDetails: true,
              pricingBreakdown: true,
              trackingInformation: true,
              documentation: true,
              customFields: ['customer-notes', 'po-number']
            },
            schedulingOptions: {
              immediate: true,
              scheduled: true,
              recurring: true,
              triggers: [
                {
                  event: 'pickup-completion',
                  conditions: ['successful-pickup'],
                  delay: 30
                },
                {
                  event: 'delivery-completion',
                  conditions: ['successful-delivery'],
                  delay: 60
                }
              ]
            }
          },
          {
            exportId: 'cloud-sync',
            name: 'Cloud Storage Sync',
            description: 'Automatically sync documents to cloud storage',
            formats: ['pdf', 'json'],
            dataInclusion: {
              shipmentDetails: true,
              pricingBreakdown: true,
              trackingInformation: true,
              documentation: true,
              customFields: ['internal-reference', 'cost-center']
            },
            schedulingOptions: {
              immediate: false,
              scheduled: true,
              recurring: true,
              triggers: [
                {
                  event: 'milestone-reached',
                  conditions: ['tracking-available', 'in-transit', 'delivered'],
                  delay: 0
                }
              ]
            }
          }
        ],
        storageOptions: [
          {
            storageId: 'local-browser',
            provider: 'Browser Storage',
            type: 'local',
            capacity: '10MB per domain',
            retention: {
              period: 30,
              archival: false,
              automaticDeletion: true,
              complianceRequirements: []
            },
            security: {
              encryption: false,
              accessControl: false,
              auditLogging: false,
              backupPolicy: {
                frequency: 'daily',
                retention: 7,
                geographicDistribution: false,
                verificationSchedule: 'none'
              }
            }
          },
          {
            storageId: 'postalflow-cloud',
            provider: 'PostalFlow Cloud',
            type: 'cloud',
            capacity: 'Unlimited',
            retention: {
              period: 2555, // 7 years
              archival: true,
              automaticDeletion: false,
              complianceRequirements: ['SOX', 'GDPR', 'CCPA']
            },
            security: {
              encryption: true,
              accessControl: true,
              auditLogging: true,
              backupPolicy: {
                frequency: 'daily',
                retention: 365,
                geographicDistribution: true,
                verificationSchedule: 'monthly'
              }
            }
          },
          {
            storageId: 'customer-cloud',
            provider: 'Customer Cloud Integration',
            type: 'hybrid',
            capacity: 'As configured',
            retention: {
              period: 365,
              archival: true,
              automaticDeletion: false,
              complianceRequirements: ['Customer Defined']
            },
            security: {
              encryption: true,
              accessControl: true,
              auditLogging: true,
              backupPolicy: {
                frequency: 'daily',
                retention: 90,
                geographicDistribution: true,
                verificationSchedule: 'weekly'
              }
            }
          }
        ],
        integrationOptions: [
          {
            integrationId: 'rest-api',
            name: 'REST API Access',
            type: 'api',
            description: 'Real-time access to shipment data via REST API',
            supportedFormats: ['json', 'xml'],
            authenticationMethods: [
              {
                method: 'api-key',
                description: 'Simple API key authentication',
                securityLevel: 'standard'
              },
              {
                method: 'oauth',
                description: 'OAuth 2.0 with refresh tokens',
                securityLevel: 'enhanced'
              }
            ],
            rateLimits: {
              requestsPerMinute: 100,
              requestsPerHour: 1000,
              dataLimitMB: 50,
              concurrentConnections: 10
            }
          },
          {
            integrationId: 'webhook',
            name: 'Webhook Notifications',
            type: 'webhook',
            description: 'Real-time push notifications for shipment events',
            supportedFormats: ['json'],
            authenticationMethods: [
              {
                method: 'basic-auth',
                description: 'HTTP Basic Authentication',
                securityLevel: 'standard'
              },
              {
                method: 'certificate',
                description: 'Client certificate authentication',
                securityLevel: 'enterprise'
              }
            ],
            rateLimits: {
              requestsPerMinute: 50,
              requestsPerHour: 500,
              dataLimitMB: 10,
              concurrentConnections: 5
            }
          }
        ]
      };

      setRecordOptions(mockOptions);
      console.log('RecordKeepingSection: Options loaded successfully');
    } catch (error) {
      console.error('RecordKeepingSection: Error loading options:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFormat = (format: string) => {
    console.log('RecordKeepingSection: Toggling format:', format);
    const newFormats = new Set(selectedFormats);
    if (newFormats.has(format)) {
      newFormats.delete(format);
    } else {
      newFormats.add(format);
    }
    setSelectedFormats(newFormats);
  };

  const toggleExport = (exportId: string) => {
    console.log('RecordKeepingSection: Toggling export:', exportId);
    const newExports = new Set(selectedExports);
    if (newExports.has(exportId)) {
      newExports.delete(exportId);
    } else {
      newExports.add(exportId);
    }
    setSelectedExports(newExports);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      setCopying(type);
      await navigator.clipboard.writeText(text);
      console.log('RecordKeepingSection: Copied to clipboard:', type);
      setTimeout(() => setCopying(null), 2000);
    } catch (error) {
      console.error('RecordKeepingSection: Error copying to clipboard:', error);
      setCopying(null);
    }
  };

  const generateDownloadUrl = (format: string) => {
    // Mock download URL generation
    return `/api/confirmation/${transaction.confirmationNumber}/download?format=${format}`;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'csv':
        return <Database className="w-5 h-5 text-green-600" />;
      case 'json':
        return <Settings className="w-5 h-5 text-blue-600" />;
      case 'ics':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderDocumentFormat = (format: DocumentFormat) => {
    const isSelected = selectedFormats.has(format.format);
    
    return (
      <div
        key={format.format}
        className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-white hover:border-blue-200'
        }`}
        onClick={() => toggleFormat(format.format)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getFormatIcon(format.format)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{format.displayName}</h4>
              {isSelected && <Check className="w-4 h-4 text-blue-600" />}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{format.description}</p>
            
            <div className="text-xs text-gray-500 mb-3">
              <span className="font-medium">Best for:</span> {format.useCase}
            </div>
            
            {isSelected && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Customization Options:</h5>
                {format.customizationOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{option.type}:</span>
                    <select className="text-sm border border-gray-300 rounded px-2 py-1">
                      {option.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(generateDownloadUrl(format.format), '_blank');
                  }}
                  className="w-full mt-2 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download {format.displayName}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExportOption = (exportOption: ExportOption) => {
    const isSelected = selectedExports.has(exportOption.exportId);
    
    return (
      <div
        key={exportOption.exportId}
        className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 bg-white hover:border-green-200'
        }`}
        onClick={() => toggleExport(exportOption.exportId)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {exportOption.exportId === 'email-delivery' && <Mail className="w-5 h-5 text-blue-600" />}
            {exportOption.exportId === 'cloud-sync' && <Cloud className="w-5 h-5 text-purple-600" />}
            {exportOption.exportId === 'immediate-download' && <Download className="w-5 h-5 text-green-600" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{exportOption.name}</h4>
              {isSelected && <Check className="w-4 h-4 text-green-600" />}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{exportOption.description}</p>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-gray-500">Formats:</span>
                {exportOption.formats.map(format => (
                  <span key={format} className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">
                    {format}
                  </span>
                ))}
              </div>
              
              {exportOption.schedulingOptions.triggers.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Auto-triggered on:</span>
                  <ul className="text-xs text-gray-600 mt-1">
                    {exportOption.schedulingOptions.triggers.map((trigger, index) => (
                      <li key={index}>• {trigger.event.replace('-', ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {isSelected && exportOption.exportId === 'email-delivery' && (
              <div className="mt-3 p-3 bg-white rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address:
                </label>
                <input
                  type="email"
                  defaultValue={transaction.shipmentDetails.origin.contactInfo.email}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter email address"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStorageOption = (storageOption: StorageOption) => {
    const isSelected = selectedStorage === storageOption.storageId;
    
    return (
      <div
        key={storageOption.storageId}
        className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-200 bg-white hover:border-purple-200'
        }`}
        onClick={() => setSelectedStorage(isSelected ? null : storageOption.storageId)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {storageOption.type === 'cloud' && <Cloud className="w-5 h-5 text-blue-600" />}
            {storageOption.type === 'local' && <Database className="w-5 h-5 text-gray-600" />}
            {storageOption.type === 'hybrid' && <Share2 className="w-5 h-5 text-purple-600" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{storageOption.provider}</h4>
              {isSelected && <Check className="w-4 h-4 text-purple-600" />}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Capacity:</span>
                <span className="font-medium">{storageOption.capacity}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Retention:</span>
                <span className="font-medium">{storageOption.retention.period} days</span>
              </div>
              
              <div className="flex justify-between">
                <span>Encryption:</span>
                <span className={`font-medium ${storageOption.security.encryption ? 'text-green-600' : 'text-gray-500'}`}>
                  {storageOption.security.encryption ? 'Yes' : 'No'}
                </span>
              </div>
              
              {storageOption.retention.complianceRequirements.length > 0 && (
                <div>
                  <span>Compliance:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {storageOption.retention.complianceRequirements.map(req => (
                      <span key={req} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
        >
          <Printer className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Print Page</span>
        </button>
        
        <button
          onClick={() => copyToClipboard(transaction.confirmationNumber || '', 'confirmation')}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
        >
          <Copy className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {copying === 'confirmation' ? 'Copied!' : 'Copy Confirmation #'}
          </span>
        </button>
        
        <button
          onClick={() => copyToClipboard(window.location.href, 'link')}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {copying === 'link' ? 'Copied!' : 'Share Link'}
          </span>
        </button>
        
        <button
          onClick={() => window.open('/help/record-keeping', '_blank')}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
        >
          <ExternalLink className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Help Guide</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recordOptions) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load record keeping options</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Keeping & Documentation</h2>
        <p className="text-gray-600">
          Download, export, and manage your shipping confirmation and related documents.
        </p>
      </div>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Document Formats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recordOptions.documentFormats.map(renderDocumentFormat)}
        </div>
      </div>

      {/* Export Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Delivery Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordOptions.exportOptions.map(renderExportOption)}
        </div>
      </div>

      {/* Storage Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordOptions.storageOptions.map(renderStorageOption)}
        </div>
      </div>

      {/* Integration Options */}
      {recordOptions.integrationOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Integration</h3>
          <div className="space-y-4">
            {recordOptions.integrationOptions.map(integration => (
              <div key={integration.integrationId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{integration.name}</h4>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                    {integration.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Rate Limit:</span>
                    <div className="font-medium">{integration.rateLimits.requestsPerMinute}/min</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Data Limit:</span>
                    <div className="font-medium">{integration.rateLimits.dataLimitMB}MB</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Auth Methods:</span>
                    <div className="font-medium">{integration.authenticationMethods.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Formats:</span>
                    <div className="font-medium">{integration.supportedFormats.join(', ')}</div>
                  </div>
                </div>
                
                <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Setup Integration →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Summary */}
      {(selectedFormats.size > 0 || selectedExports.size > 0 || selectedStorage) && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Configuration Summary</h3>
          
          <div className="space-y-3 text-sm">
            {selectedFormats.size > 0 && (
              <div>
                <span className="font-medium text-blue-800">Document Formats:</span>
                <span className="ml-2 text-blue-700">
                  {Array.from(selectedFormats).join(', ').toUpperCase()}
                </span>
              </div>
            )}
            
            {selectedExports.size > 0 && (
              <div>
                <span className="font-medium text-blue-800">Export Methods:</span>
                <span className="ml-2 text-blue-700">
                  {Array.from(selectedExports).map(id => 
                    recordOptions.exportOptions.find(opt => opt.exportId === id)?.name
                  ).join(', ')}
                </span>
              </div>
            )}
            
            {selectedStorage && (
              <div>
                <span className="font-medium text-blue-800">Storage:</span>
                <span className="ml-2 text-blue-700">
                  {recordOptions.storageOptions.find(opt => opt.storageId === selectedStorage)?.provider}
                </span>
              </div>
            )}
          </div>
          
          <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors duration-200">
            Save Configuration
          </button>
        </div>
      )}
    </div>
  );
}
