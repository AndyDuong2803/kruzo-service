import clsx from "clsx";

import type { ToastMessage } from "./types";

type ToastProps = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

const toneClassName: Record<ToastMessage["tone"], string> = {
  info: "border-border bg-card text-foreground",
  success: "border-[var(--accent-border)] bg-[var(--accent-soft)] text-foreground",
  warning: "border-amber-300/70 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100",
  error: "border-red-300/70 bg-red-100 text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100",
};

const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[90] grid w-[min(24rem,calc(100vw-2.5rem))] gap-2" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx("rounded-xl border px-4 py-3 shadow-lg backdrop-blur", toneClassName[toast.tone])}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">{toast.message}</p>
            <button
              type="button"
              className="text-sm font-semibold opacity-70 transition hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
