import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import { LogoMark } from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0d0f17]/80">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/app')}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Notez home"
        >
          <LogoMark size={34} />
          <span className="hidden text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white sm:block">
            Note<span className="text-brand-500">z</span>
          </span>
        </button>

        <SearchBar />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            className="btn-ghost h-9 w-9 p-0"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {user?.avatarInitials || 'U'}
              </span>
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-neutral-700 dark:text-neutral-200 md:block">
                {user?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg animate-pop dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-700">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{user?.name}</p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}