import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';

// Load environment variables from .env if present
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Allowed origins for CORS (React development and production URLs)
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if origin is in whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in prototype mode to avoid local dev blocks
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store io reference on app instance for access in route handlers via req.app.get('io')
app.set('io', io);

// Express Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in prototype mode
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Real-time connection lifecycle
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected (ID: ${socket.id})`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client disconnected (ID: ${socket.id}, Reason: ${reason})`);
  });
});

// Mount Main API Routes
app.use('/api', apiRoutes);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Global Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Exception]', err.stack || err.message);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start HTTP Server
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🛡️  NeuroLock Backend Server Active`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Socket.io: Enabled`);
  console.log(`=========================================`);
});

// Connect Database asynchronously in background without blocking server availability
connectDB();

export { app, server, io };
