import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Layout from '../layout/index.vue'

/**
 * 如果只有一个chiliren,会将唯一子路由提升到sidebar一级展示,父路由不用写meta
 * 如果有多个children必须在一级路由写图标二级路由不再展示图标
 * hidden:true 不展示路由
 * redirect === 'noRedirect' 面包屑展示但不能点击 
 *  * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */


/** 常驻路由 */
export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: "/redirect",
    component: Layout,
    meta: {
      hidden: true
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      hidden: true
    }
  },
  // 首页
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          icon: "dashboard",
          affix: true
        }
      }
    ]
  },
  //users
  {
    path: "/users",
    component: Layout,
    redirect: "/users/index",
    meta: {
      title: "用户管理",
      icon: "404",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/users/index.vue"),
        name: "User",
        meta: {
          title: "用户列表",
        }
      },
      {
        path: "vip",
        component: () => import("@/views/users/vip.vue"),
        name: "Vip",
        meta: {
          title: "会员列表"
        }
      },
      {
        path: "sms",
        component: () => import("@/views/users/smsRecords.vue"),
        name: "Sms",
        meta: {
          title: "短信记录"
        }
      }
    ]
  },
  //commodity
  {
    path: "/",
    component: Layout,
    redirect: "/commodity",
    children: [
      {
        path: "commodity",
        component: () => import("@/views/commodity/index.vue"),
        name: "Commodity",
        meta: {
          title: "商品中心",
          icon: "dashboard",
        }
      }
    ]
  },
  //支付中心
  {
    path: "/paycenter",
    component: Layout,
    meta: {
      title: "支付中心",
      icon: "404",
    },
    children: [
      {
        path: "platform",
        component: () => import("@/views/pay-center/platform.vue"),
        name: "PlatformOrders",
        meta: {
          title: "平台订单",
        }
      },
      {
        path: "game",
        component: () => import("@/views/pay-center/game.vue"),
        name: "GameOrders",
        meta: {
          title: "游戏订单",
        }
      },
      {
        path: "thirdparty",
        component: () => import("@/views/pay-center/thirdparty.vue"),
        name: "Thirdparty",
        meta: {
          title: "第三方订单",
        }
      },
      {
        path: "paymethods",
        component: () => import("@/views/pay-center/payMethods.vue"),
        name: "payMethods",
        meta: {
          title: "支付方式",
        }
      },
      {
        path: "payconfig",
        component: () => import("@/views/pay-center/payConfig.vue"),
        name: "payConfig",
        meta: {
          title: "支付配置",
        }
      },
    ]
  },
  //余额中心
  {
    path: "/balance",
    component: Layout,
    meta: {
      title: "余额中心",
      icon: "404",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/balance-center/index.vue"),
        name: "balance",
        meta: {
          title: "余额订单",
        }
      },
      {
        path: "diamond",
        component: () => import("@/views/balance-center/diamond.vue"),
        name: "diamond",
        meta: {
          title: "钻石订单",
        }
      },
      {
        path: "gold",
        component: () => import("@/views/balance-center/gold.vue"),
        name: "gold",
        meta: {
          title: "金币订单",
        }
      },
    ]
  },
  //提现中心
  {
    path: "/withdraw",
    component: Layout,
    meta: {
      title: "提现中心",
      icon: "404",
    },
    children: [
      {
        path: "index",
        component: () => import("@/views/withdraw-center/index.vue"),
        name: "Withdraw",
        meta: {
          title: "订单列表",

        }
      },
      {
        path: "card",
        component: () => import("@/views/withdraw-center/cardNumber.vue"),
        name: "CardNumber",
        meta: {
          title: "提现卡号",
        }
      }
    ],

  },
  // {
  //   path: "/:pathMatch(.*)*", // 必须将 'ErrorPage' 路由放在最后, Must put the 'ErrorPage' route at the end
  //   component: Layout,
  //   redirect: "/404",
  //   name: "ErrorPage",
  //   meta: {
  //     title: "错误页面",
  //     icon: "404",
  //     redirect: 'noRedirect',
  //     hidden: true
  //   },
  //   children: [
  //     {
  //       path: "401",
  //       component: () => import("@/views/error-page/401.vue"),
  //       name: "401",
  //       meta: {
  //         title: "401"
  //       }
  //     },
  //     {
  //       path: "404",
  //       component: () => import("@/views/error-page/404.vue"),
  //       name: "404",
  //       meta: {
  //         title: "404"
  //       }
  //     }
  //   ]
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

export default router
