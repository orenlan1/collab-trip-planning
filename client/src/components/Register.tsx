import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import type { RegisterData } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterData>();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const onSubmit = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      setUser(response.data);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('email', {
          type: 'manual',
          message: 'This email is already registered. Please use a different email or try logging in.'
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Registration failed. Please try again.'
        });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl mb-6 text-center">Register</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
            {errors.root.message}
          </div>
        )}
        <div>
          <input
            {...register('name')}
            type="text"
            placeholder="Name (optional)"
            className="w-full p-2 border rounded"
          />
        </div>

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
          Register
        </button>
      </form>

      <button
        onClick={() => authApi.googleLogin()}
        className="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Register with Google
      </button>

      <div className="mt-4 text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button
          onClick={() => navigate('/login')}
          className="text-blue-500 hover:text-blue-700"
        >
          Login here
        </button>
      </div>
    </div>
  );
}
