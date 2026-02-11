import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';

export function getLawsDir(): string {
  if (process.env.LAWS_DIR) {
    return process.env.LAWS_DIR;
  }

  const xdgData = process.env.XDG_DATA_HOME || path.join(homedir(), '.local', 'share');
  return path.join(xdgData, 'german-law-mcp', 'laws');
}

export function getLawXmlPath(lawName: string): string {
  return path.join(getLawsDir(), lawName, `${lawName}.xml`);
}

export async function lawExists(lawName: string): Promise<boolean> {
  try {
    await access(getLawXmlPath(lawName));
    return true;
  } catch {
    return false;
  }
}

export async function readLawXml(lawName: string): Promise<string> {
  return readFile(getLawXmlPath(lawName), 'utf8');
}

export async function writeLawXml(lawName: string, content: string): Promise<string> {
  const xmlPath = getLawXmlPath(lawName);
  await mkdir(path.dirname(xmlPath), { recursive: true });
  await writeFile(xmlPath, content, 'utf8');
  return xmlPath;
}
