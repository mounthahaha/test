import store from "@/store"
import { defineStore } from "pinia"
import { getSidebarStatus, setSidebarStatus } from "@/utils/cookies"
import { api_version ,appConfig} from "@/api/app"



interface IAppState {
  device: string
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  apiVersion:any
  config:any
}

export const useAppStore = defineStore({
  id: "app",
  state: (): IAppState => {
    return {
      device: 'Desktop',
      sidebar: {
        opened: getSidebarStatus() !== "closed",
        withoutAnimation: false
      },
      apiVersion:{},
      config:{}
    }
  },
  actions: {
    toggleSidebar(withoutAnimation: boolean) {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = withoutAnimation
      if (this.sidebar.opened) {
        setSidebarStatus("opened")
      } else {
        setSidebarStatus("closed")
      }
    },
    closeSidebar(withoutAnimation: boolean) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
      setSidebarStatus("closed")
    },
    async getApiVersion() {
      const res =  await api_version()
      this.apiVersion = res
    },
     getConfig() {
      return new Promise((resolve, reject) => {
        appConfig()
          .then((res: any) => {
            this.config = res
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }
  }
})

/** 在 setup 外使用 */
export function useAppStoreHook() {
  return useAppStore(store)
}

