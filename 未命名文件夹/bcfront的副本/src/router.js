import Vue from 'vue';
import Router from 'vue-router';

import store from './store';
Vue.use(Router);

const router = new Router({
  base: '/',
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('@/views/Index'),
      hidden: true,
    },
    // 當日概要
    {
      path: '/summary',
      name: 'summary',
      component: () => import('@/views/summary/Summary'),
      children: [
        {
          path: 'daily',
          name: 'summaryDaily',
          component: () => import('@/views/summary/Daily'),
          meta: { title: '数据总览', icon: 'trending_up', model: false },
        },
      ],
    },
    // 系統管理
    {
      path: '/system',
      name: 'system',
      component: () => import('./views/system/System'),
      meta: { title: '系统管理', icon: 'settings', model: false },
      children: [
        {
          path: 'payapi',
          name: 'systemPayAPI',
          component: () => import('./views/system/PayAPI'),
          meta: { title: '支付API', model: false },
        },
        {
          path: 'payment',
          name: 'systemPayment',
          component: () => import('./views/system/Payment'),
          meta: { title: '支付设置', model: false },
        },
        {
          path: 'configure',
          name: 'systemConfigure',
          component: () => import('./views/system/Configure'),
          meta: { title: '相关配置', model: false },
        },
        {
          path: 'domain',
          name: 'systemDomain',
          component: () => import('./views/system/Domain'),
          meta: { title: '域名管理', model: false },
        },
        {
          path: 'authorization',
          name: 'systemAuth',
          component: () => import('./views/system/Authorization'),
          meta: { title: '权限配置', model: false },
        },
        // {
        //   path: 'blacklist',
        //   name: 'systemBlacklist',
        //   component: () => import('./views/system/Blacklist'),
        //   meta: { title: '访问黑名单', model: false },
        // },
        {
          path: 'restrictions',
          name: 'systemRestrictions',
          component: () => import('./views/system/Restrictions'),
          meta: { title: 'IP限制管理', model: false },
        },
        // {
        //   path: 'cashback',
        //   name: 'systemCashback',
        //   component: Cashback,
        //   meta: { title: '返水管理', model: false },
        // },
        {
          path: 'RiskSetting',
          name: 'systemRiskSetting',
          component: () => import('./views/system/RiskSetting'),
          meta: { title: '风控设置', model: false },
        },
        {
          path: 'TurnoverSetting',
          name: 'systemTurnoverSetting',
          component: () => import('./views/system/TurnoverSetting'),
          hidden: true,
          meta: { title: '体育有效流水设置', model: false },
        },
        {
          path: 'Rebate',
          name: 'systemRebateSetting',
          component: () => import('./views/system/RebateSetting'),
          hidden: false,
          meta: { title: '返水自动配置', model: false },
        },
        {
          path: 'versionRecords',
          name: 'reportVersionRecords',
          component: () => import('./views/report/VersionRecords'),
          meta: { title: '版本记录表', model: false },
          hidden: false,
        },
      ],
    },
    // 玩家管理
    {
      path: '/player',
      name: 'player',
      component: () => import('./views/player/Player'),
      meta: { title: '玩家管理', icon: 'mood', model: false },
      children: [
        {
          path: 'list',
          name: 'playerList',
          component: () => import('./views/player/List'),
          meta: { title: '玩家列表', model: false },
        },
        {
          path: 'list/:ip',
          name: 'playerListByIP',
          component: () => import('./views/player/List'),
          meta: { title: '玩家列表', model: false },
          hidden: true,
        },
        {
          path: 'online',
          name: 'playerOnline',
          component: () => import('./views/player/Online'),
          meta: { title: '在线玩家', model: false },
        },
        {
          path: 'walletmissing',
          name: 'playerWalletMissing',
          component: () => import('./views/player/WalletMissing'),
          meta: { title: '异常转账', model: false },
        },
        {
          path: 'tags',
          name: 'playerTags',
          component: () => import('./views/player/Tags'),
          meta: { title: '标签管理', model: false },
        },
        {
          path: 'balance',
          name: 'playerBalance',
          component: () => import('./views/player/Balance'),
          meta: { title: '余额调整记录', model: false },
        },
        {
          path: 'rebate',
          name: 'playerRebate',
          component: () => import('./views/player/Rebate'),
          meta: { title: '返水每日派发', model: false },
        },
        {
          path: 'viplevel',
          name: 'playerVIPLevel',
          component: () => import('./views/player/VIPLevel'),
          meta: { title: 'VIP等级配置', model: false },
        },
        {
          path: 'bankcardsearch',
          name: 'playerBankCardSearch',
          component: () => import('./views/player/BankCardSearch'),
          meta: { title: '银行卡查询', model: false },
        },
      ],
    },
    // 財務管理
    {
      path: '/finance',
      name: 'finance',
      component: () => import('./views/finance/Finance'),
      meta: { title: '财务管理', icon: 'payment', model: false },
      children: [
        {
          path: 'deposit',
          name: 'financeDeposit',
          component: () => import('./views/finance/Deposit'),
          meta: { title: '入金列表', model: false },
        },
        {
          path: 'withdrawal',
          name: 'financeWithdrawal',
          component: () => import('./views/finance/Withdrawal'),
          meta: { title: '出金列表', model: false },
        },
        {
          path: 'transfer',
          name: 'financeTransfer',
          component: () => import('./views/finance/Transfer'),
          meta: { title: '转帐记录', model: false },
        },
        {
          path: 'transferList',
          name: 'financeTransferList',
          component: () => import('./views/finance/TransferList'),
          meta: { title: '转帐列表', model: false },
        },
        {
          path: 'bank',
          name: 'financeBank',
          component: () => import('./views/finance/Bank'),
          meta: { title: '银行信息', model: false },
        },
      ],
    },
    // 內容管理
    {
      path: '/cms',
      name: 'cms',
      component: () => import('./views/cms/Cms'),
      meta: { title: '内容管理', icon: 'menu_book', model: false },
      children: [
        {
          path: 'imageUpload',
          name: 'cmsImageUpload',
          component: () => import('./views/cms/ImageUpload'),
          meta: { title: '图片上传', model: false },
        },
        {
          path: 'loginType',
          name: 'cmsLoginType',
          component: () => import('./views/cms/LoginType'),
          meta: { title: '登入页面管理', model: false },
        },
        {
          path: 'article',
          name: 'cmsArticle',
          component: () => import('./views/cms/Article'),
          meta: { title: ' 展示文章', model: false },
        },
        {
          path: 'spotlight',
          name: 'cmsSpotlight',
          component: () => import('./views/cms/Spotlight'),
          meta: { title: '轮播图', model: false },
        },
        {
          path: 'menu',
          name: 'cmsMenu',
          component: () => import('./views/cms/Menu'),
          meta: { title: '导航栏管理', model: false },
        },
        {
          path: 'announcement',
          name: 'cmsAnnouncement',
          component: () => import('./views/cms/Announcement'),
          meta: { title: '公告管理', model: false },
        },
        {
          path: 'mailservice',
          name: 'cmsMailService',
          component: () => import('./views/cms/MailService'),
          meta: { title: '站内信管理', model: false },
        },
        {
          path: 'promotions',
          name: 'cmsPromotions',
          component: () => import('./views/cms/Promotions'),
          meta: { title: '活动管理', model: false },
        },
        {
          path: 'help',
          name: 'cmsHelp',
          component: () => import('./views/cms/Help'),
          meta: { title: '帮助中心', model: false },
        },
        {
          path: 'usdthelper',
          name: 'cmsUsdtHelper',
          component: () => import('./views/cms/UsdtHelper'),
          meta: { title: 'USDT 说明', model: false },
        },
      ],
    },
    // 遊戲管理
    {
      path: '/games',
      name: 'games',
      component: () => import('./views/games/Games'),
      meta: { title: '游戏管理', icon: 'sports_soccer', model: false },
      children: [
        {
          path: 'api',
          name: 'gamesAPI',
          component: () => import('./views/games/API'),
          meta: { title: 'API管理', model: false },
        },
        {
          path: 'config',
          name: 'gamesConfig',
          component: () => import('./views/games/Config'),
          meta: { title: '前台游戏配置', model: false },
        },
        {
          path: 'type',
          name: 'gamesType',
          component: () => import('./views/games/Type'),
          meta: { title: '游戏类型', model: false },
        },
        {
          path: 'platform',
          name: 'gamesPlatform',
          component: () => import('./views/games/Platform'),
          meta: { title: '游戏平台', model: false },
        },
        {
          path: 'setting',
          name: 'gamesSetting',
          component: () => import('./views/games/Setting'),
          meta: { title: '游戏管理', model: false },
        },
        {
          path: 'detail',
          name: 'gamesDetail',
          component: () => import('./views/games/Detail'),
          meta: { title: '游戏推荐管理', model: false },
        },
      ],
    },
    // 相關報表
    {
      path: '/report',
      name: 'report',
      component: () => import('./views/report/Report'),
      meta: { title: '相关报表', icon: 'assessment', model: false },
      children: [
        {
          path: 'player',
          name: 'reportPlayer',
          component: () => import('./views/report/Player'),
          meta: { title: '玩家报表', model: false },
        },
        {
          path: 'gamelogs',
          name: 'reportGameLogs',
          component: () => import('./views/report/GameLogs'),
          meta: { title: '游戏记录', model: false },
        },
        // {
        //   path: 'RealtimeGameLogs',
        //   name: 'reportRealtimeGameLogs',
        //   component: () => import('./views/report/RealtimeGameLogs'),
        //   meta: { title: '即时游戏纪录', model: false },
        //   hidden: false,
        // },
        {
          path: 'gameLogs/:username/:date',
          name: 'reportGameLogs2',
          component: () => import('./views/report/GameLogs'),
          meta: { title: '游戏记录', model: false },
          hidden: true,
        },
        {
          path: 'platformtotal',
          name: 'reportPlatformTotal',
          component: () => import('./views/report/PlatformTotal'),
          meta: { title: '数据汇总', model: false },
        },
        {
          path: 'game',
          name: 'reportGame',
          component: () => import('./views/report/Game'),
          meta: { title: '游戏报表', model: false },
        },
        {
          path: 'pay',
          name: 'reportPay',
          component: () => import('./views/report/Pay'),
          meta: { title: '支付报表', model: false },
        },
        {
          path: 'fada',
          name: 'reportFada',
          component: () => import('./views/report/Fada'),
          meta: { title: '经营数据', model: false },
        },
        {
          path: 'balance',
          name: 'reportBalance',
          component: () => import('./views/report/Balance'),
          meta: { title: '玩家余额', model: false },
        },
        {
          path: 'playerbehavior',
          name: 'reportPlayerBehavior',
          component: () => import('./views/report/PlayerBehavior'),
          meta: { title: '行为调查', model: false },
          hidden: true,
        },
        {
          path: 'exportRecords',
          name: 'reportExportRecords',
          component: () => import('./views/report/ExportRecords'),
          meta: { title: '汇出纪录', model: false },
          hidden: false,
        },
        {
          path: 'rebateRecords',
          name: 'rebateRecords',
          component: () => import('./views/report/rebateRecords'),
          meta: { title: '返水报表', model: false },
          hidden: false,
        },
        {
          path: 'vipSetRecords',
          name: 'vipSetRecords',
          component: () => import('./views/report/VipSetRecords'),
          meta: { title: 'VIP升降级记录表', model: false },
          hidden: false,
        },
      ],
    },
    // 代理管理
    {
      path: '/affiliate',
      name: 'affiliate',
      component: () => import('./views/affiliate/Affiliate'),
      meta: { title: '代理管理', icon: 'group', model: false },
      children: [
        {
          path: 'list',
          name: 'affiliateList',
          component: () => import('./views/affiliate/List'),
          meta: { title: '代理列表', model: false },
        },
        {
          path: 'withdrawal',
          name: 'affiliateWithdrawal',
          component: () => import('./views/affiliate/Withdrawal'),
          meta: { title: '出金列表', model: false },
        },
        {
          path: 'daily',
          name: 'affiliateDaily',
          component: () => import('./views/affiliate/Daily'),
          meta: { title: '代理流水', model: false },
        },
        {
          path: 'userdaily',
          name: 'affiliateUserDaily',
          component: () => import('./views/affiliate/UserDaily'),
          meta: { title: '结算审核', model: false },
        },
        {
          path: 'monthly',
          name: 'affiliateMonthly',
          component: () => import('./views/affiliate/Monthly'),
          meta: { title: '月结算审核', model: false },
        },
        {
          path: 'balance',
          name: 'affiliateBalance',
          component: () => import('./views/affiliate/Balance'),
          meta: { title: '余额调整历史', model: false },
        },
        {
          path: 'allList',
          name: 'affiliateAllList',
          component: () => import('./views/affiliate/AllList'),
          meta: { title: '全民代理列表', model: false },
        },
      ],
    },
    // 風控管理
    {
      path: '/risk',
      name: 'risk',
      component: () => import('./views/risk'),
      meta: { title: '风控管理', icon: 'security', model: false },
      children: [
        {
          path: 'list',
          name: 'riskList',
          component: () => import('./views/risk/List'),
          meta: { icon: 'people', title: '风控管理列表', model: false },
        },
        {
          path: 'list/:type',
          name: 'riskList2',
          component: () => import('./views/risk/List'),
          meta: { title: '風控管理列表', model: false },
          hidden: true,
        },
        {
          path: 'warning',
          name: 'riskWarning',
          component: () => import('./views/risk/Warning'),
          meta: { title: '风控管理列表', icon: 'people', model: false },
        },
      ],
    },
    // 好友推荐
    {
      path: '/friends/',
      name: 'friends',
      component: () => import('./views/friends/index'),
      meta: { title: '好友推荐设置', icon: 'people', model: false },
      hidden: () => !Number(store.getters.config.Show_Friend_Event),
      children: [
        {
          path: 'settings',
          name: 'friendSettings',
          component: () => import('./views/friends/Settings'),
          meta: { title: '好友推荐设置', model: false },
        },
        {
          path: 'report',
          name: 'friendReport',
          component: () => import('./views/friends/Reports'),
          meta: { title: '好友推荐報表', model: false },
        },
        {
          path: 'cumulative',
          name: 'friendCumulativeReport',
          component: () => import('./views/friends/Cumulative'),
          meta: { title: '好友累绩報表', model: false },
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(r => r.meta.requireAuth)) {
    if (store.getters.token || window.sessionStorage.getItem('token')) {
      next();
    } else {
      next({
        path: '/',
      });
    }
  } else {
    next();
  }
});

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

export default router;
