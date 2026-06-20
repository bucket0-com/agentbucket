# agentbucket

MCP server for **Bucket0 AgentBucket** — give your AI agent a persistent, encrypted file system it can **save to** and **recall by meaning**.

Works with any MCP client that runs local (stdio) servers: **Claude Code, Claude Desktop, Cursor**, and others. (For ChatGPT / claude.ai web one-click connectors, see Bucket0's remote MCP server.)

## What your agent gets

Six tools over your Bucket0 AgentBucket storage:

| Tool | What it does |
|---|---|
| `save_file` | Save a file (output, doc, data, code). Auto-indexed for memory on paid plans. |
| `search_memory` | Recall earlier files by meaning before regenerating work. |
| `read_file` | Read back a file you saved. |
| `list_files` | See what's stored. |
| `delete_file` | Remove a file (on request). |
| `create_folder` | Pre-create a folder. |

## Setup

1. In the [Bucket0 dashboard](https://bucket0.com) → **AgentBucket → New Key**, create a key (`b0ak_…`). It's shown once.
2. Add the server to your MCP client with that key as `BUCKET0_API_KEY`.

### Claude Code

```bash
claude mcp add agentbucket -e BUCKET0_API_KEY=b0ak_your_key -- npx -y agentbucket
```

### Claude Desktop / Cursor (`mcp.json` / config)

```json
{
  "mcpServers": {
    "agentbucket": {
      "command": "npx",
      "args": ["-y", "agentbucket"],
      "env": { "BUCKET0_API_KEY": "b0ak_your_key" }
    }
  }
}
```

## Configuration

| Env var | Required | Default |
|---|---|---|
| `BUCKET0_API_KEY` | yes | — (your `b0ak_…` key) |
| `BUCKET0_BASE_URL` | no | `https://bucket0.com/api/agent-bucket` |

## Notes

- **Memory** (`search_memory`, auto-indexing) requires a **paid Bucket0 plan**. On Free, saving/listing/reading still work; search returns a plan-required error.
- Text files are indexed automatically. Pass `index: false` to `save_file` for scratch/throwaway files.
- The server is a thin client — all auth, quotas, encryption, and indexing happen server-side at Bucket0.

## Develop

```bash
npm install
npm run build
BUCKET0_API_KEY=b0ak_... node dist/index.js
```

## License

MIT
