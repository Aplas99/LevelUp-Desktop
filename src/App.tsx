import { useState } from "react";
import { BottomNav, type AppTab } from "./components/BottomNav";
import { PlayerStatusPanel } from "./components/PlayerStatusPanel";
import { QuestBoard } from "./components/QuestBoard";
import { StatsPanel } from "./components/StatsPanel";
import { WindowChrome } from "./components/WindowChrome";
import { useLevelUpData } from "./hooks/useLevelUpData";
import { useTimerController } from "./hooks/useTimerController";
import { TimerPanel } from "./components/TimerPanel";

function App() {
  const { data, dataPath, status, isLoading, updateData } = useLevelUpData();
  const timerController = useTimerController({ data, updateData });
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  if (isLoading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        <p className="text-sm text-cyan-200">{status}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden p-2 text-white">
      <section className="mx-auto flex h-[calc(100vh-16px)] max-w-[420px] flex-col overflow-hidden rounded-[22px] border border-cyan-300/35 bg-slate-950/82 shadow-[0_0_35px_rgba(34,211,238,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
        <WindowChrome />

        <div className="hud-scroll flex-1 overflow-y-auto p-4 pb-5">
          {activeTab === "home" ? (
            <>
              <PlayerStatusPanel user={data.user} />
              <QuestBoard data={data} updateData={updateData} />
            </>
          ) : null}

          {activeTab === "focus" &&
          timerController.timer &&
          timerController.settings ? (
            <TimerPanel
              timer={timerController.timer}
              settings={timerController.settings}
              onToggleRunning={timerController.toggleRunning}
              onReset={timerController.resetTimer}
              onSetMode={timerController.setMode}
              onToggleAutoRepeat={timerController.toggleAutoRepeat}
              onUpdateSetting={timerController.updateDurationSetting}
            />
          ) : null}

          {activeTab === "stats" ? (
            <StatsPanel data={data} dataPath={dataPath} status={status} />
          ) : null}
        </div>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </section>
    </main>
  );
}

export default App;
