/**
 * The six AgentBucket MCP tools. Descriptions are written for the *agent* so it
 * knows when to reach for each. These handlers are transport-agnostic and will
 * be reused by the future remote (Cloudflare Worker) MCP server.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AgentBucketClient } from "./client.js";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

const ok = (text: string): ToolResult => ({ content: [{ type: "text", text }] });
const fail = (e: unknown): ToolResult => ({
  content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
  isError: true,
});

export function registerTools(server: McpServer, client: AgentBucketClient): void {
  server.tool(
    "save_file",
    "Save a file to the user's Bucket0 AgentBucket. Use it for any output the user may want to keep, share, or reference later (documents, data, code, notes). On paid plans the text is indexed so you can recall it later with search_memory. Set index=false for scratch/throwaway files. Use forward slashes in path to place files in folders.",
    {
      path: z.string().describe("File path, e.g. reports/q3-summary.md"),
      content: z.string().describe("The file contents (text)."),
      index: z
        .boolean()
        .optional()
        .describe("Index this file for semantic memory (default true). Set false for scratch/throwaway files."),
    },
    async ({ path, content, index }) => {
      try {
        const r = await client.saveFile(path, content, index !== false);
        return ok(`Saved "${r.key}" (${r.size} bytes, destination: ${r.destination}).`);
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.tool(
    "search_memory",
    "Search the user's saved AgentBucket files by meaning (semantic search). Use this BEFORE regenerating work, to find something you (or a past session) already produced. Returns the most relevant snippets and their source file. Requires a paid Bucket0 plan.",
    {
      query: z.string().describe("Natural-language description of what you're looking for."),
      limit: z.number().int().positive().optional().describe("Max results (default 8)."),
    },
    async ({ query, limit }) => {
      try {
        const r = await client.searchMemory(query, limit ?? 8);
        const results = r.results || [];
        if (results.length === 0) return ok("No matching memory found.");
        return ok(
          results
            .map((x, i) => `${i + 1}. ${x.fileName} (score ${x.score.toFixed(2)})\n   ${x.snippet}`)
            .join("\n\n")
        );
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.tool(
    "read_file",
    "Read back the full contents of a text file you previously saved to AgentBucket.",
    { path: z.string().describe("File path/key, e.g. reports/q3-summary.md") },
    async ({ path }) => {
      try {
        return ok(await client.readFile(path));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.tool(
    "list_files",
    "List the files stored in the user's AgentBucket, optionally filtered to a folder.",
    {
      folder: z.string().optional().describe("Optional folder prefix to filter by, e.g. reports/"),
      page: z.number().int().positive().optional().describe("Page number (default 1)."),
    },
    async ({ folder, page }) => {
      try {
        const r = await client.listFiles(folder, page ?? 1);
        if (r.files.length === 0) return ok("No files found.");
        return ok(r.files.map((f) => `${f.key} (${f.size} bytes)`).join("\n"));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.tool(
    "delete_file",
    "Delete a file from AgentBucket. Only do this when the user explicitly asks you to.",
    { path: z.string().describe("File path/key to delete.") },
    async ({ path }) => {
      try {
        await client.deleteFile(path);
        return ok(`Deleted "${path}".`);
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.tool(
    "create_folder",
    "Create an empty folder in AgentBucket. Optional — saving to a nested path auto-creates folders.",
    { path: z.string().describe("Folder path, e.g. reports/2026") },
    async ({ path }) => {
      try {
        const r = await client.createFolder(path);
        return ok(`Created folder "${r.path}".`);
      } catch (e) {
        return fail(e);
      }
    }
  );
}
