<template>
  <div class="ExportRecords">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 展開按鈕 -->
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
              v-model="searchOption.remit_name"
              :label="$t('report_exportRecords_columns_remit_name')"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.remittance_type"
              :label="$t('report_exportRecords_columns_remittance_type')"
              clearable
              :items="remittanceTypeList"
              item-value="remittance_type"
              item-text="text"
              solo
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="4">
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
        </v-row>
      </v-card>

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
              <template v-for="(field, i) in headerComputed">
                <td v-if="/^remit_name$/.test(field.value)" :key="`${field.value}_${i}`">{{ item.remit_name }}</td>
                <td v-else-if="/^remittance_type$/.test(field.value)" :key="`${field.value}_${i}`" class="text-left text-no-wrap">
                  <v-chip v-if="item.remittance_type == '玩家列表'" label small dark codark lor="blue-grey"> {{ $t('sidebar_playerList') }} </v-chip>
                  <v-chip v-if="item.remittance_type == '入金列表'" label small dark color="green">{{ $t('sidebar_financeDeposit') }}</v-chip>
                  <v-chip v-if="item.remittance_type == '出金列表'" label small dark color="purple"> {{ $t('sidebar_financeWithdrawal') }} </v-chip>
                  <v-chip v-if="item.remittance_type == '玩家报表'" label small dark color="indigo">{{ $t('sidebar_reportPlayer') }}</v-chip>
                  <v-chip v-if="item.remittance_type == '游戏记录'" label small dark color="blue">{{ $t('sidebar_reportGameLogs') }}</v-chip>
                  <v-chip v-if="item.remittance_type == '数据汇总'" label small dark color="teal"> {{ $t('sidebar_reportPlatformTotal') }} </v-chip>
                  <v-chip v-if="item.remittance_type == '游戏报表'" label small dark color="black">{{ $t('sidebar_reportGame') }}</v-chip>
                  <v-chip v-if="item.remittance_type == '支付报表'" label small dark color="brown">{{ $t('sidebar_reportPay') }}</v-chip>
                  <v-chip v-if="item.remittance_type == '经营数据'" label small dark color="orange accent-4">{{ $t('sidebar_reportFada') }}</v-chip>
                  <v-chip v-if="item.remittance_type == '玩家余额'" label small dark color="yellow darken-4">
                    {{ $t('sidebar_reportBalance') }}
                  </v-chip>
                  <v-chip v-if="item.remittance_type == '余额调整记录'" label small dark color="pink">{{ $t('sidebar_playerBalance') }}</v-chip>
                  <v-chip v-if="item.remittance_type == '示警用户名单'" label small dark color="red darken-4">
                    {{ $t('sidebar_riskWarning') }}
                  </v-chip>
                  <v-chip v-if="item.remittance_type == 'IP限制管理'" label small dark color="indigo darken-4">
                    {{ $t('sidebar_systemRestrictions') }}
                  </v-chip>
                  <v-chip v-if="item.remittance_type == '代理列表'" label small dark color="grey darken-1">
                    {{ $t('sidebar_affiliateList') }}
                  </v-chip>
                  <v-chip v-if="item.remittance_type == '代理流水'" label small dark color="grey darken-2">
                    {{ $t('sidebar_affiliateDaily') }}
                  </v-chip>
                  <v-chip v-if="item.remittance_type == '代理出金列表'" label small dark color="grey darken-3">
                    {{ $t('sidebar_affiliateWithdrawal') }}
                  </v-chip>
                  <v-chip v-if="item.remittance_type == '代理余额调整历史'" label small dark color="grey darken-4">
                    {{ $t('sidebar_affiliateBalance') }}
                  </v-chip>
                </td>
                <td v-else-if="/^created$/.test(field.value)" :key="`${field.value}_${i}`" class="text-left text-no-wrap">
                  {{ item.created | formatDate }}
                </td>
                <td v-else :key="`${field.value}_${i}`" class="text-left text-no-wrap">{{ item[field.value] }}</td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} 笔</span>
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
import { shortcuts } from '@/utils';
import { formatDate } from '@/filters/custom';
import _ from 'lodash'

export default {
  name: 'ExportRecords',
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      desserts: [],
      searchShow: true,
      loading: false,
      searchOption: {
        remit_name: '',
        remittance_type: '全部',
        date: null,
      },
      remittanceTypeList: [
        { remittance_type: '全部', text: this.$t('g_all') },
        { remittance_type: '玩家列表', text: this.$t('sidebar_playerList') },
        { remittance_type: '入金列表', text: this.$t('sidebar_financeDeposit') },
        { remittance_type: '出金列表', text: this.$t('sidebar_financeWithdrawal') },
        { remittance_type: '玩家报表', text: this.$t('sidebar_reportPlayer') },
        { remittance_type: '游戏记录', text: this.$t('sidebar_reportGameLogs') },
        { remittance_type: '数据汇总', text: this.$t('sidebar_reportPlatformTotal') },
        { remittance_type: '游戏报表', text: this.$t('sidebar_reportGame') },
        { remittance_type: '支付报表', text: this.$t('sidebar_reportPay') },
        { remittance_type: '经营数据', text: this.$t('sidebar_reportFada') },
        { remittance_type: '玩家余额', text: this.$t('sidebar_reportBalance') },
        { remittance_type: '余额调整记录', text: this.$t('sidebar_playerBalance') },
        { remittance_type: '示警用户名单', text: this.$t('sidebar_riskWarning') },
        { remittance_type: 'IP限制管理', text: this.$t('sidebar_systemRestrictions') },
        { remittance_type: '代理列表', text: this.$t('sidebar_affiliateList') },
        { remittance_type: '代理流水', text: this.$t('sidebar_affiliateDaily') },
        { remittance_type: '代理出金列表', text: this.$t('sidebar_affiliateWithdrawal') },
        { remittance_type: '代理余额调整历史', text: this.$t('sidebar_affiliateBalance') },
      ],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['created'],
        sortDesc: [true],
        totalItems: 0,
      },
      headers: [
        {
          lang: 'report_exportRecords_columns_remit_name',
          text: '操作人ID',
          value: 'remit_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_exportRecords_columns_remittance_type',
          text: '报表类型',
          value: 'remittance_type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_exportRecords_columns_export_time',
          text: '汇出时间',
          value: 'created',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
    };
  },
  computed: {
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
    '$route.params'(params) {
      this.searchOption.date = params.date ? this.parseDateRange(params.date) : null;
      this.loadData(1);
    },
  },
  created() {
    this.loadData(1);
  },
  mounted() {
    if (this.$route.params) {
      const params = this.$route.params;
      this.searchOption.date = params.date ? this.parseDateRange(params.date) : null;
    }
    this.loadData(1);
  },
  methods: {
    parseDateRange(date) {
      date += ' 00:00:00';
      const startDate = new Date(date);
      const endDate = new Date(startDate * 1 + 24 * 60 * 60 * 1000);
      return [startDate, endDate];
    },
    // 取得資料
    loadData(p) {
      if (this.loading) {
        return;
      }
      let startTime = '';
      let endTime = '';
      this.loading = true;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        startTime = this.searchOption.date[0] || '';
        endTime = this.searchOption.date[1] || '';
      }
      if (!this.searchOption.remittance_type) {
        this.searchOption.remittance_type = '全部';
      }
      const params = {
        ...this.searchOption,
        endTime,
        startTime,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        page: p,
        num: this.pagination.itemsPerPage,
      };
      api
        .get('/report/exportRecords', params)
        .then(data => {
          this.desserts = data.result.adminRemitList ?? [];
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error);
        });
    },
    // 搜尋重置
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
