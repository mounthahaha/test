import router from "@/router"
import { RouteLocationNormalized } from "vue-router"
import { useUserStoreHook } from "@/store/modules/user"
import { useAppStoreHook } from "@/store/modules/app"
import { whiteList } from "@/config/white-list"
import NProgress from "nprogress"
import "nprogress/nprogress.css"


const userStore = useUserStoreHook()
const appStore = useAppStoreHook()
NProgress.configure({ showSpinner: false })

router.beforeEach(async(to: RouteLocationNormalized, _: RouteLocationNormalized, next: any) => {
  NProgress.start()
  if (userStore.token) {
    if (to.path === "/login") {
      // 如果登录，并准备进入 login 页面，则重定向到主页
      next({ path: "/" })
    } else if (! Object.keys(appStore.config).length) {
       try {
        await appStore.getConfig()
        next()
       } catch (error) {
        next({ path: "/login"})
        userStore.resetToken()
       }
    } else {
      next()
    }
  } else {
    // 如果没有 token
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果在免登录的白名单中，则直接进入
      next()
    } else {
      // 其他没有访问权限的页面将被重定向到登录页面
      next("/login")
    }
  }
})

router.afterEach((to:any) => {
  NProgress.done()
  if(to.path == '/login') return
  document.title = to.meta.title + '-' + appStore.config.title 
})
