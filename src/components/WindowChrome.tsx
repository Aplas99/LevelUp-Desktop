import type { ReactNode } from "react";

function WindowButton({
  label,
  onClick,
  kind = "default",
  children,
}: {
  label: string;
  onClick: () => Promise<void>;
  kind?: "default" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => void onClick()}
      className={`window-control no-drag ${
        kind === "danger"
          ? "border-red-400/40 text-red-200 hover:border-red-300 hover:bg-red-500/18"
          : "border-cyan-400/35 text-cyan-100 hover:border-cyan-300 hover:bg-cyan-400/14"
      }`}
    >
      {children}
    </button>
  );
}

export function WindowChrome() {
  return (
    <header className="drag-region relative border-b border-cyan-400/20 bg-slate-950/92 px-4 pb-3 pt-2">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-6 top-2 h-10 rounded-full bg-cyan-300/6 blur-xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.45em] text-cyan-300/80">
            System Panel
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.35em] text-slate-200">
            Quest Interface
          </p>
        </div>

        <div className="no-drag flex items-center gap-2">
          <WindowButton
            label="Minimize window"
            onClick={() => window.levelUpAPI.minimizeWindow()}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 18h12" />
            </svg>
          </WindowButton>

          <WindowButton
            label="Close window"
            kind="danger"
            onClick={() => window.levelUpAPI.closeWindow()}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m7 7 10 10" />
              <path d="m17 7-10 10" />
            </svg>
          </WindowButton>
        </div>
      </div>
    </header>
  );
}
