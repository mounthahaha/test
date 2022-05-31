import { createRequest } from "../utils/axios";

const API = {
  // 注册
  regist: {
    url: "/pc/eregister",
    method: 'post',
  },
};

export default createRequest(API);
