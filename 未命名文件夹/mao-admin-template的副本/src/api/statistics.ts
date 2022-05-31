import  {request} from "@/utils/request"


export function deductionData() {
  return request({
    url: "/Dashboard/deduction",
    method: "get",
  })
}

export function diamondData() {
  return request({
    url: "/Dashboard/diamond",
    method: "get",
  })
}
export function gameData() {
  return request({
    url: "/Dashboard/game",
    method: "get",
  })
}
export function otherData() {
  return request({
    url: "/Dashboard/other",
    method: "get",
  })
}
export function usersData() {
  return request({
    url: "/Dashboard/users",
    method: "get",
  })
}
export function vipData() {
  return request({
    url: "/Dashboard/vip",
    method: "get",
  })
}
export function withdrawalData() {
  return request({
    url: "/Dashboard/withdrawal",
    method: "get",
  })
}
