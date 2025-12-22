import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Modal component for dialogs and confirmations
 */
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
    xl: 'max-w-2xl sm:max-w-3xl lg:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal - Slides up on mobile, centered on desktop */}
      <div 
        className={`
          relative bg-white dark:bg-command-elevated rounded-t-2xl sm:rounded-xl 
          shadow-2xl ${sizeClasses[size]} w-full 
          max-h-[90vh] sm:max-h-[85vh] overflow-y-auto
          transform transition-transform duration-300
          scrollbar-thin
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-command-elevated z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-command-border">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white pr-8">{title}</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-command-surface touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation Modal component
 */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
  const typeClasses = {
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    warning: 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">{message}</p>
      
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 dark:border-command-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-command-surface active:bg-gray-100 dark:active:bg-command-surface/80 transition-colors font-medium touch-manipulation"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-white rounded-lg transition-colors font-medium touch-manipulation ${typeClasses[type]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

/**
 * Input Modal component
 */
export function InputModal({ isOpen, onClose, onConfirm, title, message, placeholder = '', confirmText = 'Submit', cancelText = 'Cancel', type = 'primary' }) {
  const [value, setValue] = useState('');

  const typeClasses = {
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    warning: 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
  };

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
    setValue('');
  };

  const handleClose = () => {
    onClose();
    setValue('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">{message}</p>
      
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-command-border rounded-lg bg-white dark:bg-command-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-pulse-500 focus:border-transparent resize-none transition-colors text-sm sm:text-base touch-manipulation"
        rows={4}
      />
      
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
        <button
          onClick={handleClose}
          className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 dark:border-command-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-command-surface active:bg-gray-100 dark:active:bg-command-surface/80 transition-colors font-medium touch-manipulation"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-white rounded-lg transition-colors font-medium touch-manipulation ${typeClasses[type]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;
