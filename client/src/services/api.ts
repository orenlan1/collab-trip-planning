import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name?: string;
}

export const authApi = {
  login: (data: LoginData) => 
    api.post('/auth/login', data),
  
  register: (data: RegisterData) =>
    api.post('/auth/register', data),
    
  logout: () =>
    api.post('/auth/logout'),

  googleLogin: (redirect?: string) => {
    const url = new URL('http://localhost:3000/auth/google');
    if (redirect) {
      url.searchParams.set('redirect', redirect);
    }
    window.location.href = url.toString();
  },
};
