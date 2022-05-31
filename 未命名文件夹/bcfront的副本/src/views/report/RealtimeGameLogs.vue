<template>
  <div>
    <v-layout wrap row>
      <v-flex xs2>
        <v-text-field v-model="searchOption.name" :label="$t('g_text_field_username')" solo hide-details></v-text-field>
      </v-flex>
      <v-flex xs2>
        <v-text-field v-model="searchOption.refer_name" label="请输入代理名称" solo hide-details></v-text-field>
      </v-flex>
      <v-flex xs4>
        <datetime-range v-model="searchOption.date" />
      </v-flex>
      <v-flex xs2>
        <v-btn class="ma-1" color="primary" depressed @click="loadData(1, Status)">{{ $t('g_btn_search2') }}</v-btn>
        <v-btn class="ma-1" color="error" depressed @click="resetOptions()">{{ $t('g_btn_reset') }}</v-btn>
      </v-flex>
    </v-layout>
    <v-card>
      <v-toolbar elevation="1" class="pl-2">
        <v-icon class="mr-2"> list </v-icon>
        <v-toolbar-title>即时游戏记录（目前仅支援彩票平台显示）</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="_export"> <v-icon>vertical_align_bottom</v-icon>{{ $t('g_export') }}</v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headerComputed"
          :items="logs"
          :loading="loading"
          :disable-sort="loading"
          class="elevation-1 game-record-table"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <template v-for="(field, i) in headerComputed">
                <td v-if="/^name$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`">
                  <a href="#" class="text-decoration-none" @click.prevent="showPlayerDetail(item.user_id)">{{ item.name }}</a>
                </td>
                <td v-else-if="/^game_pid$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">
                  {{ platforms[item.game_pid] }}
                </td>
                <td v-else-if="/^numbers|outcome$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">
                  {{ item[field.value] == '[]' ? '━' : item[field.value] }}
                </td>
                <td v-else-if="/^status$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">
                  <font v-if="item.Status == '0'">{{ $t('g_gamelog_status_notOpen') }}</font>
                  <font v-if="item.Status == '1'">{{ $t('g_gamelog_status_payout') }}</font>
                </td>
                <td v-else-if="/^valid$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">
                  <div v-if="item.outcome == '[]'">━</div>
                  <div v-else>
                    <v-chip v-if="item.valid == '1'" label outlined color="red" small> {{ $t('g_gamelog_effective') }} </v-chip>
                    <v-chip v-else label outlined small> {{ $t('g_gamelog_ineffective') }} </v-chip>
                  </div>
                </td>
                <td v-else-if="/^bet_time$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">
                  {{ item.bet_time | formatDate }}
                </td>
                <td v-else-if="/^settle_time$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">
                  <div v-if="item.outcome == '[]'">━</div>
                  <div v-else>{{ item.settle_time | formatDate }}</div>
                </td>
                <td v-else-if="/^detailNum$/.test(field.value)" :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">
                  <v-chip v-if="ParseLen(item.detailNum) > 1" label small color="warning">
                    {{ $t('g_gamelog_mutiple') }}
                  </v-chip>
                  <v-chip v-else label small> {{ $t('g_gamelog_singular') }} </v-chip>
                </td>
                <td v-else :key="`${field.value}_${item.id}_${i}`" class="text-left text-no-wrap">{{ item[field.value] }}</td>
              </template>
            </tr>
          </template>
          <template slot="footer">
            <td v-if="summary.bet && summary['payout'] && summary['result']" colspan="100%">
              <v-chip class="mr-1" label color="success" text-color="white">
                {{ $t('report_total_header_bet_amount') }}： <i class="title">{{ summary['bet'] | money }}</i>
              </v-chip>
              <v-chip class="mx-1" label color="info" text-color="white">
                {{ $t('report_total_header_payout_amount') }}： <i class="title">{{ summary['payout'] | money }}</i>
              </v-chip>
              <v-chip class="mx-1" label color="success" text-color="white">
                {{ $t('report_total_header_result_amount') }}： <i class="title">{{ summary['result'] | money }}</i>
              </v-chip>
            </td>
          </template>
        </v-data-table>
        <div class="text-center py-2 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select
              v-model="pagination.itemsPerPage"
              class="diy-page-select"
              :items="selectItems"
            ></v-select>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-text class="error--text"
        >即时游戏记录注意事项：<br />1.目前仅支援彩票平台显示<br />2.此页仅提供”尚未结算”之投注记录显示，若数据已有结算时间，将记录于游戏记录，非此报表<br
      /></v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { formatDate, money } from '../../filters/custom';
export default {
  name: 'GameLogs',
  components: {},
  data() {
    return {
      selectItems: [10, 25, 50, 100],
      shortcuts,
      infoBox: false,
      valid: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: ['bet_time'],
        sortDesc: [true],
        totalItems: 0,
      },
      headers: [
        {
          lang: 'g_table_column_username',
          text: '用户名',
          value: 'name',
        },
        {
          lang: 'report_gamelogs_header_platform',
          text: '平台',
          value: 'game_pid',
        },
        {
          lang: 'report_gamelogs_header_game_name',
          text: '游戏',
          value: 'game_name',
        },
        {
          lang: 'report_gamelogs_header_round_no',
          text: '期',
          value: 'round_no',
        },
        {
          lang: 'report_gamelogs_header_rule_type',
          text: '玩法',
          value: 'play_type',
          sortable: false,
        },
        {
          lang: 'report_gamelogs_header_bet_amount',
          text: '投注金额',
          value: 'bet_amount',
        },
        {
          lang: 'report_gamelogs_header_odds',
          text: '赔率',
          value: 'odds',
        },
        {
          lang: 'report_gamelogs_header_valid',
          text: '有效投注',
          value: 'valid',
          sortable: false,
        },
        {
          lang: 'report_gamelogs_header_bet_time',
          text: '投注时间',
          value: 'bet_time',
        },
        {
          lang: 'report_gamelogs_header_isMultiple',
          text: '是否多单',
          value: 'detailNum',
          sortable: false,
        },
        {
          lang: 'report_gamelogs_header_game_sn',
          text: '游戏单号',
          value: 'game_sn',
        },
      ],
      logs: [],
      logDetail: {},
      game: 0,
      games: [],
      searchOption: {
        GamePid: 0,
        UserName: '',
        RoundNum: '',
        date: null,
      },
      platforms: {},
      summary: {},
      Status: true,
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
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
      this.loadData(n, this.Status);
      this.loadGames(n);
    },
    'pagination.sortDesc'(desc) {
      // console.log(desc);
      if (desc != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page, this.Status);
      }
    },
    'pagination.sortBy'(by) {
      if (by != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page, this.Status);
      }
    },
    'pagination.itemsPerPage'(newVal) {
      this.pagination.page = 1;
      this.loadData(this.pagination.page, this.Status);
    },
    '$route.params'(params) {
      this.searchOption.UserName = params.username;
      this.searchOption.date = params.date ? this.parseDateRange(params.date) : null;
      this.loadData(1, true);
    },
  },
  mounted() {
    if (this.$route.params) {
      const params = this.$route.params;
      this.searchOption.UserName = params.username;
      this.searchOption.date = params.date ? this.parseDateRange(params.date) : null;
    }
    this.loadData(1, true);
    this.loadGames(1);
  },
  methods: {
    ParseLen(arg) {
      return Number(arg);
    },
    parseDateRange(date) {
      date += ' 00:00:00';
      const startDate = new Date(date);
      const endDate = new Date(startDate * 1 + 24 * 60 * 60 * 1000);
      return [startDate, endDate];
    },
    _export(evt) {
      let StartTime = '';
      let EndTime = '';
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        StartTime = this.searchOption.date[0];
        EndTime = this.searchOption.date[1];
      }
      const params = {
        page: 1,
        num: 1000000,
        UserName: this.searchOption.user_name,
        GamePid: this.searchOption.game_pid,
        RoundNum: this.searchOption.round_no,
        GameName: this.searchOption.game_name,
        StartTime,
        RuleType: this.searchOption.cmd,
        Userid: '',
        EndTime,
        Enable: true,
      };
      const urlApi = '/report/realtime/gamelogs';
      api
        .get(urlApi, params)
        .then(data => {
          if (data == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const cols = [];
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            const gamelogExports = [
              cols,
              ...data.result.logs.map((item, i) => {
                item = [
                  item.name,
                  this.platforms[item.game_pid],
                  item.game_name,
                  item.round_no,
                  item.play_type,
                  item.numbers,
                  parseFloat(money(item.bet_amount, false)),
                  parseFloat(money(item.payout_amount, false)),
                  parseFloat(money(item.result_amount, false)),
                  item.odds,
                  ['未开奖', '已派彩']?.[item.Status] || '',
                  ['无效', '有效']?.[item.valid] || '━',
                  formatDate(item.bet_time),
                  item.outcome == '[]' ? '━' : formatDate(item.settle_time),
                  Number(item.detailNum) > 1 ? `多条${item.detailNum}` : '单条',
                  item.game_sn,
                ];
                return item;
              }),
              [],
              [],
              ['', '', '', `总投注：${data.result.summary.bet}`, `总派彩: ${data.result.summary.payout}`, `总输赢: ${data.result.summary.result}`],
            ];
            exportXLSX(gamelogExports, `游戏记录`);
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    showPlayerDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    loadData(p, status) {
      if (this.loading) {
        return;
      }
      let StartTime = '';
      let EndTime = '';
      this.loading = true;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        StartTime = this.searchOption.date[0] || '';
        EndTime = this.searchOption.date[1] || '';
      }
      // console.log(this.searchOption.date);
      const params = {
        ...this.searchOption,
        EndTime,
        StartTime,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        page: p,
        num: this.pagination.itemsPerPage,
        Enable: true,
      };
      const urlApi = '/report/realtime/gamelogs';
      api
        .get(urlApi, params)
        // .get(urlApi)
        .then(data => {
          this.logs = data.result.logs == null ? [] : data.result.logs;
          this.pagination.length = data.result.pageNums || Math.ceil(data.result.total / this.pagination.itemsPerPage);
          this.pagination.totalItems = data.result.total;
          this.loading = false;
          this.platforms = data.result.platform;
          this.summary = data.result.summary == null ? {} : data.result.summary;
        })
        .catch(error => {
          this.$store.commit('MsgError', error);
        });
    },
    loadGames(p) {
      const $this = this;
      $this.loading = true;
      api
        .get('/games/platforms')
        .then(data => {
          this.games = data.result;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    showDetail(detail, game_pid) {
      this.logDetail = JSON.parse(detail);
      this.game = game_pid;
      this.infoBox = true;
    },
    search() {},
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
<style>
.game-record-table th,
.game-record-table td {
  word-break: keep-all;
}
.el-date-range-picker__editor .el-input__inner {
  border-color: red;
}
</style>
