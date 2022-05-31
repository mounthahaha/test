import { createRequest } from "../utils/axios";

const API = {
  // 站内信列表数据
  geMsgList: {
    url: "/pc/usercentre/stationletter/list",
    method: "get",
  },
  geSysMsgList: {
    url: "/pc/boards",
    method: "get",
  },
  detelMsg: {
    url: "/pc/usercentre/stationletter/delete",
    method: "post",
  },
  reciveReward: {
    url: "/pc/usercentre/stationletter/receive",
    method: "post",
  },
  getDetail: {
    url: "/pc/usercentre/stationletter/",
    method: "get",
  },
};

export default createRequest(API);
