import { createRequest } from "../utils/axios";
// 交易记录/投注记录
const API = {
  //  投注记录
  transferHistory: {
    url: "/pc/usercentre/games",
    method: "get",
  },
  //  余额记录
  balanceHistory: {
    url: "/pc/usercentre/balance-history",
    method: "get",
  },
  //  存款记录
  depositsHistory: {
    url: "/pc/usercentre/deposits",
    method: "get",
  },
  //  取款记录
  withdrawalsHistory: {
    url: "/pc/usercentre/withdrawals",
    method: "get",
  },
  getTransferType: {
    url: "/pc/payments?t=1",
    method: "get",
  },
  getDepositsDetails: {
    url: '/pc/promotion/details/0',
    method: 'get',
  }
};

export default createRequest(API);
