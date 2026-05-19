import type { LevelUpSettings, TimerMode, TimerState } from "../types/appData";

export function getTimerDurationSeconds(
  mode: TimerMode,
  settings: LevelUpSettings,
): number {
  switch (mode) {
    case "focus":
      return settings.focusMinutes * 60;
    case "shortBreak":
      return settings.shortBreakMinutes * 60;
    case "longBreak":
      return settings.longBreakMinutes * 60;
  }
}

export function getCurrentSessionNumber(
  completedSessions: number,
  sessionsBeforeLongBreak: number,
): number {
  const sessionCycleLength = Math.max(1, sessionsBeforeLongBreak);

  return (completedSessions % sessionCycleLength) + 1;
}

export function buildTimerStateForMode(
  currentTimer: TimerState,
  settings: LevelUpSettings,
  mode: TimerMode,
): TimerState {
  return {
    ...currentTimer,
    mode,
    isRunning: false,
    remainingSeconds: getTimerDurationSeconds(mode, settings),
    currentSession: getCurrentSessionNumber(
      currentTimer.completedSessions,
      settings.sessionsBeforeLongBreak,
    ),
  };
}

export function buildCompletedTimerState(
  currentTimer: TimerState,
  settings: LevelUpSettings,
): TimerState {
  if (currentTimer.mode === "focus") {
    const completedSessions = currentTimer.completedSessions + 1;
    const shouldTakeLongBreak =
      completedSessions % Math.max(1, settings.sessionsBeforeLongBreak) === 0;
    const nextMode: TimerMode = shouldTakeLongBreak
      ? "longBreak"
      : "shortBreak";

    return {
      mode: nextMode,
      isRunning: settings.autoRepeat,
      remainingSeconds: getTimerDurationSeconds(nextMode, settings),
      currentSession: getCurrentSessionNumber(
        completedSessions,
        settings.sessionsBeforeLongBreak,
      ),
      completedSessions,
    };
  }

  return {
    mode: "focus",
    isRunning: settings.autoRepeat,
    remainingSeconds: getTimerDurationSeconds("focus", settings),
    currentSession: getCurrentSessionNumber(
      currentTimer.completedSessions,
      settings.sessionsBeforeLongBreak,
    ),
    completedSessions: currentTimer.completedSessions,
  };
}
