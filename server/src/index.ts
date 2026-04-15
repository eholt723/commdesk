import 'dotenv/config';
import http from 'http';
import express from 'express';
import { initSchema } from './db';
import { attachWebSocketServer } from './wsServer';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const server = http.createServer(app);

attachWebSocketServer(server);

async function start(): Promise<void> {
  await initSchema();
  console.log('[db] schema ready');

  server.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] fatal startup error:', err);
  process.exit(1);
});
