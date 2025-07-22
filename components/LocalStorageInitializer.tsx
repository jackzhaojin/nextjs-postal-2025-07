'use client';

import { useEffect } from 'react';
import { LocalStorageUtil } from '@/lib/localStorage';

/**
 * Component to initialize localStorage cleanup on app start
 * Ensures any existing 'USA' country codes are converted to 'US'
 */
export function LocalStorageInitializer() {
  useEffect(() => {
    // Run cleanup on mount to ensure data consistency
    LocalStorageUtil.cleanup();
  }, []);

  // This component renders nothing
  return null;
}