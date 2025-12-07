import axios from 'axios';
import type { Expense } from '@/types/expense';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface Flight {
  id: string;
  tripId: string;
  flightNumber: string;
  airline: string;
  departure: string; // ISO 8601 format: "2025-10-30T14:45:00Z"
  arrival: string;   // ISO 8601 format: "2025-10-30T14:45:00Z"
  from: string;
  to: string;
  expense?: Expense | null;
}

export interface CreateFlightInput {
  flightNumber: string;
  airline: string;
  departure: string; // ISO 8601 format: "2025-10-30T14:45:00Z"
  arrival: string;   // ISO 8601 format: "2025-10-30T14:45:00Z"
  from: string;
  to: string;
  departureTimezoneId?: string;
  arrivalTimezoneId?: string;
}

export interface UpdateFlightInput {
  flightNumber?: string;
  airline?: string;
  departure?: string;
  arrival?: string;
  from?: string;
  to?: string;
  departureTimezoneId?: string;
  arrivalTimezoneId?: string;
}

export const flightsApi = {
  create: (tripId: string, data: CreateFlightInput) => 
    api.post<Flight>(`/api/trips/${tripId}/flights`, data),
  
  getAll: (tripId: string) => 
    api.get<Flight[]>(`/api/trips/${tripId}/flights`),
  
  update: (tripId: string, flightId: string, data: UpdateFlightInput) => 
    api.patch<Flight>(`/api/trips/${tripId}/flights/${flightId}`, data),
  
  delete: (tripId: string, flightId: string) => 
    api.delete(`/api/trips/${tripId}/flights/${flightId}`),
};
