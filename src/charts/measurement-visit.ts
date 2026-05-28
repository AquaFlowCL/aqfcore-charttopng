import type { ChartBuilder, ChartData } from './index.js';

type XYPair = [number, number];

function isXYArray(value: unknown): value is XYPair[] {
  return Array.isArray(value) && value.every(Array.isArray);
}

function getSeries(data: ChartData, key: 'velocityData' | 'depthData' | 'surfaceData'): XYPair[] {
  const value = data[key];
  if (!isXYArray(value)) throw new Error(`invalid or missing ${key} array`);
  return value;
}

export const measurementVisitChartBuilder: ChartBuilder = {
  build(data, _width, _height, pixelRatio = 1) {
    const velocityData = getSeries(data, 'velocityData');
    const depthData = getSeries(data, 'depthData');
    const surfaceData = getSeries(data, 'surfaceData');

    const distanceUnit = (data.distanceUnit as string | undefined) ?? 'm';
    const valueUnit = (data.valueUnit as string | undefined) ?? 'm';
    const s = pixelRatio;

    return {
      backgroundColor: '#ffffff',
      animation: false,
      tooltip: { trigger: 'axis' },
      grid: { left: 60 * s, right: 20 * s, top: 48 * s, bottom: 56 * s, containLabel: true },
      xAxis: {
        type: 'value',
        name: `Distancia horizontal (${distanceUnit})`,
        nameLocation: 'middle',
        nameGap: 36 * s,
        axisLabel: { color: '#011EAA', fontSize: 12 * s },
        nameTextStyle: { color: '#011EAA', fontSize: 11 * s },
      },
      yAxis: {
        type: 'value',
        name: `Velocidad / Profundidad (${valueUnit})`,
        nameLocation: 'middle',
        nameGap: 52 * s,
        axisLabel: { color: '#011EAA', fontSize: 12 * s },
        nameTextStyle: { color: '#011EAA', fontSize: 11 * s },
      },
      legend: {
        top: 8 * s,
        left: 'center',
        itemWidth: 16 * s,
        itemHeight: 10 * s,
        itemGap: 28 * s,
        textStyle: { color: '#011EAA', fontSize: 9 * s },
      },
      series: [
        {
          name: 'Velocidad',
          type: 'line',
          data: velocityData,
          lineStyle: { color: '#e27831', width: 2 },
          itemStyle: { color: '#e27831' },
          symbol: 'none',
        },
        {
          name: 'Profundidad',
          type: 'line',
          data: depthData,
          lineStyle: { color: '#7a5c04', width: 2 },
          itemStyle: { color: '#7a5c04' },
          symbol: 'none',
        },
        {
          name: 'Superficie',
          type: 'line',
          data: surfaceData,
          lineStyle: { color: '#305398', width: 2 },
          itemStyle: { color: '#305398' },
          symbol: 'none',
        },
      ],
    };
  },
};
