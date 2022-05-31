import  {request} from "@/utils/request"


export const api_version =()=>  request({  url: "/version", method: "get"})
export const appConfig =()=>  request({  url: "/global/configure", method: "get"})