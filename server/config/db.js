const mongoose = require('mongoose');
const env = require('./env');

let cached = null;

/**
 * Connect to MongoDB. On serverless platforms (Vercel) the connection is cached
 * across warm invocations to avoid creating a new pool on every request.
 */
async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }
  cached = mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
  });
  const conn = await cached;
  mongoose.set('strictQuery', true);
  console.log(`[db] MongoDB connected: ${conn.connection.host}`);
  return conn;
}

module.exports = connectDB;