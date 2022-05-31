/**
 * 把陣列根據回呼函式分成二個子陣列，算是Array.prototype.filter的擴充
 * @param {Array} Arr 要分類的陣列
 * @param {(element, index, array) => Boolean} callBackFun 回呼函式，參數的定義請參考Array.prototype.filter，但沒有thisArg參數（因為是用Array.prototype.reduce實做的）
 * @returns {[trueArr: Array, falseArr: Array]} 第一個子陣列為回傳值為true的集合，第二個子陣列為回傳值為false的集合
 */
export function separateArray(Arr = [], callBackFun = f => true) {
  return Arr.reduce(
    ([accTrueArr, accFalseArr], curValue, ...others) => {
      return callBackFun(curValue, ...others) ? [[...accTrueArr, curValue], accFalseArr] : [accTrueArr, [...accFalseArr, curValue]];
    },
    [[], []],
  );
}
/**
 * 實做redux的compose函式，可以取代redux.js 的compose函式
 * @param  {...any} funs
 * @returns {(arg: any) => any}
 */
export function invokeCompose(...funs) {
  if (funs.length === 0) {
    return arg => arg;
  }
  if (funs.length === 1) {
    return funs[0](arg);
  }
  return arg => funs.reduceRight((preData, curFun) => curFun(preData), arg);
}
