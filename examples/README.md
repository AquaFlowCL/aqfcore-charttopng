# Chart examples

This folder contains runnable examples for the chart service.

## `measurement-visit`

A cross-section / measurement-visit chart showing velocity, depth, and surface elevation over a horizontal distance.

### Files

- `measurement-visit.json` — request payload for the `/chart` endpoint.
- `measurement-visit.js` — Node.js script that POSTs the payload to the API and saves the resulting image.

### Run with curl

Start the server first:

```bash
npm run build
npm start
```

Then, in another terminal:

```bash
curl -X POST http://localhost:3000/chart \
  -H 'Content-Type: application/json' \
  -d @examples/measurement-visit.json \
  --output examples/measurement-visit-curl.png
```

### Run with Node.js

```bash
npm run build
npm start &
node examples/measurement-visit.js
```

The output is written to `examples/measurement-visit-output.png` (or `.svg` if you change the `format` field in the JSON payload).

### Customise the API URL

The Node.js example defaults to `http://localhost:3000`. Override it with:

```bash
CHART_API_URL=http://my-chart-api:3000 node examples/measurement-visit.js
```
