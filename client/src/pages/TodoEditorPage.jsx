import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  Pin,
  PinOff,
  Archive,
  RotateCcw,
  FileDown,
  Loader2,
  Plus,
  Pencil,
  X,
  Check,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TagInput from '../components/TagInput';
import ColorPicker from '../components/ColorPicker';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportNotePdf } from '../utils/pdf';

const uid = () => Math.random().toString(36).slice(2, 10);

export default function TodoEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(id ? true : false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  const noteId = useRef(id || null);
  const loadedRef = useRef(false);
  const dirtyRef = useRef(false);
  const setDirtyState = useCallback((v) => {
    dirtyRef.current = v;
    setDirty(v);
  }, []);

  useEffect(() => {
    if (!id) {
      loadedRef.current = true;
      return;
    }
    let active = true;
    (async () => {
      try {
        const { note } = await api.note(id);
        if (!active) return;
        setTitle(note.title || '');
        setItems((note.todoItems || []).slice().sort((a, b) => a.position - b.position));
        setTags(note.tags || []);
        setColor(note.color || 'default');
        setIsPinned(note.isPinned);
        setIsArchived(note.isArchived);
        setCreatedAt(note.createdAt);
        setUpdatedAt(note.updatedAt);
        loadedRef.current = true;
      } catch (err) {
        toast(err.message, 'error');
        navigate('/app', { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, navigate, toast]);

  const save = useCallback(
    async (silent = false) => {
      if (!loadedRef.current) return;
      const payload = {
        type: 'todo',
        title,
        content: '',
        plainTextContent: items.map((i) => i.text).join('\n'),
        tags,
        color,
        isPinned,
        isArchived,
        todoItems: items.map((it, idx) => ({ ...it, position: idx })),
      };
      setSaving(true);
      try {
        if (noteId.current) {
          const { note } = await api.updateNote(noteId.current, payload);
          setUpdatedAt(note.updatedAt);
        } else {
          const { note } = await api.createNote(payload);
          noteId.current = note.id;
          setCreatedAt(note.createdAt);
          setUpdatedAt(note.updatedAt);
        }
        setDirtyState(false);
        if (!silent) toast('To-do list saved', 'success');
      } catch (err) {
        if (!silent) toast(err.message, 'error');
      } finally {
        setSaving(false);
      }
    },
    [title, items, tags, color, isPinned, isArchived, toast, setDirtyState]
  );

  const autosaveTimer = useRef(null);
  useEffect(() => {
    if (!dirty || !loadedRef.current) return;
    autosaveTimer.current = setTimeout(() => save(true), 1400);
    return () => clearTimeout(autosaveTimer.current);
  }, [dirty, save]);

  useEffect(() => {
    const handler = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const mutate = (fn) => {
    fn();
    setDirtyState(true);
  };

  const addTask = () => {
    const text = draft.trim();
    if (!text) return;
    mutate(() => setItems((prev) => [...prev, { id: uid(), text, completed: false, position: prev.length }]));
    setDraft('');
  };

  const updateItem = (itemId, patch) =>
    mutate(() => setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i))));

  const removeItem = (itemId) => mutate(() => setItems((prev) => prev.filter((i) => i.id !== itemId)));

  const move = (index, dir) =>
    mutate(() =>
      setItems((prev) => {
        const next = [...prev];
        const target = index + dir;
        if (target < 0 || target >= next.length) return prev;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      })
    );

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const commitEdit = (itemId) => {
    const text = editText.trim();
    if (!text) return;
    updateItem(itemId, { text });
    setEditingId(null);
    setEditText('');
  };

  const onDelete = async () => {
    if (!noteId.current) return setConfirmDelete(false);
    try {
      await api.deleteNote(noteId.current);
      toast('To-do list deleted', 'success');
      navigate('/app', { replace: true });
    } catch (err) {
      toast(err.message, 'error');
    }
    setConfirmDelete(false);
  };

  const onExport = async () => {
    setExporting(true);
    try {
      exportNotePdf(
        {
          title,
          type: 'todo',
          todoItems: items,
          tags,
          createdAt,
          updatedAt: updatedAt || new Date().toISOString(),
        },
        user?.name
      );
      toast('PDF exported', 'success');
    } catch {
      toast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const done = items.filter((i) => i.completed).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => navigate('/app')} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-1.5">
              <button onClick={() => mutate(() => setIsArchived((a) => !a))} className="btn-secondary px-3 py-2" aria-label="Archive or unarchive">
                {isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </button>
              <button onClick={() => mutate(() => setIsPinned((p) => !p))} className="btn-secondary px-3 py-2" aria-label={isPinned ? 'Unpin' : 'Pin'}>
                {isPinned ? <Pin className="h-4 w-4 fill-brand-500 text-brand-500" /> : <PinOff className="h-4 w-4" />}
              </button>
              <button onClick={onExport} className="btn-secondary px-3 py-2" aria-label="Export PDF">
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              </button>
              <button onClick={() => setConfirmDelete(true)} className="btn-secondary px-3 py-2 text-red-500 hover:text-red-600" aria-label="Delete list">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="card p-6">
            <input
              value={title}
              onChange={(e) => mutate(() => setTitle(e.target.value))}
              placeholder="To-do list title"
              className="mb-3 w-full bg-transparent text-2xl font-bold text-neutral-900 placeholder-neutral-300 focus:outline-none dark:text-white dark:placeholder-neutral-600"
            />

            {/* progress */}
            <div className="mb-5">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <span>
                  {done} of {items.length} completed
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* add task */}
            <div className="mb-5 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask();
                }}
                placeholder="Add a task and press Enter…"
                className="input"
                aria-label="New task"
              />
              <button onClick={addTask} className="btn-primary shrink-0 px-3">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>

            {/* tasks */}
            <ul className="mb-5 space-y-1.5">
              {items.length === 0 && (
                <li className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                  No tasks yet — add your first one above.
                </li>
              )}
              {items.map((item, idx) => (
                <li
                  key={item.id}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                    item.completed
                      ? 'border-neutral-100 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/40'
                      : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                  }`}
                >
                  <button
                    onClick={() => update(item.id, { completed: !item.completed })}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      item.completed
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-neutral-300 text-transparent hover:border-brand-400 dark:border-neutral-600'
                    }`}
                    aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  {editingId === item.id ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => commitEdit(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && commitEdit(item.id)}
                      className="flex-1 rounded border border-brand-300 bg-transparent px-2 py-0.5 text-sm text-neutral-800 focus:outline-none dark:text-neutral-100"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(item)}
                      className={`flex-1 text-sm ${
                        item.completed
                          ? 'text-neutral-400 line-through dark:text-neutral-500'
                          : 'text-neutral-800 dark:text-neutral-100'
                      }`}
                    >
                      {item.text}
                    </span>
                  )}

                  <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => startEdit(item)} className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200" aria-label="Edit task">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(item.id, -1)} className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200" aria-label="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(item.id, 1)} className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200" aria-label="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="rounded p-1 text-neutral-400 hover:text-red-500" aria-label="Delete task">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mb-4">
              <TagInput tags={tags} onChange={(t) => mutate(() => setTags(t))} />
            </div>
            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">List color</p>
              <ColorPicker value={color} onChange={(c) => mutate(() => setColor(c))} />
            </div>

            {(createdAt || updatedAt) && (
              <p className="mb-4 text-xs text-neutral-400 dark:text-neutral-500">
                {createdAt && <>Created {new Date(createdAt).toLocaleString()} · </>}
                Updated {new Date(updatedAt || Date.now()).toLocaleString()}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <span className="mr-auto text-xs text-neutral-400 dark:text-neutral-500">
                {dirty ? 'Unsaved changes…' : 'All changes saved'}
              </span>
              <button onClick={() => navigate('/app')} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => save()} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this list?"
        message="This action cannot be undone. The to-do list and all its tasks will be permanently removed."
        confirmLabel="Delete"
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}