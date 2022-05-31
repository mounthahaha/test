import { createRequest } from "../utils/axios";

const API = {
  // 登录
  login: {
    url: "plogin",
    method: 'post',
  },
  logout: {
    url: "logout",
    method: 'GET',
  },
  // 项目配置
  appConfigure: {
    url: "pc/configure",
    method: 'GET',
  },
  getApiAs: {
    url: (params) => `as/${params.token}`,
    method: 'GET',
  }
};

export default createRequest(API);
