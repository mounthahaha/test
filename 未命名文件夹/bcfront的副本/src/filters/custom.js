import store from '../store';
import app from '../main';
Date.prototype.Format = function(fmt) {
  // author: meizz
  const o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'H+': this.getHours() + 8, // 小时 +8小時
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, `${this.getFullYear()}`.substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
    }
  }
  return fmt;
};
const formatFmt = (value, fmt) => {
  if (!value || /^0001[-].*/gi.test(value)) {
    return '--';
  }
  value = new Date(value).Format(fmt);
  return value;
};
const formatDateAdd8Hours = value => {
  return formatFmt(value, 'yyyy-MM-dd HH:mm:ss');
};
const formatDate = value => {
  return formatFmt(value, 'yyyy-MM-dd hh:mm:ss');
};
const formatDay = value => {
  return formatFmt(value, 'yyyy-MM-dd');
};

/**
 * 金額千分位加逗號 + 保留小數２位 (ex: 1,000,123.00元)
 * @param num       must a number
 * @param isComma   true: 金額千分位加逗號, false: 不加 預設null以開關設定優先
 * @param fixed     must a number  （保留小數）
 * @returns isComma:true->{string} isComma:false->{number}
 */
const money = (num = 0, isComma = null, fixed = 2) => {
  num = isNaN(Number(num)) ? 0 : Number(num);
  isComma = isComma != null ? isComma : store.getters.isComma;
  return isComma
    ? Number(num).toLocaleString('ja-JP', {
        minimumFractionDigits: fixed,
        maximumFractionDigits: fixed,
      })
    : num.toFixed(fixed);
};

const moneyColor = (num = 0) => {
  num = isNaN(Number(num)) ? 0 : Number(num);
  let color = '';
  if (num > 0) {
    color = 'red';
  } else if (num < 0) {
    color = 'green';
  }
  // const color = num > 0 ? 'red' : num < 0 ? 'green' : '';
  return `<font color="${color}">${money(num)}</font>`;
};
const ratioColor = ratio => {
  if (!ratio) {
    return '--';
  }
  ratio = isNaN(Number(ratio.replace(/[%]/, ''))) ? 0 : Number(ratio.replace(/[%]/, ''));
  let color = '';
  if (ratio > 0) {
    color = 'red';
  } else if (ratio < 0) {
    color = 'green';
  }
  return `<font color="${color}">${ratio}%</font>`;
};

const recordLength = (result, key) => {
  this.$set(key, result.length);
  return result;
};

// ex:**********
const hiddenText = text => {
  return text?.toString().replace(/(\w|[\u4E00-\u9FFF])/gi, '*');
};
// ex: 187****7013
const hiddenPhoneNumber = telephone => {
  return telephone?.toString().replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
};
// ex: -
const emptyToBeDash = text => {
  return text === '' ? '－' : text;
};

const isJSON = str => {
  try {
    return JSON.parse(str) && !!str;
  } catch (e) {
    return false;
  }
};
const timediff = (diff = 0) => {
  diff = isNaN(Number(diff)) ? 0 : Number(diff);
  const intervals = {
    second: 1,
    minute: 1 * 60,
    hour: 1 * 60 * 60,
    day: 1 * 60 * 60 * 24,
  };
  let formatStr = '';
  const days = Math.floor(diff / intervals.day);
  diff -= days * intervals.day;
  const hours = Math.floor(diff / intervals.hour);
  diff -= hours * intervals.hour;
  const minutes = Math.floor(diff / intervals.minute);
  diff -= minutes * intervals.minute;
  formatStr += days ? `${days}${app.$t('g_day')} ` : '';
  formatStr += hours ? `${hours}${app.$t('g_hour')} ` : '';
  formatStr += minutes ? `${minutes}${app.$t('g_min')} ` : '';
  formatStr += `${diff}${app.$t('g_sec')}`;
  return formatStr;
};
const pureHtml = html => {
  return html
    .replace(/<img.*?src="(.*?)"[^>]+>/gi, '')
    .replace(/style="([^"]*)"/gi, '')
    .replace(/[<]strong[>]/gi, '')
    .replace(/[<]\/strong[>]/gi, '');
};
export {
  formatDate,
  formatDay,
  formatDateAdd8Hours,
  money,
  moneyColor,
  ratioColor,
  recordLength,
  hiddenText,
  hiddenPhoneNumber,
  emptyToBeDash,
  isJSON,
  timediff,
  pureHtml,
};
