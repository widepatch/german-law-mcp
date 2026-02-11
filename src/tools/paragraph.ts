import { readLawXml } from '../lib/law-store.js';
import { parseLawXml, findNormByEnbez } from '../lib/xml-parser.js';
import { parseAbsatzArg, filterAbsaetze, listAvailableAbsaetze } from '../lib/text-extract.js';

export async function getParagraph(
  paragraph: string,
  lawName: string,
  absatz?: string,
): Promise<string> {
  const xml = await readLawXml(lawName);
  const norms = parseLawXml(xml);
  const norm = findNormByEnbez(norms, paragraph);

  if (!norm) {
    const available = norms
      .map((n) => n.enbez)
      .filter((e) => e.startsWith('§'))
      .slice(0, 10);
    throw new Error(
      `Paragraph "${paragraph}" not found in ${lawName}.\n\nAvailable paragraphs:\n${available.join('\n')}\n...`
    );
  }

  if (!absatz) {
    const header = norm.titel
      ? `=== ${paragraph} ${norm.titel} (${lawName}) ===`
      : `=== ${paragraph} (${lawName}) ===`;
    return `${header}\n\n${norm.paragraphs.join('\n\n')}`;
  }

  const numbers = parseAbsatzArg(absatz);
  const filtered = filterAbsaetze(norm.paragraphs, numbers);

  if (filtered.size === 0) {
    const available = listAvailableAbsaetze(norm.paragraphs);
    throw new Error(
      `Absatz ${absatz} not found in ${paragraph}.\n\nAvailable Absätze: ${available.join(', ')}`
    );
  }

  const lines: string[] = [];
  const header = numbers.length === 1
    ? `=== ${paragraph} (${lawName}) - Absatz ${numbers[0]} ===`
    : `=== ${paragraph} (${lawName}) - Absätze ${absatz} ===`;
  lines.push(header);
  lines.push('');

  for (const num of numbers) {
    const text = filtered.get(num);
    if (text !== undefined) {
      if (numbers.length > 1) {
        lines.push(`--- Absatz ${num} ---`);
      }
      lines.push(text);
      lines.push('');
    } else {
      lines.push(`--- Absatz ${num} (not found) ---`);
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd();
}
