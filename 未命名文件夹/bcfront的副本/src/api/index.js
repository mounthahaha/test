import axios from 'axios';
import store from '../store';
import defaults from './config';
Object.assign(axios.defaults, defaults);

axios.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response.status == '403') {
      error.response.data.error = '你没有权限进行此操作';
    } else if (error.response.status == '500') {
      error.response.data.error = '服务器请求异常，请刷新再试';
    } else if (error.response.status == '401') {
      store.commit('LOGOUT');
      error.response.data.error = error.response.data.error ?? '会话已失效，请重新登录';
    } else if (error.response.status == '400') {
      if (typeof error.response.data != 'object') {
        error.response.data = {
          error: error.response.data,
        };
      }
    }
    return Promise.reject(error.response);
  },
);

export default {
  host: defaults.baseURL,
  get(url, params = {}) {
    return axios({
      method: 'get',
      url,
      params,
      headers: {
        Authorization: `token ${store.getters.token}`,
        'x-lang': store.getters['i18n/locale'],
        Accept: 'application/json; charset=UTF-8',
      },
    })
      .catch(err => {
        err.data.status = err.status;
        return Promise.reject(err.data);
      })
      .then(res => {
        if (res && res.status == 200) {
          return res.data;
        }
      });
  },
  post(url, data = {}) {
    // 可以设置默认值
    return axios({
      method: 'post',
      url,
      data,
      headers: {
        Authorization: `token ${store.getters.token}`,
        'x-lang': store.getters['i18n/locale'],
        Accept: 'application/json; charset=UTF-8',
        'Content-Type': 'application/json; charset=UTF-8',
      },
    })
      .then(res => {
        if (res.status == 200 || res.status == 201) {
          return res.data;
        }
      })
      .catch(err => {
        err.data.status = err.status;
        return Promise.reject(err.data);
      });
  },
  postFile(url, data = {}) {
    // 可以设置默认值
    return axios({
      method: 'post',
      url,
      data,
      headers: {
        Authorization: `token ${store.getters.token}`,
        'x-lang': store.getters['i18n/locale'],
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(res => {
        if (res.status == 200 || res.status == 201) {
          return res.data;
        }
      })
      .catch(err => {
        err.data.status = err.status;
        return Promise.reject(err.data);
      });
  },
  put(url, data) {
    return axios({
      method: 'put',
      url,
      data,
      headers: {
        Authorization: `token ${store.getters.token}`,
        'x-lang': store.getters['i18n/locale'],
        'content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
      .then(res => {
        if (res.status == 200 || res.status == 201) {
          return res.data;
        }
      })
      .catch(err => {
        err.data.status = err.status;
        return Promise.reject(err.data);
      });
  },
  patch(url, data) {
    return axios({
      method: 'patch',
      url,
      data,
      headers: {
        Authorization: `token ${store.getters.token}`,
        'x-lang': store.getters['i18n/locale'],
        'content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
      .then(res => {
        if (res.status == 200 || res.status == 201) {
          return res.data;
        }
      })
      .catch(err => {
        err.data.status = err.status;
        return Promise.reject(err.data);
      });
  },
  delete(url, data) {
    return axios({
      method: 'delete',
      url,
      data: JSON.stringify(data),
      headers: {
        Authorization: `token ${store.getters.token}`,
        'x-lang': store.getters['i18n/locale'],
        'content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
      .then(res => {
        if (res.status == 200) {
          return res.data;
        }
      })
      .catch(err => {
        err.data.status = err.status;
        return Promise.reject(err.data);
      });
  },
};
