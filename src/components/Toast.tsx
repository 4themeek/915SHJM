'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ToastContextType {
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

// Global singleton for use outside React tree
let globalShowToast: (msg: string) => void = () => {};
export const toast = (msg: string) => globalShowToast(msg);

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    globalShowToast = showToast;
  }, [showToast]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: 'var(--navy)',
        color: 'var(--gold)',
        border: '1px solid var(--gold)',
        padding: '1rem 1.5rem',
        fontFamily: 'var(--font-display)',
        fontSize: '0.78rem',
        letterSpacing: '0.08em',
        zIndex: 999,
        maxWidth: '340px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.3s',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}
