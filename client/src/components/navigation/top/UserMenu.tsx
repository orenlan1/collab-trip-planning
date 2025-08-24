import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { User } from '../../../context/AuthContext';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-semibold tracking-tight">{user.name || user.email}</div>
        <div className="text-xs text-slate-500">User</div>
      </div>
      <Menu as="div" className="relative">
        <Menu.Button className="w-10 h-10 rounded-full ring-1 ring-neutral-200 overflow-hidden hover:ring-indigo-500 transition">
          <img
            src={user.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.email)}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black dark:ring-white/10 ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/profile')}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-slate-700' : ''
                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200`}
                >
                  Profile
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-slate-700' : ''
                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200`}
                >
                  Settings
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-slate-700' : ''
                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
}
