import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/pages/trips/services/api';
import { toast } from 'react-toastify';
import {
  FaEdit,
  FaCheck,
  FaTimes,
  FaSuitcase,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
} from 'react-icons/fa';

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [tripCount, setTripCount] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTripCount = async (): Promise<void> => {
      try {
        const response = await tripsApi.getAll();
        const trips = Array.isArray(response.data) ? response.data : [];
        setTripCount(trips.length);
      } catch {
        setTripCount(0);
      }
    };
    fetchTripCount();
  }, []);

  const handleSaveName = async (): Promise<void> => {
    if (!nameInput.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/users/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (!response.ok) throw new Error('Update failed');
      const data = await response.json() as { 'updated user': typeof user };
      setUser(data['updated user']);
      toast.success('Name updated');
      setIsEditingName(false);
    } catch {
      toast.error('Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (): void => {
    setNameInput(user?.name ?? '');
    setIsEditingName(false);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (!user) return null;

  const avatarUrl =
    user.image ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? user.email)}&size=128&background=6366f1&color=fff`;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-5">
      {/* Hero card */}
      <div className="bg-card border border-border/60 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover ring-2 ring-border shrink-0"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-foreground">
            {user.name ?? 'Unnamed User'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          {tripCount !== null && (
            <p className="text-sm text-muted-foreground mt-2">
              {tripCount} {tripCount === 1 ? 'trip' : 'trips'} planned
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-card border border-border/60 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Profile Details
        </h2>
        <div className="divide-y divide-border/60">
          {/* Email row */}
          <div className="flex items-center gap-3 py-3">
            <FaEnvelope className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">Email</div>
              <div className="text-sm text-foreground truncate">{user.email}</div>
            </div>
          </div>

          {/* Name row */}
          <div className="flex items-center gap-3 py-3">
            <FaUser className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">Display Name</div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSaveName();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="flex-1 text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <button
                    onClick={() => void handleSaveName()}
                    disabled={isSaving}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-md transition-colors disabled:opacity-50"
                    aria-label="Save name"
                  >
                    <FaCheck className="text-sm" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                    aria-label="Cancel"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">
                    {user.name ? (
                      user.name
                    ) : (
                      <span className="italic text-muted-foreground">Not set</span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      setNameInput(user.name ?? '');
                      setIsEditingName(true);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    aria-label="Edit name"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border border-border/60 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Activity
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-5 py-3">
            <FaSuitcase className="text-primary text-xl" />
            <div>
              <div className="text-2xl font-bold text-foreground">
                {tripCount ?? '—'}
              </div>
              <div className="text-xs text-muted-foreground">Total Trips</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-card border border-border/60 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Quick Links
        </h2>
        <div className="flex flex-col gap-1">
          <Link
            to="/my-trips"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-foreground"
          >
            <FaSuitcase className="text-muted-foreground" />
            My Trips
          </Link>
          <Link
            to="/trips/create"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-foreground"
          >
            <span className="text-muted-foreground font-bold text-base leading-none">+</span>
            Create New Trip
          </Link>
        </div>
      </div>

      {/* Sign out */}
      <div className="bg-card border border-border/60 rounded-2xl p-6">
        <button
          onClick={() => void handleLogout()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <FaSignOutAlt />
          Sign Out
        </button>
      </div>
    </div>
  );
}
