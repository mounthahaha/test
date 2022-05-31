import Vue from 'vue';
import VueI18n from 'vue-i18n';
import store from '@/store';
import _ from 'lodash';
import en from './country/en';

/** vuetify 語系包 */
// const vuetifyLangMapping = {
//   en: { $vuetify: require('vuetify/src/locale/en.ts').default },
//   'zh-CN': { $vuetify: require('vuetify/src/locale/zh-Hant.ts').default },
// };

Vue.use(VueI18n);
const lang = parserLangFile();

const locale = store.getters['i18n/locale'];

// console.log(lang.en.globalCountryList.us);
const i18n = new VueI18n({
  locale,
  fallbackLocale: 'zh-CN',
  messages: { ...lang },
});
// Object.keys(lang).forEach(l => {
//   Object.keys(lang[l]).forEach(key => {
//     lang[l][key] = typeof lang[l][key] == 'string' ? lang[l][key].replace(/usdt/gi, '数字币') : lang[l][key];
//   });
// });

/** 自定義語系包
 * 爬語言檔案並分析組合對應key value
 * */
function parserLangFile() {
  // // 擷取資料夾 Module模塊 自己看 https://ppt.cc/fLZ5Hx
  const req = require.context('./', true, /.js$/);
  const langObject = {};
  req.keys().forEach(path => {
    const pathSplit = path.split('/');
    if (['lang', 'country'].includes(pathSplit[1])) {
      // 宣告語系物件
      !_.isEmpty(langObject[_.head(_.last(pathSplit).split('.'))]) || (langObject[_.head(_.last(pathSplit).split('.'))] = {});
      // _.isEmpty(langObject[_.head(_.last(pathSplit).split('.'))])?(langObject[_.head(_.last(pathSplit).split('.'))] = {}):'';
      // 根據類型重組 dictionary
      switch (pathSplit[1]) {
        case 'country': {
          const countryKey = _.head(_.keys(req(path).default));
          const newCountry = { [countryKey]: {} };
          _.forEach(req(path).default[countryKey], v => {
            newCountry[countryKey][v.alpha2] = v;
          });
          Object.assign(langObject[_.head(_.last(pathSplit).split('.'))], newCountry);
          break;
        }
        case 'dial': {
          const dialKey = _.head(_.keys(req(path).default));
          const newDial = { [dialKey]: {} };
          _.forEach(req(path).default[dialKey], v => {
            newDial[dialKey][v.countryCode.toLowerCase()] = v;
          });
          Object.assign(langObject[_.head(_.last(pathSplit).split('.'))], newDial);
          break;
        }
        case 'lang':
        default:
          Object.assign(langObject[_.head(_.last(pathSplit).split('.'))], req(path).default);
          break;
      }
    }
  });
  // // 將國家名 塞入號碼物件

  return langObject;
}

export default i18n;
