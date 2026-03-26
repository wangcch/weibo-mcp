export type WeiboServerConfig = {
  appId: string;
  appSecret: string;
  tokenEndpoint: string;
  refreshTokenEndpoint: string;
  searchEndpoint: string;
  statusEndpoint: string;
  hotSearchEndpoint: string;
  crowdTopicNamesEndpoint: string;
  crowdTimelineEndpoint: string;
  crowdPostEndpoint: string;
  crowdCommentEndpoint: string;
  crowdReplyEndpoint: string;
  crowdCommentsEndpoint: string;
  crowdChildCommentsEndpoint: string;
  weiboCrowdEnabled: boolean;
  weiboSearchEnabled: boolean;
  weiboStatusEnabled: boolean;
  weiboHotSearchEnabled: boolean;
  weiboTokenEnabled: boolean;
};

export type WeiboTokenResponse = {
  code?: number;
  message?: string;
  data?: {
    token?: string;
    expire_in?: number;
  };
};

export type WeiboSearchApiResponse = {
  code: number;
  message: string;
  data: {
    analyzing: boolean;
    completed: boolean;
    msg: string;
    msg_format: string;
    msg_json: string;
    noContent: boolean;
    profile_image_url: string;
    reference_num: number;
    refused: boolean;
    scheme: string;
    status: number;
    status_stage: number;
    version: string;
    callTime?: string;
    source?: string;
  };
};

export type WeiboStatusUser = {
  screen_name: string;
};

export type WeiboStatusItem = {
  id: number;
  mid: string;
  text: string;
  created_at: string;
  has_image: boolean;
  images?: string[];
  pic_num?: number;
  comments_count: number;
  reposts_count: number;
  attitudes_count: number;
  user: WeiboStatusUser;
  repost?: WeiboStatusItem;
};

export type WeiboStatusApiResponse = {
  code: number;
  message: string;
  data: {
    statuses: WeiboStatusItem[];
    total_number: number;
  };
};

export type WeiboHotSearchItem = {
  cat: string;
  id: number;
  word: string;
  num: number;
  flag: number;
  app_query_link: string;
  h5_query_link: string;
  flag_link: string;
};

export type WeiboHotSearchApiResponse = {
  code: number;
  message: string;
  data: {
    callTime?: string;
    source?: string;
    data: WeiboHotSearchItem[];
  };
};
