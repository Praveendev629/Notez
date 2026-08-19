// Vercel serverless entry point.
// The Express app is mounted directly; DB connection is cached (see config/db.js).
const app = require('../app');
const connectDB = require('../config/db');

// Warm the database connection so the first request is fast.
connectDB().catch((err) => console.error('[notez] DB connect failed:', err.message));

module.exports = app;