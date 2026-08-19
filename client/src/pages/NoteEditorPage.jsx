import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import ColorPicker from '../components/ColorPicker';
import ConfirmDialog from '../components/ConfirmDialog';
import { docToPlainText, emptyDoc } from '../utils/editorUtils';
import { exportNotePdf } from '../utils/pdf';

export default function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(id ? true : false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(null);
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  const noteId = useRef(id || null);
  const dirtyRef = useRef(false);
  const loadedRef = useRef(false);

  const setDirtyState = useCallback((v) => {
    dirtyRef.current = v;
    setDirty(v);
  }, []);

  // Load existing note
  useEffect(() => {
    if (!id) {
      setContent(emptyDoc());
      loadedRef.current = true;
      return;
    }
    let active = true;
    (async () => {
      try {
        const { note } = await api.note(id);
        if (!active) return;
        setTitle(note.title || '');
        setContent(note.content || emptyDoc());
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

  // Save (create or update)
  const save = useCallback(
    async (silent = false) => {
      if (!loadedRef.current) return;
      const payload = {
        type: 'note',
        title,
        content,
        plainTextContent: docToPlainText(content),
        tags,
        color,
        isPinned,
        isArchived,
      };
      setSaving(true);
      try {
        if (noteId.current) {
          const { note } = await api.updateNote(noteId.current, payload);
          noteId.current = note.id;
          setUpdatedAt(note.updatedAt);
        } else {
          const { note } = await api.createNote(payload);
          noteId.current = note.id;
          setCreatedAt(note.createdAt);
          setUpdatedAt(note.updatedAt);
        }
        setDirtyState(false);
        if (!silent) toast('Note saved', 'success');
      } catch (err) {
        if (!silent) toast(err.message, 'error');
      } finally {
        setSaving(false);
      }
    },
    [title, content, tags, isPinned, isArchived, toast, setDirtyState]
  );

  // Debounced autosave
  const autosaveTimer = useRef(null);
  useEffect(() => {
    if (!dirty || !loadedRef.current) return;
    autosaveTimer.current = setTimeout(() => save(true), 1400);
    return () => clearTimeout(autosaveTimer.current);
  }, [dirty, save]);

  // Warn before leaving with unsaved changes
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

  const markDirty = useCallback(
    (fn) => {
      fn();
      setDirtyState(true);
    },
    [setDirtyState]
  );

  const onDelete = async () => {
    if (!noteId.current) return setConfirmDelete(false);
    try {
      await api.deleteNote(noteId.current);
      toast('Note deleted', 'success');
      navigate('/app', { replace: true });
    } catch (err) {
      toast(err.message, 'error');
    }
    setConfirmDelete(false);
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const note = {
        title,
        type: 'note',
        content,
        plainTextContent: docToPlainText(content),
        tags,
        createdAt,
        updatedAt: updatedAt || new Date().toISOString(),
      };
      exportNotePdf(note, user?.name);
      toast('PDF exported', 'success');
    } catch {
      toast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const togglePin = () => markDirty(() => setIsPinned((p) => !p));
  const toggleArchive = () => markDirty(() => setIsArchived((a) => !a));

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
              <button onClick={toggleArchive} className="btn-secondary px-3 py-2" aria-label="Archive or unarchive">
                <ArchiveIcon archived={isArchived} />
              </button>
              <button onClick={togglePin} className="btn-secondary px-3 py-2" aria-label={isPinned ? 'Unpin' : 'Pin'}>
                {isPinned ? <Pin className="h-4 w-4 fill-brand-500 text-brand-500" /> : <PinOff className="h-4 w-4" />}
              </button>
              <button onClick={onExport} className="btn-secondary px-3 py-2" aria-label="Export PDF">
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              </button>
              <button onClick={onDelete} className="btn-secondary px-3 py-2 text-red-500 hover:text-red-600" aria-label="Delete note">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="card p-6">
            <input
              value={title}
              onChange={(e) => markDirty(() => setTitle(e.target.value))}
              placeholder="Note title"
              className="mb-4 w-full bg-transparent text-2xl font-bold text-neutral-900 placeholder-neutral-300 focus:outline-none dark:text-white dark:placeholder-neutral-600"
            />

            <div className="mb-4">
              <RichTextEditor value={content} onChange={(c) => markDirty(() => setContent(c))} />
            </div>

            <div className="mb-4">
              <TagInput tags={tags} onChange={(t) => markDirty(() => setTags(t))} />
            </div>

            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">Note color</p>
              <ColorPicker value={color} onChange={(c) => markDirty(() => setColor(c))} />
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
        title="Delete this note?"
        message="This action cannot be undone. The note and its content will be permanently removed."
        confirmLabel="Delete"
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function ArchiveIcon({ archived }) {
  return archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />;
}