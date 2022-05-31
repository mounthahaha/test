<template>
  <div class="AffiliateMonthly">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> group </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋  展開按鈕 -->
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
          <v-col cols="3">
            <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="30"
              :return-value.sync="searchOption.date"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  v-model="searchOption.date"
                  :label="$t('affiliate_monthly_select_month')"
                  prepend-icon="event"
                  readonly
                  clearable
                  hide-details
                  solo
                  persistent-hint
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="searchOption.date" locale="zh-cn" type="month" @input="$refs.menu2.save(searchOption.date)"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.id"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_balanceHistory_affiliateId')"
              :placeholder="$t('affiliate_balanceHistory_affiliateId')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.name"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_balanceHistory_affiliateName')"
              :placeholder="$t('affiliate_balanceHistory_affiliateName')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.code"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_balanceHistory_header_info')"
              :placeholder="$t('affiliate_balanceHistory_header_info')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="green" style="cursor: pointer" @click="searchOption.status = 0">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('affiliate_monthly_unsettled') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary[0] ? summary[0] : '--' }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="red" style="cursor: pointer" @click="searchOption.status = 1">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t('affiliate_monthly_settled') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary[1] ? summary[1] : '--' }}</span>
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
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
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
                <v-menu top offset-y>
                  <template #activator="{ on }">
                    <v-btn color="primary" depressed dark small class="x-small" v-on="on">
                      {{ $t('g_column_action') }}
                    </v-btn>
                  </template>
                  <v-list-item v-if="item.status == 0">
                    <v-list-item @click="confirmDaily(item)">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="green lighten-1 white--text">check_circle_outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>{{ $t('affiliate_monthly_settle') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="showNote(item, $event)">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="error lighten-1 white--text">check_circle_outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>{{ $t('affiliate_monthly_settlement') }}</v-list-item-title>
                    </v-list-item>
                  </v-list-item>
                </v-menu>
              </td>
              <td class="text-left text-no-wrap">{{ item.name }}</td>
              <td class="text-left text-no-wrap">{{ item.level }}</td>
              <td class="text-left text-no-wrap">{{ item.year_month }}</td>
              <td class="text-left text-no-wrap">{{ item.commission_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.commission_from_sub | money }}</td>
              <td class="text-left text-no-wrap">{{ item.commission_total | money }}</td>
              <td class="text-left text-no-wrap">{{ item.trading_result | money }}</td>
              <td class="text-left text-no-wrap">{{ item.cashback | money }}</td>
              <td class="text-left text-no-wrap">{{ item.result | money }}</td>
              <td class="text-left text-no-wrap">{{ item.final | money }}</td>
              <td class="text-left text-no-wrap">
                <v-chip v-if="item.status == 0" label small class="white--text orange"> {{ $t('affiliate_monthly_status_unsettled') }} </v-chip>
                <v-chip v-if="item.status == 1" label small class="white--text green"> {{ $t('affiliate_monthly_status_settled') }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.total_players }}</td>
              <td class="text-left text-no-wrap">{{ item.total_deposit | money }}</td>
              <td class="text-left text-no-wrap">{{ item.total_withdrawal | money }}</td>
              <td class="text-left text-no-wrap">{{ item.manual_minus | money }}</td>
              <td class="text-left text-no-wrap">{{ item.manual_plus | money }}</td>
            </tr>
          </template>
        </v-data-table>
        <div class="text-center py-2">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
        </div>
      </v-card>

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
                <v-list-item-subtitle>{{ order.name }} （{{ order.year_month }}）</v-list-item-subtitle>
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
                <v-flex md12>
                  <v-text-field v-model="order.final" :label="$t('affiliate_monthly_textfield_settlement')" hide-details></v-text-field>
                </v-flex>
                <v-flex md12>
                  <v-textarea v-model="order.note" value="" hide-details :placeholder="$t('affiliate_monthly_textfield_remark')"></v-textarea>
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
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts } from '@/utils';

export default {
  name: 'Monthly',
  components: {},
  data() {
    return {
      menu2: false,
      shortcuts,
      showSearch: false,
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      searchShow: true,
      loading: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },
      desserts: [],
      order: {},
      searchOption: {
        status: 0,
        date: null,
      },
      summary: {},
      headers: [
        {
          lang: 'affiliate_monthly_header_action',
          text: '操作',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_name',
          text: '代理名字',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_level',
          text: '级别',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_date',
          text: '日期',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_directCommission',
          text: '直属用户佣金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_subCommission',
          text: '下级代理佣金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_totalCommission',
          text: '总佣金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_totalFlow',
          text: '合计流水收益',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_totalRebate',
          text: '合计游戏返水',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_aplusb',
          text: 'A+B 佣金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_monthly',
          text: '月结算',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_status',
          text: '审核状态',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_totalMembers',
          text: '总用户',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_deposits',
          text: '总入金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_withdrawals',
          text: '总出金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_rewards',
          text: '合计客户返利',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_monthly_header_discounts',
          text: '合计用户扣除',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
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
      this.loadData(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
    'searchOption.status'(i) {
      this.loadData(1);
    },
  },
  created() {
    this.loadData(1);
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
      api
        .post(`/affiliate/monthly/note/${$this.order.id}`, {
          note: $this.order.note,
          final: parseFloat($this.order.final),
        })
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.note.show = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    loadData(p) {
      const $this = this;
      $this.loading = true;
      let param = {
        page: p,
        num: $this.pagination.itemsPerPage,
      };
      param = Object.assign(param, $this.searchOption);
      api
        .get('/affiliate/monthly', param)
        .then(data => {
          $this.desserts = data.result.monthly;
          $this.pagination.length = data.result.pageNums;
          $this.pagination.totalItems = data.result.total;
          $this.loading = false;
          $this.summary = data.result.summary;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    confirmDaily(item) {
      const $this = this;
      this.$store.commit('Confirm', {
        text: this.$t('g_msgAuditConfirm'),
        ok() {
          api
            .post(`/affiliate/monthly/${item.id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgAudited'));
              item.status = 1;
              $this.loadData(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
  },
};
</script>
