import moment from 'moment';
// 格式化日期
export const formatDate = (value, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(value).format(format);
};
// 设置快捷时间
export const getDate = (value) => {
  
  let time;
  switch (value) {
    case '1':
      time = moment().locale('zh-cn').format('YYYY-MM-DD');
      break;
    case '2':
      time = moment(new Date()).locale('zh-cn').add(-1, 'days').format('YYYY-MM-DD');
      break;
    case '3':
      time = moment(new Date()).locale('zh-cn').add(-7, 'days').format('YYYY-MM-DD');
      break;
    case '4':
      time = moment(new Date()).locale('zh-cn').add(-29, 'days').format('YYYY-MM-DD');
      break;
    default:
      break;
  }
  return time;
};
// 单位转换 万，亿
export const tranNumber = (n) =>
  n.toFixed(0).replace(/(\d{1,4})((\d{4})*)$/, (a, b, c) => {
    const t = ['', '万', '亿', '万亿'][c.length / 4];
    return t ? `${b}${'.'}${c.slice(0, 2)}${t}` : b;
  });

export /**
 * 正则表单校验
 *
 * @param {*} v 校验值
 * @param {*} type 校验类型 如：phone 手机号 type 如有增加，需在reg按需要增加正则
 * @return {*} regFun(xxxx, 'phone')
 */
const regFun = (v, type) => {
  try {
    const reg = {
      phone: /^[1][3,4,5,7,8][0-9]{9}$/, // 手机号码
      userName: /^[0-9a-zA-Z]{6,16}$/, // 账户
    };
    if (!reg[type].test(v)) {
      return false;
    } else {
      return true;
    }
  } catch (error) {}
};
/**
 * 阻止冒泡
 *
 * @param {*} e 事件对象
 * @param {*} callBack 执行函数
 */
export const stopClick = (e, callBack) => {
  e.stopPropagation();
  e.preventDefault();
  if (callBack && getDataType(callBack) === 'function') {
    callBack();
  }
};

/**
 * 获取数据类型
 *
 * @param {*} value 类型值
 * @param {*} type 判断类型
 * @return {*} getDataType(value, 'object')
 */
const getDataType = (value, type) => {
  const dataType = Object.prototype.toString
    .call(value)
    .replace(/\[object (\w+)\]/, '$1')
    .toLowerCase();
  return type ? dataType === type : dataType;
};
