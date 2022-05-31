<template>
  <div class="Fada">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 下載 按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="_export">
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_export') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="logs"
          item-key="month"
          :loading="loading"
          :options.sync="pagination"
          class="elevation-0 user-daily"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-center text-no-wrap">
                <v-btn
                  v-if="detail != item.month"
                  text
                  color="blue-grey"
                  small
                  depressed
                  class="x-small white--text ma-0"
                  @click.prevent="detail = item.month"
                >
                  {{ $t('g_btn_expand') }}
                  <v-icon dark small>expand_more</v-icon>
                </v-btn>
                <v-btn v-else text color="blue-grey" small depressed class="x-small white--text ma-0" @click.prevent="detail = ''">
                  {{ $t('g_btn_close') }}
                  <v-icon dark small>expand_less</v-icon>
                </v-btn>
              </td>
              <td class="text-left text-no-wrap">{{ item.month }}</td>
              <td class="text-right text-no-wrap">{{ item.deposit | money }}</td>
              <td class="text-right text-no-wrap">{{ item.withdrawal | money }}</td>
              <td class="text-right text-no-wrap">{{ item.bet | money }}</td>
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="item.payout | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="item.result | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="item.eff_bet | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="item.eff_payout | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="item.eff_result | moneyColor" />
              <td class="text-right text-no-wrap">{{ item.trading_result | money }}</td>
              <td class="text-right text-no-wrap">{{ (parseFloat(item.fee) > 0 ? parseFloat(item.fee) : 0) | money }}</td>
              <td class="text-right text-no-wrap">{{ item.deposit_fee | money }}</td>
              <td class="text-right text-no-wrap">{{ item.commission_result2 | money }}</td>
              <td class="text-right text-no-wrap">
                {{
                  (parseFloat(item.eff_result) -
                    parseFloat(item.trading_result) -
                    parseFloat(item.commission_result2) -
                    parseFloat(item.deposit_fee))
                    | money
                }}
              </td>
            </tr>
            <tr v-for="(subitem, i) in item.details" v-show="item.month == detail" :key="`${item.month}_${i}`">
              <td class="text-center text-no-wrap">--</td>
              <td class="text-left text-no-wrap">{{ subitem.month }}</td>
              <td class="text-right text-no-wrap">{{ subitem.deposit | money }}</td>
              <td class="text-right text-no-wrap">{{ subitem.withdrawal | money }}</td>
              <td class="text-right text-no-wrap">{{ subitem.bet | money }}</td>
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="subitem.payout | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="subitem.result | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="subitem.eff_bet | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="subitem.eff_payout | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="subitem.eff_result | moneyColor" />
              <td class="text-right text-no-wrap" nowrap :inner-html.prop="subitem.trading_result | moneyColor" />
              <td class="text-right text-no-wrap">{{ (parseFloat(subitem.fee) > 0 ? parseFloat(subitem.fee) : 0) | money }}</td>
              <td class="text-right text-no-wrap">{{ subitem.deposit_fee | money }}</td>
              <td class="text-right text-no-wrap">{{ subitem.commission_result2 | money }}</td>
              <td class="text-right text-no-wrap">
                {{
                  (parseFloat(subitem.eff_result) -
                    parseFloat(subitem.trading_result) -
                    parseFloat(subitem.commission_result2) -
                    parseFloat(subitem.deposit_fee))
                    | money
                }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { exportXLSX } from '@/utils';
import { money, formatDate } from '@/filters/custom';

export default {
  name: 'Fada',
  data() {
    return {
      logs: [],
      loading: false,
      detail: '',
      details: [],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 31,
        sortBy: ['date'],
        sortDesc: [true],
        totalItems: 0,
      },
      headers: [
        {
          lang: 'report_operatingData_header_detail',
          text: '详情',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'report_operatingData_header_month',
          text: '统计时间',
          value: 'month',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_operatingData_header_deposit',
          text: '入金',
          value: 'deposit',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_withdrawal',
          text: '出金',
          value: 'withdrawal',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_bet',
          text: '总投',
          value: 'bet',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_payout',
          text: '总派彩',
          value: 'payout',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_result',
          text: '总利润',
          value: 'result',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_eff_bet',
          text: '有效流水',
          value: 'eff_bet',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_eff_payout',
          text: '有效派彩',
          value: 'eff_payout',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_eff_result',
          text: '有效利润',
          value: 'eff_result',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_trading_result',
          text: '流水抽成',
          value: 'trading_result',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_fee',
          text: '游戏费',
          value: 'fee',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_deposit_fee',
          text: '支付手续费',
          value: 'deposit_fee',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_commission_result2',
          text: '利润结算(2级）',
          value: 'commission_result2',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
        },
        {
          lang: 'report_operatingData_header_result_amount',
          text: '平台利润(2级)',
          value: 'result_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'right',
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
        item.text = this.$t(item.lang);
        return item;
      });
    },
  },
  watch: {
    detail(n) {
      if (n != '') {
        this.loadData(n);
      }
    },
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    loadData(n) {
      const $this = this;
      $this.loading = true;
      api
        .get('/report/fada', {
          date: this.detail,
        })
        .then(data => {
          if (data == null) {
            data = [];
          }
          if ($this.detail != '') {
            const target = $this.logs.find(item => {
              return item.month == this.detail;
            });
            target.details = data;
          } else {
            $this.logs = data;
          }
          $this.loading = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      const $this = this;
      api
        .get('/report/fada', {
          date: this.detail,
        })
        .then(data => {
          if (data == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.forEach(v => {
              const tmp = [];
              tmp.push('');
              tmp.push(v.month);
              tmp.push(parseFloat(money(v.deposit, false)));
              tmp.push(parseFloat(money(v.withdrawal, false)));
              tmp.push(parseFloat(money(v.bet, false)));
              tmp.push(parseFloat(money(v.payout, false)));
              tmp.push(parseFloat(money(v.result, false)));
              tmp.push(parseFloat(money(v.eff_bet, false)));
              tmp.push(parseFloat(money(v.eff_payout, false)));
              tmp.push(parseFloat(money(v.eff_result, false)));
              tmp.push(parseFloat(money(v.trading_result, false)));
              if (parseFloat(v.fee) > 0) {
                tmp.push(parseFloat(money(v.fee, false)));
              } else {
                tmp.push(0);
              }
              tmp.push(parseFloat(money(v.deposit_fee, false)));
              tmp.push(parseFloat(money(v.commission_result2, false)));
              tmp.push(
                parseFloat(
                  money(
                    parseFloat(v.eff_result) - parseFloat(v.trading_result) - parseFloat(v.commission_result2) - parseFloat(v.deposit_fee),
                    false,
                  ),
                ),
              );
              _export.push(tmp);
            });
            exportXLSX(_export, this.$t(`sidebar_${this.$route.name}`));
          }
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
