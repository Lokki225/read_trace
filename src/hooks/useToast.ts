import { useCallback } from 'react';

interface ToastOptions {
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, type, duration = 3000 } = options;
    
    // Create a simple toast notification using browser alert for now
    // In production, this would use a toast library like react-hot-toast or sonner
    const message = `${title}: ${description}`;
    
    if (type === 'error') {
      console.error(message);
    } else if (type === 'success') {
      console.log(message);
    } else {
      console.info(message);
    }
    
    // For better UX, we could dispatch a custom event or use a context
    // For now, we'll just log it
  }, []);

  return { toast };
}
