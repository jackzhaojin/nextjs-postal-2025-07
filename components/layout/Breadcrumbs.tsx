'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  title: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  showHome = true,
  className
}: BreadcrumbsProps) {
  const allItems = showHome 
    ? [{ title: 'Home', href: '/', current: false }, ...items]
    : items;

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            )}
            
            {item.current || !item.href ? (
              <span 
                className={cn(
                  'font-medium',
                  item.current ? 'text-foreground' : 'text-muted-foreground'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {index === 0 && showHome ? (
                  <Home className="h-4 w-4" aria-label={item.title} />
                ) : (
                  item.title
                )}
              </span>
            ) : (
              <Link
                href={item.href as any}
                className="hover:text-foreground transition-colors"
              >
                {index === 0 && showHome ? (
                  <Home className="h-4 w-4" aria-label={item.title} />
                ) : (
                  item.title
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
