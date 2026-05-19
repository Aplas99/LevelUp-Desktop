import { useState, useEffect } from "react";
import type { LevelUpUser } from "../types/appData";

function getResetCountdown(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function RankHexagon({ rank }: { rank: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      <svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full">
        <polygon
          points="58,30 44,54.2 16,54.2 2,30 16,5.8 44,5.8"
          fill="rgba(15,23,42,0.95)"
          stroke="rgba(148,163,184,0.55)"
          strokeWidth="2.5"
        />
      </svg>
      <span className="relative text-sm font-extrabold tracking-wider text-slate-300">
        {rank}
      </span>
    </div>
  );
}

export function PlayerStatusPanel({ user }: { user: LevelUpUser }) {
  const [countdown, setCountdown] = useState(getResetCountdown);

  useEffect(() => {
    const id = setInterval(() => setCountdown(getResetCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));
  const now = new Date();
  const dateStr = now
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
  const dayStr = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const name = user.name ?? "Hunter";
  const rank = user.rank ?? "E";

  return (
    <section className="space-y-2">
      <div className="rounded-xl border border-cyan-400/25 bg-slate-900/85 p-4 shadow-[0_0_24px_rgba(34,211,238,0.09)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-[54px] w-[54px] shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400/50 bg-slate-800 shadow-[0_0_16px_rgba(34,211,238,0.25)]">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-extrabold text-cyan-300">
                  {name[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Name + streak */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold leading-tight tracking-wide text-white">
              {name}
            </h1>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5">
              <svg viewBox="0 0 16 20" className="h-3 w-2.5 fill-amber-400" aria-hidden="true">
                <path d="M8 0C8 0 14 7 14 12a6 6 0 1 1-12 0C2 7 8 0 8 0Z" />
              </svg>
              <span className="text-xs font-bold text-amber-300">
                {user.streak} Days
              </span>
            </div>
          </div>

          {/* Rank + Level */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <RankHexagon rank={rank} />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Level {user.level}
            </p>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-cyan-400/80">
              EXP
            </span>
            <span className="text-[9px] tabular-nums text-slate-500">
              {user.xp} / {user.xpToNextLevel}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full border border-cyan-400/20 bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.65)] transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Date / reset row */}
      <div className="flex items-center justify-between rounded-xl border border-cyan-400/15 bg-slate-900/60 px-4 py-2.5 backdrop-blur-md">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600">Reset In</p>
          <p className="text-sm font-bold tabular-nums text-red-400/90">{countdown}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-cyan-300">
            {dayStr}, {dateStr}
          </p>
        </div>
      </div>
    </section>
  );
}
