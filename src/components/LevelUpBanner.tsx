import { useEffect } from "react";

interface LevelUpBannerProps {
  level: number;
  onDismiss: () => void;
}

export function LevelUpBanner({ level, onDismiss }: LevelUpBannerProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 4000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div className="level-up-banner relative bg-slate-950 px-14 py-9 text-center shadow-[0_0_80px_rgba(34,211,238,0.4),inset_0_0_60px_rgba(34,211,238,0.03)]">
        {/* Outer border */}
        <div className="pointer-events-none absolute inset-0 border border-cyan-400/55" />
        {/* Corner accents */}
        <div className="absolute left-2.5 top-2.5 h-4 w-4 border-l-2 border-t-2 border-cyan-400" />
        <div className="absolute right-2.5 top-2.5 h-4 w-4 border-r-2 border-t-2 border-cyan-400" />
        <div className="absolute bottom-2.5 left-2.5 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-2.5 right-2.5 h-4 w-4 border-b-2 border-r-2 border-cyan-400" />
        {/* Scan lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,1) 0px, rgba(34,211,238,1) 1px, transparent 1px, transparent 6px)" }}
        />

        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-cyan-400/90">
          ! Alarm !
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold uppercase leading-tight tracking-widest text-white">
          You{" "}
          <span className="text-cyan-400">Leveled Up!</span>
        </h2>
        <p className="mt-3 text-sm font-bold text-slate-500">
          Now at Level{" "}
          <span className="text-xl font-extrabold text-cyan-300">{level}</span>
        </p>
        <p className="mt-5 text-[9px] uppercase tracking-[0.3em] text-slate-700">
          Tap to dismiss
        </p>
      </div>
    </div>
  );
}
