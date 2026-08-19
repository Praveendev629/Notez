const mongoose = require('mongoose');

const todoItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    completed: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: { type: String, enum: ['note', 'todo'], default: 'note' },
    title: { type: String, default: '', trim: true, maxlength: 200 },
    // rich-text editor state (TipTap JSON) — a document, not raw user HTML
    content: { type: mongoose.Schema.Types.Mixed, default: '' },
    // plain text derived from content, used for search + previews
    plainTextContent: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    color: { type: String, default: 'default', maxlength: 30 },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    todoItems: [todoItemSchema],
  },
  { timestamps: true }
);

// Server-side ownership + recency index (the spec asks for { userId, updatedAt })
noteSchema.index({ userId: 1, updatedAt: -1 });
// Text index for fast per-user search
noteSchema.index({ title: 'text', plainTextContent: 'text', tags: 'text' });

noteSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    type: this.type,
    title: this.title,
    content: this.content,
    plainTextContent: this.plainTextContent,
    tags: this.tags,
    color: this.color,
    isPinned: this.isPinned,
    isArchived: this.isArchived,
    todoItems: this.todoItems,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Note', noteSchema);