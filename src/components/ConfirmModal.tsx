"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  isDestructive = true,
  loading = false,
}: ConfirmModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus safe action (Cancel) in destructive dialogs
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !loading) {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ overscrollBehavior: "contain" }}
    >
      <div
        className="bg-white rounded-2xl border border-[#EAECEF] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-3.5 mb-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : "bg-blue-50 text-[#4568F5] border border-blue-100"
              }`}
            >
              {isDestructive ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h3 id="confirm-modal-title" className="text-sm font-bold text-[#171717]">
                {title}
              </h3>
              <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-[#777777] hover:text-[#171717] p-1 rounded-lg hover:bg-[#F7F8FA] transition-colors"
              aria-label="Fermer la boîte de dialogue"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F7F8FA]">
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-[#171717] hover:bg-[#F7F8FA] border border-[#EAECEF] rounded-lg transition-colors focus:ring-2 focus:ring-[#4568F5]/30 focus:outline-none"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 focus:ring-2 focus:outline-none ${
                isDestructive
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/30"
                  : "bg-[#4568F5] hover:bg-[#3654D9] focus:ring-[#4568F5]/30"
              }`}
            >
              {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? "Suppression..." : confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
