<template>
  <div class="AffiliateBalance">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> group </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋  匯出 展開按鈕 -->
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
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.uid"
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
              v-model="searchOption.uname"
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
            <v-select
              v-model="searchOption.optype"
              :items="optypes"
              item-text="name"
              item-value="t"
              :label="$t('affiliate_balanceHistory_type')"
              solo
              clearable
              hide-details
              persistent-hint
              return-object
              single-line
            ></v-select>
          </v-col>
          <v-col cols="3">
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
              <td class="text-left text-no-wrap">{{ item.aname }} ({{ item.aid }})</td>
              <td class="text-center text-no-wrap">
                <v-chip v-if="item.amount > 0" label outlined small color="red"> {{ $t('affiliate_balanceHistory_increase') }} </v-chip>
                <v-chip v-else label outlined small color="green"> {{ $t('affiliate_balanceHistory_decrease') }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.amount }}</td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.remark }}</td>
              <td class="text-left text-no-wrap">{{ item.name }}</td>
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

export default {
  name: 'AffiliateBalance',
  components: {},
  data() {
    return {
      shortcuts,
      datePickerOptions: {
        shortcuts,
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
      optypes: [
        { name: this.$t('affiliate_balanceHistory_increase'), t: '1' },
        { name: this.$t('affiliate_balanceHistory_decrease'), t: '-1' },
      ],
      searchOption: {
        date: [],
      },
      headers: [
        {
          lang: 'affiliate_balanceHistory_header_info',
          text: '代理信息',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_balanceHistory_header_increase',
          text: '增/减',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_balanceHistory_header_amount',
          text: '金额',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_balanceHistory_header_time',
          text: '调整时间',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_balanceHistory_header_remark',
          text: '备注',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_balanceHistory_header_by',
          text: '操作人',
          value: '',
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
  },
  created() {
    this.loadData(1);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      const $this = this;
      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = $this.pagination.itemsPerPage;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0];
        this.searchOption.e = this.searchOption.date[1];
      }
      api
        .get('/affiliate/balance', this.searchOption)
        .then(data => {
          this.desserts = data.changed;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      const $this = this;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0];
        this.searchOption.e = this.searchOption.date[1];
      }
      api
        .get('/affiliate/balance/export', this.searchOption)
        .then(data => {
          if (data.changed == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.changed.forEach(v => {
              const tmp = [];
              tmp.push(`${v.aname}(${v.aid})`);
              if (v.amount > 0) {
                tmp.push(this.$t('affiliate_balanceHistory_increase'));
              } else {
                tmp.push(this.$t('affiliate_balanceHistory_decrease'));
              }
              tmp.push(v.amount);
              tmp.push(formatDate(v.created));
              tmp.push(v.remark);
              tmp.push(v.name);
              _export.push(tmp);
            });
            exportXLSX(_export, this.$t('affiliate_balanceHistory_title'));
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
