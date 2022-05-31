// import '@babel/polyfill';
import 'core-js/stable';
import Vue from 'vue';
import axios from 'axios';
import vuetify from './plugins/vuetify';
import i18n from './i18n';
import App from './App.vue';
import store from './store/';
import router from './router';
import * as custom from './filters/custom';
import './plugins/element-ui';
import './assets/sass/main.scss';
import _ from 'lodash';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'typeface-noto-sans';
import 'typeface-open-sans';
import CountryFlag from 'vue-country-flag';
import VueParticles from 'vue-particles';
import DatetimeRange from '@/components/DatetimeRangePicker';

/*
 * Vue.config.debug = false
 * Vue.config.devtools = false
 * Vue.config.productionTip = false
 */
Vue.component('CountryFlag', CountryFlag);
Vue.component('DatetimeRange', DatetimeRange);
Vue.use(VueParticles);
Object.keys(custom).forEach(key => {
  Vue.filter(key, custom[key]);
});
Object.defineProperty(Vue.prototype, '_', { value: _ });
/**
 * init vue
 */
const app = new Vue({
  vuetify,
  store,
  router,
  i18n,
  CountryFlag,
  axios,
  render: h => h(App),
}).$mount('#app');
// const originTrans = app.$t;
// app.$t = (key, alter) => {
//   console.log(key, alter);
//   return originTrans(key) == key ? alter || key : key;
// };

export default app;
