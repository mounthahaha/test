import { createRequest } from "../utils/axios";

const API = {
  // 个人信息
  getProfile: {
    url: "pc/usercentre/profile",
    method: "get",
  },
  // pc 更新
  postApiProfile: {
    url: "pc/usercentre/profile",
    method: "post",
  },

  // 获取钱包信息
  getWalletAll: {
    url: "pc/usercentre/balance/all",
  },

  // pc 取得 個人銀行卡
  getApiBankList: {
    url: "/usercentre/banks",
  },
  // pc 添加 银行卡 USDT
  postApiBankList: {
    url: "pc/usercentre/bank",
    method: "post",
  },

  // 获取银行卡列表
  banklist: {
    url: "pc/usercentre/banks",
    method: "GET",
  },
  // 更改登录密码
  password: {
    url: "pc/usercentre/password",
    method: "PUT",
  },
  // 首次提款密码
  wpassPassword: {
    url: "pc/usercentre/wpass",
    method: "PUT",
  },
  //修改提款密码
  updateWpassPassword: {
    url: "pc/usercentre/wpassword",
    method: "PUT",
  },
  // 获取当前vip信息
  getCurrenVip: {
    url: "pc/usercentre/vip",
    method: "GET",
  },
  // 获取钱包全部
  getWalitTotal: {
    url: "pc/usercentre/total",
    method: "GET",
  },
  // 获取钱包全部
  getBalanceAll: {
    url: "pc/usercentre/balance/all",
    method: "GET",
  },
  // 优惠列表
  getPromotionList: {
    url: "pc/promotion/list",
    method: "GET",
  },
  // 优惠详情
  getPromotionDetail: {
    url: (params) => `pc/promotion/details/${params.id}?id=${params.id}`,
    method: "GET",
  },
  // 投注记录
  usercentreGame: {
    url: 'pc/usercentre/games',
    method: "GET",
  },
  // 提现
  withdrawal: {
    url: 'pc/usercentre/withdrawal',
    method: "POST",
  },    
  // 提交 USTD提現 是否可以
  getApiUsdtWithdrawal: {
    url: 'pc/usercentre/usdtstate'    
  },
};

export default createRequest(API);
