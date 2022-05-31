import store from '../store/index.js';

let socket = null;
export default {
  initWebSocket() {
    const token = store.getters.token;
    if (token == '' || token == null || token == 'null') {
      return;
    }
    const isDev = process.env.NODE_ENV === 'development';
    const path = isDev ? 'admin-asia-dev.prdws.com' : window.location.host;
    const wsuri = `wss://${path}/admin/ws?token=${token}`;
    socket = new WebSocket(wsuri);
    socket.onopen = this.websocketonopen;
    socket.onerror = this.websocketonerror;
    socket.onmessage = this.websocketonmessage;
    socket.onclose = this.websocketclose;
  },
  websocketonopen() {
    console.log('WebSocket連線成功');
    store.commit('setWebSocketStatus', true);
  },
  websocketonerror(e) {
    console.log('WebSocket連線發生錯誤', e);
    // store.commit('LOGOUT');
    store.commit('setWebSocketStatus', false);
    store.commit('MsgError', 'WebSocket 失效請重新登入');
  },
  websocketonmessage(e) {
    const data = JSON.parse(e.data);
    try {
      const syncData = JSON.parse(data.message);
      store.commit('setSystemNotifications', syncData);
    } catch (e) {
      console.log(e);
    }
    // switch (data.message_type) {
    //   case 'station_letter_unread_count':
    //     console.log('data.message', data.message);
    //     store.commit('SET_MAIL_NUMBERMBER', data.message);
    //     break;
    //   default:
    //     break;
    // }
  },
  websocketsend(agentData) {
    console.log('send data');
  },
  websocketclose(e) {
    console.log('connection closed');
  },
  close() {
    if (socket) {
      socket.close();
    }
  },
};
