import { measurementVisitChartBuilder } from './measurement-visit.js';
import { qrevMapChartBuilder } from './qrev-map.js';

export type ChartData = Record<string, unknown>;

export interface ChartBuilder {
  build(data: ChartData, width: number, height: number, pixelRatio?: number): object;
}

const registry = new Map<string, ChartBuilder>([
  ['measurement-visit', measurementVisitChartBuilder],
  ['adcp-qrev', qrevMapChartBuilder],
]);

export function getBuilder(type: string): ChartBuilder | undefined {
  return registry.get(type);
}
