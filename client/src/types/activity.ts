
export interface Activity {
  id: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  name?: string;
  address?: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  // Optional expense object returned from the server (may be null)
  expense?: {
    id: string;
    cost: number;
    description?: string | null;
    category?: string | null;
    currency: string;
    createdAt?: string;
  } | null;
  createdAt: string;
}

export interface CreateActivityRequest {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  image?: string;
}