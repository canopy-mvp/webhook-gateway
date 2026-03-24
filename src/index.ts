import Fastify from 'fastify';
import { webhookRoutes } from './routes/webhooks';
import { healthRoutes } from './routes/health';
import { verifySignature } from './middleware/signature';
import { rateLimiter } from './middleware/rate-limit';
import { logger } from './lib/logger';

const app = Fastify({
  logger: logger,
  trustProxy: true,
});

// Middleware
app.register(rateLimiter);

// Routes
app.register(healthRoutes, { prefix: '/health' });
app.register(webhookRoutes, { prefix: '/webhooks' });

// Global error handler
app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error, requestId: request.id }, 'Unhandled error');
  reply.status(500).send({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error', request_id: request.id },
  });
});

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3004, host: '0.0.0.0' });
  } catch (err) {
    app.log.fatal(err);
    process.exit(1);
  }
};

start();
