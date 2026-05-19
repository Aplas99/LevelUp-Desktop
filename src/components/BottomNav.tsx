export type AppTab = "home" | "focus" | "stats" | "profile";

interface BottomNavProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string }[] = [
  { id: "home",    label: "Home"    },
  { id: "focus",   label: "Focus"   },
  { id: "stats",   label: "Stats"   },
  { id: "profile", label: "Profile" },
];

function TabIcon({ tab }: { tab: AppTab }) {
  if (tab === "home") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    );
  }
  if (tab === "focus") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="7" />
        <path d="M12 13V9.5" />
        <path d="m9 2 3 2 3-2" />
      </svg>
    );
  }
  if (tab === "stats") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19v-4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="no-drag grid grid-cols-4 border-t border-cyan-400/15 bg-slate-950 px-1 py-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-2 py-2 text-center transition ${
              isActive
                ? "text-cyan-200"
                : "text-slate-600 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-center">
              <TabIcon tab={tab.id} />
            </div>
            <div className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] ${isActive ? "text-cyan-400" : ""}`}>
              {tab.label}
            </div>
            {isActive && (
              <div className="mx-auto mt-1 h-0.5 w-4 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
