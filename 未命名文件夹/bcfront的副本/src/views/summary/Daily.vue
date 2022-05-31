<template>
  <div class="Daily">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> trending_up </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 統計 -->
      <v-row dense>
        <v-col cols="6">
          <v-alert v-if="statistics[1]" dense colored-border color="primary" border="left" class="mb-0 pr-8">
            <div class="d-flex align-center justify-space-between">
              <span v-if="statistics[1].lang" class="d-flex align-center">
                <v-icon class="ml-2 mr-1">people</v-icon> {{ $t(statistics[1].lang) }}
              </span>
              <span v-if="statistics[1].value" class="text-h5 font-weight-bold">{{ statistics[1].value }}</span>
              <span v-else class="text-h5 font-weight-bold">--</span>
            </div>
          </v-alert>
        </v-col>
        <v-col cols="6">
          <v-alert v-if="statistics[0]" dense colored-border color="red" border="left" class="mb-0 pr-8">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t(statistics[0].lang) }} </span>
              <span v-if="statistics[0].value" class="text-h5 font-weight-bold">{{ statistics[0].value | money }}</span>
              <span v-else class="text-h5 font-weight-bold">--</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>
      <v-row dense class="mt-3">
        <template v-for="item in statistics.slice(2, 11)">
          <v-col v-show="item.name !== 'date'" :key="item.name" :style="item.style" cols="3" lg="4" xl="4" md="4" sm="12" class="pt-0 mb-2">
            <v-alert dense colored-border :color="item.color" border="left" class="mb-0 pr-8">
              <div class="d-flex align-center justify-space-between">
                <span class="d-flex align-center">
                  <v-icon class="ml-2 mr-1">{{ item.icon }}</v-icon> {{ $t(item.lang) }}
                </span>
                <span v-if="item.value" class="text-h5 font-weight-bold">{{ (item.value ? item.value : 0) | money(...item.filter) }}</span>
                <span v-else class="text-h5 font-weight-bold">--</span>
              </div>
            </v-alert>
          </v-col>
        </template>
      </v-row>

      <!-- <v-row>
        <template v-for="item in statistics.slice(2, 9)">
          <v-col v-show="item.name !== 'date'" :key="item.name" md2 xs12 sm12>
            <v-card class="white h200" :class="item">
              <v-card-title primary-title>
                <div class="title"></div>
                <div class="subheading text-no-wrap">{{ $t(item.lang) }}</div>
              </v-card-title>
              <v-card-title>
                <span class="flat dark subheading"
                  ><i>{{ (item.value ? item.value : 0) | money(...item.filter) }}</i></span
                ><br />
              </v-card-title>
              <div :style="`background-color:${item.color}`" class="color-bar">&nbsp;</div>
            </v-card>
          </v-col>
        </template>
      </v-row> -->

      <!-- 搜尋 -->
      <v-card elevation="0" class="pa-3 mt-2 rounded-lg" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <v-col>
            <datetime-range v-model="date" range-separator="player_balance_to" />
          </v-col>
          <v-col class="d-flex align-center justify-end">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="updateGraph()">
                  <v-icon>search</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('g_btn_search') }}</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card>

      <!-- 一周新进用户统计 -->
      <v-card elevation="0" class="my-5 pa-2 pb-0 rounded-lg">
        <v-progress-linear :active="loading" :indeterminate="loading" color="blue"></v-progress-linear>
        <v-row row wrap>
          <v-col xs12>
            <v-card-title>
              <h3>{{ $t('summaryDaily_newUsersInAWeek') }}</h3>
            </v-card-title>
            <LineChart ref="lineChart" :chart-data="lineChartData" :x-axis-data="xAxisDataC" />
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import LineChart from '@/components/LineChart.vue';
import { mapGetters } from 'vuex';
import { shortcuts } from '@/utils';
import { formatDate, formatDay } from '@/filters/custom';
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
// const todayEnd = new Date(today * 1 + 1 * 24 * 60 * 60 * 1000 - 1);
const endDate = new Date(today * 1 + 1 * 24 * 60 * 60 * 1000 - 1);
const startDate = new Date(2000, 0, 1);
const day90 = new Date(today * 1 - 90 * 24 * 60 * 60 * 1000);

const xAxisArr = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export default {
  name: 'Daily',
  components: {
    LineChart,
  },
  data() {
    return {
      loading: false,
      date: [],
      datePickerOptions: {
        disabledDate: time => {
          return time.getTime() > today || time.getTime() < day90;
        },
        shortcuts,
      },
      shortcuts,
      lineChartData: {},
      xAxisData: [],
      statistics: [],
      rateData: { list: [], result: {} },
      mappings: {
        totalbalance: {
          color: 'red',
          label: '累计总余额',
          lang: 'summaryDaily_totalBalance',
          filter: [true, 0],
          icon: 'attach_money',
        },
        playerTotalCount: {
          color: 'blue',
          label: '累計总玩家數',
          lang: 'summaryDaily_players',
          filter: [true, 0],
          icon: 'person',
        },
        playerRegisterCount: {
          color: 'orange',
          label: '新玩家数',
          lang: 'summaryDaily_newPlayers',
          filter: [true, 0],
          icon: 'person',
        },
        gameTradeLogsCount: {
          color: 'yellow',
          label: '注单量',
          lang: 'summaryDaily_betMete',
          filter: [true, 0],
          icon: 'attach_money',
        },
        betTotal: {
          color: 'green',
          label: '投注金额',
          lang: 'summaryDaily_betAmount',
          filter: [],
          icon: 'attach_money',
        },
        resultTotal: {
          color: 'black',
          label: '输赢总计',
          lang: 'summaryDaily_winAndLose',
          filter: [],
          icon: 'attach_money',
        },
        depositeTotal: {
          color: 'purple',
          label: '入金金额',
          lang: 'summaryDaily_depositAmount',
          filter: [],
          icon: 'attach_money',
        },
        withdrawalTotal: {
          color: 'blue-grey',
          label: '出金金额',
          lang: 'summaryDaily_withdrawalAmount',
          filter: [],
          icon: 'attach_money',
        },
        promotionTotal: {
          color: 'pink',
          label: '赠金金额',
          lang: 'summaryDaily_bonusAmount',
          filter: [],
          icon: 'attach_money',
        },
        // depositRate: {
        //   color: 'indigo',
        //   label: '今日入金汇率',
        //   lang: 'summaryDaily_depositRate',
        //   filter: [false, 6],
        //   icon: 'attach_money',
        // },
        // withdarwalRate: {
        //   color: 'deep-purple',
        //   label: '今日出金汇率',
        //   lang: 'summaryDaily_withdarwalRate',
        //   filter: [false, 6],
        //   icon: 'attach_money',
        // },
      },
      seriesNames: [],
      totalbalance: 0.0,
    };
  },
  computed: {
    ...mapGetters({ locale: 'i18n/locale' }),
    config() {
      return this.$store.getters.config;
    },
    xAxisDataC() {
      const t = [];
      this.xAxisData.forEach(date => {
        if (!date) {
          return;
        }
        t.push(`${new Date(date).Format('M/dd')}(${this.$t(`g_week_${xAxisArr[new Date(date).getDay()]}`)})`);
      });
      return t;
    },
  },
  watch: {
    locale: {
      handler() {
        this.$nextTick(() => {
          this.$refs.lineChart.initChart();
        });
      },
    },
  },
  created() {
    this.updateGraph();
  },
  methods: {
    slice(arr, from, to) {
      return arr.slice(from, to);
    },
    updateGraph() {
      this.loading = true;
      const params = {};
      if (!this.date) {
        this.$store.commit('MsgError', this.$t('g_selector_date'));
        return;
      }
      if (this.date.length == 2) {
        params.s = this.date[0];
        params.e = this.date[1];
      } else {
        params.s = formatDate(startDate);
        params.e = formatDate(endDate);
      }
      api.get('/report/statistics/date', params).then(response => {
        // this.seriesNames = [];
        this.statistics.push({ ...this.mappings.totalbalance, name: 'totalbalance' });
        this.statistics = [];
        for (const i in this.mappings) {
          const item = response.total[i];
          this.statistics.push({ ...this.mappings[i], name: i, value: response.total[i] });
        }
        api.get('/report/statistics/totalbalance').then(data => {
          this.statistics[0].value = data.totalbalance;
        });
        api.get('/report/statistics/today').then(data => {
          this.statistics[1].value = data.playerTotalCount;
        });
      });
      api.get('/report/statistics/week').then(data => {
        const result = {};
        result.playerRegisterCount = {
          data: [],
          ...this.mappings.playerRegisterCount,
        };
        this.xAxisData = [];
        for (const i in data) {
          result.playerRegisterCount.data.push(data[i].playerRegisterCount);
          // this.xAxisData.push(`${new Date(data[i].date).Format('M/dd')}(${this.$t(`g_week_${xAxisArr[new Date(data[i].date).getDay()]}`)})`);
          this.xAxisData.push(data[i].date);
        }
        result.playerRegisterCount.data.push(null);
        this.xAxisData.push(``);
        this.lineChartData = result;
        this.loading = false;
      });

      // api.get('/report/exchange-rate').then(data => {
      //   this.rateData.list = data.result;
      //   this.rateData.result = {
      //     rate: {
      //       data: data.result.map(item => Number(item.rate)),
      //       color: this.$vuetify.theme.themes.light.primary,
      //       label: 'USD',
      //       lang: 'USD',
      //       filter: [],
      //     },
      //   };
      // });
    },
  },
};
</script>
