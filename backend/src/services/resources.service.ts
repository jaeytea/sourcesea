import { pool } from '../db';
import {
  CreateResourceInput,
  Resource,
  ResourceRow,
  UpdateResourceInput,
} from '../types';

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

export async function listResources(userId: string | null): Promise<Resource[]> {
  const { rows } = await pool.query<ResourceRow>(
    `select * from resources
     where user_id is not distinct from $1
     order by remind_at asc`,
    [userId],
  );
  return rows.map(toResource);
}

export async function getDueResources(userId: string | null): Promise<Resource[]> {
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

export async function createResource(
  userId: string | null,
  input: CreateResourceInput,
): Promise<Resource> {
  const { rows } = await pool.query<ResourceRow>(
    `insert into resources (user_id, url, title, notes, remind_at)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [userId, input.url, input.title, input.notes ?? null, input.remindAt],
  );
  return toResource(rows[0]);
}

export async function updateResource(
  userId: string | null,
  id: string,
  input: UpdateResourceInput,
): Promise<Resource | null> {
  const { rows } = await pool.query<ResourceRow>(
    `update resources set
       url       = coalesce($3, url),
       title     = coalesce($4, title),
       notes     = coalesce($5, notes),
       remind_at = coalesce($6, remind_at),
       status    = coalesce($7, status)
     where id = $1 and user_id is not distinct from $2
     returning *`,
    [id, userId, input.url, input.title, input.notes, input.remindAt, input.status],
  );
  return rows[0] ? toResource(rows[0]) : null;
}

export async function deleteResource(userId: string | null, id: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `delete from resources where id = $1 and user_id is not distinct from $2`,
    [id, userId],
  );
  return (rowCount ?? 0) > 0;
}
