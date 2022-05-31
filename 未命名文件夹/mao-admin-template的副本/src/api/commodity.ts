import  {request} from "@/utils/request"


interface IaddCommodity {
  amount: string
  status:number
  [propName: string]: any;
}

interface IdeleteAndUpdateCommodity {
  id:string
ctime:string
utime:string
  amount: string
  status:number
  [propName: string]: any;
}
//砖石相关 

export function getCommodityDiamondList() {
  return request({
    url: "/Commodity/getCommodityDiamondList",
    method: "get",
  })
}

export function addCommodityDiamond(data:IaddCommodity) {
  return request({
    url: "/Commodity/addCommodityDiamond",
    method: "post",
    data:{
     data:JSON.stringify(data)
    }
  })
}
export function deleteCommodityDiamond(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/deleteCommodityDiamond",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function updateCommodityDiamond(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/updateCommodityDiamond",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
//游戏相关
export function getCommodityGameList() {
  return request({
    url: "/Commodity/getCommodityGameList",
    method: "get",
  })
}
export function addCommodityGame(data:IaddCommodity) {
  return request({
    url: "/Commodity/addCommodityGame",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function deleteCommodityGame(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/deleteCommodityGame",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function updateCommodityGame(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/updateCommodityGame",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
//金币相关
export function getCommodityGoldList() {
  return request({
    url: "/Commodity/getCommodityGoldList",
    method: "get",
  })
}
export function addCommodityGold(data:IaddCommodity) {
  return request({
    url: "/Commodity/addCommodityGold",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function deleteCommodityGold(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/deleteCommodityGold",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function updateCommodityGold(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/updateCommodityGold",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
//会员相关
export function getCommodityVipList() {
  return request({
    url: "/Commodity/getCommodityVipList",
    method: "get",
  })
}
export function addCommodityVip(data:IaddCommodity) {
  return request({
    url: "/Commodity/addCommodityVip",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function deleteCommodityVip(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/deleteCommodityVip",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function updateCommodityVip(data:IdeleteAndUpdateCommodity) {
  return request({
    url: "/Commodity/updateCommodityVip",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}