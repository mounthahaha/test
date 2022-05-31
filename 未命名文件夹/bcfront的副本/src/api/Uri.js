/**
 * 全域設定 ＡＰＩ
 * @type {string}
 */
const GET_GLOBAL_CONFIGURE = 'global/configure';
const GET_VERSION = 'version';
/**
 * 獲取遊戲相關設定
 */
// 遊戲平臺列表
const GET_GAMEPLATFORMS = '/games/platforms';
// 遊戲組別
const GET_GAMEMENUS = 'games/menus';
/**
 * 內容管理  -  活动管理
 * @type {string}
 */
const GET_CMS_PROMOTION_LIST = `/cms/promotion/list`;
const GET_CMS_PROMOTION = `/cms/promotion/{id}`;
const GET_CMS_PROMOTION_IMAGEPIC = '/cms/promotion/pic?{id}';
const POST_CMS_PROMOTION_IMAGEPIC = '/cms/promotion/pic';
const POST_CMS_PROMOTION = `/cms/promotion/add`;
const PUT_CMS_PROMOTION = `/cms/promotion/update`;
const DELETE_CMS_PROMOTION = `/cms/promotion/delete`;
const PATCH_CMS_PROMOTION_ENABLE = `/cms/promotion/update-enable`;

/**
 * 內容管理 - 站內信
 * @type {string}
 */
const GET_STATION_LETTER_LIST = `cms/stationletter/list`;
const POST_STATION_LETTER_LIST = `cms/stationletter/add`;
const PUT_STATION_LETTER_LIST = `cms/stationletter/update`;
const GET_GLOBAL_USER_SEARCH = `global/user-search`;
const POST_GLOBAL_UPLOAD_CSV = `global/user-upload-csv`;
const GET_STATION_USERS = `cms/stationletter/users`;
const POST_STATION_RESEND = `cms/stationletter/resend`;
const POST_STATION_REVOKE = `cms/stationletter/revoke`;
const GET_STATION_REVOKE_LIST = `cms/stationletter/revoke-list`;

/**
 * 內容管理  -  vip管理
 * @type {string}
 */
const GET_PLAYER_VIP_LIST = `player/vip/list`; // 獲取 vip 設定列表
const GET_PATMENT_CHANNELS_LIST = `system/payment/channels`; // 獲取 全球支付渠道列表
const GET_VIP_LIST_PERIOD = `player/vip/listPeriod`; // vip 週期選單列表，準備停用
const GET_VIP_LIST_SETTINGS = `player/vip/listSettings`; // 獲取 vip 系統設定
const PUT_VIP_LEVEL_SETTINGS = `player/vip/updateLevelSettings`; // 修改 vip 等級設定
const PUT_VIP_SETTINGS = `player/vip/updateSettings`; // 修改 vip 系統設定
const PUT_PLAYER_VIP_SETTINGS = `player/vip/setlevel`; // 修改 玩家的 vip 設定

/**
 * 系統管理  -  域名管理
 * @type {string}
 */
const GET_SYSTEM_URL = `system/url`; // vip 列表
const POST_SYSTEM_URL = `system/url`; // vip 列表
const DELETE_SYSTEM_URL = `system/url/{id}`; // vip 列表

export {
  // 設定檔
  GET_GLOBAL_CONFIGURE,
  // API 版本
  GET_VERSION,
  // 遊戲相關設定
  GET_GAMEPLATFORMS,
  GET_GAMEMENUS,
  // 系統管理
  GET_SYSTEM_URL,
  POST_SYSTEM_URL,
  DELETE_SYSTEM_URL,
  // player 玩家管理
  GET_PLAYER_VIP_LIST,
  GET_PATMENT_CHANNELS_LIST,
  GET_VIP_LIST_PERIOD,
  GET_VIP_LIST_SETTINGS,
  PUT_VIP_LEVEL_SETTINGS,
  PUT_VIP_SETTINGS,
  PUT_PLAYER_VIP_SETTINGS,
  // cms 內容管理
  GET_STATION_LETTER_LIST,
  POST_STATION_LETTER_LIST,
  PUT_STATION_LETTER_LIST,
  POST_GLOBAL_UPLOAD_CSV,
  GET_STATION_USERS,
  POST_STATION_RESEND,
  POST_STATION_REVOKE,
  GET_STATION_REVOKE_LIST,
  GET_GLOBAL_USER_SEARCH,
  GET_CMS_PROMOTION_LIST,
  GET_CMS_PROMOTION,
  GET_CMS_PROMOTION_IMAGEPIC,
  POST_CMS_PROMOTION_IMAGEPIC,
  POST_CMS_PROMOTION,
  PUT_CMS_PROMOTION,
  DELETE_CMS_PROMOTION,
  PATCH_CMS_PROMOTION_ENABLE,
};
