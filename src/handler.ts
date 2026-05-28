import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { getBuilder, type ChartData } from './charts/index.js';
import { render } from './render.js';

type ChartFormat = 'png' | 'svg';

interface ChartRequestBody {
  type: string;
  width?: number;
  height?: number;
  format?: ChartFormat;
  pixelRatio?: number;
  data: ChartData;
}

const chartBodySchema = {
  type: 'object',
  required: ['type', 'data'],
  properties: {
    type: { type: 'string' },
    width: { type: 'number', default: 800 },
    height: { type: 'number', default: 400 },
    format: { type: 'string', enum: ['png', 'svg'], default: 'png' },
    pixelRatio: { type: 'number', default: 2, minimum: 1, maximum: 4 },
    data: { type: 'object' },
  },
} as const;

async function chartHandler(
  request: FastifyRequest<{ Body: ChartRequestBody }>,
  reply: FastifyReply,
): Promise<Buffer | string> {
  const { type, data, width = 800, height = 400, format = 'png', pixelRatio = 2 } = request.body;
  const builder = getBuilder(type);

  if (!builder) {
    reply.code(400);
    return { error: `unknown chart type: ${type}` } as never;
  }

  const option = builder.build(data, width, height, pixelRatio);
  const output = await render(option, width, height, format, pixelRatio);

  reply.header('Content-Type', format === 'png' ? 'image/png' : 'image/svg+xml');
  return output;
}

export function registerChartRoute(app: FastifyInstance): void {
  app.post<{ Body: ChartRequestBody }>(
    '/chart',
    {
      schema: {
        body: chartBodySchema,
      },
    },
    chartHandler,
  );
}
