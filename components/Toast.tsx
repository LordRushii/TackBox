import React from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

export type ToastProps = {
  show: boolean;
  message: string;
  type?: "success" | "info" | "error";
  onClose?: () => void;
};

export default function Toast({ show, message, type = "success", onClose }: ToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 p-2 max-w-sm animate-bounce" onClick={onClose}>
      <div className="alert border shadow-2xl rounded-2xl flex items-center gap-3 p-4 bg-base-300 border-base-200 cursor-pointer">
        {type === "success" && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        )}
        {type === "error" && (
          <AlertTriangle className="w-5 h-5 text-error shrink-0" />
        )}
        {type === "info" && (
          <Info className="w-5 h-5 text-primary shrink-0" />
        )}
        <span className="font-bold text-xs sm:text-sm text-base-content/95">{message}</span>
      </div>
    </div>
  );
}
