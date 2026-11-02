# Feature Specification: Lymbr — Flexible Social Workout Tracker

**Feature Branch**: `001-social-workout-tracker`
**Created**: 2026-11-02
**Status**: Ready for planning
**Owner**: Whi
**Input**: "I need a workout tracker app to structure my workouts in a social manner. Gyms can be crowded and different gyms have different machines, so I need to be flexible: log weights, sets and reps per exercise *variation*, follow plans but swap exercises for the day without rewriting the plan, see a calendar with photos, track progression, see which muscles I hit and how long to recover, and share with friends."

---

## Overview

**Lymbr** is a mobile workout tracker. Most workout trackers assume you do the same fixed exercises every session. This app assumes the opposite: **the plan is a guide, the gym decides the day.** Every exercise has *variations* (Smith press, machine press, dumbbell press…), each with its own weight history, and any session can deviate from its plan without changing the plan itself.

The first release is for Whi and a small group of friends to test. Social features are **friends-only and private by default**. A public community is a later phase.

### Guiding principles (input for `/speckit-constitution`)

1. **Flexibility over rigidity.** A deviation from a plan is normal, never an error.
2. **Variation-level truth.** Weights and progression are tracked per variation, rolled up to the exercise.
3. **Private by default.** Nothing is visible to others until the user chooses to share it.
4. **Supportive, not competitive.** No leaderboards or rankings. Motivation comes from your own progress, streaks and friends' encouragement.
5. **Gym-proof.** Logging must work fully offline and sync later.
6. **Fast logging.** Logging a set during a workout should take seconds.

---

## Clarifications

### Session 2026-11-02

- Q: What does "social" mean for v1? → A: Friends follow each other, see a friends-only feed of sessions, and share plans. Everything private by default. Public community is a later phase.
- Q: Who are the users? → A: Whi and friends, as a test group.
- Q: Platform? → A: Mobile app (React Native + TypeScript; NestJS or Express backend; Supabase).
- Q: Offline? → A: Must work offline and sync later.
- Q: Exercise model? → A: Exercise → many Variations. Each variation has its own weight/progression history; progress is also viewable at the exercise level. Users can create custom variations.
- Q: Gym profiles? → A: Yes. Used to suggest variations available at the current gym.
- Q: Exercise API? → A: Use the best free option. wger was chosen (free, no auth for public data, includes muscle and equipment data).
- Q: Set detail? → A: Set type, effort rating (RPE/RIR) and per-set notes. **No rest timer.**
- Q: Units? → A: Units can be mixed within a session and even within an exercise (e.g., dumbbells in lbs, cable in kg, plates in kg, machines in lbs).
- Q: Height/weight? → A: Tracked over time. Logging is optional, at any cadence (per session, weekly, monthly, yearly).
- Q: Nutrition? → A: Per day, optional, typed manually.
- Q: Photos? → A: Up to 5 per session. Private by default with a toggle to make visible to friends. One is marked as the cover/thumbnail.
- Q: Progress metrics? → A: Top weight, total volume, PRs, and rep PRs at a given weight.
- Q: Recovery? → A: A simple research-based rule as a guide, adjustable by the user's own soreness and readiness input.
- Q: Social features? → A: Friends' feed, likes and comments, copying a friend's plan, streaks, gym buddies. **No leaderboards.**
- Q: Should plans have a schedule? → A: Optional, at the user's discretion. A plan can be scheduled to days of the week or left unscheduled and picked manually.
- Q: Can friends see streaks? → A: Only if the user makes their streak visible to friends. Private by default.
- Q: App name? → A: **Lymbr**.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Log a session from a plan with "Today's Swap" (Priority: P1)

Whi starts a session from his "Push Day" plan. The Smith machine is taken, so he swaps "Smith Incline Press" for "Dumbbell Incline Press" for today only, skips cable flyes, adds a machine he found, and logs each set. His "Push Day" plan stays exactly as it was.

**Why this priority**: This is the reason the app exists. Without flexible logging there is no product.

**Independent Test**: Create a plan, start a session from it, swap/skip/add/reorder exercises, log sets, finish. Verify the session records what was actually done and the plan is unchanged.

**Acceptance Scenarios**:

1. **Given** a saved plan, **When** the user starts a session from it, **Then** the session is pre-filled with the plan's exercises, variations and target sets/reps, ready to log.
2. **Given** an active session, **When** the user swaps a variation for another, **Then** only today's session changes and the plan keeps its original variation.
3. **Given** an active session, **When** the user skips, adds, or reorders exercises, **Then** those changes apply to this session only.
4. **Given** a finished session that deviated from its plan, **When** the user taps Finish, **Then** they are asked "Save these changes to the plan?" with **No** as the default, and choosing Yes updates the plan.
5. **Given** no plan, **When** the user starts an empty session, **Then** they can add exercises freely and log normally.
6. **Given** the user is logging a set, **When** they enter weight, unit, reps, set type, optional effort rating (RPE/RIR) and optional note, **Then** the set is saved immediately (including offline).
7. **Given** no network connection, **When** the user logs an entire session, **Then** everything is saved on the device and syncs automatically when the connection returns.

---

### User Story 2 — Exercise library and variations (Priority: P1)

Whi searches "chest press" and sees exercises from the library with their muscles and equipment. He adds "Hammer Strength Chest Press" as a custom variation under "Chest Press".

**Why this priority**: Plans and logs depend on exercises and variations existing.

**Independent Test**: Search the library, add an exercise to the user's list, create a custom variation, and confirm it can be used in a plan and a session.

**Acceptance Scenarios**:

1. **Given** the user searches by name, muscle, or equipment, **When** results load, **Then** each result shows name, primary/secondary muscles, equipment, and an image when available.
2. **Given** an exercise, **When** the user views it, **Then** they see all its variations (library and custom) and the history for each.
3. **Given** an exercise, **When** the user creates a custom variation (name, equipment, optional muscles override, optional default unit), **Then** it is available in plans and sessions with its own history.
4. **Given** no network, **When** the user searches, **Then** results come from the locally cached library and the user's own exercises/variations.
5. **Given** an exercise not in the library, **When** the user creates a fully custom exercise, **Then** they must choose at least one primary muscle so it counts toward muscle tracking.

---

### User Story 3 — Create and manage plans (Priority: P1)

Whi builds "Push Day", "Pull Day" and "Leg Day" plans. Each lists exercises with a preferred variation, alternative variations, and target sets/reps.

**Why this priority**: Plans are the starting point for most sessions.

**Independent Test**: Create, edit, duplicate, reorder and delete a plan; start a session from it.

**Acceptance Scenarios**:

1. **Given** the plan editor, **When** the user adds exercises, **Then** each entry stores a preferred variation, optional alternative variations, target sets, target rep range, and optional notes.
2. **Given** a plan, **When** the user edits, duplicates, or deletes it, **Then** past sessions that used it remain intact and readable.
3. **Given** a plan, **When** the user views it, **Then** they see which muscles it trains.
4. **Given** a plan, **When** the user optionally assigns it to days of the week (e.g., Push on Mon/Thu), **Then** the home screen suggests that plan on those days and the calendar shows upcoming scheduled days as faint markers.
5. **Given** a scheduled plan, **When** the user trains a different plan or nothing that day, **Then** nothing is marked as "missed" or failed; the schedule is only a suggestion.
6. **Given** a plan with no schedule, **Then** it behaves as a manually picked plan with no reminders.

---

### User Story 4 — Onboarding and body metrics over time (Priority: P1)

On first launch Whi enters his height, weight and preferred default unit. Later he logs body weight whenever he wants and sees a trend chart.

**Why this priority**: Required by the brief and used by recovery and volume context.

**Independent Test**: Complete onboarding, log several body-weight entries on different dates, view the chart.

**Acceptance Scenarios**:

1. **Given** a new account, **When** onboarding runs, **Then** the user is asked for height, current weight, default weight unit, and a weekly session goal. Each can be skipped and edited later.
2. **Given** any day, **When** the user logs body weight (optionally with a session), **Then** it appears on a body-weight chart filterable by week, month, year, and all time.
3. **Given** body metrics, **Then** they are always private and never appear in the feed.

---

### User Story 5 — "Last time" display and PR celebration (Priority: P2)

While logging Dumbbell Incline Press, Whi sees what he did last time on that exact variation. When he beats his best, the app celebrates the PR.

**Why this priority**: Turns logging into progressive overload with no extra effort.

**Independent Test**: Log a variation twice. Confirm the second session shows the first session's sets, and that beating a record triggers a PR.

**Acceptance Scenarios**:

1. **Given** a variation with history, **When** it appears in a session, **Then** the last session's sets (weight, unit, reps, set type) for **that variation** are shown, plus the date and gym.
2. **Given** a logged working set, **When** it beats a record for that variation, **Then** a PR celebration is shown and the set is marked as a PR. Record types: heaviest weight, best reps at a given weight (rep PR), and best session volume.
3. **Given** warm-up sets, **Then** they never count toward PRs.
4. **Given** sets logged in different units, **Then** PR comparisons are made after converting to a common unit.

---

### User Story 6 — Calendar with photo previews and day details (Priority: P2)

Whi opens the calendar and sees thumbnails on days he trained. Tapping a day shows what he did, photos, notes, and that day's nutrition.

**Why this priority**: Core way to review history, explicitly requested.

**Independent Test**: Log sessions on several days with and without photos; verify the month view and day details.

**Acceptance Scenarios**:

1. **Given** sessions with a cover photo, **When** the user opens the month view, **Then** those days show the cover thumbnail.
2. **Given** sessions without photos, **Then** the day shows a marker (e.g., a dot or the plan's initial/colour).
3. **Given** a day is tapped, **When** details open, **Then** they show each session (plan name, gym, duration, exercises with variations and sets, PRs, notes, photos, body weight and nutrition if logged).
4. **Given** a past date, **When** the user logs a session for it (back-dating), **Then** it appears on that date.
5. **Given** up to 5 photos per session, **When** the user marks one as cover, **Then** it becomes the calendar thumbnail.

---

### User Story 7 — Progression tracking (Priority: P2)

Whi checks how his Machine Chest Press has improved over 3 months, then views all Chest Press variations together.

**Why this priority**: Progress visibility is a key goal.

**Independent Test**: With logged history, open progression for a variation and its parent exercise across several time ranges.

**Acceptance Scenarios**:

1. **Given** a variation, **When** the user opens progression, **Then** they see charts for top weight, total volume, and a PR list (including rep PRs at each weight).
2. **Given** a parent exercise, **When** the user opens progression, **Then** each variation is shown as its own series and can be toggled; values are never merged into one misleading line.
3. **Given** a time range (week, month, 3 months, year, all time, or custom), **Then** charts and a "change since" summary (e.g., "+7.5 kg top weight, +12% volume") update.
4. **Given** mixed units, **Then** charts display in the user's chosen display unit.

---

### User Story 8 — Gym profiles and swap suggestions (Priority: P2)

Whi has "Gym A" (has Smith machine) and "Gym B" (no Smith, more dumbbells). When he starts Push Day at Gym B, the app suggests replacements for unavailable variations. When a machine is taken mid-session, he taps "Swap" and gets suggestions for the same muscles.

**Why this priority**: The core differentiator: being flexible across gyms and crowds.

**Independent Test**: Create two gyms with different equipment, start the same plan at each, verify suggestions differ appropriately.

**Acceptance Scenarios**:

1. **Given** the gym profile screen, **When** the user creates a gym, **Then** they can set its name and the equipment available (from a standard list plus custom items).
2. **Given** a session started at a gym, **When** a plan variation needs equipment the gym lacks, **Then** it is flagged and swap suggestions are offered (plan alternatives first).
3. **Given** the user taps Swap on any exercise, **Then** suggestions are ranked: (a) the plan's listed alternatives, (b) variations of the same exercise available at this gym, (c) other exercises with the same primary muscles available at this gym, and (d) variations the user has history with rank higher.
4. **Given** a gym with no equipment set, **Then** suggestions are not filtered by equipment.
5. **Given** a variation was used at a gym, **Then** the app remembers that it's available there.

---

### User Story 9 — Muscle heatmap, weekly volume and recovery (Priority: P2)

After his session, Whi sees a body map showing which muscles he hit, plus a weekly view of sets per muscle and an estimate of when each muscle is recovered. His legs are still sore, so he marks them as such and the estimate extends.

**Why this priority**: Explicitly requested; guides what to train next.

**Independent Test**: Log sessions hitting different muscles; check the session map, weekly heatmap, set counts, and recovery estimates; enter soreness and confirm the estimate changes.

**Acceptance Scenarios**:

1. **Given** a session, **When** the user views its summary, **Then** a front/back body map highlights primary muscles strongly and secondary muscles lightly.
2. **Given** the current week, **When** the user views the weekly heatmap, **Then** each muscle group's colour reflects weekly working sets, and a list shows sets per muscle against a guide range (default 10–20 working sets per muscle per week, editable).
3. **Given** a muscle was trained, **Then** a recovery estimate is shown ("~2 days until recovered") based on the default rule (see FR-074).
4. **Given** the user records soreness (per muscle, 0–3) or overall readiness (1–5), **Then** recovery estimates adjust and the adjustment is shown, so the user understands why.
5. **Given** the user disagrees with an estimate, **When** they mark a muscle "recovered" or "not recovered", **Then** their input overrides the estimate.
6. The app MUST present recovery as **guidance, not medical advice**.

---

### User Story 10 — Streaks and weekly goal (Priority: P2)

Whi sets a goal of 4 sessions a week. The app shows progress this week and his streak of weeks hitting the goal.

**Why this priority**: Requested motivation loop that respects rest days.

**Independent Test**: Set a goal, log sessions across weeks, check progress and streak counting.

**Acceptance Scenarios**:

1. **Given** a weekly goal, **Then** the home screen shows "2 / 4 sessions this week".
2. **Given** consecutive weeks meeting the goal, **Then** the streak counts in **weeks**, so rest days never break it.
3. **Given** the goal is changed mid-week, **Then** the new goal applies from the current week.
4. **Given** the user's week start setting (default Monday), **Then** weeks are calculated in the user's timezone.
5. **Given** streak visibility is Private (default), **Then** no one else can see the user's streak or weekly goal progress.
6. **Given** the user sets streak visibility to Friends, **Then** friends see the streak on the user's profile and a feed post when a streak milestone is reached (e.g., 4, 12, 26, 52 weeks), with no ranking against others.

---

### User Story 11 — Friends, feed, likes and comments (Priority: P2)

Whi adds his friends. When a friend shares a session, it appears in his feed; he likes it and comments. Sessions he didn't share are invisible to everyone.

**Why this priority**: The "social" goal. Needed for the friend test group, but the app is usable alone without it.

**Independent Test**: Two accounts become friends; one shares a session and one keeps a session private; verify feed visibility, likes and comments.

**Acceptance Scenarios**:

1. **Given** a user, **When** they search by username or open an invite link, **Then** they can send a friend request; friendship requires acceptance (mutual).
2. **Given** a new session, **Then** its visibility defaults to **Private**; the user can set it to **Friends** at finish or later.
3. **Given** a session shared with Friends, **Then** friends see it in their feed: plan name, exercises/variations, sets, PRs, duration, and gym name (gym can be hidden).
4. **Given** session photos, **Then** each photo has its own visibility toggle (default private), so a shared session can still hide photos.
5. **Given** a feed item, **When** a friend likes or comments, **Then** the owner gets a notification; the owner can delete any comment on their session; commenters can edit/delete their own.
6. **Given** a user unfriends or blocks someone, **Then** that person immediately loses access to their shared content.
7. The feed MUST NOT show rankings, leaderboards, or comparisons between users.

---

### User Story 12 — Share and copy plans (Priority: P2)

Whi shares "Push Day" with a friend, who copies it into their own plans and adjusts it.

**Why this priority**: Explicitly requested social feature.

**Independent Test**: Share a plan to a friend; the friend copies it; edits on either side don't affect the other.

**Acceptance Scenarios**:

1. **Given** a plan, **When** the user shares it with a friend (or marks it visible to all friends), **Then** friends can view it.
2. **Given** a friend's plan, **When** the user taps "Copy to my plans", **Then** an independent copy is created, including custom variations (copied as the recipient's own custom variations), with credit "Copied from @friend".
3. **Given** a copied plan, **Then** later changes by either user never affect the other.

---

### User Story 13 — Templates from history (Priority: P2)

Whi had a great improvised session last Tuesday. He repeats it in one tap, or saves it as a new plan.

**Why this priority**: Makes improvised sessions reusable, matching the flexible style.

**Independent Test**: Open a past session, tap "Repeat" and "Save as plan".

**Acceptance Scenarios**:

1. **Given** a past session, **When** the user taps "Repeat", **Then** a new session starts with the same exercises and variations (and "Last time" pre-filled).
2. **Given** a past session, **When** the user taps "Save as plan", **Then** a new plan is created from it.

---

### User Story 14 — Gym buddies (Priority: P3)

Whi and a friend train together. Whi tags the friend in the session; the friend gets an invite to add it to their own log.

**Why this priority**: Nice social touch, not essential to testing the core loop.

**Independent Test**: Tag a friend in a session; the friend accepts and gets a session copy with exercises but no sets/weights.

**Acceptance Scenarios**:

1. **Given** an active or finished session, **When** the user tags friends as gym buddies, **Then** each tagged friend gets an invite.
2. **Given** a friend accepts, **Then** they get a new session on the same date with the same exercises/variations and empty sets to fill in with their own numbers.
3. **Given** a shared session with buddies, **Then** the feed shows "Trained with @friend".

---

### User Story 15 — Daily nutrition (optional) (Priority: P3)

On days he wants to, Whi types in calories and protein.

**Why this priority**: Optional and requested as user's discretion.

**Independent Test**: Log nutrition for a day; see it in day details and a simple trend.

**Acceptance Scenarios**:

1. **Given** any day, **When** the user enters calories, protein, carbs, fat (all optional) and a note, **Then** it is saved to that day.
2. **Given** nutrition entries, **Then** they appear in day details and in a simple trend chart, and are always private.

---

### User Story 16 — Data export (Priority: P3)

Whi exports all his data.

**Why this priority**: Data ownership; not needed for daily use.

**Independent Test**: Export and open the file; it contains all sessions, sets, plans, body metrics and nutrition.

**Acceptance Scenarios**:

1. **Given** the settings screen, **When** the user requests an export, **Then** they receive CSV (sets as rows) and JSON (full data) files via the system share sheet.
2. **Given** an export, **Then** weights include both the original value and unit.

---

### Edge Cases

- **Mixed units in one exercise**: dumbbell sets in lbs and cable sets in kg within one session. Each set keeps its own unit; totals and PRs convert to a common unit (1 lb = 0.45359237 kg); display shows the original value.
- **Machine weights with no real unit** (stack "plate 8"): allow a "stack level" unit, which is compared only with itself and excluded from cross-unit conversion.
- **Bodyweight exercises** (pull-ups, dips): weight = bodyweight + added weight; **assisted** variations use negative assistance. Volume uses the most recent body weight if available.
- **Non-weight exercises**: planks (duration), cardio (duration/distance), reps-only exercises. Set metrics depend on the variation's tracking type.
- **Unilateral exercises**: option to log left/right reps separately or "per side".
- **Same variation twice in one session**: allowed; both count toward volume.
- **Plan deleted or edited after sessions**: past sessions keep a snapshot of what was done.
- **Library exercise renamed or removed upstream**: the app keeps its own copy; history is never lost.
- **Offline edits on two devices** to the same session: last-write-wins per set, with conflicts never deleting sets silently.
- **Session left open** (forgot to finish): auto-prompt after a set time (e.g., 4 hours); duration capped and editable.
- **Session crossing midnight**: belongs to the start date.
- **Back-dated session**: affects streaks and PRs for that date retroactively.
- **Photo upload while offline**: queued; session shows "photo pending" until upload.
- **Friend removed** after commenting: comments remain unless the owner deletes them.
- **Copied plan contains a variation unknown to the recipient**: created as the recipient's custom variation.
- **Timezone change while travelling**: dates follow the timezone in which the session was logged.

---

## Requirements *(mandatory)*

### Functional Requirements

**Accounts & profile**

- **FR-001**: Users MUST sign up and sign in with email (and optionally Google/Apple sign-in).
- **FR-002**: Users MUST have a unique username used for friend search.
- **FR-003**: Onboarding MUST ask (skippable) for height, weight, default weight unit (kg/lbs), weekly session goal, and week start day.
- **FR-004**: Users MUST be able to delete their account and all data.

**Exercise library & variations**

- **FR-010**: The system MUST provide an exercise library sourced from the free **wger** exercise database, including names, primary/secondary muscles, equipment, categories and images where available.
- **FR-011**: The library MUST be cached on the device for offline search and refreshed periodically.
- **FR-012**: The app MUST show attribution/licensing for wger content as required by its license.
- **FR-013**: Exercises MUST support multiple variations; each variation has equipment, tracking type (weight×reps, reps only, duration, distance, duration+distance), optional muscle overrides, and an optional default unit.
- **FR-014**: Users MUST be able to create custom exercises and custom variations.
- **FR-015**: Search MUST support name, muscle and equipment filters.

**Plans**

- **FR-020**: Users MUST be able to create, edit, duplicate, reorder, archive and delete plans.
- **FR-021**: Plan entries MUST store exercise, preferred variation, alternative variations, target sets, target rep range and notes.
- **FR-022**: Editing or deleting a plan MUST NOT alter past sessions.
- **FR-023**: Users MAY assign a plan to one or more days of the week; scheduling is optional per plan.
- **FR-024**: Scheduled plans MUST be suggested on the home screen on their days and shown as upcoming markers on the calendar.
- **FR-025**: The system MUST NOT mark scheduled days as missed or penalise deviations from the schedule.
- **FR-026**: Users MAY enable an optional reminder notification for scheduled plan days (off by default).

**Session logging**

- **FR-030**: Users MUST be able to start a session from a plan, from a past session ("Repeat"), or empty.
- **FR-031**: During a session, users MUST be able to swap a variation, skip, add, remove and reorder exercises **without changing the source plan**.
- **FR-032**: On finishing a session that deviated from its plan, the system MUST offer to save changes to the plan, defaulting to No.
- **FR-033**: Each set MUST record: value(s) per tracking type, weight unit per set (kg, lbs, or stack level), reps, set type (warm-up, working, drop set, failure), optional effort rating (RPE 1–10 or RIR), optional note.
- **FR-034**: Units MUST be selectable per set; a variation remembers the last unit used.
- **FR-035**: Sessions MUST record date, start/end time, gym (optional), plan (optional), session notes, and visibility.
- **FR-036**: Users MUST be able to attach up to 5 photos per session, choose one as cover, and set each photo's visibility (default private).
- **FR-037**: Users MUST be able to log and edit sessions for past dates.
- **FR-038**: The app MUST NOT include a rest timer.

**Last time & PRs**

- **FR-040**: While logging a variation, the system MUST show the most recent session's sets for that variation.
- **FR-041**: The system MUST detect and celebrate PRs per variation: heaviest weight, rep PR at a given weight, best session volume. Warm-up sets are excluded.
- **FR-042**: PR history MUST be viewable per variation and per exercise.

**Calendar**

- **FR-050**: The calendar MUST show a month view with cover thumbnails on days with photo sessions and a marker on other training days.
- **FR-051**: Tapping a day MUST show all sessions, sets, PRs, photos, notes, body weight and nutrition for that day.

**Progression**

- **FR-060**: The system MUST chart top weight and total volume per variation over selectable ranges (week, month, 3 months, year, all, custom).
- **FR-061**: Exercise-level progression MUST show each variation as a separate, toggleable series.
- **FR-062**: The system MUST show a "change since" summary for the selected range.
- **FR-063**: Users MUST be able to choose a display unit for charts.

**Muscles & recovery**

- **FR-070**: Each session summary MUST show a front/back body map with primary and secondary muscles highlighted.
- **FR-071**: A weekly heatmap MUST show working sets per muscle group (primary = 1 set, secondary = 0.5 set by default).
- **FR-072**: A weekly volume list MUST compare sets per muscle to a guide range (default 10–20, user-editable).
- **FR-073**: Users MUST be able to record per-muscle soreness (0–3) and overall readiness (1–5) at any time.
- **FR-074**: Recovery estimates MUST start from a default rule: ~48 hours for low/moderate volume, ~72 hours for high volume or sets taken to failure, adjusted by soreness (+24h per soreness level above 1) and readiness (low readiness extends, high shortens). Users MUST be able to override per muscle. The rule MUST be shown transparently and labelled as guidance.

**Gyms & swap suggestions**

- **FR-080**: Users MUST be able to create gym profiles with equipment lists (standard list + custom).
- **FR-081**: Sessions MAY be tagged with a gym; the last-used gym is the default.
- **FR-082**: When starting a plan at a gym, variations requiring unavailable equipment MUST be flagged with suggestions.
- **FR-083**: Swap suggestions MUST rank: plan alternatives → same-exercise variations available at the gym → same-primary-muscle exercises available at the gym, boosting variations with user history.
- **FR-084**: Using a variation at a gym MUST mark its equipment as available there.

**Streaks & goals**

- **FR-090**: Users MUST be able to set a weekly session goal.
- **FR-091**: The home screen MUST show weekly progress toward the goal.
- **FR-092**: Streaks MUST count consecutive weeks meeting the goal; rest days MUST NOT break the streak.
- **FR-093**: Streak visibility MUST default to Private; users MAY make their streak visible to friends.
- **FR-094**: When visible, friends MUST see the streak on the user's profile and milestone posts in the feed, without any comparison or ranking.

**Social**

- **FR-100**: Users MUST be able to send, accept, decline and remove friend requests (mutual friendship) and block users.
- **FR-101**: All content MUST be private by default. Sessions and plans can be shared with friends; photos have individual visibility.
- **FR-102**: Body metrics and nutrition MUST always be private in v1.
- **FR-103**: Friends MUST see a chronological feed of friends' shared sessions.
- **FR-104**: Users MUST be able to like and comment on friends' shared sessions, with notifications to the owner.
- **FR-105**: Users MUST be able to share plans with friends; friends can copy a plan as an independent copy with credit.
- **FR-106**: Users MUST be able to tag friends as gym buddies; accepted invites create a session for the buddy with the same exercises and empty sets.
- **FR-107**: The app MUST NOT include leaderboards, rankings or cross-user comparisons.
- **FR-108**: Users MUST be able to hide the gym name on shared sessions.

**Body metrics & nutrition**

- **FR-110**: Users MUST be able to log body weight (and optionally height) on any date, with a trend chart.
- **FR-111**: Users MUST be able to log optional daily nutrition (calories, protein, carbs, fat, note), typed manually.

**Offline & sync**

- **FR-120**: All logging, plan editing, calendar, progression and library search MUST work offline.
- **FR-121**: Changes MUST sync automatically when online, with a visible sync status.
- **FR-122**: Photo uploads MUST queue offline and retry.
- **FR-123**: Sync conflicts MUST resolve without silently losing sets (per-record last-write-wins; deletes are soft deletes).
- **FR-124**: Feed, likes and comments require a connection; the app MUST show a clear offline state for them.

**Export**

- **FR-130**: Users MUST be able to export all their data as CSV and JSON.

### Key Entities

- **User**: account, username, display name, avatar, default unit, display unit, week start, timezone, weekly goal, streak visibility.
- **BodyMetric**: user, date, weight (value + unit), height (optional).
- **Exercise**: name, description, primary muscles, secondary muscles, category, source (wger / custom), wger reference, image.
- **Variation**: belongs to Exercise; name, equipment, tracking type, muscle overrides, default unit, source (library / custom), owner (for custom).
- **Muscle**: name, group (chest, back, shoulders, biceps, triceps, forearms, abs, glutes, quads, hamstrings, calves…), body-map region.
- **Equipment**: name, standard or custom.
- **Gym**: user, name, equipment list.
- **Plan**: user, name, notes, visibility, copied-from reference, schedule (optional days of week), reminder enabled.
- **PlanEntry**: plan, order, exercise, preferred variation, alternative variations, target sets, target rep range, notes.
- **Session**: user, date, start/end time, gym, source plan (optional), source session (for Repeat), notes, visibility, cover photo, deviated-from-plan flag.
- **SessionEntry**: session, order, exercise, variation, swap reason (swapped from which plan variation, if any), status (done, skipped, added).
- **Set**: session entry, order, set type, weight value, weight unit, reps, duration, distance, RPE/RIR, note, PR flags.
- **PersonalRecord**: user, variation, type (heaviest, rep-at-weight, volume), value, set reference, date.
- **Photo**: session, storage reference, is cover, visibility.
- **RecoveryInput**: user, timestamp, per-muscle soreness, overall readiness, manual overrides.
- **NutritionLog**: user, date, calories, protein, carbs, fat, note.
- **Friendship**: requester, addressee, status (pending, accepted, blocked).
- **Like / Comment**: user, session, text (comment), timestamps.
- **PlanShare**: plan, recipient (or all friends).
- **BuddyTag**: session, tagged friend, status (pending, accepted, declined), created session reference.
- **Notification**: recipient, type, reference, read state.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can log a set (weight, unit, reps) in **under 5 seconds** when the variation has a "Last time" pre-fill.
- **SC-002**: A user can swap an exercise mid-session in **3 taps or fewer** from the exercise row.
- **SC-003**: 100% of sessions logged offline sync without data loss once connectivity returns (verified across the test group).
- **SC-004**: Starting a plan never modifies the plan unless the user explicitly confirms (0 accidental plan changes in testing).
- **SC-005**: The calendar month view loads in **under 1 second** for a year of history on a mid-range phone.
- **SC-006**: PRs are detected correctly across mixed units in 100% of test cases.
- **SC-007**: No content is visible to other users unless explicitly shared (verified by privacy test cases for sessions, photos, plans, body metrics, nutrition).
- **SC-008**: In the test group, at least 80% of friends log at least one session per week for 4 consecutive weeks.
- **SC-009**: At least 50% of logged sessions include at least one swap or deviation, confirming the flexible logging is used (product validation metric).

---

## Assumptions

- **Platform**: React Native (TypeScript) mobile app for iOS and Android. Backend: Supabase (Postgres, Auth, Storage, Realtime) with a NestJS or Express TypeScript service for logic that shouldn't run on the client (e.g., wger import, notifications). Final choices belong in `/speckit-plan`.
- **Exercise data**: wger is used as the source library because it is free, needs no authentication for public data, and includes muscle and equipment data needed for the body map and swap suggestions. Library data is imported into the app's own database rather than queried live on every search.
- **Recovery guidance**: the 48–72 hour rule is a widely used general guideline for resistance-trained muscle groups, not a personalised medical model.
- **Volume guide**: 10–20 working sets per muscle per week is a common hypertrophy guideline and is user-editable.
- **Test group size**: fewer than 50 users in v1, so the feed can be simple chronological without ranking.
- **Notifications**: push notifications for friend requests, likes, comments and buddy invites; can be turned off per type.
- **Languages**: English only for v1.

## Out of Scope (v1)

- Public community, public profiles, discovery of non-friends
- Leaderboards, rankings, challenges between users
- Rest timer
- Food database lookup or barcode scanning
- AI-generated plans or coaching
- Wearable/health app integration (Apple Health, Google Fit)
- Web app

## Open Questions

None. All clarifications resolved as of 2026-11-02. Visual identity (logo, colours) for Lymbr will be defined during design.
