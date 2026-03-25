import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

let toastId = 0;
const listeners: Array<(toast: ToastMessage) => void> = [];

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration = 3000
) => {
  const id = `toast-${++toastId}`;
  const toast: ToastMessage = { id, message, type, duration };
  listeners.forEach((listener) => listener(toast));
};

export const Toast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
      if (toast.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration);
      }
    };

    listeners.push(listener);
    return () => {
      listeners.splice(listeners.indexOf(listener), 1);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} animate-pulse`}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
