import type { ReactNode } from "react";

function WindowButton({
  label,
  onClick,
  kind = "default",
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  kind?: "default" | "danger" | "toggle";
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`no-drag window-control ${
        kind === "danger"
          ? "border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/20"
          : kind === "toggle"
            ? active
              ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300 hover:bg-cyan-400/25"
              : "border-slate-700/60 text-slate-600 hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-400"
            : "border-slate-700/60 text-slate-500 hover:border-slate-500 hover:bg-slate-700/50"
      }`}
    >
      {children}
    </button>
  );
}

interface WindowChromeProps {
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
}

export function WindowChrome({ alwaysOnTop, onToggleAlwaysOnTop }: WindowChromeProps) {
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
        {/* Always-on-top pin */}
        <WindowButton
          label={alwaysOnTop ? "Disable always on top" : "Enable always on top"}
          kind="toggle"
          active={alwaysOnTop}
          onClick={onToggleAlwaysOnTop}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </WindowButton>

        <WindowButton
          label="Minimize window"
          onClick={() => void window.levelUpAPI.minimizeWindow()}
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
          onClick={() => void window.levelUpAPI.closeWindow()}
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
