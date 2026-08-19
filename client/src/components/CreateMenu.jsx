import { useEffect, useRef } from 'react';
import { FileText, ListTodo, X } from 'lucide-react';

export default function CreateMenu({ open, onClose, onSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('mousedown', onClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-label="Create new"
        className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl animate-pop sm:inset-x-auto sm:right-6 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Create</p>
          <button onClick={onClose} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => onSelect('note')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-700"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400">
            <FileText className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-neutral-900 dark:text-white">New note</span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">A rich-text note</span>
          </span>
        </button>
        <button
          onClick={() => onSelect('todo')}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-700"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400">
            <ListTodo className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-neutral-900 dark:text-white">New to-do list</span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">Track tasks with checkboxes</span>
          </span>
        </button>
      </div>
    </>
  );
}