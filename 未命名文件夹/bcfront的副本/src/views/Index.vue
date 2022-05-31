<template>
  <div class="Index">
    <v-parallax v-show="!show" :src="require('../assets/vbanner.jpg')">
      <v-layout column align-center justify-center>
        <h1 class="white--text">{{ $t('index_welcome_title') }}</h1>
        <h4 class="white--text">{{ $t('index_welcome_subtitle') }}</h4>
      </v-layout>
    </v-parallax>

    <div v-show="show">
      <v-toolbar elevation="1" class="pl-2">
        <v-icon class="mr-2"> list </v-icon>
        <v-toolbar-title>{{ $t(`index_text_dailyUser`) }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- 搜尋 展開按鈕  -->
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
            <v-col cols="12">
              <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
            </v-col>
          </v-row>
        </v-card>

        <!-- 統計 -->
        <v-row dense>
          <v-col>
            <v-alert dark color="primary" border="left" class="pr-8">
              <div class="d-flex align-center justify-space-between">
                <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t('index_text_ClientStockFunds') }}</span>
                <span v-if="balance" class="text-h5 font-weight-bold">{{ balance }}</span>
                <span v-else class="text-h5 font-weight-bold">--</span>
              </div>
            </v-alert>
          </v-col>
        </v-row>

        <!-- 列表 -->
        <!-- <v-layout wrap>
          <v-flex xs2>
            <v-menu
              ref="menu1"
              v-model="menu1"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="searchOption.s"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  v-model="searchOption.s"
                  :label="$t('g_selector_startTime')"
                  prepend-icon="access_time"
                  readonly
                  clearable
                  hide-details
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-if="menu1"
                v-model="searchOption.s"
                format="24hr"
                full-width
                @change="$refs.menu1.save(searchOption.s)"
              ></v-time-picker>
            </v-menu>
          </v-flex>
          <v-flex xs2>
            <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="searchOption.e"
              offset-y
              transition="scale-transition"
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field v-model="searchOption.e" :label="$t('g_selector_endTime')" readonly clearable hide-details v-on="on"></v-text-field>
              </template>
              <v-time-picker
                v-if="menu2"
                v-model="searchOption.e"
                format="24hr"
                full-width
                @change="$refs.menu2.save(searchOption.e)"
              ></v-time-picker>
            </v-menu>
          </v-flex>
          <v-flex xs2 class="d-flex align-center">
            <v-btn color="info" depressed @click="loadData(1)">{{ $t('g_btn_search') }}</v-btn>
          </v-flex>
        </v-layout> -->

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
            class="elevation-0"
            hide-default-footer
          >
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="no-data"> {{ $t('g_text_noData') }} </template>
            <template #body="{ items }">
              <tbody>
                <tr v-for="item in items" :key="`list_${item.name}`">
                  <td class="text-left text-no-wrap">{{ item.affs }}</td>
                  <td class="text-left text-no-wrap">
                    <a href="#" class="text-decoration-none" @click.prevent="$store.commit('PLAYER', item.user_id)">{{ item.name }}</a>
                  </td>
                  <td class="text-left text-no-wrap" :inner-html.prop="item.deposit | moneyColor"></td>
                  <td class="text-left text-no-wrap" :inner-html.prop="item.withdrawal | moneyColor"></td>
                  <td class="text-left text-no-wrap" :inner-html.prop="item.bet_amount | moneyColor"></td>
                  <td class="text-left text-no-wrap" :inner-html.prop="item.payout_amount | moneyColor"></td>
                  <td class="text-left text-no-wrap" :inner-html.prop="item.result_amount | moneyColor"></td>
                  <td class="text-left text-no-wrap" :inner-html.prop="item.balance | moneyColor"></td>
                </tr>
              </tbody>
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
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts } from '@/utils';

export default {
  name: 'PlatformTotal',
  components: {},
  data() {
    return {
      show: false,
      menu1: false,
      menu2: false,
      pagination: {
        page: 1,
        itemsPerPage: 10,
        sortDesc: [],
        sortBy: [],
        length: 0, // v-pagination 用的分頁數量
        totalItems: 0,
      },
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      loading: false,
      searchShow: true,
      logs: [],
      searchOption: {
        s: null,
        e: null,
      },
      balance: 0,
      headers: [
        {
          lang: 'index_column_AgencyInformation',
          text: '代理信息',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'index_column_userAccount',
          text: '用户帐号',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'index_column_deposit',
          text: '入金',
          value: 'deposit',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'index_column_withdrawal',
          text: '出金',
          value: 'withdrawal',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'index_column_totalVote',
          text: '总投',
          value: 'bet',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'index_column_totalpayout',
          text: '总派彩',
          value: 'payout',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'index_column_totalprofit',
          text: '总利润',
          value: 'result',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'index_column_balance',
          text: '余额',
          value: 'balance',
          sortable: true,
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
    // selectItem(newVal) {
    //   this.pagination.itemsPerPage = newVal;
    //   this.pagination.page = 1;
    //   this.loadData(this.pagination.page);
    // },
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const param = {
        page: p,
        num: this.pagination.itemsPerPage,
        sort: this.pagination.sortBy[0],
        asc: this.pagination.sortDesc[0],
        s: this.searchOption.s,
        e: this.searchOption.e,
      };
      api
        .get('/report/today', param)
        .then(data => {
          this.logs = data.trade ? data.trade : [];
          this.pagination.length = data.pageNum;
          this.pagination.totalItems = data.total;
          this.loading = false;
          this.show = true;
          this.balance = data.balance;
        })
        .catch(error => {
          this.show = false;
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
