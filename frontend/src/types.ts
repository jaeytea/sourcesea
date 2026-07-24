export type ResourceStatus = 'pending' | 'done' | 'dismissed';

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

export interface CreateResourceInput {
  url: string;
  title: string;
  notes?: string;
  remindAt: string; // ISO timestamp, built from the datetime-local input
}

export interface UpdateResourceInput {
  url?: string;
  title?: string;
  notes?: string;
  remindAt?: string;
  status?: ResourceStatus;
}
