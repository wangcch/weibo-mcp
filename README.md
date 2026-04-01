# weibo-mcp

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)

连接 AI 助手与**微博开放 API** 的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 服务，支持搜索、热搜榜单、用户动态、圈子互动等能力。可在 Claude、Cursor、Windsurf 等 MCP 兼容客户端中直接使用。

## 功能

- **微博搜索** — AI 智能搜索微博内容
- **热搜榜单** — 实时获取 7 个分类的热搜排行（主榜 / 文娱 / 社会 / 生活 / ACG / 科技 / 体育）
- **用户动态** — 获取当前认证用户发布的微博
- **圈子社区** — 浏览话题时间线、发帖、评论、回复等完整 CRUD 操作
- **令牌管理** — 自动缓存与刷新 Token，无需人工干预
- **灵活配置** — 按需启用/禁用工具，所有接口地址均可通过环境变量覆盖

## 快速开始

### 前置条件

- Node.js >= 18
- 微博开放 API 的 `app_id` 和 `app_secret`

### 获取凭证

1. 打开微博客户端，私信 [@微博龙虾助手](https://weibo.com/u/6808810981)
2. 发送消息：`连接龙虾`
3. 收到回复示例：

   ```
   您的应用凭证信息如下：

   AppId: your-app-id
   AppSecret: your-app-secret

   如需重置凭证，请发送 "重置凭证" 命令。
   ```

### 安装

```bash
npm install -g weibo-mcp
```

也可以直接使用 `npx`，无需安装。

### 配置 MCP 客户端

<details>
<summary><b>VS Code</b></summary>

添加到 `.vscode/mcp.json`：

```json
{
  "servers": {
    "weibo": {
      "command": "npx",
      "args": ["weibo-mcp"],
      "env": {
        "WEIBO_APP_ID": "your_app_id",
        "WEIBO_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

添加到 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "weibo": {
      "command": "npx",
      "args": ["weibo-mcp"],
      "env": {
        "WEIBO_APP_ID": "your_app_id",
        "WEIBO_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

添加到 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "weibo": {
      "command": "npx",
      "args": ["weibo-mcp"],
      "env": {
        "WEIBO_APP_ID": "your_app_id",
        "WEIBO_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

添加到 `~/.codeium/windsurf/mcp_config.json`：

```json
{
  "mcpServers": {
    "weibo": {
      "command": "npx",
      "args": ["weibo-mcp"],
      "env": {
        "WEIBO_APP_ID": "your_app_id",
        "WEIBO_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

</details>

<details>
<summary><b>命令行 (stdio)</b></summary>

```bash
WEIBO_APP_ID=your_app_id \
WEIBO_APP_SECRET=your_app_secret \
npx weibo-mcp
```

</details>

## 工具列表

| 工具               | 说明                          | 类型       |
| ------------------ | ----------------------------- | ---------- |
| `weibo_token`      | 获取当前 Token 状态及过期信息 | 🔍 只读    |
| `weibo_search`     | 按关键词搜索微博内容          | 🔍 只读    |
| `weibo_status`     | 获取当前用户发布的微博        | 🔍 只读    |
| `weibo_hot_search` | 按分类获取热搜排行榜          | 🔍 只读    |
| `weibo_crowd`      | 圈子社区操作（详见下方）      | 🔍/✏️ 混合 |

### `weibo_crowd` 操作

| Action           | 说明                               | 类型    |
| ---------------- | ---------------------------------- | ------- |
| `topics`         | 获取可用圈子话题列表               | 🔍 只读 |
| `topic-details`  | 获取可用圈子话题详情（含版块信息） | 🔍 只读 |
| `timeline`       | 浏览话题时间线                     | 🔍 只读 |
| `comments`       | 获取微博的根评论                   | 🔍 只读 |
| `child-comments` | 获取评论的回复列表                 | 🔍 只读 |
| `post`           | 在话题下发布新微博                 | ✏️ 写入 |
| `comment`        | 评论一条微博                       | ✏️ 写入 |
| `reply`          | 回复一条评论                       | ✏️ 写入 |
| `refresh`        | 强制刷新 Token                     | ✏️ 写入 |

`weibo_crowd` 的 `post` 支持可选参数：

- `tagId`：发帖版块 ID（可通过 `topic-details` 返回的 `tag_list` 获取）
- `mediaId`：视频媒体 ID（用于发视频帖子）

## 配置项

### 必填

| 环境变量           | 说明                       |
| ------------------ | -------------------------- |
| `WEIBO_APP_ID`     | 微博开放 API 的 App ID     |
| `WEIBO_APP_SECRET` | 微博开放 API 的 App Secret |

### 工具开关

所有工具默认启用，设为 `false` 可禁用：

| 环境变量                   | 对应工具           |
| -------------------------- | ------------------ |
| `WEIBO_SEARCH_ENABLED`     | `weibo_search`     |
| `WEIBO_STATUS_ENABLED`     | `weibo_status`     |
| `WEIBO_HOT_SEARCH_ENABLED` | `weibo_hot_search` |
| `WEIBO_CROWD_ENABLED`      | `weibo_crowd`      |
| `WEIBO_TOKEN_ENABLED`      | `weibo_token`      |

### 接口地址覆盖

所有接口地址均有默认值，仅在需要时覆盖：

<details>
<summary>查看所有接口地址变量</summary>

| 环境变量                              | 默认值                                                             |
| ------------------------------------- | ------------------------------------------------------------------ |
| `WEIBO_TOKEN_ENDPOINT`                | `https://open-im.api.weibo.com/open/auth/ws_token`                 |
| `WEIBO_REFRESH_TOKEN_ENDPOINT`        | `https://open-im.api.weibo.com/open/auth/refresh_token`            |
| `WEIBO_SEARCH_ENDPOINT`               | `https://open-im.api.weibo.com/open/wis/search_query`              |
| `WEIBO_STATUS_ENDPOINT`               | `https://open-im.api.weibo.com/open/weibo/user_status`             |
| `WEIBO_HOT_SEARCH_ENDPOINT`           | `https://open-im.api.weibo.com/open/weibo/hot_search`              |
| `WEIBO_CROWD_TOPIC_NAMES_ENDPOINT`    | `https://open-im.api.weibo.com/open/crowd/topic_names`             |
| `WEIBO_CROWD_TOPIC_DETAILS_ENDPOINT`  | `https://open-im.api.weibo.com/open/crowd/topic_details`           |
| `WEIBO_CROWD_TIMELINE_ENDPOINT`       | `https://open-im.api.weibo.com/open/crowd/timeline`                |
| `WEIBO_CROWD_POST_ENDPOINT`           | `https://open-im.api.weibo.com/open/crowd/post`                    |
| `WEIBO_CROWD_COMMENT_ENDPOINT`        | `https://open-im.api.weibo.com/open/crowd/comment`                 |
| `WEIBO_CROWD_REPLY_ENDPOINT`          | `https://open-im.api.weibo.com/open/crowd/comment/reply`           |
| `WEIBO_CROWD_COMMENTS_ENDPOINT`       | `https://open-im.api.weibo.com/open/crowd/comment/tree/root_child` |
| `WEIBO_CROWD_CHILD_COMMENTS_ENDPOINT` | `https://open-im.api.weibo.com/open/crowd/comment/tree/child`      |

</details>

## 开发

```bash
git clone https://github.com/wangcch/weibo-mcp.git
cd weibo-mcp
npm install

# 开发模式（热重载）
WEIBO_APP_ID=your_app_id WEIBO_APP_SECRET=your_app_secret npm run dev

# 类型检查
npm run lint

# 构建
npm run build
```

## API 参考

本项目包含完整的 OpenAPI 3.1.0 规范文件，覆盖所有 13 个微博 HTTP 接口：

- `openapi/weibo-openapi.yaml`

API 接口来源于 [openclaw-weibo](https://github.com/wecode-ai/openclaw-weibo) 项目，`weibo-openapi.yaml` 为据此整理的 OpenAPI 规范。

## 许可证

[MIT](LICENSE)
