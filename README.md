# Lymbr

A mobile workout tracker for flexible, friends-only training logs: the plan is a guide, the gym decides the day. Offline-first (Expo + PowerSync + Supabase), with a small NestJS service.

## Docs

Read these first, in this order. `rules.md` overrides everything else.

| Doc | What it covers |
|---|---|
| [specs.md](specs.md) | What we're building and why: user stories, requirements |
| [rules.md](rules.md) | Project rules (the constitution) |
| [architecture.md](architecture.md) | Stack, components, sync design, key decisions |
| [data-model.md](data-model.md) | Tables, RLS policies, what syncs |
| [api.md](api.md) | Sync, RPCs, storage, NestJS endpoints |
| [flows.md](flows.md) | Step-by-step behaviour |
| [design.md](design.md) | Visual direction, tokens, components, screens |
| [testing.md](testing.md) | Test strategy and required tests |
| [tasks.md](tasks.md) | The ordered build checklist |

## Repository

```
apps/mobile      Expo app (Expo Router, dev builds via EAS)
apps/api         NestJS service (GET /v1/health)
packages/shared  Pure TypeScript logic shared by app and API
supabase/        Supabase CLI config, migrations, tests
powersync/       Sync Streams config and the local PowerSync service
```

## Getting started

Needs Node 22.13+, pnpm 12, Docker Desktop, and the EAS CLI (`npm install -g eas-cli`).

```sh
pnpm install
pnpm supabase start                                    # local Supabase in Docker
docker compose -f powersync/docker-compose.yaml up -d  # local PowerSync on :8080
```

Copy `apps/mobile/.env.example` and `apps/api/.env.example` to `.env` in the same folders and fill them in (`pnpm supabase status` prints the local values). Git ignores `.env` files; never commit keys.

| Command | What it does |
|---|---|
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | Checks for every package (also run in CI) |
| `pnpm format` | Format with Prettier |
| `pnpm --filter @lymbr/api build` then `pnpm --filter @lymbr/api start` | Run the API on http://localhost:3000/v1/health |
| `pnpm --filter @lymbr/mobile start` | Start the dev server for the installed development build |

## Environments and secrets

Local uses the Supabase CLI stack and the Docker PowerSync service. Dev and prod each have their own Supabase project and hosted PowerSync instance (`architecture.md` §8).

- **Mobile app**: only the Supabase URL, the publishable key and the PowerSync URL, set in `apps/mobile/.env` locally and as EAS environment variables (`development`, `preview`, `production`) for builds.
- **API**: the Supabase secret key, only in `apps/api/.env` or the host's environment.
- **PowerSync role password**: migration `0000_powersync.sql` creates `powersync_role` without a password. Once per hosted Supabase project, set one in the SQL editor and give it only to that project's PowerSync instance:
  `alter role powersync_role with password '<long random password>';`
- **CI secrets** for the dev migration workflow (T028a): `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DEV_PROJECT_REF`.

## Workflow

Branches `feat/…`, `fix/…`, `chore/…`. Conventional Commits, checked by a commit hook and in CI. One commit per task, one PR per phase (`rules.md` §7).
