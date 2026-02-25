# Sportz Backend 

A high-performance real-time sports commentary and score tracking engine. Built with a focus on security, strict data validation, and scalable real-time communication.

> **Note**: Inspired by the JavaScript Mastery WebSocket series, significantly re-engineered with **TypeORM** and **Zod 4**.

## Tech Stack

* **Runtime**: Node.js (ESM)
* **Framework**: Express
* **ORM**: TypeORM (PostgreSQL) — *Migrated from Drizzle for entity-based management*
* **Database**: Neon (Serverless Postgres)
* **Security**: Arcjet (Bot Detection, Rate Limiting, WS Protection)
* **Validation**: Zod 4 (Utilizing latest ISO date-time validation)
* **Real-time**: WebSockets (via `ws` library)

## Key Engineering Improvements

While the core concept follows modern WebSocket patterns, this implementation introduces several professional-grade enhancements:

* **Advanced Database Layer**: Replaced Drizzle with **TypeORM**, implementing the Data Mapper pattern, entity schemas, and a structured migration workflow.
* **Secure WebSocket Handshake**: Custom upgrade handling integrated with **Arcjet** using a `noServer` configuration. This ensures clients are vetted for bots and rate limits *before* the connection is established.
* **Modern Validation Standards**: Leveraged **Zod 4** to implement strict validation, ensuring data integrity across REST and WS layers.
* **Production-Ready Infrastructure**: Fully optimized for **Render** with dynamic port binding and automated TypeORM migration execution on startup.

## Quick Start

### 1. Installation
```bash
npm install

```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_url
ARCJET_KEY=your_arcjet_api_key
ARCJET_MODE=LIVE # Use DRY_RUN for local development
PORT=8000
FRONTEND_URL=http://localhost:3000 # Required for CORS

```

### 3. Database Setup

```bash
# Run migrations to set up your schema
npm run migration:run

```

### 4. Running the App

```bash
# Development mode with watch
npm run dev

# Production mode
npm start

```

## API & WebSocket Protocol

### REST Endpoints

* **Matches**
* `GET /matches` — Retrieve a list of recent matches (supports `?limit=X`).
* `POST /matches` — Create a new match (broadcasts `match_created`).
* `PATCH /matches/:id/score` — Update match score and status (broadcasts `score_update`).


* **Commentary**
* `GET /matches/:id/commentary` — Retrieve historical commentary for a specific match.
* `POST /matches/:id/commentary` — Add a new commentary event (broadcasts `commentary`).


### WebSocket Protocol

Connect to: `ws://your-app-url/ws`

* **Client Actions**:
* `subscribe` — Subscribe to updates for a specific `matchId`.
* `unsubscribe` — Stop receiving updates for a `matchId`.
* `ping` — Keep-alive heartbeat.


* **Server Broadcasts**:
* `match_created` — Dispatched globally when a new match is added.
* `score_update` — Dispatched to match subscribers when the score or status changes.
* `commentary` — Dispatched to match subscribers when a new update is posted.
* `welcome` — Initial connection confirmation.
* `error` — Dispatched on invalid JSON or protocol violations.


## Security & CORS

The API is protected by **Arcjet**. For local development, ensure your `FRONTEND_URL` in `.env` matches your Next.js dev server address to avoid CORS blocking.

## Acknowledgments

This project was inspired by the **Live Sports Events** tutorial by [JavaScript Mastery](https://www.youtube.com/@javascriptmastery). I have taken the core real-time concept and re-engineered the backend infrastructure from the ground up, specifically replacing the ORM layer, upgrading validation standards to Zod 4, and implementing a security-first manual WebSocket handshake.

---
*Built for performance and security.*
