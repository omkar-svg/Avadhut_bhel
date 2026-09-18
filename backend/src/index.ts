import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ensureDatabase } from './data-source';
import billRoutes from './routes/bills';
import reportRoutes from './routes/reports';
import customerRoutes from './routes/customers';
import menuRoutes from './routes/menu';
import { seedMenuIfEmpty } from './seed-menu';
import { removeExpiredBillHistory } from './services/historyCleanup';

dotenv.config();

const app = express();
const PORT = Number.parseInt(process.env.PORT || '3001', 10);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Ensure Database connection for every request (essential for serverless Vercel)
let initTasksDone = false;
app.use(async (_req, res, next) => {
  try {
    await ensureDatabase();
    if (!initTasksDone) {
      initTasksDone = true;
      Promise.all([seedMenuIfEmpty(), removeExpiredBillHistory()]).catch((err) => {
        console.warn('Initial setup background task warning:', err);
      });
    }
    next();
  } catch (error) {
    console.error('Database connection error in request:', error);
    res.status(500).json({ error: 'Database connection failed. Please check DATABASE_URL.' });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Avadhut Bhel API is running 🍽️', env: process.env.NODE_ENV || 'development' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/menu-items', menuRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start Standalone Server (When not in Vercel Serverless environment) ──────
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  ensureDatabase()
    .then(() => Promise.all([seedMenuIfEmpty(), removeExpiredBillHistory()]))
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Avadhut Bhel API running at http://localhost:${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/api/health`);
      });

      setInterval(() => {
        removeExpiredBillHistory().catch((error) => console.error('History cleanup failed:', error));
      }, 60 * 60 * 1000);
    })
    .catch((err) => {
      console.error('❌ Failed to start server:', err);
    });
}

export default app;
