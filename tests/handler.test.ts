import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/index.js';

const validPayload = {
  type: 'measurement-visit',
  data: {
    velocityData: [
      [0, 0],
      [1, 0.3],
      [2, 0.1],
    ],
    depthData: [
      [0, 0],
      [1, -0.5],
      [2, 0],
    ],
    surfaceData: [
      [0, 0.02],
      [1, 0.03],
      [2, 0.02],
    ],
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

  it('returns png content for a valid measurement-visit request', async () => {
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

  it('returns 400 for velocity-depth requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chart',
      payload: {
        ...validPayload,
        type: 'velocity-depth',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'unknown chart type: velocity-depth' });
  });

  it('returns 400 when data is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chart',
      payload: {
        type: 'measurement-visit',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
