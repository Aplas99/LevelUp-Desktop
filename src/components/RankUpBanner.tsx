import { useEffect } from "react";

interface RankUpBannerProps {
  rank: string;
  onDismiss: () => void;
}

const RANK_STYLE: Record<string, { border: string; text: string; glow: string; label: string }> = {
  D: { border: "border-blue-400/60",   text: "text-blue-400",   glow: "shadow-[0_0_80px_rgba(96,165,250,0.45)]",  label: "Rank Assessment Complete" },
  C: { border: "border-green-400/60",  text: "text-green-400",  glow: "shadow-[0_0_80px_rgba(74,222,128,0.45)]",  label: "Rank Assessment Complete" },
  B: { border: "border-orange-400/60", text: "text-orange-400", glow: "shadow-[0_0_80px_rgba(251,146,60,0.45)]",  label: "Rank Assessment Complete" },
  A: { border: "border-red-400/60",    text: "text-red-400",    glow: "shadow-[0_0_80px_rgba(248,113,113,0.45)]", label: "Rank Assessment Complete" },
  S: { border: "border-amber-400/60",  text: "text-amber-300",  glow: "shadow-[0_0_80px_rgba(251,191,36,0.55)]",  label: "!  S-Rank Achieved  !" },
};

const DEFAULT_STYLE = RANK_STYLE.D;

export function RankUpBanner({ rank, onDismiss }: RankUpBannerProps) {
  const style = RANK_STYLE[rank] ?? DEFAULT_STYLE;

  useEffect(() => {
    const id = setTimeout(onDismiss, 4500);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className={`level-up-banner relative bg-slate-950 px-14 py-9 text-center ${style.glow}`}>
        <div className={`pointer-events-none absolute inset-0 border ${style.border}`} />
        <div className={`absolute left-2.5 top-2.5 h-4 w-4 border-l-2 border-t-2 ${style.border}`} />
        <div className={`absolute right-2.5 top-2.5 h-4 w-4 border-r-2 border-t-2 ${style.border}`} />
        <div className={`absolute bottom-2.5 left-2.5 h-4 w-4 border-b-2 border-l-2 ${style.border}`} />
        <div className={`absolute bottom-2.5 right-2.5 h-4 w-4 border-b-2 border-r-2 ${style.border}`} />
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,1) 0px,rgba(255,255,255,1) 1px,transparent 1px,transparent 6px)" }}
        />

        <p className={`text-[10px] font-bold uppercase tracking-[0.5em] ${style.text}`}>
          {style.label}
        </p>

        {/* Rank hexagon */}
        <div className="relative mx-auto mt-4 flex h-20 w-20 items-center justify-center">
          <svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full">
            <polygon
              points="58,30 44,54.2 16,54.2 2,30 16,5.8 44,5.8"
              fill="rgba(15,23,42,0.95)"
              stroke="currentColor"
              strokeWidth="2"
              className={style.text}
            />
          </svg>
          <span className={`relative text-3xl font-extrabold tracking-wider ${style.text}`}>
            {rank}
          </span>
        </div>

        <h2 className="mt-4 text-[26px] font-extrabold uppercase leading-tight tracking-widest text-white">
          You are now{" "}
          <span className={style.text}>Rank {rank}</span>
        </h2>
        <p className="mt-2 text-sm font-bold text-slate-500">Hunter</p>
        <p className="mt-5 text-[9px] uppercase tracking-[0.3em] text-slate-700">
          Tap to dismiss
        </p>
      </div>
    </div>
  );
}
