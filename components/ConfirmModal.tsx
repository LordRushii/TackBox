import React from "react";

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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
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
