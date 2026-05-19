import { useState } from "react";
import type { AppData } from "../types/appData";
import type { Toast } from "./ToastContainer";
import { createQuestGroup, createQuestTask } from "../services/appDataFactory";
import { calculateRank, checkAndUpdateStreak, getStreakMilestone, localDateStr } from "../services/progressService";
import { QuestGroupCard } from "./QuestGroupCard";

interface QuestBoardProps {
  data: AppData;
  updateData: (updater: (cur: AppData) => AppData) => Promise<AppData | null>;
  addToast: (toast: Omit<Toast, "id">) => void;
}

const INPUT_CLIP =
  "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))";

export function QuestBoard({ data, updateData, addToast }: QuestBoardProps) {
  const [groupTitle, setGroupTitle] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);

  function handleCreateGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = groupTitle.trim();
    if (!trimmed) return;
    updateData((cur) => ({
      ...cur,
      questGroups: [...cur.questGroups, createQuestGroup(trimmed)],
    }));
    setGroupTitle("");
    setAddingGroup(false);
  }

  function handleAddTask(groupId: string, taskTitle: string) {
    updateData((cur) => ({
      ...cur,
      questGroups: cur.questGroups.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, tasks: [...g.tasks, createQuestTask(taskTitle, 10)] },
      ),
    }));
  }

  function handleToggleTask(groupId: string, taskId: string) {
    updateData((cur) => {
      let xpChange = 0;
      let taskTitle = "";

      const updatedGroups = cur.questGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          tasks: g.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const willComplete = !t.completed;
            xpChange = willComplete ? t.xpReward : -t.xpReward;
            taskTitle = t.title;
            return {
              ...t,
              completed: willComplete,
              completedAt: willComplete ? new Date().toISOString() : null,
            };
          }),
        };
      });

      // XP + level-up calculation
      let xp = Math.max(0, cur.user.xp + xpChange);
      let level = cur.user.level;
      let xpToNextLevel = cur.user.xpToNextLevel;

      if (xpChange > 0) {
        while (xp >= xpToNextLevel) {
          xp -= xpToNextLevel;
          level += 1;
          xpToNextLevel = Math.round(xpToNextLevel * 1.25);
        }

        addToast({ type: "xp", title: "Quest Complete!", body: `${taskTitle} · +${xpChange} XP` });

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Quest Complete!", { body: `${taskTitle} · +${xpChange} XP`, silent: true });
        }
      }

      // Streak: increment only when the toggled group is now fully complete
      const today = localDateStr();
      const toggledGroup = updatedGroups.find((g) => g.id === groupId);
      const activeTasks = (toggledGroup?.tasks ?? []).filter(
        (t) => !t.deferredDate || t.deferredDate <= today,
      );
      const groupFullyDone = activeTasks.length > 0 && activeTasks.every((t) => t.completed);

      let streak = cur.user.streak;
      let lastActiveDate = cur.user.lastActiveDate;

      if (groupFullyDone && xpChange > 0) {
        const streakUpdate = checkAndUpdateStreak(cur.user);
        if (streakUpdate) {
          const prevStreak = streak;
          streak = streakUpdate.streak;
          lastActiveDate = streakUpdate.lastActiveDate;
          const milestone = getStreakMilestone(prevStreak, streak);
          if (milestone) {
            addToast({ type: "streak", title: `${milestone}-Day Streak!`, body: "Keep it up, Hunter!" });
          } else {
            addToast({ type: "streak", title: "Streak Continues!", body: `Day ${streak} — keep going!` });
          }
        }
      }

      const newRank = calculateRank(level, streak);

      return {
        ...cur,
        user: { ...cur.user, xp, level, xpToNextLevel, streak, lastActiveDate, rank: newRank },
        questGroups: updatedGroups,
      };
    });
  }

  function handleEditTask(groupId: string, taskId: string, newTitle: string) {
    updateData((cur) => ({
      ...cur,
      questGroups: cur.questGroups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id !== taskId ? t : { ...t, title: newTitle },
              ),
            },
      ),
    }));
  }

  function handleReorderTasks(groupId: string, newIds: string[]) {
    updateData((cur) => ({
      ...cur,
      questGroups: cur.questGroups.map((g) => {
        if (g.id !== groupId) return g;
        const map = new Map(g.tasks.map((t) => [t.id, t]));
        return {
          ...g,
          tasks: newIds.map((id) => map.get(id)!).filter(Boolean),
        };
      }),
    }));
  }

  function handleDeleteTask(groupId: string, taskId: string) {
    updateData((cur) => ({
      ...cur,
      questGroups: cur.questGroups.map((g) =>
        g.id !== groupId ? g : { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) },
      ),
    }));
  }

  function handleDeleteGroup(groupId: string) {
    updateData((cur) => ({
      ...cur,
      questGroups: cur.questGroups.filter((g) => g.id !== groupId),
    }));
  }

  function handleDeferGroupTasks(groupId: string) {
    const today = localDateStr();
    const tmrDate = new Date();
    tmrDate.setDate(tmrDate.getDate() + 1);
    const tomorrow = localDateStr(tmrDate);

    updateData((cur) => {
      const group = cur.questGroups.find((g) => g.id === groupId);
      if (!group) return cur;

      const incompleteTasks = group.tasks.filter(
        (t) => !t.completed && (!t.deferredDate || t.deferredDate <= today),
      );
      if (incompleteTasks.length === 0) return cur;

      const penalty = incompleteTasks.length * 5;
      const newXp = Math.max(0, cur.user.xp - penalty);

      addToast({
        type: "xp",
        title: "Tasks Deferred",
        body: `${incompleteTasks.length} task(s) moved to tomorrow · -${penalty} XP`,
      });

      return {
        ...cur,
        user: { ...cur.user, xp: newXp },
        questGroups: cur.questGroups.map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            tasks: g.tasks.map((t) => {
              if (t.completed || (t.deferredDate && t.deferredDate > today)) return t;
              return { ...t, deferredDate: tomorrow };
            }),
          };
        }),
      };
    });
  }

  return (
    <section className="mt-5">
      {/* Board header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-0.5 bg-cyan-400" />
          <h2 className="text-sm font-extrabold uppercase tracking-[0.35em] text-white">
            Daily Quests
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setAddingGroup((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-400/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300/90 transition hover:bg-cyan-400/18 hover:text-cyan-200"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Group
        </button>
      </div>

      {/* Add group form */}
      {addingGroup && (
        <form onSubmit={handleCreateGroup} className="mb-4 flex gap-2">
          <input
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            placeholder="Group name, e.g. Strength Training..."
            autoFocus
            className="flex-1 border border-cyan-400/30 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60"
            style={{ clipPath: INPUT_CLIP }}
          />
          <button
            type="submit"
            className="border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-400/20"
            style={{ clipPath: INPUT_CLIP }}
          >
            Create
          </button>
        </form>
      )}

      {/* Groups */}
      <div className="space-y-5">
        {data.questGroups.length === 0 ? (
          <div className="border border-dashed border-cyan-400/20 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-600">
              No quest groups yet
            </p>
            <p className="mt-1 text-[10px] text-slate-700">Press New Group to begin</p>
          </div>
        ) : (
          data.questGroups.map((group) => (
            <QuestGroupCard
              key={group.id}
              group={group}
              onAddTask={(title) => handleAddTask(group.id, title)}
              onToggleTask={(taskId) => handleToggleTask(group.id, taskId)}
              onDeleteTask={(taskId) => handleDeleteTask(group.id, taskId)}
              onEditTask={(taskId, newTitle) => handleEditTask(group.id, taskId, newTitle)}
              onReorderTasks={(newIds) => handleReorderTasks(group.id, newIds)}
              onDeleteGroup={() => handleDeleteGroup(group.id)}
              onDeferTasks={() => handleDeferGroupTasks(group.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
