import { useNavigate } from 'react-router-dom';
import { Pin, PinOff, Archive, Trash2, FileText, ListTodo } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { docToPreview } from '../utils/editorUtils';

const ACCENTS = {
  default: 'from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-800',
  red: 'from-red-100 to-red-50 dark:from-red-950/50 dark:to-red-900/40',
  amber: 'from-amber-100 to-amber-50 dark:from-amber-950/50 dark:to-amber-900/40',
  emerald: 'from-emerald-100 to-emerald-50 dark:from-emerald-950/50 dark:to-emerald-900/40',
  sky: 'from-sky-100 to-sky-50 dark:from-sky-950/50 dark:to-sky-900/40',
  violet: 'from-violet-100 to-violet-50 dark:from-violet-950/50 dark:to-violet-900/40',
};

function formatWhen(d) {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NoteCard({ note, index = 0, onChanged }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const preview = docToPreview(note.content, 150);
  const accent = ACCENTS[note.color] || ACCENTS.default;
  const done = (note.todoItems || []).filter((t) => t.completed).length;
  const total = (note.todoItems || []).length;

  const open = () => {
    navigate(note.type === 'todo' ? `/app/todos/${note.id}` : `/app/notes/${note.id}`);
  };

  const togglePin = async (e) => {
    e.stopPropagation();
    try {
      await api.setPin(note.id, !note.isPinned);
      onChanged?.();
      toast(note.isPinned ? 'Unpinned note' : 'Pinned note', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const toggleArchive = async (e) => {
    e.stopPropagation();
    try {
      await api.setArchive(note.id, !note.isArchived);
      onChanged?.();
      toast(note.isArchived ? 'Restored note' : 'Archived note', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <article
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      tabIndex={0}
      role="button"
      className={`group relative flex cursor-pointer flex-col rounded-2xl border border-neutral-200 bg-gradient-to-br p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 ${accent} animate-fade-in-up`}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400">
          {note.type === 'todo' ? <ListTodo className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          <button onClick={togglePin} className="rounded-md p-1.5 text-neutral-500 hover:bg-white/60 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white" aria-label={note.isPinned ? 'Unpin' : 'Pin'}>
            {note.isPinned ? <Pin className="h-4 w-4 fill-brand-500 text-brand-500" /> : <PinOff className="h-4 w-4" />}
          </button>
          <button onClick={toggleArchive} className="rounded-md p-1.5 text-neutral-500 hover:bg-white/60 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white" aria-label={note.isArchived ? 'Unarchive' : 'Archive'}>
            <Archive className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="mb-1 line-clamp-2 font-semibold text-neutral-900 dark:text-white">
        {note.title || 'Untitled'}
      </h3>

      {note.type === 'todo' ? (
        <div className="mt-1 space-y-1.5">
          {(note.todoItems || []).slice(0, 4).map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${t.completed ? 'border-brand-500 bg-brand-500 text-white' : 'border-neutral-300 dark:border-neutral-600'}`}>
                {t.completed && '✓'}
              </span>
              <span className={`truncate ${t.completed ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-200'}`}>
                {t.text}
              </span>
            </div>
          ))}
          {total > 0 && (
            <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {done} of {total} completed
            </p>
          )}
        </div>
      ) : (
        <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">{preview || 'No content'}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
        {note.tags?.slice(0, 3).map((t) => (
          <span key={t} className="chip bg-neutral-100/80 dark:bg-neutral-700/50">
            #{t}
          </span>
        ))}
        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
          {formatWhen(note.updatedAt)}
        </span>
      </div>
    </article>
  );
}

// Simple memo to strip nothing (kept for clarity; content is already safe JSON).
function cleanMemo(value, max) {
  const text = docToPlainTextSafe(value);
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function docToPlainTextSafe(doc) {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  let out = '';
  const walk = (node) => {
    if (node.text) out += node.text;
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc);
  return out.replace(/\s+/g, ' ').trim();
}