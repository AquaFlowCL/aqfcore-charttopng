import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/index.js';

const validPayload = {
  type: 'velocity-depth',
  data: {
    distance: [0, 10, 20],
    velocity: [1.2, 1.4, 1.1],
    depth: [0.5, 0.8, 1.1],
  },
};

describe('POST /chart', () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns png content for a valid velocity-depth request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chart',
      payload: validPayload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/png');
    expect(response.rawPayload.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  it('returns 400 for an unknown chart type', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chart',
      payload: {
        ...validPayload,
        type: 'foo',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'unknown chart type: foo' });
  });

  it('returns 400 when data is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chart',
      payload: {
        type: 'velocity-depth',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
