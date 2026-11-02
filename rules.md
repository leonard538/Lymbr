# Lymbr — Project Rules

**Version**: 1.0
**Created**: 2026-11-02
**Applies to**: every person and every AI coding agent working on Lymbr.

These rules are the project's constitution. If a plan, task, or piece of code conflicts with this file, this file wins, or this file is changed first, on purpose.

Related docs: `specs.md` (what and why), `architecture.md` (how it fits together).

---

## 1. Product principles (non-negotiable)

1. **Flexibility over rigidity.** Deviating from a plan is normal, never an error. No feature may punish swaps, skips, or unscheduled sessions (no "missed" days, no red marks).
2. **Variation-level truth.** Weights, PRs and progression belong to a *variation*. Exercise-level views are roll-ups that show each variation separately. Never merge different variations into one number or one chart line.
3. **Private by default.** Every new session, plan, photo and streak is private. Body metrics and nutrition are always private in v1. Sharing requires an explicit user action.
4. **Supportive, not competitive.** No leaderboards, rankings, or user-vs-user comparisons anywhere, including in copy and notifications.
5. **Gym-proof.** Everything except the social feed must work with no connection. An offline user must never lose a logged set.
6. **Fast logging.** Logging a set should take seconds. Anything that adds taps to the logging screen needs a strong reason.
7. **Plans are never changed silently.** A session can only update its source plan after the user confirms.
8. **Recovery is guidance, not medical advice.** Always label it that way and always let the user override it.

## 2. Data rules

- **Store weights as the user entered them.** Every set stores `weight_value` + `weight_unit` (`kg`, `lb`, `stack`). Also store a computed `weight_kg` for comparisons. `stack` sets have `weight_kg = null` and are only compared with other `stack` sets of the same variation.
- **One conversion constant:** `1 lb = 0.45359237 kg`. It lives in `packages/shared` and nowhere else.
- **Never round stored values.** Round only for display.
- **Client-generated UUIDs** for every synced row, so records can be created offline.
- **Soft deletes only** for synced tables (`deleted_at`). Hard deletes happen only in account deletion and scheduled cleanup.
- **Every synced table has** `id`, `owner_id`, `created_at`, `updated_at`, `deleted_at`.
- **Sessions are history.** A session stores the exercises and variations actually done. It never reads its contents from the plan after creation. Editing or deleting a plan must not change any past session.
- **Dates:** store `started_at` as a timestamp with timezone, plus `local_date` and `timezone` as logged. Calendar, streaks and weeks use `local_date`. A session crossing midnight belongs to its start date.
- **Warm-up sets never count** toward PRs or weekly muscle volume.
- **Library data is ours once imported.** wger data is copied into our tables. Renames or removals upstream must never break user history.

## 3. Privacy and security rules

- **Row-level security (RLS) is on for every table.** No table ships without RLS policies and tests for them.
- **Default deny.** A user can read another user's row only if that row is shared *and* the two are accepted friends *and* neither has blocked the other.
- **Photos** live in a private storage bucket and are served with short-lived signed URLs. Photo visibility is checked per photo, not per session.
- **Secrets never ship in the app.** The mobile app only holds the Supabase URL and anon (public) key. Service-role keys live only on the server.
- **No personal data in URLs, logs or analytics.** Log IDs, not names, weights or photos.
- **Account deletion** removes all of the user's data and photos.

## 4. Code conventions

- **TypeScript everywhere, `strict` mode on.** No `any` without a comment explaining why.
- **Monorepo** (see `architecture.md`): `apps/mobile`, `apps/api`, `packages/shared`, `supabase/`.
- **Shared logic lives in `packages/shared`**: unit conversion, PR detection, volume calculation, recovery estimate, streak calculation, validation schemas (Zod). These are pure functions with no I/O, so they run the same on device and on the server and are easy to test.
- **Naming:**
  - Files: `kebab-case.ts`; React components: `PascalCase.tsx`.
  - Database: `snake_case` tables (plural) and columns.
  - TypeScript: `camelCase` variables/functions, `PascalCase` types.
  - Use the domain words from `specs.md` exactly: Exercise, Variation, Plan, PlanEntry, Session, SessionEntry, Set, Gym, PersonalRecord. Don't invent synonyms like "workout" for Session or "move" for Exercise in code.
- **Database changes only through migrations** in `supabase/migrations/`. Never edit the database by hand in a shared environment.
- **Validate at the edges.** Every API input and every form is validated with a Zod schema from `packages/shared`.
- **Errors:** never swallow errors. Show the user a clear, calm message; log the technical detail.
- **No new dependency** without a one-line reason in the PR description. Prefer Expo-supported libraries.
- **Formatting and linting:** Prettier + ESLint, enforced in CI.

## 5. UI rules

- Units are always shown next to weights (`20 kg`, `45 lb`, `Stack 8`).
- The logging screen must be usable one-handed, with large touch targets.
- Offline state is shown calmly (a small sync indicator), never as a blocking error, except on social screens.
- Celebrate PRs and streak milestones; never shame missed goals.
- Support light and dark mode from the start.
- Show wger attribution where library content appears, as its licence requires.

## 6. Testing rules

- Every function in `packages/shared` has unit tests. Unit conversion, PR detection, volume, recovery and streak logic must have tests for their edge cases (mixed units, stack weights, warm-ups, back-dated sessions, week boundaries, timezones).
- Every RLS policy has tests that prove both access *and* denial.
- Every P1 user story in `specs.md` has at least one end-to-end test of its main acceptance scenario.
- Offline behaviour is tested: log a session in airplane mode, reconnect, verify the data on the server.
- A bug fix includes a test that fails before the fix.

## 7. Git and workflow

- Branches: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- Small pull requests, one concern each. Each PR links the user story or FR it implements (e.g., `US1`, `FR-031`).
- CI must pass (typecheck, lint, tests) before merge.

## 8. Rules for AI coding agents

- Read `specs.md`, `rules.md` and `architecture.md` before starting any task.
- Work on **one task at a time** from `tasks.md`. Don't add features that aren't in the spec.
- If the spec is unclear or seems wrong, **stop and ask**. Don't guess and don't silently change behaviour.
- Never weaken a rule in this file to make a task easier. Propose a change to this file instead.
- Never disable RLS, skip tests, or hard-code secrets, even temporarily.
- Never change a migration that has already been applied; write a new one.
- When finished, list what changed, which FRs/user stories it covers, and how it was tested.

## 9. Definition of done

A task is done when:

- [ ] It meets its acceptance scenarios in `specs.md`.
- [ ] It works offline (if it's not a social feature).
- [ ] Tests are written and pass; typecheck and lint pass.
- [ ] RLS policies cover any new table, with tests.
- [ ] It respects privacy defaults (private unless shared).
- [ ] Docs are updated if behaviour, schema, or API changed.
