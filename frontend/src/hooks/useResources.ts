import { useCallback, useEffect, useState } from 'react';
import { resourceApi } from '../api/resourceApi';
import { CreateResourceInput, Resource, UpdateResourceInput } from '../types';

// Centralizes list state + CRUD so components stay presentational.
export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setResources(await resourceApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addResource = useCallback(async (input: CreateResourceInput) => {
    const created = await resourceApi.create(input);
    setResources((prev) => [...prev, created].sort(byRemindAt));
  }, []);

  const editResource = useCallback(async (id: string, input: UpdateResourceInput) => {
    const updated = await resourceApi.update(id, input);
    setResources((prev) => prev.map((r) => (r.id === id ? updated : r)).sort(byRemindAt));
  }, []);

  const removeResource = useCallback(async (id: string) => {
    await resourceApi.remove(id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { resources, loading, error, refresh, addResource, editResource, removeResource };
}

function byRemindAt(a: Resource, b: Resource) {
  return new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime();
}
