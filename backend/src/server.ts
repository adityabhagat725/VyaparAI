import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import apiRouter from './routes';
import { seedDatabase } from './seed/seedData';
import { ProactiveWorker } from './scheduler/proactiveWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'VyaparAI — Agentic Back Office for MSMEs',
    timestamp: new Date().toISOString(),
    demoMode: true,
  });
});

// Mount All API Routes
app.use('/api', apiRouter);

// In production or unified cloud deployments, serve the built frontend
const candidateStaticPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
];
const frontendDist = candidateStaticPaths.find((p) => fs.existsSync(p));

if (frontendDist) {
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

async function startServer() {
  try {
    await connectDB();
    // Auto-seed demo database if first run or empty
    await seedDatabase(false);

    // Start Proactive Background Surveillance Worker
    ProactiveWorker.start(60000); // Checks every minute

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` VyaparAI Backend Server running on http://localhost:${PORT}`);
      console.log(` Agentic Back Office for Indian MSMEs`);
      console.log(` Mode: DEMO MODE (Shree General Store)`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start if not imported as a test module
if (require.main === module) {
  startServer();
}

export { app, startServer };
