import  {request} from "@/utils/request"


interface IUserRequestData {
  username: string
  password: string
}

/** 登录，返回 token */
export const userLogin =(data)=>  request({  url: "/login", method: "post", data})


/** 获取用户详情 */
export function userInfoRequest() {
  return request({
    url: "user/info",
    method: "get"
  })
}
/** 登出 */
export function userlogout() {
  return request({
    url: "user/logout",
    method: "post"
  })
}
