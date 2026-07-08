# VBS Leader Hub — Feature Spec

**App:** Rainforest Falls VBS 2026 · Leader Hub  
**Org:** Gateway Church  
**Event dates:** July 13–17, 2026 · 9:00 AM – 12:00 PM daily  
**Stack:** React 18, Vite, Lucide React icons, Google Fonts (Oswald, Plus Jakarta Sans)

---

## Core Architecture

- Single-page app with a **4-tab bottom navigation** (Schedule, Daily, Coffee, Crew)
- **Mobile-first**, max-width 430px, centered — designed for phones
- Respects iOS safe-area insets (`env(safe-area-inset-*)`) throughout
- Dark theme only — custom design token system via React Context (`TH` theme object)
- Live clock ticks every 60 seconds to drive real-time state
- Page transitions animate with `tabFade` keyframe on tab switch

---

## App Flow

### 1. Splash Screen
- Displays the Rainforest Falls logo (`/rf-logo.png`) with a bounce-in animation
- Falls back to a 🌿 emoji if the image fails to load
- Shows "Gateway Church · VBS 2026" and "Leader Hub" text
- Auto-dismisses after ~2.1 seconds with a fade-out transition

### 2. Group Picker (first launch)
- Shown on first launch when no group is saved
- Displays 6 color groups in a 2-column grid: Red, Yellow, Green, Blue, Purple, Orange (Preschool)
- Each group has a colored circle, label, and tap-to-select highlight effect
- Confirm button enables only after a group is selected
- Selection is saved to `localStorage` under the key `rfGroup`

### 3. Main App
- Sticky global header with "Gateway Church · VBS 2026" and "Rainforest Falls" branding
- Group badge in header (colored pill showing current group) — tappable to change group
- **Group Change Modal** (bottom sheet): lets user switch color group at any time

---

## Groups

Six leader groups, each with a distinct color used throughout the UI:

| Key    | Label                   | Color     |
|--------|-------------------------|-----------|
| red    | Red                     | `#E05252` |
| yellow | Yellow                  | `#D4A017` |
| green  | Green                   | `#38A85A` |
| blue   | Blue                    | `#3B82F6` |
| purple | Purple                  | `#9B5CF6` |
| orange | Orange · Preschool      | `#F97316` |

---

## Live Status Engine

A `getLive()` function computes real-time program state by comparing current time to the schedule:

- `countdown` — before July 13; shows "Coming Soon"
- `before` — VBS day, but program hasn't started yet; shows countdown in minutes
- `live` — currently in an active slot; shows current activity + progress bar
- `after` — program finished for the day
- `done` — after July 17; shows end-of-event message

---

## Tab: Schedule

Displays the full daily schedule (9 AM – 12 PM) with two views.

### Now Banner
- Rendered at the top of the schedule page based on live status
- **Countdown state:** "July 13–17 · Coming Soon"
- **Before state:** "Program starts in X min"
- **Live state:**
  - Pulsing green "Live Now" dot with current day label
  - Shows current slot name (e.g., "Station Rotations")
  - **Your group's activity card** — station name, location, minutes remaining, progress bar
  - **All-groups mini grid** (3 columns) showing where each group is right now
  - "Next" row showing upcoming slot name and start time
- **After state:** "Program wrapped for today"
- **Done state:** "VBS 2026 complete. See you next year 🌿"

### Full Day Timeline
- Vertical timeline with time stamps and connector lines
- 7 slots total:
  1. Sing & Play Tune Lagoon (all groups) — Auditorium
  2–6. Station Rotations (group-specific) × 5
  7. Canopy Closing (all groups) — Auditorium
- Each slot card shows:
  - Slot name and emoji
  - Location (for all-group slots)
  - Group-specific activity card (for rotation slots, color-coded to user's group)
  - Time range and duration in minutes
  - "NOW" badge on the currently active slot
  - Past slots are visually faded (0.42 opacity)

### All Groups Reference Table
- Compact scrollable table showing all 6 groups across all 7 time slots
- Color dots for each group column header
- User's own group column is highlighted with their group color
- Current slot row highlighted in accent background

### Station Rotation Data
Each of the 5 rotation slots has a unique schedule per group:

| Station                        | Location                    |
|--------------------------------|-----------------------------|
| Rooted Bible Adventures        | Chapel                      |
| Missions                       | West Wing                   |
| Treetop Treats / Imagination   | Pearson Fellowship Hall     |
| Wild Games                     | Field / Gym                 |
| Worship                        | Auditorium                  |
| Paradise Preschool (Orange)    | West Wing / Nursery         |

---

## Tab: Daily

Per-day content for all 5 VBS days, with a day-selector tab row (D1–D5).

Auto-selects the current VBS day if today is an active day; defaults to Day 1 otherwise.

### Per-Day Content

Each day includes:

- **Bible Point** — the day's core theme (e.g., "God is our creator.")
- **Group response** — "Wow, God!" (displayed as a badge)
- **VBS Buddy character** — mascot animal for the day (e.g., Tango 🦜)
- **Day accent color** — unique color applied to cards, borders, and accents
- **Memory Verse** — reference and full verse text displayed in italics
- **Bible Story** — passage reference and Bible Point
- **Crew Icebreaker** — a discussion prompt for crew time
- **Today's Reminders** — 5 numbered, day-specific coaching tips for leaders

### Days Reference

| Day | Date         | Bible Point              | Buddy       | Passage              |
|-----|--------------|--------------------------|-------------|----------------------|
| 1   | Mon July 13  | God is our creator.      | Tango 🦜   | Genesis 1            |
| 2   | Tue July 14  | God knows everything.    | Seymour 🦎 | Psalm 139            |
| 3   | Wed July 15  | God is our safe place.   | Dottie 🐦  | 1 Samuel 23–24       |
| 4   | Thu July 16  | God is love.             | Tia 🦋     | Luke 22:39–24:12     |
| 5   | Fri July 17  | God is forever.          | Howie 🦗   | Revelation 7:17; 21–22 |

---

## Tab: Coffee

An order form for The Café @ Gateway (located in Pearson Fellowship Hall).

### Order Flow
1. **Name field** — free text input
2. **Drink category toggle** — Hot ☕ or Cold 🧊
3. **Drink selection** — 2-column grid, multi-select allowed

   **Hot drinks (9):** Americano, Latte / Cappuccino, Almond Milk Latte, Breve Latte, Mocha, Caramel Machiatto, Chai Tea Latte, London Fog, Hot Chocolate

   **Cold drinks (4):** Italian Soda, Joe Chill, Chai Chill, Fruit Smoothie

4. **Size selector** (hot drinks only) — 8 oz, 12 oz, 16 oz (cold drinks default to 16 oz)
5. **Extras** (optional, multi-select) — Extra Shot of Espresso, Extra Shot of Syrup, Bottled Water, Hot Tea, Biscotti, Trail Mix, Mentos
6. **Notes field** — free text textarea for special requests

### Send Order
- Submit button is disabled until name, at least one drink, and size (if hot) are filled in
- On submit, opens the device's native SMS app with a pre-formatted order message to a designated phone number
- Success banner confirms the order was composed, prompting the user to tap send in their texts
- Success banner auto-dismisses after 4 seconds

---

## Tab: Crew

Resources for crew leaders (with a note that station leaders can skip this tab).

### Today's Icebreaker
- Mirrors the icebreaker from the Daily tab for the current day

### Crew Joke
- Rotating set of 10 jungle/animal-themed jokes
- Question is shown first; punchline hidden behind a "Reveal Punchline" button
- "Next Joke" button cycles through all jokes with a counter (e.g., 1/10)

### Rainforest Fact
- Rotating set of 12 educational rainforest facts
- "Next Fact" button cycles through all facts with a counter

### Crew Leader Tips
- 10 static coaching tips for crew leaders
- Each tip has an emoji icon and a one-sentence practical insight covering transitions, kid engagement, "Wow, God!" responses, God Sightings, and more

---

## Shared UI Components

| Component   | Description |
|-------------|-------------|
| `Tap`       | Touch-friendly pressable wrapper with scale-down feedback on press |
| `SCard`     | Surface card with border, rounded corners, and standard padding |
| `SecLabel`  | Section label in uppercase, spaced, muted — used as a visual divider |
| `Bar`       | Thin progress bar (4px height) with color fill and smooth transition |

---

## Animations

| Name        | Used for |
|-------------|----------|
| `splashIn`  | Logo bounce-in on splash screen |
| `splashText`| Text fade-up on splash screen |
| `tabFade`   | Page content fade-in on tab switch |
| `fadeUp`    | General fade-up entry animation |
| `livePulse` | Pulsing green "Live" dot |

---

## Data Counts

| Data type          | Count |
|--------------------|-------|
| VBS days           | 5     |
| Schedule slots     | 7     |
| Color groups       | 6     |
| Station rotations  | 5     |
| Crew jokes         | 10    |
| Rainforest facts   | 12    |
| Crew leader tips   | 10    |
| Hot drink options  | 9     |
| Cold drink options | 4     |
| Drink extras       | 7     |
| Drink sizes        | 3     |
