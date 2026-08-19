const { z } = require('zod');

const todoItemSchema = z.object({
  id: z.string().min(1).max(60),
  text: z.string().trim().min(1).max(500),
  completed: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
});

const colorRegex = /^[a-z0-9-]{0,30}$/;

const createNoteSchema = z.object({
  type: z.enum(['note', 'todo']).default('note'),
  title: z.string().trim().max(150).default(''),
  content: z.any().default(''),
  plainTextContent: z.string().max(20000).default(''),
  tags: z.array(z.string().trim().toLowerCase().max(40)).max(25).default([]),
  color: z.string().regex(colorRegex).default('default'),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  todoItems: z.array(todoItemSchema).max(200).default([]),
});

const updateNoteSchema = createNoteSchema.partial();

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid input';
      return res.status(400).json({ error: message });
    }
    req.validated = parsed.data;
    return next();
  };
}

module.exports = { createNoteSchema, updateNoteSchema, validate };