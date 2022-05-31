<template>
  <div class="ReportBalance">
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
              v-model="searchOption.aff_name"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_balance_header_aff_name')"
              :placeholder="$t('g_text_field_placeholder_username')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <el-date-picker
              v-model="searchOption.date"
              class="el-vuetify-text-field"
              :range-separator="$t('player_balance_to')"
              :start-placeholder="$t('player_balance_startDate')"
              :end-placeholder="$t('player_balance_endStart')"
              value-format="yyyy-MM-dd"
              style="width: 100%; min-height: 48px"
            >
            </el-date-picker>
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row v-if="isNaN(totalbalance) !== true" dense class="my-0">
        <v-col>
          <v-alert dense dark color="blue" border="left">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('report_balance_totalBalance') }}</span>
              <span class="text-h5 font-weight-bold">{{ totalbalance | money }}</span>
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
          show-all
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left text-no-wrap">{{ item.date | formatDay }}</td>
              <td class="text-left text-no-wrap">
                {{ item.name }}(<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
              </td>
              <td class="text-left text-no-wrap">{{ item.aff_name }}</td>
              <td class="text-left text-no-wrap">{{ item.real_name }}</td>
              <td class="text-left text-no-wrap">{{ item.balance | money }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select
              v-model="pagination.itemsPerPage"
              class="diy-page-select"
              :items="selectItems"
            ></v-select>
          </div>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { formatDay } from '@/filters/custom';
import _ from 'lodash'

export default {
  name: 'ReportBalance',
  data() {
    const yesterday = new Date(new Date() - 24 * 60 * 60 * 1000).Format('yyyy-MM-dd');
    return {
      totalbalance: '-',
      selectItems: [10, 25, 50, 100],
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      desserts: [],
      types: {},
      order: {},
      searchOption: {
        date: yesterday,
      },
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      searchShow: true,
      loading: false,
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['date'],
        sortDesc: [true],
      },
      headers: [
        {
          lang: 'report_balance_header_date',
          text: '日期',
          value: 'date',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_balance_header_username',
          text: '用戶名',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_balance_header_aff_name',
          text: '代理属性',
          value: 'aff_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_balance_header_real_name',
          text: '真实姓名',
          value: 'real_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_balance_header_totalBalance',
          text: '总余额',
          value: 'balance',
          sortable: true,
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
    status() {
      // this.loadData(1)
    },
  },
  created() {
    this.loadData(1);
  },
  methods: {
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      const $this = this;
      const params = {
        ...$this.searchOption,
        page: p,
        num: $this.pagination.itemsPerPage,
        sort: $this.pagination.sortBy[0],
        asc: !$this.pagination.sortDesc[0],
      };
      if (!params.date || !params.date.length) {
        this.$store.commit('MsgError', this.$t('g_selector_date'));
        return;
      }
      $this.loading = true;
      params.s = formatDay(params.date);
      params.e = formatDay(params.date);
      if (params.name) {
        params.name = params.name
          .split(',')
          .map(item => item.trim())
          .join(',');
      }
      api
        .get('/report/balancedaily', params)
        .then(data => {
          $this.desserts = data.result ?? [];
          $this.pagination.length = data.pageNum;
          $this.pagination.totalItems = data.total;
          $this.totalbalance = data.totalbalance;
          $this.loading = false;
        })
        .catch(error => {
          console.log(error);
          $this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      const $this = this;
      const params = {
        ...$this.searchOption,
        page: 1,
        num: $this.pagination.totalItems,
        sort: $this.pagination.sortBy[0],
        asc: !$this.pagination.sortDesc[0],
      };
      if (!params.date || !params.date.length) {
        this.$store.commit('MsgError', this.$t('g_selector_date'));
        return;
      }
      $this.loading = true;
      params.s = formatDay(params.date);
      params.e = formatDay(params.date);
      if (params.name) {
        params.name = params.name
          .split(',')
          .map(item => item.trim())
          .join(',');
      }
      api
        .get('/report/balancedaily', params)
        .then(data => {
          if (data.result == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            _export.push([`${this.$t('report_balance_totalBalance')}${data.totalbalance}`, '', '']);
            _export.push([]);
            _export.push([]);
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.result.forEach(item => {
              const tmp = [];
              tmp.push(formatDay(item.date));
              tmp.push(`${item.name}(${item.user_id})`);
              tmp.push(item.aff_name);
              tmp.push(item.real_name);
              tmp.push(parseFloat(item.balance));
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
<style lang="scss">
.ReportBalance .el-input__inner {
  height: 100%;
}
</style>
