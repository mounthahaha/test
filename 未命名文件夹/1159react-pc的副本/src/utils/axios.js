import axios from 'axios';
import { store } from '../store';
import { logout } from '@/store/modules/user';

const _baseURL = '/api/';
// 创建axios实例
let service = axios.create({
  baseURL: _baseURL, // api的base_url
  timeout: 30000, // 请求超时时间
});
// request拦截器
service.interceptors.request.use(
  (config) => {
    const state = store.getState();
    config.headers = {
      ...config.headers,
      // Referer: 'https://nnnre.gjty1.com',
      'x-lang': 'zh-CN',
      Authorization: 'token ' + state.user.token,      
    };
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

// respone拦截器
service.interceptors.response.use(
  (response) => {
    /**
     * code:200,接口正常返回;
     */
    // debugger
    // const res = response.data;
    // if (response.status !== 200 ) {
    //   // Message.error(res.message)
    //   // debugger
    //   // 根据服务端约定的状态码：5001:非法的token; 5002:其他客户端登录了; 5004:Token 过期了;
    //   if (res.code === 5001 || res.code === 5002 || res.code === 5004) {
    //     // Message.error('你已被登出，可以取消继续留在该页面，或者重新登录')
    //     //   MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
    //     //     confirmButtonText: '重新登录',
    //     //     cancelButtonText: '取消',
    //     //     type: 'warning'
    //     //   }).then(() => {
    //     //     store.dispatch('LogOut').then(() => {
    //     //       location.reload()// 为了重新实例化vue-router对象 避免bug
    //     //     })
    //     //   })
    //   }

    //   return Promise.reject(response);
    // } else {
    // res.code === 200,正常返回数据
    
    if (response.config.url === 'pc/spotlights') {
      return { status: response.status, data: response.data };
    }
    
    return { status: response.status, ...response.data };
    // }
  },
  (error) => {
    
    if (error && error.response) {
      let { status, data } = error.response;
      let _data = typeof data === 'string' ? {error: data} : data;     

      if (status === 401) {
        store.dispatch(logout());
        return (error = { status: status, isError: true, isOpen: false, ..._data });
      } else if (status === 400 || status === 403 || status === 404 || status === 500) {
        return (error = { status: status, isError: true, isOpen: false, ..._data });
      } else {
        return (error = { status: status, isError: true, isOpen: true, ..._data });
      }
    } else {
      return (error = { status: error.status, isError: true, isOpen: true, ...error.data });
    }
  },
);

export default service;

export function createRequest(target) {
  return new Proxy(target, {
    get: function (target, key, receiver) {
      function getService(key) {
        const _service = (requestOptions) => {
          const targetValue = Reflect.get(target, key, receiver);
          if (!targetValue) {
            throw new Error(`${key} is not defined!`);
          }
          if (typeof targetValue === 'function') {
            return targetValue;
          }
          const { urlParams = {}, ...restOptions } = requestOptions ? requestOptions : {};
          let { url, ...rest } = targetValue;

          if (typeof url === 'function') {
            url = url(urlParams);
          }
          return service({
            method: 'get',
            url,
            ...rest,
            ...restOptions,
          });
        };

        return _service;
      }

      return getService(key);
    },
  });
}
