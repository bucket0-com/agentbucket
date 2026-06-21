# agentbucket

Give your AI agent a file system that remembers.

`agentbucket` connects your assistant to **AgentBucket**: durable storage your agent can save to, recall by meaning, and read back across sessions. Works with **Claude Code, Claude Desktop, Cursor**, and other MCP-compatible tools.

## What your agent can do

- **save_file** to keep research, notes, documents, data, or code
- **search_memory** to recall earlier work by meaning before redoing it
- **read_file**, **list_files**, **delete_file**, **create_folder**

## Setup

1. Create a key in your [Bucket0 dashboard](https://bucket0.com) under **AgentBucket → New Key**. It is shown once.
2. Add the server to your assistant with that key.

**Claude Code**

```bash
claude mcp add agentbucket -e BUCKET0_API_KEY=b0ak_your_key -- npx -y agentbucket
```

**Claude Desktop / Cursor** (`mcp.json`)

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

## Good to know

- Recall by meaning (`search_memory`) is available on paid Bucket0 plans. Saving, listing, and reading work on every plan.
- Your files are encrypted, and never used to train AI.

Want a one-click connector for Claude.ai or ChatGPT instead? See [bucket0.com](https://bucket0.com).

## License

MIT
