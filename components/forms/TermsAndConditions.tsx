// Terms and Conditions component for final shipment submission
// Displays service terms and collects required acknowledgments

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, AlertTriangle, FileText, Truck } from 'lucide-react';
import { TermsAcknowledgment, ShippingTransaction } from '@/lib/types';

interface TermsAndConditionsProps {
  transaction: ShippingTransaction;
  acknowledgment: TermsAcknowledgment;
  onAcknowledgmentChange: (acknowledgment: TermsAcknowledgment) => void;
  errors?: Record<string, string>;
}

export function TermsAndConditions({ 
  transaction, 
  acknowledgment, 
  onAcknowledgmentChange, 
  errors = {} 
}: TermsAndConditionsProps) {
  console.log('TermsAndConditions - rendering with acknowledgment:', acknowledgment);

  const hasHazmat = transaction.shipmentDetails?.package?.specialHandling?.includes('hazmat');
  const isInternational = transaction.shipmentDetails?.destination?.country !== 'US';

  const handleCheckboxChange = (field: keyof TermsAcknowledgment, checked: boolean) => {
    console.log(`TermsAndConditions - checkbox change: ${field} = ${checked}`);
    onAcknowledgmentChange({
      ...acknowledgment,
      [field]: checked
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Terms of Service & Required Acknowledgments
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please review our service terms and provide the required acknowledgments to proceed with shipment submission.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Service Terms Overview */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Service Terms Summary
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-muted-foreground">STANDARD LIABILITY COVERAGE</h4>
                <p>Up to $100 per package for loss or damage</p>
              </div>
              
              <div>
                <h4 className="font-medium text-muted-foreground">MAXIMUM LIABILITY</h4>
                <p>Limited to declared value or $50,000, whichever is less</p>
              </div>
              
              <div>
                <h4 className="font-medium text-muted-foreground">DELIVERY ATTEMPTS</h4>
                <p>Up to 3 delivery attempts before return to sender</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-muted-foreground">CLAIMS FILING</h4>
                <p>Must be filed within 9 months of shipment date</p>
              </div>
              
              <div>
                <h4 className="font-medium text-muted-foreground">WEATHER DELAYS</h4>
                <p>Service guarantees void during severe weather events</p>
              </div>
              
              <div>
                <h4 className="font-medium text-muted-foreground">PROHIBITED ITEMS</h4>
                <p>See full list of restricted and prohibited items</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <ExternalLink className="h-4 w-4" />
            <a href="#" className="hover:underline">View Complete Terms of Service</a>
          </div>
        </div>

        <Separator />

        {/* Required Acknowledgments */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Required Acknowledgments
          </h3>
          
          <div className="space-y-4">
            {/* Declared Value Accuracy */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="declaredValueAccuracy"
                checked={acknowledgment.declaredValueAccuracy}
                onCheckedChange={(checked) => handleCheckboxChange('declaredValueAccuracy', checked as boolean)}
                className={errors['acknowledgment.declaredValueAccuracy'] ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="declaredValueAccuracy" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Declared Value Accuracy
                </label>
                <p className="text-xs text-muted-foreground">
                  I confirm that the declared value of ${transaction.shipmentDetails?.package?.declaredValue?.toFixed(2) || '0.00'} 
                  accurately represents the actual value of the package contents.
                </p>
                {errors['acknowledgment.declaredValueAccuracy'] && (
                  <p className="text-xs text-red-500">{errors['acknowledgment.declaredValueAccuracy']}</p>
                )}
              </div>
            </div>

            {/* Insurance Requirements */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="insuranceRequirements"
                checked={acknowledgment.insuranceRequirements}
                onCheckedChange={(checked) => handleCheckboxChange('insuranceRequirements', checked as boolean)}
                className={errors['acknowledgment.insuranceRequirements'] ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="insuranceRequirements" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Insurance Requirements Understanding
                </label>
                <p className="text-xs text-muted-foreground">
                  I understand the insurance coverage limits and requirements for this shipment type. 
                  Additional insurance may be purchased separately if needed.
                </p>
                {errors['acknowledgment.insuranceRequirements'] && (
                  <p className="text-xs text-red-500">{errors['acknowledgment.insuranceRequirements']}</p>
                )}
              </div>
            </div>

            {/* Package Contents Compliance */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="packageContentsCompliance"
                checked={acknowledgment.packageContentsCompliance}
                onCheckedChange={(checked) => handleCheckboxChange('packageContentsCompliance', checked as boolean)}
                className={errors['acknowledgment.packageContentsCompliance'] ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="packageContentsCompliance" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Package Contents Compliance
                </label>
                <p className="text-xs text-muted-foreground">
                  I confirm that all package contents comply with shipping regulations and do not include 
                  prohibited or restricted items as defined in the carrier's terms of service.
                </p>
                {errors['acknowledgment.packageContentsCompliance'] && (
                  <p className="text-xs text-red-500">{errors['acknowledgment.packageContentsCompliance']}</p>
                )}
              </div>
            </div>

            {/* Carrier Authorization */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="carrierAuthorization"
                checked={acknowledgment.carrierAuthorization}
                onCheckedChange={(checked) => handleCheckboxChange('carrierAuthorization', checked as boolean)}
                className={errors['acknowledgment.carrierAuthorization'] ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="carrierAuthorization" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Carrier Authorization
                </label>
                <p className="text-xs text-muted-foreground">
                  I authorize the selected carrier to pick up and transport this shipment according to 
                  the terms and conditions specified, and to charge the designated payment method.
                </p>
                {errors['acknowledgment.carrierAuthorization'] && (
                  <p className="text-xs text-red-500">{errors['acknowledgment.carrierAuthorization']}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Acknowledgments */}
        {(hasHazmat || isInternational) && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Additional Requirements
                <Badge variant="outline" className="ml-2">Required for this shipment</Badge>
              </h3>

              {/* Hazmat Certification */}
              {hasHazmat && (
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="hazmatCertification"
                    checked={acknowledgment.hazmatCertification || false}
                    onCheckedChange={(checked) => handleCheckboxChange('hazmatCertification', checked as boolean)}
                    className={errors['acknowledgment.hazmatCertification'] ? 'border-red-500' : ''}
                  />
                  <div className="space-y-1">
                    <label 
                      htmlFor="hazmatCertification" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Hazardous Materials Certification
                    </label>
                    <p className="text-xs text-muted-foreground">
                      I certify that this shipment has been properly classified, described, packaged, marked, 
                      and labeled according to applicable hazardous materials regulations, and that all required 
                      documentation is accurate and complete.
                    </p>
                    {errors['acknowledgment.hazmatCertification'] && (
                      <p className="text-xs text-red-500">{errors['acknowledgment.hazmatCertification']}</p>
                    )}
                  </div>
                </div>
              )}

              {/* International Compliance */}
              {isInternational && (
                <>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="internationalCompliance"
                      checked={acknowledgment.internationalCompliance || false}
                      onCheckedChange={(checked) => handleCheckboxChange('internationalCompliance', checked as boolean)}
                      className={errors['acknowledgment.internationalCompliance'] ? 'border-red-500' : ''}
                    />
                    <div className="space-y-1">
                      <label 
                        htmlFor="internationalCompliance" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        International Shipping Compliance
                      </label>
                      <p className="text-xs text-muted-foreground">
                        I understand and comply with all applicable international shipping regulations, 
                        export controls, and destination country requirements for this shipment.
                      </p>
                      {errors['acknowledgment.internationalCompliance'] && (
                        <p className="text-xs text-red-500">{errors['acknowledgment.internationalCompliance']}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="customsDocumentation"
                      checked={acknowledgment.customsDocumentation || false}
                      onCheckedChange={(checked) => handleCheckboxChange('customsDocumentation', checked as boolean)}
                      className={errors['acknowledgment.customsDocumentation'] ? 'border-red-500' : ''}
                    />
                    <div className="space-y-1">
                      <label 
                        htmlFor="customsDocumentation" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Customs Documentation
                      </label>
                      <p className="text-xs text-muted-foreground">
                        I acknowledge responsibility for providing accurate customs documentation 
                        and understand that incomplete or incorrect documentation may result in delays or additional fees.
                      </p>
                      {errors['acknowledgment.customsDocumentation'] && (
                        <p className="text-xs text-red-500">{errors['acknowledgment.customsDocumentation']}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Terms Link */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            By checking the boxes above and submitting this shipment, you agree to be bound by our complete 
            <a href="#" className="text-blue-600 hover:underline ml-1">Terms of Service</a>, 
            <a href="#" className="text-blue-600 hover:underline ml-1">Service Guide</a>, and 
            <a href="#" className="text-blue-600 hover:underline ml-1">Rate and Service Schedule</a>.
            You also acknowledge that you have read and understand our 
            <a href="#" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
