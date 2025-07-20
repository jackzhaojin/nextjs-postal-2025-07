'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  onBackClick?: () => void;
  onResetClick?: () => void;
  className?: string;
}

export function Header({
  title = 'B2B Shipping System',
  showBackButton = false,
  backButtonHref,
  onBackClick,
  onResetClick,
  className
}: HeaderProps) {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  const handleResetClick = () => {
    if (onResetClick) {
      onResetClick();
    }
  };

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Back button and logo */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <div className="flex items-center">
              {backButtonHref ? (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-9 w-9 p-0 md:h-10 md:w-auto md:px-3"
                >
                  <Link href={backButtonHref as any} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden md:inline">Back</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                  className="h-9 w-9 p-0 md:h-10 md:w-auto md:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden md:inline">Back</span>
                </Button>
              )}
            </div>
          )}
          
          {/* Logo and brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">BS</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-foreground">{title}</span>
            </div>
          </Link>
        </div>

        {/* Center section - Page title (mobile) */}
        <div className="flex-1 text-center sm:hidden">
          <h1 className="text-sm font-medium text-foreground truncate px-4">
            {title}
          </h1>
        </div>

        {/* Right section - Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 md:h-10 md:w-auto md:px-3"
            title="Help & Support"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Help</span>
          </Button>
          
          {onResetClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetClick}
              className="h-9 w-9 p-0 md:h-10 md:w-auto md:px-3 text-destructive hover:text-destructive"
              title="Reset Form"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Reset</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
