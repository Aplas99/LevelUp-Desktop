import type { LevelUpUser } from "../types/appData";

interface PlayerStatusPanelProps {
  user: LevelUpUser;
}

export function PlayerStatusPanel({ user }: PlayerStatusPanelProps) {
  const xpPercent = Math.min(
    100,
    Math.round((user.xp / user.xpToNextLevel) * 100),
  );

  return (
    <section className="rounded-xl border border-cyan-400/40 bg-slate-950/70 p-4 shadow-[0_0_22px_rgba(34,211,238,0.16)] backdrop-blur-md">
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">
          Quest System Online
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-none tracking-wide">
              Level Up
            </h1>
          </div>

          <div className="rounded-lg border border-blue-400/40 bg-blue-950/30 px-3 py-2 text-center">
            <p className="text-[10px] uppercase text-blue-200">LVL</p>
            <p className="text-2xl font-bold leading-none">{user.level}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
              XP
            </p>

            <p className="text-[10px] text-slate-400">Hover bar</p>
          </div>

          <div
            title={`${user.xp}/${user.xpToNextLevel} XP`}
            className="h-3 overflow-hidden rounded-full border border-cyan-400/50 bg-slate-900"
          >
            <div
              className="h-full rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.75)] transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-blue-400/40 bg-blue-950/30 px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-blue-200">Streak</p>
          <p className="text-xl font-bold leading-none">{user.streak}</p>
        </div>
      </div>
    </section>
  );
}
