'use client';

import { useState, useCallback } from 'react';

interface UseClipboardCopyState {
  copied: boolean;
  error: string | null;
  isSupported: boolean;
}

interface UseClipboardCopyResult extends UseClipboardCopyState {
  copyToClipboard: (text: string) => Promise<boolean>;
  resetCopiedState: () => void;
}

export function useClipboardCopy(resetTimeout: number = 2000): UseClipboardCopyResult {
  const [state, setState] = useState<UseClipboardCopyState>({
    copied: false,
    error: null,
    isSupported: typeof navigator !== 'undefined' && 'clipboard' in navigator
  });

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    console.log('useClipboardCopy - Attempting to copy text:', text);
    
    setState(prev => ({ ...prev, copied: false, error: null }));

    try {
      if (!state.isSupported) {
        throw new Error('Clipboard API not supported in this browser');
      }

      await navigator.clipboard.writeText(text);
      
      setState(prev => ({ ...prev, copied: true, error: null }));
      console.log('useClipboardCopy - Text copied successfully');

      // Reset copied state after timeout
      setTimeout(() => {
        setState(prev => ({ ...prev, copied: false }));
      }, resetTimeout);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to copy to clipboard';
      console.error('useClipboardCopy - Copy failed:', error);
      
      setState(prev => ({ 
        ...prev, 
        copied: false, 
        error: errorMessage 
      }));

      // Fallback to document.execCommand for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          setState(prev => ({ ...prev, copied: true, error: null }));
          console.log('useClipboardCopy - Fallback copy successful');
          
          setTimeout(() => {
            setState(prev => ({ ...prev, copied: false }));
          }, resetTimeout);
          
          return true;
        } else {
          throw new Error('Fallback copy method failed');
        }
      } catch (fallbackError) {
        console.error('useClipboardCopy - Fallback copy failed:', fallbackError);
        return false;
      }
    }
  }, [state.isSupported, resetTimeout]);

  const resetCopiedState = useCallback(() => {
    setState(prev => ({ ...prev, copied: false, error: null }));
  }, []);

  return {
    copied: state.copied,
    error: state.error,
    isSupported: state.isSupported,
    copyToClipboard,
    resetCopiedState
  };
}

export default useClipboardCopy;
