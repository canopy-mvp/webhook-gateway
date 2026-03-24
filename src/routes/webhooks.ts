import { FastifyInstance } from 'fastify';
import { verifySignature } from '../middleware/signature';
import { processStripeEvent } from '../handlers/stripe';
import { processPlaidEvent } from '../handlers/plaid';
import { processPartnerEvent } from '../handlers/partner';

export async function webhookRoutes(app: FastifyInstance) {
  // Stripe webhooks
  app.post('/stripe', {
    preHandler: [verifySignature('stripe')],
    handler: async (request, reply) => {
      const event = request.body as Record<string, unknown>;
      await processStripeEvent(event);
      reply.status(200).send({ received: true });
    },
  });

  // Plaid webhooks
  app.post('/plaid', {
    preHandler: [verifySignature('plaid')],
    handler: async (request, reply) => {
      const event = request.body as Record<string, unknown>;
      await processPlaidEvent(event);
      reply.status(200).send({ received: true });
    },
  });

  // Partner bank webhooks
  app.post('/partner/:partnerId', {
    preHandler: [verifySignature('partner')],
    handler: async (request, reply) => {
      const { partnerId } = request.params as { partnerId: string };
      const event = request.body as Record<string, unknown>;
      await processPartnerEvent(partnerId, event);
      reply.status(200).send({ received: true });
    },
  });
}
