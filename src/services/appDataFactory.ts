import type { AppData, QuestGroup, QuestTask } from "../types/appData";

export function createDefaultAppData(): AppData {
  return {
    user: {
      name: "Hunter",
      rank: "E",
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      streak: 0,
    },
    settings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,
      autoRepeat: false,
      minimizeToTray: true,
    },
    questGroups: [],
    timer: {
      mode: "focus",
      isRunning: false,
      remainingSeconds: 1500,
      currentSession: 1,
      completedSessions: 0,
    },
    windowState: {
      width: 420,
      height: 680,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function createQuestGroup(title: string): QuestGroup {
  return {
    id: crypto.randomUUID(),
    title,
    icon: "quest",
    tasks: [],
  };
}

export function createQuestTask(title: string, xpReward = 10): QuestTask {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    xpReward,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}
