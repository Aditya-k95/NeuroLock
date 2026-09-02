# 🛡️ NeuroLock

> **Intelligent Real-Time Anomaly Detection & Zero-Jargon Threat Communication**  
> *Built for the **Build with भारत 2.0 National Hackathon** by Team **PARADOX***

---

## 📌 Problem Statement

In today's interconnected digital landscape, cybersecurity breaches are surging, yet traditional Security Information and Event Management (SIEM) systems and anomaly detection platforms present severe operational bottlenecks for Small & Medium Businesses (SMBs), non-technical admins, and end-users:

1. **Cryptic, Jargon-Heavy Logs**: Incident alerts are filled with indecipherable raw strings (e.g., `401 Unauthorized CIDR /24 anomalous auth burst ip_src=185.220.101.5`), leaving stakeholders paralyzed and unable to evaluate threat severity in real time.
2. **Alert Fatigue & Delayed Remediation**: High noise-to-signal ratios cause critical account takeovers (ATO) and brute-force bursts to be missed until damage is already done.
3. **Expensive, Complex Infrastructure**: Existing enterprise solutions require dedicated Security Operations Center (SOC) personnel and extensive configuration.

### 💡 The NeuroLock Solution
**NeuroLock** transforms complex security telemetry into **instant, actionable, plain-English intelligence**. By combining a high-throughput Node.js/Express threat engine with contextual Large Language Model (LLM) intelligence, NeuroLock identifies suspicious login patterns and traffic spikes in real time and delivers **zero-jargon alerts** directly to an interactive React dashboard and instant messaging channels (WhatsApp).

---

## 🚀 Hackathon Presentation Pillars (MVP Scope)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                NEUROLOCK ENGINE                                 │
├───────────────────────┬─────────────────────────┬───────────────────────────────┤
│ 1. Real-Time Telemetry│ 2. Contextual AI Engine │ 3. Zero-Jargon Multi-Channel  │
│    & Anomaly Engine   │    (LLM Translation)    │    Delivery & Action Hub      │
├───────────────────────┼─────────────────────────┼───────────────────────────────┤
│ • Brute-force spikes  │ • Strips cryptic logs   │ • High-performance React UI   │
│ • Impossible travel   │ • Generates 3-sentence  │ • Real-time Socket.io alerts  │
│ • Device fingerprint  │   plain-English briefing│ • Instant WhatsApp alerts via │
│   mismatch            │ • 1-Click mitigation tip│   Twilio / Cloud API          │
└───────────────────────┴─────────────────────────┴───────────────────────────────┘
```

1. **Pillar 1: High-Speed Ingest & Real-Time Anomaly Detection**
   - Ingests authentication events and endpoint traffic in milliseconds.
   - Evaluates incoming metadata against stateful sliding-window heuristics (brute-force rate spikes, velocity/impossible travel anomalies, device fingerprint deviations).

2. **Pillar 2: Contextual Intelligence & Plain-English Translation**
   - Raw telemetry JSON is enriched with contextual metadata and synthesized via an LLM engine.
   - Converts `401 Unauthorized / ASN 14061 / 18 attempts in 12s` into:  
     > *"⚠️ Someone in Frankfurt, Germany attempted to guess your password 18 times in 12 seconds. We temporarily locked the account to keep your data safe."*

3. **Pillar 3: Zero-Jargon Multi-Channel Delivery & Response**
   - Real-time updates delivered to a sleek, modern React.js + Tailwind CSS Security Operations Dashboard.
   - Instant critical push notifications sent via WhatsApp with one-touch account locking actions.

4. **Pillar 4: Developer Velocity & Contributor Isolation**
   - Strict separation of `/frontend` and `/backend` modules ensuring independent scalability and zero merge conflicts for multidisciplinary teams.

---

## 🛠️ Technology Stack

| Layer | Technologies | Role & Highlights |
| :--- | :--- | :--- |
| **Frontend** | **React.js, Tailwind CSS, Vite, Lucide Icons, Socket.io-client** | High-aesthetic dark-mode dashboard, live telemetry visualizer, real-time alert feed |
| **Backend** | **Node.js, Express.js, Socket.io** | Event ingestion pipeline, anomaly heuristic engine, WebSocket broadcaster |
| **Database** | **MongoDB & Mongoose ODM** | Stateful event logging, user profile baselines, security incident auditing |
| **AI / LLM** | **LLM Synthesis Engine (OpenAI / Gemini API via Node.js SDK)** | Zero-jargon translation, severity grading, plain-English remediation generation |
| **Notification** | **WhatsApp Webhook / Twilio API** | Instant zero-jargon mobile alerting with actionable resolution hooks |

> 🚫 *Strict Stack Policy: Pure JavaScript/TypeScript ecosystem (React + Tailwind on frontend; Node.js + Express + MongoDB on backend). No Python or FastAPI dependencies.*

---

## 📂 Project Structure & Folder Architecture Map

```
CyberForm/
├── .gitignore                   # Global git ignore definitions
├── package.json                 # Root script runner for concurrent workspace execution
├── README.md                    # Main Project Overview & Hackathon Guide
├── docs/                        # Deep-dive documentation
│   ├── ARCHITECTURE.md          # 3-Phase Flow Engine & Technical Specification
│   └── SETUP.md                 # Step-by-step local development & testing guide
│
├── frontend/                    # 🎨 FRONTEND WORKSPACE (React.js + Tailwind CSS)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.jsx             # React DOM entry point
│       ├── App.jsx              # Main layout & router
│       ├── index.css            # Tailwind directives & design tokens
│       ├── components/          # Reusable UI components
│       │   ├── Navbar.jsx       # Global header & system health badge
│       │   ├── AlertCard.jsx    # Plain-English alert card with severity indicator
│       │   ├── TelemetryStream.jsx # Live WebSocket traffic stream
│       │   ├── MetricCounters.jsx  # Aggregated risk & incident metrics
│       │   └── SimulateAttackModal.jsx # Demo attack trigger modal
│       ├── context/             # React Context for Auth & Socket state
│       │   ├── AuthContext.jsx
│       │   └── SocketContext.jsx
│       └── services/            # API client layer
│           └── api.js           # Axios instance & backend endpoints
│
└── backend/                     # ⚙️ BACKEND WORKSPACE (Node.js + Express + MongoDB)
    ├── package.json
    ├── server.js                # Express & Socket.io server bootstrapper
    ├── .env.example
    └── src/
        ├── config/              # Database & external SDK connections
        │   ├── db.js            # MongoDB Mongoose connection
        │   └── llm.js           # LLM API configuration
        ├── models/              # Mongoose database schemas
        │   ├── User.js          # User profile & baseline metadata
        │   ├── SecurityEvent.js # Raw incoming telemetry events
        │   └── ThreatAlert.js   # Detected anomalies & LLM summaries
        ├── controllers/         # Request handlers
        │   ├── authController.js       # Authentication & login validation
        │   ├── telemetryController.js  # Event ingestion endpoint
        │   └── alertController.js      # Alert queries & 1-click resolution
        ├── engine/              # Core Anomaly & AI Logic
        │   ├── anomalyDetector.js      # Rule/heuristic detection (Rate, Geo, Device)
        │   └── contextualIntelligence.js # Prompt engine & LLM translation
        ├── services/            # Notification & third-party integrations
        │   └── whatsappService.js      # Twilio/WhatsApp message dispatcher
        └── routes/              # RESTful API route definitions
            ├── authRoutes.js
            ├── telemetryRoutes.js
            └── alertRoutes.js
```

---

## 👥 Contributor Flow & Isolation Rules

To maintain high development velocity during the hackathon and avoid Git merge conflicts, the codebase enforces strict boundaries:

- **Frontend Contributors**:
  - Work **strictly** inside the `/frontend` directory.
  - Do not edit files inside `/backend` or the root server config.
  - Rely on documented API contracts in [`docs/ARCHITECTURE.md`](file:///docs/ARCHITECTURE.md).

- **Backend Contributors**:
  - Work **strictly** inside the `/backend` directory.
  - Do not modify frontend styles, React components, or client assets.
  - Ensure all new endpoints follow the REST/WebSocket contracts and include sample mock payloads for frontend integration.

---

## 🗺️ Product Roadmap

### 🟢 Phase 1: MVP Scope (*Build with भारत 2.0 Hackathon*)
- [x] Real-time login anomaly detection (Brute force, rapid bursts, impossible travel).
- [x] High-throughput Node.js/Express telemetry ingestion.
- [x] LLM Contextual Intelligence Engine for zero-jargon plain-English translation.
- [x] Real-time React + Tailwind CSS dashboard with live WebSocket stream.
- [x] Instant WhatsApp alert dispatch with action buttons.
- [x] Interactive Attack Simulator for live judge demonstrations.

### 🟡 Phase 2: Post-Hackathon Extended Roadmap
- [ ] **Phishing Email & Domain Scanner**: AI-assisted header and link analysis for incoming business communication.
- [ ] **Malware & Attachment Heuristics**: Lightweight static file signature and payload inspection.
- [ ] **Automated Firewall & Cloudflare Sync**: Automated IP quarantine at CDN/Edge level.
- [ ] **SMS & Slack Integrations**: Expanding beyond WhatsApp to multi-platform notification queues.

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/PARADOX/NeuroLock.git
cd NeuroLock

# 2. Install dependencies concurrently
npm run install:all

# 3. Start local development servers (Frontend: 5173, Backend: 5000)
npm run dev
```

For complete environment configuration, database seeding, and attack simulation instructions, read the [**Setup Guide (`docs/SETUP.md`)**](file:///docs/SETUP.md).

---

## 🏆 Team PARADOX
Crafted with passion for **Build with भारत 2.0 National Hackathon**.  
*Democratizing cybersecurity intelligence through intelligent, zero-jargon automation.*
