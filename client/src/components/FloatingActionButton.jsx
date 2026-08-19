import { Plus } from 'lucide-react';

export default function FloatingActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Create new"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl active:scale-95"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}