import { useState } from 'react';
import type { ToastState } from '../types';

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type, leaving: false });
    setTimeout(() => setToast(prev => prev ? { ...prev, leaving: true } : null), 2700);
    setTimeout(() => setToast(null), 3000);
  };

  return { toast, showToast };
}
