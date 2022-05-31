import { createRequest } from "../utils/axios";
const API = {
  // 获取公告
  noticeApi: {
    url: "pc/announcement",
    method: 'GET',
  },
  // 获取轮播图
  spotlightsApi: {
    url: "pc/spotlights",
    method: 'GET',
  },
  // 配置信息
  configure: {
    url: `pc/configure`
  },
  
  
  
};

export default createRequest(API);