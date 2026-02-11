import { readLawXml } from '../lib/law-store.js';
import { parseLawXml, listAllEnbez } from '../lib/xml-parser.js';

export async function listContents(lawName: string): Promise<string> {
  const xml = await readLawXml(lawName);
  const norms = parseLawXml(xml);
  const entries = listAllEnbez(norms);

  if (entries.length === 0) {
    throw new Error(`No entries found in ${lawName}.`);
  }

  return `=== Table of Contents: ${lawName} ===\n\n${entries.join('\n')}`;
}
