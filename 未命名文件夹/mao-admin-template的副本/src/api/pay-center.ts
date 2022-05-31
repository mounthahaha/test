import  {request} from "@/utils/request"
//获取支付pid字段对照
export function getPidList(params?) {
  return request({
    url: "/pay/getPidList",
    method: "get",
    params: {
      data: params
    }
  })
}
//获取所有绑定支付ID意思
export function getTypeList(params?) {
  return request({
    url: "/pay/getTypeList",
    method: "get",
    params: {
      data: params
    }
  })
}

// 获取所有平台订单
export function getOnlinePayOrderList(params?) {
  return request({
    url: "/pay/getOnlinePayOrderList",
    method: "get",
    params: {
      data: params
    }
  })
}
export function OnlinePayOrderFail(data?) {
  return request({
    url: `/pay/OnlinePayOrderFail/${data}`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function OnlinePayOrderSuccess(data?) {
  return request({
    url: `/pay/OnlinePayOrderSuccess/${data}`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}


// 获取第三方订单
export function getShowPayOrderList(params?) {
  return request({
    url: "/pay/getShowPayOrderList",
    method: "get",
    params: {
      data: params
    }
  })
}
export function ShowPayOrderFail(data?) {
  return request({
    url: `/pay/ShowPayOrderFail/${data}`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function ShowPayOrderSuccess(data?) {
  return request({
    url: `/pay/ShowPayOrderSuccess/${data}`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}

// 获取所有游戏订单
export function getGameOrderList(params?) {
  return request({
    url: "/pay/getGameOrderList",
    method: "get",
    params: {
      data: params
    }
  })
}
export function GameOrderFail(data?) {
  return request({
    url: `/pay/GameOrderFail/${data}`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function GameOrderSuccess(data?) {
  return request({
    url: `/pay/GameOrderSuccess/${data}`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}


// 获取所有支付方式
export function getOnlinePayList(params?) {
  return request({
    url: "/pay/getOnlinePayList",
    method: "get",
  })
}

export function addOnlinePay(data?) {
  return request({
    url: `/pay/addOnlinePay`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}

export function updateOnlinePay(data?) {
  return request({
    url: `/pay/updateOnlinePay`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function deleteOnlinePay(data?) {
  return request({
    url: `/pay/deleteOnlinePay`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}


// 获取所有支付配置
export function getConfigPayList(params?) {
  return request({
    url: "/pay/getConfigPayList",
    method: "get",
  })
}

export function addConfigPay(data?) {
  return request({
    url: `/pay/addConfigPay`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}

export function updateConfigPay(data?) {
  return request({
    url: `/pay/updateConfigPay`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
export function deleteConfigPay(data?) {
  return request({
    url: `/pay/deleteConfigPay`,
    method: "post",
    data: {
      data: JSON.stringify(data)
    }
  })
}
