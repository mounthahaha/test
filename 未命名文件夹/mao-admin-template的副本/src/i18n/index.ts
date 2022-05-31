import { useI18nStoreHook } from '@/store/modules/i18n';
import {createI18n} from 'vue-i18n';


const messages = parserLangFile();


const i18n = createI18n({
    legacy: false,
    locale: useI18nStoreHook().locale, // set locale
    fallbackLocale: 'zh-CN',
    messages, // set locale messages
    // If you need to specify other options, you can set other options
    // ...
  })

function ArrLast (arr:Array<any>)  {
    return arr[arr.length - 1] 
}


function parserLangFile() {
    const req = require.context('./', true, /.js$/);
    const langObject = {};
    req.keys().forEach(path=>{
        const pathSplit = path.split('/');
        //只导入lang 和 country
        if (['lang', 'country'].includes(pathSplit[1])) {
          const fileprefix =  ArrLast(pathSplit).split('.')[0] 
          //值时false时候,  赋值一个空对象 
          langObject[fileprefix] || (langObject[fileprefix] = {})
        //   req(path) === import *
          switch (pathSplit[1]) {
            case 'country': {
                const countryKey = Object.keys(req(path).default)[0]
                //newCountry 对象只有一个属性 
                const newCountry = { [countryKey]: {} };
                req(path).default[countryKey].forEach(item=>{
                    newCountry[countryKey][item.alpha2] = item;
                })
                Object.assign(langObject[fileprefix], newCountry);
                break;
            }
            case 'dial': {
                console.log(1111);
                const dialKey = Object.keys(req(path).default)[0]
                const newdial = { [dialKey]: {} };
                req(path).default[dialKey].forEach(item=>{
                    newdial[dialKey][item.countryCode.toLowerCase()] = item;
                })
                Object.assign(langObject[fileprefix], newdial);
                break;
            }
            case 'lang': {
                Object.assign(langObject[fileprefix],req(path).default );
            }
          }
        }
    })
    return langObject
}

export default i18n;