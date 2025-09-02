import axios from 'axios';
import type { TripFormData } from '../CreateTripPage';


const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface UpdatedTripData {
  title?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
}


export const tripsApi = {
  create: (data: TripFormData) => api.post('/api/trips', data),
  update: (id: string, data: UpdatedTripData) => api.patch(`/api/trips/${id}`, data),
  delete: (id: string) => api.delete(`/api/trips/${id}`),
  getAll: () => api.get('/api/trips/'),
  getById: (id: string) => api.get(`/api/trips/${id}`),
  getNewest: (limit: number) => api.get(`/api/trips/newest?limit=${limit}`),
};

export const invitationsApi = {
  invite: (id: string, inviteeEmail: string) => api.post(`/api/trips/${id}/invite`, { email: inviteeEmail }),
};