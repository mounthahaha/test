<template>
  <div class="GameLogs">
    <v-container fluid class="pa-0 ma-0">
      <!-- 搜尋 -->
      <v-card elevation="0" class="pa-3 mb-3" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <v-col cols="2">
            <v-select
              v-model="searchOption.game_pid"
              clearable
              multiple
              solo
              hide-details
              :items="games"
              item-value="Id"
              item-text="SystemCode"
              :label="$t('player_detail_gamelogs_select_platform')"
            ></v-select>
          </v-col>
          <v-col cols="2">
            <v-select
              v-model="searchOption.valid"
              :items="[
                { Id: '0', Code: $t('g_gamelog_ineffective') },
                { Id: '1', Code: $t('g_gamelog_effective') },
              ]"
              item-value="Id"
              item-text="Code"
              :label="$t('player_detail_gamelogs_select_effective')"
              hide-details
              solo
              persistent-hint
              single-line
            ></v-select>
          </v-col>
          <!-- <v-col cols="2">
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col> -->
          <v-col cols="2">
            <datetime-range
              v-model="betDate"
              start-placeholder="投注开始时间"
              end-placeholder="结束时间"
            />
          </v-col>
          <v-col cols="2">
            <datetime-range
              v-model="settleDate"
              start-placeholder="结算开始时间"
              end-placeholder="结束时间"
            />
          </v-col>
          <v-col cols="2">
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
          <v-col cols="2" class="d-flex align-center justify-end">
            <FieldFilter storage-tag="player_detail_gamelogs" :header-map="headers" @updateInfo="items => (headers = items)" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="#27b31a">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalBet') }}</span>
              <span class="text-h5 font-weight-bold">{{ (s2f(gameTotals[0]) ? s2f(gameTotals[0]) : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="orange">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('report_gamelogs_header_total_valid_bet_amount') }}</span>
              <span class="text-h5 font-weight-bold">{{ (s2f(gameTotals[3]) ? s2f(gameTotals[3]) : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="blue-grey">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalPayout') }}</span>
              <span class="text-h5 font-weight-bold">{{ (s2f(gameTotals[1]) ? s2f(gameTotals[1]) : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="purple">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon>{{ $t('g_statics_totalResult') }}</span>
              <span class="text-h5 font-weight-bold">{{ (s2f(gameTotals[2]) ? s2f(gameTotals[2]) : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="GameLogs"
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
                <td v-if="/^(username)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.username }}</td>
                <td v-else-if="/^(platform_id)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip label outlined small color="primary"> {{ platforms[item.game_pid] ? platforms[item.game_pid] : '--' }} </v-chip>
                </td>
                <td v-else-if="/^(game_name)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.game_name }}</td>
                <td v-else-if="/^(round_no)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <span  > {{ item.round_no }} </span>
                </td>
                <td v-else-if="/^(game_sn)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip label outlined small color="primary"> {{ item.game_sn ? item.game_sn : '--' }} </v-chip>
                </td>
                <td v-else-if="/^bet_valid_amount$/.test(col.value)" :key="`${col.value}_${i}`" class="text-left text-no-wrap">
                  {{ item[col.value] }}
                </td>
                <td v-else-if="/^(bet_amount)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.bet_amount }}</td>
                <td v-else-if="/^(payout_amount)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item.outcome == '[]' ? '━' : item.payout_amount }}
                </td>
                <td v-else-if="/^(result_amount)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <div v-if="item.outcome == '[]'">━</div>
                  <div v-else>
                    <font v-if="item.result_amount > 0" color="red"> {{ item.result_amount | money }} </font>
                    <font v-else-if="item.result_amount < 0" color="green">{{ item.result_amount | money }}</font>
                    <font v-else>{{ item.result_amount | money }}</font>
                  </div>
                </td>
                <td v-else-if="/^(odds)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.odds }}</td>
                <td v-else-if="/^(valid)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip v-if="item.valid == '0'" label outlined small color="red">{{ $t('g_gamelog_status_notOpen') }}</v-chip>
                  <v-chip v-if="item.valid == '1'" label outlined small color="green">{{ $t('g_gamelog_status_payout') }}</v-chip>
                  <!--<font v-if="item.Status=='2'">已取消</font>-->
                  <!--<font v-if="item.Status=='3'">异常订单,(暂无此类)</font>-->
                  <!--<font v-if="item.Status=='4'">已下单未结算</font>-->
                  <!--<font v-if="item.Status=='5'">已结算 超出最大派彩金额</font>-->
                  <!--<font v-if="item.Status=='6'">追号订单 已取消</font>-->
                  <!--<font v-if="item.Status=='7'"> 补正订单(暂无此类)</font>-->
                </td>
                <td v-else-if="/^(bet_time)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.bet_time | formatDate }}</td>
                <td v-else-if="/^(settle_time)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <div v-if="item.outcome == '[]'">━</div>
                  <div v-else>{{ item.settle_time | formatDate }}</div>
                </td>
                <td v-else-if="/^(multiple)$/.test(col.value)" :key="i" class="text-left text-no-wrap" @click="showOrderDetailDialog(item.detail_json)">
                 <v-chip
                    style="cursor: pointer"
                    label
                    outlined
                    small
                    color="#619eda"
                  >
                    {{ $t("g_gamelog_detail") }}
                  </v-chip>
                </td>
                <td v-else-if="/^(numbers)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.numbers }}</td>
                <td v-else-if="/^(play_type)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.play_type }}</td>
                <!-- <td v-else-if="/^(details)$/.test(col.value)" :key="i" class="text-left text-no-wrap"><el-button type="text" size="mini" @click="showDetailLog(item)">查看</el-button></td> -->
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

    <SameRound
      v-model="SameRound"
      :same-round-id="sameRoundId"
      :parse-len="ParseLen"
      :s2f="s2f"
      :platforms="platforms"
      :same-round-game-logs="SameRoundGameLogs"
      @showGameLogsDetail="showGameLogsDetail"
    ></SameRound>
    <GameLogDetail ref="logDetail"></GameLogDetail>
    <el-dialog
      title="详情"
      :visible.sync="detailLog"
      width="85%"
      append-to-body>
      <log-detail v-if="detailLog" :source-data="currentLog" />
    </el-dialog>
    <!-- 订单详情对话 -->
    <el-dialog
      :title="$t('report_gamelogs_order_detail_dialog_title')"
      :visible.sync="dialogVisible"
      width="30%"
      :modal="false"
      top="20vh"
      lock-scroll
    >
      <div v-if="nowDetail_json.length === 0" class="el-dialog-item-wrapper">
        <div class="no-data">
          {{ $t("report_gamelogs_order_detail_dialog_body_no_data") }}
        </div>
      </div>
      <div
        v-else
        class="el-dialog-item-wrapper"
        v-for="(item, index) in nowDetail_json"
        :key="index"
      >
        <div v-for="(val, key) in item" :key="key">
          <div v-if="key === '结果'" class="league">{{ key }} :  <span :style="{color:val==='赢'?'green':val==='输'?'red':''}">{{val}}</span></div>
          <div v-else class="league">{{ key + " : " + val }}</div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogVisible = false">OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX ,toFix2} from '@/utils';
import { formatDate, money, hiddenPhoneNumber } from '@/filters/custom';
import SameRound from './SameRound';
import GameLogDetail from './GameLogDetail';
import FieldFilter from '@/components/FieldFilter';
import _ from 'lodash'
import LogDetail from '@/components/detail/LogDetail.vue'

export default {
  name: 'GameLogs',
  components: { SameRound, GameLogDetail, FieldFilter, LogDetail },
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
      detailLog: false,
      currentLog: {
        details: ''
      },
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      datePickerOptions: {
        shortcuts,
      },
      SameRound: false,
      SameRoundGameLogs: [],
      similarItem: {},
      sameRoundId: 0,
      round_no: 0,
      loading: false,
      gameTotals: [],
      GameLogs: [],
      games: [],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['bet_time'],
        sortDesc: [true],
      },
      searchOption: {
        game_pid: [],
        user_name: '',
        game_name: '',
        lotto_name: '',
        cmd: '',
        round_no: '',
        date: [],
      },
      // 投注时间
      betDate: [],
      // 结算时间
      settleDate: [],
      disabledDates: {
        to: new Date(),
        ranges: [
          {
            // Disable dates in given ranges (exclusive).
            from: new Date(2018, 1, 1),
            to: new Date(),
          },
        ],
      },
      headers: [
        {
          lang: 'g_table_column_username',
          text: '用户名',
          value: 'username',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: false,
        },
        {
          lang: 'player_detail_gamelogs_headers_platform',
          text: '平台',
          value: 'platform_id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_game',
          text: '游戏',
          value: 'game_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_round',
          text: '期',
          value: 'round_no',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_game_sn',
          text: '游戏单号',
          value: 'game_sn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'report_gamelogs_header_valid_bet_amount',
          text: '有效投注金额',
          value: 'bet_valid_amount',
          sortable: true,
          show: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_bet_amount',
          text: '投注金额',
          value: 'bet_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_payout_amount',
          text: '派彩金额',
          value: 'payout_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_result_amount',
          text: '总输赢',
          value: 'result_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_odds',
          text: '赔率',
          value: 'odds',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_valid',
          text: '有效投注',
          value: 'valid',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_bet_time',
          text: '投注时间',
          value: 'bet_time',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_settle_time',
          text: '结算时间',
          value: 'settle_time',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_detail',
          text: '详情',
          value: 'multiple',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_result',
          text: '开奖结果',
          value: 'numbers',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        {
          lang: 'player_detail_gamelogs_headers_rule_type',
          text: '玩法',
          value: 'play_type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          show: true,
          canHide: true,
        },
        // {
        //   lang: '代理信息',
        //   text: '代理信息',
        //   value: 'result_amount',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        //   show: true,
        //   canHide: true,
        // },
        // {
        //   lang: '详情',
        //   text: '详情',
        //   value: 'details',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        //   show: true,
        //   canHide: true,
        // },
      ],
      platforms: {},
      //订单详情对话
      dialogVisible: false,
       nowDetail_json: [],
    };
  },
  computed: {
    headerComputed() {
      return this.headers
        .filter(item => item.show)
        .map(item => {
          item.text = item.lang ? this.$t(item.lang) : item.text;
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
        this.loadData(1);
      }
    },
    'paginationGld.page'(n) {
      this.getSimilarDetails(this.similarItem, n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
 
  },
  created() {
    this.loadData(this.pagination.page);
    this.loadGames();
  },
  methods: {
    showDetailLog(item) {
      this.detailLog = true
      this.currentLog = item
    },
    ParseLen(arg) {
      return Number(arg);
    },
    s2f(s) {
      if (s) {
        return Number(s).toFixed(2);
      }
      return 0.0;
    },
    loadGames() {
      const $this = this;
      $this.loading = true;
      api
        .get('/games/platforms')
        .then(data => {
          $this.games = data.result;
          $this.loading = false;
        })
        .catch(error => {
          $this.loading = false;
          $this.$store.commit('MsgError', error.error);
        });
    },
    resetSearch() {
      this.searchOption = {
        game_pid: '',
        user_name: '',
        round: '',
        date: [],
      };
      this.pagination.sortBy = ['bet_time'];
      this.pagination.sortDesc = [true];
      this.loadData(1);
    },
    _export(evt) {
      const $this = this;
      let StartTime = '';
      let EndTime = '';
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        StartTime = this.searchOption.date[0];
        EndTime = this.searchOption.date[1];
      }
      const searchOption = {
        page: 1,
        num: this.pagination.totalItems,
        GamePid: this.searchOption.game_pid,
        RoundNum: this.searchOption.round,
        Valid: this.searchOption.valid,
        StartTime,
        EndTime,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
      };
      api
        .get(`/player/games/export/${this.userId}`, searchOption)
        .then(data => {
          if (data.gamelogs == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headerComputed.forEach(col => {
              cols.push(col.text);
            });
            _export.push(cols);
            data.gamelogs.forEach(row => {
              const tmp = [];
              this.headerComputed.forEach(col => {
                if (/^(platform_id)$/.test(col.value)) {
                  tmp.push(this.platforms[row.game_pid] || '--');
                } else if (/^(bet_amount|payout_amount|result_amount)$/.test(row[col.value])) {
                  tmp.push(parseFloat(money(row[col.value])));
                } else if (/^(valid)$/.test(row[col.value])) {
                  tmp.push(row.valid == 1 ? '已派彩' : '未开奖');
                } else if (/^(bet_time)$/.test(row[col.value])) {
                  tmp.push(formatDate(row.bet_time));
                } else if (/^(numbers)$/.test(row[col.value])) {
                  tmp.push(row.numbers == '' ? '--' : formatDate(row.settle_time));
                } else if (/^(detailNum)$/.test(row[col.value])) {
                  tmp.push(Number(row.detailNum) > 1 ? `多条${row.detailNum}` : '单条');
                } else {
                  tmp.push(row[col.value] || '--');
                }
              });
              _export.push(tmp);
            });
            _export.push([]);
            _export.push([]);
            _export.push([
              '',
              '',
              '',
              `${this.$t('g_statics_totalBet')}${data.trade_total[0]}`, // .bet,
              `${this.$t('g_statics_totalPayout')}${data.trade_total[1]}`, // .payout,
              `${this.$t('g_statics_totalResult')}${data.trade_total[2]}`, // .result,
            ]);
            this.exportXLSX(_export, this.$t('player_detail_tab_gamelogs'));
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      let params = {}
      this.pagination.page = p;
      this.loading = true;
      let StartTime = '';
      let EndTime = '';
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        StartTime = this.searchOption.date[0];
        EndTime = this.searchOption.date[1];
      }
      if (this.betDate && this.betDate.length > 0) {
        params.BetStartTime = this.betDate[0]||'';
        params.BetEndTime = this.betDate[1]||'';
      }
      if (this.settleDate && this.settleDate.length > 0) {
        params.SettleStartTime = this.settleDate[0]||'';
        params.SettleEndTime = this.settleDate[1]||'';
      }
      api
        .get(`/player/games/${this.userId}`, {
          page: p,
          num: this.pagination.itemsPerPage,
          GamePids: this.searchOption.game_pid.join(','),
          RoundNum: this.searchOption.round,
          Valid: this.searchOption.valid,
          StartTime,
          EndTime,
          sort: this.pagination.sortBy[0],
          asc: !this.pagination.sortDesc[0],
          ...params
        })
        .then(data => {
          this.GameLogs = data.gamelogs == null ? [] : data.gamelogs;
          this.GameLogs.forEach(item=>{item.odds = toFix2(item.odds)})
          this.gameTypes = data.gametype;
          this.platforms = data.platform;
          this.gameTotals = data.trade_total == null ? [] : data.trade_total;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    //363取消
    // showSameRound(id) {
    //   this.SameRound = true;
    //   this.round_no = id;
    //   this.sameRoundId = Number(id);
    // },
    showGameLogsDetail(item) {
      this.similarItem = item;
      this.$refs.logDetail.getSimilarDetails(item, 1);
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
    showOrderDetailDialog(detail_json) {
      this.dialogVisible = true;
      this.nowDetail_json = Array.isArray(detail_json) ? detail_json : [];
    },
  },
};
</script>


<style lang='scss' scoped>
.el-dialog__wrapper {
  ::v-deep .el-dialog {
    background-color: #f5f5f5;
    .el-dialog__header {
      padding: 20px 20px 0;
    }
    .el-dialog__body {
      max-height: 450px;
      overflow-y: scroll;
      padding: 0 20px;
    }
  }

  .el-dialog-item-wrapper {
    padding: 15px 0;
    border-bottom: 1px solid #cccccc;
    &:last-child {
      border-bottom: none;
    }
    .no-data {
      font-weight: 600;
      color: #000;
      flex: 1;
      text-align: center;
    }
    .league {
      font-size: 15px;
      font-weight: 500;
      color: #000;
    }
    div {
      margin-bottom: 5px;
    }
  }
}
</style>