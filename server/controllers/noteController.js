const Note = require('../models/Note');

// Ownership is always enforced: every query is filtered by the authenticated
// user id derived from the token (req.userId). We never trust a client-sent id.

const listNotes = async (req, res) => {
  const { userId } = req;
  const { type, isPinned, isArchived, sort, completed } = req.query;

  const filter = { userId };

  if (type === 'note' || type === 'todo') filter.type = type;
  if (isPinned === 'true') filter.isPinned = true;
  if (isArchived === 'true') filter.isArchived = true;
  else if (isArchived === 'false') filter.isArchived = false;

  if (type === 'todo' && (completed === 'true' || completed === 'false')) {
    // Include todos that have at least one item matching the completion state.
    filter.todoItems = { $elemMatch: { completed: completed === 'true' } };
  }

  const sortMap = {
    recent: { updatedAt: -1 },
    created: { createdAt: -1 },
    pinned: { isPinned: -1, updatedAt: -1 },
    az: { title: 1 },
  };
  const sortOpts = sortMap[sort] || sortMap.updated;

  const notes = await Note.find(filter).sort(sortOpts).limit(300);
  res.json({ notes: notes.map((n) => n.toSafeJSON()) });
};

const getNote = async (req, res) => {
  const { id } = req.params;
  const note = await Note.findOne({ _id: id, userId: req.userId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ note: note.toSafeJSON() });
};

const createNote = async (req, res) => {
  const data = req.validated;
  const note = await Note.create({ ...data, userId: req.userId });
  res.status(201).json({ note: note.toSafeJSON() });
};

const updateNote = async (req, res) => {
  const { id } = req.params;
  const data = req.validated;
  const note = await Note.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ note: note.toSafeJSON() });
};

const deleteNote = async (req, res) => {
  const { id } = req.params;
  const note = await Note.findOneAndDelete({ _id: id, userId: req.userId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ success: true });
};

const setPinned = async (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.validated || {};
  const note = await Note.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: { isPinned: !!isPinned } },
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ note: note.toSafeJSON() });
};

const setArchived = async (req, res) => {
  const { id } = req.params;
  const { isArchived } = req.validated || {};
  const note = await Note.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: { isArchived: !!isArchived } },
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ note: note.toSafeJSON() });
};

const searchNotes = async (req, res) => {
  const { q } = req.query;
  const term = (q || '').trim();
  if (!term) return res.json({ notes: [] });

  // Regex search scoped to the authenticated user across title, content, tags.
  const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const notes = await Note.find({
    userId: req.userId,
    $or: [
      { title: rx },
      { plainTextContent: rx },
      { tags: rx },
    ],
  })
    .sort({ updatedAt: -1 })
    .limit(100);

  res.json({ notes: notes.map((n) => n.toSafeJSON()) });
};

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  setPinned,
  setArchived,
  searchNotes,
};