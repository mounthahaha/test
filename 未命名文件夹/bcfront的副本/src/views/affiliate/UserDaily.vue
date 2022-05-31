<template>
  <div class="UserDaily">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> group </v-icon>
      <v-toolbar-title>{{ date }} {{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 展開按鈕 -->
      <!-- <v-btn color="primary" @click="settleDaily" :loading="setting" :disabled="setting" v-if="showBtn">
        <v-icon>done</v-icon> {{ date }} 代理结算
        <span slot="loader">正在结算...</span>
      </v-btn> -->
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
        <v-date-picker
          v-model="date"
          full-width
          locale="zh-cn"
          :event-color="inSet"
          :events="noSet"
          :allowed-dates="allowedDates"
          :max="max"
          :min="min.Format('yyyy-MM-dd')"
          :show-current="false"
          :picker-date.sync="pickerDate"
        ></v-date-picker>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :options.sync="pagination"
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
              <td class="text-center text-no-wrap">
                <v-menu v-if="item.adjustment != 1" top offset-y>
                  <template #activator="{ on }">
                    <v-btn color="primary" depressed dark small class="x-small" v-on="on"> {{ $t('g_column_action') }} </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="confirmDaily(item)">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="green lighten-1 white--text">check_circle_outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>{{ $t('g_btn_confirm') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="showNote(item, $event)">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="error lighten-1 white--text">check_circle_outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>{{ $t('affiliate_monthly_settlement') }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <template v-else> -- </template>
              </td>
              <td class="text-left text-no-wrap">
                <a class="text-decoration-none" @click.prevent="$store.commit('PLAYER', item.user_id)">{{ item.name }}</a>
              </td>
              <td class="text-left text-no-wrap">{{ item.aff_name }}</td>
              <td class="text-left text-no-wrap">{{ item.stat_time | formatDay }}</td>
              <td class="text-left text-no-wrap">{{ item.system_code }}</td>
              <td class="text-left text-no-wrap">
                <v-chip v-if="parseFloat(config['all_multiple']) >= item.all_multiple" label small class="white--text green">
                  {{ item.all_multiple | money }}
                </v-chip>
                <v-chip v-else label small class="white--text orange"> {{ item.all_multiple | money }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">
                <v-chip v-if="item.abnormal == 1" label small class="white--text orange"> {{ $t('g_status_abnormal') }} </v-chip>
                <v-chip v-else label small class="white--text green"> {{ $t('g_status_normal') }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.bet_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.payout_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.result_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.effective_bet_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.effective_payout_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.effective_result_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.cashback | money }}</td>
              <td class="text-left text-no-wrap">{{ item.capital | money }}</td>
              <td class="text-left text-no-wrap">
                <v-chip v-if="item.adjustment == 0" label small class="white--text grey"> {{ $t('g_status_unconfirmed') }} </v-chip>
                <v-chip v-else label small class="white--text green"> {{ $t('g_status_confirmed') }} </v-chip>
              </td>
            </tr>
          </template>
        </v-data-table>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <!-- <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div> -->
        </div>
      </v-card>
    </v-container>

    <!-- 備註彈窗 -->
    <v-menu
      v-model="note.show"
      :close-on-content-click="false"
      :nudge-width="300"
      right
      :nudge-left="50"
      :position-x="note.x"
      :position-y="note.y"
      absolute
      offset-y
    >
      <v-card>
        <v-list>
          <v-list-item avatar>
            <v-list-item-content>
              <v-list-item-title>{{ $t('affiliate_monthly_settlement') }}</v-list-item-title>
              <v-list-item-subtitle>{{ order.name }} （{{ order.stat_time | formatDay }}）</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn class="primary--text" icon>
                <v-icon>favorite</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-card class="transparent">
          <v-card-text class="py-0">
            <v-layout wrap>
              <v-flex md12 py-1>
                <v-text-field
                  v-model="order.effective_bet_amount"
                  :label="$t('affiliate_userdaily_textfield_effectiveBet')"
                  hide-details
                ></v-text-field>
              </v-flex>
              <v-flex md12 pb-1>
                <v-text-field
                  v-model="order.effective_payout_amount"
                  :label="$t('affiliate_userdaily_textfield_effectivePayout')"
                  hide-details
                ></v-text-field>
              </v-flex>
              <v-flex md12 pb-1>
                <v-text-field
                  v-model="order.effective_result_amount"
                  :label="$t('affiliate_userdaily_textfield_effectiveResult')"
                  hide-details
                ></v-text-field>
              </v-flex>
              <v-flex md12 pb-1>
                <v-textarea v-model="order.note" value="" hide-details :placeholder="$t('affiliate_userdaily_textfield_remark')"></v-textarea>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text class="x-small" @click="note.show = false">{{ $t('g_btn_cancel') }}</v-btn>
          <v-btn color="primary" depressed class="x-small" text @click="saveNote">{{ $t('g_btn_save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'Userdaily',
  components: {},
  data() {
    return {
      date: null,
      dates: [],
      max: new Date().Format('yyyy-MM-dd'),
      min: new Date('2018-08-17'),
      today: '',
      setting: false,
      pickerDate: null,
      order: {},
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      searchShow: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
      },
      desserts: [],
      showBtn: false,
      headers: [
        {
          lang: 'affiliate_userdaily_header_action',
          text: '操作',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_name',
          text: '用戶',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_affiliate',
          text: '代理',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_date',
          text: '日期',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_platform',
          text: '游戏平台',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_flowRate',
          text: '流水倍数',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_multipleAbnormal',
          text: '多码异常',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_totalBet',
          text: '总投',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_totalPayout',
          text: '总派彩',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_winLoss',
          text: '输赢',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_effectiveBet',
          text: '有效投注',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_effectivePayout',
          text: '有效派彩',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_effectiveWinLoss',
          text: '输赢',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_rebate',
          text: '返水',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_amount',
          text: '当日本金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_userdaily_header_confirm',
          text: '确认？',
          value: 'adjustment',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang) || item.text;
        return item;
      });
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadUserDaily(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadUserDaily(this.pagination.page);
    },
    pickerDate(val) {
      this.loadCalendar(val);
    },
    date(n) {
      if (n != null) {
        this.loadUserDaily(1);
      }
    },
  },
  beforeMount() {
    // this.loadCalendar()
  },
  created() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    this.today = date;
  },
  methods: {
    showNote(item, e) {
      e.preventDefault();
      this.note.show = false;
      this.note.x = e.clientX;
      this.note.y = e.clientY;
      this.$nextTick(() => {
        this.order = item;
        this.note.show = true;
      });
    },
    saveNote() {
      const $this = this;
      if ($this.order.note == '') {
        $this.$store.commit('MsgError', this.$t('g_remark_error'));
        return false;
      }
      api
        .post(`/affiliate/userdaily/${$this.order.id}`, {
          note: $this.order.note,
          bet: parseFloat($this.order.effective_bet_amount),
          payout: parseFloat($this.order.effective_payout_amount),
          result: parseFloat($this.order.effective_result_amount),
        })
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.note.show = false;
          $this.loadUserDaily(1);
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    settleDaily() {
      const $this = this;
      this.$store.commit('Confirm', {
        text: `${this.$t('affiliate_userdaily_msgConfirmSattle_1')}${$this.date}${this.$t('affiliate_userdaily_msgConfirmSattle_2')}`,
        ok() {
          $this.setting = true;
          api
            .post(`/affiliate/adaily/${$this.date}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgCalculated'));
              $this.loadCalendar($this.pickerDate);
              $this.setting = false;
              $this.desserts = [];
              $this.showBtn = false;
            })
            .catch(error => {
              $this.setting = false;
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    confirmDaily(item) {
      const $this = this;
      this.$store.commit('Confirm', {
        text: this.$t('affiliate_userdaily_msgConfirmDaily'),
        ok() {
          api
            .put(`/affiliate/userdaily/${item.id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgConfirmed'));
              $this.loadUserDaily(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    loadUserDaily(p) {
      const $this = this;
      const param = {
        page: p,
        num: $this.pagination.itemsPerPage,
        date: $this.date,
      };
      api
        .get('/affiliate/userdaily', param)
        .then(data => {
          $this.desserts = data.result.daily ? data.result.daily : [];
          $this.pagination.length = data.result.pageNums;
          $this.pagination.totalItems = data.result.total;
          $this.loading = false;
          // $this.showBtn = data.result.show
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    loadCalendar(date) {
      const $this = this;
      api
        .get('/affiliate/calendar', {
          date,
        })
        .then(data => {
          this.dates = data.result ? data.result : [];
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    noSet(date) {
      const cur = new Date(date);
      return cur < this.today && cur > this.min;
    },
    inSet(date) {
      if (this.dates.indexOf(date) >= 0) {
        return 'green';
      }
      return 'red';
    },
    allowedDates(date) {
      return this.dates.indexOf(date) < 0 && date != this.today.Format('yyyy-MM-dd');
    },
  },
};
</script>
<style>
.user-daily table.v-table tbody td,
table.v-table tbody th {
  height: 24px;
}
.user-daily table.v-table tbody td:first-child,
.user-daily table.v-table tbody td:not(:first-child),
.user-daily table.v-table tbody th:first-child,
.user-daily table.v-table tbody th:not(:first-child),
.user-daily table.v-table thead td:first-child,
.user-daily table.v-table thead td:not(:first-child),
.user-daily table.v-table thead th:first-child,
.user-daily table.v-table thead th:not(:first-child) {
  padding: 0 12px;
}
</style>
