import echarts = require('echarts');
import sharp from 'sharp';

export function buildSVG(option: object, width: number, height: number, pixelRatio = 2): string {
  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width: width * pixelRatio,
    height: height * pixelRatio,
  });

  try {
    chart.setOption(option);
    return chart.renderToSVGString();
  } finally {
    chart.dispose();
  }
}

export async function render(
  option: object,
  width: number,
  height: number,
  format: 'png' | 'svg',
  pixelRatio = 2,
): Promise<Buffer | string> {
  const svg = buildSVG(option, width, height, pixelRatio);

  if (format === 'svg') {
    return svg;
  }

  // Output is width*pixelRatio × height*pixelRatio — no resize, no blur.
  return sharp(Buffer.from(svg)).png().toBuffer();
}
