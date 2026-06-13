import React from "react";
import { AlertTriangle } from "lucide-react";

export type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-200 border border-base-200/60 rounded-2xl shadow-2xl">
        <h3 className="font-extrabold text-xl text-error flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          {title}
        </h3>
        <p className="py-4 text-sm text-base-content/70">
          {message}
        </p>
        <div className="modal-action">
          <button 
            onClick={onCancel} 
            className="btn btn-outline border-base-200/50 hover:bg-base-200/20"
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className="btn btn-error"
            disabled={isProcessing}
          >
            {isProcessing ? <span className="loading loading-spinner loading-xs"></span> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
