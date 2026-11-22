import React from "react";
import { AlertTriangle, Check, Info } from "lucide-react";

export type ToastProps = {
  show: boolean;
  message: string;
  type?: "success" | "info" | "error";
  onClose?: () => void;
};

const ICONS = { success: Check, error: AlertTriangle, info: Info };
const ICON_COLOR = { success: "text-positive", error: "text-negative", info: "text-muted" };

export default function Toast({ show, message, type = "success", onClose }: ToastProps) {
  if (!show) return null;
  const Icon = ICONS[type];

  return (
    <div role="status" aria-live="polite" className="toast-in fixed bottom-6 right-6 z-50 max-w-sm">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-3 rounded-xl border border-line-strong bg-card px-4 py-3 text-left shadow-float"
      >
        <Icon className={`size-4 shrink-0 ${ICON_COLOR[type]}`} strokeWidth={1.5} />
        <span className="text-sm text-foreground">{message}</span>
      </button>
    </div>
  );
}
