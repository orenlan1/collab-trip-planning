import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type {LoginData} from '../services/api';
import { useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';

export function Login() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginData>();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
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
      navigate(redirect || '/my-trips');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-200 to-pink-100">
      {/* Main Card Container */}
      <div className="w-full max-w-5xl h-[650px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Image and Branding */}
        <div className="relative w-full md:w-1/2 h-48 md:h-full overflow-hidden bg-slate-900 group">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
            alt="Travel destination"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-900/40"></div>
          
          <div className="absolute inset-0 flex flex-col justify-between p-8 text-white z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 font-bold text-lg">
                TS
              </div>
              <span className="font-bold text-xl tracking-wide">TripSync</span>
            </div>

            {/* Main Content */}
            <div className="hidden md:block space-y-4 mb-8">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center font-semibold text-sm">
                  A
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-semibold text-sm">
                  B
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center font-semibold text-sm">
                  C
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold">
                  +4
                </div>
              </div>
              <h1 className="text-4xl font-bold leading-tight">
                Plan your next<br />adventure together.
              </h1>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 h-full bg-white dark:bg-slate-800 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back!</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Enter your details to access your trips.</p>
            </div>

            {errors.root && (
              <div className="mb-6 p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                {errors.root.message}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={() => {
                const params = new URLSearchParams(location.search);
                const redirect = params.get('redirect');
                authApi.googleLogin(redirect || undefined);
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-slate-700 dark:text-slate-200"
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                  Or login with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  Email
                </label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  id="email"
                  placeholder="adventurer@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition text-sm"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Password
                  </label>
                </div>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition text-sm"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-slate-200 dark:shadow-indigo-500/20 hover:shadow-indigo-200 dark:hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
              >
                Log In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              New to TripSync?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
