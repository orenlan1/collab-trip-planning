import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex bg-neutral-900/8 dark:bg-neutral-900/50 border-neutral-200/40 dark:border-neutral-800/60 border-b pt-4 pr-6 pb-4 pl-6 backdrop-blur-sm items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white/80 dark:bg-black/80 flex items-center justify-center text-indigo-600 font-semibold tracking-tight">
            TS
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg tracking-tight text-slate-900 dark:text-slate-100 font-semibold">TripSync</span>
            <span className="text-xs text-slate-600 dark:text-slate-400">Collaborative trip planning</span>
          </div>
        </Link>

        {/* My Trips Link */}
        {user && (
          <Link
            to="/my-trips"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            My Trips
          </Link>
        )}
      </div>

      <nav className="flex items-center gap-4">
        {user ? (
          <>
            <NotificationBell />
            <ThemeToggle />
            <UserMenu user={user} />
          </>
        ) : (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              to="/login"
              className="py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold tracking-tight"
            >
              Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
