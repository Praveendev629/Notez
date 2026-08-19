import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ tags = [], onChange }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim().toLowerCase().replace(/^#/, '');
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Tags
      </label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/30 dark:border-neutral-700 dark:bg-neutral-800">
        {tags.map((t) => (
          <span key={t} className="chip bg-neutral-100 dark:bg-neutral-700">
            #{t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="ml-1 rounded-full hover:text-brand-500"
              aria-label={`Remove tag ${t}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={tags.length ? 'Add tag…' : 'Add tags (press Enter)'}
          className="min-w-[90px] flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
        />
      </div>
    </div>
  );
}