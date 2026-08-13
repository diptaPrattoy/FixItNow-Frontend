"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);

      setItems((current) => [...current, { id, message, tone }]);

      window.setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-4 top-20 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:right-5 sm:w-[390px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="toast-enter pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white px-4 py-4 text-sm text-slate-700 shadow-xl shadow-slate-900/10"
            role={item.tone === "error" ? "alert" : "status"}
          >
            {/* Green / Red accent */}
            <span
              className={`absolute inset-y-0 left-0 w-1 ${
                item.tone === "error" ? "bg-rose-500" : "bg-emerald-600"
              }`}
            />
            {/* Icon */}
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                item.tone === "error"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
              aria-hidden="true"
            >
              {item.tone === "error" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-semibold text-slate-900">
                {item.tone === "error"
                  ? "Something went wrong"
                  : item.tone === "success"
                    ? "Success"
                    : "FixItNow"}
              </p>

              <p className="mt-0.5 leading-5 text-slate-500">{item.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className={`grid size-7 shrink-0 place-items-center rounded-lg text-lg leading-none transition-all hover:rotate-90 active:scale-90 ${
                item.tone === "error"
                  ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
              aria-label="Dismiss notification"
            >
              ×
            </button>
            {/* Progress bar */}
            <span
              className={`toast-progress absolute bottom-0 left-0 h-0.5 ${
                item.tone === "error" ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />{" "}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
