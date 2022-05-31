import store from "@/store"
import { defineStore } from "pinia"
// import { usePermissionStore } from "./permission"
import { getToken, removeToken, setToken} from "@/utils/cookies"
import { userLogin, userInfoRequest,userlogout } from "@/api/admin"
import { RouteRecordRaw,  } from "vue-router"
interface IUserState {
  token: string
  roles: string[]
  name:string
}

export const useUserStore = defineStore({
  id: "user",
  state: (): IUserState => {
    return {
      token: getToken() || "",
      roles: [],
      name: '',
    }
  },
  actions: {
    /** 设置角色数组 */
    setRoles(roles: string[]) {
      this.roles = roles
    },
    /** 登录 */
    login(userInfo: { username: string; password: string }) {
      return new Promise((resolve, reject) => {
        userLogin({
          Name: userInfo.username.trim(),
          Passwd: userInfo.password,
          Code:''
        })
          .then((res: any) => {
            setToken(res.result.token)
            this.token = res.result.token
            this.name = res.result.name
            resolve(true)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    /** 获取用户详情 */
    getInfo() {
      return new Promise((resolve, reject) => {
        userInfoRequest()
          .then((res: any) => {
            console.log('获取用户信息',res);
            this.roles = res.data.roles
            this.name = res.data.name
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    /** 切换角色 */
    async changeRoles(role: string) {
      const token = role + "-token"
      this.token = token
      setToken(token)
      await this.getInfo()
      // const permissionStore = usePermissionStore()
      // permissionStore.setRoutes(this.roles)
      // permissionStore.dynamicRoutes.forEach((item: RouteRecordRaw) => {
      //   router.addRoute(item)
      // })
    },
    /** 登出 */
     logout() {
      return new Promise((resolve,reject)=>{
        userlogout().then(()=>{
          this.resetToken()
          resolve(true)
        },()=>{
          this.resetToken()
          reject(false)
        })
      }) 
    },
    /** 重置 token */
    resetToken() {
      removeToken()
      this.token = ""
      this.roles = []
      this.name = ""
    }
  }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}

