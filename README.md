# aqfcore-charttopng

Lightweight microservice that renders Apache ECharts chart definitions into PNG or SVG images. Used by `aqfcore-markdowntopdf` to embed charts in report PDFs.

No headless browser — ECharts SSR renders a deterministic SVG from the chart option, and `sharp` converts it to PNG.

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js LTS |
| Framework | Fastify |
| Chart rendering | ECharts SSR (`renderToSVGString`) |
| SVG → PNG | sharp (libvips) |
| Language | TypeScript |

## Running

```bash
npm install
npm run dev        # tsx watch mode, port 3000
npm run build      # compile to dist/
npm start          # run compiled output
```

`PORT` env var overrides the default port 3000.

## API

### `POST /chart`

Returns raw image bytes.

**Request body:**

```json
{
  "type": "measurement-visit",
  "width": 900,
  "height": 450,
  "format": "png",
  "pixelRatio": 2,
  "data": { ... }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `type` | string | required | Chart type identifier |
| `width` | number | `800` | Canvas width in logical pixels |
| `height` | number | `400` | Canvas height in logical pixels |
| `format` | `"png"` \| `"svg"` | `"png"` | Output format |
| `pixelRatio` | number 1–4 | `2` | Render scale. Output image is `width×pixelRatio` × `height×pixelRatio`. All layout values and fonts scale accordingly. |
| `data` | object | required | Chart-type-specific data payload |

**Responses:**

- `200` — raw `image/png` or `image/svg+xml` bytes
- `400 { "error": "unknown chart type: foo" }` — unknown type
- `400` — missing required fields (Fastify schema validation)

### `GET /health`

Returns `{ "status": "ok" }`.

## Chart Types

### `velocity-depth`

Dual-axis profile chart for aforo (streamflow) reports.

- **Left Y axis:** velocity (m/s) — line with circle markers, `#4a90d9`
- **Right Y axis:** depth (m, inverted) — filled area, `#7cba5f`
- **X axis:** horizontal distance (m), category scale

**Data fields:**

```json
{
  "distance": [0.0, 0.5, 1.0, 1.5, 2.0],
  "velocity": [0.00, 0.18, 0.31, 0.21, 0.00],
  "depth":    [0.00, -0.25, -0.48, -0.33, 0.00]
}
```

---

### `measurement-visit`

Cross-section profile chart showing velocity, depth, and water surface along a measurement transect.

- **Velocidad** — line, `#e27831`
- **Profundidad** — line, `#7a5c04`
- **Superficie** — line, `#305398`
- Single Y axis, X axis value scale

**Data fields:**

```json
{
  "velocityData": [[0.0, 0.00], [0.4, 0.18], [0.8, 0.31]],
  "depthData":    [[0.0, 0.00], [0.4, -0.25], [0.8, -0.48]],
  "surfaceData":  [[0.0, 0.00], [0.4, 0.01], [0.8, 0.02]]
}
```

Each series is an array of `[x, y]` pairs.

Optional fields: `"distanceUnit"` (default `"m"`), `"valueUnit"` (default `"m"`).

## Adding a New Chart Type

1. Create `src/charts/my-chart.ts` exporting a `ChartBuilder`:

```typescript
import type { ChartBuilder } from './index.js';

export const myChartBuilder: ChartBuilder = {
  build(data, width, height, pixelRatio = 1) {
    const s = pixelRatio;
    return {
      // ECharts option — scale all px values by s
    };
  },
};
```

2. Register it in `src/charts/index.ts`:

```typescript
import { myChartBuilder } from './my-chart.js';

const registry = new Map([
  ...
  ['my-chart', myChartBuilder],
]);
```

No changes to the router or render pipeline needed.

## Tests

```bash
npm test
```

Covers: chart builder unit tests, render pipeline (SVG string, PNG magic bytes), HTTP integration via `app.inject()`.

## Integration with aqfcore-markdowntopdf

The frontend calls this service to get PNG bytes, saves them to a shared volume, and passes the absolute path in the `markdowntopdf` JSON payload. See `PLAN-IMG.md` for architecture details.
