import api from '@/api';
/**
 * 把/system/configByCode這支API中的value值解碼成Object
 * @param {String} value /system/configByCode中的Val值
 * @param {String} lastEditor 最後編輯value的人
 * @returns {Object}
 */
export function decodeConfigAPIValue(value = '{}', lastEditor = 'XXX') {
  if (value === '') {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`數值: ${value} 有誤，請勿使用非正規方式設定數值`);
    console.error(`請捉${lastEditor}，鞭數十，驅之別院`);
    return {};
  }
}
/**
 * 把Object編碼成config這支API中的value值
 * @param {*} obj
 * @returns {String}
 */
export function encodeConfigAPIValue(obj) {
  return JSON.stringify(obj);
}

/**
 * dilida新做的configAPI
 * @async 回傳API資料
 * @param {String} code 指定的Code的值
 * @param {Number} used 1,2,4
 */
export async function getConfigByCode({ code, used } = {}) {
  return api.post('/system/configGetByCode', { code, used });
}

/**
 * dilida新做的configAPI2
 * @async 回傳API資料
 * @param {String} code 指定的Code的值
 * @param {Number} used 1,2,4
 * @param {String} remark 暫時沒用的識別文字
 * @param {String} val 編碼後的字串，請先使用decodeConfigAPIValue這個函式把數值加工
 */
export async function postConfigByCode({ code, used, remark, val } = {}) {
  return api.post('/system/configAddByCode', { code, used, remark, val });
}
