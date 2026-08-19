// Optional demo-account seed script.
// Creates a demo user (demo@notez.app / password: DemoPass123) with a few
// sample notes and a to-do list.
//
// Usage:
//   node scripts/seed.js
//
// Requires MONGODB_URI and JWT_SECRET in server/.env (or environment).

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Note = require('../models/Note');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notez';
  await mongoose.connect(uri);
  console.log('[seed] connected');

  const email = 'demo@notez.app';
  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash('Demo1234', 12);
    user = await User.create({ name: 'Demo User', email, passwordHash });
    console.log('[seed] created demo user', email);
  } else {
    console.log('[seed] demo user already exists');
  }

  await Note.deleteMany({ userId: user._id });

  const demoNotes = [
    {
      type: 'note',
      title: 'Welcome to Notez',
      tags: ['welcome', 'notes'],
      color: 'sky',
      isPinned: true,
      plainTextContent: 'Create notes, to-do lists, add tags, choose a color and pin things you want to keep handy.',
      content: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Welcome to Notez' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Create notes, to-do lists, add tags, choose a color and pin anything you want to keep handy.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Your data is private — you can only ever see your own notes.' }] },
        ],
      },
    },
    {
      type: 'note',
      title: 'Ideas & inspiration',
      tags: ['ideas'],
      color: 'violet',
      isPinned: false,
      plainTextContent: 'An example note to show the rich text editor: bold, italic, lists and more.',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'The editor supports ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'bold' }, { type: 'text', text: ', ' }, { type: 'text', marks: [{ type: 'italic' }], text: 'italic' }, { type: 'text', text: ', ' }, { type: 'text', marks: [{ type: 'underline' }], text: 'underline' }, { type: 'text', text: ' and more.' }] },
          { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bulleted lists' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Numbered lists' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Headings' }] }] },
          ] },
        ],
      },
    },
    {
      type: 'todo',
      title: 'Ship Notez 🚀',
      tags: ['launch', 'product'],
      color: 'emerald',
      isPinned: false,
      plainTextContent: 'Set up MongoDB\nBuild the API\nBuild the UI\nDeploy',
      todoItems: [
        { id: 't1', text: 'Set up MongoDB', completed: true, position: 0 },
        { id: 't2', text: 'Build the API', completed: true, position: 1 },
        { id: 't3', text: 'Build the UI', completed: false, position: 2 },
        { id: 't4', text: 'Deploy to Vercel', completed: false, position: 3 },
      ],
    },
  ];

  await Note.insertMany(demoNotes.map((n) => ({ ...n, userId: user._id })));
  console.log('[seed] created', demoNotes.length, 'sample notes');
  console.log('[seed] done. Sign in with:', email, '/ Demo1234');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});