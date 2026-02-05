'use client';

import { useState, useEffect } from 'react';

export default function DebugErrorChecker() {
  const [errorInfo, setErrorInfo] = useState<string>('');

  useEffect(() => {
    // Override console.error to catch the error
    const originalError = console.error;
    console.error = function(...args) {
      // Check if any argument contains "[object Event]"
      const hasEventError = args.some(arg => 
        typeof arg === 'string' && arg.includes('[object Event]')
      );
      
      if (hasEventError) {
        setErrorInfo(`Error detected: ${args.join(' ')}`);
        console.log('🔍 DEBUG: Found [object Event] error:', args);
      }
      
      // Call original console.error
      originalError.apply(console, args);
    };

    // Also check for unhandled rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('[object Event]')) {
        setErrorInfo(`Unhandled rejection: ${event.reason}`);
        console.log('🔍 DEBUG: Unhandled rejection with [object Event]:', event.reason);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (errorInfo) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Debug Info:</strong> {errorInfo}
      </div>
    );
  }

  return null;
}