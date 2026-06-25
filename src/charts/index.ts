import { measurementVisitChartBuilder } from './measurement-visit.js';

export type ChartData = Record<string, unknown>;

export interface ChartBuilder {
  build(data: ChartData, width: number, height: number, pixelRatio?: number): object;
}

const registry = new Map<string, ChartBuilder>([
  ['measurement-visit', measurementVisitChartBuilder],
]);

export function getBuilder(type: string): ChartBuilder | undefined {
  return registry.get(type);
}
