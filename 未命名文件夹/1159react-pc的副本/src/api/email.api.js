import { createRequest } from "../utils/axios";

const API = {
  /**
 * 取得 站內信列表
 * @param {string} page 當前頁數
 * @param {string} page_num 當前頁數筆數
 * @param {string} is_show_all 顯示全部1....
 */
  // 站內信列表
  getApiStationLetterList: {
    url: "pc/usercentre/stationletter/list",
    method: "get",
  },
  // 站內信列表
  geSysMsgList: {
    url: "m/boards",
    method: "get",
  },

   // 站內信详情
   getApiStationLetter: {
    url: (params) => `pc/usercentre/stationletter/${params.id}`,
    method: "GET",
  },

  // 刪除 站內信
  postDeleteMail: {
    url: `pc/usercentre/stationletter/delete`,
    method: "post",
  },
 
};

export default createRequest(API);
