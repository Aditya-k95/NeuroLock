/**
 * NeuroLock Socket.io Client Service
 * Manages real-time bidirectional WebSocket event subscriptions.
 */
import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

// Derive WebSocket host from VITE_WS_SERVER_URL or API_BASE_URL
const getSocketUrl = () => {
  if (import.meta.env.VITE_WS_SERVER_URL) {
    return import.meta.env.VITE_WS_SERVER_URL;
  }
  // Strip trailing /api or /api/v1 from API_BASE_URL
  return API_BASE_URL.replace(/\/api(\/v\d+)?\/?$/, '');
};

const SOCKET_URL = getSocketUrl();

let socket = null;

/**
 * Get or initialize the Socket.io client instance
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log(`[Socket.io] Connected to NeuroLock real-time server (${SOCKET_URL})`);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.io] Connection notice:`, error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Disconnected:`, reason);
    });
  }

  return socket;
}

/**
 * Subscribe to incoming real-time security alerts
 * @param {Function} callback - Handler called when a new alert is received
 * @returns {Function} Unsubscribe function to clean up listener
 */
export function onNewAlert(callback) {
  const s = getSocket();

  const handleAlert = (data) => {
    if (typeof callback === 'function') {
      callback(data);
    }
  };

  s.on('new-alert', handleAlert);
  s.on('alert:new', handleAlert);

  return () => {
    s.off('new-alert', handleAlert);
    s.off('alert:new', handleAlert);
  };
}

/**
 * Subscribe to alert status updates (e.g. ACKNOWLEDGED, RESOLVED)
 * @param {Function} callback - Handler called when an alert status is updated
 * @returns {Function} Unsubscribe function
 */
export function onAlertUpdated(callback) {
  const s = getSocket();

  const handleUpdate = (data) => {
    if (typeof callback === 'function') {
      callback(data);
    }
  };

  s.on('alert:updated', handleUpdate);
  s.on('alert-updated', handleUpdate);

  return () => {
    s.off('alert:updated', handleUpdate);
    s.off('alert-updated', handleUpdate);
  };
}

/**
 * Subscribe to live telemetry heartbeat stream
 * @param {Function} callback - Handler called when telemetry event is received
 * @returns {Function} Unsubscribe function
 */
export function onTelemetryStream(callback) {
  const s = getSocket();

  const handleStream = (data) => {
    if (typeof callback === 'function') {
      callback(data);
    }
  };

  s.on('telemetry:stream', handleStream);

  return () => {
    s.off('telemetry:stream', handleStream);
  };
}

/**
 * Disconnect socket cleanly
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default {
  getSocket,
  onNewAlert,
  onAlertUpdated,
  onTelemetryStream,
  disconnectSocket
};
