/**
 * 編碼資料
 * @param {Object} obj 要編碼的資料
 * @return {String} 編碼後的字串
 */
export function jsonEncode(obj) {
  return JSON.stringify(obj);
}
/**
 * 簡單的解碼資料
 * @param {String} str 字串
 * @returns {Object} 解碼後的資料
 */
export function jsonDecode(str, defaultObj = {}) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultObj;
  }
}
