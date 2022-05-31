
import JSEncrypt from 'jsencrypt';
import publicKey from './publicKey';
/**
 * 帳密 加密
 * @param {string} key
 */
 export const encrypted = (userInfo = {}) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(JSON.stringify(userInfo));
};

export const formatMoneyInput = (num) => {
    
    if ( num === '' ) {
        return ''
    }
    if ( Number.isNaN(parseFloat(num)) || parseFloat(num) <= 0 ) {
        return '0'
    }

    return `${parseFloat(num)}`;
};

export const getAppDownloadUrl = (config) => {
    let url = `${config.app || ''}&lang=zh-CN&templatetype=${config.appdownload_template_type || 'complex'}`;
    if (config.app && config.ios_download) {
      url = `${config.app || ''}?iosdownload=${encodeURIComponent(config.ios_download) || ''}&lang=zh-CN&templatetype=${config.appdownload_template_type || 'complex'}`;
    }
    const elementA = document.createElement('a');
    elementA.href = url;
    elementA.target = '_blank';
    elementA.click();
};


// 处理浮点数乘法精度丢失问题
export const accMul = (num1, num2) => {      
    if ( !num1 || !num2 ) {
      return 0;
    }
    let m = 0;
    let s1 = num1 && num1.toString()?num1.toString():'';
    let s2 = num2 && num2.toString()?num2.toString():''; 
    try {
      m += s1.split(".")[1].length;
    } catch ( e ) {}
    try {
      m += s2.split(".")[1].length;
    } catch ( e ) {}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
}

export const tranNumber = (n) => {
  const num = Number(n)
  if (num > 10000&&num<100000000) {
    return num / 10000 + '万'
  } else if (num >=100000000) {
    return num/100000000 + '亿'
  }
  return num;
}