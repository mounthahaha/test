import { createRequest } from "../utils/axios";

const API = {
  // 全部金额
  balanceAll: {
    url: "/pc/usercentre/balance/all",
    method: 'get',
  },
  // 全部金额
  configure: {
    url: "/pc/configure"    
  },
  getGameTypes: {
    url: '/pc/gamemenu',
    method: 'get',
  }
};

export default createRequest(API);
