<template>
  <div class="PlayerBehavior">
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
          <v-btn
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="_export"
          >
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("g_export") }}</span>
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
              :label="$t('report_playerBehavior_columns_name')"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.browserhash"
              :label="$t('report_playerBehavior_columns_browserhash')"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="searchOption.mod"
              :label="$t('report_playerBehavior_columns_mod')"
              clearable
              :items="behaviorMod"
              item-value="mod"
              item-text="text"
              solo
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="searchOption.ip"
              :label="$t('report_playerBehavior_columns_ip')"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1)"
            ></v-text-field>
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
                <td v-if="/^name$/.test(field.value)" :key="`${field.value}_${i}`">{{ item.name }}</td>
                <td v-else-if="/^browserhash$/.test(field.value)" :key="`${field.value}_${i}`" class="text-left text-no-wrap">
                  {{ item.browserhash }}
                </td>
                <td v-else-if="/^mod$/.test(field.value)" :key="`${field.value}_${i}`" class="text-left text-no-wrap">
                  <v-chip v-if="item.mod == 1" label dark small color="blue">{{ $t('g_deposit') }}</v-chip>
                  <v-chip v-if="item.mod == 2" label dark small color="red">{{ $t('g_withdraw') }}</v-chip>
                  <v-chip v-if="item.mod == 3" label dark small color="green">{{ $t('g_login') }}</v-chip>
                </td>
                <td v-else-if="/^ip$/.test(field.value)" :key="`${field.value}_${i}`" class="text-left text-no-wrap">{{ item.ip }}</td>
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
import XLSX from 'xlsx';
import { parseTime } from "@/utils";
import _ from 'lodash'

export default {
  name: 'PlayerBehavior',
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
        name: '',
        mod: 4, // 預設是所有行為
        browserhash: '',
        ip: '',
        date: null,
      },
      behaviorMod: [
        { mod: 1, text: this.$t('g_deposit') },
        { mod: 2, text: this.$t('g_withdraw') },
        { mod: 3, text: this.$t('g_login') },
        { mod: 4, text: this.$t('g_all') }, // 所有行為
      ],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['name'],
        sortDesc: [true],
        totalItems: 0,
      },
      headers: [
        {
          lang: 'report_playerBehavior_columns_name',
          text: '用戶名',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_playerBehavior_columns_browserhash',
          text: 'browserhash',
          value: 'browserhash',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_playerBehavior_columns_mod',
          text: '行为模式',
          value: 'mod',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_playerBehavior_columns_ip',
          text: 'IP',
          value: 'ip',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_playerBehavior_columns_created',
          text: '发生时间',
          value: 'created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ]
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
    _export() {
      let startTime = '';
      let endTime = '';
      this.loading = true;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        startTime = this.searchOption.date[0] || '';
        endTime = this.searchOption.date[1] || '';
      }
      if (!this.searchOption.mod) {
        this.searchOption.mod = 4;
      }
      const params = {
        ...this.searchOption,
        endTime,
        startTime,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        page: this.pagination.page,
        num: this.pagination.totalItems,
      };
      
      api
        .get("/report/playerBehavior", params)
        .then((data) => {
          this.loading = false;
          if (!data.data.length) {
            this.$store.commit("MsgError", this.$t("g_export_nodata"));
            return false
          }
          const _export = [];
          const cols = []
          const props = []
          this.headers.forEach(el => {
            cols.push(el.text)
            props.push(el.value)
          })
          _export.push(cols)
          data.data.forEach(row => {
            const temp = props.map(key => {
              if (key === 'mod') {
                return ['', this.$t('g_deposit'), this.$t('g_withdraw'), this.$t('g_login')][row.mod]
              }
              return row[key]
            })
            _export.push(temp)
          })
          console.log(_export)
          const ws = XLSX.utils.aoa_to_sheet(_export);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
          // const d = new Date().Format('yyyyMMdd');
          XLSX.writeFile(wb, `行为调查.xlsx`);
        })
        .catch((error) => {
          this.$store.commit("MsgError", error.error);
        });
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
      if (!this.searchOption.mod) {
        this.searchOption.mod = 4;
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
        .get('/report/playerBehavior', params)
        .then(data => {
          this.desserts = data.data ?? [];
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
