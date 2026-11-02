# Lymbr — Testing

**Version**: 1.0
**Created**: 2026-11-02
**Status**: Draft for review
**Related**: `rules.md` §6 (testing rules), `tasks.md` (test tasks per phase), `specs.md` (acceptance scenarios and success criteria), `data-model.md` §7 (RLS), `api.md` §10

This document says what we test, with which tools, at which level, and what must pass before code is merged or released.

---

## 1. Goals

Lymbr's biggest risks, in order. Testing effort follows this list.

| # | Risk | Why it matters | Main defence |
|---|---|---|---|
| 1 | **Losing a logged set** | Breaks trust instantly; offline at the gym is normal | Sync connector tests, offline E2E, gym QA |
| 2 | **Private data visible to someone else** | Breaks the core privacy promise | RLS test matrix, privacy review |
| 3 | **Wrong numbers** (unit conversion, PRs, volume, streaks, recovery) | The app's value is trustworthy numbers | Unit tests with edge-case fixtures |
| 4 | **Plan changed without asking** | Breaks the flexibility promise | Shared logic tests + E2E |
| 5 | **Slow or fiddly logging** | People stop logging | Performance budgets, gym QA |
| 6 | **Visual drift** (icons, radii, hype copy) | Erodes the design direction | Lint rules, design review checklist |

---

## 2. Test levels

```
            ┌──────────────┐
            │  Manual gym  │   few, real-world
            │      QA      │
          ┌─┴──────────────┴─┐
          │   E2E (Maestro)  │   one per P1 story + key P2 flows
        ┌─┴──────────────────┴─┐
        │ Integration           │   sync connector, RPCs, RLS, NestJS endpoints
      ┌─┴───────────────────────┴─┐
      │ Unit                       │   packages/shared, components, hooks
      └────────────────────────────┘
```

| Level | Tool | Location | Runs |
|---|---|---|---|
| Unit: shared logic | Jest | `packages/shared/src/**/*.test.ts` | Every PR |
| Unit: components & hooks | Jest + React Native Testing Library | `apps/mobile/**/__tests__/` | Every PR |
| Integration: database (RLS, RPCs, triggers) | pgTAP via `supabase test db` | `supabase/tests/*.sql` | Every PR (local Supabase in CI) |
| Integration: sync connector | Jest with a fake Supabase client and a real local Supabase | `apps/mobile/db/__tests__/` | Every PR |
| Integration: NestJS | Jest + Supertest | `apps/api/src/**/*.spec.ts` | Every PR |
| End-to-end | Maestro on an Android emulator or device, dev Supabase (iOS simulator deferred: needs a Mac and an Apple Developer account) | `apps/mobile/e2e/*.yaml` | Nightly, and before each release |
| Performance | Scripted measurements on a mid-range Android phone | `apps/mobile/perf/` | Before each release |
| Manual | Checklists (§10) | This file | Before each release to friends |

---

## 3. Principles

1. **Pure logic is pure.** Everything in `packages/shared` takes `now`, `timezone`, and `weekStart` as inputs. No hidden clock, no I/O. This makes edge cases easy to test.
2. **Test behaviour, not implementation.** Assert on what the user or the database sees, not internal state.
3. **Every privacy rule is tested both ways.** "Owner can" and "everyone else can't" are separate tests.
4. **A bug fix starts with a failing test** (`rules.md` §6).
5. **No flaky tests in CI.** A flaky test is fixed or quarantined within a day, never ignored.
6. **Fixtures are shared and named.** Use the personas and data in §4 so tests read like stories.

---

## 4. Fixtures and test data

### 4.1 Personas

| Persona | Role in tests |
|---|---|
| **Whi** | Main user. Has 3 plans, 2 gyms, 6 months of sessions with swaps, mixed kg/lb, stack weights, PRs. Timezone `Asia/Manila`, week starts Monday. |
| **Ana** | Accepted friend of Whi. Shares some sessions and a plan. Has custom variations. |
| **Mico** | Pending friend request from Whi (not yet accepted). |
| **Ben** | Was a friend; Whi blocked him. |
| **Stranger** | No relationship to anyone. |
| **Newbie** | Fresh account, no data, not onboarded. |

### 4.2 Where fixtures live

- `packages/shared/test/fixtures/`: TypeScript objects for unit tests (sessions, sets, PR histories, week ranges).
- `supabase/tests/fixtures.sql`: inserts the personas and their data for RLS/RPC tests; helpers `act_as('whi')`, `act_as('ana')`, `act_as_anon()` set the JWT claims.
- `supabase/seed.sql`: smaller seed for local development and E2E (same personas, fewer rows).

### 4.3 Data builders

Small builder functions keep tests short and readable:

```ts
const set = buildSet({ variation: 'db-incline', weight: [55, 'lb'], reps: 8, type: 'working' });
const session = buildSession({ date: '2026-11-02', gym: 'gym-b', entries: [...] });
```

Builders fill every required field with sensible defaults so a test only states what it cares about.

---

## 5. Unit tests: `packages/shared`

Coverage target: **100% of branches** for these modules. They hold the numbers users trust.

### 5.1 Units (`units.ts`)

| Case | Expected |
|---|---|
| `toKg(55, 'lb')` | 24.94758035 (exact constant, no rounding) |
| `toKg(20, 'kg')` | 20 |
| `toKg(8, 'stack')` | null |
| Bodyweight variation, body 72 kg, +10 kg added | 82 kg |
| Assisted variation, body 72 kg, 20 kg assistance | 52 kg |
| Bodyweight variation with no body weight recorded | Uses added load only and flags "no body weight" |
| `formatWeight(24.94758, 'lb')` display | `55 lb` (rounded for display only) |
| Round trip kg → lb → kg | Equal within floating-point tolerance |

### 5.2 Dates (`dates.ts`)

| Case | Expected |
|---|---|
| Session at 23:50 Asia/Manila | `local_date` is that day |
| Session starting 23:30, ending 01:10 | Belongs to start date |
| Week start Monday vs Sunday | Different week ranges for the same date |
| Timezone with DST (e.g., `America/New_York`) across the change | Correct week boundaries |
| User travels: session logged in another timezone | Uses the timezone stored on the session |

### 5.3 PRs (`prs.ts`)

| Case | Expected |
|---|---|
| First-ever set on a variation | Records created, **no celebration flag** |
| Heavier working set | Heaviest PR |
| Same weight, more reps | Rep-at-weight PR |
| Lighter weight, more reps than ever at that weight | Rep-at-weight PR for that weight only |
| Warm-up set heavier than all working sets | No PR |
| Drop set / failure set that beats a record | PR |
| 50 lb vs 22.5 kg (22.68 kg) | Compared in kg correctly |
| Stack 9 after Stack 8 | Heaviest PR in `stack` group |
| Stack set vs kg set | Never compared |
| Session volume beats previous best | Volume PR at finish |
| Stack session volume (stack level × reps) beats previous stack best | Volume PR in `stack` group; never compared with kg volume |
| Session mixing kg and stack sets on one variation | Volume checked once per unit group |
| `rebuildPRs` after deleting the PR set | Previous record restored as current |
| `rebuildPRs` after back-dating a set earlier than the current PR | History reordered correctly |
| `rebuildPRs` run twice | Same result (idempotent) |

### 5.4 Session and plan (`session.ts`)

| Case | Expected |
|---|---|
| Snapshot plan → session | Same exercises, variations, order; `origin = planned`, `status = pending` |
| Added exercise gets sets | `origin` stays `added` while `status` becomes `done`; apply still appends it to the plan |
| Swap only | `deviated = true`; diff shows swap |
| Skip only | Diff shows skip; `applySessionToPlan` keeps the exercise |
| Add exercise | Appended to plan on apply |
| Reorder | New order applied |
| Swap applied | New variation becomes preferred; old one added to alternatives (no duplicates) |
| No changes | `deviated = false`; no prompt |
| Plan edited after snapshot | Session unchanged |

### 5.5 Swaps (`swaps.ts`)

| Case | Expected |
|---|---|
| Plan alternatives exist | Listed first, in user's order |
| Gym lacks Smith machine | Smith variations flagged unavailable |
| Gym has no equipment configured | No filtering |
| Same-muscle exercises | Only those whose primary muscles match |
| History boost | Within a group, previously used variations come first, most recent first |
| Variation needs two pieces of equipment, gym has one | Unavailable |
| Bodyweight variation | Always available |

### 5.6 Volume and muscles (`volume.ts`, `muscles.ts`)

| Case | Expected |
|---|---|
| Primary muscle | 1 set per working set |
| Secondary muscle | 0.5 set |
| Warm-ups | Excluded |
| Variation with muscle override | Override used instead of exercise muscles |
| Sets outside the week | Excluded |
| Heatmap steps, default guide 10–20 | 0 → 0; 4.5 → 1; 5 → 2; 9.5 → 2; 10 → 3; 20 → 3; 20.5 → 4 |
| Heatmap steps, custom guide 8–16 | 3.5 → 1; 4 → 2; 7.5 → 2; 8 → 3; 16 → 3; 16.5 → 4 |

### 5.7 Recovery (`recovery.ts`)

| Case | Expected |
|---|---|
| Moderate session (5.5 sets for the muscle, no failure sets) | 48 h |
| 6 sets for the muscle (e.g., 4 primary + 4 secondary = 6) | 72 h |
| Any failure set for the muscle, even at low volume | 72 h |
| Soreness 1 | No change |
| Soreness 3 | +48 h |
| Readiness 1 / 2 / 3 / 4 / 5 | +24 h / +12 h / 0 / −6 h / −12 h |
| Lowest inputs (moderate session, soreness 0, readiness 5) | 36 h; the window never goes below the 24 h floor |
| flows.md §9 example (72 h, soreness 3, readiness 2, trained 36 h ago) | 96 h left |
| Manual "recovered" | 0 h remaining, reason "Marked by you" |
| Manual "not recovered" after estimate expired | Still not recovered until changed |
| Muscle never trained | No estimate |
| Reasons list | Matches every adjustment applied |

### 5.8 Streaks (`streaks.ts`)

| Case | Expected |
|---|---|
| Goal 4, weeks with 4, 5, 4 sessions | Streak 3 |
| Week with 3 of 4 | Streak resets to 0 at the end of that week |
| Current week, 2 of 4 so far | Streak carries from last week (not broken) |
| Current week, 4 of 4 | Counts now |
| Goal changed from 4 to 3 mid-week | Current week judged on 3; past weeks on 4 |
| Week with no goal | Doesn't count and doesn't break |
| Back-dated session completes a past week | Streak recalculated |
| Session deleted | Streak recalculated |
| Rest days only | Never break a streak mid-week |

### 5.9 Progress and export (`progress.ts`, `export.ts`)

- Series per variation never merged; range filtering; display unit conversion; `changeSince` with no data in range.
- Export CSV: one row per set, original value and unit plus `weight_kg`; special characters in notes escaped; deleted rows excluded.

---

## 6. Database tests (RLS, RPCs, triggers)

Run with `supabase test db` against a fresh local stack in CI.

### 6.1 RLS matrix

Every cell is a test. **R** = can read, **–** = cannot read (query returns nothing / `NOT_FOUND`), **W** = can write.

| Data (owned by Whi) | Whi | Ana (friend) | Mico (pending) | Ben (blocked) | Stranger |
|---|---|---|---|---|---|
| Private session + sets | R W | – | – | – | – |
| Shared session + sets | R W | R | – | – | – |
| Shared session, private photo | R W | – | – | – | – |
| Shared session, shared photo | R W | R | – | – | – |
| Shared session with `hide_gym` | R (gym) | R (no gym) | – | – | – |
| Private plan | R W | – | – | – | – |
| Plan visible to friends | R W | R | – | – | – |
| Plan shared only with Ana | R W | R | – | – | – |
| Body metrics, nutrition, recovery | R W | – | – | – | – |
| Gyms | R W | – | – | – | – |
| Streak (private) | R | – | – | – | – |
| Streak (friends) | R | R | – | – | – |
| Custom variation used in a shared session or plan | R W | R | – | – | – |
| Custom variation not used in anything shared with Ana | R W | – | – | – | – |
| Library exercise | R | R | R | R | R |
| Comments on shared session | R W | R W | – | – | – |

Plus write-denial tests: Ana can't update Whi's session, set, plan, or photo; nobody can insert a row with someone else's `owner_id`; nobody can write library rows.

Plus transition tests: after **unfriend**, Ana loses access immediately; after **block**, both lose access and pending buddy tags/plan shares are removed; after Whi makes a session **private again**, it disappears from Ana's feed.

### 6.2 RPC tests

For each RPC in `api.md` §4: happy path and every listed error code. Highlights:

- `send_friend_request` when the other user already requested you → accepted.
- `copy_plan`: result is owned by caller, private, unscheduled; custom variations copied; editing the copy doesn't touch the original and vice versa.
- `respond_buddy_tag`: creates a session with entries and no sets; second response → `ALREADY_RESPONDED`.
- `get_feed`: chronological only; excludes private, unfinished, deleted and blocked users' sessions; pagination cursor stable.
- `get_session_detail` on a private session → `NOT_FOUND` (same as non-existent).
- Rate limits return `RATE_LIMITED` past the threshold.

### 6.3 Trigger tests

- `check_weight_kg` corrects a wrong `weight_kg` sent by a client.
- `max_five_photos` rejects a sixth live photo; a soft-deleted photo frees a slot.
- `entry_variation_matches_exercise` rejects a mismatched pair.
- `custom_exercise_needs_primary` rejects a custom exercise without a primary muscle at commit.
- `refresh_streak` produces the same streak as `packages/shared` for the shared fixtures (§5.8). The fixture file is generated once and used by both test suites.

---

## 7. Sync and offline tests

### 7.1 Connector (integration)

| Scenario | Expected |
|---|---|
| 50 queued ops, then connection | All upload in order; server matches local |
| Network drops mid-batch | Resumes; no duplicates (upserts by `id`) |
| Expired token | Refresh, then continue |
| Refresh fails | Uploads pause; local data intact; sign-in prompt |
| One row rejected by RLS/constraint | Moved to `failed_uploads`; remaining ops upload |
| Local DELETE | Sent as `deleted_at` update, never a hard delete |
| Same set edited on two devices | Later server write wins; no set lost |
| Set deleted on device A, edited on device B | Row ends soft-deleted and recoverable; no crash |

### 7.2 Offline E2E (Maestro)

- **us1-offline**: airplane mode → start plan → log 12 sets → swap → finish with a photo → kill and reopen app (data still there) → reconnect → verify on server (rows and photo).
- Library search, plans, calendar, progression and recovery all usable in airplane mode.
- Friends tab shows the offline message, not an error.

---

## 8. End-to-end tests (Maestro)

One flow per P1 story, plus key P2 flows. Run against the dev Supabase with seeded personas.

| File | Story | Covers |
|---|---|---|
| `onboarding.yaml` | US4 | Sign up, all onboarding steps, skip some, body weight entry |
| `library.yaml` | US2 | Search by name/muscle, create custom variation, create custom exercise |
| `plans.yaml` | US3 | Create plan with alternatives, schedule, reorder, delete |
| `us1-swap.yaml` | US1 | Start plan, swap, skip, add, log sets, finish, keep plan as is, plan unchanged |
| `us1-save-to-plan.yaml` | US1 | Same, choose Save to plan, plan updated as specified |
| `us1-offline.yaml` | US1 | §7.2 |
| `prs.yaml` | US5 | Last time shown, PR row appears, mixed units |
| `gyms-swap.yaml` | US8 | Gym B flags Smith, swap sheet order, learned equipment |
| `calendar.yaml` | US6 | Cover photo in month view, day detail, back-date session |
| `social.yaml` | US11/12 | Two devices: friend request, share session, like, comment, notification, copy plan, unfriend removes access |

E2E tests check behaviour, not pixels. Visual review is manual (§10.3).

---

## 9. Performance budgets

Measured on a mid-range Android phone (about 3 years old) with Whi's 6-month fixture plus a generated one-year dataset.

| Budget | Target | Spec |
|---|---|---|
| Log a set with "Last time" pre-fill (tap weight → Done) | < 5 s for a user; UI response < 100 ms per tap | SC-001 |
| Open swap sheet and pick a suggestion | ≤ 3 taps; sheet opens < 300 ms | SC-002 |
| Calendar month view | < 1 s with a year of data | SC-005 |
| Start session from plan | < 500 ms | – |
| Progression chart (1 year) | < 1 s | – |
| Cold start to Today | < 2.5 s | – |
| Library search results while typing | < 150 ms | – |

A release is blocked if any budget regresses by more than 20% from the previous release.

---

## 10. Manual QA

### 10.1 Gym test (before every release to friends)

Done by Whi in a real gym, ideally one with bad signal.

- [ ] Log a full session from a plan with at least one swap, one skip, one added exercise.
- [ ] Log sets in both kg and lb, and at least one stack weight.
- [ ] Log one-handed with a sweaty thumb: no mis-taps on the keypad.
- [ ] Read the screen under gym lighting: accent and `ink-3` text are legible.
- [ ] Lose signal mid-session; nothing breaks; sync line says "Saved on phone".
- [ ] Switch gyms between sessions; suggestions change.
- [ ] Finish with photos; they upload later.
- [ ] Check the session appears correctly on the calendar and in a friend's feed (if shared).

### 10.2 Privacy review (SC-007)

Using Stranger, Mico, Ben and Ana accounts on a second phone:

- [ ] Search, profile, feed, session detail, plans and photos show only what §6.1 allows.
- [ ] Private photos in a shared session are never shown, including in thumbnails and push notifications.
- [ ] Body weight, nutrition and recovery never appear anywhere outside the owner's account.
- [ ] Push notification text contains no weights, photos or comment text.

### 10.3 Design review (against `design.md`)

- [ ] No icons outside the allow-list (back chevron, check, drag handle, grab bar).
- [ ] Corner radii are only 4, 6 or 8; no pills, no circles.
- [ ] No gradients, glass effects, or shadows except on sheets and the keypad.
- [ ] Copy follows `design.md` §4: no emoji, no hype, no shaming.
- [ ] Every screen in light and dark mode.
- [ ] Font scaling at 200% doesn't truncate numbers.
- [ ] VoiceOver/TalkBack read sets with units spoken in full.

Lint rules (T043) catch most icon and radius mistakes automatically; this review catches the rest.

---

## 11. CI gates

| Gate | When | Blocks merge? |
|---|---|---|
| Typecheck, lint (incl. radius and icon rules) | Every PR | Yes |
| Unit tests (shared, mobile, api) | Every PR | Yes |
| Shared logic branch coverage = 100% | Every PR | Yes |
| Database tests (RLS, RPCs, triggers) | Every PR | Yes |
| Connector integration tests | Every PR | Yes |
| Migration applies cleanly to a fresh database and to a copy of the previous schema | Every PR touching `supabase/` | Yes |
| E2E suite | Nightly + release | Blocks release |
| Performance budgets | Release | Blocks release |
| Manual QA checklists | Release to friends | Blocks release |

Overall coverage targets: shared logic 100% branches; mobile and API 70% lines (guideline, not a gate). Coverage is a floor, not the goal.

---

## 12. Traceability

Every acceptance scenario in `specs.md` maps to at least one test. Keep this table updated as tests are written.

| Story | Unit | DB | E2E | Manual |
|---|---|---|---|---|
| US1 Logging & swap | §5.4, §5.1 | – | us1-swap, us1-save-to-plan, us1-offline | Gym test |
| US2 Library | §5.6 (muscles) | trigger tests | library | – |
| US3 Plans | §5.4 | RLS plans | plans | – |
| US4 Onboarding & body | §5.1, §5.2 | RPC `update_profile`, RLS private | onboarding | – |
| US5 Last time & PRs | §5.3 | – | prs | Gym test |
| US6 Calendar & photos | §5.2 | trigger `max_five_photos` | calendar | Gym test |
| US7 Progression | §5.9 | – | – | Design review |
| US8 Gyms & swaps | §5.5 | RLS gyms | gyms-swap | Gym test |
| US9 Muscles & recovery | §5.6, §5.7 | RLS private | – | Design review |
| US10 Streaks | §5.8 | `refresh_streak` | – | – |
| US11 Friends & feed | – | §6.1, §6.2 | social | Privacy review |
| US12 Share & copy plans | – | `copy_plan` | social | Privacy review |
| US13 Templates | §5.4 | – | – | – |
| US14 Gym buddies | – | `respond_buddy_tag` | – | Privacy review |
| US15 Nutrition | – | RLS private | – | – |
| US16 Export | §5.9 | – | – | – |

Success criteria: SC-001, SC-002, SC-005 → §9; SC-003 → §7; SC-004 → §5.4 and us1-swap; SC-006 → §5.3; SC-007 → §6.1 and §10.2; SC-008, SC-009 → tracked after release (T169).

---

## 13. Bugs

1. Reproduce and write a failing test at the lowest level that shows it (unit before E2E).
2. Fix; the test passes.
3. Label severity:
   - **S1**: data loss or privacy leak. Fix before anything else; hotfix release.
   - **S2**: wrong numbers (PRs, units, streaks) or blocked logging.
   - **S3**: everything else.
4. S1 bugs get a short note in the PR on how it slipped through and which test now prevents it.
