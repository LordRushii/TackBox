import React from "react";

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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} className="w-5 h-5 text-emerald-500 shrink-0" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        )}
        {type === "error" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} className="w-5 h-5 text-error shrink-0" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {type === "info" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} className="w-5 h-5 text-primary shrink-0" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        )}
        <span className="font-bold text-xs sm:text-sm text-base-content/95">{message}</span>
      </div>
    </div>
  );
}
