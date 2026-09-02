# 🚀 NeuroLock Local Workspace Setup & Contributor Guide

> **Build with भारत 2.0 National Hackathon** | Team **PARADOX**  
> *Concurrent Execution, Environment Setup & Live Demo Workflow*

---

## 📋 Prerequisites

Ensure your development environment meets the following baseline requirements:

| Tool | Minimum Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v18.0.0+` (LTS recommended) | Runtime for Frontend & Backend |
| **npm** | `v9.0.0+` | Package manager & workspace scripts |
| **MongoDB** | `v6.0+` (Local or MongoDB Atlas) | Security event database & user state |
| **LLM API Key** | OpenAI / Gemini API Key | Phase 2 Contextual Intelligence Engine |
| **Twilio / WhatsApp API** | Free Sandbox / Cloud API (Optional) | Mobile alert dispatch testing |

---

## 🏗️ Quick Setup (Concurrent Execution)

From the project root (`CyberForm/` or `NeuroLock/`), you can install all dependencies and run both servers simultaneously using `concurrently`:

```bash
# 1. Install all dependencies across Root, Frontend, and Backend
npm run install:all

# 2. Configure environment variables (see below for .env details)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start Frontend and Backend development servers concurrently
npm run dev
```

The services will start at:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets**: [http://localhost:5000](http://localhost:5000)

---

## ⚙️ Module-by-Module Setup

### 1. Backend Setup (`/backend`)

The backend is built with **Node.js**, **Express.js**, and **MongoDB**.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

#### Backend `.env` Configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGODB_URI=mongodb://localhost:27017/neurolock
# Or MongoDB Atlas: mongodb+srv://<user>:<password>@cluster.mongodb.net/neurolock

# JWT Secret for Auth
JWT_SECRET=super_secret_jwt_key_neurolock_2026

# Contextual Intelligence Engine (LLM API)
LLM_PROVIDER=gemini # Options: gemini | openai
GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here

# Zero-Jargon Delivery (WhatsApp / Twilio Sandbox)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=whatsapp:+919876543210
```

#### Start Backend Server:
```bash
# Development mode with hot-reload (nodemon)
npm run dev

# Standard production start
npm start
```

---

### 2. Frontend Setup (`/frontend`)

The frontend is built with **React.js (Vite)** and **Tailwind CSS**.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

#### Frontend `.env` Configuration:
```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api/v1

# WebSocket Server URL
VITE_WS_SERVER_URL=http://localhost:5000
```

#### Start Frontend Server:
```bash
# Start Vite development server
npm run dev

# Build for production preview
npm run build
npm run preview
```

---

## 🧪 Simulating Attacks & Verifying the Flow (Hackathon Demo)

To showcase NeuroLock's 3-Phase Engine to hackathon judges, use these verification commands:

### Scenario A: Brute-Force Password Burst
Simulate 6 failed login attempts in 10 seconds to trigger rate-burst detection:

```bash
# Run 6 rapid failed requests
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "victim@paradox.in",
      "password": "wrong_password_attempt_'$i'",
      "deviceFingerprint": "botnet-agent-v1"
    }'
  sleep 1
done
```

**Expected Result**:
- Phase 1 flags `BRUTE_FORCE_BURST`.
- Phase 2 synthesizes: *"⚠️ Notice: We observed 6 rapid failed password guesses against victim@paradox.in in under 10 seconds. Account locked automatically to protect user data."*
- Phase 3 flashes a red Critical Alert on the React Dashboard and dispatches WhatsApp notification.

---

### Scenario B: Impossible Travel Anomaly
Simulate two logins separated by 5,000 miles in 1 minute:

```bash
# 1. Login 1 from Mumbai
curl -X POST http://localhost:5000/api/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_test_123",
    "eventType": "LOGIN_SUCCESS",
    "location": { "city": "Mumbai", "country": "India", "lat": 19.0760, "lon": 72.8777 },
    "ipAddress": "103.21.244.1"
  }'

# 2. Login 2 from Frankfurt, Germany 30 seconds later
curl -X POST http://localhost:5000/api/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_test_123",
    "eventType": "LOGIN_SUCCESS",
    "location": { "city": "Frankfurt", "country": "Germany", "lat": 50.1109, "lon": 8.6821 },
    "ipAddress": "185.220.101.5"
  }'
```

**Expected Result**:
- Phase 1 calculates velocity $> 12,000\text{ km/h}$ and flags `IMPOSSIBLE_TRAVEL`.
- Phase 2 LLM generates zero-jargon explanation.
- Phase 3 delivers interactive 1-click **"Lock Account"** button on the live dashboard.

---

## 🛠️ Troubleshooting & Gotchas

1. **MongoDB Connection Failed (`ECONNREFUSED 127.0.0.1:27017`)**:
   - Make sure local MongoDB service is running: `mongod` or `net start MongoDB` on Windows.
   - Alternatively, supply a free MongoDB Atlas cluster URI in `backend/.env`.

2. **CORS Blocked on Frontend**:
   - Verify `CLIENT_URL` in `backend/.env` matches your Vite dev server port (`http://localhost:5173`).

3. **LLM API Rate Limit or Timeout**:
   - The engine includes an automatic deterministic fallback mechanism that generates zero-jargon rule templates if the LLM key is absent or exhausts its quota.

4. **Port 5000 Already in Use**:
   - Change `PORT=5001` in `backend/.env` and update `VITE_API_BASE_URL` in `frontend/.env`.

---

## 👥 Contributor Git Workflow

- **Branch Naming**:
  - Frontend features: `feat/frontend-<component-name>`
  - Backend features: `feat/backend-<route-or-engine-name>`
  - Bug fixes: `fix/<issue-name>`

- **Directory Isolation**:
  - Always perform `cd frontend` before running frontend tests or installing UI packages.
  - Always perform `cd backend` before updating Mongoose schemas or adding Express middleware.
