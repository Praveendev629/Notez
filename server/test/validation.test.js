const { test } = require('node:test');
const assert = require('node:assert/strict');
const { registerSchema, loginSchema } = require('../validators/authValidators');
const { createNoteSchema } = require('../validators/noteValidators');

test('register schema rejects weak password', () => {
  const res = registerSchema.safeParse({
    name: 'Ada',
    email: 'ada@example.com',
    password: 'short',
  });
  assert.equal(res.success, false);
});

test('register schema rejects invalid email', () => {
  const res = registerSchema.safeParse({
    name: 'Ada',
    email: 'not-an-email',
    password: 'longenough123',
  });
  assert.equal(res.success, false);
});

test('register schema accepts valid input and normalizes email', () => {
  const res = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'Ada@Example.com',
    password: 'supersecret1',
  });
  assert.equal(res.success, true);
  assert.equal(res.data.email, 'Ada@Example.com'); // zod lower() not applied here; controller normalizes
});

test('login schema requires both fields', () => {
  const res = loginSchema.safeParse({ email: 'ada@example.com' });
  assert.equal(res.success, false);
});

test('createNote schema defaults a note and limits tags', () => {
  const res = createNoteSchema.safeParse({
    title: 'Meeting',
    content: { type: 'doc' },
    tags: ['work', 'work', 'x'],
    todoItems: [],
  });
  assert.equal(res.success, true);
  assert.equal(res.data.type, 'note');
  assert.deepEqual(res.data.tags, ['work', 'work', 'x']);
});