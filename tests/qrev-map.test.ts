import { describe, expect, it } from 'vitest';

import { qrevMapChartBuilder } from '../src/charts/qrev-map.js';
import { buildSVG } from '../src/render.js';

const data = {
  verticals: [
    { distance: 1, depth: 0.8, cells: [{ depth: 0.1, primaryVelocity: 0.2 }, { depth: 0.5, primaryVelocity: 0.7 }] },
    { distance: 2, depth: 1.2, cells: [{ depth: 0.1, primaryVelocity: 0.3 }, { depth: 0.5, primaryVelocity: 1.1 }] },
  ],
};

describe('qrevMapChartBuilder', () => {
  it('builds a clipped velocity map that renders as SVG', () => {
    const option = qrevMapChartBuilder.build(data, 800, 400);

    expect(option.series).toHaveLength(2);
    expect(option.yAxis).toMatchObject({ inverse: true, min: 0, max: 1.224 });
    expect(option.xAxis.name).toBe('Largo (m)');
    expect(option.yAxis.name).toBe('Profundidad (m)');
    expect(option.graphic[0].children.at(-1).style.text).toBe('Velocidad');
    expect(option.visualMap).toBeUndefined();
    const svg = buildSVG(option, 800, 400);
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain('#fde725');
  });

  it('rejects missing cells', () => {
    expect(() => qrevMapChartBuilder.build({ verticals: [{ distance: 1, depth: 1, cells: [] }] }, 800, 400))
      .toThrow('verticals must contain at least two entries');
  });

});
