export type AppTab = "home" | "focus" | "stats";

interface BottomNavProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: {
  id: AppTab;
  label: string;
}[] = [
  { id: "home", label: "Home" },
  { id: "focus", label: "Focus" },
  { id: "stats", label: "Stats" },
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

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19v-4" />
    </svg>
  );
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="grid grid-cols-3 gap-2 border-t border-cyan-400/20 bg-slate-950/85 px-2 py-3 backdrop-blur-xl">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-xl border px-3 py-2 text-center transition ${
              isActive
                ? "border-cyan-300/70 bg-cyan-400/12 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.16)]"
                : "border-transparent bg-slate-900/40 text-slate-400 hover:border-cyan-400/20 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-center">
              <TabIcon tab={tab.id} />
            </div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.25em]">
              {tab.label}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
