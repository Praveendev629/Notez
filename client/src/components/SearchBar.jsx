import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, FileText, ListTodo } from 'lucide-react';
import { api } from '../services/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debounced, setDebounced] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    api
      .search(debounced)
      .then(({ notes }) => active && setResults(notes))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (id) => {
    setOpen(false);
    setQuery('');
    navigate(id.type === 'todo' ? `/app/todos/${id.id}` : `/app/notes/${id.id}`);
  };

  return (
    <div className="relative max-w-xl flex-1" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="input pl-9"
          placeholder="Search your notes and to-dos"
          aria-label="Search notes"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
              No results for "{query}".
            </p>
          ) : (
            results.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                {n.type === 'todo' ? (
                  <ListTodo className="h-4 w-4 shrink-0 text-brand-500" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-brand-500" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {n.title || 'Untitled'}
                  </span>
                  <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {n.plainTextContent || '-'}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}