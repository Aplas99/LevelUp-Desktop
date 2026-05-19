import { useState } from "react";
import type { QuestGroup } from "../types/appData";
import { localDateStr } from "../services/progressService";
import { QuestTaskItem } from "./QuestTaskItem";

interface QuestGroupCardProps {
  group: QuestGroup;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string) => void;
  onReorderTasks: (newIds: string[]) => void;
  onDeleteGroup: () => void;
  onDeferTasks: () => void;
}

const INPUT_CLIP =
  "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))";

export function QuestGroupCard({
  group,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onReorderTasks,
  onDeleteGroup,
  onDeferTasks,
}: QuestGroupCardProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = taskTitle.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setTaskTitle("");
    setAddingTask(false);
  }

  function makeDragStart(taskId: string) {
    return (e: React.DragEvent) => {
      setDraggedId(taskId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", taskId);
    };
  }

  function makeDragOver(taskId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (taskId !== draggedId) setDragOverId(taskId);
    };
  }

  function makeDrop(taskId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedId || draggedId === taskId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }
      const ids = group.tasks.map((t) => t.id);
      const from = ids.indexOf(draggedId);
      const to = ids.indexOf(taskId);
      const next = [...ids];
      next.splice(from, 1);
      next.splice(to, 0, draggedId);
      onReorderTasks(next);
      setDraggedId(null);
      setDragOverId(null);
    };
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  const today = localDateStr();
  const visibleTasks = group.tasks.filter((t) => !t.deferredDate || t.deferredDate <= today);
  const deferredCount = group.tasks.length - visibleTasks.length;
  const completedCount = visibleTasks.filter((t) => t.completed).length;
  const totalCount = visibleTasks.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <section>
      {/* Group header */}
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-0.5 bg-cyan-400/70" />
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">
            {group.title}
          </h2>
          <span className={`text-[9px] font-bold tabular-nums ${allDone ? "text-cyan-400" : "text-slate-500"}`}>
            {completedCount}/{totalCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAddingTask((v) => !v)}
            className="border border-cyan-400/30 bg-cyan-400/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 transition hover:bg-cyan-400/15 hover:text-cyan-300"
          >
            + ADD
          </button>

          {/* Defer arrow — always visible, dimmed until hovered */}
          <div className="group/arrow relative">
            <button
              type="button"
              onClick={onDeferTasks}
              className="flex items-center border border-orange-400/15 bg-transparent px-1.5 py-0.5 text-orange-400/30 transition hover:border-orange-400/50 hover:bg-orange-400/10 hover:text-orange-300"
              aria-label="Move incomplete tasks to tomorrow"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            {/* Tooltip */}
            <span className="pointer-events-none absolute right-0 top-full z-30 mt-1 whitespace-nowrap border border-orange-400/25 bg-slate-900 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-orange-300 opacity-0 shadow-lg transition-opacity group-hover/arrow:opacity-100">
              Move to Tomorrow · -5 XP/task
            </span>
          </div>
        </div>

          {/* Deferred count badge */}
          {deferredCount > 0 && (
            <span className="text-[9px] font-bold tabular-nums text-orange-400/60">
              +{deferredCount} tmr
            </span>
          )}

          <button
            type="button"
            onClick={onDeleteGroup}
            aria-label="Delete group"
            className="text-slate-700 transition hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add task form */}
      {addingTask && (
        <form onSubmit={handleSubmit} className="mb-2 flex gap-2">
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Quest name..."
            autoFocus
            className="flex-1 border border-cyan-400/30 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60"
            style={{ clipPath: INPUT_CLIP }}
          />
          <button
            type="submit"
            className="border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-400/20"
            style={{ clipPath: INPUT_CLIP }}
          >
            Add
          </button>
        </form>
      )}

      {/* Tasks */}
      <div className="space-y-1.5">
        {visibleTasks.length === 0 ? (
          <div className="border border-dashed border-cyan-400/15 py-4 text-center text-xs text-slate-600">
            {deferredCount > 0 ? `All tasks deferred — ${deferredCount} returning tomorrow.` : "No quests yet — press ADD above."}
          </div>
        ) : (
          visibleTasks.map((task) => (
            <QuestTaskItem
              key={task.id}
              task={task}
              onToggleComplete={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onEdit={(newTitle) => onEditTask(task.id, newTitle)}
              isDragOver={dragOverId === task.id}
              onDragStart={makeDragStart(task.id)}
              onDragOver={makeDragOver(task.id)}
              onDrop={makeDrop(task.id)}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
    </section>
  );
}
