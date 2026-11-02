# Lymbr — Tasks

**Version**: 1.0
**Created**: 2026-11-02
**Inputs**: `specs.md`, `rules.md`, `architecture.md`, `data-model.md`, `api.md`, `flows.md`, `design.md`

An ordered checklist for building Lymbr, grouped by phase and user story. Work top to bottom. Each user story phase ends with a **checkpoint**: the story should work and be testable on its own before moving on.

## Format

`- [ ] T### [P] [US#] Description — path`

- **T###**: task ID, in build order.
- **[P]**: can run in parallel with other [P] tasks in the same phase (different files, no dependency on unfinished tasks).
- **[US#]**: the user story from `specs.md` this task serves. Setup, Foundational and Polish tasks have no story label.
- Each task is one commit that references its task ID; each phase (or user story, for larger phases) is one PR that lists its FRs (`rules.md` §7).
- Tasks added after version 1.0 use a letter suffix (e.g., `T043a`) so existing IDs stay stable.
- **Deferred** marks work that waits on something outside the project (e.g., an Apple Developer account).
- **Tests are part of the task list**, not optional. Shared logic, RLS policies and P1 flows must be tested (`rules.md` §6).

## Phase overview

| Phase | Content | Priority |
|---|---|---|
| 1 | Setup: repo, tooling, environments | – |
| 2 | Foundational: schema, auth, sync, shared logic, theme, library import | Blocks everything |
| 3 | US4 Onboarding & body metrics | P1 |
| 4 | US2 Exercise library & variations | P1 |
| 5 | US3 Plans | P1 |
| 6 | US1 Session logging + Today's Swap | P1 → **MVP** |
| 7 | US5 "Last time" & PRs | P2 |
| 8 | US8 Gym profiles & swap suggestions | P2 |
| 9 | US6 Calendar, day detail & photos | P2 |
| 10 | US7 Progression | P2 |
| 11 | US9 Muscles, volume & recovery | P2 |
| 12 | US10 Streaks & weekly goal | P2 |
| 13 | US13 Templates from history | P2 |
| 14 | US11 Friends, feed, likes & comments | P2 |
| 15 | US12 Share & copy plans | P2 |
| 16 | US14 Gym buddies | P3 |
| 17 | US15 Nutrition | P3 |
| 18 | US16 Data export | P3 |
| 19 | Polish, account deletion & release to friends | – |

---

## Phase 1: Setup

**Goal**: an empty monorepo that builds, lints and runs on a phone, with all environments in place.

- [x] T001 Create monorepo with pnpm workspaces + Turborepo: `apps/mobile`, `apps/api`, `packages/shared`, `supabase/`, `powersync/` — repo root
- [x] T002 Add TypeScript (strict) base config shared by all packages — `tsconfig.base.json`
- [x] T003 [P] Add ESLint + Prettier config with Conventional Commits check — repo root
- [x] T004 [P] Create Expo app (TypeScript, Expo Router, dev build) — `apps/mobile`
- [x] T005 [P] Create NestJS app with health endpoint `GET /v1/health` — `apps/api/src/health`
- [ ] T006 [P] Create `packages/shared` with Jest set up and an empty `src/index.ts` — `packages/shared`
- [ ] T007 Initialise Supabase CLI project and local stack — `supabase/config.toml`
- [ ] T008 Create Supabase projects for dev and prod; store keys in env files and CI secrets (never in code) — `.env.example`
- [ ] T009 Set up PowerSync instances for local/dev/prod connected to Supabase — `powersync/`
- [ ] T010 GitHub Actions CI: install, typecheck, lint, test for all packages — `.github/workflows/ci.yml`
- [ ] T011 [P] Configure EAS Build profiles (development, preview, production) — `apps/mobile/eas.json`
- [ ] T012 [P] Copy project docs into repo root and add a short README pointing to them — `README.md`

**Checkpoint**: CI is green; the Expo dev build opens a blank screen on a real phone; the API health check responds.

---

## Phase 2: Foundational (blocks all user stories)

**Goal**: the database, privacy rules, sync, shared logic, design system and exercise library that every story depends on.

### 2a. Database schema and RLS

- [ ] T013 Migration: enums from `data-model.md` §2 — `supabase/migrations/0001_enums.sql`
- [ ] T014 Migration: `profiles`, `weekly_goals`, `push_tokens`, `app_config`, plus trigger creating a profile on sign-up — `supabase/migrations/0002_accounts.sql`
- [ ] T015 Migration: library tables (`muscle_groups`, `wger_muscle_map`, `equipment`, `exercises`, `exercise_muscles`, `variations`, `variation_equipment`, `variation_muscles`) — `supabase/migrations/0003_library.sql`
- [ ] T016 Migration: `gyms`, `gym_equipment` — `supabase/migrations/0004_gyms.sql`
- [ ] T017 Migration: `plans`, `plan_entries`, `plan_entry_alternatives`, `plan_shares` — `supabase/migrations/0005_plans.sql`
- [ ] T018 Migration: `sessions`, `session_entries`, `sets`, `personal_records`, `photos` with checks — `supabase/migrations/0006_sessions.sql`
- [ ] T019 Migration: `body_metrics`, `nutrition_logs`, `recovery_inputs`, `muscle_soreness` — `supabase/migrations/0007_body.sql`
- [ ] T020 Migration: social tables (`friendships`, `likes`, `comments`, `buddy_tags`, `streak_milestones`, `notifications`) — `supabase/migrations/0008_social.sql`
- [ ] T021 Migration: indexes from `data-model.md` §5 (incl. trigram search) — `supabase/migrations/0009_indexes.sql`
- [ ] T022 Migration: triggers `set_updated_at`, `check_weight_kg`, `max_five_photos`, `entry_variation_matches_exercise`, `custom_exercise_needs_primary` — `supabase/migrations/0010_triggers.sql`
- [ ] T023 Migration: helper functions `are_friends`, `is_blocked`, `can_view_session`, `can_view_plan` — `supabase/migrations/0011_helpers.sql`
- [ ] T024 Migration: RLS enabled on every table with all policies from `data-model.md` §7, plus `public_profiles` view — `supabase/migrations/0012_rls.sql`
- [ ] T025 Migration: storage buckets `session-photos`, `avatars` and their policies — `supabase/migrations/0013_storage.sql`
- [ ] T026 Seed: `muscle_groups`, standard `equipment`, `app_config` row, two test users — `supabase/seed.sql`
- [ ] T027 RLS test harness (pgTAP or SQL tests run in CI) with helpers to act as user A / user B — `supabase/tests/`
- [ ] T028 RLS tests for owner-only tables: body metrics, nutrition, recovery, gyms (allow owner, deny everyone else) — `supabase/tests/rls_private.sql`
- [ ] T028a CI: apply migrations to the dev Supabase project on merge to `main` (`supabase db push`; secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DEV_PROJECT_REF`). Prod stays a manual promotion — `.github/workflows/migrate-dev.yml`

### 2b. Shared logic (`packages/shared`)

- [ ] T029 [P] Domain types for every table (generated from Supabase + hand-written enums) — `packages/shared/src/types/`
- [ ] T030 [P] Zod schemas for every synced table and RPC input — `packages/shared/src/schemas/`
- [ ] T031 [P] Units: `toKg`, `fromKg`, `formatWeight`, bodyweight/assisted load, `stack` handling, with tests — `packages/shared/src/units.ts`
- [ ] T032 [P] Dates: `localDate`, `weekStart`, `weekRange` by timezone and week start, with tests (midnight, DST, Asia/Manila) — `packages/shared/src/dates.ts`

### 2c. Auth and sync on the phone

- [ ] T033 Supabase client with secure session storage — `apps/mobile/lib/supabase.ts`
- [ ] T034 Auth screens: sign up, sign in (email, Google), sign out. Needs the project owner's Google OAuth client first. **Deferred:** Sign in with Apple (needs an Apple Developer account) — `apps/mobile/app/(auth)/`
- [ ] T035 PowerSync client schema mirroring synced tables (`data-model.md` §8.3 type mapping) — `apps/mobile/db/schema.ts`
- [ ] T036 Sync Streams `library` and `user_data` — `powersync/sync-config.yaml`
- [ ] T037 Upload connector: PUT/PATCH → upsert/update, DELETE → soft delete; retry, 401 refresh, `failed_uploads` handling (`api.md` §3.3) — `apps/mobile/db/connector.ts`
- [ ] T038 Local query helpers that always filter `deleted_at is null` — `apps/mobile/db/queries/`
- [ ] T039 Sync status hook and the sync line component ("Saved on phone. Will sync.") — `apps/mobile/features/sync/`
- [ ] T040 Test: write rows offline, reconnect, verify on server; one rejected row doesn't block others — `apps/mobile/db/__tests__/connector.test.ts`

### 2d. Design system

- [ ] T041 [P] Tokens: colours (light/dark), type, spacing, radius (4/6/8), lines, motion — `apps/mobile/theme/tokens.ts`
- [ ] T042 [P] Load Archivo and IBM Plex Mono via `expo-font`; text components per type token — `apps/mobile/theme/typography.tsx`
- [ ] T043 [P] Lint rules: reject `borderRadius` outside 0/4/6/8; reject icon imports outside allow-listed components — `eslint-rules/`
- [ ] T043a Set up Jest + React Native Testing Library for the mobile app (`jest-expo` preset), run by `pnpm test` and CI — `apps/mobile/jest.config.js`
- [ ] T044 Core components: Button (primary/secondary/text/destructive), Input, SegmentedControl, Checkbox, Tag, Row, SectionHeader, Avatar (square), Toast, EmptyState — `apps/mobile/components/`
- [ ] T045 BottomSheet and Lymbr keypad components — `apps/mobile/components/`
- [ ] T046 Text-only tab bar (Today, Calendar, Progress, Friends) and app shell — `apps/mobile/app/(tabs)/_layout.tsx`
- [ ] T047 Dev-only component gallery screen showing every component in both modes — `apps/mobile/app/dev/gallery.tsx`

### 2e. Exercise library import (NestJS)

- [ ] T048 Supabase JWT guard and a Supabase client using the secret key — `apps/api/src/auth/`
- [ ] T049 Verify current wger API: variation-group field, muscle IDs, licence fields; write findings into `data-model.md` §4.2 — docs
- [ ] T050 Seed `wger_muscle_map` from the verified muscle IDs — `supabase/seed.sql`
- [ ] T051 wger import service: fetch, map muscles, group into exercises/variations, upsert by wger IDs, deactivate missing, store attribution — `apps/api/src/wger-import/`
- [ ] T052 Weekly schedule + `POST /admin/wger-import` + run summary — `apps/api/src/wger-import/`
- [ ] T053 Test: re-running import is idempotent; removed exercise becomes inactive — `apps/api/src/wger-import/*.spec.ts`
- [ ] T054 Run first import into dev; spot-check 20 common exercises and their muscles — dev environment

**Checkpoint**: a signed-in user's phone syncs the full library offline; RLS tests pass; the component gallery renders in light and dark mode.

---

## Phase 3: US4 — Onboarding and body metrics (P1)

**Goal**: a new user sets up their profile and can log body weight over time.
**Independent test**: sign up, finish onboarding, log three body-weight entries on different dates, see the chart.

- [ ] T055 [US4] RPC `update_profile` with username validation and error codes — `supabase/migrations/0014_rpc_profile.sql`
- [ ] T056 [US4] RPC tests: valid update, `USERNAME_TAKEN`, `INVALID_USERNAME` — `supabase/tests/rpc_profile.sql`
- [ ] T057 [US4] Onboarding screens, one question each: username, height, weight, units, weekly goal, week start; skip on all but username; `2 of 6` progress — `apps/mobile/app/onboarding/`
- [ ] T058 [US4] Offline onboarding: keep temp username, ask again when online — `apps/mobile/app/onboarding/`
- [ ] T059 [US4] Write first `body_metrics` and `weekly_goals` rows via sync — `apps/mobile/features/body/`
- [ ] T060 [P] [US4] Body screen: log weight (kg/lb) and height for any date; list of entries — `apps/mobile/app/body/`
- [ ] T061 [P] [US4] Body-weight chart (W/M/Y/All) following chart rules in `design.md` §5.13 — `apps/mobile/features/body/WeightChart.tsx`
- [ ] T062 [US4] Settings: units, display unit, week start, timezone, weekly goal — `apps/mobile/app/settings/`
- [ ] T062a [US4] Avatar upload in Settings: pick, crop to a 512 px square, upload to `avatars/{owner_id}.jpg` (`api.md` §5.2), save `profiles.avatar_path`; square avatar with initials fallback (`design.md` §5.11) — `apps/mobile/features/profile/AvatarPicker.tsx`

**Checkpoint**: US4 acceptance scenarios pass; body metrics never readable by another user (covered by T028).

---

## Phase 4: US2 — Exercise library and variations (P1)

**Goal**: search exercises offline and create custom variations.
**Independent test**: search by name/muscle/equipment offline; create a custom variation and a custom exercise.

- [ ] T063 [US2] Local search: name (prefix + contains), muscle and equipment filters over library + own custom rows — `apps/mobile/db/queries/exercises.ts`
- [ ] T064 [US2] Exercise search screen and filters sheet — `apps/mobile/app/exercises/index.tsx`
- [ ] T065 [US2] Exercise detail: muscles, variations list (library + custom), image, wger attribution — `apps/mobile/app/exercises/[id].tsx`
- [ ] T066 [US2] Create custom variation: name, equipment, tracking type, default unit, bodyweight/assisted/unilateral flags, optional muscle override — `apps/mobile/features/exercises/VariationForm.tsx`
- [ ] T067 [US2] Create custom exercise (requires a primary muscle) with its first variation — `apps/mobile/features/exercises/ExerciseForm.tsx`
- [ ] T068 [P] [US2] Shared helper `musclesForVariation` (override or inherit) with tests — `packages/shared/src/muscles.ts`

**Checkpoint**: US2 acceptance scenarios pass in airplane mode.

---

## Phase 5: US3 — Plans (P1)

**Goal**: create and manage plans with preferred and alternative variations and an optional schedule.
**Independent test**: create, edit, reorder, duplicate, archive and delete a plan; give it a schedule.

- [ ] T069 [US3] Plans list screen — `apps/mobile/app/plans/index.tsx`
- [ ] T070 [US3] Plan editor: name, entries with preferred variation, alternatives, target sets and rep range, notes; drag to reorder — `apps/mobile/app/plans/[id].tsx`
- [ ] T071 [US3] Duplicate, archive, delete (soft) — `apps/mobile/features/plans/actions.ts`
- [ ] T072 [US3] Optional schedule (day toggles) and reminder setting — `apps/mobile/features/plans/ScheduleEditor.tsx`
- [ ] T073 [US3] Local reminder notifications from `schedule_days` + `reminder_time` (`expo-notifications`), rescheduled on change — `apps/mobile/features/plans/reminders.ts`
- [ ] T074 [US3] "Muscles this plan trains" summary on the plan screen — `apps/mobile/features/plans/PlanMuscles.tsx`

**Checkpoint**: US3 acceptance scenarios pass; deleting a plan leaves past sessions intact (tested in Phase 6).

---

## Phase 6: US1 — Session logging with Today's Swap (P1) — MVP

**Goal**: log a full session from a plan or from scratch, swap/skip/add/reorder for today only, fully offline.
**Independent test**: `specs.md` US1 scenarios 1–7, including a full session in airplane mode.

- [ ] T075 [US1] Shared `snapshotPlanToSession(plan, entries)` producing session entries, with tests — `packages/shared/src/session.ts`
- [ ] T076 [US1] Shared `diffSessionFromPlan` and `applySessionToPlan` (swap → preferred, skip kept, added appended, order applied), with tests — `packages/shared/src/session.ts`
- [ ] T077 [US1] Start session: from plan, empty; resume-or-finish prompt if one is active (flow 2) — `apps/mobile/features/session/start.ts`
- [ ] T078 [US1] Session screen layout: exercise blocks, set table (SET, PREVIOUS, WEIGHT, REPS, RPE, done) per `design.md` §8.2 — `apps/mobile/app/session/[id].tsx`
- [ ] T079 [US1] Log a set with the keypad: weight + unit switch, reps, steps of 2.5 kg/5 lb/1 stack; immediate local save; tracking types (reps-only, duration, distance) — `apps/mobile/features/session/SetRow.tsx`
- [ ] T080 [US1] Set details sheet: set type W/D/F, RPE or RIR, note — `apps/mobile/features/session/SetDetailsSheet.tsx`
- [ ] T081 [US1] Bodyweight, assisted and unilateral set inputs using `units.ts` — `apps/mobile/features/session/SetRow.tsx`
- [ ] T082 [US1] Swap (basic: plan alternatives + search), skip with undo, add exercise, remove added, reorder; sets `deviated_from_plan` — `apps/mobile/features/session/entryActions.ts`
- [ ] T083 [US1] Active session bar above the tab bar ("since 9:12", no timer) — `apps/mobile/features/session/ActiveSessionBar.tsx`
- [ ] T084 [US1] Finish: summary, discard-if-empty, "Save these changes to the plan?" (default Keep plan as is), notes, visibility (default Private) — `apps/mobile/app/session/[id]/finish.tsx`
- [ ] T085 [US1] Long-open session prompt (> 4 h) — `apps/mobile/features/session/staleSession.ts`
- [ ] T086 [US1] Today screen v1: scheduled plan, start session, start empty, plans list — `apps/mobile/app/(tabs)/today.tsx`
- [ ] T086a Set up Maestro for Android E2E: config, a smoke flow that opens the app, how to run it locally, and the nightly CI run (`testing.md` §2) — `apps/mobile/e2e/`
- [ ] T087 [US1] E2E (Maestro): start plan → swap → skip → add → log sets → finish → plan unchanged — `apps/mobile/e2e/us1-swap.yaml`
- [ ] T088 [US1] E2E: whole session in airplane mode, reconnect, data on server — `apps/mobile/e2e/us1-offline.yaml`
- [ ] T089 [US1] Test: editing/deleting a plan after a session leaves the session unchanged — `apps/mobile/features/session/__tests__/snapshot.test.ts`

**Checkpoint — MVP**: Whi can install a preview build and log real gym sessions offline. Ship to Whi only and use it for a week before Phase 7.

---

## Phase 7: US5 — "Last time" and PRs (P2)

**Goal**: show last time per variation and detect and celebrate PRs.
**Independent test**: log a variation twice; second session shows the first; beating a record shows a PR.

- [ ] T090 [P] [US5] Shared `detectPRs(set, currentPRs)` (heaviest, rep-at-weight; warm-ups excluded; mass vs stack), with tests — `packages/shared/src/prs.ts`
- [ ] T091 [P] [US5] Shared `rebuildPRs(variationSets)` and `sessionVolume`, `detectVolumePR`, with tests (mixed units, drop/failure sets, first-ever set) — `packages/shared/src/prs.ts`
- [ ] T092 [US5] "Last time" query per variation (last finished session) and PREVIOUS column + pre-fill unit — `apps/mobile/db/queries/lastTime.ts`
- [ ] T093 [US5] Write `personal_records` on set save; supersede old records — `apps/mobile/features/prs/recordPR.ts`
- [ ] T094 [US5] PR row styling (accent bar, `PR` tag, light haptic, reduce-motion) — `apps/mobile/features/session/SetRow.tsx`
- [ ] T095 [US5] Volume PRs at finish, shown in summary — `apps/mobile/app/session/[id]/finish.tsx`
- [ ] T096 [US5] Rebuild PRs when a set is edited, deleted or back-dated; no celebration (flow 8) — `apps/mobile/features/prs/rebuild.ts`

**Checkpoint**: US5 scenarios pass, including mixed kg/lb on one variation.

---

## Phase 8: US8 — Gym profiles and swap suggestions (P2)

**Goal**: gyms with equipment; flag unavailable variations; ranked swap suggestions.
**Independent test**: two gyms with different equipment; same plan gives different flags and suggestions.

- [ ] T097 [US8] Gyms list and gym editor (equipment checklist, custom equipment, learned list) — `apps/mobile/app/gyms/`
- [ ] T098 [P] [US8] Shared `checkAvailability(entries, gymEquipment)` with tests — `packages/shared/src/swaps.ts`
- [ ] T099 [P] [US8] Shared `suggestSwaps(entry, gym, history)` ranking per `flows.md` §4, with tests — `packages/shared/src/swaps.ts`
- [ ] T100 [US8] Gym choice at session start (default last used); flag `NOT AT THIS GYM` entries — `apps/mobile/features/session/start.ts`
- [ ] T101 [US8] Swap sheet with sections From your plan / Available here / Same muscles + last result — `apps/mobile/features/session/SwapSheet.tsx`
- [ ] T102 [US8] Learn equipment when a variation is used at a gym (`learned = true`) — `apps/mobile/features/gyms/learnEquipment.ts`

**Checkpoint**: US8 scenarios pass, including a gym with no equipment configured.

---

## Phase 9: US6 — Calendar, day detail and photos (P2)

**Goal**: month calendar with cover photos; tap a day to see everything.
**Independent test**: sessions on several days, with and without photos; open day details.

- [ ] T103 [US6] Photo add: pick, compress (1600 px, JPEG 0.8), strip EXIF location, save locally, insert `photos` row — `apps/mobile/features/photos/addPhoto.ts`
- [ ] T104 [US6] Attachment upload queue with retry (flow 7) — `apps/mobile/features/photos/uploadQueue.ts`
- [ ] T105 [US6] Photos in finish screen and session edit: up to 5, cover, per-photo visibility — `apps/mobile/features/photos/PhotoStrip.tsx`
- [ ] T106 [US6] Calendar month grid: cover cells, plan-letter cells, multiple-session count, scheduled dashed cells, today marker; swipe months — `apps/mobile/app/(tabs)/calendar.tsx`
- [ ] T107 [US6] Day detail: sessions, sets, PRs, photos, notes, body weight, nutrition; actions Edit / Repeat / Save as plan — `apps/mobile/app/day/[date].tsx`
- [ ] T108 [US6] Edit a finished session and back-date it (triggers PR rebuild) — `apps/mobile/app/session/[id]/edit.tsx`
- [ ] T109 [US6] Performance: month view < 1 s with a year of data (SC-005) — `apps/mobile/app/(tabs)/calendar.tsx`

**Checkpoint**: US6 scenarios pass; photos upload after going back online.

---

## Phase 10: US7 — Progression (P2)

**Goal**: charts and summaries per variation and per exercise.
**Independent test**: with history, view progression across ranges for a variation and its exercise.

- [ ] T110 [P] [US7] Shared `progressSeries(sets, range, metric, displayUnit)` and `changeSince`, with tests — `packages/shared/src/progress.ts`
- [ ] T111 [US7] Line chart component: straight segments, square points, dashed series, direct end labels, PR tags — `apps/mobile/components/LineChart.tsx`
- [ ] T112 [US7] Progress tab: weekly muscles preview, exercise list, body weight — `apps/mobile/app/(tabs)/progress.tsx`
- [ ] T113 [US7] Exercise progression: toggleable variation series, range and metric controls — `apps/mobile/app/progress/exercise/[id].tsx`
- [ ] T114 [US7] Variation progression: chart, personal bests, reps-at-weight table — `apps/mobile/app/progress/variation/[id].tsx`

**Checkpoint**: US7 scenarios pass; variations never merged into one line.

---

## Phase 11: US9 — Muscles, volume and recovery (P2)

**Goal**: body map per session and week, weekly sets per muscle, adjustable recovery estimates.
**Independent test**: sessions hitting different muscles; heatmap, set counts and recovery change with soreness input.

- [ ] T115 [US9] Body map artwork: front/back SVGs with region IDs matching `muscle_groups.svg_region_ids` — `apps/mobile/assets/body-map/`
- [ ] T116 [P] [US9] Shared `weeklyMuscleVolume(sets, muscles, week)` (primary 1, secondary 0.5, no warm-ups), with tests — `packages/shared/src/volume.ts`
- [ ] T117 [P] [US9] Shared `estimateRecovery(training, inputs, now)` returning hours + reasons, with tests for every rule — `packages/shared/src/recovery.ts`
- [ ] T118 [US9] BodyMap component with heatmap ramp and linked muscle list — `apps/mobile/components/BodyMap.tsx`
- [ ] T119 [US9] Session body map on finish summary and day detail — `apps/mobile/features/muscles/SessionMuscles.tsx`
- [ ] T120 [US9] Weekly muscles screen: map, table (sets, guide, recovery), readiness and soreness input, guidance note — `apps/mobile/app/progress/muscles.tsx`
- [ ] T121 [US9] Recovery reasons sheet with manual override — `apps/mobile/features/muscles/RecoverySheet.tsx`
- [ ] T122 [US9] Recovery summary on Today; volume guide setting — `apps/mobile/app/(tabs)/today.tsx`

**Checkpoint**: US9 scenarios pass; labelled as guidance everywhere.

---

## Phase 12: US10 — Streaks and weekly goal (P2)

**Goal**: weekly progress and week-based streaks that respect goal history.
**Independent test**: set a goal, log across weeks, change the goal mid-week, check counts.

- [ ] T123 [P] [US10] Shared `weeklyProgress` and `streak(sessions, weeklyGoals, weekStart, tz)`, with tests (goal changes, no-goal weeks, current week, back-dating) — `packages/shared/src/streaks.ts`
- [ ] T124 [US10] Server `recompute_streak` + `refresh_streak` trigger + milestones (only when public) — `supabase/migrations/0015_streaks.sql`
- [ ] T125 [US10] SQL tests: server streak matches shared logic for the same fixtures — `supabase/tests/streaks.sql`
- [ ] T126 [US10] Goal change writes `weekly_goals` row for current week — `apps/mobile/features/goals/setGoal.ts`
- [ ] T127 [US10] Today week squares, "3 of 4", "12 weeks in a row"; streak visibility setting — `apps/mobile/app/(tabs)/today.tsx`

**Checkpoint**: US10 scenarios pass; rest days never break a streak.

---

## Phase 13: US13 — Templates from history (P2)

- [ ] T128 [US13] "Repeat" a past session (non-skipped entries, `source_session_id`) — `apps/mobile/features/session/repeat.ts`
- [ ] T129 [US13] "Save as plan" from a session (targets from sets done) — `apps/mobile/features/plans/fromSession.ts`
- [ ] T130 [US13] "Repeat last session" on Today — `apps/mobile/app/(tabs)/today.tsx`

**Checkpoint**: US13 scenarios pass offline.

---

## Phase 14: US11 — Friends, feed, likes and comments (P2)

**Goal**: friends-only social layer, private by default.
**Independent test**: two accounts become friends; one shares a session, one keeps one private; verify feed, likes, comments, notifications, unfriend and block.

- [ ] T131 [US11] RPCs `search_users`, `send_friend_request`, `respond_friend_request`, `remove_friend`, `block_user`, `unblock_user` — `supabase/migrations/0016_rpc_friends.sql`
- [ ] T132 [US11] RPCs `get_feed`, `get_session_detail` (hide_gym, photo visibility, `NOT_FOUND` when not allowed) — `supabase/migrations/0017_rpc_feed.sql`
- [ ] T133 [US11] Notification triggers + rate limits (`api.md` §8) — `supabase/migrations/0018_notifications.sql`
- [ ] T134 [US11] RLS + RPC tests: friend, non-friend, pending, blocked, private session, shared session with private photo — `supabase/tests/rls_social.sql`
- [ ] T135 [US11] NestJS `POST /webhooks/notifications`: secret check, settings check, Expo push, idempotent, prune bad tokens — `apps/api/src/notifications/`
- [ ] T136 [US11] Push token registration (ask permission when first friend is added) — `apps/mobile/features/notifications/pushToken.ts`
- [ ] T137 [US11] Friends tab: Feed / Friends / Notifications; offline state — `apps/mobile/app/(tabs)/friends.tsx`
- [ ] T138 [US11] Add friend: search, invite link `lymbr://add/<username>`, requests list — `apps/mobile/app/friends/add.tsx`
- [ ] T139 [US11] Feed list (text Like/Comment toggles, cover via signed URL, milestones) — `apps/mobile/features/feed/`
- [ ] T140 [US11] Friend's session screen with comments (add/edit/delete; owner can delete) — `apps/mobile/app/friends/session/[id].tsx`
- [ ] T141 [US11] Visibility controls: session, per photo, hide gym — `apps/mobile/features/session/VisibilitySheet.tsx`
- [ ] T142 [US11] Friend profile, remove friend, block — `apps/mobile/app/friends/[userId].tsx`
- [ ] T143 [US11] Notifications inbox + realtime unread count + notification settings — `apps/mobile/app/friends/notifications.tsx`

**Checkpoint**: US11 scenarios pass; SC-007 privacy checks pass.

---

## Phase 15: US12 — Share and copy plans (P2)

- [ ] T144 [US12] RPCs `share_plan`, `unshare_plan`, `get_shared_plans`, `get_plan_detail`, `copy_plan` (copies custom variations) — `supabase/migrations/0019_rpc_plans.sql`
- [ ] T145 [US12] RPC tests: copy is independent; non-friend can't view; custom variations copied — `supabase/tests/rpc_plans.sql`
- [ ] T146 [US12] Share plan sheet (all friends or specific friends) — `apps/mobile/features/plans/SharePlanSheet.tsx`
- [ ] T147 [US12] Friend's plan detail with "Copy to my plans" and "Copied from @friend" credit — `apps/mobile/app/friends/plan/[id].tsx`

**Checkpoint**: US12 scenarios pass.

---

## Phase 16: US14 — Gym buddies (P3)

- [ ] T148 [US14] RPCs `tag_buddies`, `respond_buddy_tag`, `untag_buddy` + tests — `supabase/migrations/0020_rpc_buddies.sql`
- [ ] T149 [US14] "Trained with…" picker; offline pending tags sent when online — `apps/mobile/features/buddies/`
- [ ] T150 [US14] Buddy invite accept/decline; new session opens for filling in — `apps/mobile/app/friends/buddy/[id].tsx`
- [ ] T151 [US14] "Trained with @friend" in feed and day detail — `apps/mobile/features/feed/`

---

## Phase 17: US15 — Nutrition (P3)

- [ ] T152 [US15] Daily nutrition entry (calories, protein, carbs, fat, note) on Body screen and day detail — `apps/mobile/features/nutrition/`
- [ ] T153 [US15] Simple nutrition trend chart — `apps/mobile/features/nutrition/NutritionChart.tsx`

---

## Phase 18: US16 — Data export (P3)

- [ ] T154 [P] [US16] Shared `buildExport(data)` → CSV rows and JSON, with tests — `packages/shared/src/export.ts`
- [ ] T155 [US16] Export screen: read local DB, warn about unsynced state, zip, share sheet — `apps/mobile/app/settings/export.tsx`

---

## Phase 19: Polish and release to friends

- [ ] T156 RPC `delete_account` + NestJS `/webhooks/account-deletion` (storage, rows, auth user) + tests — `apps/api/src/account/`
- [ ] T157 Delete account screen (export offer, type username, re-auth) — `apps/mobile/app/settings/account.tsx`
- [ ] T158 Nightly purge job (soft-deleted > 30 days, photo files) and push-token pruning — `apps/api/src/cleanup/`
- [ ] T159 `app_config.min_supported_version` check on app start — `apps/mobile/features/appConfig/`
- [ ] T160 Accessibility pass: screen reader labels (units spoken in full), 200% font, reduce motion, contrast — app-wide
- [ ] T161 Copy pass against `design.md` §4 (no emoji, no hype, no shaming) — app-wide
- [ ] T162 Design pass: no stray icons, radii only 4/6/8, dark mode on every screen; outdoor accent check — app-wide
- [ ] T163 Performance pass: set logging < 5 s (SC-001), swap ≤ 3 taps (SC-002), calendar < 1 s (SC-005) — app-wide
- [ ] T164 Privacy review: walk every shared surface as a non-friend and as a blocked user (SC-007) — QA
- [ ] T165 Error reporting without personal data (IDs only) — `apps/mobile/lib/errors.ts`, `apps/api/src/`
- [ ] T166 App icon and wordmark (type-based, no gradients) — `apps/mobile/assets/`
- [ ] T167 Prod: apply migrations, run wger import, configure webhooks and secrets — prod environment
- [ ] T168 Release to friends: Android internal testing; short "how to give feedback" note. **Deferred:** TestFlight (needs an Apple Developer account) — release
- [ ] T169 Track SC-008 and SC-009 over the first 4 weeks (weekly active loggers, share of sessions with swaps) — analytics query

---

## Dependencies

```
Setup → Foundational → US4 → US2 → US3 → US1 (MVP)
                                         ├→ US5 ──┐
                                         ├→ US8   ├→ US10, US13
                                         ├→ US6 ──┤
                                         ├→ US7 (needs US5 PR data)
                                         ├→ US9
                                         └→ US11 → US12 → US14
US15, US16: any time after US1 and US6
Polish: after all chosen stories
```

- **Foundational blocks everything.** Don't start story work until its checkpoint passes.
- US1 needs US2 (exercises) and US3 (plans).
- US7 builds on PR data from US5.
- US12 and US14 need friendships from US11.
- Within a phase: shared logic and tests ([P]) first, then data access, then screens.

## Parallel opportunities

- Phase 2: T029–T032 (shared) can run alongside T041–T043 (design system) and T048–T053 (import).
- After the MVP: US5, US8, US6 and US9 touch different files and can be built side by side, finishing each with its own checkpoint.
- Server-side social work (T131–T135) can start while US6–US9 screens are being built.

## Suggested milestones

| Milestone | Phases | Who uses it |
|---|---|---|
| **M1: MVP** | 1–6 | Whi only, real gym sessions |
| **M2: Flexible logbook** | 7–13 | Whi, still solo |
| **M3: Social test** | 14–16, 19 | Whi + friends |
| **M4: Complete v1** | 17–18 | Everyone in the test group |

## Notes

- `testing.md` defines the test strategy, tools and fixtures; the test tasks above follow it and `rules.md` §6.
- **Android first.** iOS-only work (Sign in with Apple, TestFlight, iOS simulator E2E) is deferred until there is an Apple Developer account.
- If a task reveals the spec or data model is wrong, update the doc first, then the code (`rules.md` §8).
