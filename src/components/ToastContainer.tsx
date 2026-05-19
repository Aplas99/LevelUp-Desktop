import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  type: "xp" | "levelup" | "streak" | "timer";
  title: string;
  body?: string;
}

const CLIP = "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))";

const CONFIG: Record<Toast["type"], { icon: React.ReactNode; accent: string }> = {
  xp: {
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="m12 2 2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6Z" />
      </svg>
    ),
    accent: "text-orange-400 border-orange-400/30",
  },
  levelup: {
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    accent: "text-cyan-400 border-cyan-400/40",
  },
  streak: {
    icon: (
      <svg viewBox="0 0 16 20" className="h-4 w-3" fill="currentColor">
        <path d="M8 0C8 0 14 7 14 12a6 6 0 1 1-12 0C2 7 8 0 8 0Z" />
      </svg>
    ),
    accent: "text-amber-400 border-amber-400/30",
  },
  timer: {
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="13" r="7" />
        <path d="M12 13V9.5" />
        <path d="m9 2 3 2 3-2" />
      </svg>
    ),
    accent: "text-blue-400 border-blue-400/30",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [fading, setFading] = useState(false);
  const { icon, accent } = CONFIG[toast.type];

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2600);
    const removeTimer = setTimeout(() => onDismiss(toast.id), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`toast-enter flex items-start gap-3 border bg-slate-950 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-opacity duration-400 ${accent} ${fading ? "opacity-0" : "opacity-100"}`}
      style={{ clipPath: CLIP }}
    >
      <span className={`mt-0.5 shrink-0 ${accent.split(" ")[0]}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-wider text-white">
          {toast.title}
        </p>
        {toast.body && (
          <p className="mt-0.5 text-[10px] text-slate-500">{toast.body}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-700 transition hover:text-slate-400"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="m18 6-12 12M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-40 flex w-64 -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
