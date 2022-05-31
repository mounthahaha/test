import  {request} from "@/utils/request"


//提现相关 
export function getList(params?) {
  return request({
    url: "/withdraw/getList",
    method: "get",
    params: {
      data: params
    }
  })
}

export function handleBack(data) {
  return request({
    url: "/withdraw/handleBack",
    method: "post",
    data:{
     data:JSON.stringify(data)
    }
  })
}
export function handleShenHe(data) {
  return request({
    url: `/withdraw/handleShenHe/${data}`,
    method: "post",
  })
}
export function update(data) {
  return request({
    url: "/withdraw/update",
    method: "post",
    data:{
      data:JSON.stringify(data)
     }
  })
}

export function del(data) {
  return request({
    url: `/withdraw/del/${data}`,
    method: "post",

  })
}

//卡号相关 
export function getCardList(params?) {
  return request({
    url: "/withdraw/getCardList",
    method: "get",
    params: {
      data: params
    }
  })
}

export function updateCard(data) {
  return request({
    url: "/withdraw/updateCard",
    method: "post",
    data:{
     data:JSON.stringify(data)
    }
  })
}

export function delCard(data) {
  return request({
    url: "/withdraw/delCard",
    method: "post",
    data:{
     data:JSON.stringify(data)
    }
  })
}