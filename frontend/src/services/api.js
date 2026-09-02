/**
 * NeuroLock Frontend API Client
 * Centralizes all REST communication with the backend.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

/**
 * Generic fetch wrapper with JSON parsing and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Health check endpoint
 */
export async function getHealth() {
  return request('/health');
}

/**
 * Fetch dashboard-level cybersecurity aggregate metrics
 */
export async function getMetrics() {
  return request('/metrics');
}

/**
 * Fetch security threat alerts with optional query filters
 */
export async function getAlerts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/alerts?${query}` : '/alerts';
  return request(endpoint);
}

/**
 * Fetch a single alert by ID
 */
export async function getAlertById(id) {
  return request(`/alerts/${id}`);
}

/**
 * Update the resolution status of an alert (ACTIVE, ACKNOWLEDGED, RESOLVED)
 */
export async function updateAlertStatus(id, status) {
  return request(`/alerts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

/**
 * Trigger an attack simulation vector through the detection pipeline
 */
export async function simulateAttack(type, overrides = {}) {
  return request('/simulate-attack', {
    method: 'POST',
    body: JSON.stringify({ type, overrides })
  });
}

export default {
  API_BASE_URL,
  getHealth,
  getMetrics,
  getAlerts,
  getAlertById,
  updateAlertStatus,
  simulateAttack
};
