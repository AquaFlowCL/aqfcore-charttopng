import { describe, expect, it } from 'vitest';

import { velocityDepthChartBuilder } from '../src/charts/velocity-depth.js';

describe('velocityDepthChartBuilder', () => {
  it('builds a valid ECharts option for well-formed input', () => {
    const option = velocityDepthChartBuilder.build(
      {
        distance: [0, 10, 20],
        velocity: [1.2, 1.4, 1.1],
        depth: [0.5, 0.8, 1.1],
      },
      800,
      400,
    ) as {
      xAxis: { data: number[] };
      yAxis: Array<{ inverse?: boolean }>;
      series: Array<{ name: string; yAxisIndex?: number }>;
    };

    expect(option.xAxis.data).toEqual([0, 10, 20]);
    expect(option.yAxis).toHaveLength(2);
    expect(option.yAxis[1]?.inverse).toBe(true);
    expect(option.series).toHaveLength(2);
    expect(option.series[0]?.name).toBe('Velocity');
    expect(option.series[1]?.yAxisIndex).toBe(1);
  });

  it('throws for missing data fields', () => {
    expect(() =>
      velocityDepthChartBuilder.build(
        {
          distance: [0, 10, 20],
          velocity: [1.2, 1.4, 1.1],
        },
        800,
        400,
      ),
    ).toThrow(/depth/);
  });
});
