import type { User } from "./user";

export interface TripMember {
  id: string;
  userId: string;
  role: string;
  user: User;
}