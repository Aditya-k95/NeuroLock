import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_SERVER_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initializes and returns the shared Socket.io client instance.
 * Gracefully reconnects with exponential backoff if the backend restarts.
 */
export const initSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log(`[Socket.io] Connected to NeuroLock real-time stream (${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Stream disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.io] Stream connection notice: ${error.message}`);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export default {
  initSocket,
  getSocket
};

