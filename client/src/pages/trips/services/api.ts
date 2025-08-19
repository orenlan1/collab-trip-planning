import axios from 'axios';
import type { TripFormData } from '../CreateTripPage';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const tripsApi = {
  create: (data: TripFormData) => api.post('/api/trips', data),
  update: (id: string, data: TripFormData) => api.put(`/api/trips/${id}`, data),
  delete: (id: string) => api.delete(`/api/trips/${id}`),
  getAll: () => api.get('/api/trips'),
  getById: (id: string) => api.get(`/api/trips/${id}`),
};

export const invitationsApi = {
  invite: (id: string, inviteeEmail: string) => api.post(`/api/trips/${id}/invite`, { email: inviteeEmail }),
};