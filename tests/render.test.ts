import { describe, expect, it } from 'vitest';

import { measurementVisitChartBuilder } from '../src/charts/measurement-visit.js';
import { buildSVG, render } from '../src/render.js';

const option = measurementVisitChartBuilder.build(
  {
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
