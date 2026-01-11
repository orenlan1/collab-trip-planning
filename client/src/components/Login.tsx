import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type {LoginData} from '../services/api';
import { useEffect } from 'react';


export function Login() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginData>();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check for error message in URL
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('error');
    if (errorMessage) {
      setError('root', {
        type: 'manual',
        message: decodeURIComponent(errorMessage)
      });
    }
  }, [location, setError]);

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      setUser(response.data);
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/dashboard');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('root', {
          type: 'manual',
          message: 'Invalid email or password'
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Login failed. Please try again.'
        });
      }
    }
  };

  return (
    
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
          <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
            {errors.root.message}
          </div>
        )}
        <div>
          <input
            {...register('email', { required: 'Email is required' })}
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register('password', { required: 'Password is required' })}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>

      <button
        onClick={() => {
          const params = new URLSearchParams(location.search);
          const redirect = params.get('redirect');
          authApi.googleLogin(redirect || undefined);
        }}
        className="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Login with Google
      </button>

      <div className="mt-4 text-center">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          onClick={() => navigate('/register')}
          className="text-blue-500 hover:text-blue-700"
        >
          Register here
        </button>
      </div>
    </div>
  );
}
