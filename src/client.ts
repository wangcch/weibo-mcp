import type {
  WeiboHotSearchApiResponse,
  WeiboSearchApiResponse,
  WeiboServerConfig,
  WeiboStatusApiResponse,
  WeiboTokenResponse,
} from "./types.js";

const TOKEN_EXPIRE_FALLBACK_SECONDS = 7200;
const TOKEN_REFRESH_BUFFER_SECONDS = 60;

type TokenCache = {
  token: string;
  acquiredAt: number;
  expiresIn: number;
};

export class WeiboApiClient {
  private tokenCache: TokenCache | null = null;
  private tokenPromise: Promise<TokenCache> | null = null;

  constructor(private readonly config: WeiboServerConfig) {}

  private isTokenValid(): boolean {
    if (!this.tokenCache) {
      return false;
    }
    const expiresAt =
      this.tokenCache.acquiredAt +
      this.tokenCache.expiresIn * 1000 -
      TOKEN_REFRESH_BUFFER_SECONDS * 1000;
    return Date.now() < expiresAt;
  }

  async getToken(forceRefresh = false): Promise<TokenCache> {
    if (!forceRefresh && this.isTokenValid() && this.tokenCache) {
      return this.tokenCache;
    }
    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchToken().finally(() => {
        this.tokenPromise = null;
      });
    }
    return this.tokenPromise;
  }

  private async fetchToken(): Promise<TokenCache> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to get token: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
      );
    }

    const body = (await response.json()) as WeiboTokenResponse;
    const token = body.data?.token;
    if (!token) {
      throw new Error("Token response missing data.token");
    }

    const expiresIn = body.data?.expire_in ?? TOKEN_EXPIRE_FALLBACK_SECONDS;
    const cached = {
      token,
      acquiredAt: Date.now(),
      expiresIn,
    };

    this.tokenCache = cached;
    return cached;
  }

  async search(query: string): Promise<WeiboSearchApiResponse> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.searchEndpoint);
    url.searchParams.set("query", query);
    url.searchParams.set("token", token);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Weibo search failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
      );
    }

    return (await response.json()) as WeiboSearchApiResponse;
  }

  async getUserStatus(count?: number): Promise<WeiboStatusApiResponse> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.statusEndpoint);
    url.searchParams.set("token", token);
    if (typeof count === "number") {
      url.searchParams.set("count", String(count));
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Get user status failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }

    return (await response.json()) as WeiboStatusApiResponse;
  }

  async getHotSearch(category: string, count?: number): Promise<WeiboHotSearchApiResponse> {
    const token = (await this.getToken()).token;

    const url = new URL(this.config.hotSearchEndpoint);
    url.searchParams.set("token", token);
    url.searchParams.set("category", category);
    if (typeof count === "number") {
      url.searchParams.set("count", String(count));
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Get hot search failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }

    return (await response.json()) as WeiboHotSearchApiResponse;
  }

  async refreshToken(): Promise<unknown> {
    const token = (await this.getToken()).token;
    const response = await fetch(this.config.refreshTokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Refresh token failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }

    return await response.json();
  }

  async crowdTopicNames(): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdTopicNamesEndpoint);
    url.searchParams.set("token", token);

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Get crowd topics failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }

  async crowdTopicDetails(): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdTopicDetailsEndpoint);
    url.searchParams.set("token", token);

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Get crowd topic details failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }

  async crowdTimeline(params: {
    topicName: string;
    page?: number;
    count?: number;
    sinceId?: string;
    maxId?: string;
    sortType?: 0 | 1;
  }): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdTimelineEndpoint);
    url.searchParams.set("token", token);
    url.searchParams.set("topic_name", params.topicName);
    if (typeof params.page === "number") {
      url.searchParams.set("page", String(params.page));
    }
    if (typeof params.count === "number") {
      url.searchParams.set("count", String(params.count));
    }
    if (params.sinceId) {
      url.searchParams.set("since_id", params.sinceId);
    }
    if (params.maxId) {
      url.searchParams.set("max_id", params.maxId);
    }
    if (typeof params.sortType === "number") {
      url.searchParams.set("sort_type", String(params.sortType));
    }

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Get crowd timeline failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }

  async crowdPost(params: {
    topicName: string;
    status: string;
    aiModelName?: string;
    tagId?: string;
    mediaId?: string;
  }): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdPostEndpoint);
    url.searchParams.set("token", token);

    const body: Record<string, unknown> = {
      topic_name: params.topicName,
      status: params.status,
    };
    if (params.aiModelName) {
      body.ai_model_name = params.aiModelName;
    }
    if (params.tagId) {
      body.tag_id = params.tagId;
    }
    if (params.mediaId) {
      body.media_id = params.mediaId;
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Create crowd post failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }

  async crowdComment(params: {
    id: string;
    comment: string;
    aiModelName?: string;
    commentOri?: 0 | 1;
    isRepost?: 0 | 1;
  }): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdCommentEndpoint);
    url.searchParams.set("token", token);

    const body: Record<string, unknown> = {
      id: Number(params.id),
      comment: params.comment,
    };
    if (params.aiModelName) {
      body.ai_model_name = params.aiModelName;
    }
    if (typeof params.commentOri === "number") {
      body.comment_ori = params.commentOri;
    }
    if (typeof params.isRepost === "number") {
      body.is_repost = params.isRepost;
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Create crowd comment failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }

  async crowdReply(params: {
    cid: string;
    id: string;
    comment: string;
    aiModelName?: string;
    withoutMention?: 0 | 1;
    commentOri?: 0 | 1;
    isRepost?: 0 | 1;
  }): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdReplyEndpoint);
    url.searchParams.set("token", token);

    const body: Record<string, unknown> = {
      cid: Number(params.cid),
      id: Number(params.id),
      comment: params.comment,
    };
    if (params.aiModelName) {
      body.ai_model_name = params.aiModelName;
    }
    if (typeof params.withoutMention === "number") {
      body.without_mention = params.withoutMention;
    }
    if (typeof params.commentOri === "number") {
      body.comment_ori = params.commentOri;
    }
    if (typeof params.isRepost === "number") {
      body.is_repost = params.isRepost;
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Reply crowd comment failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }

  async crowdComments(params: {
    id: string;
    sinceId?: string;
    maxId?: string;
    page?: number;
    count?: number;
    childCount?: number;
    fetchChild?: 0 | 1;
    isAsc?: 0 | 1;
    trimUser?: 0 | 1;
    isEncoded?: 0 | 1;
  }): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdCommentsEndpoint);
    url.searchParams.set("token", token);
    url.searchParams.set("id", params.id);
    if (params.sinceId) {
      url.searchParams.set("since_id", params.sinceId);
    }
    if (params.maxId) {
      url.searchParams.set("max_id", params.maxId);
    }
    if (typeof params.page === "number") {
      url.searchParams.set("page", String(params.page));
    }
    if (typeof params.count === "number") {
      url.searchParams.set("count", String(params.count));
    }
    if (typeof params.childCount === "number") {
      url.searchParams.set("child_count", String(params.childCount));
    }
    if (typeof params.fetchChild === "number") {
      url.searchParams.set("fetch_child", String(params.fetchChild));
    }
    if (typeof params.isAsc === "number") {
      url.searchParams.set("is_asc", String(params.isAsc));
    }
    if (typeof params.trimUser === "number") {
      url.searchParams.set("trim_user", String(params.trimUser));
    }
    if (typeof params.isEncoded === "number") {
      url.searchParams.set("is_encoded", String(params.isEncoded));
    }

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Get crowd comments failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }

  async crowdChildComments(params: {
    id: string;
    sinceId?: string;
    maxId?: string;
    page?: number;
    count?: number;
    trimUser?: 0 | 1;
    needRootComment?: 0 | 1;
    isAsc?: 0 | 1;
    isEncoded?: 0 | 1;
  }): Promise<unknown> {
    const token = (await this.getToken()).token;
    const url = new URL(this.config.crowdChildCommentsEndpoint);
    url.searchParams.set("token", token);
    url.searchParams.set("id", params.id);
    if (params.sinceId) {
      url.searchParams.set("since_id", params.sinceId);
    }
    if (params.maxId) {
      url.searchParams.set("max_id", params.maxId);
    }
    if (typeof params.page === "number") {
      url.searchParams.set("page", String(params.page));
    }
    if (typeof params.count === "number") {
      url.searchParams.set("count", String(params.count));
    }
    if (typeof params.trimUser === "number") {
      url.searchParams.set("trim_user", String(params.trimUser));
    }
    if (typeof params.needRootComment === "number") {
      url.searchParams.set("need_root_comment", String(params.needRootComment));
    }
    if (typeof params.isAsc === "number") {
      url.searchParams.set("is_asc", String(params.isAsc));
    }
    if (typeof params.isEncoded === "number") {
      url.searchParams.set("is_encoded", String(params.isEncoded));
    }

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Get crowd child comments failed: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`,
      );
    }
    return await response.json();
  }
}
