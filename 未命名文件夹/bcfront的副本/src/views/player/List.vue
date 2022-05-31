<template>
  <div class="List">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 可視化欄位  -->
      <div class="d-flex align-center mr-4">
        <FieldFilter :storage-tag="`player_list`" :header-map="headers" @updateInfo="items => (headers = items)" />
      </div>
      <!-- 搜尋 重置 下載 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1)">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="resetOptions()">
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_reset') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="_export">
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_export') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-if="searchShow" v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_less</v-icon>
          </v-btn>
          <v-btn v-else v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_more</v-icon>
          </v-btn>
        </template>
        <span v-if="searchShow">{{ $t('g_btn_searchHide') }}</span>
        <span v-else>{{ $t('g_btn_searchExpand') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 搜尋 -->
      <v-card v-if="searchShow" elevation="0" class="pa-3 mb-3 rounded-lg" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.name"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('player_list_username')"
              :placeholder="$t('player_list_placeholder_username')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.mobile"
              hide-details
              solo
              clearable
              :label="$t('player_list_phone')"
              :placeholder="$t('player_list_placeholder_phone')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.lip"
              hide-details
              solo
              clearable
              :label="$t('player_list_loginIp')"
              :placeholder="$t('player_list_placeholder_loginIp')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <!-- <v-col cols="4">
            <el-date-picker
              v-model="searchOption.date"
              :picker-options="datePickerOptions"
              class="el-vuetify-text-field"
              type="datetimerange"
              :range-separator="$t('player_balance_to')"
              :start-placeholder="$t('player_balance_startDate')"
              :end-placeholder="$t('player_balance_endStart')"
              value-format="yyyy-MM-dd HH:mm:ss"
              :default-time="['00:00:00', '23:59:59']"
              style="width: 100%"
            >
            </el-date-picker>
          </v-col> -->
          <v-col cols="4">
            <datetime-range
              v-model="searchOption.date"
              range-separator="player_balance_to"
              start-placeholder="注册开始时间"
              end-placeholder="结束时间"
            />
          </v-col>
          <v-col cols="4">
            <datetime-range
              v-model="loginDate"
              range-separator="player_balance_to"
              start-placeholder="登录开始时间"
              end-placeholder="结束时间"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.ip"
              hide-details
              solo
              clearable
              :label="$t('player_list_regIp')"
              :placeholder="$t('player_list_placeholder_regIp')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.id"
              hide-details
              solo
              clearable
              :label="$t('player_list_userId')"
              :placeholder="$t('player_list_placeholder_userId')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.vip_lv"
              hide-details
              solo
              :items="vipLevels"
              :label="$t('player_list_selector_level')"
              persistent-hint
              single-line
              clearable
            >
            </v-select>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.block_status"
              hide-details
              solo
              :items="[
                { text: $t('g_btn_enable'), value: 0 },
                { text: $t('g_btn_disable'), value: 1 },
              ]"
              :label="$t('g_selector_status')"
              persistent-hint
              single-line
              clearable
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.t"
              hide-details
              solo
              :items="SelectedTags"
              item-text="name"
              item-value="value"
              :label="$t('player_list_selector_tag')"
              persistent-hin
              single-line
              clearable
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.is_sms"
              hide-details
              solo
              :items="SelectedSMSStatus"
              item-text="name"
              item-value="value"
              :label="$t('g_table_column_sms')"
              persistent-hin
              single-line
              clearable
            >
              <template #selection="{ item }">{{ $t(item.name) }}</template>
              <template #item="{ item }">{{ $t(item.name) }}</template>
            </v-select>
          </v-col>
          <v-col cols="4">
            <v-card class="pl-5 pr-3">
              <v-row dense class="align-center">
                <v-col cols="11">
                  <v-slider
                    v-model="searchOption.profit"
                    :disabled="disableProfit"
                    dense
                    hide-details
                    height="40"
                    :label="$t('g_profit_deposit_ratio')"
                    :thumb-size="(sliderMax.toString().length + 2) * 10"
                    step="1"
                    thumb-label
                    :max="sliderMax"
                    min="0"
                    track-color="primary"
                    class="d-flex"
                    @change="profitChange()"
                  >
                    <template #thumb-label="{ value }"> {{ value }}% </template>
                  </v-slider>
                </v-col>
                <v-col cols="1" class="text-right">
                  <v-checkbox class="pa-0 ma-0" dense hide-details :value="!disableProfit" @change="disableProfit = !disableProfit" />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense>
        <v-col>
          <v-alert dense dark color="green" border="left" class="pr-8">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">groups</v-icon>{{ $t('player_list_olinePlayer') }}</span>
              <span class="text-h5 font-weight-bold">{{ sum['online'] }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark color="blue" border="left" class="pr-8">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">groups</v-icon>{{ $t('player_list_todayPlayer') }}</span>
              <span class="text-h5 font-weight-bold">{{ sum['today'] }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark color="red" border="left" class="pr-8">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">groups</v-icon>{{ $t('player_list_totalPlayer') }}</span>
              <span class="text-h5 font-weight-bold">{{ sum['all'] }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark color="purple" border="left" class="pr-8">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">groups</v-icon>{{ $t('player_list_currentCondition') }}</span>
              <span class="text-h5 font-weight-bold">{{ pagination.totalItems }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerArr"
          :items="desserts"
          :loading="loading"
          :disable-sort="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          :server-items-length="pagination.totalItems"
          :footer-props="{
            'items-per-page-options': [10, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <template v-for="(col, i) in headerArr">
                <td v-if="/actions/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="loginAs(item.id)">
                        <v-icon>login</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('player_list_loginPlayer') }}</span>
                  </v-tooltip>
                </td>
                <td v-else-if="/^(name)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.id)"> {{ item.id }} </a>)
                </td>
                <td
                  v-else-if="/^(deposit_count|withdraw_count|)$/.test(col.value)"
                  :key="i"
                  class="text-left text-no-wrap"
                  :inner-html.prop="item[col.value]"
                ></td>
                <td
                  v-else-if="/^(user_wallet_amount||deposit_amount|withdraw_amount|)$/.test(col.value)"
                  :key="i"
                  class="text-left text-no-wrap"
                  :inner-html.prop="item[col.value] | moneyColor"
                ></td>
                <td
                  v-else-if="/^(profit_and_loss)$/.test(col.value)"
                  :key="i"
                  class="text-center text-no-wrap"
                  :inner-html.prop="item[col.value] | moneyColor"
                ></td>
                <td
                  v-else-if="/^(profitLossRatio)$/.test(col.value)"
                  :key="i"
                  class="text-center text-no-wrap"
                  :inner-html.prop="item[col.value] | ratioColor"
                ></td>
                <td
                  v-else-if="/^(cards)$/.test(col.value)"
                  :key="i"
                  class="text-center text-no-wrap"
                  :inner-html.prop="(item.cards || '').split(',').join('<br>')"
                ></td>
                <td v-else-if="/^(tags)$/.test(col.value)" :key="i" class="text-left" style="min-width: 300px">
                  <template v-if="item.tags != ''">
                    <v-chip
                      v-for="id in formatTag(item.tags)"
                      :key="id"
                      label
                      :color="tags[id] ? tags[id]['color'] : ''"
                      small
                      class="white--text mr-1"
                    >
                      {{ tags[id] ? tags[id]['name'] : '--' }}
                    </v-chip>
                  </template>
                  <template v-else><v-chip label small color="primary">--</v-chip></template>
                </td>
                <td v-else-if="/^(lastip)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.ip }} ({{ item.lastip }})</td>
                <td v-else-if="/^(regip)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.regip }}</td>
                <td v-else-if="/^(lastime|created)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item[col.value] | formatDate }}</td>
                <td v-else-if="/^(block_status)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip label outlined small :color="item.block_status == 1 ? `red` : `green`">
                    {{ item.block_status == 1 ? $t('g_btn_disable') : $t('g_btn_enable') }}
                  </v-chip>
                </td>
                <td v-else-if="/^(is_sms)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip label outlined small :color="item.is_sms == 0 ? `red` : `green`">
                    {{ item.is_sms == 0 ? '未通过' : '通过' }}
                  </v-chip>
                </td>
                <td v-else-if="/^(vip_lv)$/.test(col.value)" :key="i" class="text-center text-no-wrap">
                  <v-chip label outlined small color="primary">{{ item.vip_lv ? `VIP ${item.vip_lv}` : `--` }}</v-chip>
                </td>
                <td v-else :key="i" class="text-left text-no-wrap">{{ item[col.value] || '--' }}</td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { dateRange, shortcuts, exportXLSX } from '@/utils';
import { formatDate, moneyColor, ratioColor, money, hiddenPhoneNumber, hiddenText } from '@/filters/custom';
import FieldFilter from '@/components/FieldFilter';
import _ from 'lodash'

export default {
  name: 'PlayerList',
  components: { FieldFilter },
  data() {
    return {
      daterange: dateRange,
      searchOption: {
        date: [],
      },
      loginDate: [],
      disableProfit: true,
      sliderMax: 200,
      desserts: [],
      sum: {},
      tags: {},
      SelectedTags: [],
      // menuCreatedDate: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      shortcuts,
      searchShow: true,
      loading: false,
      moneyColor,
      ratioColor,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortDesc: [],
        sortBy: [],
      },
      datePickerOptions: {
        shortcuts,
      },
      headers: [
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'actions',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
          show: true,
          canHide: false,
        },
        {
          lang: 'g_table_column_usernameId',
          text: '用户名(ID)',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_reaName',
          text: '真实姓名',
          value: 'real_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_mobilePhoneNumber',
          text: '手机号',
          value: 'mobile',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_superiorAgent',
          text: '上级代理',
          value: 'aff_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_account_balance',
          text: '帐户余额',
          value: 'user_wallet_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'finance_withdrawal_accountInformation',
          text: '账户信息',
          value: 'cards',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_numberDposits',
          text: '入款次数',
          value: 'deposit_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_numberWithdrawals',
          text: '出款次数',
          value: 'withdraw_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_totalDeposit',
          text: '入款总额',
          value: 'deposit_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_total_withdrawal',
          text: '出款总额',
          value: 'withdraw_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_totalWinOrLoss',
          text: '总输赢',
          value: 'profit_and_loss',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_profitLossRatio',
          text: '盈亏比',
          value: 'profitLossRatio',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'block_status',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
          show: true,
          canHide: true,
        },
        {
          lang: 'g_table_column_sms',
          text: '手机验证',
          value: 'is_sms',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_playerTag',
          text: '玩家标签',
          value: 'tags',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_level',
          text: '等級',
          value: 'vip_lv',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_lastLoginTime',
          text: '最新登录时间',
          value: 'lastime',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_loginIP',
          text: '登录IP',
          value: 'lastip',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_registeredIP',
          text: '注册IP',
          value: 'regip',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_list_column_registrationTime',
          text: '注册时间',
          value: 'created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
      ],
      SelectedSMSStatus: [
        { value: '1', name: 'g_table_column_sms_verified' },
        { value: '0', name: 'g_table_column_sms_unverified' },
      ],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    vipLevels() {
      const result = [];
      for (let i = 0; i < 10; i++) {
        result.push({ value: i, text: `VIP ${i}` });
      }
      return result;
    },
    headerArr() {
      return this.headers
        .filter(item => (item.value == 'actions' ? !Number(this.config.hideLoginAs) : true))
        .filter(item => item.show)
        .filter(item => !(item.value === 'mobile' && this.config.register_disable_mobile))
        .map(item => {
          item.text = item.lang ? this.$t(item.lang) : item.text;
          return item;
        });
    },
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage < this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadData(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
    'pagination.sortDesc'(desc) {
      if (desc != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
    'pagination.sortBy'(by) {
      if (by != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
    '$route.params.ip'(ip) {
      if (ip) {
        this.searchOption.lip = ip;
        this.loadData(1);
      }
    },
  },
  mounted() {
    this.searchOption.lip = this.$route.params.ip;
    this.loadData(1);
    this.getTags();
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        page: p,
        num: this.pagination.itemsPerPage,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        ...this.searchOption,
      };
      if (params.date && params.date.length == 2) {
        params.s = params.date[0] || '';
        params.e = params.date[1] || '';
      }
      if (this.loginDate && this.loginDate.length > 0) {
        params.loginStartTime = this.loginDate[0]||'';
        params.loginEndTime = this.loginDate[1]||'';
      }
      if (this.disableProfit) {
        delete params.profit;
      }
      api
        .get('/player/list', params)
        .then(data => {
          this.desserts = data.result.players == null ? [] : data.result.players;
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.loading = false;
          this.sum = data.result.sum;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      const params = {
        page: 1,
        num: this.pagination.totalItems,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        ...this.searchOption,
      };
      if (params.date && params.date.length == 2) {
        params.s = params.date[0] || '';
        params.e = params.date[1] || '';
      }
      if (this.loginDate && this.loginDate.length > 0) {
        params.loginStartTime = this.loginDate[0]||'';
        params.loginEndTime = this.loginDate[1]||'';
      }
      if (this.disableProfit) {
        delete params.profit;
      }

      api
        .get('/player/list', params)
        .then(async data => {
          if (data.result.players == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const sheet = [];
            const cols = [];
            this.headerArr.forEach(col => {
              if (col.value !== 'actions') {
                cols.push(col.text);
              }
            });
            sheet.push(cols);
            const arr = [];
            // console.log('data.result.players.length', data.result.players.length);
            // eslint-disable-next-line space-before-function-paren
            data.result.players.forEach(async (row, index) => {
              const tmp = [];
              this.headerArr.forEach(col => {
                if (col.value == 'actions') {
                  return true;
                } else if (/vip_lv/.test(col.value)) {
                  tmp.push(row.vip_lv >= 0 ? `VIP ${row.vip_lv}` : `--`);
                } else if (/block_status/.test(col.value)) {
                  tmp.push(row.block_status == 1 ? `停用` : `启用`);
                } else if (/is_sms/.test(col.value)) {
                  tmp.push(row.is_sms == 0 ? `未通过` : `通过`);
                } else if (/^(updated|created|lastime)$/.test(col.value)) {
                  tmp.push(formatDate(row[col.value]));
                } else if (/tags/.test(col.value)) {
                  if (row.tags) {
                    tmp.push(
                      row.tags
                        .split(',')
                        .map(tag => (this.tags[tag] ? this.tags[tag].name : '--'))
                        .join(','),
                    );
                  } else {
                    tmp.push('-');
                  }
                } else if (/lastip.*/.test(col.value)) {
                  tmp.push(`${row.ip}(${row.lastip})`);
                } else if (/^(deposit_count|withdraw_count)$/.test(row[col.value])) {
                  tmp.push(parseFloat(row[col.value]));
                } else if (/^\d+\.\d+$/.test(row[col.value])) {
                  tmp.push(parseFloat(row[col.value], false));
                } else {
                  tmp.push(row[col.value] || '-');
                }
              });
              sheet.push(tmp);
            });
            exportXLSX(sheet, '玩家列表');
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    loginAs(id) {
      api
        .get(`/player/login/${id}`)
        .then(data => {
          window.open(data.result);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
      // this.curPlayer = this.desserts[index]
      // this.detail = true
    },
    getTags() {
      api
        .get('/player/tagkv')
        .then(data => {
          this.tags = data;
          const SelectedTags = [];
          for (const i in data) {
            SelectedTags.push({ value: i, name: data[i].name });
          }
          this.SelectedTags = SelectedTags;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    formatTag(tags) {
      return tags.split(',');
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else {
          delete this.searchOption[i];
        }
      });
      this.$forceUpdate();
    },
    checkDateRange(date) {
      if (date && date.length == 2 && date[0] > date[1]) {
        const tmp = date[0];
        date[0] = date[1];
        date[1] = tmp;
      }
    },
    profitChange() {
      this.searchOption.profit >= this.sliderMax && (this.sliderMax *= 2);
    },
  },
};
</script>
