'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  ExternalLink,
  QrCode,
  Printer,
  Shield,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import {
  PackageDocumentation,
  LabelInformation,
  RequiredDocument,
  ComplianceDocument,
  CustomsDocument,
  ShippingTransaction
} from '@/lib/types';

interface PackageDocumentationSectionProps {
  transaction: ShippingTransaction;
}

export function PackageDocumentationSection({ transaction }: PackageDocumentationSectionProps) {
  const [documentation, setDocumentation] = useState<PackageDocumentation | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [generatingLabel, setGeneratingLabel] = useState(false);

  useEffect(() => {
    console.log('PackageDocumentationSection - Initializing documentation for transaction:', transaction.id);
    generateMockDocumentation();
  }, [transaction.id]);

  const generateMockDocumentation = () => {
    console.log('PackageDocumentationSection - Generating mock documentation');

    // Determine if international shipment
    const isInternational = transaction.shipmentDetails.origin.country !== transaction.shipmentDetails.destination.country;
    
    // Determine if hazmat shipment
    const isHazmat = transaction.shipmentDetails.package.specialHandling.includes('hazmat');
    
    // Determine if high-value shipment (>$5000)
    const isHighValue = transaction.shipmentDetails.package.declaredValue > 5000;

    // Create mutable arrays first
    const complianceDocuments: ComplianceDocument[] = isHazmat ? [
      {
        id: 'hazmat-1',
        type: 'hazmat-declaration',
        name: 'Dangerous Goods Declaration',
        description: 'Required documentation for hazardous materials',
        regulatoryBody: 'DOT',
        downloadUrl: `/api/documents/hazmat-declaration/${transaction.id}`,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    ] : [];

    // Add insurance documentation for high-value shipments
    if (isHighValue) {
      complianceDocuments.push({
        id: 'insurance-1',
        type: 'insurance-certificate',
        name: 'Insurance Certificate',
        description: 'Insurance coverage certificate for high-value shipment',
        regulatoryBody: 'Insurance Provider',
        downloadUrl: `/api/documents/insurance-certificate/${transaction.id}`
      });
    }

    const mockDocumentation: PackageDocumentation = {
      shippingLabel: {
        labelType: 'pre-print',
        format: 'thermal',
        labelUrl: '/api/documents/shipping-label/' + transaction.id,
        printInstructions: 'Print on 4x6 thermal paper. Ensure barcode is clearly readable.',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('TRACK:' + transaction.confirmationNumber)}`,
        status: 'generated'
      },
      requiredDocuments: [
        {
          id: 'packing-list-1',
          type: 'packing-list',
          name: 'Packing List',
          description: 'Detailed list of package contents and quantities',
          required: true,
          downloadUrl: `/api/documents/packing-list/${transaction.id}`,
          status: 'generated'
        },
        {
          id: 'bol-1',
          type: 'bill-of-lading',
          name: 'Bill of Lading',
          description: 'Legal document between shipper and carrier',
          required: true,
          downloadUrl: `/api/documents/bill-of-lading/${transaction.id}`,
          status: 'completed'
        }
      ],
      complianceDocuments,
      customsDocuments: isInternational ? [
        {
          id: 'commercial-invoice-1',
          type: 'commercial-invoice',
          name: 'Commercial Invoice',
          description: 'Invoice for customs clearance and duty calculation',
          country: transaction.shipmentDetails.destination.country,
          downloadUrl: `/api/documents/commercial-invoice/${transaction.id}`,
          formNumber: 'CI-2025-001'
        },
        {
          id: 'customs-declaration-1',
          type: 'customs-declaration',
          name: 'Customs Declaration',
          description: 'Declaration of goods for customs processing',
          country: transaction.shipmentDetails.destination.country,
          downloadUrl: `/api/documents/customs-declaration/${transaction.id}`,
          formNumber: 'CD-2025-001'
        }
      ] : []
    };

    setDocumentation(mockDocumentation);
    console.log('PackageDocumentationSection - Mock documentation generated:', mockDocumentation);
  };

  const handleDownloadDocument = async (documentId: string, downloadUrl: string, documentName: string) => {
    console.log('PackageDocumentationSection - Downloading document:', { documentId, downloadUrl, documentName });
    
    setDownloadingIds(prev => new Set([...prev, documentId]));
    
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would trigger the actual download
      // For now, just simulate the download
      console.log('PackageDocumentationSection - Document download simulated:', documentName);
      
      // Show success message or trigger actual download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = documentName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('PackageDocumentationSection - Download failed:', error);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const handleGenerateLabel = async () => {
    console.log('PackageDocumentationSection - Generating shipping label');
    
    setGeneratingLabel(true);
    
    try {
      // Simulate label generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (documentation) {
        const updatedLabel: LabelInformation = {
          ...documentation.shippingLabel,
          labelUrl: `/api/documents/shipping-label/${transaction.id}?generated=${Date.now()}`,
          status: 'generated'
        };
        
        setDocumentation({
          ...documentation,
          shippingLabel: updatedLabel
        });
        
        console.log('PackageDocumentationSection - Shipping label generated');
      }
      
    } catch (error) {
      console.error('PackageDocumentationSection - Label generation failed:', error);
    } finally {
      setGeneratingLabel(false);
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'generated':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
      case 'generated':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Generated</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!documentation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Package Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-pulse text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading documentation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="package-documentation-section">
      {/* Shipping Label */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Shipping Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="shipping-label-info">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {documentation.shippingLabel.labelType.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {documentation.shippingLabel.format.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {documentation.shippingLabel.printInstructions}
              </p>
            </div>
            
            <div className="flex gap-2">
              {documentation.shippingLabel.labelUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadDocument(
                    'shipping-label',
                    documentation.shippingLabel.labelUrl!,
                    'Shipping Label.pdf'
                  )}
                  disabled={downloadingIds.has('shipping-label')}
                >
                  {downloadingIds.has('shipping-label') ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateLabel}
                disabled={generatingLabel}
                data-testid="generate-label-button"
              >
                {generatingLabel ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                {generatingLabel ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>

          {documentation.shippingLabel.qrCodeUrl && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
              <img
                src={documentation.shippingLabel.qrCodeUrl}
                alt="Tracking QR Code"
                className="w-16 h-16"
              />
              <div>
                <p className="font-medium">Mobile Tracking QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Scan with mobile device for quick tracking access
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Required Documents */}
      {documentation.requiredDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" data-testid="required-documents">
              {documentation.requiredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-start gap-3">
                    {getDocumentStatusIcon(doc.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{doc.name}</p>
                        {getDocumentStatusBadge(doc.status)}
                        {doc.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                  
                  {doc.downloadUrl && doc.status !== 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc.id, doc.downloadUrl!, doc.name + '.pdf')}
                      disabled={downloadingIds.has(doc.id)}
                    >
                      {downloadingIds.has(doc.id) ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Documents */}
      {documentation.complianceDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These documents are required for regulatory compliance. Ensure all documents are complete before shipping.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {documentation.complianceDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-orange-500 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{doc.name}</p>
                        <Badge variant="outline">{doc.regulatoryBody}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                      {doc.expirationDate && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {doc.expirationDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {doc.downloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc.id, doc.downloadUrl!, doc.name + '.pdf')}
                      disabled={downloadingIds.has(doc.id)}
                    >
                      {downloadingIds.has(doc.id) ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customs Documents */}
      {documentation.customsDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Customs Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Globe className="h-4 w-4" />
              <AlertDescription>
                International shipment detected. These customs documents are required for border clearance.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {documentation.customsDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{doc.name}</p>
                        <Badge variant="outline">{doc.country}</Badge>
                        {doc.formNumber && (
                          <Badge variant="secondary" className="text-xs">{doc.formNumber}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                  
                  {doc.downloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc.id, doc.downloadUrl!, doc.name + '.pdf')}
                      disabled={downloadingIds.has(doc.id)}
                    >
                      {downloadingIds.has(doc.id) ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Need Help with Documentation?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="font-medium">Documentation Support</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>1-800-DOC-HELP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>docs@shippingsystem.com</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Compliance Support</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>1-800-COMPLY</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" />
                  <a href="/knowledge-base/documentation" className="text-blue-600 hover:underline">
                    Documentation Guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
