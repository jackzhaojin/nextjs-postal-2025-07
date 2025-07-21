'use client';

import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { ChevronDown, ChevronUp, Settings, User, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ProgressiveDisclosureContextType {
  mode: 'basic' | 'advanced' | 'expert';
  showAdvanced: boolean;
  expertMode: boolean;
  userLevel: 'beginner' | 'intermediate' | 'expert';
  setMode: (mode: 'basic' | 'advanced' | 'expert') => void;
  setShowAdvanced: (show: boolean) => void;
  setExpertMode: (expert: boolean) => void;
  setUserLevel: (level: 'beginner' | 'intermediate' | 'expert') => void;
  isFieldVisible: (fieldId: string, level: 'basic' | 'advanced' | 'expert') => boolean;
  onModeChange?: (mode: 'basic' | 'advanced' | 'expert') => void;
}

const ProgressiveDisclosureContext = createContext<ProgressiveDisclosureContextType | null>(null);

export function useProgressiveDisclosure() {
  const context = useContext(ProgressiveDisclosureContext);
  if (!context) {
    throw new Error('useProgressiveDisclosure must be used within a ProgressiveDisclosureProvider');
  }
  return context;
}

interface ProgressiveDisclosureProviderProps {
  children: React.ReactNode;
  initialMode?: 'basic' | 'advanced' | 'expert';
  initialUserLevel?: 'beginner' | 'intermediate' | 'expert';
  onModeChange?: (mode: 'basic' | 'advanced' | 'expert') => void;
  onUserLevelChange?: (level: 'beginner' | 'intermediate' | 'expert') => void;
}

export function ProgressiveDisclosureProvider({
  children,
  initialMode = 'basic',
  initialUserLevel = 'beginner',
  onModeChange,
  onUserLevelChange
}: ProgressiveDisclosureProviderProps) {
  console.log('ProgressiveDisclosureProvider: Initializing with mode:', initialMode, 'userLevel:', initialUserLevel);

  const [mode, setModeState] = useState<'basic' | 'advanced' | 'expert'>(initialMode);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [userLevel, setUserLevelState] = useState<'beginner' | 'intermediate' | 'expert'>(initialUserLevel);

  const setMode = useCallback((newMode: 'basic' | 'advanced' | 'expert') => {
    console.log('ProgressiveDisclosureProvider: Mode changed to:', newMode);
    setModeState(newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);

  const setUserLevel = useCallback((newLevel: 'beginner' | 'intermediate' | 'expert') => {
    console.log('ProgressiveDisclosureProvider: User level changed to:', newLevel);
    setUserLevelState(newLevel);
    onUserLevelChange?.(newLevel);
  }, [onUserLevelChange]);

  // Field visibility logic based on mode and user level
  const isFieldVisible = useCallback((fieldId: string, level: 'basic' | 'advanced' | 'expert') => {
    console.log('ProgressiveDisclosureProvider: Checking visibility for field:', fieldId, 'level:', level);
    
    // Always show basic fields
    if (level === 'basic') return true;
    
    // Show advanced fields if in advanced or expert mode, or if explicitly shown
    if (level === 'advanced') {
      return mode === 'advanced' || mode === 'expert' || showAdvanced;
    }
    
    // Show expert fields only in expert mode
    if (level === 'expert') {
      return mode === 'expert' || expertMode;
    }
    
    return false;
  }, [mode, showAdvanced, expertMode]);

  const value = useMemo(() => ({
    mode,
    showAdvanced,
    expertMode,
    userLevel,
    setMode,
    setShowAdvanced,
    setExpertMode,
    setUserLevel,
    isFieldVisible,
    onModeChange
  }), [mode, showAdvanced, expertMode, userLevel, setMode, setUserLevel, isFieldVisible, onModeChange]);

  return (
    <ProgressiveDisclosureContext.Provider value={value}>
      {children}
    </ProgressiveDisclosureContext.Provider>
  );
}

interface DisclosureSectionProps {
  title: string;
  description?: string;
  level: 'basic' | 'advanced' | 'expert';
  fieldId?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  className?: string;
}

export function DisclosureSection({
  title,
  description,
  level,
  fieldId,
  children,
  defaultExpanded = true,
  collapsible = true,
  className = ''
}: DisclosureSectionProps) {
  console.log('DisclosureSection: Rendering section:', title, 'level:', level);

  const { isFieldVisible, mode, userLevel } = useProgressiveDisclosure();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isVisible = fieldId ? isFieldVisible(fieldId, level) : true;

  const handleToggle = useCallback(() => {
    console.log('DisclosureSection: Toggling expansion for:', title);
    setIsExpanded(prev => !prev);
  }, [title]);

  const getLevelBadge = () => {
    const levelConfig = {
      basic: { color: 'bg-green-100 text-green-800', icon: <User className="h-3 w-3" /> },
      advanced: { color: 'bg-blue-100 text-blue-800', icon: <Settings className="h-3 w-3" /> },
      expert: { color: 'bg-purple-100 text-purple-800', icon: <Zap className="h-3 w-3" /> }
    };

    const config = levelConfig[level];
    return (
      <Badge className={`text-xs ${config.color}`}>
        {config.icon}
        <span className="ml-1 capitalize">{level}</span>
      </Badge>
    );
  };

  if (!isVisible) {
    console.log('DisclosureSection: Section not visible:', title);
    return null;
  }

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader className={`${collapsible ? 'cursor-pointer' : ''} pb-3`} onClick={collapsible ? handleToggle : undefined}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{title}</CardTitle>
            {getLevelBadge()}
          </div>
          {collapsible && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {description && isExpanded && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface DisclosureFieldProps {
  fieldId: string;
  level: 'basic' | 'advanced' | 'expert';
  children: React.ReactNode;
  wrapper?: boolean;
  className?: string;
}

export function DisclosureField({
  fieldId,
  level,
  children,
  wrapper = true,
  className = ''
}: DisclosureFieldProps) {
  console.log('DisclosureField: Rendering field:', fieldId, 'level:', level);

  const { isFieldVisible } = useProgressiveDisclosure();
  const isVisible = isFieldVisible(fieldId, level);

  if (!isVisible) {
    console.log('DisclosureField: Field not visible:', fieldId);
    return null;
  }

  if (!wrapper) {
    return <>{children}</>;
  }

  return (
    <div className={`transition-all duration-200 ${className}`} data-field-id={fieldId} data-level={level}>
      {children}
    </div>
  );
}

interface ModeToggleProps {
  className?: string;
  showUserLevel?: boolean;
  compact?: boolean;
}

export function ModeToggle({ className = '', showUserLevel = true, compact = false }: ModeToggleProps) {
  console.log('ModeToggle: Rendering mode toggle');

  const {
    mode,
    showAdvanced,
    expertMode,
    userLevel,
    setMode,
    setShowAdvanced,
    setExpertMode,
    setUserLevel
  } = useProgressiveDisclosure();

  const modeOptions = [
    { value: 'basic', label: 'Basic', icon: <User className="h-4 w-4" />, description: 'Essential fields only' },
    { value: 'advanced', label: 'Advanced', icon: <Settings className="h-4 w-4" />, description: 'Additional options' },
    { value: 'expert', label: 'Expert', icon: <Zap className="h-4 w-4" />, description: 'All available fields' }
  ] as const;

  const userLevelOptions = [
    { value: 'beginner', label: 'Beginner', description: 'New to shipping' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'expert', label: 'Expert', description: 'Experienced shipper' }
  ] as const;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Label className="text-sm">Mode:</Label>
        <div className="flex items-center gap-1">
          {modeOptions.map((option) => (
            <Button
              key={option.value}
              variant={mode === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode(option.value)}
              className="text-xs"
            >
              {option.icon}
              <span className="ml-1">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Interface Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Display Mode</Label>
          <div className="grid grid-cols-1 gap-2">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                className={`p-3 rounded-lg border text-left transition-colors hover:bg-gray-50 ${
                  mode === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setMode(option.value)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                  {mode === option.value && <Badge className="bg-blue-100 text-blue-800">Active</Badge>}
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
              id="show-advanced"
            />
            <Label htmlFor="show-advanced" className="text-sm">
              Show advanced fields
            </Label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={expertMode}
              onCheckedChange={setExpertMode}
              id="expert-mode"
            />
            <Label htmlFor="expert-mode" className="text-sm">
              Expert mode
            </Label>
          </div>
        </div>

        {showUserLevel && (
          <div>
            <Label className="text-sm font-medium mb-3 block">Experience Level</Label>
            <div className="grid grid-cols-1 gap-2">
              {userLevelOptions.map((option) => (
                <button
                  key={option.value}
                  className={`p-2 rounded border text-left transition-colors hover:bg-gray-50 ${
                    userLevel === option.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => setUserLevel(option.value)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{option.label}</span>
                    {userLevel === option.value && <Badge className="bg-green-100 text-green-800">Selected</Badge>}
                  </div>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickModeToggleProps {
  className?: string;
}

export function QuickModeToggle({ className = '' }: QuickModeToggleProps) {
  const { mode, setMode } = useProgressiveDisclosure();
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant={mode === 'basic' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('basic')}
        className="text-xs"
      >
        <User className="h-3 w-3 mr-1" />
        Basic
      </Button>
      <Button
        variant={mode === 'advanced' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('advanced')}
        className="text-xs"
      >
        <Settings className="h-3 w-3 mr-1" />
        Advanced
      </Button>
      <Button
        variant={mode === 'expert' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('expert')}
        className="text-xs"
      >
        <Zap className="h-3 w-3 mr-1" />
        Expert
      </Button>
    </div>
  );
}