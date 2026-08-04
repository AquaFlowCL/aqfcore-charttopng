# AQF Core Chart to PNG

HTTP service that renders charts as PNG or SVG.

## ADCP QRev cross-section

`adcp-qrev` renders a QRev MAP-style primary-velocity cross-section from JSON. The server needs no QRev, MMT, or PD0 files: provide the CSV-derived verticals and cells in the request body.

Start the service:

```bash
npm run build
npm start
```

Use the included CSV adapter:

```bash
QREV_CSV=/path/to/MAP.csv node examples/qrev-map.js
```

Or call the API directly:

```bash
curl -X POST http://localhost:3000/chart \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "adcp-qrev",
    "width": 1200,
    "height": 600,
    "format": "png",
    "data": {
      "verticals": [
        {
          "distance": 0.9993,
          "depth": 0.8827,
          "cells": [
            { "depth": 0.066, "primaryVelocity": 0.0162 },
            { "depth": 0.198, "primaryVelocity": 0.0162 }
          ]
        },
        {
          "distance": 2.0580,
          "depth": 0.9701,
          "cells": [
            { "depth": 0.066, "primaryVelocity": 0.0141 },
            { "depth": 0.198, "primaryVelocity": 0.0141 }
          ]
        }
      ]
    }
  }' \
  --output adcp-qrev.png
```

Each vertical needs its distance from the left bank, total depth, and ordered primary-velocity cells. The service returns `image/png` by default; set `"format": "svg"` for SVG.

## Measurement visit

`measurement-visit` renders velocity, depth, and surface elevation along a cross-section. Supply each series as `[horizontalDistance, value]` pairs.

```bash
curl -X POST http://localhost:3000/chart \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "measurement-visit",
    "width": 1200,
    "height": 600,
    "data": {
      "distanceUnit": "m",
      "valueUnit": "m",
      "velocityData": [[0, 0], [1, 0.3], [2, 0.1]],
      "depthData": [[0, 0], [1, -0.5], [2, 0]],
      "surfaceData": [[0, 0.02], [1, 0.03], [2, 0.02]]
    }
  }' \
  --output measurement-visit.png
```

For a fuller payload, use [examples/measurement-visit.json](examples/measurement-visit.json).
