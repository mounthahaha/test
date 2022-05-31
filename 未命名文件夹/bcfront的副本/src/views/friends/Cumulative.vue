<template>
  <div class="GameLogs">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>
        {{ $route.meta.title }}
        <!-- {{ $t(`sidebar_${$route.name}`) }} -->
      </v-toolbar-title>
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
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.user"
              label="首存ID"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.smoney"
              label="最低首存金額"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.emoney"
              label="最高首存金額"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1)"
            ></v-text-field>
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
          :items="listData"
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
                <td v-if="/^name$/.test(field.value)" :key="`${field.value}_${i}`">
                  <!-- <a href="#" class="text-decoration-none" @click.prevent="showPlayerDetail(item.user_id)">{{ item.name }}({{ item.user_id }})</a> -->
                  {{ item.name }}
                </td>
                <td v-else-if="/^(amount|bonus)$/.test(field.value)" :key="`${field.value}_${i}`">
                  {{ item[field.value] | money }}
                </td>
                <td v-else-if="/^(date)$/.test(field.value)" :key="`${field.value}_${i}`" class="text-center text-no-wrap">
                  {{ item.sdate | formatDate }} ~ {{ item.edate | formatDate }}
                </td>
                <td v-else :key="`${field.value}_${i}`" class="text-center text-no-wrap">{{ item[field.value] || '-' }}</td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} 笔</span>
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
import { shortcuts } from '@/utils';
// import { formatDate, money } from '@/filters/custom';

export default {
  name: 'GameLogs',
  components: {},
  data() {
    return {
      selectItems: [10, 25, 50, 100],
      searchShow: true,
      loading: false,
      listData: [],
      searchOption: {
        date: null,
      },
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['date'],
        sortDesc: [true],
        totalItems: 0,
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
          lang: '推荐码',
          text: '推荐码',
          value: 'beinvit_code',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: '首存好友数',
          text: '首存好友数',
          value: 'count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: '获取红包',
          text: '获取红包',
          value: 'bonus',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: '日期区间',
          text: '日期区间',
          value: 'date',
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
      // console.log(desc);
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
    'pagination.itemsPerPage'(newVal) {
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    this.loadData(1);
  },
  methods: {
    showPlayerDetail(id) {
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
      let s = '';
      let e = '';
      this.loading = true;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        s = this.searchOption.date[0] || '';
        e = this.searchOption.date[1] || '';
      }
      const params = {
        ...this.searchOption,
        s,
        e,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        page: p,
        num: this.pagination.itemsPerPage,
      };
      delete params.date;
      api
        .get('/friendrecommended/cumulativeReport', params)
        .then(data => {
          this.listData = data.result ?? [];
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error);
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
  },
};
</script>
