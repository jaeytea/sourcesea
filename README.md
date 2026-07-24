# SourceSea

Park tabs you don't need *right now* but can't close. Give each one a URL and
a date/time to come back to. SourceSea reminds you when that time comes.

## 1. Problem → solution

You've got 20 tabs open. 3 matter, but not today. You want them out of your
face without losing them. SourceSea stores `{ url, title, notes, remindAt }`
and pings you (a Chrome notification + in-app snackbar) when `remindAt`
arrives, so you can safely close the tab now and trust you'll see it again.

## 2. Tech stack

| Layer      | Choice                                              |
|------------|------------------------------------------------------|
| Frontend   | React + TypeScript + Vite, MUI only (no other UI libs)|
| Backend    | Node + Express + TypeScript                          |
| DB         | PostgreSQL (raw SQL via `pg`, no ORM)                 |
| Auth       | **Not implemented yet** — scaffolded for Supabase Google OAuth + RLS |
| Notifications | Web `Notification` API, polled client-side (v1). Upgrade path to Web Push documented below. |

No ORM on purpose: one table, hand-written SQL is easier to reason about and
to later wrap in Supabase RLS policies without translation layers.

## 3. Folder structure

```
sourcesea/
├─ backend/
│  ├─ db/schema.sql                 # table + indexes + RLS policies (commented out)
│  └─ src/
│     ├─ config.ts                  # env vars
│     ├─ db.ts                      # pg Pool
│     ├─ types.ts                   # Resource / Row / Input types
│     ├─ services/resources.service.ts   # all SQL lives here
│     ├─ controllers/resources.controller.ts  # req/res glue, no SQL
│     ├─ routes/resources.routes.ts
│     └─ index.ts                   # express app
└─ frontend/
   └─ src/
      ├─ theme.ts                   # MUI peachy theme tokens
      ├─ types.ts                   # mirrors backend types
      ├─ api/resourceApi.ts         # fetch wrapper
      ├─ hooks/useResources.ts      # CRUD state
      ├─ hooks/useNotificationScheduler.ts  # polls /due, fires Notification
      ├─ components/ResourceDialog.tsx      # add/edit form
      ├─ components/ResourceCard.tsx
      ├─ components/ResourceList.tsx
      ├─ components/EmptyState.tsx
      └─ App.tsx
```

**Layering rule (backend):** routes → controllers → services → db.
Controllers never touch SQL; services never touch `req`/`res`. This is the
seam where auth gets inserted later — `currentUserId(req)` in the controller
is currently hardcoded to `null` and is the single place that changes.

## 4. Data model

```sql
resources (
  id          uuid primary key,
  user_id     uuid,            -- nullable now, FK to auth.users later
  url         text not null,
  title       text not null,
  notes       text,
  remind_at   timestamptz not null,
  status      text default 'pending',  -- pending | done | dismissed
  created_at  timestamptz,
  updated_at  timestamptz
)
```

Full DDL, including the commented-out RLS policies you'll flip on once
Supabase auth lands, is in `backend/db/schema.sql`.

Every service function already threads `userId` through the query
(`where user_id is not distinct from $1`) so that swapping in real auth is a
matter of returning a real UUID from `currentUserId(req)` instead of `null` —
no query rewrites needed.

## 5. API contract

| Method | Path                  | Purpose                              |
|--------|-----------------------|---------------------------------------|
| GET    | `/api/resources`      | list all resources, sorted by `remindAt` |
| GET    | `/api/resources/due`  | resources with `status=pending` and `remindAt <= now()` — polled by the frontend scheduler |
| POST   | `/api/resources`      | create `{ url, title, notes?, remindAt }` |
| PATCH  | `/api/resources/:id`  | partial update, any field incl. `status` |
| DELETE | `/api/resources/:id`  | delete |

## 6. Notification design

**v1 (implemented):** `useNotificationScheduler` polls `GET /resources/due`
every 60s while the tab is open, and calls `new Notification(...)` for each
newly-due item (deduped via a `tag` and an in-memory `Set` so you don't get
spammed on every poll). Clicking a notification opens the URL in a new tab.

**Known limitation:** this only fires while SourceSea itself is open in a
tab — closing the browser stops reminders. That's fine for a v1 baseline.

**Upgrade path (later):** swap the polling `useNotificationScheduler` for a
Service Worker + Web Push subscription (VAPID keys). The backend's
`getDueResources` query doesn't change — you'd add a cron (e.g.
`node-cron` or a Postgres `pg_cron` job) that calls it server-side and pushes
via the `web-push` npm package to subscribed clients instead of the frontend
polling for itself. This is the only piece designed to be swapped wholesale
rather than incrementally extended.

## 7. Auth & RLS — deliberately deferred

Everything is wired so this is additive, not a rewrite:

1. Add Supabase project, enable Google OAuth provider.
2. Frontend: add `@supabase/supabase-js`, wrap `App` in a session/auth
   context, attach the Supabase JWT as `Authorization: Bearer <token>` in
   `resourceApi`'s `request()` helper.
3. Backend: add a middleware that verifies the JWT (Supabase's JWKS or
   shared secret) and sets `req.userId`; update `currentUserId(req)` in
   `resources.controller.ts` to read it.
4. DB: uncomment the RLS block in `schema.sql`, run it, and — if you move DB
   access to Supabase's client instead of raw `pg` — RLS enforces isolation
   even if a query forgets the `user_id` filter.

## 8. Local setup

**DB**
```bash
createdb sourcesea
psql sourcesea -f backend/db/schema.sql
```

**Backend**
```bash
cd backend
cp .env.example .env   # adjust DATABASE_URL if needed
npm install
npm run dev             # http://localhost:4000
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## 9. Design tokens (theme.ts)

Peachy, light, no dark mode:

| Token         | Hex       | Use                          |
|---------------|-----------|-------------------------------|
| `background`  | `#FFF6F0` | page background                |
| `surface`     | `#FFFFFF` | cards, dialogs                 |
| `primary`     | `#FF8C69` | primary buttons, FAB, headline |
| `accent`      | `#FFC9B3` | chips, card borders, hover     |
| `ink`         | `#4A3B35` | body text                      |
| `success`     | `#7FAE8E` | "done" status — intentionally sage, not peach, so status is legible at a glance |

Display type is Quicksand (rounded, friendly); body is Inter. Both loaded via
Google Fonts `<link>` in `index.html` — no extra npm dependency.

## 10. What's intentionally left out of v1

- Auth (see §7)
- Bulk actions / tagging / folders for resources
- Snooze / recurring reminders
- Server-driven push notifications (see §6 upgrade path)

Build these once the CRUD + reminder loop feels right — the schema and
service layer already leave room (e.g. `status` enum, `notes` column) without
a migration.
