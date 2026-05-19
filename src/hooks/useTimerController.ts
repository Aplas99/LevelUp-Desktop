import { useEffect, useEffectEvent, useRef } from "react";
import type { AppData, TimerMode, TimerState } from "../types/appData";
import {
  buildCompletedTimerState,
  buildTimerStateForMode,
  getCurrentSessionNumber,
  getTimerDurationSeconds,
} from "../services/timerService";

interface UseTimerControllerOptions {
  data: AppData | null;
  updateData: (
    updater: (currentData: AppData) => AppData,
  ) => Promise<AppData | null>;
}

function playAlarm(completedMode: TimerMode) {
  const file = completedMode === "shortBreak" || completedMode === "longBreak"
    ? "break_alarm.mp3"
    : "task_alarm.mp3";
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/${file}`);
    audio.volume = 0.7;
    void audio.play();
  } catch {
    // audio unavailable — silent fail
  }
}

function notifyTimerCompletion(previousMode: TimerMode, nextMode: TimerMode) {
  if (typeof Notification === "undefined") return;

  const title = previousMode === "focus" ? "Focus session complete" : "Break complete";
  const body =
    nextMode === "focus"
      ? "Time to get back to your next quest."
      : `Switching to ${nextMode === "longBreak" ? "a long break" : "a short break"}.`;

  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }

  if (Notification.permission === "default") {
    void Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

export function useTimerController({
  data,
  updateData,
}: UseTimerControllerOptions) {
  const previousTimerRef = useRef<TimerState | null>(null);

  const tickTimer = useEffectEvent(() => {
    void updateData((currentData) => {
      if (!currentData.timer.isRunning) {
        return currentData;
      }

      if (currentData.timer.remainingSeconds > 1) {
        return {
          ...currentData,
          timer: {
            ...currentData.timer,
            remainingSeconds: currentData.timer.remainingSeconds - 1,
          },
        };
      }

      return {
        ...currentData,
        timer: buildCompletedTimerState(currentData.timer, currentData.settings),
      };
    });
  });

  useEffect(() => {
    if (!data?.timer.isRunning) return;

    const timerId = window.setInterval(() => {
      tickTimer();
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [data?.timer.isRunning, tickTimer]);

  useEffect(() => {
    if (!data) return;

    const previousTimer = previousTimerRef.current;
    const currentTimer = data.timer;

    if (
      previousTimer &&
      previousTimer.isRunning &&
      previousTimer.remainingSeconds === 1 &&
      previousTimer.mode !== currentTimer.mode
    ) {
      playAlarm(previousTimer.mode);
      notifyTimerCompletion(previousTimer.mode, currentTimer.mode);
    }

    previousTimerRef.current = currentTimer;
  }, [data]);

  async function toggleRunning() {
    await updateData((currentData) => ({
      ...currentData,
      timer: {
        ...currentData.timer,
        isRunning: !currentData.timer.isRunning,
      },
    }));
  }

  async function resetTimer() {
    await updateData((currentData) => ({
      ...currentData,
      timer: {
        ...currentData.timer,
        isRunning: false,
        remainingSeconds: getTimerDurationSeconds(
          currentData.timer.mode,
          currentData.settings,
        ),
        currentSession: getCurrentSessionNumber(
          currentData.timer.completedSessions,
          currentData.settings.sessionsBeforeLongBreak,
        ),
      },
    }));
  }

  async function setMode(mode: TimerMode) {
    await updateData((currentData) => ({
      ...currentData,
      timer: buildTimerStateForMode(currentData.timer, currentData.settings, mode),
    }));
  }

  async function toggleAutoRepeat() {
    await updateData((currentData) => ({
      ...currentData,
      settings: {
        ...currentData.settings,
        autoRepeat: !currentData.settings.autoRepeat,
      },
    }));
  }

  async function updateDurationSetting(
    key:
      | "focusMinutes"
      | "shortBreakMinutes"
      | "longBreakMinutes"
      | "sessionsBeforeLongBreak",
    value: number,
  ) {
    const normalizedValue = Math.max(1, Math.round(value));

    await updateData((currentData) => {
      const nextSettings = {
        ...currentData.settings,
        [key]: normalizedValue,
      };

      const shouldRecalculateDuration =
        (key === "focusMinutes" && currentData.timer.mode === "focus") ||
        (key === "shortBreakMinutes" && currentData.timer.mode === "shortBreak") ||
        (key === "longBreakMinutes" && currentData.timer.mode === "longBreak");

      const nextTimer = shouldRecalculateDuration
        ? {
            ...currentData.timer,
            remainingSeconds: currentData.timer.isRunning
              ? Math.min(
                  currentData.timer.remainingSeconds,
                  getTimerDurationSeconds(currentData.timer.mode, nextSettings),
                )
              : getTimerDurationSeconds(currentData.timer.mode, nextSettings),
            currentSession: getCurrentSessionNumber(
              currentData.timer.completedSessions,
              nextSettings.sessionsBeforeLongBreak,
            ),
          }
        : {
            ...currentData.timer,
            currentSession: getCurrentSessionNumber(
              currentData.timer.completedSessions,
              nextSettings.sessionsBeforeLongBreak,
            ),
          };

      return {
        ...currentData,
        settings: nextSettings,
        timer: nextTimer,
      };
    });
  }

  return {
    timer: data?.timer ?? null,
    settings: data?.settings ?? null,
    toggleRunning,
    resetTimer,
    setMode,
    toggleAutoRepeat,
    updateDurationSetting,
  };
}
