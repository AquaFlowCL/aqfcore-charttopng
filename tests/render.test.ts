import { describe, expect, it } from 'vitest';

import { velocityDepthChartBuilder } from '../src/charts/velocity-depth.js';
import { buildSVG, render } from '../src/render.js';

const option = velocityDepthChartBuilder.build(
  {
    distance: [0, 10, 20],
    velocity: [1.1, 1.3, 1.2],
    depth: [0.4, 0.7, 1.0],
  },
  800,
  400,
);

describe('render pipeline', () => {
  it('buildSVG returns an svg string', () => {
    const svg = buildSVG(option, 800, 400);

    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('render returns a PNG buffer for png format', async () => {
    const png = await render(option, 800, 400, 'png');

    expect(Buffer.isBuffer(png)).toBe(true);
    expect((png as Buffer).subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  it('render returns an svg string for svg format', async () => {
    const svg = await render(option, 800, 400, 'svg');

    expect(typeof svg).toBe('string');
    expect((svg as string).startsWith('<svg')).toBe(true);
  });
});
