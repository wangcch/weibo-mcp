import type { WeiboServerConfig } from "./types.js";

const DEFAULT_TOKEN_ENDPOINT = "https://open-im.api.weibo.com/open/auth/ws_token";
const DEFAULT_REFRESH_TOKEN_ENDPOINT = "https://open-im.api.weibo.com/open/auth/refresh_token";
const DEFAULT_SEARCH_ENDPOINT = "https://open-im.api.weibo.com/open/wis/search_query";
const DEFAULT_STATUS_ENDPOINT = "https://open-im.api.weibo.com/open/weibo/user_status";
const DEFAULT_HOT_SEARCH_ENDPOINT = "https://open-im.api.weibo.com/open/weibo/hot_search";
const DEFAULT_CROWD_TOPIC_NAMES_ENDPOINT = "https://open-im.api.weibo.com/open/crowd/topic_names";
const DEFAULT_CROWD_TOPIC_DETAILS_ENDPOINT =
  "https://open-im.api.weibo.com/open/crowd/topic_details";
const DEFAULT_CROWD_TIMELINE_ENDPOINT = "https://open-im.api.weibo.com/open/crowd/timeline";
const DEFAULT_CROWD_POST_ENDPOINT = "https://open-im.api.weibo.com/open/crowd/post";
const DEFAULT_CROWD_COMMENT_ENDPOINT = "https://open-im.api.weibo.com/open/crowd/comment";
const DEFAULT_CROWD_REPLY_ENDPOINT = "https://open-im.api.weibo.com/open/crowd/comment/reply";
const DEFAULT_CROWD_COMMENTS_ENDPOINT =
  "https://open-im.api.weibo.com/open/crowd/comment/tree/root_child";
const DEFAULT_CROWD_CHILD_COMMENTS_ENDPOINT =
  "https://open-im.api.weibo.com/open/crowd/comment/tree/child";

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (!raw) {
    return defaultValue;
  }
  const value = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }
  return defaultValue;
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export function loadConfig(): WeiboServerConfig {
  return {
    appId: readRequiredEnv("WEIBO_APP_ID"),
    appSecret: readRequiredEnv("WEIBO_APP_SECRET"),
    tokenEndpoint: process.env.WEIBO_TOKEN_ENDPOINT?.trim() || DEFAULT_TOKEN_ENDPOINT,
    refreshTokenEndpoint:
      process.env.WEIBO_REFRESH_TOKEN_ENDPOINT?.trim() || DEFAULT_REFRESH_TOKEN_ENDPOINT,
    searchEndpoint: process.env.WEIBO_SEARCH_ENDPOINT?.trim() || DEFAULT_SEARCH_ENDPOINT,
    statusEndpoint: process.env.WEIBO_STATUS_ENDPOINT?.trim() || DEFAULT_STATUS_ENDPOINT,
    hotSearchEndpoint: process.env.WEIBO_HOT_SEARCH_ENDPOINT?.trim() || DEFAULT_HOT_SEARCH_ENDPOINT,
    crowdTopicNamesEndpoint:
      process.env.WEIBO_CROWD_TOPIC_NAMES_ENDPOINT?.trim() || DEFAULT_CROWD_TOPIC_NAMES_ENDPOINT,
    crowdTopicDetailsEndpoint:
      process.env.WEIBO_CROWD_TOPIC_DETAILS_ENDPOINT?.trim() ||
      DEFAULT_CROWD_TOPIC_DETAILS_ENDPOINT,
    crowdTimelineEndpoint:
      process.env.WEIBO_CROWD_TIMELINE_ENDPOINT?.trim() || DEFAULT_CROWD_TIMELINE_ENDPOINT,
    crowdPostEndpoint: process.env.WEIBO_CROWD_POST_ENDPOINT?.trim() || DEFAULT_CROWD_POST_ENDPOINT,
    crowdCommentEndpoint:
      process.env.WEIBO_CROWD_COMMENT_ENDPOINT?.trim() || DEFAULT_CROWD_COMMENT_ENDPOINT,
    crowdReplyEndpoint:
      process.env.WEIBO_CROWD_REPLY_ENDPOINT?.trim() || DEFAULT_CROWD_REPLY_ENDPOINT,
    crowdCommentsEndpoint:
      process.env.WEIBO_CROWD_COMMENTS_ENDPOINT?.trim() || DEFAULT_CROWD_COMMENTS_ENDPOINT,
    crowdChildCommentsEndpoint:
      process.env.WEIBO_CROWD_CHILD_COMMENTS_ENDPOINT?.trim() ||
      DEFAULT_CROWD_CHILD_COMMENTS_ENDPOINT,
    weiboCrowdEnabled: readBooleanEnv("WEIBO_CROWD_ENABLED", true),
    weiboSearchEnabled: readBooleanEnv("WEIBO_SEARCH_ENABLED", true),
    weiboStatusEnabled: readBooleanEnv("WEIBO_STATUS_ENABLED", true),
    weiboHotSearchEnabled: readBooleanEnv("WEIBO_HOT_SEARCH_ENABLED", true),
    weiboTokenEnabled: readBooleanEnv("WEIBO_TOKEN_ENABLED", true),
  };
}
