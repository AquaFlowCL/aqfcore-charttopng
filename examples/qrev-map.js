import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const csvPath = process.env.QREV_CSV;
if (!csvPath) throw new Error('Set QREV_CSV to the QRev MAP CSV path');

// ponytail: QRev MAP exports numeric, comma-only fields; use a CSV parser if quoted fields are ever added.
const rows = (await readFile(resolve(csvPath), 'utf8')).trim().split(/\r?\n/).filter((line) => !line.startsWith('#'));
const header = rows.shift().split(',');
const column = (name) => header.indexOf(name);
const verticals = new Map();

for (const line of rows) {
  const values = line.split(',');
  const id = values[column('Vertical')];
  const vertical = verticals.get(id) ?? {
    distance: Number(values[column('Distance (Left bank) (m)')]),
    depth: Number(values[column('Depth (m)')]),
    cells: [],
  };
  vertical.cells.push({
    depth: Number(values[column('Depth cells center (m)')]),
    primaryVelocity: Number(values[column('Primary velocity (m/s)')]),
  });
  verticals.set(id, vertical);
}

const response = await fetch(`${process.env.CHART_API_URL ?? 'http://localhost:3000'}/chart`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'adcp-qrev', width: 1200, height: 600, data: { verticals: [...verticals.values()] } }),
});
if (!response.ok) throw new Error(await response.text());
await writeFile('examples/qrev-map-output.png', Buffer.from(await response.arrayBuffer()));
console.log('Saved examples/qrev-map-output.png');
