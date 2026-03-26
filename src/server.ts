import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { WeiboApiClient } from "./client.js";
import { loadConfig } from "./config.js";

function toTextResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function createServer(): McpServer {
  const config = loadConfig();
  const client = new WeiboApiClient(config);

  const server = new McpServer(
    {
      name: "weibo-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  if (config.weiboTokenEnabled) {
    server.registerTool(
      "weibo_token",
      {
        title: "Get Weibo Token",
        description: "Get current Weibo API token and expiry metadata.",
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
        },
      },
      async () => {
        const tokenInfo = await client.getToken();
        const masked =
          tokenInfo.token.length > 8
            ? tokenInfo.token.slice(0, 4) + "***" + tokenInfo.token.slice(-4)
            : "***";
        return toTextResult({
          success: true,
          token: masked,
          acquiredAt: new Date(tokenInfo.acquiredAt).toISOString(),
          expiresIn: tokenInfo.expiresIn,
          expiresAt: new Date(tokenInfo.acquiredAt + tokenInfo.expiresIn * 1000).toISOString(),
        });
      },
    );
  }

  if (config.weiboSearchEnabled) {
    server.registerTool(
      "weibo_search",
      {
        title: "Weibo Search",
        description: "Search Weibo content by query and return source metadata.",
        inputSchema: {
          query: z.string().min(1).describe("Search keywords"),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
        },
      },
      async ({ query }) => {
        const result = await client.search(query);
        return toTextResult(result);
      },
    );
  }

  if (config.weiboStatusEnabled) {
    server.registerTool(
      "weibo_status",
      {
        title: "Get User Weibo Status",
        description: "Get statuses posted by the authenticated Weibo user.",
        inputSchema: {
          count: z.number().int().min(1).max(100).optional().describe("Number of statuses"),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
        },
      },
      async ({ count }) => {
        const result = await client.getUserStatus(count);
        return toTextResult(result);
      },
    );
  }

  if (config.weiboHotSearchEnabled) {
    server.registerTool(
      "weibo_hot_search",
      {
        title: "Get Weibo Hot Search",
        description: "Get hot search list by category.",
        inputSchema: {
          category: z
            .enum(["主榜", "文娱榜", "社会榜", "生活榜", "acg榜", "科技榜", "体育榜"])
            .describe("Hot search category"),
          count: z.number().int().min(1).max(50).optional().describe("Number of hot search items"),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: false,
        },
      },
      async ({ category, count }) => {
        const result = await client.getHotSearch(category, count);
        return toTextResult(result);
      },
    );
  }

  if (config.weiboCrowdEnabled) {
    server.registerTool(
      "weibo_crowd",
      {
        title: "Weibo Crowd",
        description:
          "Weibo crowd operations. Read-only actions: topics, timeline, comments, child-comments. Write actions: post, comment, reply. Utility: refresh.",
        inputSchema: {
          action: z
            .enum([
              "topics",
              "timeline",
              "post",
              "comment",
              "reply",
              "comments",
              "child-comments",
              "refresh",
            ])
            .describe("Crowd operation"),
          topic: z.string().optional().describe("Topic name for timeline/post"),
          status: z.string().optional().describe("Post text"),
          id: z.string().optional().describe("Weibo ID or root comment ID"),
          cid: z.string().optional().describe("Comment ID for reply"),
          comment: z.string().optional().describe("Comment or reply text"),
          model: z.string().optional().describe("AI model name"),
          page: z.number().int().min(1).optional(),
          count: z.number().int().min(1).max(200).optional(),
          sinceId: z.string().optional(),
          maxId: z.string().optional(),
          sortType: z.union([z.literal(0), z.literal(1)]).optional(),
          childCount: z.number().int().min(1).max(200).optional(),
          fetchChild: z.union([z.literal(0), z.literal(1)]).optional(),
          isAsc: z.union([z.literal(0), z.literal(1)]).optional(),
          trimUser: z.union([z.literal(0), z.literal(1)]).optional(),
          isEncoded: z.union([z.literal(0), z.literal(1)]).optional(),
          needRootComment: z.union([z.literal(0), z.literal(1)]).optional(),
          commentOri: z.union([z.literal(0), z.literal(1)]).optional(),
          isRepost: z.union([z.literal(0), z.literal(1)]).optional(),
          withoutMention: z.union([z.literal(0), z.literal(1)]).optional(),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          openWorldHint: false,
        },
      },
      async (params) => {
        switch (params.action) {
          case "refresh": {
            const result = await client.refreshToken();
            return toTextResult(result);
          }
          case "topics": {
            const result = await client.crowdTopicNames();
            return toTextResult(result);
          }
          case "timeline": {
            if (!params.topic) {
              throw new Error("topic is required when action=timeline");
            }
            const result = await client.crowdTimeline({
              topicName: params.topic,
              page: params.page,
              count: params.count,
              sinceId: params.sinceId,
              maxId: params.maxId,
              sortType: params.sortType,
            });
            return toTextResult(result);
          }
          case "post": {
            if (!params.topic || !params.status) {
              throw new Error("topic and status are required when action=post");
            }
            const result = await client.crowdPost({
              topicName: params.topic,
              status: params.status,
              aiModelName: params.model,
            });
            return toTextResult(result);
          }
          case "comment": {
            if (!params.id || !params.comment) {
              throw new Error("id and comment are required when action=comment");
            }
            const result = await client.crowdComment({
              id: params.id,
              comment: params.comment,
              aiModelName: params.model,
              commentOri: params.commentOri,
              isRepost: params.isRepost,
            });
            return toTextResult(result);
          }
          case "reply": {
            if (!params.cid || !params.id || !params.comment) {
              throw new Error("cid, id and comment are required when action=reply");
            }
            const result = await client.crowdReply({
              cid: params.cid,
              id: params.id,
              comment: params.comment,
              aiModelName: params.model,
              withoutMention: params.withoutMention,
              commentOri: params.commentOri,
              isRepost: params.isRepost,
            });
            return toTextResult(result);
          }
          case "comments": {
            if (!params.id) {
              throw new Error("id is required when action=comments");
            }
            const result = await client.crowdComments({
              id: params.id,
              sinceId: params.sinceId,
              maxId: params.maxId,
              page: params.page,
              count: params.count,
              childCount: params.childCount,
              fetchChild: params.fetchChild,
              isAsc: params.isAsc,
              trimUser: params.trimUser,
              isEncoded: params.isEncoded,
            });
            return toTextResult(result);
          }
          case "child-comments": {
            if (!params.id) {
              throw new Error("id is required when action=child-comments");
            }
            const result = await client.crowdChildComments({
              id: params.id,
              sinceId: params.sinceId,
              maxId: params.maxId,
              page: params.page,
              count: params.count,
              trimUser: params.trimUser,
              needRootComment: params.needRootComment,
              isAsc: params.isAsc,
              isEncoded: params.isEncoded,
            });
            return toTextResult(result);
          }
          default: {
            const _exhaustive: never = params.action;
            throw new Error(`Unknown action: ${_exhaustive}`);
          }
        }
      },
    );
  }

  return server;
}
