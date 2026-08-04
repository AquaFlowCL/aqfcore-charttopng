import Fastify, { type FastifyInstance } from 'fastify';
import { fileURLToPath } from 'node:url';

import { registerChartRoute } from './handler.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({ bodyLimit: 524288 });

  app.addHook('onResponse', (request, reply, done) => {
    if (request.url !== '/health') {
      console.log(
        `[${new Date().toISOString().slice(0, 19)}Z | http] ${request.method} ${request.url} → ${reply.statusCode} (${reply.elapsedTime.toFixed(1)} ms)`,
      );
    }
    done();
  });

  app.get('/health', async () => ({ status: 'ok' }));
  registerChartRoute(app);

  return app;
}

async function start(): Promise<void> {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 3000);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[${new Date().toISOString().slice(0, 19)}Z | service] listening on :${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await start();
}
