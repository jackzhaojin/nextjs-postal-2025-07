// Validation Errors component for displaying submission validation issues
// Shows errors, warnings, and provides navigation to resolve issues

import React from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  ExternalLink, 
  Navigation,
  Info
} from 'lucide-react';
import { SubmissionValidationResult, SubmissionValidationError } from '@/lib/types';

interface ValidationErrorsProps {
  validationResult: SubmissionValidationResult;
  onRetryValidation?: () => void;
}

export function ValidationErrors({ validationResult, onRetryValidation }: ValidationErrorsProps) {
  const router = useRouter();
  
  console.log('ValidationErrors - rendering with result:', validationResult);

  const { isValid, errors, warnings, missingAcknowledgments, conflictingRequirements } = validationResult;

  const handleNavigate = (path: string) => {
    console.log(`ValidationErrors - navigating to: ${path}`);
    router.push(path);
  };

  // Show success state if all validations pass
  if (isValid && errors.length === 0 && missingAcknowledgments.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">All Validation Checks Passed</AlertTitle>
        <AlertDescription className="text-green-700">
          Your shipment is ready for submission. All required information has been provided and validated.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critical Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Critical Issues ({errors.length})
            </CardTitle>
            <p className="text-sm text-red-600">
              The following issues must be resolved before submitting your shipment:
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {errors.map((error, index) => (
              <ValidationErrorItem 
                key={index} 
                error={error} 
                onNavigate={handleNavigate}
                severity="error"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Missing Acknowledgments */}
      {missingAcknowledgments.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Missing Acknowledgments ({missingAcknowledgments.length})
            </CardTitle>
            <p className="text-sm text-amber-600">
              Please check all required acknowledgments below:
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {missingAcknowledgments.map((acknowledgment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-sm font-medium text-amber-800">{acknowledgment}</span>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Required
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Conflicting Requirements */}
      {conflictingRequirements.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conflicting Requirements ({conflictingRequirements.length})
            </CardTitle>
            <p className="text-sm text-orange-600">
              The following requirements conflict with each other and need to be resolved:
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflictingRequirements.map((conflict, index) => (
              <div key={index} className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">{conflict}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Warnings ({warnings.length})
            </CardTitle>
            <p className="text-sm text-blue-600">
              These issues won't prevent submission but should be reviewed:
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {warnings.map((warning, index) => (
              <ValidationErrorItem 
                key={index} 
                error={warning} 
                onNavigate={handleNavigate}
                severity="warning"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Retry Button */}
      {onRetryValidation && (errors.length > 0 || missingAcknowledgments.length > 0) && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={onRetryValidation}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Recheck Validation
          </Button>
        </div>
      )}
    </div>
  );
}

interface ValidationErrorItemProps {
  error: SubmissionValidationError;
  onNavigate: (path: string) => void;
  severity: 'error' | 'warning';
}

function ValidationErrorItem({ error, onNavigate, severity }: ValidationErrorItemProps) {
  const iconColor = severity === 'error' ? 'text-red-500' : 'text-blue-500';
  const bgColor = severity === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = severity === 'error' ? 'text-red-800' : 'text-blue-800';
  const hintColor = severity === 'error' ? 'text-red-600' : 'text-blue-600';

  return (
    <div className={`p-4 ${bgColor} rounded-lg space-y-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {severity === 'error' ? (
              <XCircle className={`h-4 w-4 ${iconColor}`} />
            ) : (
              <Info className={`h-4 w-4 ${iconColor}`} />
            )}
            <span className={`text-sm font-medium ${textColor}`}>
              {error.message}
            </span>
          </div>
          
          {error.resolutionHint && (
            <p className={`text-xs ${hintColor} mt-1 ml-6`}>
              {error.resolutionHint}
            </p>
          )}
          
          {error.field && (
            <div className="mt-2 ml-6">
              <Badge variant="outline" className="text-xs">
                Field: {error.field}
              </Badge>
            </div>
          )}
        </div>
        
        {error.navigationPath && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(error.navigationPath!)}
            className="gap-1 text-xs"
          >
            <Navigation className="h-3 w-3" />
            Fix
          </Button>
        )}
      </div>
    </div>
  );
}
