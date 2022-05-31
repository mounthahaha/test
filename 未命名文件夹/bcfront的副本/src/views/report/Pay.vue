<template>
  <div class="Pay">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
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
          <v-col>
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
          <v-col>
            <datetime-range v-model="searchOption.date" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :options.sync="pagination"
          :footer-props="{
            'items-per-page-options': [10, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item, index }">
            <tr>
              <td class="text-left text-no-wrap">{{ index + 1 }}</td>
              <!-- <td v-if="searchOption['ds'] != '' && searchOption['de'] != ''" class="text-left text-no-wrap">
                {{ searchOption['ds'].substr(0, 10) }} ~ {{ searchOption['de'].substr(0, 10) }}
              </td>
              <td v-else>--</td> -->
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary"> {{ $t('report_pay_deposit') }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary"> {{ item.name }} - {{ item.bank }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.fee | money }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
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
import { shortcuts, exportXLSX } from '@/utils';
import { money, formatDate } from '@/filters/custom';
import _ from 'lodash'

export default {
  name: 'Pay',
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      desserts: [],
      searchOption: { date: [], ds: '', de: '' },
      summary: {},
      searchShow: true,
      loading: false,
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 50,
        sortBy: [],
        sortDesc: [],
      },
      headers: [
        { lang: 'g_table_column_sn', text: '#', value: '', sortable: false, class: 'text-no-wrap blue-grey lighten-5', align: 'left' },
        // { lang: 'g_table_column_date', text: '日期', value: 'name', sortable: false, class: 'text-no-wrap blue-grey lighten-5', align: 'left' },
        {
          lang: 'report_pay_header_transactionType',
          text: '交易类型',
          value: 'deposit',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_pay_header_payType',
          text: '支付类型',
          value: 'bet_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_pay_header_amount',
          text: '金额',
          value: 'amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        { lang: 'report_pay_header_fee', text: '手续费', value: 'fee', sortable: true, class: 'text-no-wrap blue-grey lighten-5', align: 'left' },
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
    'pagination.page'(n, v) {
      this.loadData(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page, this.Status);
    },
    'pagination.sortBy'(n, v) {
      if (n != null) {
        this.loadData(1);
      }
    },
  },
  mounted() {
    // this.loadData(1)
  },
  methods: {
    loadData(p) {
      const $this = this;
      $this.loading = true;
      const params = {
        page: p,
        num: $this.pagination.itemsPerPage,
        sort: $this.pagination.sortBy[0],
        asc: !$this.pagination.sortDesc[0],
        ...$this.searchOption,
      };
      if (params.date && params.date.length > 0) {
        params.ds = params.date[0];
        params.de = params.date[1];
      }
      api
        .get('/report/payment', params)
        .then(data => {
          $this.desserts = data.players ? data.players : [];
          $this.pagination.length = data.pageNums;
          $this.pagination.totalItems = data.total;
          $this.loading = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      const $this = this;
      const params = {
        sort: $this.pagination.sortBy[0],
        asc: !$this.pagination.sortDesc[0],
        ...$this.searchOption,
        num: this.pagination.totalItems
      };
      if (params.date && params.date.length > 0) {
        params.ds = params.date[0];
        params.de = params.date[1];
      }
      api
        .get('/report/payment', params)
        .then(data => {
          if (data.players == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            $this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.players.forEach((v, i) => {
              const tmp = [];
              tmp.push(i);
              // if (params.ds && params.de) {
              //   tmp.push(`${params.ds.substr(0, 10)}~${params.de.substr(0, 10)}`);
              // } else {
              //   tmp.push('--');
              // }
              tmp.push(this.$t('report_pay_deposit'));
              tmp.push(`${v.name} - ${v.bank}`);
              tmp.push(parseFloat(money(v.amount, false)));
              tmp.push(parseFloat(money(v.fee, false)));
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
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else {
          this.searchOption[i] = null;
        }
      });
    },
    checkDateRange(date) {
      if (date && date.length == 2 && date[0] > date[1]) {
        const tmp = date[0];
        date[0] = date[1];
        date[1] = tmp;
      }
    },
  },
};
</script>
