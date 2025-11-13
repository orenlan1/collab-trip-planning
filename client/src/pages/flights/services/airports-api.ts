import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface Airport {
  id: number;
  name: string;
  city: string | null;
  country: string | null;
  iata: string | null;
  tzDatabase: string | null;
}

export const airportsApi = {
  search: (query: string) => 
    api.get<Airport[]>(`/api/airports/search?q=${encodeURIComponent(query)}`),
};
