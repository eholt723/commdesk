---
title: CommDesk
emoji: 🖥️
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# CommDesk

[![CI / Deploy](https://github.com/eholt723/commdesk/actions/workflows/ci.yml/badge.svg)](https://github.com/eholt723/commdesk/actions/workflows/ci.yml)

A multi-user real-time operations dashboard. Multiple users connect to a shared live view and see the same data simultaneously — events broadcast to all connected clients instantly via WebSocket. Think mini mission control for a business process.

**Demo:** open two browser windows side by side, fire an event in one, and watch both update simultaneously with presence chips and flash animations.

## Features

- **Live event stream** — incoming events displayed with type, status, and timestamp
- **Event resolution** — events start as `processing` and resolve to `success` or `error` after ~4 seconds
- **Presence indicators** — avatar chips (initials + color) update live as users connect and disconnect
- **System health panel** — real-time counters for events processed, active connections, and error rate (real DB failures only)
- **Event generator** — fire simulated business events (order received, payment processed, support ticket, shipment, refund) without external integrations
- **Flash animations** — green/yellow/red card flash on new events, clears after 2 seconds
- **Event replay** — new clients receive the last 50 events on connect
- **Dark/light mode** — toggle persists via localStorage
- **About page** — explains architecture, use cases, and tech stack

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20 + Express 4 |
| Real-time | ws 8 (WebSocket) |
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 (strict, no `any`) |
| Database | PostgreSQL via Neon serverless |
| Testing | Jest 29 + ts-jest |
| Hosting | Docker + Hugging Face Spaces |
| CI/CD | GitHub Actions |

## Project Structure

```
commdesk/
├── server/
│   ├── src/
│   │   ├── index.ts            # Express + HTTP server entry point; serves static frontend in prod
│   │   ├── wsServer.ts         # WebSocket lifecycle: connect, message, close; orchestrates all modules
│   │   ├── broadcastManager.ts # Maintains clientId→WebSocket map; broadcast() and sendTo()
│   │   ├── presenceTracker.ts  # In-memory connected-user map; avatar initials + color assignment
│   │   ├── eventHandler.ts     # Generates random events, persists to DB, tracks health stats
│   │   ├── db.ts               # Neon PostgreSQL client; initSchema, persistEvent, getRecentEvents
│   │   └── types.ts            # All TypeScript interfaces: events, presence, WS message payloads
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── broadcastManager.test.ts
│   │   │   ├── presenceTracker.test.ts
│   │   │   └── eventHandler.test.ts
│   │   └── integration/
│   │       └── db.test.ts               # Runs against a live Neon database
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── App.tsx                      # Root layout: wires all components, connection status indicator
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts          # Connects to WS, handles all server message types, auto-reconnects
│   │   ├── components/
│   │   │   ├── PresenceBar.tsx          # Avatar chip row with live user count
│   │   │   ├── EventStream.tsx          # Scrolling event feed with 2s flash animation
│   │   │   ├── HealthPanel.tsx          # Three stat cards: events, connections, error rate
│   │   │   └── EventGenerator.tsx       # Fire Event button; disabled when disconnected
│   │   ├── pages/
│   │   │   └── About.tsx                # Architecture overview, use cases, tech stack
│   │   └── types/
│   │       └── index.ts                 # Client-side mirror of server types
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile                  # Multi-stage: builds client, compiles server, production image on port 7860
├── docker-compose.yml          # Local production build (maps 7860→3001)
└── .github/workflows/ci.yml    # Jest on every push; deploy to HF Spaces on main pass
```

## Architecture

```
  Browser A                   Browser B
     │                           │
     │  WebSocket (ws://)        │  WebSocket (ws://)
     ▼                           ▼
┌─────────────────────────────────────────┐
│              wsServer.ts                │
│  on connect → addClient + sendTo(init)  │
│  on message → fireEvent()               │
│  on close   → removeClient              │
└────────┬──────────────┬─────────────────┘
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────────┐
│ presence    │  │ broadcastManager │──▶ all open WebSockets
│ Tracker.ts  │  │ .ts              │
└─────────────┘  └──────────────────┘
                         │
                         ▼
               ┌──────────────────┐
               │ eventHandler.ts  │──▶ db.ts (Neon PostgreSQL)
               │ generates event  │
               └──────────────────┘
```

| Layer | Responsibility |
|---|---|
| `wsServer.ts` | Connection lifecycle, message routing, coordinates all modules |
| `broadcastManager.ts` | Maintains live socket registry; fan-out to all connected clients |
| `presenceTracker.ts` | Tracks who is online; assigns initials and avatar color |
| `eventHandler.ts` | Generates typed business events, computes health stats |
| `db.ts` | Persists events to PostgreSQL; replays last 50 on new connection |
| `useWebSocket.ts` | Client hook: connects, dispatches all server message types, auto-reconnects |
| React components | Pure display layer; receive state from `useWebSocket` |

## Local Development

```bash
# Backend
cd server
cp .env.example .env   # add your DATABASE_URL
npm install
npm run dev            # ts-node-dev on port 3001

# Frontend (separate terminal)
cd client
npm install
npm run dev            # Vite on port 5173, proxies /ws → 3001
```

## Testing

Tests are split into unit and integration suites:

```bash
cd server
npm run test:unit         # jest --testPathPattern=tests/unit
npm run test:integration  # jest --testPathPattern=tests/integration
npm test                  # all tests
```

- **Unit tests** — `broadcastManager`, `presenceTracker`, `eventHandler` tested with mocked dependencies
- **Integration tests** — `db.test.ts` runs against a live Neon database; requires `DATABASE_URL` in the environment

CI runs `npm test` (all suites) on every push and pull request to `main`.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow:
1. Runs Jest tests
2. On pass, force-pushes to the Hugging Face Space repo
3. HF rebuilds the Docker image from the multi-stage `Dockerfile`

Required GitHub secrets: `HF_TOKEN`, `HF_SPACE` (`eholt723/CommDesk`)

Set `DATABASE_URL` in the HF Space environment variables.
