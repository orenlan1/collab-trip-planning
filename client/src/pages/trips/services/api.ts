import axios from 'axios';
import type { CreateTripRequest } from '../CreateTripPage';
import type { UpdateTripRequest } from '@/types/trip';


const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const tripsApi = {
  create: (data: CreateTripRequest) => api.post('/api/trips', data),
  update: (id: string, data: UpdateTripRequest) => api.patch(`/api/trips/${id}`, data),
  delete: (id: string) => api.delete(`/api/trips/${id}`),
  getAll: () => api.get('/api/trips/'),
  getById: (id: string) => api.get(`/api/trips/${id}`),
  getNewest: (limit: number) => api.get(`/api/trips/newest?limit=${limit}`),
};

export const invitationsApi = {
  invite: (id: string, inviteeEmail: string) => api.post(`/api/trips/${id}/invite`, { email: inviteeEmail }),
};