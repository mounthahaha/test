<template>
  <div class="Balance">
    <v-container fluid class="pa-0 ma-0">
      <!-- 搜尋 -->
      <v-card elevation="0" class="pa-3 mb-3" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <v-col cols="4">
            <v-select v-model="searchOption.type" :items="types" hide-details solo persistent-hint single-line> </v-select>
          </v-col>
          <v-col cols="4">
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
          <!-- 搜尋 重置 下載 按鈕 -->
          <v-col cols="4">
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
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="green">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalDeposits') }}</span>
              <span class="text-h5 font-weight-bold">{{ (pagination.summary ? pagination.summary['deposit'] : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="red">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalWithdrawals') }}</span>
              <span class="text-h5 font-weight-bold">{{ (pagination.summary ? pagination.summary['withdrawal'] : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="blue">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>總入金 - 總出金</span>
              <span class="text-h5 font-weight-bold">{{ (pagination.summary ? pagination.summary['diff'] : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="Trades"
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
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <td class="text-left text-no-wrap">{{ item.username }}</td>
                <td class="text-center text-no-wrap">
                  <v-chip v-if="item.type == 1" label outlined small color="green"> {{ $t('g_deposit') }} </v-chip>
                  <v-chip v-else label outlined small color="blue"> {{ $t('g_withdraw') }} </v-chip>
                </td>
                <td>
                  <template v-if="item.bank_name"> {{ item.bank_name }} </template>
                  <template v-else> -- </template>
                </td>
                <td class="text-center text-no-wrap">
                  <v-chip v-if="item.status == 1" label outlined small color="green "> {{ $t('g_status_complete') }} </v-chip>
                  <template v-if="item.type == 1">
                    <v-chip v-if="item.status == 2" label outlined small color="red"> {{ $t('g_status_unpaid') }} </v-chip>
                    <v-chip v-if="item.status == 3" label outlined small color="red"> {{ $t('g_status_abnormalOrder') }} </v-chip>
                  </template>
                  <template v-if="item.type == 2">
                    <v-chip v-if="item.status == 2" label outlined small color="red"> {{ $t('g_withdraw_type_rejected') }} </v-chip>
                  </template>
                </td>
                <td class="text-left text-no-wrap">{{ item.sn }}</td>
                <td class="text-left text-no-wrap">
                  <span v-if="item.pay_type==7">{{ item.usdt_amount1 | money }}</span>
                  <span v-else>{{ item.amount | money }}</span>
                </td>
                <td class="text-left text-no-wrap">
                  <span v-if="item.pay_type==7">{{ item.unit  }}</span>
                  <span v-else>/</span>                  
                </td>
                <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
                <td class="text-left text-no-wrap">{{ item.updated | formatDate }}</td>
                <td class="text-left text-no-wrap">{{ item.note }}</td>
                <td class="text-left text-no-wrap">{{ item.admin ? item.admin : '--' }}</td>
              </tr>
            </tbody>
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
import { shortcuts, exportXLSX } from '@/utils';
import { formatDate, money, hiddenPhoneNumber } from '@/filters/custom';

export default {
  name: 'Balance',
  props: {
    userId: {
      type: Number,
      default: 0,
    },
    player: {
      type: Object,
      default: () => {},
    },
    shortcuts: {
      type: Array,
      default: () => [],
    },
    exportXLSX: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      datePickerOptions: {
        shortcuts,
      },
      loading: false,
      Trades: [],
      searchOption: {
        type: 0,
        date: [],
      },
      pagination: {
        length: 0,
        itemsPerPage: 25,
        sortBy: ['created'],
        sortDesc: [true],
        summary: {},
        page: 1,
      },
      headers: [
        {
          lang: 'g_table_column_username',
          text: '用户名',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_withdrawDeposit',
          text: '出入金',
          value: 'type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_detail_balance_headers_channel',
          text: '渠道',
          value: 'bank_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'status',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_detail_balance_headers_code',
          text: '查询码',
          value: 'sn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_RMB_amount',
          text: '申请人民币金额',
          value: 'amount',
          type: 'number',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_USDT_amount',
          text: '申请U金额',
          value: 'unit',
          type: 'number',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_created',
          text: '申请时间',
          value: 'created',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_updated',
          text: '完成时间',
          value: 'updated',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'note',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_admin',
          text: '处理人',
          value: 'admin',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
    };
  },
  computed: {
    types() {
      return [
        {
          text: this.$t('g_select'),
          value: 0,
        },
        {
          text: this.$t('g_deposit'),
          value: 1,
        },
        {
          text: this.$t('g_withdraw'),
          value: 2,
        },
      ];
    },
    headerComputed() {
      return this.headers.map(item => {
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
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    this.loadData(this.pagination.page);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.pagination.page = p;
      this.loading = true;
      const params = {
        page: p,
        num: this.pagination.itemsPerPage,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        ...this.searchOption,
      };
      if (params.date && params.date.length > 0) {
        params.s = params.date[0];
        params.e = params.date[1];
      }
      api
        .get(`/player/trades/${this.userId}`, params)
        .then(data => {
          this.Trades = data.trades == null ? [] : data.trades;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.pagination.summary = data.summary;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else if (i.toLocaleLowerCase().indexOf('type') >= 0) {
          this.searchOption[i] = 0;
        } else {
          this.searchOption[i] = null;
        }
      });
    },
    _export(evt) {
      const $this = this;
      const params = {
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        ...this.searchOption,
      };
      if (params.date && params.date.length > 0) {
        params.s = params.date[0];
        params.e = params.date[1];
      }
      api
        .get(`/player/trades/export/${this.userId}`, params)
        .then(data => {
          if (data.trades == null) {
            $this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            $this.headers.forEach(v => {
              if (v.text !== '操作') {
                cols.push(v.text);
              }
            });
            _export.push(cols);
            data.trades.forEach(item => {
              const tmp = [];
              tmp.push(item.username);
              tmp.push(item.type == 1 ? `入金` : `出金`);
              tmp.push(item.bank_name) ? item.bank_name : `--`;
              tmp.push(item.status);
              tmp.push(item.sn);
              tmp.push(parseFloat(item.amount, false));
              tmp.push(item.created);
              tmp.push(item.updated);
              tmp.push(item.note);
              tmp.push(item.admin ? item.admin : '--');
              _export.push(tmp);
            });
            exportXLSX(_export, '玩家出入金列表');
          }
        })
        .catch(error => {
          console.log(error);
          $this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
