<template>
  <div class="Player">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 可視化欄位  -->
      <div class="d-flex align-center mr-4">
        <FieldFilter storage-tag="player_report" :header-map="headers" @updateInfo="items => (headers = items)" />
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
          <v-col cols="6">
            <datetime-range v-model="searchOption.created" start-placeholder="report_players_textfields_createdStartDate" />
          </v-col>
          <v-col cols="6">
            <datetime-range v-model="searchOption.date" start-placeholder="report_players_textfields_dataStartDate" />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.id"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('g_text_field_userId')"
              :placeholder="$t('g_text_field_placeholder_userId')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.name"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('g_text_field_username')"
              :placeholder="$t('g_text_field_placeholder_username')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.affname"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_affiliateName')"
              :placeholder="$t('report_players_textfields_affiliateName_placeholder')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.deposit_min"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_depositRange')"
              :placeholder="`${$t('report_players_textfields_deposit')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.deposit_max"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_depositRange')"
              :placeholder="`${$t('report_players_textfields_deposit')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.withdrawal_min"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_withdrawRange')"
              :placeholder="`${$t('report_players_textfields_withdraw')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col xs3>
            <v-text-field
              v-model="searchOption.withdrawal_max"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_withdrawRange')"
              :placeholder="`${$t('report_players_textfields_withdraw')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.balance_min"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_balanceMin')"
              :placeholder="`${$t('report_players_textfields_balance')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.balance_max"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_balanceMax')"
              :placeholder="`${$t('report_players_textfields_balance')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.promote_min"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_rewardRange')"
              :placeholder="`${$t('report_players_textfields_reward')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.promote_max"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_players_textfields_rewardRange')"
              :placeholder="`${$t('report_players_textfields_reward')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col cols="3">
          <v-alert dense dark color="green" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalDeposits') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.deposit | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="3">
          <v-alert dense dark color="red" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalWithdrawals') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.withdrawal | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="3">
          <v-alert dense dark color="blue" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalBalance') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.amount | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="3">
          <v-alert dense dark color="orange" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalBet') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.bet_amount | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="3">
          <v-alert dense dark color="indigo" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalRewards') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.promote_amount | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="3">
          <v-alert dense dark color="blue-grey" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalPayout') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.payout_amount | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="3">
          <v-alert dense dark color="purple" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalWinloss') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.result_amount | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="3">
          <v-alert dense dark color="black" border="left" class="mb-0 pr-5">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">people</v-icon>{{ $t('g_statics_totalPlayers') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary.users }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
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
              <template v-for="(col, i) in headerComputed">
                <td v-if="/name/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
                  <template v-if="item.username != item.name">- {{ item.username }}</template>
                </td>
                <td v-else-if="/^(regtime|lastime)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item[col.value] | formatDate }}
                </td>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <td
                  v-else-if="/^(result_amount)$/.test(col.value)"
                  :key="i"
                  class="text-left text-no-wrap"
                  :inner-html.prop="item[col.value] | moneyColor"
                ></td>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <td
                  v-else-if="/^(profitLossRatio)$/.test(col.value)"
                  :key="i"
                  class="text-left text-no-wrap"
                  :inner-html.prop="item[col.value] | ratioColor"
                ></td>
                <td
                  v-else-if="/^(deposit|withdrawal|balance|bet_amount|payout_amount|balancePromotion|balancePlus|balanceMinus)$/.test(col.value)"
                  :key="i"
                  class="text-left text-no-wrap"
                >
                  {{ item[col.value] | money }}
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
import { shortcuts } from '@/utils';
import FieldFilter from '@/components/FieldFilter';
import XLSX from 'xlsx';
import { money, formatDate, moneyColor, ratioColor } from '@/filters/custom';
import _ from 'lodash'

import api from '@/api';
export default {
  name: 'Player',
  components: { FieldFilter },
  data() {
    return {
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      desserts: [],
      searchOption: { date: [], created: [] },
      summary: {},
      searchShow: true,
      loading: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['regtime'],
        sortDesc: [true],
      },
      headers: [
        {
          lang: 'report_players_headers_name',
          text: '用户帐号',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: '手动余额增加',
          text: '手动余额增加',
          value: 'balancePlus',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: '手动余额减少',
          text: '手动余额减少',
          value: 'balanceMinus',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_affs',
          text: '代理',
          value: 'affs',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_deposit',
          text: '总存',
          value: 'deposit',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_withdrawal',
          text: '总取',
          value: 'withdrawal',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_balance',
          text: '总余额',
          value: 'balance',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_bet_amount',
          text: '总投注',
          value: 'bet_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_payout_amount',
          text: '总派彩',
          value: 'payout_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_result_amount',
          text: '总输赢(投-派)',
          value: 'result_amount',
          sortable: true,
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
          lang: 'report_players_headers_promote_amount',
          text: '已领取赠金',
          value: 'balancePromotion',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_regtime',
          text: '注册时间',
          value: 'regtime',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_players_headers_regip',
          text: '注册IP',
          value: 'regip',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_profile_textfield_lastTime',
          text: '最后登录时间',
          value: 'lastime',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
      ],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    player() {
      return this.$store.getters.playerId;
    },
    headerComputed() {
      return this.headers
        .filter(item => item.show)
        .map(item => {
          item.text = this.$t(item.lang);
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
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    _export(evt) {
      const params = { ...this.searchOption };
      params.page = 1;
      params.num = this.pagination.totalItems;
      params.sort = this.pagination.sortBy[0];
      params.asc = !this.pagination.sortDesc[0];
      if (params.created && params.created.length > 0) {
        params.cs = params.created[0];
        params.ce = params.created[1];
      }
      if (params.date && params.date.length > 0) {
        params.ds = params.date[0];
        params.de = params.date[1];
      }
      api
        .get('/report/player', params)
        .then(data => {
          if (data.players == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headerComputed.forEach(v => {
              cols.push(v.text);
              if (v.value == 'name') {
                cols.push('名字');
              }
            });
            _export.push(cols);

            data.players.forEach(row => {
              const tmp = [];
              this.headerComputed.forEach(col => {
                if (/^(regtime|lastime)$/.test(col.value)) {
                  tmp.push(formatDate(row[col.value]));
                } else if (/^(name)$/.test(col.value)) {
                  tmp.push(row.name);
                  tmp.push(row.username);
                } else if (/^\d+\.\d+$/.test(row[col.value])) {
                  tmp.push(parseFloat(row[col.value], false));
                } else {
                  tmp.push(row[col.value] || '-');
                }
              });
              _export.push(tmp);
            });
            _export.push([]);
            _export.push([]);
            _export.push([
              '',
              '',
              '',
              '',
              '',
              `${this.$t('g_statics_totalDeposits')}${money(data.total_amount.deposit, false)}`,
              `${this.$t('g_statics_totalWithdrawals')}${money(data.total_amount.withdrawal, false)}`,
              `${this.$t('g_statics_totalBalance')}${money(data.total_amount.amount, false)}`,
              `${this.$t('g_statics_totalBet')}${money(data.total_amount.bet_amount, false)}`,
              `${this.$t('g_statics_totalRewards')}${money(data.total_amount.promote_amount, false)}`,
              `${this.$t('g_statics_totalPayout')}${money(data.total_amount.payout_amount, false)}`,
              `${this.$t('g_statics_totalWinloss')}${money(data.total_amount.result_amount, false)}`,
              `${this.$t('g_statics_totalPlayers')}${data.total}`,
            ]);

            const ws = XLSX.utils.aoa_to_sheet(_export);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
            const d = new Date().Format('yyyyMMdd');
            XLSX.writeFile(wb, `${+d}玩家报表.xlsx`);
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      this.searchOption.sort = this.pagination.sortBy[0];
      this.searchOption.asc = !this.pagination.sortDesc[0];
      const params = { ...this.searchOption };
      if (params.created && params.created.length > 0) {
        params.cs = params.created[0];
        params.ce = params.created[1];
      }
      if (params.date && params.date.length > 0) {
        params.ds = params.date[0];
        params.de = params.date[1];
      }
      api
        .get('/report/player', params)
        .then(data => {
          this.desserts = data.players ? data.players : [];
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.summary = data.total_amount;
          this.summary.users = data.total;
          this.loading = false;
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
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else {
          this.searchOption[i] = null;
        }
      });
    },
  },
};
</script>
