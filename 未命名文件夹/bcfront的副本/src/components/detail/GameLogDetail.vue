<template>
  <v-dialog v-model="gameLogsDetailShow">
    <v-card elevation="2" class="pa-5 rounded-lg">
      <div class="v-table__overflow">
        <!-- cs体育3.0 -->
        <el-table :data="tableData" v-if="item&&[219].includes(Number(item.game_pid))">
          <el-table-column prop="PlatformName" label="平台"></el-table-column>
          <el-table-column prop="GameName" label="游戏"></el-table-column>
          <el-table-column prop="RoundNo" label="期数"></el-table-column>
          <el-table-column prop="GameSn" label="游戏单号"></el-table-column>
          <el-table-column prop="Bet" label="投注金额"></el-table-column>
          <el-table-column prop="Payout" label="派彩金额"></el-table-column>
          <el-table-column prop="Result" label="总输赢"></el-table-column>
          <el-table-column prop="Odds" label="赔率"></el-table-column>
          <el-table-column prop="BetTime" label="投注时间"></el-table-column>
          <el-table-column prop="SettleTime" label="结算时间"></el-table-column>
          <el-table-column prop="Played" label="赛事"></el-table-column>
        </el-table>
        <table v-else class="v-datatable v-table" style="background:#fff">
          <thead>
            <tr v-if="headers.length > 0">
              <th v-for="(field, i) in headers" :key="`column_${i}`" class="column text-center">{{ titleMap(field) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, index) in details" :key="index">
              <td v-for="(detail, key) in d" :key="`detail_${key}`" class="text-center">
                <span v-if="headers[key] == 'WinLose'">{{ detail == '0' ? $t('g_win') : $t('g_lose') }}</span>
                <span v-else-if="(headers[key] == 'BetAmount' || headers[key] == 'PayoutAmount') && d.game_pid != 3">
                  {{ (detail / 100) | money }}
                </span>
                <span v-else-if="headers[key] == 'BetTime' || headers[key] == 'PayoutTime'">{{ detail | formatDateAdd8Hours }}</span>
                <span v-else-if="headers[key] == 'EndTime'">{{ detail | formatDateAdd8Hours }}</span>
                <span v-else-if="headers[key] == 'RuleType'">{{ detail }}</span>
                <span v-else-if="headers[key] == 'PlayValue'">{{ detail }}</span>
                <span v-else-if="headers[key] == 'GameType'">{{ detail }}</span>
                <span v-else-if="headers[key] == 'BetType'">{{ sagMap[parseJson(detail)['GameType']][detail] }}</span>
                <span v-else>{{ detail }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <v-divider></v-divider>
        <div class="text-center py-2">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15"></v-pagination>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/api';
import { formatDate, money, hiddenPhoneNumber } from '@/filters/custom';
import hideItem from './json/hideItem';
// import titleMap from './json/titleMap';
// import lottoMap from './json/lottoMap';
import _ from 'lodash'
export default {
  name: 'GameLogsDetail',
  props: {},
  data() {
    return {
      gameLogsDetailShow: false,
      rawdata: [],
      item: null,
      hideItem,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
      },
      tableData: []
    };
  },
  computed: {
    details: {
      get() {
        const rows = [];
        if (this.rawdata) {
          // const raw = JSON.parse(_.first(this.rawdata).contents);
          _.each(this.rawdata, (item, index) => {
            const columns = [];
            _.each(JSON.parse(item.contents), (value, column) => {
              if (hideItem.indexOf(column) < 0) {
                columns.push(value);
              }
            });
            rows.push(columns);
          });
        }
        return rows;
      },
      set(val) {
        this.rawdata = val;
      },
    },
    headers() {
      const columns = [];
      if (this.rawdata && _.first(this.rawdata)) {
        const raw = JSON.parse(_.first(this.rawdata).contents);
        _.each(raw, (item, column) => {
          if (hideItem.indexOf(column) < 0) {
            columns.push(column);
          }
        });
      }
      return columns;
    },
  },
  watch: {},
  methods: {
    getSimilarDetails(item, page) {
      this.item = item;
      api
        .get(`/player/games/similar/${item.user_id}`, {
          round_no: item.round_no,
          round_type: item.rule_type,
          page,
          num: this.pagination.itemsPerPage,
        })
        .then(data => {
          this.details = data.details;
          this.gameLogsDetailShow = true;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.sagMap = data.gameTypes;
          const datas = data.details[0].contents
          this.tableData = [JSON.parse(datas)]
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    translateRuleType(value) {
      const detail = this.parseJson(value);
      value = detail.RuleType;
      const values = value ? value.split('_') : null;
      if (values && values.length > 0) {
        const rule_type = this.lottoMap(values[1]);
        if (typeof rule_type == 'object') {
          return `${rule_type.name}- 第${values[0]}位`;
        } else if (typeof rule_type == 'string') {
          return `${rule_type}- 第${values[0]}位`;
        } else {
          return value;
        }
        // return this.lottoMap[values[1]] ? (this.lottoMap[values[1]] + '- 第' + values[0] + "位") : value
      }
      return value;
    },
    translatePlayValue(value) {
      const detail = this.parseJson(value);
      let rule_type = detail.RuleType ? detail.RuleType.split('_') : null;
      if (rule_type && rule_type.length > 0) {
        rule_type = this.lottoMap(rule_type[1]);
        if (typeof rule_type == 'object') {
          return rule_type.value[detail.PlayValue];
        }
      }
      // value = detail.PlayValue
      // if (this.lottoMap[value]) {
      //     return this.lottoMap[value]
      // }
      return detail.PlayValue;
    },
    parseJson(str) {
      let obj = {};
      try {
        obj = JSON.parse(str);
      } catch (e) {
        console.log(e);
      }
      return obj;
    },
    titleMap(str) {
      return this.$t(`player_detail_gamelogs_titlemap_${str}`);
    },
    lottoMap(str) {
      return this.$t(`player_detail_gamelogs_lottoMap_${str}`);
    },
  },
};
</script>
