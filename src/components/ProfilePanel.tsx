import { useRef, useState } from "react";
import type { LevelUpUser } from "../types/appData";

interface ProfilePanelProps {
  user: LevelUpUser;
  onUpdateUser: (updates: Partial<LevelUpUser>) => void;
}

const RANKS = ["E", "D", "C", "B", "A", "S"];

function RankHexagon({ rank }: { rank: string }) {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center">
      <svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full">
        <polygon
          points="58,30 44,54.2 16,54.2 2,30 16,5.8 44,5.8"
          fill="rgba(15,23,42,0.95)"
          stroke="rgba(148,163,184,0.55)"
          strokeWidth="2.5"
        />
      </svg>
      <span className="relative text-xs font-extrabold tracking-wider text-slate-300">
        {rank}
      </span>
    </div>
  );
}

export function ProfilePanel({ user, onUpdateUser }: ProfilePanelProps) {
  const [name, setName] = useState(user.name);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPreviewUrl(url);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onUpdateUser({ name: trimmed, avatarUrl: previewUrl ?? undefined });
    setDirty(false);
  }

  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-0.5 bg-cyan-400" />
        <h2 className="text-sm font-extrabold uppercase tracking-[0.35em] text-white">
          Hunter Profile
        </h2>
      </div>

      {/* Avatar + rank card */}
      <div className="rounded-xl border border-cyan-400/20 bg-slate-900/80 p-5">
        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400/50 bg-slate-800 shadow-[0_0_20px_rgba(34,211,238,0.2)] transition hover:border-cyan-400"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Change profile photo"
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-cyan-300">
                  {(name[0] ?? "H").toUpperCase()}
                </span>
              )}
            </div>
            {/* Camera overlay */}
            <div
              className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-full opacity-0 transition hover:opacity-100"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/40 bg-slate-900 text-cyan-400 shadow-md transition hover:bg-slate-800"
              aria-label="Upload photo"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Rank + level badges */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <RankHexagon rank={user.rank} />
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Rank</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-2xl font-extrabold tabular-nums text-white">{user.level}</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Level</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 16 20" className="h-3.5 w-3 fill-amber-400">
                  <path d="M8 0C8 0 14 7 14 12a6 6 0 1 1-12 0C2 7 8 0 8 0Z" />
                </svg>
                <p className="text-2xl font-extrabold tabular-nums text-amber-300">{user.streak}</p>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Streak</p>
            </div>
          </div>

          {/* XP bar */}
          <div className="w-full">
            <div className="mb-1.5 flex justify-between">
              <span className="text-[9px] uppercase tracking-widest text-cyan-400/70">EXP</span>
              <span className="text-[9px] tabular-nums text-slate-500">{user.xp} / {user.xpToNextLevel}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full border border-cyan-400/20 bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit name */}
      <div className="rounded-xl border border-cyan-400/20 bg-slate-900/80 p-4">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/80">
          Hunter Name
        </label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setDirty(true); }}
          placeholder="Enter your name..."
          maxLength={24}
          className="w-full border border-cyan-400/25 bg-slate-800 px-3 py-2.5 text-sm font-bold text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60"
          style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
        />
        <p className="mt-1.5 text-right text-[9px] text-slate-700">{name.length}/24</p>
      </div>

      {/* Save button */}
      {dirty && (
        <button
          type="button"
          onClick={handleSave}
          className="w-full border border-cyan-400/50 bg-cyan-400/10 py-3 text-sm font-extrabold uppercase tracking-[0.3em] text-cyan-300 transition hover:bg-cyan-400/20"
          style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
        >
          Save Changes
        </button>
      )}
    </section>
  );
}
