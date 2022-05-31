import api from '@/api';
import { GET_GLOBAL_CONFIGURE, GET_VERSION, GET_PLAYER_VIP_LIST, GET_GAMEPLATFORMS, GET_GAMEMENUS } from '@/api/Uri';

const state = {
  title: '後臺管理系統',
  config: Object,
  vip: [],
  isComma: false,
  tinymceKey: 'm7h4tk0c546wa3a1jvncs1f7lu6ii7elgxqdklnc6g6x9mna',
  notifications: {},
  version: '',
  webSocketStatus: false,
  gamePlatformList: [],
  gameMenuList: [],
  packageVersion: null,
};
const actions = {
  title: ({ commit }, b) => {
    commit('title', b);
  },
  async CONFIGURE({ commit, state }) {
    if (state.config == Object) {
      const config = await api.get(GET_GLOBAL_CONFIGURE);
      commit('setConfig', config);
    }
  },
  async VIP_CONFIG({ commit, state }) {
    await api
      .get(GET_PLAYER_VIP_LIST)
      .then(data => {
        commit('setVip', data.result);
      })
      .catch(error => {
        commit('MsgError', `VIP_CONFIG ERROR:${error.error}`);
      });
  },
  isComma: ({ commit }, b) => {
    commit('isComma', b);
  },
  async GET_VERSION({ commit, state }) {
    if (state.vip.length === 0) {
      await api
        .get(GET_VERSION)
        .then(data => {
          commit('setVersion', data.version);
        })
        .catch(error => {
          commit('MsgError', `VERSION GET ERROR:${error.error}`);
        });
    }
  },
  async GET_PACKAGE_VERSION({ state, commit }) {
    await api
      .get('../version.json')
      .then(data => {
        state.packageVersion = data;
      })
      .catch(err => {
        if (err.status === 404) {
          console.log('version.json not found.');
        }
      });
  },
  /**
   * 獲得遊戲組別
   */
  async GET_GAMEPLATFORM({ commit }) {
    await api
      .get(GET_GAMEPLATFORMS)
      .then(data => commit('setGamePlatform', data.result))
      .catch(error => commit('MsgError', error));
  },
  /**
   * 獲得遊戲組別
   */
  async GET_GAMEMENU({ commit }) {
    await api
      .get(GET_GAMEMENUS)
      .then(data => commit('setGameMenu', data.gamemenus))
      .catch(error => commit('MsgError', error));
  },
};

const mutations = {
  setTitle(state, title) {
    state.title = title;
  },
  setConfig(state, b) {
    state.config = b;
  },
  setVip(state, b) {
    state.vip = b;
  },
  setIsComma(state, b) {
    localStorage.setItem('isComma', b);
    state.isComma = b;
  },
  setSystemNotifications(state, paylod) {
    state.notifications = paylod;
  },
  setVersion(state, paylod) {
    state.version = paylod;
  },
  setWebSocketStatus(state, paylod) {
    state.webSocketStatus = paylod;
  },
  setGamePlatform(state, action) {
    state.gamePlatformList = action;
  },
  setGameMenu(state, action) {
    state.gameMenuList = action;
  },
};

const getters = {
  title(state) {
    return state.title;
  },
  config(state) {
    return state.config;
  },
  version(state) {
    return state.version;
  },
  vip(state) {
    return state.config;
  },
  isComma(state) {
    if (localStorage.getItem('isComma') != null) {
      state.isComma = JSON.parse(localStorage.getItem('isComma'));
    } else {
      state.isComma = false;
    }
    return state.isComma;
  },
  tinymceKey(state) {
    return state.tinymceKey;
  },
  notifications(state) {
    return state.notifications;
  },
  webSocketStatus: state => state.webSocketStatus,
  gamePlatformList: state => state.gamePlatformList,
  gameMenuList: state => state.gameMenuList,
  packageVersion: state => state.packageVersion,
};

export default {
  actions,
  state,
  mutations,
  getters,
};
