import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav, type AppTab } from "./components/BottomNav";
import { LevelUpBanner } from "./components/LevelUpBanner";
import { PlayerStatusPanel } from "./components/PlayerStatusPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { QuestBoard } from "./components/QuestBoard";
import { StatsPanel } from "./components/StatsPanel";
import { ToastContainer, type Toast } from "./components/ToastContainer";
import { WindowChrome } from "./components/WindowChrome";
import { useLevelUpData } from "./hooks/useLevelUpData";
import { useTimerController } from "./hooks/useTimerController";
import { TimerPanel } from "./components/TimerPanel";
import type { LevelUpUser } from "./types/appData";

function App() {
  const { data, dataPath, status, isLoading, updateData } = useLevelUpData();
  const timerController = useTimerController({ data, updateData });
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const prevLevelRef = useRef<number | null>(null);

  // Request desktop notification permission once
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function updateUser(updates: Partial<LevelUpUser>) {
    void updateData((cur) => ({ ...cur, user: { ...cur.user, ...updates } }));
  }

  // Detect level-up by watching user.level
  const currentLevel = data?.user.level;
  useEffect(() => {
    if (currentLevel === undefined) return;
    if (prevLevelRef.current !== null && currentLevel > prevLevelRef.current) {
      setLevelUpLevel(currentLevel);
      addToast({ type: "levelup", title: "Level Up!", body: `You reached Level ${currentLevel}` });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Level Up!", {
          body: `You are now Level ${currentLevel}. Keep going, Hunter.`,
        });
      }
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel, addToast]);

  if (isLoading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        <p className="text-sm text-cyan-200">{status}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden p-2 text-white">
      <section className="drag-region mx-auto flex h-[calc(100vh-16px)] max-w-[420px] flex-col overflow-hidden rounded-[22px] border border-cyan-400/20 bg-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.14),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <WindowChrome />

        <div className="no-drag hud-scroll flex-1 overflow-y-auto p-4 pb-5">
          {activeTab === "home" && (
            <>
              <PlayerStatusPanel user={data.user} />
              <QuestBoard data={data} updateData={updateData} addToast={addToast} />
            </>
          )}

          {activeTab === "focus" && timerController.timer && timerController.settings && (
            <TimerPanel
              timer={timerController.timer}
              settings={timerController.settings}
              onToggleRunning={timerController.toggleRunning}
              onReset={timerController.resetTimer}
              onSetMode={timerController.setMode}
              onToggleAutoRepeat={timerController.toggleAutoRepeat}
              onUpdateSetting={timerController.updateDurationSetting}
            />
          )}

          {activeTab === "stats" && (
            <StatsPanel data={data} dataPath={dataPath} status={status} />
          )}

          {activeTab === "profile" && (
            <ProfilePanel user={data.user} onUpdateUser={updateUser} />
          )}
        </div>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </section>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Level-up banner */}
      {levelUpLevel !== null && (
        <LevelUpBanner level={levelUpLevel} onDismiss={() => setLevelUpLevel(null)} />
      )}
    </main>
  );
}

export default App;
