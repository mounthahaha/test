import api from '@/api';

const state = {
  user: { name: '游客' },
  modalBox: '',
  token: null,
  snackbar: { show: false, color: '', text: '' },
  dialog: { show: false, text: '', okFn: false, cancelFn: false },
  soundSwitch: {
    withdrawal: {
      storage: 'mp3WithdrawOnOff',
      value: JSON.parse(localStorage.getItem('mp3WithdrawOnOff') || false),
    },
    deposit: {
      storage: 'mp3DepositOnOff',
      value: JSON.parse(localStorage.getItem('mp3DepositOnOff') || false),
    },
    alert: {
      storage: 'mp3AlertOnOff',
      value: JSON.parse(localStorage.getItem('mp3AlertOnOff') || false),
    },
  },
  playerId: 0,
  playerDetailActiveIndex: 0,
  affiliateId: 0,
};

const actions = {
  CheckUserLogin: ({ dispatch, commit }) => {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const token = window.sessionStorage.getItem('token');
    if (user != null && token != null) {
      user.token = token;
      commit('onUserLogin', user);
    }
  },
  ShowGlobal({ commit }, b) {
    commit('modalBox', b);
  },
};
const mutations = {
  LOGOUT(state) {
    state.token = '';
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  },
  onUserLogin(state, user) {
    const token = user.token;
    state.token = token;
    sessionStorage.setItem('token', token);
    state.user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
  },
  ShowGlobal(state, b) {
    state.modalBox = b;
  },
  MsgOk(state, b) {
    state.snackbar = { show: true, color: 'success', text: b };
  },
  MsgError(state, b) {
    state.snackbar = { show: true, color: 'error', text: b };
  },
  Confirm(state, confirm) {
    state.dialog = { show: true, text: confirm.text, okTxt: confirm.okTxt, okFn: confirm.ok, cancelFn: confirm.cancel };
  },
  setSoundSwitch(state, { sound = 'alert', val = false }) {
    const storage = state.soundSwitch[sound].storage;
    localStorage.setItem(storage, val);
    state.soundSwitch[sound].value = val;
  },
  PLAYER(state, b) {
    state.playerId = b;
  },
  PLAYERDETAILACTIVE(state, index) {
    state.playerDetailActiveIndex = index;
  },
  AFFILIATE(state, b) {
    state.affiliateId = b;
  },
};

const getters = {
  user(state) {
    return state.user;
  },
  token(state) {
    return state.token;
  },
  modalBox(state) {
    return state.modalBox;
  },
  snackbar(state) {
    return state.snackbar;
  },
  dialog(state) {
    return state.dialog;
  },
  soundSwitch: state => state.soundSwitch,
  playerDetailActiveIndex: state => state.playerDetailActiveIndex,
  playerId(state) {
    return state.playerId;
  },
  affiliateId(state) {
    return state.affiliateId;
  },
  storeItemSubscribers: state => state.storeItemSubscribers,
};

export default {
  actions,
  state,
  mutations,
  getters,
};
