import { useEffect, useRef, useState } from "react";
import type { QuestTask } from "../types/appData";

interface QuestTaskItemProps {
  task: QuestTask;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit: (newTitle: string) => void;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const CLIP = "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))";

export function QuestTaskItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: QuestTaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setEditValue(task.title);
    setMenuOpen(false);
    setEditing(true);
  }

  function commitEdit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) onEdit(trimmed);
    else setEditValue(task.title);
    setEditing(false);
  }

  return (
    <div
      className="relative"
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Drop indicator line */}
      {isDragOver && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
      )}

      {/* Card */}
      <div
        className={`relative bg-slate-900/75 transition-opacity duration-200 ${task.completed ? "opacity-50" : ""}`}
        style={{ clipPath: CLIP }}
      >
        {/* Border */}
        <div className="pointer-events-none absolute inset-0 border border-cyan-400/15" style={{ clipPath: CLIP }} />
        {/* Left accent */}
        <div className={`absolute bottom-0 left-0 top-0 w-[3px] ${task.completed ? "bg-slate-700" : "bg-cyan-400/60"}`} />

        <div className="flex items-center gap-2 py-3 pl-3 pr-2">
          {/* Drag grip */}
          <div className="shrink-0 cursor-grab p-0.5 text-slate-700 transition hover:text-slate-500 active:cursor-grabbing">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <circle cx="9"  cy="6"  r="1.4" />
              <circle cx="15" cy="6"  r="1.4" />
              <circle cx="9"  cy="12" r="1.4" />
              <circle cx="15" cy="12" r="1.4" />
              <circle cx="9"  cy="18" r="1.4" />
              <circle cx="15" cy="18" r="1.4" />
            </svg>
          </div>

          {/* Checkbox */}
          <button
            type="button"
            onClick={onToggleComplete}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
            className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-all duration-150 ${
              task.completed
                ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                : "border-cyan-400/40 hover:border-cyan-300 hover:bg-cyan-400/8"
            }`}
          >
            {task.completed && (
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 13 4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content / inline edit */}
          {editing ? (
            <form onSubmit={commitEdit} className="flex-1">
              <input
                ref={editRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                className="w-full bg-transparent text-sm font-bold uppercase tracking-wider text-cyan-100 outline-none border-b border-cyan-400/50 focus:border-cyan-400"
              />
            </form>
          ) : (
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold tracking-wider ${task.completed ? "text-slate-500 line-through" : "text-cyan-100"}`}>
                {task.title.toUpperCase()}
              </p>
              <span className="mt-0.5 inline-block border border-orange-400/30 bg-orange-500/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-orange-300">
                +{task.xpReward} XP
              </span>
            </div>
          )}

          {/* Three-dot button */}
          {!editing && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Task options"
              className="shrink-0 p-1 text-slate-700 transition hover:text-slate-400"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <circle cx="12" cy="5"  r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown — outside clip so it renders unclipped */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-1 min-w-[130px] overflow-hidden border border-cyan-400/20 bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)" }}
        >
          <button
            type="button"
            onClick={startEdit}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-300 transition hover:bg-slate-800 hover:text-cyan-300"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
          <div className="mx-3 h-px bg-slate-800" />
          <button
            type="button"
            onClick={() => { setMenuOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/10"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
