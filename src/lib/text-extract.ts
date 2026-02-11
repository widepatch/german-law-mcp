export function parseAbsatzArg(absatz: string): number[] {
  const trimmed = absatz.trim();
  if (/^\[\d+(,\d+)*\]$/.test(trimmed)) {
    return trimmed.slice(1, -1).split(',').map(Number);
  }
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid absatz: "${absatz}". Use a number or [1,2,3] format.`);
  }
  return [n];
}

const ABSATZ_PATTERN = /^\((\d+)\)/;

export function filterAbsaetze(paragraphs: string[], numbers: number[]): Map<number, string> {
  const result = new Map<number, string>();
  const absatzMap = buildAbsatzMap(paragraphs);

  for (const num of numbers) {
    const text = absatzMap.get(num);
    if (text !== undefined) {
      result.set(num, text);
    }
  }

  return result;
}

function buildAbsatzMap(paragraphs: string[]): Map<number, string> {
  const map = new Map<number, string>();

  for (const p of paragraphs) {
    const match = p.match(ABSATZ_PATTERN);
    if (match) {
      map.set(Number(match[1]), p);
    }
  }

  return map;
}

export function listAvailableAbsaetze(paragraphs: string[]): number[] {
  const numbers: number[] = [];
  for (const p of paragraphs) {
    const match = p.match(ABSATZ_PATTERN);
    if (match) {
      numbers.push(Number(match[1]));
    }
  }
  return numbers.sort((a, b) => a - b);
}
