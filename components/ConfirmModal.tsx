"use client";

import React, { useEffect } from "react";

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
  // Escape closes, unless the action is already running
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-6" onClick={isProcessing ? undefined : onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="toast-in w-full max-w-md rounded-2xl border border-line-strong bg-card p-6 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-heading text-lg font-medium text-foreground">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-[22px] text-subtle">{message}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={isProcessing} className="btn btn-secondary h-9 px-3 text-sm">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} disabled={isProcessing} className="btn btn-danger-solid h-9 gap-2 px-3 text-sm">
            {isProcessing && <span className="loading loading-spinner loading-xs" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
