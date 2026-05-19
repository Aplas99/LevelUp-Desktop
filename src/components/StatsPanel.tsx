import type { AppData } from "../types/appData";

interface StatsPanelProps {
  data: AppData;
  dataPath: string;
  status: string;
}

function getCalendarDays(year: number, month: number) {
  const startOfMonth = new Date(year, month, 1);
  const firstWeekday = startOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<number | null> = Array(firstWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function StatsPanel({ data, dataPath, status }: StatsPanelProps) {
  const today = new Date();
  const calendarDays = getCalendarDays(
    today.getFullYear(),
    today.getMonth(),
  );
  const monthLabel = today.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const completedTasks = data.questGroups.flatMap((group) => group.tasks).filter(
    (task) => task.completed,
  ).length;
  const totalTasks = data.questGroups.reduce(
    (count, group) => count + group.tasks.length,
    0,
  );

  return (
    <section>
      <div className="rounded-xl border border-cyan-400/40 bg-slate-950/65 p-4 shadow-[0_0_22px_rgba(34,211,238,0.12)] backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">
          Stats System
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">Calendar</h2>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-cyan-400/25 bg-slate-900/70 px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Groups
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {data.questGroups.length}
            </p>
          </div>

          <div className="rounded-lg border border-cyan-400/25 bg-slate-900/70 px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Tasks
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{totalTasks}</p>
          </div>

          <div className="rounded-lg border border-cyan-400/25 bg-slate-900/70 px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Done
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {completedTasks}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-400/30 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-100">
              {monthLabel}
            </h3>

            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Today {today.getDate()}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isToday = day === today.getDate();

              return (
                <div
                  key={`${day ?? "empty"}-${index}`}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-xs ${
                    day === null
                      ? "border-transparent bg-transparent text-transparent"
                      : isToday
                        ? "border-cyan-300 bg-cyan-400/15 font-bold text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.16)]"
                        : "border-cyan-400/15 bg-slate-950/70 text-slate-300"
                  }`}
                >
                  {day ?? ""}
                </div>
              );
            })}
          </div>
        </div>

        <details className="mt-4 rounded-xl border border-cyan-400/25 bg-slate-900/50 p-3 text-xs text-slate-400">
          <summary className="cursor-pointer text-cyan-300">
            Local Save Info
          </summary>

          <p className="mt-3 break-all">{dataPath}</p>
          <p className="mt-2">{status}</p>
        </details>
      </div>
    </section>
  );
}
