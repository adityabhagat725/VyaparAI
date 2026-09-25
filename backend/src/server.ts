import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
