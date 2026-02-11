# german-law-mcp

Unofficial MCP server that downloads and parses German federal law XML files from [gesetze-im-internet.de](https://www.gesetze-im-internet.de). Browse and extract paragraphs from any law — directly from Claude Code, Claude Desktop, or any MCP client.

> **Hinweis / Disclaimer:**
>
> - Dieses Projekt steht in **keiner Verbindung** zum Bundesministerium der Justiz (BMJ), zum Bundesamt für Justiz oder zu juris GmbH.
> - Die bereitgestellten Gesetzestexte sind **amtliche Werke** und nach [§ 5 Abs. 1 UrhG](https://www.gesetze-im-internet.de/urhg/__5.html) gemeinfrei. Die Texte werden unverändert aus den XML-Dateien von gesetze-im-internet.de bezogen.
> - Dieses Tool dient ausschließlich **Informationszwecken** und stellt **keine Rechtsberatung** dar. Die Texte können unvollständig, veraltet oder fehlerhaft geparst sein.
> - Rechtlich verbindlich ist ausschließlich die im [Bundesgesetzblatt](https://www.recht.bund.de/bgbl/) veröffentlichte Fassung. Bei rechtlichen Fragen wenden Sie sich an eine qualifizierte Rechtsberatung.

## Quick Start

### Claude Code

```bash
claude mcp add german-law -- npx -y german-law-mcp
```

### Claude Desktop / Manual Config

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "german-law": {
      "command": "npx",
      "args": ["-y", "german-law-mcp"]
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
~/.local/share/german-law-mcp/laws/<law_name>/<law_name>.xml
```

Override with the `LAWS_DIR` environment variable:

```json
{
  "mcpServers": {
    "german-law": {
      "command": "npx",
      "args": ["-y", "german-law-mcp"],
      "env": {
        "LAWS_DIR": "/path/to/your/laws"
      }
    }
  }
}
```

## Development

```bash
git clone https://github.com/kai-bruell/german-law-mcp.git
cd german-law-mcp
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

The source code of this project is licensed under the [MIT License](LICENSE).

German federal law texts are official works (*amtliche Werke*) and are exempt from copyright under [§ 5 Abs. 1 UrhG](https://www.gesetze-im-internet.de/urhg/__5.html).
