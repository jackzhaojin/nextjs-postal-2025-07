'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, DollarSign, Search } from 'lucide-react';
import { CompanyInformation, BusinessType, IndustryType, ShippingVolumeRange } from '@/lib/billing/types';

interface CompanyInformationSectionProps {
  companyInfo: CompanyInformation;
  onCompanyInfoChange: (info: CompanyInformation) => void;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
}

const BUSINESS_TYPES: BusinessType[] = [
  'corporation',
  'llc',
  'partnership',
  'sole-proprietorship',
  'government',
  'non-profit',
  'cooperative',
  'trust',
  'limited-partnership',
  'professional-corporation',
  'other'
];

const INDUSTRY_TYPES: IndustryType[] = [
  'manufacturing',
  'retail-ecommerce',
  'healthcare-medical',
  'technology-software',
  'automotive',
  'aerospace-defense',
  'energy-utilities',
  'financial-services',
  'real-estate',
  'construction',
  'agriculture',
  'food-beverage',
  'textiles-apparel',
  'chemicals-pharmaceuticals',
  'metals-mining',
  'transportation-logistics',
  'telecommunications',
  'media-entertainment',
  'education',
  'professional-services',
  'hospitality-tourism',
  'sports-recreation',
  'environmental-services',
  'government-public',
  'non-profit-charitable',
  'other'
];

const SHIPPING_VOLUME_RANGES: ShippingVolumeRange[] = [
  'under-10k',
  '10k-50k',
  '50k-250k',
  '250k-1m',
  '1m-5m',
  '5m-25m',
  '25m-100m',
  'over-100m'
];

export function CompanyInformationSection({
  companyInfo,
  onCompanyInfoChange,
  validationErrors,
  isSubmitting
}: CompanyInformationSectionProps) {
  console.log('🏢 [BILLING] CompanyInformationSection rendered with validation errors:', validationErrors);

  const [industrySearch, setIndustrySearch] = React.useState('');

  const handleFieldChange = (field: keyof CompanyInformation, value: string) => {
    console.log(`🏢 [BILLING] Company info field changed: ${field} = ${value}`);
    
    const updatedCompanyInfo = {
      ...companyInfo,
      [field]: value
    };
    
    onCompanyInfoChange(updatedCompanyInfo);
  };

  const filteredIndustries = INDUSTRY_TYPES.filter(industry =>
    industry.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const getBusinessTypeDescription = (type: BusinessType) => {
    const descriptions: Record<BusinessType, string> = {
      'corporation': 'Legally separate entity owned by shareholders',
      'llc': 'Limited Liability Company - hybrid business structure',
      'partnership': 'Business owned by two or more people',
      'sole-proprietorship': 'Unincorporated business owned by one person',
      'government': 'Federal, state, or local government organization',
      'non-profit': 'Tax-exempt organization serving public interest',
      'cooperative': 'Business owned and operated by members',
      'trust': 'Legal entity holding assets for beneficiaries',
      'limited-partnership': 'Partnership with limited and general partners',
      'professional-corporation': 'Corporation for licensed professionals',
      'other': 'Other business structure not listed above'
    };
    return descriptions[type] || '';
  };

  const getBusinessTypeDisplay = (type: BusinessType) => {
    const displays: Record<BusinessType, string> = {
      'corporation': 'Corporation',
      'llc': 'LLC',
      'partnership': 'Partnership',
      'sole-proprietorship': 'Sole Proprietorship',
      'government': 'Government Entity',
      'non-profit': 'Non-Profit Organization',
      'cooperative': 'Cooperative',
      'trust': 'Trust',
      'limited-partnership': 'Limited Partnership',
      'professional-corporation': 'Professional Corporation',
      'other': 'Other'
    };
    return displays[type] || type;
  };

  const getIndustryDisplay = (industry: IndustryType) => {
    const displays: Record<IndustryType, string> = {
      'manufacturing': 'Manufacturing',
      'retail-ecommerce': 'Retail/E-commerce',
      'healthcare-medical': 'Healthcare/Medical',
      'technology-software': 'Technology/Software',
      'automotive': 'Automotive',
      'aerospace-defense': 'Aerospace/Defense',
      'energy-utilities': 'Energy/Utilities',
      'financial-services': 'Financial Services',
      'real-estate': 'Real Estate',
      'construction': 'Construction',
      'agriculture': 'Agriculture',
      'food-beverage': 'Food & Beverage',
      'textiles-apparel': 'Textiles/Apparel',
      'chemicals-pharmaceuticals': 'Chemicals/Pharmaceuticals',
      'metals-mining': 'Metals/Mining',
      'transportation-logistics': 'Transportation/Logistics',
      'telecommunications': 'Telecommunications',
      'media-entertainment': 'Media/Entertainment',
      'education': 'Education',
      'professional-services': 'Professional Services',
      'hospitality-tourism': 'Hospitality/Tourism',
      'sports-recreation': 'Sports/Recreation',
      'environmental-services': 'Environmental Services',
      'government-public': 'Government/Public',
      'non-profit-charitable': 'Non-Profit/Charitable',
      'other': 'Other'
    };
    return displays[industry] || industry;
  };

  const getVolumeDisplay = (range: ShippingVolumeRange) => {
    const displays: Record<ShippingVolumeRange, string> = {
      'under-10k': '< $10K',
      '10k-50k': '$10K-$50K',
      '50k-250k': '$50K-$250K',
      '250k-1m': '$250K-$1M',
      '1m-5m': '$1M-$5M',
      '5m-25m': '$5M-$25M',
      '25m-100m': '$25M-$100M',
      'over-100m': '> $100M'
    };
    return displays[range] || range;
  };

  const getVolumeDescription = (range: ShippingVolumeRange) => {
    const descriptions: Record<ShippingVolumeRange, string> = {
      'under-10k': 'Small business - occasional shipping',
      '10k-50k': 'Growing business - regular shipping',
      '50k-250k': 'Established business - frequent shipping',
      '250k-1m': 'Large business - high volume shipping',
      '1m-5m': 'Enterprise - very high volume shipping',
      '5m-25m': 'Large enterprise - premium volume',
      '25m-100m': 'Major corporation - strategic volume',
      'over-100m': 'Fortune-level - ultra high volume'
    };
    return descriptions[range] || '';
  };

  return (
    <Card className="w-full" data-testid="company-information-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Company Information
        </CardTitle>
        <p className="text-sm text-gray-600">
          Business entity details for account setup and verification
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legal Company Name */}
        <div className="space-y-2">
          <Label htmlFor="legal-company-name" className="text-sm font-medium">
            Legal Company Name *
          </Label>
          <Input
            id="legal-company-name"
            data-testid="legal-company-name"
            type="text"
            value={companyInfo.legalName}
            onChange={(e) => handleFieldChange('legalName', e.target.value)}
            placeholder="ABC Manufacturing Corporation"
            disabled={isSubmitting}
            className={validationErrors['companyInformation.legalName'] ? 'border-red-500' : ''}
          />
          {validationErrors['companyInformation.legalName'] && (
            <p className="text-sm text-red-600" data-testid="error-legal-company-name">
              {validationErrors['companyInformation.legalName']}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Official registered business name as it appears on legal documents
          </p>
        </div>

        {/* DBA/Trade Name */}
        <div className="space-y-2">
          <Label htmlFor="dba-name" className="text-sm font-medium">
            DBA/Trade Name (Optional)
          </Label>
          <Input
            id="dba-name"
            data-testid="dba-name"
            type="text"
            value={companyInfo.dbaName || ''}
            onChange={(e) => handleFieldChange('dbaName', e.target.value)}
            placeholder="ABC Manufacturing"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500">
            "Doing Business As" name if different from legal name
          </p>
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="business-type" className="text-sm font-medium">
            Business Type *
          </Label>
          <Select
            value={companyInfo.businessType}
            onValueChange={(value: BusinessType) => handleFieldChange('businessType', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              id="business-type"
              data-testid="business-type"
              className={validationErrors['companyInformation.businessType'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex flex-col">
                    <span>{getBusinessTypeDisplay(type)}</span>
                    <span className="text-xs text-gray-500">{getBusinessTypeDescription(type)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors['companyInformation.businessType'] && (
            <p className="text-sm text-red-600" data-testid="error-business-type">
              {validationErrors['companyInformation.businessType']}
            </p>
          )}
          {companyInfo.businessType && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>{getBusinessTypeDisplay(companyInfo.businessType)}:</strong> {getBusinessTypeDescription(companyInfo.businessType)}
              </p>
            </div>
          )}
        </div>

        {/* Industry Selection with Search */}
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-sm font-medium flex items-center gap-1">
            <Search className="w-4 h-4" />
            Industry *
          </Label>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search industries..."
              value={industrySearch}
              onChange={(e) => setIndustrySearch(e.target.value)}
              disabled={isSubmitting}
              className="mb-2"
            />
            <Select
              value={companyInfo.industry}
              onValueChange={(value: IndustryType) => handleFieldChange('industry', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger 
                id="industry"
                data-testid="industry"
                className={validationErrors['companyInformation.industry'] ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {filteredIndustries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {getIndustryDisplay(industry)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {validationErrors['companyInformation.industry'] && (
            <p className="text-sm text-red-600" data-testid="error-industry">
              {validationErrors['companyInformation.industry']}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Industry classification affects compliance requirements and shipping restrictions
          </p>
        </div>

        {/* Annual Shipping Volume */}
        <div className="space-y-2">
          <Label htmlFor="shipping-volume" className="text-sm font-medium flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Annual Shipping Volume *
          </Label>
          <Select
            value={companyInfo.annualShippingVolume}
            onValueChange={(value: ShippingVolumeRange) => handleFieldChange('annualShippingVolume', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              id="shipping-volume"
              data-testid="shipping-volume"
              className={validationErrors['companyInformation.annualShippingVolume'] ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select annual shipping volume" />
            </SelectTrigger>
            <SelectContent>
              {SHIPPING_VOLUME_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  <div className="flex flex-col">
                    <span>{getVolumeDisplay(range)}</span>
                    <span className="text-xs text-gray-500">{getVolumeDescription(range)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors['companyInformation.annualShippingVolume'] && (
            <p className="text-sm text-red-600" data-testid="error-shipping-volume">
              {validationErrors['companyInformation.annualShippingVolume']}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Estimated annual value of all shipping activities - determines account tier and pricing
          </p>
        </div>

        {/* Business Description */}
        <div className="space-y-2">
          <Label htmlFor="business-description" className="text-sm font-medium flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Business Description (Optional)
          </Label>
          <Textarea
            id="business-description"
            data-testid="business-description"
            value={companyInfo.businessDescription || ''}
            onChange={(e) => handleFieldChange('businessDescription', e.target.value)}
            placeholder="Brief description of your business operations, products, or services..."
            rows={3}
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Optional description of business operations and products/services</span>
            <span>{(companyInfo.businessDescription || '').length}/500</span>
          </div>
        </div>

        {/* Company Information Summary */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Summary
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {companyInfo.businessType ? getBusinessTypeDisplay(companyInfo.businessType) : 'Business Type Not Selected'}
              </Badge>
              <Badge variant="outline" className="bg-white">
                {companyInfo.industry ? getIndustryDisplay(companyInfo.industry) : 'Industry Not Selected'}
              </Badge>
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>Legal Name:</strong> {companyInfo.legalName || 'Not specified'}</p>
              {companyInfo.dbaName && (
                <p><strong>DBA:</strong> {companyInfo.dbaName}</p>
              )}
              <p><strong>Annual Volume:</strong> {companyInfo.annualShippingVolume ? getVolumeDisplay(companyInfo.annualShippingVolume) : 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Account Tier Information */}
        {companyInfo.annualShippingVolume && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium mb-2">Account Tier Information</h4>
            <div className="text-sm text-blue-800">
              {companyInfo.annualShippingVolume === 'under-10k' && (
                <p>Starter Account: Basic shipping features and standard rates</p>
              )}
              {companyInfo.annualShippingVolume === '10k-50k' && (
                <p>Business Account: Preferred rates and enhanced tracking</p>
              )}
              {companyInfo.annualShippingVolume === '50k-250k' && (
                <p>Professional Account: Volume discounts and dedicated support</p>
              )}
              {companyInfo.annualShippingVolume === '250k-1m' && (
                <p>Enterprise Account: Custom pricing and premium services</p>
              )}
              {(companyInfo.annualShippingVolume === '1m-5m' || companyInfo.annualShippingVolume === '5m-25m' || 
                companyInfo.annualShippingVolume === '25m-100m' || companyInfo.annualShippingVolume === 'over-100m') && (
                <p>Strategic Account: White-glove service and custom solutions</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CompanyInformationSection;
