import app from './app.js';
import { initDb } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('----------------------------------------------------');
    console.log('1. Loading Environment Variables...');
    console.log('2. Initializing Express Application & Security Middleware...');

    console.log('3. Connecting Database & Verifying Schemas...');
    await initDb();

    console.log('4. Initializing Gemini AI Service Context...');
    console.log('5. Registering Enterprise Routes & Rate Limiters...');

    app.listen(PORT, () => {
      console.log(`🚀 NexusAI Enterprise Server listening on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log('----------------------------------------------------');
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
}

startServer();
