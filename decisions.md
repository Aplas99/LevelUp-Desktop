# Level Up - Decisions & Current Implementation

## Project Overview

**Project name:** Level Up

**Core idea:** Level Up is an offline-first desktop productivity app that turns real-life tasks into game-style quests. The app should stay available in the background, eventually as a compact floating corner window inspired by RPG / Solo Leveling-style system panels.

The app tracks:

- Quest groups / headings
- To-do items under each heading
- XP and level progress
- Streaks
- Focus sessions
- Short breaks
- Long breaks
- Repeat timer cycles
- Local offline data

The long-term visual goal is a **blue semi-gloss transparent HUD pane** that can sit in a corner of the desktop while the user works.

---

## Major Product Decisions

### 1. Offline-first application

The application must work without internet access.

All user actions should be saved locally on the user's machine.

Examples of saved actions:

- Creating quest groups
- Adding tasks
- Completing tasks
- Updating XP
- Timer state changes
- Timer settings
- Window position and size
- User preferences
- Future tray/background behavior

### 2. Local JSON storage first

The app will start with local JSON file storage before moving to a database.

Current storage approach:

```txt
AppData/Roaming/Electron/LevelUp/levelup-data.json
```

Later, the app can move to:

- SQLite
- Supabase sync
- Cloud backup
- Multi-device sync

But for the MVP, JSON is simpler, easier to inspect, and easier to debug.

### 3. Use Bun + Vite + React + TypeScript + Electron

The chosen stack is:

```txt
Bun         -> package manager and script runner
Vite        -> React development server and build system
React       -> UI framework
TypeScript  -> safer application code
Electron    -> desktop shell and file system access
JSON        -> offline local data storage
```

Important runtime decision:

- Bun is used for package management and running scripts.
- Vite runs through Node, not Bun's runtime.
- Electron handles desktop functionality.

Current script decision:

```json
{
  "scripts": {
    "dev": "concurrently \"bun run dev:react\" \"bun run dev:electron\"",
    "dev:react": "vite",
    "dev:electron": "wait-on http://localhost:5173 && cross-env VITE_DEV_SERVER_URL=http://localhost:5173 electron electron/main.cjs",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### 4. Electron files use CommonJS

Because the Vite project uses:

```json
"type": "module"
```

Electron main/preload files use `.cjs` so `require()` works correctly.

Current Electron files:

```txt
electron/main.cjs
electron/preload.cjs
```

Important import decision in `main.cjs`:

```js
const { app, BrowserWindow, ipcMain } = require("electron");
```

### 5. React should not directly access the file system

React communicates with Electron through a safe preload bridge.

Architecture rule:

```txt
React UI -> storageService -> preload bridge -> Electron main process -> local JSON file
```

React should not use Node file system APIs directly.

### 6. The Electron preload bridge exposes `window.levelUpAPI`

Current exposed API:

```ts
window.levelUpAPI.loadData()
window.levelUpAPI.saveData(data)
window.levelUpAPI.getDataFilePath()
window.levelUpAPI.minimizeWindow()
window.levelUpAPI.closeWindow()
window.levelUpAPI.setAlwaysOnTop(value: boolean)
window.levelUpAPI.setOpacity(value: number)
window.levelUpAPI.setStartWithWindows(value: boolean)
window.levelUpAPI.quitApp()
```

This only works inside the Electron window, not the normal browser tab at `localhost:5173`.

### 7. Data factory is not a state machine

The factory file creates consistent default data objects.

It answers:

> What should a new thing look like?

Examples:

```ts
createDefaultAppData()
createQuestGroup(title)
createQuestTask(title)
```

A state machine or reducer will come later for app behavior.

That will answer:

> What actions are allowed, and how does the app transition from one state to another?

Future reducer/state-machine examples:

```txt
START_TIMER
PAUSE_TIMER
COMPLETE_TASK
AWARD_XP
LEVEL_UP
RESET_DAILY_QUESTS
COMPLETE_SESSION
START_BREAK
```

### 8. XP level-up uses overflow rolling

When a task completion pushes XP past the threshold, the overflow rolls into the next level. The loop handles multi-level gains in a single task completion.

Rule implemented:

```ts
while (xp >= xpToNextLevel) {
  xp -= xpToNextLevel;
  level += 1;
  xpToNextLevel = Math.round(xpToNextLevel * 1.25);
}
```

Level-up detection lives in `App.tsx` via a `useEffect` watching `data.user.level`. This keeps the detection decoupled from any single component.

### 9. Toast notifications are in-app only; desktop notifications are reserved for important events

In-app toasts:
- Task completed → orange XP toast
- Level up → cyan levelup toast
- Timer sessions → blue timer toast (future)

Desktop (OS) notifications:
- Level up only — to avoid being spammy
- Task completion sends a silent desktop notification

Desktop notification permission is requested once on app load via `Notification.requestPermission()`.

### 10. Avatar images are stored as base64 data URLs in JSON

The profile photo picker uses a hidden `<input type="file">` and `FileReader.readAsDataURL()`. The resulting data URL is stored directly in `user.avatarUrl` inside the JSON file.

This avoids needing extra IPC calls to copy files. The tradeoff is that large images will inflate the JSON file. Users should use reasonably sized profile photos.

### 11. Drag-to-reorder uses HTML5 native drag and drop

Task reordering within a group uses native HTML5 drag events (`draggable`, `onDragStart`, `onDragOver`, `onDrop`). Drag state (dragged ID, drag-over ID) is managed inside `QuestGroupCard` and never touches the global data store until a drop is committed.

A cyan drop-indicator line appears above the target slot during drag.

### 12. Drag region — PlayerStatusPanel is outside the scroll container

The outer `<section>` wrapper in `App.tsx` has `drag-region`. The `PlayerStatusPanel` (read-only, no interactive elements) is rendered directly inside this section, outside the scroll container. This means the entire status card area is draggable. The scrollable quest content and bottom nav have `no-drag`. Scrollable areas must always be `no-drag` because `-webkit-app-region: drag` captures mouse events and prevents scrolling.

### 13. All date comparisons use local calendar date, not UTC

`toISOString()` returns a UTC date string, which can be a different calendar day than the user's local time (e.g. UTC-5 at 7 pm local is UTC midnight = next UTC day). All today/yesterday/tomorrow comparisons use a `localDateStr()` helper:

```ts
function localDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
```

Timestamps (createdAt, completedAt) still use `toISOString()` since they record an exact moment, not a calendar date.

### 14. Rank progression requires both level AND streak thresholds

Rank is derived, not stored as an independent value. `calculateRank(level, streak)` determines rank from both conditions simultaneously. This means rank can go down if the streak drops below a threshold.

```ts
const RANK_THRESHOLDS = [
  { rank: "S", minLevel: 50, minStreak: 60 },
  { rank: "A", minLevel: 40, minStreak: 30 },
  { rank: "B", minLevel: 30, minStreak: 14 },
  { rank: "C", minLevel: 20, minStreak: 7  },
  { rank: "D", minLevel: 10, minStreak: 3  },
  { rank: "E", minLevel: 1,  minStreak: 0  },
];
```

Rank is recalculated and saved after every task toggle and every streak change.

### 15. Streak increments only when a full quest group is completed

Streak goes up at most once per day, and only if the user completes every active task in at least one quest group. `checkAndUpdateStreak` is called inside `handleToggleTask` after verifying the toggled group is fully done. On app load, `checkAndUpdateStreak` runs once to reset the streak if days were missed.

### 16. Deferred tasks use a `deferredDate` field

"Move to Tomorrow" sets `deferredDate = localTomorrow` on all incomplete, active tasks in a group. Tasks are filtered at render time — any task where `deferredDate > today` is hidden. The date rolls naturally: when tomorrow becomes today, the tasks reappear. A 5 XP penalty per deferred task is applied at the time of deferral.

---

## Current Implementation Status

### Phase 1 - Desktop foundation: complete

Implemented and working:

- Vite React app starts successfully.
- Electron desktop window opens.
- Bun runs the development scripts.
- Local JSON file is created automatically.
- React can load data from Electron.
- React can save data through Electron.
- Data persists after closing and reopening the app.

Important issues solved:

- Vite needed Node `22.12.0+`.
- Bun runtime caused a Vite compatibility issue, so Vite is run directly with Node.
- Electron `.js` files were renamed to `.cjs` because the project uses ES modules.
- `ipcMain` had to be imported in `electron/main.cjs`.

### Phase 2 - Data structure cleanup: complete

Current structure:

```txt
src/
  hooks/
    useLevelUpData.ts
    useTimerController.ts
  services/
    storageService.ts
    appDataFactory.ts
    timerService.ts
  types/
    appData.ts
    electron.d.ts
```

Current app data model includes:

```ts
TimerMode
LevelUpUser
LevelUpSettings
QuestTask
QuestGroup
TimerState
AppMetadata
WindowState
AppData
```

Current user data:

```ts
user: {
  name: string;
  rank: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate?: string;   // local YYYY-MM-DD, used for streak tracking
  avatarUrl?: string;
}
```

Current task data:

```ts
task: {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  completedAt: string | null;
  deferredDate?: string;     // local YYYY-MM-DD, hides task until this date
}
```

Current settings data:

```ts
settings: {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoRepeat: boolean;
  minimizeToTray: boolean;
  alwaysOnTop: boolean;
  startWithWindows: boolean;
  opacity: number;           // 70–100, applied as mainWindow.setOpacity(opacity/100)
}
```

### Phase 3 - Quest groups and tasks: complete

Implemented features:

- Create quest groups
- Add task under each group
- Mark task complete
- Mark task incomplete
- Inline edit task title via three-dot menu
- Delete task via three-dot menu
- Delete group
- Drag tasks to reorder within a group
- Save all changes to JSON
- Award XP when a task is completed
- Subtract XP when a task is unchecked

Current components:

```txt
src/components/QuestBoard.tsx
src/components/QuestGroupCard.tsx
src/components/QuestTaskItem.tsx
```

Current task row behavior:

- Six-dot drag handle on the left for visual affordance.
- Square checkbox toggles completion.
- Task title shown in uppercase cyan.
- Orange XP badge below the title.
- Three-dot menu on the right opens Edit / Delete dropdown.
- Diagonal clip-path corners on every task row (Solo Leveling style).
- Left cyan accent bar dims when task is complete.
- Completed tasks are shown at 50% opacity with strikethrough.

Current product decision:

- If a completed task is deleted, XP currently stays earned.
- This is acceptable for game-style behavior because once a quest reward is earned, it should not necessarily be removed.

### Phase 3.5 - Compact HUD polish: complete

Implemented features:

- Compact HUD-style window layout inspired by Solo Leveling system panels.
- `PlayerStatusPanel` showing: avatar (image or initial), player name, streak pill with SVG flame, hexagon rank badge, level number, XP bar with exact values, daily reset countdown (red), combined date/day row.
- Diagonal clip-path corners on quest task rows and input fields.
- Hidden internal scrollbar while preserving scroll behavior.
- Bottom tab navigation with four tabs: Home, Focus, Stats, Profile.
- Stats placeholder view.
- Active tab shown with underline indicator dot.

Current tab structure:

- `Home` contains the player status and quest systems.
- `Focus` contains the focus timer and timer settings.
- `Stats` contains a compact calendar and stat placeholders for future task-stat work.
- `Profile` contains the hunter profile editor (name, avatar photo).

### Phase 4 - Timer system: complete

Implemented timer features:

- Focus session timer
- Short break timer
- Long break timer
- Repeat cycles
- Start / pause / reset controls
- Auto-repeat toggle
- Editable timer settings
- Automatic mode transitions after session completion
- Timer state saved to local JSON
- Timer state updates while the app runs
- Notification hook when a session completes and permission is available

Current timer architecture:

```txt
src/components/TimerPanel.tsx
src/hooks/useTimerController.ts
src/services/timerService.ts
```

Important implementation decision:

- The timer persists through the same `updateData` save path used by the rest of the app.
- `useLevelUpData` now updates local React state optimistically first, then saves to disk, to avoid stale-state races during one-second timer updates.

### Phase 5 - XP and level rules: complete

Implemented:

- XP overflow rolls into the next level on task completion.
- Multi-level gains in a single task completion are handled with a `while` loop.
- `xpToNextLevel` scales by 1.25x per level.
- Level-up detected in `App.tsx` via `useEffect` watching `data.user.level`.
- `LevelUpBanner` full-screen overlay on level-up: scan lines, corner accents, "YOU LEVELED UP!" — auto-dismisses after 4s.
- Level-up triggers both a cyan in-app toast and a desktop OS notification.

### Phase 6 - Background desktop behavior: complete

Implemented desktop-shell behavior:

- Frameless Electron window.
- Default Windows menu bar removed.
- Slim custom top chrome with "System Online" status dots and always-on-top pin button.
- Custom minimize and close buttons.
- PlayerStatusPanel lives outside the scroll container so the full status card area is draggable.
- Window position and size saved to JSON, restored on next launch.
- System tray support: cyan 16×16 PNG icon generated at runtime (no external assets) using `createSolidColorPNG()` with manual CRC32 + `zlib.deflateSync`.
- Tray context menu: Show Level Up / Quit.
- Minimize to tray: close button hides the window when `minimizeToTray` is enabled; quit is via tray.
- Always-on-top toggle: pin button in `WindowChrome` header, wired to `mainWindow.setAlwaysOnTop()` via IPC.
- Start with Windows: `app.setLoginItemSettings({ openAtLogin: value })` via IPC.
- Opacity slider (70–100%): `mainWindow.setOpacity(value / 100)` via IPC.
- System settings section in `ProfilePanel` with toggle switches and the opacity slider.
- `isQuitting` flag distinguishes intentional quit (tray menu / `quitApp` IPC) from hide-to-tray close.

Tray icon decision: rather than ship a static PNG asset, `createSolidColorPNG()` builds a valid PNG buffer from scratch at runtime. This avoids asset bundling issues in the Electron build.

### Phase 7 - Notifications and toasts: complete

In-app toast system:

- `ToastContainer` renders a stack of clipped-corner toasts centered at the top of the window.
- Each toast has a type: `xp`, `levelup`, `streak`, `timer`.
- Toasts slide down from above and fade out after 3 seconds.
- Toast queue is managed in `App.tsx` via `addToast` / `removeToast`.
- Task completion triggers an orange XP toast.
- Level-up triggers a cyan levelup toast.
- Streak increment triggers an amber streak toast; milestone days (3/7/14/30/60/100) get special labels.
- Rank-up triggers a cyan toast.
- Task deferral triggers an orange penalty toast.

Desktop notifications:

- Permission requested once on app load.
- Level-up fires an OS notification.
- Rank-up fires an OS notification.
- Task completion fires a silent OS notification.

### Phase 8 - Hunter profile: complete

Implemented:

- `name` and `rank` fields in `LevelUpUser`. `avatarUrl?: string` for base64 profile photo.
- `ProfilePanel` component on the Profile tab:
  - Avatar (photo or initial), rank hexagon, level, streak pill, XP bar.
  - Name edit field (24-char max). "Save Changes" button appears only when dirty.
  - Photo upload via native file picker — stored as data URL in JSON.
  - System Settings section: always-on-top toggle, minimize-to-tray toggle, start-with-Windows toggle, opacity slider (70–100%). Settings apply immediately via IPC.
- `PlayerStatusPanel` shows avatar photo or initial fallback.
- Defaults: `name: "Hunter"`, `rank: "E"`.

### Phase 9 - Rank progression: complete

Implemented:

- `progressService.ts` centralises all rank and streak logic.
- `calculateRank(level, streak)` checks both level AND streak thresholds (see decision #14).
- Rank-up detected in `App.tsx` via `useEffect` watching `data.user.rank` with `prevRankRef`.
- `RankUpBanner` full-screen overlay on rank-up with rank-coloured styling:
  - D: blue, C: green, B: orange, A: red-400, S: red-500 (stronger glow).
  - Shows hexagon rank letter, "YOU ARE NOW RANK X Hunter", auto-dismisses after 4.5s.
- Rank-up fires both an in-app toast and an OS desktop notification.

### Phase 10 - Streak system: complete

Implemented:

- `lastActiveDate` field added to `LevelUpUser` (ISO date string, local calendar date).
- `checkAndUpdateStreak` returns updated streak + date, or null if today is already counted.
- Streak increments only when all active tasks in at least one quest group are completed (see decision #15).
- On app load, `checkAndUpdateStreak` runs once via a `streakCheckedRef` guard. If days were missed, streak resets to 1.
- Streak milestone toasts at 3, 7, 14, 30, 60, and 100 days.
- `RANK_ORDER` and `rankIndex` exported from `progressService` for rank comparison logic.

### Move to Tomorrow: complete

- Right-arrow defer button hidden in each quest group header, revealed by hovering the +ADD button area.
- Hovering the arrow shows a "Move to Tomorrow · -5 XP/task" tooltip.
- Clicking defers all incomplete active tasks to the next local calendar day (`deferredDate`).
- Deducted XP: 5 per deferred task, clamped at 0.
- Deferred tasks are invisible until their date arrives. Group header shows "+N tmr" badge when tasks are deferred.
- Empty state message changes to "All tasks deferred — N returning tomorrow" when every active task is deferred.

### Dev Tools: complete

- Collapsible "Dev Tools" section at the bottom of the quest board (chevron toggle).
- Three test buttons: `+50 XP`, `+1 Streak`, `Next Rank` — each triggers the corresponding toast and banner flow for testing.
- `Reset All Progress` button (full-width, danger red) — prompts for confirmation, then calls `createDefaultAppData()` to wipe XP, level, streak, rank, and all quest groups back to defaults.

---

## Current UI Direction

### Current layout decision

The app lives in a compact corner-window shell in the background.

Current design target:

```txt
Small corner HUD window
Dark navy background (#050816)
Cyan glow borders and accents
Diagonal clip-path corners on task rows and inputs (Solo Leveling style)
Compact player status: avatar, name, streak flame, rank hexagon, level, XP bar
Daily reset countdown in red
Combined date/day row
Scrollable content area
Four-tab bottom navigation
Frameless futuristic shell
Custom window controls
```

### PlayerStatusPanel layout

```txt
[ Avatar (photo or initial) ] [ Name         ] [ Rank hexagon ]
                              [ Streak pill  ] [ Level N      ]
[ EXP label ]  [ XP / xpToNextLevel ]
[ =====================XP bar======================== ]

[ Reset In  ] [ DAY, MONTH DD, YYYY                 ]
[ HH:MM:SS  ] (date text in cyan, timer in red)
```

### QuestTaskItem layout

```txt
[ ⠿ grip ] [ □ checkbox ] [ TASK TITLE      ] [ ⋮ menu ]
                           [ +10 XP badge   ]
```

- Clipped corners: `polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))`
- Left accent bar: cyan when incomplete, slate when complete.
- Three-dot menu: Edit (inline input) / Delete.

### Electron shell decision

The Electron window is a compact HUD-style shell rather than a normal desktop frame.

Current window setup:

```js
mainWindow = new BrowserWindow({
  width: 420,
  height: 680,
  minWidth: 360,
  minHeight: 520,
  frame: false,
  autoHideMenuBar: true,
  backgroundColor: "#050816",
  webPreferences: {
    preload: path.join(__dirname, "preload.cjs"),
    contextIsolation: true,
    nodeIntegration: false
  }
});
```

---

## Current Visual Style Decisions

Theme direction:

```txt
Dark navy / slate background
Cyan and blue glowing borders
Transparent panel layers
Backdrops / blur effects
Small sci-fi typography
Game HUD style
Solo Leveling-inspired quest system feel
Diagonal clip-path corners on interactive rows
```

Common Tailwind styling choices:

```txt
bg-slate-900/80       (panel backgrounds)
bg-slate-950          (window shell)
border-cyan-400/20    (subtle borders)
text-cyan-300         (primary accent text)
text-orange-300       (XP reward badges)
text-amber-300        (streak)
text-red-400/90       (reset countdown timer)
shadow-[0_0_8px_rgba(34,211,238,0.65)]  (XP bar glow)
clip-path diagonal corners on task rows and inputs
```

Compact UI rules:

```txt
Use smaller padding
Use smaller font sizes
Use collapsed panels where possible
Keep the app max width around 420px
Keep the main content scrollable above the bottom nav
Avoid giant dashboard cards
Keep the shell feeling like a system panel, not a browser page
Add/create forms toggle in and out — hidden by default
```

---

## Important Technical Lessons Learned

### 1. Browser dev page cannot test Electron-only APIs

The page at:

```txt
http://localhost:5173/
```

may fail when trying to access local data because it does not have Electron's preload API.

Storage and shell testing must happen inside the Electron desktop window.

### 2. Vite 8 required updated Node

The app failed with Node `22.6.0`.

Fix:

```txt
Upgrade Node to 22.12.0+
```

Current working Node version:

```txt
v22.12.0
```

### 3. Bun should not run Vite through Bun runtime right now

This caused issues:

```json
"dev:react": "bunx --bun vite"
```

Working version:

```json
"dev:react": "vite"
```

### 4. Electron CommonJS files need `.cjs`

Because `package.json` contains:

```json
"type": "module"
```

Electron main/preload files should be:

```txt
main.cjs
preload.cjs
```

### 5. Frameless windows need explicit drag and control regions

Once `frame: false` is enabled:

- The native Windows title bar and buttons are gone.
- Minimize and close must be reimplemented through Electron IPC.
- Dragging must be explicitly defined with `-webkit-app-region: drag`.
- Interactive controls must be explicitly marked as `no-drag`.

### 6. Level-up detection must live outside the updater function

The `updateData` updater is a pure function passed to React state. Calling side-effects (like showing a banner) inside it causes React strict-mode double-invocation bugs.

The correct pattern is to detect the level change externally:

```ts
const currentLevel = data?.user.level;
useEffect(() => {
  if (prevLevelRef.current !== null && currentLevel > prevLevelRef.current) {
    // trigger banner / toast / notification here
  }
  prevLevelRef.current = currentLevel;
}, [currentLevel]);
```

### 7. Drag state should stay local to QuestGroupCard

HTML5 drag state (`draggedId`, `dragOverId`) is ephemeral UI state. Lifting it to the global data store would cause unnecessary saves on every drag-over event. It lives in `QuestGroupCard` and only commits to the store on a confirmed drop.

---

## Next Phases

### Current phase boundary

Current status:

- Phase 1: complete
- Phase 2: complete
- Phase 3: complete
- Phase 3.5: complete
- Phase 4: complete
- Phase 5: complete
- Phase 6: complete
- Phase 7: complete
- Phase 8: complete
- Phase 9: complete
- Phase 10: complete
- Move to Tomorrow: complete
- Dev Tools: complete

### Phase 11 - Database migration

Move from JSON to SQLite when the app needs:

- Better query performance
- Many historical records
- Recurring tasks
- Analytics
- Daily logs
- Search/filtering
- Data migrations

Migration principle:

```txt
Only storageService should need major changes.
```

The UI should not care whether data comes from JSON or SQLite.

---

## Current Recommended Folder Structure

```txt
level-up/
  electron/
    main.cjs
    preload.cjs

  src/
    components/
      BottomNav.tsx
      LevelUpBanner.tsx
      PlayerStatusPanel.tsx
      ProfilePanel.tsx
      QuestBoard.tsx         (includes Dev Tools panel)
      QuestGroupCard.tsx     (includes Move to Tomorrow)
      QuestTaskItem.tsx
      RankUpBanner.tsx
      StatsPanel.tsx
      TimerPanel.tsx
      ToastContainer.tsx
      WindowChrome.tsx       (includes always-on-top pin)

    hooks/
      useLevelUpData.ts
      useTimerController.ts

    services/
      appDataFactory.ts
      progressService.ts     (rank, streak, milestone logic)
      storageService.ts
      timerService.ts

    types/
      appData.ts
      electron.d.ts

    App.tsx
    index.css
    main.tsx

  package.json
  vite.config.ts
```

---

## Current Development Command

Run the app with:

```bash
bun run dev
```

Expected result:

```txt
Vite starts at localhost:5173
Electron opens the desktop window
Level Up UI loads
Data loads from local JSON
Actions save back to local JSON
Window position restores from the last saved placement
```

---

## Current Design North Star

Level Up should feel like a small supernatural productivity system watching quietly from the corner of the desktop.

Not a normal to-do list.

Not a giant dashboard.

More like:

```txt
A compact quest HUD
A background companion
A daily discipline system
A task tracker with game progression
A desktop pane that feels alive but stays out of the way
```
