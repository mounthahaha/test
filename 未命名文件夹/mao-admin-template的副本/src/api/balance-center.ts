import  {request} from "@/utils/request"

//余额相关 
export function getBalanceList(params?) {
  return request({
    url: "/RechargeCentre/getBalanceList",
    method: "get",
    params: {
      data: params
    }
  })
}

export function addBalance(data) {
  return request({
    url: "/RechargeCentre/addBalance",
    method: "post",
    data:{
     data:JSON.stringify(data)
    }
  })
}
export function deleteBalance(data) {
  return request({
    url: "/RechargeCentre/deleteBalance",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function updateBalance(data) {
  return request({
    url: "/RechargeCentre/updateBalance",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}

//金币相关 
export function getGoldList(params?) {
  return request({
    url: "/RechargeCentre/getGoldList",
    method: "get",
    params: {
      data: params
    }
  })
}

export function addGold(data) {
  return request({
    url: "/RechargeCentre/addGold",
    method: "post",
    data:{
     data:JSON.stringify(data)
    }
  })
}
export function deleteGold(data) {
  return request({
    url: "/RechargeCentre/deleteGold",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function updateGold(data) {
  return request({
    url: "/RechargeCentre/updateGold",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}



//钻石相关 
export function getDiamondList(params?) {
  return request({
    url: "/RechargeCentre/getDiamondList",
    method: "get",
    params: {
      data: params
    }
  })
}

export function addDiamond(data) {
  return request({
    url: "/RechargeCentre/addDiamond",
    method: "post",
    data:{
     data:JSON.stringify(data)
    }
  })
}
export function deleteDiamond(data) {
  return request({
    url: "/RechargeCentre/deleteDiamond",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}
export function updateDiamond(data) {
  return request({
    url: "/RechargeCentre/updateDiamond",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}