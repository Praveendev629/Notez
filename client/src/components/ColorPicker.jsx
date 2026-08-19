import { Check } from 'lucide-react';

const COLORS = [
  { id: 'default', className: 'bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-600 dark:to-neutral-700' },
  { id: 'red', className: 'bg-gradient-to-br from-red-300 to-red-400' },
  { id: 'amber', className: 'bg-gradient-to-br from-amber-300 to-amber-400' },
  { id: 'emerald', className: 'bg-gradient-to-br from-emerald-300 to-emerald-400' },
  { id: 'sky', className: 'bg-gradient-to-br from-sky-300 to-sky-400' },
  { id: 'violet', className: 'bg-gradient-to-br from-violet-300 to-violet-400' },
];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          aria-label={`Color ${c.id}`}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-110 ${c.className} ${
            value === c.id ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-[#151823]' : ''
          }`}
        >
          {value === c.id && <Check className="h-4 w-4 text-white" />}
        </button>
      ))}
    </div>
  );
}