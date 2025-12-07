import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface Lodging {
  id: string;
  tripId: string;
  name: string;
  address: string;
  checkIn: string; // YYYY-MM-DD format
  checkOut: string; // YYYY-MM-DD format
  latitude?: number;
  longitude?: number;
  expense?: any;
}

export interface CreateLodgingInput {
  name: string;
  address: string;
  checkIn: string; // YYYY-MM-DD format
  checkOut: string; // YYYY-MM-DD format
  latitude?: number;
  longitude?: number;
}

export interface UpdateLodgingInput {
  name?: string;
  address?: string;
  checkIn?: string;
  checkOut?: string;
  latitude?: number;
  longitude?: number;
}

export const lodgingsApi = {
  create: (tripId: string, data: CreateLodgingInput) => 
    api.post<Lodging>(`/api/trips/${tripId}/lodgings`, data),
  
  getAll: (tripId: string) => 
    api.get<Lodging[]>(`/api/trips/${tripId}/lodgings`),
  
  update: (tripId: string, lodgingId: string, data: UpdateLodgingInput) => 
    api.patch<Lodging>(`/api/trips/${tripId}/lodgings/${lodgingId}`, data),
  
  delete: (tripId: string, lodgingId: string) => 
    api.delete(`/api/trips/${tripId}/lodgings/${lodgingId}`),
};
