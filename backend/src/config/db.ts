import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vyaparai';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (!forceMemory) {
    try {
      console.log(`Connecting to MongoDB at: ${uri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log('MongoDB connected successfully to primary database.');
      return conn;
    } catch (err: any) {
      console.warn(`Local MongoDB connection failed (${err.message}). Falling back to In-Memory MongoDB for local demo mode...`);
    }
  } else {
    console.log('USE_MEMORY_DB is set to true. Initializing In-Memory MongoDB instance...');
  }

  try {
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    console.log(`In-Memory MongoDB started at: ${memoryUri}`);
    const conn = await mongoose.connect(memoryUri);
    console.log('Connected to In-Memory MongoDB successfully.');
    return conn;
  } catch (memErr: any) {
    console.error('Failed to initialize In-Memory MongoDB:', memErr);
    throw memErr;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
