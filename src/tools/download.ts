import AdmZip from 'adm-zip';
import { lawExists, writeLawXml } from '../lib/law-store.js';

const BASE_URL = 'https://www.gesetze-im-internet.de';

export async function downloadLaw(lawName: string, forceUpdate: boolean): Promise<string> {
  if (!forceUpdate && await lawExists(lawName)) {
    return `Law "${lawName}" already downloaded. Use force_update to overwrite.`;
  }

  const url = `${BASE_URL}/${lawName}/xml.zip`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Law "${lawName}" not found on gesetze-im-internet.de. Check the name.`);
    }
    throw new Error(`Download failed: HTTP ${response.status} for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const xmlEntry = entries.find(
    (e) => e.entryName.endsWith('.xml') && !e.entryName.includes('meta')
  );

  if (!xmlEntry) {
    throw new Error(`No XML file found in ZIP for "${lawName}".`);
  }

  const xmlContent = xmlEntry.getData().toString('utf8');
  const savedPath = await writeLawXml(lawName, xmlContent);

  return `Downloaded "${lawName}" → ${savedPath}`;
}
