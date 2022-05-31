import { request } from "@/utils/request"




// 查询短信记录
export function getSmsRecordsList(params?) {
  return request({
    url: "/users/getSmsRecordsList",
    method: "get",
    params: {
      data: params
    }
  })
}

//用户相关
export function getUsersList(params?) {
  return request({
    url: "/users/list",
    method: "get",
    params: {
      data: params
    }
  })
}
//清空所有用户
export function deleteAllUsers(data) {
  return request({
    url: "/users/clean",
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function deleteUser(data) {
  return request({
    url: "/users/delete",
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function updataUser(data) {
  return request({
    url: "/users/update",
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function checkUserShare(params) {
  return request({
    url: `/users/share/${params}`,
    method: "get",
  })
}
export function checkUserSuperior(params) {
  return request({
    url: `/users/superior/${params}`,
    method: "get",
  })
}

//vip相关
export function getVipList(params) {
  return request({
    url: "/users/vipList",
    method: "get",
    params: {
      data: params
    }
  })
}
export function cleanVip(data) {
  return request({
    url: "/users/cleanVip",
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function vipAdd(data) {
  return request({
    url: "/users/vipAdd",
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}