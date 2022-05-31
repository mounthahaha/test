import Home from '@/pages/home';
import Login from '@/pages/login';
import Register from '@/pages/register';

import Promotion from '@/pages/promotion';
import PromotionDetail from '@/pages/promotion/promotionDetail';
import Appdownload from '@/pages/appdownload';

export const routes = [{
        path: '/login',
        name: '登录',
        showMenu: false, //菜单是否展示
        component: < Login />
    },{
        path: '/register',
        name: '注册',
        showMenu: false, //菜单是否展示
        component: < Register />
    },
    {
        path: '/reg/:code',
        name: '注册',
        showMenu: false, //菜单是否展示
        component: < Register />
    },
    {
        path: '/home',
        name: '首页',
        component: < Home />
    },
    {
        path: '/promotion',
        name: '优惠',
        component: < Promotion />
    },
    {
        path: '/promotionDetail',
        name: '优惠详情',
        component: < PromotionDetail />
    },
    {
        path: '/appdownload',
        name: 'App下载',
        component: < Appdownload />
    }
]