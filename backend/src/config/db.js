import mongoose from 'mongoose';

/**
 * MongoDB / Mongoose Database Connection Manager
 * Gracefully attempts connection without terminating the process on failure,
 * enabling seamless offline/standalone local development.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurolock';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Fast timeout so server startup is not blocked if DB is offline
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Warning: Database connection failed (${error.message}).`);
    console.warn('[MongoDB] Running in standalone development mode without persistent database storage.');
    return null;
  }
};

export default connectDB;
