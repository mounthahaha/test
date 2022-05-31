import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ElMessage } from "element-plus"
import { useUserStoreHook } from "@/store/modules/user"
import { useI18nStoreHook } from '@/store/modules/i18n'

// import qs from 'qs'

// axios.all(iterable)

/**
 * Global axios defaults
 *axios.defaults.baseURL = 'https://api.example.com';
 * 
 * Custom instance defaults
 * const instance = axios.create({
  baseURL: 'https://api.example.com'
});
 */



/** 创建请求实例 */
function createService() {
  const service = axios.create()
  //请求拦截
  service.interceptors.request.use(
    config => {
      if (useUserStoreHook().token) {
        config.headers.Authorization =`token ${useUserStoreHook().token}` 
        config.headers['x-lang']= useI18nStoreHook().locale
      }
      // const param = config.data
      // body参数转x-www-form格式
      // if (config.headers['Content-Type'] !== 'mutipart/form-data') {
      //   config.data = qs.stringify(param);
      // }
      return config
    },
    // 请求拦截失败
    (error) => Promise.reject(error)
  )
  // 响应拦截
  service.interceptors.response.use(
    (response) => {
      const apiData = response.data as any
      return apiData
      // const code = apiData.code
      // // 如果没有 code, 代表这不是项目后端开发的 api
      // if (code === undefined) {
      //   ElMessage.error("非本系统的接口")
      //   return Promise.reject(new Error("非本系统的接口"))
      // } else {
      //   switch (code) {
      //     case 200:
      //       return apiData
      //     case 20000:
      //       // code === 20000 代表没有错误
      //       return apiData
      //       // 不是正确的 code 抛出错误  // 如果进入这里apiData不会被返回
      //     case 106:
      //       useUserStoreHook().logout()
      //       ElMessage.error("登录过期,请重新登录")
      //       return Promise.reject(apiData.message || "Error")
      //     default:
      //       ElMessage.error(apiData.message || "Error")
      //       return Promise.reject(apiData.message || "Error")
      //   }
      // }
    },
    (error) => {
      // status 是 HTTP 状态码
      const errorMessage =  error.response.data.error
      const status = error.response.status
      switch (status) {
        case 400:
          error.message = "请求错误"
          break
        case 401:
          error.message = "未授权，请登录"
          break
        case 403:
          // token 过期时，直接退出登录并强制刷新页面（会重定向到登录页）
          useUserStoreHook().logout()
          break
        case 404:
          error.message = "请求地址出错"
          break
        case 408:
          error.message = "请求超时"
          break
        case 500:
          error.message = "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP版本不受支持"
          break
        default:
          break
      }
      // //超时后重新发起请求
      // const { message, config } = error
      // if (message.indexOf('timeout') !== -1 && config && config.retry) {
      //   error.message  = '请求超时'
      //   config.__retryCount = config.__retryCount || 0;
      //   if (config.__retryCount < config.retry) {
      //     config.__retryCount += 1;
      //     //设置计时器重新发起请求
      //     const backoff = new Promise(function (resolve) {
      //       setTimeout(function () {
      //         resolve('');
      //       }, config.retryDelay || 1);
      //     })
      //     return backoff.then(() => {
      //       return service(config)
      //     })
      //   }
      // }
      ElMessage.error(errorMessage || error.message)
      return Promise.reject(error)
    }
  )
  return service
}

/** 配置实例 */
function createRequestFunction(service: AxiosInstance) {
  //返回一个函数给api请求用,接收一个RequestConfig参数,这个函数会调用axios实例,并返回请求结果
  return function (config: AxiosRequestConfig) {
    const configDefault = {
      timeout: 10000,
      retry: 1,
      retryDelay: 1000,
      withCredentials: false,
      baseURL: process.env.VUE_APP_BASE_API,
      data: {}
    }
    return service(Object.assign(configDefault, config))
  }
}

export const service = createService()
export const request = createRequestFunction(service)




