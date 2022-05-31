<template>
  <div class="GameLogs">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 下載 展開按鈕 -->
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
            @click="loadData(1, Status)"
          >
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("g_btn_search") }}</span>
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
            @click="resetOptions()"
          >
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("g_btn_reset") }}</span>
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
          <v-btn
            v-if="searchShow"
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="searchShow = !searchShow"
          >
            <v-icon>expand_less</v-icon>
          </v-btn>
          <v-btn
            v-else
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="searchShow = !searchShow"
          >
            <v-icon>expand_more</v-icon>
          </v-btn>
        </template>
        <span v-if="searchShow">{{ $t("g_btn_searchHide") }}</span>
        <span v-else>{{ $t("g_btn_searchExpand") }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 搜尋 -->
      <v-card
        v-if="searchShow"
        elevation="0"
        class="pa-3 mb-3 rounded-lg"
        color="blue-grey lighten-4"
      >
        <v-row dense class="align-center">
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.UserName"
              :label="$t('g_text_field_username')"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1, Status)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.RoundNum"
              :label="$t('g_text_field_period')"
              solo
              clearable
              hide-details
              persistent-hint
              @keydown.enter="loadData(1, Status)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-select
              v-model="searchOption.GamePid"
              clearable
              :items="games"
              item-value="Id"
              item-text="SystemCode"
              label="选择游戏"
              solo
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="3">
            <datetime-range
              start-placeholder="结算开始时间"
              end-placeholder="结束时间"
              v-model="searchOption.date"
              range-separator="g_datePick_to2"
            />
          </v-col>
          <v-col cols="3">
            <datetime-range
              v-model="betDate"
              start-placeholder="投注开始时间"
              end-placeholder="结束时间"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense>
        <v-col>
          <v-alert dense dark color="green" border="left">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon
                >{{ $t("report_total_header_bet_amount") }}</span
              >
              <span class="text-h5 font-weight-bold">{{
                summary["bet"] | money
              }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark color="red" border="left">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon
                >{{ $t("report_total_header_payout_amount") }}</span
              >
              <span class="text-h5 font-weight-bold">{{
                summary["payout"] | money
              }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark color="blue" border="left">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon
                >{{ $t("report_total_header_result_amount") }}</span
              >
              <span class="text-h5 font-weight-bold">{{
                summary["result"] | money
              }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="4">
          <v-alert dense dark color="#ff9800" border="left">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon
                >{{ $t("report_total_header_valid_bet_amount") }}</span
              >
              <span class="text-h5 font-weight-bold">{{
                summary["bet_valid"] | money
              }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
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
          :server-items-length="pagination.totalItems"
          :footer-props="{
            'items-per-page-options': [10, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear
            slot="progress"
            color="blue"
            indeterminate
          ></v-progress-linear>
          <template slot="no-data"> {{ $t("g_text_noData") }} </template>
          <template #item="{ item }">
            <tr>
              <template v-for="(field, i) in headerComputed">
                <td
                  v-if="/^name$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                >
                  <a
                    href="#"
                    class="text-decoration-none"
                    @click.prevent="showPlayerDetail(item.user_id)"
                    >{{ item.name }}</a
                  >
                </td>
                <td
                  v-else-if="/^game_pid$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  {{ platforms[item.game_pid] }}
                </td>
                <td
                  v-else-if="/^numbers|outcome$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  {{ item[field.value] == "[]" ? "━" : item[field.value] }}
                </td>
                <td
                  v-else-if="/^bet_valid_amount$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  {{ item[field.value] }}
                </td>
                <td
                  v-else-if="/^result_amount$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                  :inner-html.prop="item.result_amount | moneyColor"
                ></td>
                <td
                  v-else-if="/^status$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  <font v-if="item.Status == '0'">{{
                    $t("g_gamelog_status_notOpen")
                  }}</font>
                  <font v-if="item.Status == '1'">{{
                    $t("g_gamelog_status_payout")
                  }}</font>
                  <!--<font v-if="item.Status=='2'">已取消</font>-->
                  <!--<font v-if="item.Status=='3'">异常订单,(暂无此类)</font>-->
                  <!--<font v-if="item.Status=='4'">已下单未结算</font>-->
                  <!--<font v-if="item.Status=='5'">已结算 超出最大派彩金额</font>-->
                  <!--<font v-if="item.Status=='6'">追号订单 已取消</font>-->
                  <!--<font v-if="item.Status=='7'"> 补正订单(暂无此类)</font>-->
                </td>
                <td
                  v-else-if="/^valid$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  <div v-if="item.outcome == '[]'">━</div>
                  <div v-else>
                    <v-chip
                      v-if="item.valid == '1'"
                      label
                      outlined
                      small
                      color="red"
                    >
                      {{ $t("g_gamelog_effective") }}
                    </v-chip>
                    <v-chip v-else label outlined small>
                      {{ $t("g_gamelog_ineffective") }}
                    </v-chip>
                  </div>
                </td>
                <td
                  v-else-if="/^bet_time$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  {{ item.bet_time | formatDate }}
                </td>
                <td
                  v-else-if="/^settle_time$/.test(field.value)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  <div v-if="item.outcome == '[]'">━</div>
                  <div v-else>
                    {{ item.settle_time | formatDate }}
                  </div>
                </td>
                <td
                  v-else-if="/^detailNum$/.test(field.value)"
                  @click="showOrderDetailDialog(item.detail_json)"
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
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
                <td
                  v-else
                  :key="`${field.value}_${i}`"
                  class="text-left text-no-wrap"
                >
                  {{ item[field.value] }}
                </td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination
            v-model="pagination.page"
            :length="pagination.length"
            :total-visible="15"
            :disabled="loading"
          ></v-pagination>
          <span class="ml-5"
            >{{ pageCounter }} / {{ pagination.totalItems }}
            {{ $t("g_record_text") }}</span
          >
          <div class="diy-page">
            {{ $t("g_pagination_rows") }}&nbsp;&nbsp;<v-select
              v-model="selectItem"
              class="diy-page-select"
              :items="selectItems"
            ></v-select>
          </div>
        </div>
      </v-card>
    </v-container>
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
import api from "@/api";
import { shortcuts, exportXLSX ,toFix2} from "@/utils";
import { formatDate, money } from "@/filters/custom";
import _ from "lodash";

export default {
  name: "GameLogs",
  components: {},
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      infoBox: false,
      valid: true,
      searchShow: true,
      loading: false,
      logs: [],
      logDetail: {},
      game: 0,
      games: [],
      searchOption: {
        GamePid: 0,
        UserName: "",
        RoundNum: "",
        date: null,
      },
      platforms: {},
      summary: {},
      Status: true,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ["bet_time"],
        sortDesc: [true],
        totalItems: 0,
      },
      headers: [
        {
          lang: "g_table_column_username",
          text: "用户名",
          value: "name",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_platform",
          text: "平台",
          value: "game_pid",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_game_name",
          text: "游戏",
          value: "game_name",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_round_no",
          text: "期",
          value: "round_no",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_rule_type",
          text: "玩法",
          value: "play_type",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_gameResult",
          text: "开奖结果",
          value: "numbers",
          sortable: true,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_valid_bet_amount",
          text: "有效投注金额",
          value: "bet_valid_amount",
          sortable: true,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_bet_amount",
          text: "投注金额",
          value: "bet_amount",
          sortable: true,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_payout_amount",
          text: "派彩金额",
          value: "payout_amount",
          sortable: true,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_result_amount",
          text: "总输赢",
          value: "result_amount",
          sortable: true,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_odds",
          text: "赔率",
          value: "odds",
          sortable: true,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_status",
          text: "盘口状态",
          value: "status",
          sortable: true,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_valid",
          text: "有效投注",
          value: "valid",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_bet_time",
          text: "投注时间",
          value: "bet_time",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_settle_time",
          text: "结算时间",
          value: "settle_time",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_detail",
          text: "详情",
          value: "detailNum",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_game_sn",
          text: "游戏单号",
          value: "game_sn",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "report_gamelogs_header_affiliateInfo",
          text: "代理信息",
          value: "game_sn",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
      ],
      betDate: [],
      dialogVisible: false,
      nowDetail_json: [],
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
      return this.headers.map((item) => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage <
        this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
  },
  watch: {
    "pagination.page"(n) {
      this.loadData(n, this.Status);
      this.loadGames(n);
    },
    "pagination.sortDesc"(desc) {
      // console.log(desc);
      if (desc != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page, this.Status);
      }
    },
    "pagination.sortBy"(by) {
      if (by != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page, this.Status);
      }
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page, this.Status);
    },
    "$route.params"(params) {
      this.searchOption.UserName = params.username;
      this.searchOption.date = params.date
        ? this.parseDateRange(params.date)
        : null;
      this.loadData(1, true);
    },
  },
  mounted() {
    if (this.$route.params) {
      const params = this.$route.params;
      this.searchOption.UserName = params.username;
      this.searchOption.date = params.date
        ? this.parseDateRange(params.date)
        : null;
    }
    this.loadData(1, true);
    this.loadGames(1);
  },
  methods: {
    ParseLen(arg) {
      return Number(arg);
    },
    parseDateRange(date) {
      date += " 00:00:00";
      const startDate = new Date(date);
      const endDate = new Date(startDate * 1 + 24 * 60 * 60 * 1000);
      return [startDate, endDate];
    },
    _export(evt) {
      let StartTime = "";
      let EndTime = "";
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        StartTime = this.searchOption.date[0];
        EndTime = this.searchOption.date[1];
      }
      const params = {
        ...this.searchOption,
        EndTime,
        StartTime,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        page: 1,
        num: this.pagination.totalItems,
        Enable: true,
      };
      let urlApi = "";
      if (this.Status) {
        urlApi = "/report/games";
      } else {
        urlApi = "/report/unsettledgames";
      }
      api
        .get(urlApi, params)
        .then((data) => {
          if (data == null) {
            this.$store.commit("MsgError", this.$t("g_export_nodata"));
          } else {
            // const gamelogExports = [];
            const cols = [];
            this.headers.forEach((v) => {
              cols.push(v.text);
            });
            // gamelogExports.push(cols);
            // for (let i = 0; i <= 8; i++) {
            //   data.result.logs = data.result.logs.concat(data.result.logs);
            // }
            // console.log(data.result.logs.length);
            // const now = Number(new Date());
            // console.log(`${now}`);
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
                  ["未开奖", "已派彩"]?.[item.Status] || "",
                  ["无效", "有效"]?.[item.valid] || "━",
                  formatDate(item.bet_time),
                  item.outcome == "[]" ? "━" : formatDate(item.settle_time),
                  // Number(item.detailNum) > 1 ? `多条${item.detailNum}` : '单条',
                  item.game_sn,
                  item.game_sn,
                ];
                return item;
              }),
              [],
              [],
              [
                "",
                "",
                "",
                `总投注：${data.result.summary.bet}`,
                `总派彩: ${data.result.summary.payout}`,
                `总输赢: ${data.result.summary.result}`,
              ],
            ];
            exportXLSX(gamelogExports, `游戏记录`);
          }
        })
        .catch((error) => {
          console.log(error);
          this.$store.commit("MsgError", error.error);
        });
    },
    showPlayerDetail(id) {
      // 指定顯示個人信息
      this.$store.commit("PLAYERDETAILACTIVE", 0);
      this.$nextTick(() => {
        this.$store.commit("PLAYER", id);
      });
    },
    loadData(p, status) {
      if (this.loading) {
        return;
      }
      let StartTime = "";
      let EndTime = "";
      this.loading = true;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        StartTime = this.searchOption.date[0] || "";
        EndTime = this.searchOption.date[1] || "";
      }

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

      if (this.betDate && this.betDate.length > 0) {
        params.StartSettle = this.betDate[0] || "";
        params.EndSettle = this.betDate[1] || "";
      }
      let urlApi = "";
      if (status) {
        urlApi = "/report/games";
      } else {
        urlApi = "/report/unsettledgames";
      }
      api
        .get(urlApi, params)
        .then((data) => {
          this.logs = data.result.logs == null ? [] : data.result.logs;
          this.logs.forEach(item=>{item.odds = toFix2(item.odds)})
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.loading = false;
          this.platforms = data.result.platform;
          this.summary = data.result.summary == null ? {} : data.result.summary;
        })
        .catch((error) => {
          console.log(error);
          this.$store.commit("MsgError", error);
        });
    },
    //加载所有平台详细
    loadGames(p) {
      const $this = this;
      $this.loading = true;
      api
        .get("/games/platforms")
        .then((data) => {
          this.games = data.result;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.$store.commit("MsgError", error.error);
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
        if (i.toLocaleLowerCase().indexOf("date") >= 0) {
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