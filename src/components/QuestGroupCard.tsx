import { useState } from "react";
import type { QuestGroup } from "../types/appData";
import { QuestTaskItem } from "./QuestTaskItem";

interface QuestGroupCardProps {
  group: QuestGroup;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteGroup: () => void;
}

export function QuestGroupCard({
  group,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onDeleteGroup,
}: QuestGroupCardProps) {
  const [taskTitle, setTaskTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = taskTitle.trim();

    if (!trimmedTitle) return;

    onAddTask(trimmedTitle);
    setTaskTitle("");
  }

  const completedCount = group.tasks.filter((task) => task.completed).length;
  const totalCount = group.tasks.length;

  return (
    <section className="rounded-xl border border-blue-400/40 bg-slate-950/70 p-3 shadow-[0_0_20px_rgba(59,130,246,0.14)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            Quest Group
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">{group.title}</h2>

          <p className="mt-1 text-sm text-slate-400">
            {completedCount}/{totalCount} quests completed
          </p>
        </div>

        <button
          onClick={onDeleteGroup}
          className="rounded border border-red-400/40 px-3 py-1 text-sm text-red-300 transition hover:bg-red-400/10"
        >
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
        <input
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          placeholder="Add a new quest..."
          className="flex-1 rounded-lg border border-cyan-400/40 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
        />

        <button
          type="submit"
          className="rounded-lg border border-cyan-300 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-200 transition hover:bg-cyan-400/20"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {group.tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-cyan-400/30 p-4 text-sm text-slate-400">
            No quests yet. Add your first task.
          </p>
        ) : (
          group.tasks.map((task) => (
            <QuestTaskItem
              key={task.id}
              task={task}
              onToggleComplete={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
