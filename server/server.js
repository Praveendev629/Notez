const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`[notez] API running at http://localhost:${env.PORT}`);
      console.log(`[notez] Allowed client: ${env.CLIENT_URL}`);
    });
  } catch (err) {
    console.error('[notez] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;