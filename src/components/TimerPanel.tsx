import type { LevelUpSettings, TimerMode, TimerState } from "../types/appData";

interface TimerPanelProps {
  timer: TimerState;
  settings: LevelUpSettings;
  onToggleRunning: () => Promise<void>;
  onReset: () => Promise<void>;
  onSetMode: (mode: TimerMode) => Promise<void>;
  onToggleAutoRepeat: () => Promise<void>;
  onUpdateSetting: (
    key:
      | "focusMinutes"
      | "shortBreakMinutes"
      | "longBreakMinutes"
      | "sessionsBeforeLongBreak",
    value: number,
  ) => Promise<void>;
}

const modeLabels: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function TimerPanel({
  timer,
  settings,
  onToggleRunning,
  onReset,
  onSetMode,
  onToggleAutoRepeat,
  onUpdateSetting,
}: TimerPanelProps) {
  return (
    <section className="rounded-xl border border-blue-400/40 bg-slate-950/70 p-4 shadow-[0_0_22px_rgba(59,130,246,0.14)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">
            Focus System
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">Session Timer</h2>
        </div>

        <div className="rounded-lg border border-blue-400/40 bg-blue-950/30 px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-blue-200">Cycle</p>
          <p className="text-lg font-bold leading-none">{timer.currentSession}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((mode) => {
          const isActive = timer.mode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => void onSetMode(mode)}
              className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                isActive
                  ? "border-cyan-300 bg-cyan-400/15 text-cyan-100 shadow-[0_0_16px_rgba(103,232,249,0.2)]"
                  : "border-cyan-400/30 bg-slate-900/70 text-slate-300 hover:border-cyan-300/60"
              }`}
            >
              {modeLabels[mode]}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-cyan-400/30 bg-slate-900/70 p-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">
          {modeLabels[timer.mode]}
        </p>
        <p className="mt-2 text-5xl font-bold tracking-[0.12em] text-white">
          {formatRemainingTime(timer.remainingSeconds)}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {timer.isRunning ? "Running" : "Paused"} - Completed focus sessions:{" "}
          {timer.completedSessions}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => void onToggleRunning()}
          className="flex-1 rounded-lg border border-cyan-300 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-100 transition hover:bg-cyan-400/20"
        >
          {timer.isRunning ? "Pause" : "Start"}
        </button>

        <button
          type="button"
          onClick={() => void onReset()}
          className="rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-200 transition hover:border-slate-400"
        >
          Reset
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-cyan-400/25 bg-slate-900/60 px-3 py-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
            Auto Repeat
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Start the next focus or break automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onToggleAutoRepeat()}
          className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.25em] transition ${
            settings.autoRepeat
              ? "border-cyan-300 bg-cyan-400/15 text-cyan-100"
              : "border-slate-600 bg-slate-900/80 text-slate-300"
          }`}
        >
          {settings.autoRepeat ? "On" : "Off"}
        </button>
      </div>

      <details className="mt-4 rounded-xl border border-cyan-400/25 bg-slate-900/50 p-3">
        <summary className="cursor-pointer text-xs uppercase tracking-[0.25em] text-cyan-300">
          Timer Settings
        </summary>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Focus
            </span>
            <input
              type="number"
              min={1}
              value={settings.focusMinutes}
              onChange={(event) =>
                void onUpdateSetting(
                  "focusMinutes",
                  Number(event.target.value || settings.focusMinutes),
                )
              }
              className="w-full rounded-lg border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Short Break
            </span>
            <input
              type="number"
              min={1}
              value={settings.shortBreakMinutes}
              onChange={(event) =>
                void onUpdateSetting(
                  "shortBreakMinutes",
                  Number(event.target.value || settings.shortBreakMinutes),
                )
              }
              className="w-full rounded-lg border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Long Break
            </span>
            <input
              type="number"
              min={1}
              value={settings.longBreakMinutes}
              onChange={(event) =>
                void onUpdateSetting(
                  "longBreakMinutes",
                  Number(event.target.value || settings.longBreakMinutes),
                )
              }
              className="w-full rounded-lg border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Sessions / Long
            </span>
            <input
              type="number"
              min={1}
              value={settings.sessionsBeforeLongBreak}
              onChange={(event) =>
                void onUpdateSetting(
                  "sessionsBeforeLongBreak",
                  Number(
                    event.target.value || settings.sessionsBeforeLongBreak,
                  ),
                )
              }
              className="w-full rounded-lg border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          </label>
        </div>
      </details>
    </section>
  );
}
