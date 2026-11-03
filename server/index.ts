// ClaimFight Production Backend Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import router from './routes';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes
app.use('/api', router);

// Serve static frontend files in production if dist/ exists
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err?.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`[ClaimFight Backend] Server running on http://localhost:${PORT}`);
  console.log(`[ClaimFight Backend] Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}`);
  console.log(`[ClaimFight Backend] Gemini API Key Configured: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10)}`);
});

export default app;
