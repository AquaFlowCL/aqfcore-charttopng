import type { ChartBuilder, ChartData } from './index.js';

type NumericSeries = number[];

function isNumericArray(value: unknown): value is NumericSeries {
  return Array.isArray(value);
}

function getSeries(data: ChartData, key: 'distance' | 'velocity' | 'depth'): NumericSeries {
  const value = data[key];

  if (!isNumericArray(value)) {
    throw new Error(`invalid or missing ${key} array`);
  }

  return value;
}

export const velocityDepthChartBuilder: ChartBuilder = {
  build(data, width, height, pixelRatio = 1) {
    const distance = getSeries(data, 'distance');
    const velocity = getSeries(data, 'velocity');
    const depth = getSeries(data, 'depth');
    const s = pixelRatio;

    return {
      backgroundColor: '#ffffff',
      animation: false,
      legend: {
        top: 12 * s,
        left: 'center',
        itemWidth: 20 * s,
        itemHeight: 10 * s,
        itemGap: 20 * s,
        textStyle: { fontSize: 12 * s },
      },
      grid: {
        top: 56 * s,
        left: 56 * s,
        right: 56 * s,
        bottom: 40 * s,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        name: 'distance (m)',
        boundaryGap: false,
        data: distance,
        nameTextStyle: { fontSize: 11 * s },
        axisLabel: { fontSize: 11 * s },
        axisLine: { lineStyle: { color: '#7a7a7a' } },
      },
      yAxis: [
        {
          type: 'value',
          name: 'velocity (m/s)',
          nameTextStyle: { fontSize: 11 * s },
          axisLabel: { fontSize: 11 * s },
          splitLine: { lineStyle: { color: '#e8e8e8' } },
        },
        {
          type: 'value',
          name: 'depth (m)',
          nameTextStyle: { fontSize: 11 * s },
          axisLabel: { fontSize: 11 * s },
          inverse: true,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Velocity',
          type: 'line',
          data: velocity,
          smooth: false,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: Math.max(6, Math.min(width, height) * 0.01) * s,
          lineStyle: {
            color: '#4a90d9',
            width: 2 * s,
          },
          itemStyle: {
            color: '#4a90d9',
          },
        },
        {
          name: 'Depth',
          type: 'line',
          data: depth,
          yAxisIndex: 1,
          smooth: false,
          showSymbol: false,
          lineStyle: {
            color: '#7cba5f',
            width: 2,
          },
          areaStyle: {
            color: '#7cba5f',
            opacity: 0.3,
          },
          itemStyle: {
            color: '#7cba5f',
          },
        },
      ],
    };
  },
};
