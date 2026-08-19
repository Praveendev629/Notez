import { FileText } from 'lucide-react';

export default function EmptyState({ title, body }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        <FileText className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{body}</p>
    </div>
  );
}