<template>
  <div>
    <v-dialog v-model="model" width="1800">
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table :headers="headerComputed" :items="SameRoundGameLogs" :loading="loading" class="" :options.sync="pagination" hide-default-footer>
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <td class="text-left">{{ item.username }}</td>
                <td class="text-left">
                  <v-chip label outlined small color="primary"> {{ platforms[item.game_pid] ? platforms[item.game_pid] : '--' }} </v-chip>
                </td>
                <td class="text-left">{{ item.game_name }}</td>
                <td class="text-left">{{ item.round_no }}</td>
                <td class="text-left">{{ item.rule_type }}</td>
                <td class="text-left">{{ item.bet_amount }}</td>
                <td class="text-left">{{ item.payout_amount }}</td>
                <td class="text-left">
                  <font v-if="item.result_amount > 0" color="red"> {{ item.result_amount | money }} </font>
                  <font v-else-if="item.result_amount < 0" color="green">{{ item.result_amount | money }}</font>
                  <font v-else>{{ item.result_amount | money }}</font>
                </td>
                <td class="text-left">{{ item.odds }}</td>
                <td class="text-left">
                  <v-chip v-if="item.valid == 1" label outlined small color="green">{{ $t('g_gamelog_effective') }}</v-chip>
                  <v-chip v-else label outlined small color="red">{{ $t('g_gamelog_ineffective') }}</v-chip>
                </td>
                <td class="text-center">
                  <v-chip v-if="parseLen(item.detailNum) > 1" label outlined small color="warning" @click="showGameLogsDetail(item)">
                    {{ $t('g_gamelog_mutiple') }}({{ item.detailNum }})
                  </v-chip>
                  <v-chip v-else label outlined small color="primary"> {{ $t('g_gamelog_singular') }} </v-chip>
                </td>
                <td class="text-left">{{ item.bet_time | formatDate }}</td>
                <td class="text-left">{{ item.settle_time | formatDate }}</td>
                <td class="text-center">
                  <!-- {{ item.details }} -->
                  <v-btn color="warning" small depressed class="x-small" @click="showGameLogsDetail(item)">{{ $t('g_btn_check') }}</v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :disabled="loading" :length="pagination.length" :total-visible="15"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import dialog from '../../components/mixins/dialog.js';
export default {
  name: 'SameRound',
  components: {},
  mixins: [dialog],
  props: {
    sameRound: {
      type: Boolean,
      default: () => false,
    },
    parseLen: {
      type: Function,
      default: () => {},
    },
    s2f: {
      type: Function,
      default: () => {},
    },
    sameRoundId: {
      type: Number,
      default: () => 0,
    },
    platforms: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: ['created'],
        sortDesc: [true],
      },
      SameRoundGameLogs: [],
      headers: [
        {
          lang: 'g_table_column_username',
          text: '用户名',
          value: 'username',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_platform',
          text: '平台',
          value: 'platform_id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_game',
          text: '游戏',
          value: 'game_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_round',
          text: '期号',
          value: 'round_no',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_rule_type',
          text: '玩法',
          value: 'rule_type',
          sortable: false,
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
        },
        {
          lang: 'player_detail_gamelogs_headers_payout_amount',
          text: '派彩金额',
          value: 'payout_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_game_result',
          text: '结果',
          value: 'result_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_odds',
          text: '赔率',
          value: 'odds',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_valid',
          text: '有效投注',
          value: 'valid',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_multiple',
          text: '是否多单',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_detail_gamelogs_headers_bet_time',
          text: '投注时间',
          value: 'bet_time',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_settle_time',
          text: '结算时间',
          value: 'settle_time',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_gamelogs_headers_game_detail',
          text: '详情',
          value: 'details',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
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
      this.getGameSameRound(this.round_no, n);
    },
    sameRoundId(n) {
      this.getGameSameRound(n, 1);
    },
  },
  methods: {
    getGameSameRound(sameRoundId, p) {
      this.loading = true;
      api
        .get(`/player/games/same/${sameRoundId}`, {
          page: p,
          num: this.pagination.itemsPerPage,
        })
        .then(data => {
          this.SameRoundGameLogs = data.gamelogs == null ? [] : data.gamelogs;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    showGameLogsDetail(item) {
      this.$emit('showGameLogsDetail', item);
    },
  },
};
</script>
