import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'bottom-sheet' | 'center-dialog';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  variant = 'bottom-sheet',
  showCloseButton = true,
}) => {
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

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-slate-900/50 backdrop-blur-xs transition-opacity p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="modal-container"
        className={`w-full max-w-lg bg-white overflow-hidden shadow-2xl transition-all ${
          variant === 'bottom-sheet'
            ? 'rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300'
            : 'rounded-2xl max-h-[85vh] flex flex-col mx-4 animate-in zoom-in-95 duration-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for bottom-sheet */}
        {variant === 'bottom-sheet' && (
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              {title && <h3 className="text-base sm:text-lg font-bold text-slate-800 font-heading">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                id="modal-close-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup Modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-100px)] no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
