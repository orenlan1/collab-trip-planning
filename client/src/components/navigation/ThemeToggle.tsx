import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ts-theme') || 'light';
    setIsDark(saved === 'dark');
    applyTheme(saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(newDark);
    localStorage.setItem('ts-theme', newDark ? 'dark' : 'light');
  };

  const applyTheme = (dark: boolean) => {
    const body = document.body;
    if (dark) {
      body.classList.remove('bg-sky-50', 'text-slate-900');
      body.classList.add('bg-slate-900', 'text-slate-100');
      document.querySelector('header')?.classList.remove('bg-neutral-900/8', 'border-neutral-200/40');
      document.querySelector('header')?.classList.add('bg-neutral-900/50', 'border-neutral-800/60');
    } else {
      body.classList.remove('bg-slate-900', 'text-slate-100');
      body.classList.add('bg-sky-50', 'text-slate-900');
      document.querySelector('header')?.classList.remove('bg-neutral-900/50', 'border-neutral-800/60');
      document.querySelector('header')?.classList.add('bg-neutral-900/8', 'border-neutral-200/40');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 rounded-md hover:bg-neutral-200/60 transition ring-1 ring-transparent focus:ring-2 focus:ring-indigo-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {isDark ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z"
          />
        )}
      </svg>
    </button>
  );
}
