const express = require('express');
const ctrl = require('../controllers/noteController');
const { requireAuth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const {
  createNoteSchema,
  updateNoteSchema,
  validate,
} = require('../validators/noteValidators');
const { z } = require('zod');

const router = express.Router();

router.use(requireAuth, apiLimiter);

router.get('/search', ctrl.searchNotes);

router.get('/', ctrl.listNotes);
router.get('/:id', ctrl.getNote);
router.post('/', validate(createNoteSchema), ctrl.createNote);
router.put('/:id', validate(updateNoteSchema), ctrl.updateNote);
router.delete('/:id', ctrl.deleteNote);

router.patch(
  '/:id/pin',
  validate(z.object({ isPinned: z.boolean() })),
  ctrl.setPinned
);
router.patch(
  '/:id/archive',
  validate(z.object({ isArchived: z.boolean() })),
  ctrl.setArchived
);

module.exports = router;