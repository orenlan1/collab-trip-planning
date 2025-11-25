
export interface Activity {
  id: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  name?: string;
  address?: string;
  image?: string;
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