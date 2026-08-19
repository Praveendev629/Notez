const cards = Array.from({ length: 6 });

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#151823]">
          <div className="mb-4 h-8 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
          <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mb-1 h-3 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="mb-1 h-3 w-5/6 rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="mb-4 h-3 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 shimmer" style={{ animation: 'shimmer 1.4s infinite' }} />
        </div>
      ))}
    </div>
  );
}