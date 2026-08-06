import app from '../server/src/app.js';

export default function handler(req, res) {
  try {
    console.log(`[Vercel Function] ${req.method} ${req.url}`);
    return app(req, res);
  } catch (err) {
    console.error("[Vercel Serverless Function Error]:", err);
    console.error(err.stack);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message || 'Serverless function execution error'
      });
    }
  }
}
