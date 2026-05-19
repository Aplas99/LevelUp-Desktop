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

### Phase 2 - Data structure cleanup: implemented

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

Purpose of each file:

```txt
appData.ts          -> TypeScript interfaces for app data
electron.d.ts       -> TypeScript declaration for window.levelUpAPI
storageService.ts   -> clean wrapper around Electron storage API
appDataFactory.ts   -> creates default app data, quest groups, and quest tasks
timerService.ts     -> timer mode duration and transition helpers
useLevelUpData.ts   -> React hook that loads, stores, updates, and saves app data
useTimerController.ts -> timer runtime and persistence controller
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
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
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
}
```

Current quest group data:

```ts
questGroups: QuestGroup[]
```

Current timer data:

```ts
timer: {
  mode: "focus" | "shortBreak" | "longBreak";
  isRunning: boolean;
  remainingSeconds: number;
  currentSession: number;
  completedSessions: number;
}
```

Current window state data:

```ts
windowState: {
  x?: number;
  y?: number;
  width: number;
  height: number;
}
```

### Phase 3 - Quest groups and tasks: implemented

Implemented features:

- Create quest groups
- Add task under each group
- Mark task complete
- Mark task incomplete
- Delete task
- Delete group
- Save all changes to JSON
- Award XP when a task is completed
- Subtract XP when a task is unchecked

Current components:

```txt
src/components/QuestBoard.tsx
src/components/QuestGroupCard.tsx
src/components/QuestTaskItem.tsx
```

Current UI behavior:

- Quest Board has a group input.
- Each group can contain many tasks.
- Each task has an XP reward.
- Completing a task updates XP.
- Unchecking a task subtracts XP.
- Empty quest board shows a placeholder message.

Current product decision:

- If a completed task is deleted, XP currently stays earned.
- This is acceptable for game-style behavior because once a quest reward is earned, it should not necessarily be removed.

### Phase 3.5 - Compact HUD polish: implemented

Implemented features:

- Compact HUD-style window layout
- `PlayerStatusPanel` header
- XP progress bar with exact XP shown on hover
- Compact quest board, group cards, and task rows
- Hidden internal scrollbar while preserving scroll behavior
- Bottom tab navigation shell
- Stats placeholder view with calendar
- Save info moved out of the main home flow

Current components added for HUD structure:

```txt
src/components/PlayerStatusPanel.tsx
src/components/BottomNav.tsx
src/components/StatsPanel.tsx
```

Current tab structure:

- `Home` contains the player status and quest systems.
- `Focus` contains the focus timer and timer settings.
- `Stats` contains a compact calendar and stat placeholders for future task-stat work.

### Phase 4 - Timer system: implemented

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

### Phase 6 - Background desktop behavior: partially implemented

Implemented desktop-shell behavior:

- Frameless Electron window
- Default Windows menu bar removed
- Custom futuristic top chrome
- Custom minimize button
- Custom close button
- Dedicated drag region in the custom top chrome
- Window position and size saved to JSON
- Window position and size restored on next launch

Current shell behavior:

- The user can drag the panel by the custom top strip.
- The panel reopens where the user last placed it, effectively making it pinnable to a preferred desktop spot.
- Interactive controls inside the UI stay non-draggable through explicit `no-drag` regions.

---

## Current UI Direction

### Original layout

The first working layout was a large full dashboard with:

- Title section
- Level card
- XP number card
- Streak card
- Quest board
- Local save file panel

### Current layout decision

The app should live in a compact corner-window shell in the background.

Current design target:

```txt
Small corner HUD window
Blue/cyan sci-fi panel
Semi-gloss transparent pane
Compact player status section
XP bar instead of XP number
Hover over XP bar to see exact number
Scrollable content area
Bottom tab navigation
Frameless futuristic shell
Custom window controls
```

### Compact header behavior

Instead of large cards for level, XP, and streak:

- Level is a compact badge.
- XP is a progress bar.
- XP number appears only on hover through the HTML `title` tooltip.
- Streak is a compact badge.

Current component:

```txt
src/components/PlayerStatusPanel.tsx
```

Current visible behavior:

```txt
Quest System Online
Level Up
LVL badge
XP bar
Streak badge
```

XP bar calculation:

```ts
const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));
```

XP hover:

```tsx
title={`${user.xp}/${user.xpToNextLevel} XP`}
```

### Electron shell decision

The Electron window is now a compact HUD-style shell rather than a normal desktop frame.

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

Current shell components:

```txt
src/components/WindowChrome.tsx
src/components/BottomNav.tsx
```

Future window behavior:

```txt
Transparent background
Always-on-top option
Minimize to tray
Corner docking
Opacity control
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
```

Common Tailwind styling choices:

```txt
bg-slate-950/75
border-cyan-400/50
text-cyan-300
shadow-[0_0_35px_rgba(34,211,238,0.22)]
backdrop-blur-xl
rounded-2xl
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

---

## Next Phases

### Current phase boundary

The project is currently past Phase 4 and partially into Phase 6 shell work.

Current status:

- Phase 1: complete
- Phase 2: complete
- Phase 3: complete
- Phase 3.5: complete
- Phase 4: complete
- Phase 5: next major implementation target
- Phase 6: partially implemented

### Phase 5 - XP and level rules

Needed improvements:

- XP bar should handle level-up.
- XP overflow should roll into the next level.
- Level-up animation / notification.
- Rank system could be added later.
- Future stat rewards should tie task completion into stat progression.

Possible rule:

```txt
When XP >= xpToNextLevel:
  level += 1
  xp = xp - xpToNextLevel
  xpToNextLevel = Math.round(xpToNextLevel * 1.25)
```

### Phase 6 - Background desktop behavior

Planned features:

- System tray support
- Minimize to tray
- Always-on-top option
- Start with Windows option
- Desktop notifications beyond timer completion
- Floating HUD mode
- Transparent background
- Full floating-pane styling
- Always-on-top toggle
- Save and restore window position across all app states
- Opacity slider

Already implemented:

- Frameless window
- Drag region
- Save window position
- Restore saved window position
- Custom minimize/close controls

### Phase 7 - Database migration

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
      PlayerStatusPanel.tsx
      QuestBoard.tsx
      QuestGroupCard.tsx
      QuestTaskItem.tsx
      StatsPanel.tsx
      TimerPanel.tsx
      WindowChrome.tsx

    hooks/
      useLevelUpData.ts
      useTimerController.ts

    services/
      appDataFactory.ts
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
