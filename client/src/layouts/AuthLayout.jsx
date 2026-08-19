import { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/Logo';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0d0f17] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0d0f17]">
      {/* subtle gradient header glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      <header className="relative flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark size={40} />
          <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Note<span className="text-brand-500">z</span>
          </span>
        </Link>
      </header>

      <main className="relative flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md animate-fade-in-up">{children}</div>
      </main>
    </div>
  );
}