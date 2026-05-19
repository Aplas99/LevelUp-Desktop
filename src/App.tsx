import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav, type AppTab } from "./components/BottomNav";
import { LevelUpBanner } from "./components/LevelUpBanner";
import { PlayerStatusPanel } from "./components/PlayerStatusPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { QuestBoard } from "./components/QuestBoard";
import { RankUpBanner } from "./components/RankUpBanner";
import { StatsPanel } from "./components/StatsPanel";
import { ToastContainer, type Toast } from "./components/ToastContainer";
import { WindowChrome } from "./components/WindowChrome";
import { useLevelUpData } from "./hooks/useLevelUpData";
import { useTimerController } from "./hooks/useTimerController";
import { TimerPanel } from "./components/TimerPanel";
import type { LevelUpSettings, LevelUpUser } from "./types/appData";
import { calculateRank, checkAndUpdateStreak, getStreakMilestone, rankIndex } from "./services/progressService";

function App() {
  const { data, dataPath, status, isLoading, updateData } = useLevelUpData();
  const timerController = useTimerController({ data, updateData });
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [rankUpRank, setRankUpRank] = useState<string | null>(null);
  const prevLevelRef = useRef<number | null>(null);
  const prevRankRef = useRef<string | null>(null);
  const streakCheckedRef = useRef(false);

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

  function updateSettings(updates: Partial<LevelUpSettings>) {
    if ("alwaysOnTop" in updates) void window.levelUpAPI.setAlwaysOnTop(updates.alwaysOnTop!);
    if ("opacity" in updates) void window.levelUpAPI.setOpacity(updates.opacity!);
    if ("startWithWindows" in updates) void window.levelUpAPI.setStartWithWindows(updates.startWithWindows!);
    void updateData((cur) => ({ ...cur, settings: { ...cur.settings, ...updates } }));
  }

  function toggleAlwaysOnTop() {
    if (!data) return;
    updateSettings({ alwaysOnTop: !data.settings.alwaysOnTop });
  }

  // Detect level-up by watching user.level
  const currentLevel = data?.user.level;
  useEffect(() => {
    if (currentLevel === undefined) return;
    if (prevLevelRef.current !== null && currentLevel > prevLevelRef.current) {
      setLevelUpLevel(currentLevel);
      addToast({ type: "levelup", title: "Level Up!", body: `You reached Level ${currentLevel}` });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Level Up!", { body: `You are now Level ${currentLevel}. Keep going, Hunter.` });
      }
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel, addToast]);

  // Detect rank-up by watching user.rank
  const currentRank = data?.user.rank;
  useEffect(() => {
    if (!currentRank) return;
    if (prevRankRef.current !== null && rankIndex(currentRank) > rankIndex(prevRankRef.current)) {
      setRankUpRank(currentRank);
      addToast({ type: "levelup", title: "Rank Up!", body: `You are now ${currentRank}-Rank Hunter` });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Rank Up!", { body: `${currentRank}-Rank Hunter. Power grows.` });
      }
    }
    prevRankRef.current = currentRank;
  }, [currentRank, addToast]);

  // Initial streak check: run once after data loads to handle missed days
  useEffect(() => {
    if (!data || streakCheckedRef.current) return;
    streakCheckedRef.current = true;

    const streakUpdate = checkAndUpdateStreak(data.user);
    if (!streakUpdate) return;

    const prevStreak = data.user.streak;
    const newRank = calculateRank(data.user.level, streakUpdate.streak);
    void updateData((cur) => ({
      ...cur,
      user: { ...cur.user, ...streakUpdate, rank: newRank },
    }));

    if (streakUpdate.streak > prevStreak) {
      const milestone = getStreakMilestone(prevStreak, streakUpdate.streak);
      if (milestone) {
        addToast({ type: "streak", title: `${milestone}-Day Streak!`, body: "Keep it up, Hunter!" });
      }
    }
  }, [data, updateData, addToast]);

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
        <WindowChrome
          alwaysOnTop={data.settings.alwaysOnTop}
          onToggleAlwaysOnTop={toggleAlwaysOnTop}
        />

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
            <ProfilePanel
              user={data.user}
              settings={data.settings}
              onUpdateUser={updateUser}
              onUpdateSettings={updateSettings}
            />
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

      {/* Rank-up banner */}
      {rankUpRank !== null && (
        <RankUpBanner rank={rankUpRank} onDismiss={() => setRankUpRank(null)} />
      )}
    </main>
  );
}

export default App;
