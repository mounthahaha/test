import app from '@/main';

const i18nCookieKey = 'i18n_cookie_key';

const state = {
  locale: localStorage.getItem(i18nCookieKey) ? localStorage.getItem(i18nCookieKey) : 'zh-CN',
  langItem: [
    {
      key: 'zh-CN',
      value: '简体中文',
      flag: 'cn',
      langCode: 'zh-CN',
    },
    {
      key: 'en',
      value: 'English',
      flag: 'us',
      langCode: 'en',
    },
    {
      key: 'zh-TW',
      value: '繁體中文',
      flag: 'hk',
      langCode: 'zh-TW',
    },
  ],
};

const mutations = {
  SET_LOCALE(state, payload) {
    state.locale = payload;
    app.$i18n.locale = payload;
    localStorage.setItem(i18nCookieKey, payload);
    // moment.locale(payload);
  },
};

const getters = {
  locale: state => state.locale,
  langItem: state => state.langItem,
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
};
