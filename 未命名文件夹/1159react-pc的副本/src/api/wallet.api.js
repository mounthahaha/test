import { createRequest } from "../utils/axios";

const API = {
  // 获取余额
  balance: {
    url: "/pc/usercentre/balance",
    method: 'post',
  },
  getDepositedCurrency: {
    url: "/pc/usercentre/deposit/currency",
    method: 'get',
  }
};

export default createRequest(API);
