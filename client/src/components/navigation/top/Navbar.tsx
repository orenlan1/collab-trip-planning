import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 bg-background/80 border-border/60 border-b px-10 backdrop-blur-md items-center justify-between sticky top-0 z-200">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold tracking-tight shadow-sm">
            TS
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg tracking-tight text-foreground font-semibold">TripSync</span>
            <span className="text-xs text-muted-foreground">Collaborative trip planning</span>
          </div>
        </Link>

        {/* My Trips Link */}
        {user && (
          <Link
            to="/my-trips"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-150"
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
              className="py-2 px-4 rounded-lg bg-linear-to-r from-primary to-violet-500 text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 font-semibold tracking-tight"
            >
              Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
