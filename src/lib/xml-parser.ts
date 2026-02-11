import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['norm', 'P', 'row', 'entry', 'DT', 'DD', 'LA'].includes(name),
  trimValues: true,
});

export interface LawNorm {
  enbez: string;
  titel: string;
  paragraphs: string[];
}

function extractTextDeep(node: unknown): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);

  if (Array.isArray(node)) {
    return node.map(extractTextDeep).join('');
  }

  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    const parts: string[] = [];

    // Process #text first to preserve paragraph numbering like (1), (2)
    if ('#text' in obj) {
      parts.push(extractTextDeep(obj['#text']));
    }

    // Handle BR as newline
    if ('BR' in obj) {
      parts.push('\n');
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('@_')) continue; // skip attributes
      if (key === '#text' || key === 'BR') continue; // already handled

      if (key === 'DL') {
        // Definition list: DT/DD pairs — add newline before list
        parts.push('\n');
        const dl = Array.isArray(value) ? value : [value];
        for (const item of dl) {
          const dlObj = item as Record<string, unknown>;
          const dts = ensureArray(dlObj.DT);
          const dds = ensureArray(dlObj.DD);
          for (let i = 0; i < Math.max(dts.length, dds.length); i++) {
            const dtText = i < dts.length ? extractTextDeep(dts[i]) : '';
            const ddText = i < dds.length ? extractTextDeep(dds[i]) : '';
            parts.push(`${dtText} ${ddText}`.trim());
            parts.push('\n');
          }
        }
        continue;
      }

      if (key === 'table') {
        parts.push(extractTable(value));
        continue;
      }

      parts.push(extractTextDeep(value));
    }

    return parts.join('');
  }

  return '';
}

function extractTable(tableNode: unknown): string {
  if (!tableNode || typeof tableNode !== 'object') return '';
  const table = tableNode as Record<string, unknown>;
  const tgroup = table.tgroup as Record<string, unknown> | undefined;
  if (!tgroup) return '';

  const tbody = tgroup.tbody as Record<string, unknown> | undefined;
  if (!tbody) return '';

  const rows = ensureArray(tbody.row);
  const lines: string[] = [];

  for (const row of rows) {
    const rowObj = row as Record<string, unknown>;
    const entries = ensureArray(rowObj.entry);
    const cells = entries.map((e) => extractTextDeep(e).trim());
    const line = cells.filter(Boolean).join('\t');
    if (line) lines.push(line);
  }

  return lines.join('\n');
}

function ensureArray(val: unknown): unknown[] {
  if (val === null || val === undefined) return [];
  return Array.isArray(val) ? val : [val];
}

export function parseLawXml(xml: string): LawNorm[] {
  const parsed = parser.parse(xml);
  const dokumente = parsed.dokumente;
  if (!dokumente) return [];

  const norms = ensureArray(dokumente.norm);
  const result: LawNorm[] = [];

  for (const norm of norms) {
    const normObj = norm as Record<string, unknown>;
    const metadaten = normObj.metadaten as Record<string, unknown> | undefined;
    if (!metadaten) continue;

    const enbez = (metadaten.enbez as string) || '';
    if (!enbez) continue;

    const titelRaw = metadaten.titel;
    const titel = typeof titelRaw === 'string'
      ? titelRaw
      : (titelRaw && typeof titelRaw === 'object' && '#text' in (titelRaw as Record<string, unknown>))
        ? String((titelRaw as Record<string, unknown>)['#text'])
        : '';

    const textdaten = normObj.textdaten as Record<string, unknown> | undefined;
    const text = textdaten?.text as Record<string, unknown> | undefined;
    const content = text?.Content as Record<string, unknown> | undefined;

    const paragraphs: string[] = [];
    if (content) {
      const ps = ensureArray(content.P);
      for (const p of ps) {
        const textContent = extractTextDeep(p).trim();
        if (textContent) {
          paragraphs.push(textContent);
        }
      }
    }

    result.push({ enbez, titel, paragraphs });
  }

  return result;
}

export function findNormByEnbez(norms: LawNorm[], enbez: string): LawNorm | undefined {
  return norms.find((n) => n.enbez === enbez);
}

export function listAllEnbez(norms: LawNorm[]): string[] {
  return norms.map((n) => n.enbez).filter(Boolean);
}
