import 'dotenv/config';
import http from 'http';
import path from 'path';
import express from 'express';
import { initSchema } from './db';
import { initEventStats } from './eventHandler';
import { attachWebSocketServer } from './wsServer';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (IS_PROD) {
  const staticDir = path.join(__dirname, '..', 'public');
  app.use(express.static(staticDir));
  // SPA fallback — let React Router handle client-side routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

const server = http.createServer(app);

attachWebSocketServer(server);

async function start(): Promise<void> {
  await initSchema();
  await initEventStats();
  console.log('[db] schema ready');

  server.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] fatal startup error:', err);
  process.exit(1);
});
