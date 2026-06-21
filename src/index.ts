#!/usr/bin/env node
/**
 * agentbucket — MCP server for Bucket0 AgentBucket (stdio transport).
 *
 * Gives an AI agent a persistent, encrypted file system it can save to and
 * recall by meaning. Configure with your b0ak_ key:
 *
 *   BUCKET0_API_KEY=b0ak_...   (required)
 *   BUCKET0_BASE_URL=...       (optional; defaults to https://bucket0.com/api/agent-bucket)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AgentBucketClient } from "./client.js";
import { registerTools } from "./tools.js";

const apiKey = process.env.BUCKET0_API_KEY;
if (!apiKey) {
  console.error(
    "agentbucket: BUCKET0_API_KEY is required. Create a key in the Bucket0 dashboard (AgentBucket → New Key) and set it as BUCKET0_API_KEY."
  );
  process.exit(1);
}

const baseUrl = process.env.BUCKET0_BASE_URL || "https://bucket0.com/api/agent-bucket";

if (!apiKey.startsWith("b0ak_")) {
  console.error("agentbucket: warning — BUCKET0_API_KEY doesn't look like a Bucket0 key (expected a b0ak_ prefix).");
}
if (!/^https:\/\//.test(baseUrl) && !/^https?:\/\/localhost(:|\/|$)/.test(baseUrl)) {
  console.error("agentbucket: warning — BUCKET0_BASE_URL is not https; your key would be sent over an insecure connection.");
}

const client = new AgentBucketClient(apiKey, baseUrl);
const server = new McpServer({ name: "agentbucket", version: "0.2.0" });
registerTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);

// stdout is the MCP channel; log to stderr only.
console.error(`agentbucket MCP server ready (${baseUrl})`);
