import { describe, expect, it } from 'vitest';

import { measurementVisitChartBuilder } from '../src/charts/measurement-visit.js';

const baseData = {
  velocityData: [
    [2, 0.3],
    [4, 0.9],
    [6, 0.2],
  ],
  depthData: [
    [2, -0.5],
    [4, -1.2],
    [6, -0.4],
  ],
  surfaceData: [
    [2, 0.02],
    [4, 0.05],
    [6, 0.03],
  ],
};

describe('measurementVisitChartBuilder', () => {
  it('returns a valid echarts option', () => {
    const option = measurementVisitChartBuilder.build(baseData, 800, 400);

    expect(option.backgroundColor).toBe('#ffffff');
    expect(option.animation).toBe(false);
    expect(option.series).toHaveLength(3);
  });

  it('sets x-axis min/max to the exact data range', () => {
    const option = measurementVisitChartBuilder.build(baseData, 800, 400);

    expect(option.xAxis).toMatchObject({
      type: 'value',
      min: 2,
      max: 6,
    });
  });

  it('finds the widest x range across all series', () => {
    const option = measurementVisitChartBuilder.build(
      {
        velocityData: [
          [0, 0],
          [10, 1],
        ],
        depthData: [
          [3, -1],
          [7, -2],
        ],
        surfaceData: [
          [5, 0],
        ],
      },
      800,
      400,
    );

    expect(option.xAxis.min).toBe(0);
    expect(option.xAxis.max).toBe(10);
  });

  it('passes series data through in order', () => {
    const option = measurementVisitChartBuilder.build(baseData, 800, 400);

    expect(option.series[0]).toMatchObject({
      name: 'Velocidad',
      type: 'line',
      data: baseData.velocityData,
      smooth: true,
    });
    expect(option.series[1]).toMatchObject({
      name: 'Profundidad',
      type: 'line',
      data: baseData.depthData,
      smooth: true,
    });
    expect(option.series[2]).toMatchObject({
      name: 'Superficie',
      type: 'line',
      data: baseData.surfaceData,
      smooth: true,
    });
  });

  it('renders surface as a dashed line', () => {
    const option = measurementVisitChartBuilder.build(baseData, 800, 400);

    expect(option.series[2].lineStyle).toMatchObject({
      type: 'dashed',
    });
  });

  it('defaults units to meters', () => {
    const option = measurementVisitChartBuilder.build(baseData, 800, 400);

    expect(option.xAxis.name).toBe('Distancia horizontal (m)');
    expect(option.yAxis.name).toBe('Velocidad / Profundidad (m)');
  });

  it('uses custom units when provided', () => {
    const option = measurementVisitChartBuilder.build(
      {
        ...baseData,
        distanceUnit: 'ft',
        valueUnit: 'ft/s',
      },
      800,
      400,
    );

    expect(option.xAxis.name).toBe('Distancia horizontal (ft)');
    expect(option.yAxis.name).toBe('Velocidad / Profundidad (ft/s)');
  });

  it('throws when velocityData is missing', () => {
    expect(() =>
      measurementVisitChartBuilder.build(
        {
          depthData: baseData.depthData,
          surfaceData: baseData.surfaceData,
        } as typeof baseData,
        800,
        400,
      ),
    ).toThrow('invalid or missing velocityData array');
  });

  it('throws when depthData is not an array of pairs', () => {
    expect(() =>
      measurementVisitChartBuilder.build(
        {
          ...baseData,
          depthData: [0, -1, -2] as unknown as number[][],
        },
        800,
        400,
      ),
    ).toThrow('invalid or missing depthData array');
  });

  it('scales fonts and spacing by pixelRatio', () => {
    const option = measurementVisitChartBuilder.build(baseData, 800, 400, 3);

    expect(option.xAxis.nameGap).toBe(120);
    expect(option.grid.left).toBe(192);
  });
});
