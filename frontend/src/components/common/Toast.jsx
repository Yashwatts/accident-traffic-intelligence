import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const Toast = ({ id, message, type = 'info', duration = 5000 }) => {
  const { removeToast } = useUIStore();

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, removeToast]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'glass-heavy text-alert-safe border-alert-safe/30 shadow-glow-sm',
    error: 'glass-heavy text-alert-critical border-alert-critical/30 shadow-glow-sm',
    warning: 'glass-heavy text-alert-warning border-alert-warning/30 shadow-glow-sm',
    info: 'glass-heavy text-pulse-400 border-pulse-500/30 shadow-glow-sm',
  };

  const iconColors = {
    success: 'text-alert-safe',
    error: 'text-alert-critical',
    warning: 'text-alert-warning',
    info: 'text-pulse-400',
  };

  return (
    <div
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg border min-w-[300px] max-w-md animate-slide-in hover-lift ${styles[type]}`}
    >
      <div className={`flex-shrink-0 p-2 rounded-lg bg-${iconColors[type]}/10 border border-${iconColors[type]}/20 ${iconColors[type]}`}>{icons[type]}</div>
      <p className="flex-1 text-sm font-medium text-white">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="flex-shrink-0 p-1.5 hover:bg-pulse-500/10 rounded-lg transition-all border border-transparent hover:border-pulse-500/30"
      >
        <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
      </button>
    </div>
  );
};

/**
 * Toast Container - renders all active toasts
 */
export const ToastContainer = () => {
  const { toasts } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default Toast;
