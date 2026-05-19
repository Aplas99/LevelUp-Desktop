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
      className={`no-drag window-control ${
        kind === "danger"
          ? "border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/20"
          : "border-slate-700/60 text-slate-500 hover:border-slate-500 hover:bg-slate-700/50"
      }`}
    >
      {children}
    </button>
  );
}

export function WindowChrome() {
  return (
    <header className="drag-region flex items-center justify-between border-b border-cyan-400/10 bg-slate-950 px-3.5 py-2">
      <div className="pointer-events-none flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/30" />
        <p className="ml-1 text-[9px] font-bold uppercase tracking-[0.45em] text-cyan-400/60">
          System Online
        </p>
      </div>
      <div className="no-drag flex items-center gap-1.5">
        <WindowButton
          label="Minimize window"
          onClick={() => window.levelUpAPI.minimizeWindow()}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M5 12h14" />
          </svg>
        </WindowButton>
        <WindowButton
          label="Close window"
          kind="danger"
          onClick={() => window.levelUpAPI.closeWindow()}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="m6 6 12 12" />
            <path d="m18 6-12 12" />
          </svg>
        </WindowButton>
      </div>
    </header>
  );
}
