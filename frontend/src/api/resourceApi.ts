import { supabase } from "../lib/supabaseClient";
import { CreateResourceInput, Resource, UpdateResourceInput } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  // 204 No Content has no body to parse
  return res.status === 204 ? (undefined as T) : res.json();
}

export const resourceApi = {
  list: () => request<Resource[]>("/resources"),
  due: () => request<Resource[]>("/resources/due"),
  create: (input: CreateResourceInput) =>
    request<Resource>("/resources", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: UpdateResourceInput) =>
    request<Resource>(`/resources/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    request<void>(`/resources/${id}`, { method: "DELETE" }),
};
