import type { LevelUpUser } from "../types/appData";

export const RANK_ORDER = ["E", "D", "C", "B", "A", "S"] as const;
export type Rank = (typeof RANK_ORDER)[number];

// Both conditions must be met to hold a rank
const RANK_THRESHOLDS: { rank: Rank; minLevel: number; minStreak: number }[] = [
  { rank: "S", minLevel: 50, minStreak: 60 },
  { rank: "A", minLevel: 40, minStreak: 30 },
  { rank: "B", minLevel: 30, minStreak: 14 },
  { rank: "C", minLevel: 20, minStreak: 7  },
  { rank: "D", minLevel: 10, minStreak: 3  },
  { rank: "E", minLevel: 1,  minStreak: 0  },
];

export function calculateRank(level: number, streak: number): Rank {
  for (const t of RANK_THRESHOLDS) {
    if (level >= t.minLevel && streak >= t.minStreak) return t.rank;
  }
  return "E";
}

export function rankIndex(rank: string): number {
  return RANK_ORDER.indexOf(rank as Rank);
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

export function getStreakMilestone(prev: number, next: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (prev < m && next >= m) return m;
  }
  return null;
}

export function localDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayStr(): string {
  return localDateStr();
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

/**
 * Returns the streak/date fields that need updating, or null if today is
 * already counted and no change is needed.
 */
export function checkAndUpdateStreak(
  user: Pick<LevelUpUser, "streak" | "lastActiveDate">,
): { streak: number; lastActiveDate: string } | null {
  const today = todayStr();

  if (user.lastActiveDate === today) return null; // already counted today

  if (!user.lastActiveDate) {
    return { streak: Math.max(1, user.streak), lastActiveDate: today };
  }

  if (user.lastActiveDate === yesterdayStr()) {
    return { streak: user.streak + 1, lastActiveDate: today };
  }

  // Gap of 2+ days — streak resets
  return { streak: 1, lastActiveDate: today };
}
