# gesetze-im-internet-mcp

MCP server for accessing German federal laws from [gesetze-im-internet.de](https://www.gesetze-im-internet.de). Download, browse, and extract paragraphs from any law — directly from Claude Code, Claude Desktop, or any MCP client.

> **Disclaimer:** This tool provides raw legal text from the official German federal law database for informational purposes only. It does **not** constitute legal advice. The texts may be outdated, incomplete, or incorrectly parsed. Always verify against the [official publication](https://www.gesetze-im-internet.de) and consult a qualified legal professional for any legal matters.

## Quick Start

### Claude Code

```bash
claude mcp add german-law -- npx -y gesetze-im-internet-mcp
```

### Claude Desktop / Manual Config

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "german-law": {
      "command": "npx",
      "args": ["-y", "gesetze-im-internet-mcp"]
    }
  }
}
```

That's it — no Docker, no system dependencies. Just Node.js 18+.

## Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `download_law` | Download a law from gesetze-im-internet.de | `law_name`, `force_update?` |
| `list_contents` | List all paragraphs (table of contents) | `law_name` |
| `get_paragraph` | Extract a specific paragraph with optional subsection filter | `paragraph`, `law_name`, `absatz?` |

### Law Names

Law names match the URL slug on gesetze-im-internet.de:

| Law | `law_name` |
|-----|-----------|
| Grundgesetz | `gg` |
| Bürgerliches Gesetzbuch | `bgb` |
| Einkommensteuergesetz | `estg` |
| Abgabenordnung | `ao_1977` |
| Sozialgesetzbuch III | `sgb_3` |
| Handelsgesetzbuch | `hgb` |
| Strafgesetzbuch | `stgb` |

Find more at [gesetze-im-internet.de/Teilliste_A.html](https://www.gesetze-im-internet.de/Teilliste_A.html).

## Example Queries

```
Download the BGB and show me § 433.
```

```
What does § 1 of the Grundgesetz say?
```

```
Show me § 32 Absatz 6 EStG.
```

```
List the table of contents of the Abgabenordnung (ao_1977).
```

```
Compare § 823 Absatz 1 and Absatz 2 BGB.
```

```
Download sgb_3 and show me § 159 Absätze [1,3,5].
```

## Configuration

### Storage Location

Downloaded XML files are stored in:

```
~/.local/share/gesetze-im-internet-mcp/laws/<law_name>/<law_name>.xml
```

Override with the `LAWS_DIR` environment variable:

```json
{
  "mcpServers": {
    "german-law": {
      "command": "npx",
      "args": ["-y", "gesetze-im-internet-mcp"],
      "env": {
        "LAWS_DIR": "/path/to/your/laws"
      }
    }
  }
}
```

## Development

```bash
git clone https://github.com/your-username/gesetze-im-internet-mcp.git
cd gesetze-im-internet-mcp
npm install
npm run build
```

For local testing, use the `.mcp.json` in the repo:

```json
{
  "mcpServers": {
    "german-law": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

## License

MIT
