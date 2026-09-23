import { Request, Response } from "express";
import * as resourcesService from "../services/resources.service";

// TODO(auth): once Google OAuth via Supabase is added, pull this from the
// verified JWT instead of hardcoding null (single-user mode for now).
function currentUserId(req: Request): string | null {
  return req.userId ?? null;
}

export async function list(req: Request, res: Response) {
  const resources = await resourcesService.listResources(currentUserId(req));
  res.json(resources);
}

export async function due(req: Request, res: Response) {
  const resources = await resourcesService.getDueResources(currentUserId(req));
  res.json(resources);
}

export async function create(req: Request, res: Response) {
  const { url, title, notes, remindAt } = req.body;
  if (!url || !title || !remindAt) {
    return res
      .status(400)
      .json({ error: "url, title and remindAt are required" });
  }
  try {
    const resource = await resourcesService.createResource(
      currentUserId(req),
      req.userEmail ?? null,
      {
        url,
        title,
        notes,
        remindAt,
      },
    );
    res.status(201).json(resource);
  } catch (error) {
    if (error instanceof resourcesService.DuplicateResourceError) {
      return res.status(409).json({ error: error.message });
    }
    throw error;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const resource = await resourcesService.updateResource(
      currentUserId(req),
      req.userEmail ?? null,
      req.params.id,
      req.body,
    );
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.json(resource);
  } catch (error) {
    if (error instanceof resourcesService.DuplicateResourceError) {
      return res.status(409).json({ error: error.message });
    }
    throw error;
  }
}

export async function remove(req: Request, res: Response) {
  const deleted = await resourcesService.deleteResource(
    currentUserId(req),
    req.params.id,
  );
  if (!deleted) return res.status(404).json({ error: "Resource not found" });
  res.status(204).send();
}
