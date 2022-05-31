import { format, subDays } from 'date-fns';
import XLSX from 'xlsx';
 /**
 * 向下取小数点后两位
 * @param {number | string} 
 * @returns {string}
 */
export const toFix2 = (value) => typeof value ==='number' ? (Math.floor(value * 100) / 100).toFixed(2) : (Math.floor(parseFloat(value) * 100) / 100).toFixed(2)
   
 
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string') {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time);
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/');
      }
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    return value.toString().padStart(2, '0');
  });
  return time_str;
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (`${time}`.length === 10) {
    time = parseInt(time) * 1000;
  } else {
    time = +time;
  }
  const d = new Date(time);
  const now = Date.now();

  const diff = (now - d) / 1000;

  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    // less 1 hour
    return `${Math.ceil(diff / 60)}分钟前`;
  } else if (diff < 3600 * 24) {
    return `${Math.ceil(diff / 3600)}小时前`;
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return `${d.getMonth() + 1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`;
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url;
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) {
      s++;
    } else if (code > 0x7ff && code <= 0xffff) {
      s += 2;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      i--;
    }
  }
  return s;
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) {
    return '';
  }
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) {
        return '';
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`;
    }),
  ).join('&');
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    `{"${decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ')}"}`,
  );
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div');
  div.innerHTML = val;
  return div.textContent || div.innerText;
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {};
  }
  if (Array.isArray(source)) {
    return source.slice();
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property];
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty);
    } else {
      target[property] = sourceProperty;
    }
  });
  return target;
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return;
  }
  let classString = element.className;
  const nameIndex = classString.indexOf(className);
  if (nameIndex === -1) {
    classString += `${className}`;
  } else {
    classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length);
  }
  element.className = classString;
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90;
  } else {
    return new Date(new Date().toDateString());
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function(...args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone');
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr));
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = `${+new Date()}`;
  const randomNum = `${parseInt((1 + Math.random()) * 65536)}`;
  return (+(randomNum + timestamp)).toString(32);
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`));
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) {
    ele.className += ` ${cls}`;
  }
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp(`(\\s|^)${cls}(\\s|$)`);
    ele.className = ele.className.replace(reg, ' ');
  }
}

/**
 * @returns {Object}
 */
export function nationalityList() {
  const Country = this.$t('globalCountryList');
  const CountryList = Object.values(Country);
  return CountryList;
}

/**
 * @returns {Object}
 */
export function dialingCodeList() {
  const Dial = this.$t('globalDialList');
  const DialList = Object.values(Dial);
  return DialList;
}

export const exportXLSX = (data, name) => {
  const reportFrag = 100000;
  const headers = data.splice(0, 1);
  const rows = data;

  for (let index = 0; rows.length > 0; index++) {
    const fragment = rows.slice(0, reportFrag);
    rows.splice(0, reportFrag);
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    XLSX.utils.sheet_add_aoa(ws, fragment, { origin: -1 });
    XLSX.writeFile(wb, `${name}${index > 0 ? `-${index}` : ``}.xlsx`);
  }
};

export const shortcuts = [
  {
    text: '今日',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      end.setHours(23, 59, 59);
      start.setTime(end.getTime() - 3600 * 1000 * 24 + 1000);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '昨日',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      end.setTime(end.getTime() - 3600 * 1000 * 24 + 1000);
      end.setHours(23, 59, 59);
      start.setTime(end.getTime() - 3600 * 1000 * 24 + 1000);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '本周',
    onClick(picker) {
      const start = new Date();
      const end = new Date();
      const nows = start.getDay() || 7; // 注意周日算第一天，如果周日查询本周的话，天数是0，所有如果是0，默认设置为7
      start.setTime(start.getTime() - 3600 * 1000 * 24 * (nows - 1));
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '上周',
    onClick(picker) {
      const dataValue = new Date();
      const year = dataValue.getFullYear();
      const month = dataValue.getMonth() + 1;
      const day = dataValue.getDate();
      let thisWeekStart; // 本周周一的时间
      if (dataValue.getDay() == 0) {
        thisWeekStart = new Date(`${year}/${month}/${day}`).getTime() - (dataValue.getDay() + 6) * 86400000; // 周天的情况；
      } else {
        thisWeekStart = new Date(`${year}/${month}/${day}`).getTime() - (dataValue.getDay() - 1) * 86400000;
      }
      const prevWeekStart = thisWeekStart - 7 * 86400000; // 上周周一的时间
      const prevWeekEnd = thisWeekStart - 1 * 86400000; // 上周周日的时间
      const start = new Date(prevWeekStart); // 开始时间
      const end = new Date(prevWeekEnd); // 结束时间
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '最近7天',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '本月',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setDate(1);
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '上月',
    onClick(picker) {
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth();
      if (month == 0) {
        month = 12;
        year = year - 1;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      const myDate = new Date(year, month, 0);
      const start = new Date(`${year}-${month}-01 00:00:00`); // 上个月第一天
      const end = new Date(`${year}-${month}-${myDate.getDate()} 23:59:59`); // 上个月最后一天
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '最近30天',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '今年',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setMonth(0);
      start.setDate(1);
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);
      picker.$emit('pick', [start, end]);
    },
  },
  {
    text: '去年',
    onClick(picker) {
      const oDate = new Date();
      const prevYear = oDate.getFullYear() - 1;
      const end = new Date();
      const start = new Date();
      start.setFullYear(prevYear);
      start.setMonth(0);
      start.setDate(1);
      end.setFullYear(prevYear);
      end.setMonth(11);
      end.setDate(31);
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);
      picker.$emit('pick', [start, end]);
    },
  },
];

export const dateRange = {
  inputProps: {
    outline: true,
    label: '选择时间段',
    'background-color': '#f5f5f5',
    style: {
      width: '100%',
    },
  },
  menuProps: {
    offsetY: true,
    closeOnContentClick: false,
    style: {
      width: '100%',
    },
  },
  presets: [
    {
      label: '今天',
      range: [format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')],
    },
    {
      label: '昨天',
      range: [format(subDays(new Date(), 1), 'yyyy-MM-dd'), format(subDays(new Date(), 1), 'yyyy-MM-dd')],
    },
    {
      label: '近30天',
      range: [format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(subDays(new Date(), 1), 'yyyy-MM-dd')],
    },
  ],
};

// 小數點第N位四捨五入
export function formatFloat(num, pos) {
  const size = Math.pow(10, pos);
  return Math.round(num * size) / size;
}
