import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface Destination {
  type: 'city' | 'country';
  id: number;
  name: string;
  country?: string;
  tzDatabase: string | null;
}

export const destinationsApi = {
  search: (query: string) => 
    api.get<Destination[]>(`/api/destinations/search?q=${encodeURIComponent(query)}`),
};
