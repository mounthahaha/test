  // 存款记录状态
  const depositeStatus = {
    '-1': {
      color: 'black',
      title: '未知', // 未知
    },
    '0': {
      color: 'orange',
      title: '已确认（尚未支付）', // 待确认
    },
    '1': {
      color: 'green',
      title: '已确认', // 已确认
    },
    '2': {
      color: 'grey',
      title: '未入金', // 未入金
    },
    '3': {
      color: 'red',
      title: '异常订单', // 异常订单
    },
  }

  // 余额记录状态（没用到）
  const balanceStatus = {
    5: {
      color: 'success',
      title: '系统加值', // 系統加值
    },
    6: {
      color: 'warning',
      title: '系统扣除', // 系統扣除
    },
    8: {
      color: 'success',
      title: 'VIP礼金', // VIP禮金
    },
    9: {
      color: 'success',
      title: '好友推广活动金', // 好友推薦活動金
    },
    10: {
      color: 'success',
      title: '活动礼金', // 活動禮金
    },
  }

  // 存款记录状态
  const withdrawalStatus = {
    '-1': {
      color: 'black',
      title: '未知', // 未知
    },
    '0': {
      color: 'orange',
      title: '处理中', // 处理中
    },
    '1': {
      color: 'green',
      title: '已出金', // 已出金
    },
    '2': {
      color: 'grey',
      title: '已拒绝', // 已拒绝
    },
  }

  // 余额记录类型
  export const balanceTypeMap = {
    1: "入金",
    2: "出金",
    3: "退款",
    4: "转入游戏钱包或转回主钱包",
    5: "系统加值",
    6: "系統扣除",
    8: "活动金",
    9: "每日返水",
    10: "USDT取款",
    11: "银行卡取款",
    12: "取款退回"
  }

  // 取款记录類型
  export const withdrawalsTypeMap = {
    '0': {
      color: 'orange',
      title: '未确认', // 未确认
    },
    '1': {
      color: 'orange',
      title: '混合出金', // 混合出金
    },
    '2': {
      color: 'success',
      title: 'USDT出金', // USDT出金
    },
    '3': {
      color: 'green',
      title: '现金出金', // 現金出金
    }
  }

  export const statusObjMap = {
    '1': depositeStatus,
    '2': withdrawalStatus,
    '3': balanceStatus
  }