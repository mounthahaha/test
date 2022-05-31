<template>
  <div class="PlatformTotal">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>
        <a href="javascript:;" class="text-decoration-none" @click="date = link">{{ date }}</a> {{ $t(`sidebar_${$route.name}`) }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 下載按鈕 -->
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
              <td v-if="item.date.length < 10" class="text-left text-no-wrap" text-decoration-none>
                <a href="javascript:;" class="text-decoration-none" @click="date = item.date">{{ item.date }}</a>
              </td>
              <td v-else class="text-left text-no-wrap">{{ item.date }}</td>
              <td class="text-left text-no-wrap">{{ item.users }}</td>
              <td class="text-left text-no-wrap">{{ item.firstDeposit }}</td>
              <td class="text-left text-no-wrap">{{ item.depositNum }}</td>
              <td class="text-left text-no-wrap">{{ item.deposit | money }}</td>
              <td class="text-left text-no-wrap">{{ item.withdrawal | money }}</td>
              <td class="text-left text-no-wrap">{{ item.bet_amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.payout_amount | money }}</td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.result_amount | moneyColor"></td>
              <!-- <td class="text-left  text-no-wrap">{{ item.balance | money }}</td> -->
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <!-- <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div> -->
        </div>
      </v-card>
    </v-container>
  </div>
</template>
<script>
import api from '@/api';
import { exportXLSX } from '@/utils';
import { money, formatDate } from '../../filters/custom';

export default {
  name: 'PlatformTotal',
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      logs: [],
      loading: false,
      date: '',
      link: '',
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 50,
        sortBy: ['regtime'],
        sortDesc: [true],
      },
      headers: [
        { lang: 'report_total_header_date', text: '时间', value: 'date', sortable: false, class: 'text-no-wrap blue-grey lighten-5', align: 'left' },
        {
          lang: 'report_total_header_users',
          text: '新注册玩家',
          value: 'users',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_total_header_firstDeposit',
          text: '首存玩家',
          value: 'firstDeposit',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_total_header_depositNum',
          text: '存款玩家',
          value: 'depositNum',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_total_header_deposit',
          text: '总存款',
          value: 'deposit',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_total_header_withdrawal',
          text: '总取款',
          value: 'withdrawal',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_total_header_bet_amount',
          text: '总投注',
          value: 'bet_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_total_header_payout_amount',
          text: '总派彩',
          value: 'payout_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_total_header_result_amount',
          text: '总结果',
          value: 'result_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        // {
        //   lang: 'report_total_header_balance',
        //   text: '总余额',
        //   value: 'balance',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        // },
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
    date(n) {
      if (n.length == 4) {
        this.link = '';
      } else if (n.length == 7) {
        this.link = n.slice(0, 4);
      }
      this.loadData(n);
    },
  },
  mounted() {
    this.date = new Date().Format('yyyy-MM');
    // this.loadData(1)
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      const $this = this;
      $this.loading = true;
      api
        .get('/report/platform', { date: this.date })
        .then(data => {
          $this.logs = data == null ? [] : data;
          $this.pagination.length = Math.ceil(data.length / this.pagination.itemsPerPage);
          $this.pagination.totalItems = data.length;
          $this.loading = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      api
        .get('/report/platform', { date: this.date })
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
              tmp.push(v.date);
              tmp.push(v.users);
              tmp.push(v.firstDeposit);
              tmp.push(v.depositNum);
              tmp.push(parseFloat(v.deposit, false));
              tmp.push(parseFloat(v.withdrawal, false));
              tmp.push(parseFloat(v.bet_amount, false));
              tmp.push(parseFloat(v.payout_amount, false));
              tmp.push(parseFloat(v.result_amount, false));
              // tmp.push(money(v.balance)))
              _export.push(tmp);
            });
            exportXLSX(_export, this.$t(`sidebar_${this.$route.name}`));
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
