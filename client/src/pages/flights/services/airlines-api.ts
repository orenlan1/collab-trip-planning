import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface Airline {
  id: number;
  name: string;
  alias: string | null;
  country: string | null;
  callsign: string | null;
}

export const airlinesApi = {
  search: (query: string) => 
    api.get<Airline[]>(`/api/airlines/search?q=${encodeURIComponent(query)}`),
};
