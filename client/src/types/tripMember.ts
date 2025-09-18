import type { User } from "./user";

export interface TripMember {
  userId: string;
  role: string;
  user: User;
}