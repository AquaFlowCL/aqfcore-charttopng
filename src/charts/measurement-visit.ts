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

// Harmonious, report-friendly palette.
const COLORS = {
  velocity: '#d08770',
  depth: '#5e81ac',
  surface: '#88c0d0',
  text: '#2e3440',
  mutedText: '#4c566a',
  grid: '#eceff4',
  axis: '#d8dee9',
} as const;

const FONT_STACK =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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
      textStyle: {
        fontFamily: FONT_STACK,
        color: COLORS.text,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: COLORS.axis,
        textStyle: { color: COLORS.text, fontSize: 12 * s },
      },
      grid: {
        left: 64 * s,
        right: 28 * s,
        top: 72 * s,
        bottom: 64 * s,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: `Distancia horizontal (${distanceUnit})`,
        nameLocation: 'middle',
        nameGap: 40 * s,
        axisLine: { lineStyle: { color: COLORS.axis } },
        axisTick: { lineStyle: { color: COLORS.axis } },
        axisLabel: { color: COLORS.mutedText, fontSize: 11 * s },
        nameTextStyle: { color: COLORS.text, fontSize: 11 * s, fontWeight: 500 },
        splitLine: { lineStyle: { color: COLORS.grid } },
      },
      yAxis: {
        type: 'value',
        name: `Velocidad / Profundidad (${valueUnit})`,
        nameLocation: 'middle',
        nameGap: 56 * s,
        axisLine: { lineStyle: { color: COLORS.axis } },
        axisTick: { lineStyle: { color: COLORS.axis } },
        axisLabel: { color: COLORS.mutedText, fontSize: 11 * s },
        nameTextStyle: { color: COLORS.text, fontSize: 11 * s, fontWeight: 500 },
        splitLine: { lineStyle: { color: COLORS.grid } },
      },
      legend: {
        top: 16 * s,
        left: 'center',
        itemWidth: 22 * s,
        itemHeight: 10 * s,
        itemGap: 32 * s,
        textStyle: {
          color: COLORS.text,
          fontSize: 11 * s,
          lineHeight: 10 * s,
        },
      },
      series: [
        {
          name: 'Velocidad',
          type: 'line',
          data: velocityData,
          smooth: true,
          lineStyle: { color: COLORS.velocity, width: 2.5 },
          itemStyle: { color: COLORS.velocity },
          areaStyle: { color: COLORS.velocity, opacity: 0.12 },
          symbol: 'none',
        },
        {
          name: 'Profundidad',
          type: 'line',
          data: depthData,
          smooth: true,
          lineStyle: { color: COLORS.depth, width: 2.5 },
          itemStyle: { color: COLORS.depth },
          areaStyle: { color: COLORS.depth, opacity: 0.12 },
          symbol: 'none',
        },
        {
          name: 'Superficie',
          type: 'line',
          data: surfaceData,
          smooth: true,
          lineStyle: { color: COLORS.surface, width: 2.5, type: 'dashed' },
          itemStyle: { color: COLORS.surface },
          symbol: 'none',
        },
      ],
    };
  },
};
