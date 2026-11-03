# Lymbr — Design

**Version**: 1.0
**Created**: 2026-11-02
**Status**: Draft for review
**Related**: `specs.md` (user stories), `flows.md` (behaviour), `rules.md` §5 (UI rules)

This document defines how Lymbr looks, reads and feels: the visual direction, design tokens, components, and the layout of every main screen. Behaviour is defined in `flows.md`; this file only covers presentation.

---

## 1. Direction: the logbook

Lymbr should feel like a **well-kept training logbook**: ruled paper, clear handwriting turned into type, numbers you can scan at a glance. It is a tool you use between sets with sweaty hands, not a lifestyle app.

What that means in practice:

- **Numbers are the hero.** Weights, reps and dates are set large, in a monospaced face, aligned in columns.
- **Lines, not boxes.** Content is separated by hairline rules and spacing. Cards are rare.
- **Words, not icons.** Buttons and headers are text. Icons are allowed only where a word would be worse (§6).
- **One accent colour, used sparingly.** It marks what matters: a PR, the active state, a trained muscle.
- **Calm.** No confetti, no exclamation marks in system copy, no shaming. Progress is shown plainly.

### 1.1 What Lymbr must not look like

| Avoid | Do instead |
|---|---|
| An icon beside every header, button and list item | Text labels; icons only from the allow-list (§6) |
| Pill buttons, fully rounded cards, circular avatars | Radius 4, 6 or 8 only (§3.4) |
| Gradients, glass/blur panels, glow, neon | Flat colour, hairline rules |
| Purple-blue "AI" palettes | Warm paper and ink with one iron-oxide accent |
| Card inside card inside card | Rows on the page, divided by rules |
| Drop shadows on everything | No shadows except on sheets that float over content |
| Emoji and confetti for achievements | A typographic "PR" stamp and a short haptic |
| Hype copy ("Let's crush it! 💪") | Plain statements ("New best: 55 lb") |
| Illustrated empty states with mascots | One sentence and one action |
| Centred hero text and big marketing headers | Left-aligned, content first |
| Stock fitness photography | The user's own photos only |

---

## 2. Principles

1. **One-handed and fast.** The logging screen is designed for a thumb, between sets. Primary actions sit in the bottom half.
2. **Scan, don't read.** Columns line up; units always follow numbers; the same thing is always in the same place.
3. **Show history next to the present.** Last time sits beside this time, always.
4. **Quiet by default, loud for wins.** The accent appears only for PRs, active states and trained muscles.
5. **Never block on the network.** Offline status is a small line of text, not a dialog.
6. **Private looks private.** Visibility is always stated in words ("Private", "Friends"), never just implied.

---

## 3. Design tokens

All values live in one theme file (`apps/mobile/theme/tokens.ts`). Components must use tokens, never raw values. A lint rule rejects any `borderRadius` outside the radius tokens.

### 3.1 Colour

#### Light ("Paper")

| Token | Hex | Use |
|---|---|---|
| `bg` | `#F4F2ED` | App background (warm paper) |
| `surface` | `#FBFAF7` | Sheets, inputs, the rare card |
| `ink` | `#171714` | Primary text, primary buttons |
| `ink-2` | `#55534D` | Secondary text |
| `ink-3` | `#8A877F` | Tertiary text, placeholders, "Last time" |
| `rule` | `#DAD6CC` | Hairline dividers, input borders |
| `rule-strong` | `#B9B4A8` | Table header rules, focused borders |
| `accent` | `#D9541E` | PRs, active tab, selected state, heatmap peak |
| `accent-ink` | `#FFFFFF` | Text on accent |
| `accent-wash` | `#F7E3D8` | PR row background, selected row |
| `warn` | `#9A6B12` | Sync issues, "not available at this gym" |
| `danger` | `#A42A20` | Destructive confirmations only |

#### Dark ("Chalkboard")

| Token | Hex |
|---|---|
| `bg` | `#121210` |
| `surface` | `#1B1B18` |
| `ink` | `#ECE8DF` |
| `ink-2` | `#A8A499` |
| `ink-3` | `#75726A` |
| `rule` | `#2E2D29` |
| `rule-strong` | `#45433D` |
| `accent` | `#F06A2E` |
| `accent-ink` | `#121210` |
| `accent-wash` | `#3A2217` |
| `warn` | `#D9A441` |
| `danger` | `#E0675C` |

#### Muscle heatmap ramp (5 steps)

| Step | Meaning | Default guide 10–20 | Light | Dark |
|---|---|---|---|---|
| 0 | Not trained | 0 sets | `#E4E0D6` | `#2A2925` |
| 1 | Below half of guide min | under 5 | `#F2C9B2` | `#4A2A1B` |
| 2 | Half of guide min, up to min | 5 to under 10 | `#E99A72` | `#7A3A1E` |
| 3 | Within guide range (min–max) | 10–20 | `#D9541E` | `#C95424` |
| 4 | Above guide max | over 20 | `#8F3110` | `#F28A5A` |

Steps are relative to the user's volume guide (`profiles.volume_guide_min/max`), so changing the guide moves every boundary. Colour is never the only signal: every muscle also shows its set count in text.

**Contrast**: all text/background pairs meet WCAG AA (4.5:1 body, 3:1 large). `ink-3` is used only at 14 px and above.

### 3.2 Typography

Two families, both free (Google Fonts), bundled with the app:

- **Archivo** (variable, with width axis): headings in its condensed width, body text at normal width. Its narrow, slightly industrial shapes suit a gym logbook without being a cliché.
- **IBM Plex Mono**: every number that matters (weights, reps, dates in tables, stats), so columns align and figures read like a log.

| Token | Family | Size / line | Weight | Notes |
|---|---|---|---|---|
| `display` | Archivo Condensed | 40 / 44 | 700 | Rare: finish summary headline |
| `h1` | Archivo Condensed | 28 / 32 | 700 | Screen titles |
| `h2` | Archivo Condensed | 20 / 24 | 700 | Section titles, exercise names in session |
| `body` | Archivo | 16 / 22 | 400 | Default text |
| `body-strong` | Archivo | 16 / 22 | 600 | Emphasis, button labels |
| `small` | Archivo | 14 / 20 | 400 | Secondary text |
| `label` | Archivo | 12 / 16 | 600 | UPPERCASE, letter-spacing +0.06em. Column headers, section labels, tags |
| `num-l` | Plex Mono | 24 / 28 | 500 | Weight/reps being entered, key stats |
| `num-m` | Plex Mono | 16 / 20 | 400 | Set rows, table values |
| `num-s` | Plex Mono | 13 / 16 | 400 | "Last time", chart axes |

Rules:

- Sentence case for all buttons and titles ("Start session", not "Start Session"). UPPERCASE only for `label`.
- Units are set in the same style as their number, one space apart: `55 lb`, `24.9 kg`, `Stack 8`.
- Support Dynamic Type / font scaling up to 200%; tables wrap to two lines rather than truncating numbers.

### 3.3 Spacing and layout

- 4-point grid. Scale: `4, 8, 12, 16, 24, 32, 48`.
- Screen side gutter: 16.
- Row height: 48 minimum (touch target 44 + rule).
- Set rows in the logging table: 52 tall.
- Section spacing: 32 between sections, 12 between a section label and its content.
- Content is left-aligned. Numbers in tables are right-aligned within their column.

### 3.4 Corner radius

Only three values exist:

| Token | Value | Use |
|---|---|---|
| `r-sm` | 4 | Inputs, checkboxes, tags, calendar cells, avatars, photo thumbnails in grids |
| `r-md` | 6 | Buttons, segmented controls, toasts |
| `r-lg` | 8 | Bottom sheets (top corners only), the occasional card, full-size photos |

No pill shapes. No circles (avatars are squares with `r-sm`). Rows and tables have square corners.

### 3.5 Lines and elevation

| Token | Value |
|---|---|
| `hairline` | 1 px (`StyleSheet.hairlineWidth` on high-density screens), colour `rule` |
| `rule-heavy` | 2 px, colour `ink`. Under screen titles and table headers |
| `focus` | 2 px `ink` outline, offset 2 |
| `shadow-sheet` | Only on bottom sheets and the keypad: y 2, blur 12, black at 12% (light) / 40% (dark) |

Nothing else has a shadow.

### 3.6 Motion

- Durations: 120 ms (press feedback), 200 ms (sheets, row changes). Ease-out. No bounce or spring overshoot.
- PR: the row's accent bar slides in from the left (200 ms) and a light haptic plays. That's the whole celebration.
- Respect "Reduce motion": replace slides with instant changes.

---

## 4. Voice and copy

Plain, short, specific, calm. Lymbr talks like a training partner who writes things down, not a hype coach.

| Situation | Write | Don't write |
|---|---|---|
| PR | `New best: 55 lb` | `🎉 Amazing! You crushed a new PR!` |
| Streak | `12 weeks in a row` | `🔥 You're on fire!` |
| Goal missed | `0 of 4 this week` | `You missed your goal 😢` |
| Offline | `Saved on phone. Will sync.` | `Error: No connection!` |
| Sync problem | `2 changes couldn't sync. Review` | `Sync failed!!!` |
| Empty calendar | `No sessions yet. Start one from Today.` | `Your fitness journey starts here!` |
| Swap | `Not at this gym. Swap?` | `⚠️ Equipment unavailable` |
| Recovery | `Quads: about 2 days. Guide only.` | `Your quads need rest!` |
| Delete | `Delete this session? This can't be undone after 30 days.` | `Are you sure?` |

Buttons use verbs: `Start session`, `Add set`, `Swap`, `Finish`, `Save to plan`, `Keep plan as is`.

---

## 5. Components

Each component lists its anatomy, states and rules. All are text-first.

### 5.1 Buttons

| Variant | Look | Use |
|---|---|---|
| Primary | `ink` fill, `bg` text, `r-md`, 48 tall, `body-strong` | One per screen at most: `Start session`, `Finish`, `Add set` |
| Secondary | 1 px `ink` border, `ink` text, transparent | `Swap`, `Save as plan` |
| Text | `ink` text, underline on press | Low-emphasis actions: `Skip`, `Note`, `See all` |
| Destructive | Text button in `danger`; filled `danger` only inside the confirm sheet | `Delete session` |

States: pressed (background darkens 8% / underline), disabled (`ink-3` text, `rule` border), loading (label replaced by `Saving…`; no spinner icon).

No icons in buttons. The only exception is the `+` character in `+ Add set` / `+ Add exercise`, which is typed text, not an icon.

### 5.2 Inputs

- 48 tall, `surface` fill, 1 px `rule` border, `r-sm`. Focus: `rule-strong` border plus `focus` outline.
- Label above in `label` style. Helper/error text below in `small` (`danger` for errors, written as a sentence).
- Numeric inputs use the Lymbr keypad (§5.9), not the system keyboard, during sessions.

### 5.3 Segmented control

Used for units (`kg | lb | Stack`), visibility (`Private | Friends`), and ranges (`W | M | 3M | Y | All`).

- Container: 1 px `rule` border, `r-md`. Segments separated by hairlines.
- Selected segment: `ink` fill, `bg` text. Unselected: transparent, `ink-2` text.

### 5.4 Checkbox (set done)

- 28 × 28 square, 1.5 px `ink` border, `r-sm`.
- Checked: `ink` fill with a drawn check stroke in `bg`. This is the one glyph the logging table uses.
- Hit area extends to 48 × 52 (the full cell).

### 5.5 Tags

Small rectangular labels, `label` style, 1 px border, `r-sm`, padding 2 × 6.

| Tag | Style |
|---|---|
| `PR` | `accent` fill, `accent-ink` text |
| `W` / `D` / `F` (warm-up / drop / failure) | `rule-strong` border, `ink-2` text |
| `SWAPPED` (entry has `swapped_from_variation_id`) | `rule-strong` border, `ink-2` text |
| `SKIPPED` (entry `status = skipped`) | `ink-3` text, strikethrough on the exercise name |
| `PRIVATE` / `FRIENDS` | `ink-2` border and text |
| `NOT AT THIS GYM` | `warn` border and text |

### 5.6 Rows and tables

- Default list row: 48+ tall, content left, secondary value right, hairline below. Tappable rows show a pressed background (`accent-wash` at 50%), not a chevron.
- Table header: `label` style, `ink-2`, with `rule-heavy` underneath.
- Selected row: `accent-wash` background plus a 3 px `accent` bar on the left edge.

### 5.7 Section header

`label` text (UPPERCASE) with an optional text action on the right (`See all`), 12 below to content. No icon, no divider above (spacing does the work).

### 5.8 Bottom sheet

- `surface`, top corners `r-lg`, `shadow-sheet`, grab bar 32 × 4 (`rule-strong`, `r-sm`).
- Title in `h2`, left-aligned. Close with the `Done` / `Cancel` text button top-right, or swipe down.
- Used for: swap suggestions, set details (type/RPE/note), visibility, photo picker, filters.

### 5.9 Lymbr keypad

A custom number pad shown during sessions so logging never fights the system keyboard.

```
┌──────────────────────────────────────────┐
│  WEIGHT                          REPS      │
│  55 lb  ▏                        8         │
├──────────────────────────────────────────┤
│  kg │ lb │ Stack          −2.5    +2.5    │
├────────────┬────────────┬────────────────┤
│     1      │     2      │      3         │
│     4      │     5      │      6         │
│     7      │     8      │      9         │
│     .      │     0      │    Delete      │
├────────────┴────────────┴────────────────┤
│  Next                            Done      │
└──────────────────────────────────────────┘
```

- Step buttons use the variation's sensible increment: 2.5 kg / 5 lb, or 1 for stack.
- `Next` moves weight → reps → next set. `Done` closes.
- Keys are 56 tall, `r-sm`, hairline grid. `shadow-sheet` on the panel.

### 5.10 Toasts and banners

- **Sync line**: a single line under the screen title in `small`, `ink-3`: `Saved on phone. Will sync.` / `Synced 2 min ago`. Turns `warn` with a `Review` text action on problems.
- **Toast**: bottom, above the tab bar, `ink` fill, `bg` text, `r-md`, auto-dismiss 3 s, optional text action (`Undo`).

### 5.11 Avatars

Square, `r-sm`. Sizes 24 / 32 / 48. Fallback: the user's initials in `label` style on `rule` background. No circles.

### 5.12 Empty states

One sentence in `body`, `ink-2`, plus one text or secondary button. No illustrations, no icons.

### 5.13 Charts

- Line charts for top weight and volume; points drawn as small 4 × 4 squares.
- Hairline `rule` gridlines, axis numbers in `num-s` `ink-3`.
- No area fills, no gradients, no smoothing (straight segments; training data isn't smooth).
- Multiple variations: each line in a different style (solid, dashed, dotted) and labelled **directly at the line's end** with the variation name. No separate legend box.
- PR points marked with a small `PR` tag above the point.
- Tap a point to show a row below the chart: date, value, set (`Oct 28 · 55 lb × 8`).

### 5.14 Body map

- Flat front and back silhouettes side by side, drawn in `rule-strong` outline with muscle regions filled from the heatmap ramp.
- No 3D shading, no anatomical realism beyond clear regions.
- Below the map: a list of muscle groups with set counts and the guide range, e.g. `Chest   14 sets   (10–20)`, sorted by sets.
- Tapping a region highlights its row in the list, and vice versa.

---

## 6. Icon policy

Default: **no icons**. Text labels are clearer and more distinctive.

Allowed (each must also have an accessibility label):

| Glyph | Where | Why |
|---|---|---|
| Back chevron `‹` | Top-left of pushed screens | Platform convention; the word "Back" alone is ambiguous on iOS/Android |
| Check stroke | Set-done checkbox | A table of "Done" words would be unreadable |
| Drag handle (three short lines) | Reorder exercises in plan/session | Signals a gesture a word can't |
| Grab bar | Bottom sheets | Platform convention |

Not allowed: icons in tab bar, section headers, buttons, list rows, settings items, empty states, or notifications. The tab bar is text only (§7.1).

---

## 7. Navigation

### 7.1 Tab bar

Text-only, four tabs, `label` style. Active tab: `ink` text with a 2 px `accent` bar above it. Inactive: `ink-3`.

```
────────────────────────────────────────────
  TODAY      CALENDAR     PROGRESS    FRIENDS
  ▔▔▔▔▔
```

Profile and settings open from the user's initials avatar at the top-right of Today.

### 7.2 Active session bar

While a session is active, a slim bar sits above the tab bar on every other screen:

```
────────────────────────────────────────────
 IN SESSION   Push Day · Gym B · since 9:12    Open
────────────────────────────────────────────
```

It shows the start time, not a running timer (no timers anywhere in Lymbr, by design).

### 7.3 Screen map

```
Today ─┬─ Session (active) ─┬─ Swap sheet
       │                    ├─ Set details sheet
       │                    ├─ Add exercise (search)
       │                    └─ Finish → Summary
       ├─ Plans ─ Plan editor ─ Add exercise
       ├─ Gyms ─ Gym editor
       ├─ Body (weight, nutrition, recovery)
       └─ Profile / Settings ─ Export, Units, Notifications, Privacy, Account
Calendar ─ Day detail ─ Session detail
Progress ─┬─ Weekly muscles (heatmap, volume, recovery)
          ├─ Exercise ─ Variation
          └─ Body weight
Friends ─┬─ Feed ─ Friend's session ─ Comments
         ├─ Friend profile ─ Their plans ─ Plan detail (Copy)
         ├─ Requests / Add friend
         └─ Notifications
```

---

## 8. Screens

Wireframes show structure and hierarchy, not exact sizes. Characters like `│` and `─` represent hairline rules; `▏` is a text cursor.

### 8.1 Today

```
 Today                                         [WK]
 Monday, 2 November               Synced 2 min ago
════════════════════════════════════════════════
 THIS WEEK
 3 of 4 sessions                12 weeks in a row
 ■ ■ ■ □

 SCHEDULED TODAY
 Push Day                            6 exercises
 Last done Thu, 29 Oct · Gym A
 ┌──────────────────────────────────────────┐
 │              Start session               │
 └──────────────────────────────────────────┘
 Start empty session          Repeat last session

 RECOVERY                                See all
 Chest, triceps         Ready
 Quads, glutes          About 2 days
 Back                   Ready

 YOUR PLANS                              See all
 Push Day                              Mon, Thu
 Pull Day                              Tue, Fri
 Leg Day                            Unscheduled
────────────────────────────────────────────────
  TODAY      CALENDAR     PROGRESS    FRIENDS
```

- The week squares are filled `ink` per session, empty outlined; filled `accent` when the goal is met.
- If nothing is scheduled: "No plan scheduled today." with `Start session` opening a plan picker.

### 8.2 Session (logging) — the most important screen

```
 ‹  Push Day                                Finish
    Gym B · since 9:12        Saved on phone. Will sync.
════════════════════════════════════════════════
 1  Dumbbell Incline Press                    Swap
    SWAPPED from Smith Incline Press
    Last time  Oct 28 · 50 lb × 10, 10, 9

    SET   PREVIOUS      WEIGHT      REPS   RPE   ✓
    ─────────────────────────────────────────────
    W     30 lb × 12    30 lb       12      –   ☑
    1     50 lb × 10    55 lb        8      8   ☑   ▌PR
    2     50 lb × 10    55 lb        ▏          ☐
    3     50 lb × 9                             ☐
    + Add set                               Note
────────────────────────────────────────────────
 2  Machine Chest Press                       Swap
    Last time  Oct 28 · Stack 9 × 10, 10, 10
    …
────────────────────────────────────────────────
 3  Cable Fly                                 Swap
    NOT AT THIS GYM
────────────────────────────────────────────────
 + Add exercise                     Reorder
```

- **Previous column** shows the matching set from last time in `num-s` `ink-3`.
- **Weight cell** shows value and unit together. Tapping opens the keypad; the unit switch is on the keypad.
- **Set number cell**: tap to open the set details sheet (type W/D/F, RPE or RIR, note). Shows `W`, `D`, `F` letters for non-working sets.
- **PR row**: `accent-wash` background, 3 px `accent` left bar, `PR` tag. Light haptic.
- **Skipped exercise** (`status = skipped`): name struck through in `ink-3`, `SKIPPED` tag, collapsed to one line, `Undo` text action.
- **Added exercise** (`origin = added`): looks like any other entry; the origin only matters when saving changes to the plan.
- Long-press an exercise name for: Skip, Remove, Move up/down, Change variation.
- The keypad covers the lower half while entering; the current row scrolls into view above it.

### 8.3 Swap sheet

```
 ────
 Swap Smith Incline Press                     Done
 Gym B
════════════════════════════════════════════════
 FROM YOUR PLAN
 Dumbbell Incline Press                 50 lb × 10
 Last done Oct 28

 AVAILABLE HERE
 Machine Incline Press                Stack 8 × 10
 Incline Barbell Press                  Never done

 SAME MUSCLES
 Low-to-High Cable Fly                  Never done
 Incline Push-up                        Bodyweight
────────────────────────────────────────────────
 Search all exercises
```

Each row: variation name, and on the right the user's last result or `Never done`. Tapping a row swaps and closes.

### 8.4 Finish summary

```
 Push Day                                     Done
 Mon, 2 Nov · 9:12–10:20 · Gym B
════════════════════════════════════════════════
 2 new bests
 ▌PR  Dumbbell Incline Press   Heaviest   55 lb
 ▌PR  Dumbbell Incline Press   Volume     1,330 lb

 6 exercises · 21 sets · 1 swapped · 1 skipped

 MUSCLES
 [ front body map ]   [ back body map ]
 Chest 8   Front delts 6   Triceps 7

 ─────────────────────────────────────────────
 You changed this session from your plan.
 ┌────────────────────┐  ┌────────────────────┐
 │  Keep plan as is   │  │    Save to plan    │
 └────────────────────┘  └────────────────────┘

 PHOTOS                                    0 of 5
 Add photo

 NOTES
 [                                          ]

 BODY WEIGHT (OPTIONAL)
 [ 72.4 ]  kg │ lb

 VISIBILITY
 Private │ Friends
 Only you can see this session.
```

- "Keep plan as is" is the primary (filled) button, matching the default of No.
- Visibility helper text changes with the selection: "Only you can see this session." / "Your friends can see this session. Photos stay private unless you share them."
- Photos appear as a row of square thumbnails (`r-sm`); the cover has a `COVER` tag; each has `Private`/`Friends` under it.

### 8.5 Calendar

```
 Calendar                               November 2026
════════════════════════════════════════════════
  M     T     W     T     F     S     S
 ┌───┐ ┌───┐       ┌───┐
 │img│ │ P │       │img│               ·
 └───┘ └───┘       └───┘
 ┌───┐       ┌───┐ ┌ ─ ┐       ┌ ─ ┐
 │ L │       │img│   P             L
 └───┘       └───┘ └ ─ ┘       └ ─ ┘
 …
────────────────────────────────────────────────
 9 sessions this month · 4 of 4 weeks met
```

- Square cells, `r-sm`, 2 px gaps. Swipe horizontally between months; `‹ ›` text month arrows are not used, the month name opens a month/year picker.
- **Session with cover photo**: photo fills the cell; the date number sits top-left in `num-s` on a small `bg` tab.
- **Session without photo**: `surface` fill, the plan's first letter in `num-m` (`P`, `L`), or `·` for an empty session.
- **Several sessions in a day**: cover of the first, plus a small `2` in the corner.
- **Scheduled upcoming day**: dashed `rule-strong` outline with the plan letter in `ink-3`.
- **Today**: 2 px `ink` underline under the date.

### 8.6 Day detail

```
 ‹  Monday, 2 November
════════════════════════════════════════════════
 [ photo ][ photo ][ photo ]

 Push Day                              FRIENDS
 9:12–10:20 · Gym B · 3 likes · 1 comment

 Dumbbell Incline Press           SWAPPED   PR
   W  30 lb × 12
   1  55 lb × 8     RPE 8
   2  55 lb × 7
 Machine Chest Press
   1  Stack 9 × 10
   …

 BODY WEIGHT      72.4 kg
 NUTRITION        2,450 kcal · 160 g protein
 NOTES            Felt strong. Smith was taken.

 Edit session        Repeat        Save as plan
```

### 8.7 Progress

```
 Progress
════════════════════════════════════════════════
 THIS WEEK'S MUSCLES                      See all
 [ front map ]  [ back map ]
 Chest 14   Back 9   Quads 0   …

 EXERCISES
 Search exercises
 Chest Press                 3 variations   Oct 28
 Squat                       2 variations   Oct 27
 Lat Pulldown                1 variation    Oct 26

 BODY WEIGHT                        72.4 kg  −0.8
 [ small line chart, 3 months ]
```

### 8.8 Exercise and variation progression

```
 ‹  Chest Press
════════════════════════════════════════════════
 W │ M │ 3M │ Y │ All
 Top weight │ Volume

 [ line chart ]
   ────────────────────────── Machine (Stack)
   - - - - - - - - - - - ─── Dumbbell (lb)
   · · · · · · · · · · · ─── Smith (kg)

 Since 2 Aug: Dumbbell +10 lb · Smith +7.5 kg

 VARIATIONS
 Machine Chest Press        Best Stack 10   Oct 28
 Dumbbell Incline Press     Best 55 lb      Nov 2
 Smith Incline Press        Best 60 kg      Oct 21
```

Variation screen: the same chart for one variation, then `PERSONAL BESTS` (heaviest, best volume) and a `REPS AT WEIGHT` table:

```
 REPS AT WEIGHT
 WEIGHT     BEST REPS   DATE
 ─────────────────────────────
 45 lb      12          Sep 30
 50 lb      10          Oct 28
 55 lb       8          Nov 2
```

### 8.9 Weekly muscles and recovery

```
 ‹  This week's muscles              27 Oct – 2 Nov
════════════════════════════════════════════════
 [ front map ]  [ back map ]
 Not trained ■ Under 5 ■ Under 10 ■ 10–20 ■ Over 20

 MUSCLE        SETS   GUIDE    RECOVERY
 ─────────────────────────────────────────
 Chest          14    10–20    Ready
 Quads          12    10–20    About 2 days
 Triceps         7    10–20    Ready
 Hamstrings      3    10–20    About 1 day
 Calves          0    10–20    –

 HOW DO YOU FEEL?
 Readiness   1 │ 2 │ 3 │ 4 │ 5
 Sore muscles                              Add

 Recovery times are a guide based on volume and
 how you feel. Not medical advice.
```

The legend numbers come from the user's guide range (shown here for the default 10–20).

Tapping a muscle's recovery opens a sheet with the reasons ("Heavy session Sat · 2 sets to failure · soreness 3: +48 h") and `Mark as recovered` / `Mark as not recovered`.

### 8.10 Plan editor

```
 ‹  Push Day                                  Save
════════════════════════════════════════════════
 Name   [ Push Day                            ]

 SCHEDULE (OPTIONAL)
 M  T  W  T  F  S  S          Reminder   Off │ On
 ■  □  □  ■  □  □  □

 EXERCISES
 ≡  Smith Incline Press        3 × 8–10
    Also: Dumbbell Incline Press, Machine Incline
 ≡  Machine Chest Press        3 × 10–12
 ≡  Cable Fly                  3 × 12–15
 + Add exercise

 VISIBILITY
 Private │ Friends
```

Day toggles are square `r-sm` cells with the letter inside, `ink` fill when selected.

### 8.11 Gym editor

```
 ‹  Gym B                                     Save
════════════════════════════════════════════════
 Name   [ Gym B                               ]

 EQUIPMENT                          12 selected
 Search equipment
 ☑ Barbell                ☑ Dumbbells
 ☐ Smith machine          ☑ Cable station
 ☑ Leg press              ☐ Hack squat
 …
 + Add custom equipment

 Learned from your sessions: Pec deck, Hip thrust machine
```

### 8.12 Friends: feed

```
 Friends                                 Requests 1
 Feed │ Friends │ Notifications
════════════════════════════════════════════════
 [AN] Ana                               Today 8:40
 Pull Day · Gym A · 62 min
 5 exercises · 18 sets · 1 PR
 Lat Pulldown   PR  70 kg × 8
 [ cover photo, full width, r-lg ]
 Like · 4          Comment · 2
────────────────────────────────────────────────
 [MI] Mico                          Yesterday 19:10
 12 weeks in a row
 Like · 6          Comment
────────────────────────────────────────────────
```

- No cards: posts are separated by hairlines.
- `Like · 4` is a text toggle; when liked it reads `Liked · 5` in `accent`.
- No like counts are compared or ranked anywhere.

### 8.13 Friend's session

Same layout as Day detail (§8.6), read-only, with:

- Comments below, newest last, input pinned at the bottom.
- `Copy plan` text action if the session came from a plan the friend shared.
- Hidden gym shows nothing (no "Gym hidden" label).

### 8.14 Friend profile

```
 ‹  Ana
════════════════════════════════════════════════
 [AN]  Ana  @ana
       Friends since Oct 2026
       8 weeks in a row          (only if public)

 SHARED PLANS
 Pull Day                    5 exercises    View
 Upper Body                  7 exercises    View

 RECENT SHARED SESSIONS
 …
                                   Remove friend
```

### 8.15 Onboarding

One question per screen, large `h1`, input, `Continue` primary button, `Skip` text button. Progress shown as text: `2 of 6`. Screens: username → height → weight → units → weekly goal → week start.

### 8.16 Settings

Plain grouped list, text only:

```
 UNITS            Default kg · Charts kg
 WEEK             Starts Monday · Goal 4
 STREAK           Private
 VOLUME GUIDE     10–20 sets per muscle
 NOTIFICATIONS    Likes, comments, requests
 YOUR DATA        Export
 ACCOUNT          Sign out · Delete account
 ABOUT            Exercise data from wger.de (licence)
```

---

## 9. Accessibility

- Touch targets ≥ 44 × 44; set rows 52 tall.
- Every allowed icon has an accessibility label; checkboxes announce "Set 2, 55 pounds, 8 reps, done".
- Colour is never the only signal: PRs have a `PR` tag, heatmap has numbers, visibility is written out.
- Supports font scaling to 200%, VoiceOver and TalkBack, Reduce Motion, and both light and dark modes (follows system, overridable in settings).
- Units are spoken in full by screen readers ("55 pounds", "Stack 8").

---

## 10. Implementation notes

- Tokens: `apps/mobile/theme/tokens.ts` (colours for both modes, type, spacing, radius, motion). Components read only from tokens.
- Lint rule: flag `borderRadius` values other than 4, 6, 8 (and 0), and flag icon library imports outside the allow-listed components.
- Fonts: Archivo (variable) and IBM Plex Mono, bundled via `expo-font`; use tabular figures everywhere numbers align.
- Body map: one SVG per side with an `id` per region matching `muscle_groups.svg_region_ids` (`data-model.md` §4.2). Artwork needs to be drawn or licensed (open item in `architecture.md`).
- Charts: whichever library is chosen must support straight segments, dashed series, custom point shapes and direct end labels; otherwise draw with `react-native-svg`.
- Build a small in-app component gallery screen (dev builds only) showing every component in both modes, to check the rules above.

## 11. Open design items

- Final accent check on real devices outdoors (gym lighting is harsh); adjust `accent` if it washes out.
- Body map artwork style (outline weight, region detail).
- App icon and wordmark for Lymbr: should follow the same logbook direction (type-based mark, no gradients).
