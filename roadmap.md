# VBS Leader Hub — Design Roadmap

Two focused improvement areas: (1) a stronger brand identity that feels hand-crafted for Rainforest Falls rather than generic, and (2) a complete Coffee tab rebuild inspired by how Starbucks structures their ordering flow.

---

## Problem Diagnosis

**Why it feels AI-made right now:**
- Every section uses the same `SCard` — same border radius, same padding, same subtle border. Nothing has visual weight variation.
- Transparent color fills (`rgba(20,184,154,0.14)`) make everything feel washed out and provisional rather than intentional.
- The layout is purely vertical lists. There's no hierarchy that says "this is more important than that."
- Typography does all the work — every label, title, and body is just a different font size. No use of background shapes, dividers, or spatial rhythm.
- The Now Banner is the most designed thing in the app but even it blends into the same visual language as everything else.

---

## Area 1 — Brand Identity Overhaul

### 1A. Richer Color Usage

Right now transparent fills are doing everything. The fix is to use them selectively and introduce opaque accent moments where they count.

**Changes:**
- Replace the uniform `rgba(accent, 0.14)` card backgrounds with a tiered approach:
  - Default cards: solid `#112018` (current `surface`) — no accent tint at all
  - Highlighted/active cards: use a slightly lighter surface (`#182E22`) with a left border in the accent color instead of a full background tint
  - Hero moments (Now Banner, Day header): use a real gradient with meaningful opacity, not the same subtle stripe on everything
- Reserve the teal accent (`#14B89A`) for two things only: interactive elements and "you are here" indicators. Stop using it as a background fill on informational cards.
- Give the brand gold (`#F0B429`) a real role — currently it's only used in the Coffee tab UI and daily accent. Use it more deliberately on the header wordmark or as a highlight on key numbers.

### 1B. Card Hierarchy — Stop Using One Card for Everything

The `SCard` component is applied to everything from a verse quote to a single line of text. The visual flatness comes directly from that.

**Proposed card tiers:**

| Tier | Use case | Treatment |
|------|----------|-----------|
| **Hero** | Now Banner, Day header | Full-bleed section with gradient bg, distinct from card grid below |
| **Feature** | Memory verse, Bible story | Slightly larger padding, left accent border in day color, no outer border |
| **Standard** | Reminders, tips | Current surface bg, but with a real 1px left border in a neutral color as a visual anchor |
| **Inline chip** | Icebreaker, small stats | Pill or tag shape rather than a full card — break the rectangular monotony |

### 1C. Section Dividers — Replace SecLabel with Visual Sections

The all-caps muted label (`SecLabel`) is fine, but dropping it directly above a card with no breathing room makes every section look identical. 

**Changes:**
- Add a thin horizontal rule with `opacity: 0.08` above each SecLabel
- Increase top margin before section labels to 28px (currently 20px) to give content more room to breathe
- On the Daily page specifically, consider a "chapter" visual metaphor: a thick colored bar on the left side of each section block tied to that day's accent color

### 1D. Typography Moments

**Changes:**
- The day Bible Point headline on the Daily tab (`God is our creator.`) should be significantly bigger — 32–36px — and treated as a display-size statement, not just another bold line
- Memory verse text should be set slightly larger (17px) in a true italic with more leading (1.8) — it's the most spiritually significant text on the page and currently reads like body copy
- Numbers used in tip/reminder lists are small colored boxes — make them actual large numerals (28–32px, low opacity) that sit behind or beside the text like a decorative element
- The "Wow, God!" response badge should feel special — give it a star or burst shape outline rather than a plain pill

### 1E. Now Banner Elevation

This is the best-designed thing in the app. Lean into it more.

**Changes:**
- Give it a true background image layer — a subtle SVG jungle texture or leaf silhouette at very low opacity (`3–5%`) that makes it feel distinct from the rest of the page
- The "Live Now" dot and label should sit in their own top bar within the banner, separated from the content below with a fine rule
- Progress bar should be taller (6–8px) with a glow effect on the filled portion matching the group color
- The mini all-groups grid during rotations should use a card grid with more contrast between "my group" and others — currently the distinction is subtle

### 1F. Bottom Nav Refinement

**Changes:**
- Replace the thin top indicator bar with a pill/capsule highlight behind the active tab icon (like iOS tab bars do)
- Slightly increase icon size to 24px
- Add a very subtle backdrop blur (`backdrop-filter: blur(12px)`) on the nav bar background to give it a frosted-glass feel that separates it from content

---

## Area 2 — Coffee Tab Rebuild

### Current Problem

The Coffee tab is a vertical form. It reads like a settings screen, not a café ordering experience. There's no sense of browsing or discovery. Sizes and extras feel like checkbox afterthoughts rather than meaningful choices. There's no price shown anywhere, so the order feels low-stakes and informal.

### New Flow: Browse → Customize → Review

Inspired by Starbucks Mobile Order, broken into three clear phases.

---

### Phase 1 — Browse (Menu Screen)

Replace the current category toggle + flat list with a **scrollable menu of individual drink cards**.

**Layout:**
- Two horizontal category chips at the top: ☕ Hot · 🧊 Cold
- Below, a **vertical list of drink cards** (not a grid — gives each item room)

**Drink card anatomy:**
```
┌─────────────────────────────────────┐
│  ☕  Caramel Macchiato              │
│      Rich espresso, steamed milk,   │
│      vanilla & caramel drizzle      │
│                              $5.50  │
│      [Customize →]                  │
└─────────────────────────────────────┘
```

Each drink needs:
- A meaningful emoji or icon (not all the same)
- A short 1-line description (flavor profile / what it is)
- A price
- A tap target that opens the customization screen

**Proposed Pricing (example — adjust to match actual café pricing):**

*Hot Drinks*

| Drink | 8 oz | 12 oz | 16 oz |
|-------|------|-------|-------|
| Americano | $3.00 | $3.75 | $4.50 |
| Latte / Cappuccino | $4.00 | $4.75 | $5.50 |
| Almond Milk Latte | $4.50 | $5.25 | $6.00 |
| Breve Latte | $4.75 | $5.50 | $6.25 |
| Mocha | $4.50 | $5.25 | $6.00 |
| Caramel Macchiato | $4.75 | $5.50 | $6.25 |
| Chai Tea Latte | $4.00 | $4.75 | $5.50 |
| London Fog | $4.00 | $4.75 | $5.50 |
| Hot Chocolate | $3.50 | $4.25 | $5.00 |

*Cold Drinks (all 16 oz)*

| Drink | Price |
|-------|-------|
| Italian Soda | $3.50 |
| Joe Chill | $4.50 |
| Chai Chill | $4.50 |
| Fruit Smoothie | $5.00 |

> **Note:** These are placeholder prices. Replace with actual café prices before launch.

---

### Phase 2 — Customize (Drink Detail Screen)

When a drink is tapped, slide in a **drink detail / customization view** (not a modal — a full sub-page within the tab).

**Sections on this screen:**

**Name field** — moved here from the top of the form. "Who's this for?" feels more natural in context.

**Size selector** (hot drinks only)
- Three large buttons arranged horizontally: **S · 8 oz**, **M · 12 oz**, **L · 16 oz**
- Visually show the difference — use three circle sizes (small, medium, large circle icons)
- Show the price for the selected size prominently (`$5.50`)
- Cold drinks skip this and show "16 oz" as a fixed chip

**Extras** — restructured as a proper add-ons section, not a flat grid:

```
Add-ons
─────────────────────────────────────
  + Extra Shot of Espresso   +$0.75
  + Extra Syrup Shot         +$0.50
─────────────────────────────────────
Snacks
─────────────────────────────────────
  + Biscotti                 +$1.50
  + Trail Mix                +$2.00
  + Mentos                   +$0.50
─────────────────────────────────────
Other
─────────────────────────────────────
  + Bottled Water            +$1.50
  + Hot Tea                  +$2.00
─────────────────────────────────────
```

Each extra is a row with the item name, price, and a `+` / checkmark toggle on the right. Not a grid of pills.

**Notes field** — small, at the bottom. Optional.

**Order Summary bar** — sticky at the bottom of this screen:
```
┌─────────────────────────────────────┐
│  Caramel Macchiato · M             │
│  + Extra Shot                $6.25 │
│         [Send Order via Text →]    │
└─────────────────────────────────────┘
```
- Shows drink name, size, any extras, and **running total**
- CTA button is always visible while you customize

---

### Phase 3 — Confirmation

After "Send Order via Text" is tapped:
- Opens SMS as today (same behavior)
- Return to the Coffee tab and show a **receipt-style confirmation card** instead of the green banner:

```
┌─────────────────────────────────────┐
│  ✓  Order Sent                     │
│                                     │
│  Caramel Macchiato                  │
│  Medium · 12 oz                     │
│  + Extra Shot of Espresso           │
│  For: Sarah                         │
│                         Total $6.25 │
│                                     │
│  [Order Another]  [Done]            │
└─────────────────────────────────────┘
```

- "Order Another" resets to the menu
- "Done" dismisses the card (stays on Coffee tab showing menu)

---

### Navigation Model for Coffee Tab

```
Coffee Tab
├── Menu Screen (default)
│   ├── [Hot] [Cold] category chips
│   └── Drink cards → tap to go to...
└── Drink Detail Screen (sub-page, not modal)
    └── [Send Order] → Confirmation card
```

Use a simple local `view` state (`'menu'` | `'detail'`) rather than a full router. The tab header gains a back chevron when in detail view.

---

## Implementation Priority

| Priority | Item | Effort |
|----------|------|--------|
| 1 | Coffee tab — browse screen with drink cards and prices | Medium |
| 2 | Coffee tab — detail/customize screen with size circles and add-on rows | Medium |
| 3 | Coffee tab — receipt confirmation card | Low |
| 4 | Card hierarchy overhaul — tiered SCard system | Medium |
| 5 | Daily tab — Bible Point display treatment | Low |
| 6 | Daily tab — Memory verse typography | Low |
| 7 | Now Banner — texture layer + taller progress bar | Low |
| 8 | Bottom nav — pill highlight + backdrop blur | Low |
| 9 | SecLabel / section dividers — breathing room | Low |
| 10 | "Wow, God!" badge redesign | Low |

---

## What Not to Change

- The color palette itself is strong — dark green/teal/gold reads as jungle without being literal
- The Oswald + Plus Jakarta Sans type pairing works well
- The group color system is clear and functional
- The live status logic and Now Banner concept are the best UX in the app — build around them, not against them
- The tab structure (Schedule, Daily, Coffee, Crew) maps well to real user needs
