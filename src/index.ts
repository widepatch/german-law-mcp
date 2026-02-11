#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { downloadLaw } from './tools/download.js';
import { getParagraph } from './tools/paragraph.js';
import { listContents } from './tools/contents.js';

function sanitizeLawName(name: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid law name: "${name}". Only alphanumeric and underscore allowed.`);
  }
  return name;
}

function sanitizeParagraph(para: string): string {
  if (!/^[§\s\w]+$/.test(para)) {
    throw new Error(`Invalid paragraph: "${para}".`);
  }
  return para;
}

function sanitizeAbsatz(absatz: string | undefined): string | undefined {
  if (!absatz) return undefined;
  if (!/^(\d+|\[\d+(,\d+)*\])$/.test(absatz)) {
    throw new Error(`Invalid absatz: "${absatz}". Use number or [1,2,3] format.`);
  }
  return absatz;
}

const server = new McpServer({
  name: 'german-law-server',
  version: '3.0.0',
});

server.tool(
  'download_law',
  'Download a German law XML file from gesetze-im-internet.de',
  {
    law_name: z.string().describe('Name of the law (e.g., "estg", "ao_1977", "bgb")'),
    force_update: z.boolean().optional().describe('Force update even if file exists'),
  },
  async ({ law_name, force_update }) => {
    try {
      const safeName = sanitizeLawName(law_name);
      const result = await downloadLaw(safeName, force_update ?? false);
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return { content: [{ type: 'text', text: String(err) }], isError: true };
    }
  },
);

server.tool(
  'get_paragraph',
  'Extract specific paragraph(s) from a German law',
  {
    paragraph: z.string().describe('Paragraph identifier (e.g., "§ 1", "§ 70")'),
    law_name: z.string().describe('Name of the law (e.g., "estg", "ao_1977")'),
    absatz: z.string().optional().describe('Optional: specific subsection number or list [1,3,5]'),
  },
  async ({ paragraph, law_name, absatz }) => {
    try {
      const safePara = sanitizeParagraph(paragraph);
      const safeName = sanitizeLawName(law_name);
      const safeAbsatz = sanitizeAbsatz(absatz);
      const result = await getParagraph(safePara, safeName, safeAbsatz);
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return { content: [{ type: 'text', text: String(err) }], isError: true };
    }
  },
);

server.tool(
  'list_contents',
  'List all paragraphs in a German law (table of contents)',
  {
    law_name: z.string().describe('Name of the law (e.g., "estg", "ao_1977")'),
  },
  async ({ law_name }) => {
    try {
      const safeName = sanitizeLawName(law_name);
      const result = await listContents(safeName);
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return { content: [{ type: 'text', text: String(err) }], isError: true };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('German Law MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
