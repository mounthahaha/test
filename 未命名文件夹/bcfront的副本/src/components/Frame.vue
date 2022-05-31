<template>
  <div>
    <v-app-bar color="primary" class="elevation-0 ma-0 pa-0" flat app fixed dark :clipped-left="$vuetify.breakpoint.mdAndUp">
      <v-toolbar-title style="width: auto" class="d-flex align-center ma-0 pr-5">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <span class="ml-2 hidden-sm-and-down" @click="$router.push('/')">{{ config['title'] }} {{ textfilter('header_title') }}</span>
      </v-toolbar-title>
      <!-- 搜尋框 / 天條 -->
      <v-menu v-model="menu" offset-y min-width="1000" style="width: 1000px">
        <template #activator="{ on }">
          <v-text-field
            v-model="search"
            class="pr-2"
            min-width="1000"
            :label="$t('header_searchPlaceholder')"
            :placeholder="$t('header_searchPlaceholder')"
            solo-inverted
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            solo
            rounded
            v-on="on"
            @keydown.enter="searchResult.length && showDetail(searchResult[0])"
            @keyup="doSearch()"
            @click="doSearch()"
          ></v-text-field>
        </template>
        <v-list v-show="searchResult.length > 0" class="pa-0 mt-1" dense>
          <v-list-item v-for="(item, index) in searchResult" :key="index" @click="showDetail(item.id)">
            <v-list-item-title>{{ item.name }} </v-list-item-title>
            <v-icon color="#6e95b2" class="pa-0 ma-0">send</v-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- <v-btn fab dark small depressed color="primary" @click="doSearch()">
        <v-icon dark>search</v-icon>
      </v-btn> -->
      <!-- 營業時間設置 -->
      <v-tooltip v-if="config.is_bet === '1'" bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" :color="isBetTime ? 'green' : 'primary'" depressed fab dark small class="ml-10 mx-2" v-on="on" @click="putBetByApi">
            <v-icon v-if="isBetTime">alarm</v-icon>
            <v-icon v-else>close</v-icon>
          </v-btn>
        </template>
        <span v-if="isBetTime">营业时间</span>
        <span v-else>非营业时间</span>
      </v-tooltip>
      <!-- 語系國旗 風控鈴 -->
      <country-flag class="mr-2" :country="langItem.find(item => item.key == locale).flag" size="normal" />
      <Notifications class="mr-2" />
      <!-- 主題調色盤 -->
      <v-menu v-model="showColorLensMenu" :close-on-content-click="false" :nudge-width="200" bottom offset-y nudge-bottom="8" nudge-left="120">
        <template #activator="{ on, attrs }">
          <v-btn class="mx-2" color="white" icon v-bind="attrs" v-on="on"> <v-icon>color_lens</v-icon> </v-btn>
        </template>
        <v-card>
          <v-color-picker
            v-model="websitePrimaryColor"
            :value="websitePrimaryColor"
            :swatches="colorSwatches"
            show-swatches
            flat
            dot-size="8"
            mode="hexa"
            swatches-max-height="200"
            elevation="0"
          ></v-color-picker>
          <v-card-actions class="px-5">
            <v-btn icon color="red" @click="showColorLensMenu = false"> <v-icon>cancel</v-icon> </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon color="green" @click="setWebsitePrimaryColor"> <v-icon>check_circle</v-icon> </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
      <!--英簡  -->
      <v-menu open-on-hover close-delay="300" offset-y nudge-top="-10px" nudge-right="-8px">
        <template #activator="{ on }">
          <v-btn class="mx-2" icon large v-on="on"> <v-icon dark>translate</v-icon> </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, index) in langItem" :key="index" @click="changeLang(item.key)">
            <country-flag :country="item.flag" size="normal" />
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- 警示音開關 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            :color="soundSwitchOnOff ? 'green' : 'primary'"
            depressed
            fab
            dark
            small
            class="mx-2"
            v-on="on"
            @click.stop="soundSwitchOnOff = !soundSwitchOnOff"
          >
            <v-icon>campaign</v-icon>
          </v-btn>
        </template>
        <span v-if="soundSwitchOnOff">异常提醒开启</span>
        <span v-else>异常提醒关闭</span>
      </v-tooltip>
      <!-- 千分位 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            :color="isComma ? 'green' : 'primary'"
            depressed
            fab
            dark
            small
            class="mx-2"
            v-bind="attrs"
            v-on="on"
            @click.stop="isComma = !isComma"
          >
            <v-icon>format_quote</v-icon>
          </v-btn>
        </template>
        <span>{{ textfilter('header_displayComma') }}</span>
      </v-tooltip>
      <!-- 登出 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn icon class="mx-2" dense v-bind="attrs" v-on="on" @click="logout">
            <v-icon>exit_to_app</v-icon>
          </v-btn>
        </template>
        <span>{{ textfilter('g_logout') }}</span>
      </v-tooltip>

      <!-- 舊樣式 -->
      <!-- <v-switch v-model="isComma" :label="$t('header_displayComma')" hide-details class="mx-5"></v-switch>
      <div style="width: 150px">
        <v-select
          v-model="langModel"
          class="px-3"
          type="text"
          :label="$t('g_selector_language')"
          :items="langItem"
          item-text="value"
          item-value="key"
          dense
          hide-details
          solo
          light
          @change="changeLang"
        ></v-select>
      </div>
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn icon large v-on="on">
            <v-icon dark>account_circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>{{ textfilter('g_logout') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
    </v-app-bar>

    <!-- 左側選單 -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :clipped="$vuetify.breakpoint.mdAndUp"
      :width="sidebarWidth"
      persistent
      style="top: 64px"
      :disable-resize-watcher="true"
      :stateless="true"
      :touchless="true"
    >
      <v-list-item class="px-2">
        <v-list-item-avatar class="purple red--after" size="40" @click.stop="mini = !mini">
          <span class="white--text headline">{{ h() }}</span>
        </v-list-item-avatar>
        <v-list-item-title>{{ user.name }}</v-list-item-title>
        <v-btn icon @click.stop="mini = !mini">
          <v-icon>{{ mini ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
        </v-btn>
      </v-list-item>
      <v-divider light></v-divider>
      <v-list>
        <template v-for="item in routersList">
          <template v-if="visible(item.hidden)">
            <v-list-group v-if="isGroup(item)" :key="`${item.name}`" v-model="item.meta.model" :prepend-icon="item.meta.icon" no-action>
              <template #activator>
                <v-list-item-content>
                  <v-list-item-title>{{ textfilter(`sidebar_${item.name}`, item.meta.title) }}</v-list-item-title>
                </v-list-item-content>
              </template>
              <template v-for="subItem in item.children">
                <template v-if="!subItem.hidden">
                  <!--第二層 往下長第三層 @todo 預計抽成遞迴component-->
                  <v-list-group v-if="isGroup(subItem)" :key="subItem.name" v-model="subItem.meta.model" sub-group no-action>
                    <template #activator>
                      <v-list-item-content>
                        <v-list-item-title>{{ textfilter(`sidebar_${subItem.name}`, subItem.meta.title) }}</v-list-item-title>
                      </v-list-item-content>
                    </template>
                    <!--第三層-->
                    <v-list-item
                      v-for="subSubItem in subItem.children"
                      v-show="visible(subSubItem.hidden)"
                      :key="subSubItem.name"
                      :to="{ name: subSubItem.name }"
                    >
                      <v-list-item-content>
                        <v-list-item-title>{{ textfilter(`sidebar_${subSubItem.name}`, subSubItem.meta.title) }}</v-list-item-title>
                      </v-list-item-content>
                      <!-- <v-list-item-action>
                        <v-icon class="pr-5">keyboard_arrow_right</v-icon>
                      </v-list-item-action> -->
                    </v-list-item>
                  </v-list-group>
                  <!--第二層-->
                  <v-list-item v-else :key="subItem.name" :to="{ name: subItem.name }">
                    <v-list-item-content>
                      <v-list-item-title>{{ textfilter(`sidebar_${subItem.name}`, subItem.meta.title) }}</v-list-item-title>
                    </v-list-item-content>
                    <!-- <v-list-item-action>
                      <v-icon class="pr-5">keyboard_arrow_right</v-icon>
                    </v-list-item-action> -->
                  </v-list-item>
                </template>
              </template>
            </v-list-group>
            <!--第一層 無children-->
            <template v-else>
              <v-list-item-group v-for="singleItem in item.children" :key="`${item.name}_${singleItem.name}`" v-model="singleItem.model">
                <v-list-item :to="{ name: singleItem.name }">
                  <v-list-item-icon>
                    <v-icon v-text="singleItem.meta.icon"></v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ textfilter(`sidebar_${singleItem.name}`, item) }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon>keyboard_arrow_right</v-icon>
                  </v-list-item-action>
                </v-list-item>
              </v-list-item-group>
            </template>
          </template>
        </template>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import api from '@/api';
import { mapGetters, mapMutations } from 'vuex';
import _ from 'lodash';
import { hiddenPhoneNumber } from '../filters/custom';
import Notifications from './Notifications';

export default {
  name: 'MyFrame',
  components: { Notifications },
  data: () => ({
    langModel: '',
    drawer: true,
    mini: false,
    searchResult: [],
    isLoading: false,
    search: null,
    menu: false,
    showColorLensMenu: false,
    color: '',
    colorSwatches: [
      ['#57b6e3', '#ff9900'],
      ['#4f846f', '#464646'],
      ['#925cae', '#4167be'],
      ['#46B489', '#252BB1'],
      ['#A58B66', '#0070ff'],
    ],
    langMap: {},
    isBetTime: false,
  }),
  computed: {
    ...mapGetters({ locale: 'i18n/locale', langItem: 'i18n/langItem', soundSwitch: 'soundSwitch' }),
    user() {
      return this.$store.getters.user;
    },
    routersList() {
      return this.$router.options.routes;
    },
    config() {
      return this.$store.getters.config;
    },
    sidebarWidth() {
      return this.locale === 'en' ? 300 : undefined;
    },
    isComma: {
      get() {
        return this.$store.getters.isComma;
      },
      set(val) {
        this.$store.commit('setIsComma', val);
      },
    },
    soundSwitchOnOff: {
      get() {
        return this.soundSwitch.alert.value;
      },
      set(val) {
        this.setSoundSwitch({ sound: 'alert', val });
      },
    },
    websitePrimaryColor: {
      get() {
        return this.color;
      },
      set(val) {
        this.color = val;
      },
    },
  },
  watch: {
    'config.title'(title) {
      document.title = `${title} ${this.$t('header_title')}`;
    },
    locale() {
      this.setLangKeys();
    },
    // config() {
    //   this.websitePrimaryColor = this.config.website_primary_color;
    // },
    'config.showTurnoverSetting'(show) {
      const target = this.$router.options.routes.find(item => item.name === 'system')?.children?.find(item => item.name == 'systemTurnoverSetting');
      if (Number(show)) {
        target.hidden = false;
      }
    },
    'config.Show_FingerPrint_Report'(show) {
      const target = this.$router.options.routes.find(item => item.name === 'report')?.children?.find(item => item.name == 'reportPlayerBehavior');
      if (Number(show)) {
        target.hidden = false;
      }
    },
  },
  created() {
    this.setLangKeys();
    this.langModel = this.locale;
    this.websitePrimaryColor = localStorage.getItem('__websitePrimaryColor__');
    if (this.websitePrimaryColor != null) {
      this.$vuetify.theme.themes.light.primary = this.websitePrimaryColor;
    } else {
      this.websitePrimaryColor = this.$vuetify.theme.themes.light.primary;
    }
    this.getBetByApi();
  },
  methods: {
    ...mapMutations({ SET_LOCALE: 'i18n/SET_LOCALE', setSoundSwitch: 'setSoundSwitch' }),
    h() {
      return this.$store.getters.user.name.slice(0, 1).toUpperCase();
    },
    logout() {
      this.$store.commit('Confirm', {
        ok: () => {
          this.$store.commit('LOGOUT');
          this.$store.commit('MsgOk', this.$t('g_msgLogout'));
        },
        cancel: () => {},
      });
    },
    doSearch() {
      if (this.search == '' || this.search == null) {
        return false;
      }
      const $this = this;
      this.isLoading = true;
      api
        .get('/player/search', {
          param: $this.search,
        })
        .then(data => {
          $this.searchResult = data.result == '' || data.result == null ? [] : data.result;
          // $this.searchResult.map(item => {
          // const indexOfFirst = $this.user.name.indexOf('admin') === 0;
          // if (!indexOfFirst) {
          // const temp = item.name.split(',');
          // temp[temp.length - 2] = hiddenPhoneNumber(temp[temp.length - 2]);
          // item.name = temp.join(',');
          // }
          //   return item;
          // });
          if ($this.searchResult.length > 0) {
            $this.menu = true;
          } else {
            $this.$store.commit('MsgError', '没有找到什么信息');
          }
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        })
        .finally(() => ($this.isLoading = false));
    },
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    isGroup(item) {
      return item.children && item.children.length > 1;
    },
    changeLang(lang) {
      this.SET_LOCALE(lang);
    },
    setWebsitePrimaryColor() {
      this.showColorLensMenu = false;
      localStorage.removeItem('__websitePrimaryColor__');
      localStorage.setItem('__websitePrimaryColor__', this.websitePrimaryColor);
      this.$vuetify.theme.themes.light.primary = this.websitePrimaryColor;
      // api
      //   .patch(`/system/config/website_primary_color`, { val: this.websitePrimaryColor })
      //   .then(data => {
      //     localStorage.setItem('__websitePrimaryColor__', this.websitePrimaryColor);
      //     this.$vuetify.theme.themes.light.primary = this.websitePrimaryColor;
      //   })
      //   .catch(error => {
      //     this.$store.commit('MsgError', error.error);
      //   });
    },
    validateKey(key) {},
    async setLangKeys() {
      const map = await import(`@/i18n/lang/${this.locale}.js`);
      this.langMap = map.default;
      this.$forceUpdate();
    },
    textfilter(key, alt) {
      return this.langMap[key] ? this.$t(key) : alt;
    },
    getBetByApi() {
      api
        .get('/system/bet')
        .then(data => {
          this.isBetTime = data.result.BetSwitch;
        })
        .catch(error => {
          this.isBetTime = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    putBetByApi() {
      this.$store.commit('Confirm', {
        text: this.$t('g_msg_sureDoChangeIsBet'),
        ok: () => {
          api
            .put('/system/bet')
            .then(data => {
              this.isBetTime = !this.isBetTime;
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
        cancel: () => {},
      });
    },
    visible(hidden) {
      if (typeof hidden == 'function') {
        return !hidden();
      } else {
        return !hidden;
      }
    },
  },
};
</script>
