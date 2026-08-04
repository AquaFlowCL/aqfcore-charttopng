import type { ChartBuilder, ChartData } from './index.js';

type Cell = { depth: number; primaryVelocity: number };
type Vertical = { distance: number; depth: number; cells: Cell[] };

// Matplotlib's 256-entry viridis lookup table, used by QRev 4.38.
const VIRIDIS = '#440154,#440256,#450457,#450559,#46075a,#46085c,#460a5d,#460b5e,#470d60,#470e61,#471063,#471164,#471365,#481467,#481668,#481769,#48186a,#481a6c,#481b6d,#481c6e,#481d6f,#481f70,#482071,#482173,#482374,#482475,#482576,#482677,#482878,#482979,#472a7a,#472c7a,#472d7b,#472e7c,#472f7d,#46307e,#46327e,#46337f,#463480,#453581,#453781,#453882,#443983,#443a83,#443b84,#433d84,#433e85,#423f85,#424086,#424186,#414287,#414487,#404588,#404688,#3f4788,#3f4889,#3e4989,#3e4a89,#3e4c8a,#3d4d8a,#3d4e8a,#3c4f8a,#3c508b,#3b518b,#3b528b,#3a538b,#3a548c,#39558c,#39568c,#38588c,#38598c,#375a8c,#375b8d,#365c8d,#365d8d,#355e8d,#355f8d,#34608d,#34618d,#33628d,#33638d,#32648e,#32658e,#31668e,#31678e,#31688e,#30698e,#306a8e,#2f6b8e,#2f6c8e,#2e6d8e,#2e6e8e,#2e6f8e,#2d708e,#2d718e,#2c718e,#2c728e,#2c738e,#2b748e,#2b758e,#2a768e,#2a778e,#2a788e,#29798e,#297a8e,#297b8e,#287c8e,#287d8e,#277e8e,#277f8e,#27808e,#26818e,#26828e,#25838e,#25848e,#25858e,#24868e,#24878e,#23888e,#23898e,#238a8d,#228b8d,#228c8d,#228d8d,#218e8d,#218f8d,#21908d,#21918c,#20928c,#20928c,#20938c,#1f948c,#1f958b,#1f968b,#1f978b,#1f988b,#1f998a,#1f9a8a,#1e9b8a,#1e9c89,#1e9d89,#1f9e89,#1f9f88,#1fa088,#1fa188,#1fa187,#1fa287,#20a386,#20a486,#21a585,#21a685,#22a785,#22a884,#23a983,#24aa83,#25ab82,#25ac82,#26ad81,#27ad81,#28ae80,#29af7f,#2ab07f,#2cb17e,#2db27d,#2eb37c,#2fb47c,#31b57b,#32b67a,#34b679,#35b779,#37b878,#38b977,#3aba76,#3bbb75,#3dbc74,#3fbc73,#40bd72,#42be71,#44bf70,#46c06f,#48c16e,#4ac16d,#4cc26c,#4ec36b,#50c46a,#52c569,#54c568,#56c667,#58c765,#5ac864,#5cc863,#5ec962,#60ca60,#63cb5f,#65cb5e,#67cc5c,#69cd5b,#6ccd5a,#6ece58,#70cf57,#73d056,#75d054,#77d153,#7ad151,#7cd250,#7fd34e,#81d34d,#84d44b,#86d549,#89d548,#8bd646,#8ed645,#90d743,#93d741,#95d840,#98d83e,#9bd93c,#9dd93b,#a0da39,#a2da37,#a5db36,#a8db34,#aadc32,#addc30,#b0dd2f,#b2dd2d,#b5de2b,#b8de29,#bade28,#bddf26,#c0df25,#c2df23,#c5e021,#c8e020,#cae11f,#cde11d,#d0e11c,#d2e21b,#d5e21a,#d8e219,#dae319,#dde318,#e2e418,#e5e419,#e7e419,#eae51a,#ece51b,#efe51c,#f1e51d,#f4e61e,#f6e620,#f8e621,#fbe723,#fde725'.split(',');

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * fraction;
  const lower = Math.floor(index);
  return sorted[lower] + (sorted[Math.ceil(index)] - sorted[lower]) * (index - lower);
}

function color(value: number, min: number, max: number): string {
  return VIRIDIS[Math.max(0, Math.min(VIRIDIS.length - 1, Math.floor(((value - min) / (max - min)) * VIRIDIS.length)))];
}

function verticalsFrom(data: ChartData): Vertical[] {
  const value = data.verticals;
  if (!Array.isArray(value) || value.length < 2) throw new Error('verticals must contain at least two entries');

  return value.map((vertical) => {
    if (typeof vertical !== 'object' || vertical === null) throw new Error('invalid vertical');
    const { distance, depth, cells } = vertical as Record<string, unknown>;
    if (!Number.isFinite(distance) || !Number.isFinite(depth) || !Array.isArray(cells) || cells.length === 0) throw new Error('invalid vertical');
    return {
      distance: distance as number,
      depth: depth as number,
      cells: cells.map((cell) => {
        if (typeof cell !== 'object' || cell === null) throw new Error('invalid cell');
        const { depth: cellDepth, primaryVelocity } = cell as Record<string, unknown>;
        if (!Number.isFinite(cellDepth) || !Number.isFinite(primaryVelocity)) throw new Error('invalid cell');
        return { depth: cellDepth as number, primaryVelocity: primaryVelocity as number };
      }),
    };
  }).sort((a, b) => a.distance - b.distance);
}

export const qrevMapChartBuilder: ChartBuilder = {
  build(data, width, height, pixelRatio = 1) {
    const verticals = verticalsFrom(data);
    const values = verticals.flatMap(({ cells }) => cells.map(({ primaryVelocity }) => primaryVelocity));
    const rawMax = percentile(values, 0.99); // QRev AdvGraphs.plt_contour uses the 99th percentile.
    const colorMin = typeof data.colorMin === 'number' ? Math.max(0, data.colorMin) : 0;
    const colorMax = typeof data.colorMax === 'number' ? data.colorMax : rawMax;
    const xEdges = verticals.map((vertical, index) => index === 0 ? 0 : (verticals[index - 1].distance + vertical.distance) / 2);
    xEdges.push(verticals.at(-1)!.distance + verticals.at(-1)!.distance - verticals.at(-2)!.distance);
    const xStart = xEdges[0];
    const xEnd = xEdges.at(-1)!;
    const yMax = Math.max(...verticals.map(({ depth }) => depth)) * 1.02;
    const cells = verticals.flatMap((vertical, column) => vertical.cells.map((cell, row) => [
      xEdges[column], xEdges[column + 1],
      row === 0 ? 0 : (vertical.cells[row - 1].depth + cell.depth) / 2,
      row === vertical.cells.length - 1 ? vertical.depth : (cell.depth + vertical.cells[row + 1].depth) / 2,
      cell.primaryVelocity,
    ]));
    const section = [[xStart, 0], ...verticals.map(({ distance, depth }) => [distance, depth]), [xEnd, 0]];
    const wettedBoundary = section;
    const s = pixelRatio;
    const textSize = Math.max(12, Math.round(Math.min(width / 90, height / 42))) * s;
    const axisNameSize = textSize + 2 * s;
    const gridTop = 32 * s;
    const gridBottom = 76 * s;
    const colorBarHeight = height * s - gridTop - gridBottom;

    return {
      backgroundColor: '#ffffff', animation: false,
      grid: { left: 88 * s, right: 118 * s, top: gridTop, bottom: gridBottom },
      xAxis: {
        type: 'value', min: xStart - (xEnd - xStart) * 0.02, max: xEnd + (xEnd - xStart) * 0.02,
        name: 'Largo (m)', nameLocation: 'middle', nameGap: 48 * s,
        axisLine: { lineStyle: { color: '#333' } }, axisLabel: { fontSize: textSize, formatter: (value: number) => value.toFixed(1) }, nameTextStyle: { fontSize: axisNameSize, fontWeight: 500 }, splitLine: { show: false },
      },
      yAxis: {
        type: 'value', min: 0, max: yMax, inverse: true, name: 'Profundidad (m)', nameLocation: 'middle', nameGap: 64 * s,
        axisLine: { lineStyle: { color: '#333' } }, axisLabel: { fontSize: textSize, formatter: (value: number) => value.toFixed(1) }, nameTextStyle: { fontSize: axisNameSize, fontWeight: 500 }, splitLine: { show: false },
      },
      graphic: [{
        type: 'group', right: 24 * s, top: gridTop,
        children: [
          ...VIRIDIS.slice().reverse().map((fill, index) => ({ type: 'rect', shape: { x: 0, y: index * colorBarHeight / VIRIDIS.length, width: 26 * s, height: colorBarHeight / VIRIDIS.length + 1 }, style: { fill } })),
          { type: 'text', style: { x: -10 * s, y: 0, text: colorMax.toFixed(1), textAlign: 'right', textVerticalAlign: 'top', font: `${textSize}px sans-serif`, fill: '#333' } },
          { type: 'text', style: { x: -10 * s, y: colorBarHeight, text: colorMin.toFixed(1), textAlign: 'right', textVerticalAlign: 'bottom', font: `${textSize}px sans-serif`, fill: '#333' } },
          { type: 'text', style: { x: 13 * s, y: -24 * s, text: 'Velocidad', textAlign: 'center', font: `${textSize}px sans-serif`, fill: '#333' } },
        ],
      }],
      series: [
        {
          type: 'custom', coordinateSystem: 'cartesian2d', data: cells, encode: { x: [0, 1], y: [2, 3], value: 4 }, silent: true,
          renderItem: (_params: unknown, api: any) => {
            const topLeft = api.coord([api.value(0), api.value(2)]);
            const bottomRight = api.coord([api.value(1), api.value(3)]);
            return {
              type: 'group', clipPath: { type: 'polygon', shape: { points: wettedBoundary.map((point) => api.coord(point)) } },
              children: [{ type: 'rect', shape: { x: topLeft[0], y: topLeft[1], width: bottomRight[0] - topLeft[0], height: bottomRight[1] - topLeft[1] }, style: { fill: color(api.value(4), colorMin, colorMax) } }],
            };
          },
        },
        { type: 'line', data: section, symbol: 'none', silent: true, lineStyle: { color: '#202020', width: 1.4 * s }, z: 2 },
      ],
    };
  },
};
