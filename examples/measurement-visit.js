import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = process.env.CHART_API_URL ?? 'http://localhost:3000';

async function main() {
  const payload = JSON.parse(await readFile(join(__dirname, 'measurement-visit.json'), 'utf-8'));

  const response = await fetch(`${BASE_URL}/chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Chart request failed: ${response.status} ${response.statusText}`);
    console.error(text);
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = payload.format === 'svg' ? 'svg' : 'png';
  const outputPath = join(__dirname, `measurement-visit-output.${extension}`);

  await writeFile(outputPath, buffer);
  console.log(`Saved ${buffer.length} bytes to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
