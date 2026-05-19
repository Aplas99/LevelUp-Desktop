export type TimerMode = "focus" | "shortBreak" | "longBreak";

export interface LevelUpUser {
  name: string;
  rank: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate?: string;
  avatarUrl?: string;
}

export interface LevelUpSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoRepeat: boolean;
  minimizeToTray: boolean;
  alwaysOnTop: boolean;
  startWithWindows: boolean;
  opacity: number;
}

export interface QuestTask {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  completedAt: string | null;
  deferredDate?: string;
}

export interface QuestGroup {
  id: string;
  title: string;
  icon?: string;
  tasks: QuestTask[];
}

export interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  remainingSeconds: number;
  currentSession: number;
  completedSessions: number;
}

export interface AppMetadata {
  createdAt?: string;
  updatedAt?: string;
}

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export interface AppData {
  user: LevelUpUser;
  settings: LevelUpSettings;
  questGroups: QuestGroup[];
  timer: TimerState;
  windowState: WindowState;
  metadata?: AppMetadata;
}
