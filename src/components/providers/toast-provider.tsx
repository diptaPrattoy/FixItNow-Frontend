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
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
        aria-live="polite"
        aria-atomic="true"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg shadow-slate-950/10"
            role={item.tone === "error" ? "alert" : "status"}
          >
            <span
              className={`mt-1 size-2 shrink-0 rounded-full ${
                item.tone === "success"
                  ? "bg-emerald-500"
                  : item.tone === "error"
                    ? "bg-rose-500"
                    : "bg-sky-500"
              }`}
            />
            <p className="flex-1 leading-5">{item.message}</p>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="rounded-md px-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              ×
            </button>
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
