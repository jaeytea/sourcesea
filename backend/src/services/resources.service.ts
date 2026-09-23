import { pool } from "../db";
import {
  CreateResourceInput,
  Resource,
  ResourceRow,
  UpdateResourceInput,
} from "../types";
import {
  deleteReminderEmail,
  scheduleReminderEmail,
  updateReminderEmail,
} from "./email.service";

// Maps a raw Postgres row to the camelCase shape the API returns
function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    userId: row.user_id,
    url: row.url,
    title: row.title,
    notes: row.notes,
    remindAt: row.remind_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// NOTE: userId is threaded through every query already so that adding
// `where user_id = $1` (or RLS) later is a non-breaking change.

export async function listResources(
  userId: string | null,
): Promise<Resource[]> {
  const { rows } = await pool.query<ResourceRow>(
    `select * from resources
     where user_id is not distinct from $1
     order by remind_at asc`,
    [userId],
  );
  return rows.map(toResource);
}

export async function getDueResources(
  userId: string | null,
): Promise<Resource[]> {
  const { rows } = await pool.query<ResourceRow>(
    `select * from resources
     where user_id is not distinct from $1
       and status = 'pending'
       and remind_at <= now()
     order by remind_at asc`,
    [userId],
  );
  return rows.map(toResource);
}

// export async function createResource(
//   userId: string | null,
//   userEmail: string | null,
//   input: CreateResourceInput,
// ): Promise<Resource> {
//   const duplicate = await findResourceByUrl(userId, input.url);
//   if (duplicate) throw new DuplicateResourceError();

//   const { rows } = await pool.query<ResourceRow>(
//     `insert into resources (user_id, url, title, notes, remind_at)
//      values ($1, $2, $3, $4, $5)
//      returning *`,
//     [userId, input.url, input.title, input.notes ?? null, input.remindAt],
//   );
//   return toResource(rows[0]);
// }

export async function createResource(
  userId: string | null,
  userEmail: string | null,
  input: CreateResourceInput,
): Promise<Resource> {
  const duplicate = await findResourceByUrl(userId, input.url);

  if (duplicate) throw new DuplicateResourceError();

  if (!userEmail || !userId) {
    throw new Error(
      "Authenticated user email and ID are required for reminders",
    );
  }
  const { rows: countRows } = await pool.query<{ count: number }>(
    `select count(*)::int as count
     from resources
     where user_id = $1
       and status = 'pending'
       and email_schedule_id is not null`,
    [userId],
  );

  if (countRows[0].count >= 10) {
    throw new ReminderLimitError();
  }

  const { rows } = await pool.query<ResourceRow>(
    `insert into resources (user_id, url, title, notes, remind_at)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [userId, input.url, input.title, input.notes ?? null, input.remindAt],
  );

  const row = rows[0];

  const scheduled = await scheduleReminderEmail({
    to: userEmail,
    title: row.title,
    url: row.url,
    notes: row.notes,
    remindAt: row.remind_at,
  });

  await pool.query(
    `update resources
     set email_schedule_id = $1
     where id = $2`,
    [scheduled.draft_id, row.id],
  );

  return toResource({
    ...row,
    email_schedule_id: scheduled.draft_id,
  });
}

//update resouce
export async function updateResource(
  userId: string | null,
  userEmail: string | null,
  id: string,
  input: UpdateResourceInput,
): Promise<Resource | null> {
  if (input.url && (await findResourceByUrl(userId, input.url, id))) {
    throw new DuplicateResourceError();
  }
  const existingResult = await pool.query<ResourceRow>(
    `select *
     from resources
     where id = $1
       and user_id is not distinct from $2`,
    [id, userId],
  );

  const existing = existingResult.rows[0];

  if (!existing) {
    return null;
  }

  const { rows } = await pool.query<ResourceRow>(
    `update resources set
       url       = coalesce($3, url),
       title     = coalesce($4, title),
       notes     = coalesce($5, notes),
       remind_at = coalesce($6, remind_at),
       status    = coalesce($7, status)
     where id = $1 and user_id is not distinct from $2
     returning *`,
    [
      id,
      userId,
      input.url,
      input.title,
      input.notes,
      input.remindAt,
      input.status,
    ],
  );
  const updated = rows[0];

  if (!updated) {
    return null;
  }

  // If this resource has an AgentMail reminder, keep it in sync.
  if (existing.email_schedule_id && userEmail) {
    await updateReminderEmail({
      draftId: existing.email_schedule_id,
      to: userEmail,
      title: updated.title,
      url: updated.url,
      notes: updated.notes,
      remindAt: updated.remind_at,
    });
  }
  return updated ? toResource(updated) : null;
}

export class DuplicateResourceError extends Error {
  constructor() {
    super("This URL is already parked.");
    this.name = "DuplicateResourceError";
  }
}
export class ReminderLimitError extends Error {
  constructor() {
    super("You can have up to 10 active email reminders.");
    this.name = "ReminderLimitError";
  }
}

async function findResourceByUrl(
  userId: string | null,
  url: string,
  excludeId?: string,
) {
  const { rows } = await pool.query<{ id: string }>(
    `select id from resources
     where user_id is not distinct from $1
       and lower(trim(url)) = lower(trim($2))
       ${excludeId ? "and id <> $3" : ""}
     limit 1`,
    excludeId ? [userId, url, excludeId] : [userId, url],
  );
  return rows[0] ?? null;
}

export async function deleteResource(
  userId: string | null,
  id: string,
): Promise<boolean> {
  const existingResult = await pool.query<ResourceRow>(
    `select *
     from resources
     where id = $1
       and user_id is not distinct from $2`,
    [id, userId],
  );

  const existing = existingResult.rows[0];

  if (!existing) {
    return false;
  }

  // Cancel  scheduled Agent Mail reminder first.
  if (existing.email_schedule_id) {
    await deleteReminderEmail(existing.email_schedule_id);
  }

  const { rowCount } = await pool.query(
    `delete from resources where id = $1 and user_id is not distinct from $2`,
    [id, userId],
  );
  return (rowCount ?? 0) > 0;
}
