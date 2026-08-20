import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useNotes(filter = {}) {
  const [notes, setNotes] = useState(null); // null = loading
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setNotes(null);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.pinned) params.isPinned = 'true';
      if (filter.archived === true) params.isArchived = 'true';
      else if (filter.archived === false) params.isArchived = 'false';
      if (filter.completed !== undefined) params.completed = String(filter.completed);
      if (filter.sort) params.sort = filter.sort;
      const { notes: list } = await api.notes(params);
      setNotes(list);
    } catch (e) {
      setError(e.message);
      setNotes([]);
    }
  }, [
    filter.type,
    filter.pinned,
    filter.archived,
    filter.completed,
    filter.sort,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  // Local mutation helpers (optimistic with rollback handled by caller reload).
  const setNote = useCallback((updated) => {
    setNotes((prev) =>
      prev ? prev.map((n) => (n.id === updated.id ? updated : n)) : prev
    );
  }, []);

  const removeNote = useCallback((id) => {
    setNotes((prev) => (prev ? prev.filter((n) => n.id !== id) : prev));
  }, []);

  const addNote = useCallback((note) => {
    setNotes((prev) => [note, ...(prev || [])]);
  }, []);

  return { notes, error, load, setNote, removeNote, addNote };
}