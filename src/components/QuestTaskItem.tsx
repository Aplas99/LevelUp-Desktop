import type { QuestTask } from "../types/appData";

interface QuestTaskItemProps {
  task: QuestTask;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export function QuestTaskItem({
  task,
  onToggleComplete,
  onDelete,
}: QuestTaskItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-cyan-400/25 bg-slate-950/60 px-3 py-2 text-sm">
      <button
        onClick={onToggleComplete}
        className="flex items-center gap-3 text-left"
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
            task.completed
              ? "border-cyan-300 bg-cyan-300 text-slate-950"
              : "border-cyan-400"
          }`}
        >
          {task.completed ? "\u2713" : ""}
        </span>

        <span
          className={
            task.completed ? "text-slate-400 line-through" : "text-slate-100"
          }
        >
          {task.title}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-cyan-300">+{task.xpReward}</span>

        <button
          onClick={onDelete}
          className="text-xs text-red-300 transition hover:text-red-200"
        >
          {"\u00D7"}
        </button>
      </div>
    </div>
  );
}
