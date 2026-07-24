export type ResourceStatus = 'pending' | 'done' | 'dismissed';

// Shape returned to the frontend (camelCase)
export interface Resource {
  id: string;
  userId: string | null;
  url: string;
  title: string;
  notes: string | null;
  remindAt: string; // ISO timestamp
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

// Raw row shape as it comes out of Postgres (snake_case)
export interface ResourceRow {
  id: string;
  user_id: string | null;
  url: string;
  title: string;
  notes: string | null;
  remind_at: string;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateResourceInput {
  url: string;
  title: string;
  notes?: string;
  remindAt: string;
}

export interface UpdateResourceInput {
  url?: string;
  title?: string;
  notes?: string;
  remindAt?: string;
  status?: ResourceStatus;
}
