<template>
  <div class="Transfer">
    <v-container fluid class="pa-0 ma-0">
      <!-- 搜尋 -->
      <v-card elevation="0" class="pa-3 mb-3" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <v-col>
            <v-select v-model="searchOption.type" :items="logTypeItems" hide-details solo persistent-hint single-line> </v-select>
          </v-col>
          <v-col>
            <v-text-field
              v-model="searchOption.min"
              hide-details
              solo
              clearable
              :label="$t('player_detail_transfer_minimum')"
              :placeholder="$t('player_detail_transfer_minimum')"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              v-model="searchOption.max"
              hide-details
              solo
              clearable
              :label="$t('player_detail_transfer_maximum')"
              :placeholder="$t('player_detail_transfer_maximum')"
            ></v-text-field>
          </v-col>
          <v-col>
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
          <v-col>
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

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="Transfers"
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
                <td v-if="/^id$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item[col.value] }}</td>
                <td v-else-if="/^username$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item[col.value] }}</td>
                <td v-else-if="/^type$/.test(col.value)" :key="i" class="text-center text-no-wrap">
                  <v-chip label outlined small color="primary"> {{ logTypes[item[col.value]] }} </v-chip>
                </td>
                <td v-else-if="/^from_to$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item.type == 4">
                    {{ platforms[item.from_pid] }}{{ $t('player_detail_transfer_headers_transferTo') }}{{ platforms[item.to_pid] }}
                  </template>
                  <template v-else> -- </template>
                </td>
                <td
                  v-else-if="/^(amount)$/.test(col.value)"
                  :key="i"
                  class="text-left text-no-wrap"                 
                >
                  <span v-if="item.pay_type==7" :inner-html.prop="item.usdt_amount1 | moneyColor"></span>
                  <span v-else :inner-html.prop="item[col.value] | moneyColor"></span>
                </td>
                <td
                  v-else-if="/^(unit)$/.test(col.value)"
                  :key="i"
                  class="text-left text-no-wrap"                  
                >
                  <!-- <span v-if="item.pay_type==7" :inner-html.prop="item[col.value] | moneyColor"></span> -->
                  <span v-if="item.pay_type==7">{{ item.unit }}</span>                  
                  <span v-else>/</span>
                </td>
                
                <td v-else-if="/^(balance|newBalance)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ parseFloat(item[col.value]) | money }}
                </td>
                <td v-else-if="/^created$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item[col.value] | formatDate }}</td>
                
                <td v-else :key="i" class="text-left text-no-wrap">{{ item[col.value] }}</td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :disabled="loading" :length="pagination.length" :total-visible="15"></v-pagination>
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
import _ from 'lodash'

export default {
  name: 'Transfer',
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
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['id'],
        sortDesc: [true],
      },
      searchOption: {
        type: 0,
        date: [],
      },
      logTypes: [],
      Transfers: [],
      headers: [
        {
          lang: 'g_table_column_id',
          text: '序号',
          value: 'id',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_username',
          text: '用户名',
          value: 'username',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_type',
          text: '类型',
          value: 'type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_detail_transfer_headers_transfer',
          text: '转账',
          value: 'from_to',
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
          lang: 'player_detail_transfer_headers_before',
          text: '之前余额',
          value: 'balance',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_transfer_headers_after',
          text: '之后余额',
          value: 'newBalance',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_date',
          text: '日期',
          value: 'created',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'remark',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
    };
  },
  computed: {
    logTypeItems() {
      const ret = [{ text: this.$t('g_select'), value: 0 }];
      _.each(this.logTypes, (item, i) => {
        ret.push({ text: item, value: i });
      });
      return ret;
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
      this.loading = true;
      this.pagination.page = p;
      const params = {
        ...this.searchOption,
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
      };
      if (params.date && params.date.length > 0) {
        params.s = params.date[0];
        params.e = params.date[1];
      }
      api
        .get(`/player/transfer/${this.userId}`, params)
        .then(data => {
          const { sortBy, sortDesc } = this.pagination;
          this.Transfers = data.transfers ?? [];
          // this.Transfers = data.transfers == null ? [] : _.orderBy(data.transfers, [...sortBy, 'id'], [...sortDesc, 'desc']);
          this.logTypes = data.logtype;
          this.platforms = data.platform;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
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
        page: 1,
        num: this.pagination.totalItems,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        ...this.searchOption,
      };
      if (params.date && params.date.length > 0) {
        params.s = params.date[0];
        params.e = params.date[1];
        delete params.date;
      }
      api
        .get(`/player/transfer/export/${this.userId}`, params)
        .then(data => {
          if (data.transfers == null) {
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
            data.transfers.forEach(item => {
              const tmp = [];
              tmp.push(item.id);
              tmp.push(item.username);
              tmp.push(this.logTypes[item.type]);
              if (item.type == 4) {
                tmp.push(`${this.platforms[item.from_pid]}${this.$t('player_detail_transfer_headers_transferTo')}${this.platforms[item.to_pid]}`)
              } else {
                tmp.push('--')
              }
              tmp.push(item.from_to);
              tmp.push(parseFloat(item.amount, false));
              tmp.push(parseFloat(item.balance, false));
              tmp.push(parseFloat(item.newBalance, false));
              tmp.push(item.created);
              tmp.push(item.remark);
              _export.push(tmp);
            });
            exportXLSX(_export, '玩家余额记录');
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
