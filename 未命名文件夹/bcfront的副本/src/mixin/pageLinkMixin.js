import { mapActions, mapGetters } from 'vuex';
const pagelinkList = [
  {
    id: 'userCentre',
    name: '个人中心',
    router: '/userCentre',
  },
  {
    id: 'promotion',
    name: '优惠活动',
    router: '/promotion',
  },
  {
    id: 'appdownload',
    name: 'APP下载',
    router: '/appdownload',
  },
  {
    id: 'pcdownload',
    name: 'PC下载',
    router: '/installdownload',
  },
  {
    id: 'helpCentre',
    name: '幫助中心',
    router: '/helpCentre',
  },
  {
    id: 'liveChat',
    name: '投诉通道',
    router: '/liveChat',
  },
  {
    id: 'userCentre_profile',
    name: '个人信息',
    router: '/userCentre/profile',
  },
  {
    id: 'userCentre_notice',
    name: '通知中心',
    router: '/userCentre/notice',
  },
  {
    id: 'userCentre_wallet',
    name: '钱包',
    router: '/userCentre/wallet',
  },
  {
    id: 'userCentre_deposit',
    name: '存款',
    router: '/userCentre/deposit',
  },
  {
    id: 'userCentre_withdrawals',
    name: '提款',
    router: '/userCentre/withdrawals',
  },
  {
    id: 'helpCentre_about',
    name: '关于我们',
    router: '/helpCentre/about',
  },
  {
    id: 'helpCentre_problem',
    name: '常见问题',
    router: '/helpCentre/problem',
  },
  {
    id: 'helpCentre_features',
    name: '功能介绍',
    router: '/helpCentre/features',
  },
  {
    id: 'helpCentre_terms',
    name: '使用条款',
    router: '/helpCentre/terms',
  },
  {
    id: 'helpCentre_disclaimer',
    name: '免责声明',
    router: '/helpCentre/disclaimer',
  },
  {
    id: 'helpCentre_policies',
    name: '隐私及COOKIE政策',
    router: '/helpCentre/policies',
  },
  {
    id: 'helpCentre_rules',
    name: '优惠活动条款与规则',
    router: '/helpCentre/rules',
  },
  {
    id: 'helpCentre_agreement',
    name: '客户协议',
    router: '/helpCentre/agreement',
  },
];
export default {
  // 為了防止使用mixins時設定沖突，名稱請加上'pagelink'當前綴
  computed: {
    pagelinkList() {
      return pagelinkList;
    },
    gamelinkRouterMap() {
      return new Map(this.pagelinkList.map(element => [element.router, element.name]));
    },
    // v-select 的items值
    gamelinkRouterSelectItems() {
      return this.pagelinkList.map(element => ({ text: element.name, value: element.router }));
    },
  },
  methods: {
    gamelistCreateLink() {
      return new Date().getTime();
    },
  },
};