import { useState } from "react";
import type { AppData } from "../types/appData";
import { createQuestGroup, createQuestTask } from "../services/appDataFactory";
import { QuestGroupCard } from "./QuestGroupCard";

interface QuestBoardProps {
  data: AppData;
  updateData: (
    updater: (currentData: AppData) => AppData,
  ) => Promise<AppData | null>;
}

export function QuestBoard({ data, updateData }: QuestBoardProps) {
  const [groupTitle, setGroupTitle] = useState("");

  function handleCreateGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = groupTitle.trim();

    if (!trimmedTitle) return;

    updateData((currentData) => ({
      ...currentData,
      questGroups: [...currentData.questGroups, createQuestGroup(trimmedTitle)],
    }));

    setGroupTitle("");
  }

  function handleAddTask(groupId: string, taskTitle: string) {
    updateData((currentData) => ({
      ...currentData,
      questGroups: currentData.questGroups.map((group) => {
        if (group.id !== groupId) return group;

        return {
          ...group,
          tasks: [...group.tasks, createQuestTask(taskTitle, 10)],
        };
      }),
    }));
  }

  function handleToggleTask(groupId: string, taskId: string) {
    updateData((currentData) => {
      let xpChange = 0;

      const updatedGroups = currentData.questGroups.map((group) => {
        if (group.id !== groupId) return group;

        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;

            const willBeCompleted = !task.completed;

            xpChange = willBeCompleted ? task.xpReward : -task.xpReward;

            return {
              ...task,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString() : null,
            };
          }),
        };
      });

      const updatedXp = Math.max(0, currentData.user.xp + xpChange);

      return {
        ...currentData,
        user: {
          ...currentData.user,
          xp: updatedXp,
        },
        questGroups: updatedGroups,
      };
    });
  }

  function handleDeleteTask(groupId: string, taskId: string) {
    updateData((currentData) => ({
      ...currentData,
      questGroups: currentData.questGroups.map((group) => {
        if (group.id !== groupId) return group;

        return {
          ...group,
          tasks: group.tasks.filter((task) => task.id !== taskId),
        };
      }),
    }));
  }

  function handleDeleteGroup(groupId: string) {
    updateData((currentData) => ({
      ...currentData,
      questGroups: currentData.questGroups.filter(
        (group) => group.id !== groupId,
      ),
    }));
  }

  return (
    <section className="mt-4">
      <div className="mb-4 rounded-xl border border-cyan-400/40 bg-slate-950/60 p-3 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
          Quest Board
        </p>

        <h2 className="mt-1 text-xl font-bold">Daily Quests</h2>

        <form onSubmit={handleCreateGroup} className="mt-3 flex gap-2">
          <input
            value={groupTitle}
            onChange={(event) => setGroupTitle(event.target.value)}
            placeholder="Create a heading, like Programming or Strength Training..."
            className="flex-1 rounded-lg border border-cyan-400/40 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
          />

          <button
            type="submit"
            className="rounded-lg border border-cyan-300 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-200 transition hover:bg-cyan-400/20"
          >
            Create Group
          </button>
        </form>
      </div>

      <div className="grid gap-5">
        {data.questGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cyan-400/40 bg-slate-950/60 p-5 text-center">
            <p className="text-sm text-slate-300">
              No quest groups yet. Create your first heading.
            </p>
          </div>
        ) : (
          data.questGroups.map((group) => (
            <QuestGroupCard
              key={group.id}
              group={group}
              onAddTask={(taskTitle) => handleAddTask(group.id, taskTitle)}
              onToggleTask={(taskId) => handleToggleTask(group.id, taskId)}
              onDeleteTask={(taskId) => handleDeleteTask(group.id, taskId)}
              onDeleteGroup={() => handleDeleteGroup(group.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
