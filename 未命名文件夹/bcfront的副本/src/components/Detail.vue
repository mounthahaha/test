<template>
  <div class="Detail">
    <v-dialog v-model="userId" persistent fullscreen hide-overlay transition="dialog-bottom-transition" :retain-focus="false">
      <v-card color="blue-grey lighten-5">
        <v-toolbar dense elevation="0" color="primary">
          <v-btn icon dark class="ma-0 pa-0" @click.native="closeDetail"> <v-icon>close</v-icon> </v-btn>
          <h4 class="mb-1 white--text">{{ curPlayer.name }} ({{ userId }})</h4>
          <v-spacer></v-spacer>
          <h4 class="d-flex align-center white--text">
            <v-icon dark class="mr-2">star_rate</v-icon> {{ $t('g_statics_totalBalance') }} = {{ $t('g_statics_totalDeposits') }} －
            {{ $t('g_statics_totalWithdrawals') }} － {{ $t('g_statics_totalBet') }} ＋ {{ $t('g_statics_totalPayout') }} ＋
            {{ $t('g_balance_adjustment') }} - {{ $t('g_pending_withdrawals') }}
          </h4>
          <v-spacer></v-spacer>
          <v-btn icon dark class="ma-0 pa-0" @click.native="closeDetail"> <v-icon>close</v-icon> </v-btn>
        </v-toolbar>

        <v-card-text class="ma-0 mt-5 py-0 px-5">
          <v-tabs v-model="active" center-active fixed-tabs centered background-color="white">
            <v-tabs-slider color="transparent"></v-tabs-slider>
            <v-tab :key="0" ripple active-class="primary white--text">
              <v-icon class="mr-3">mood</v-icon>
              <h3>{{ $t('player_detail_tab_profile') }}</h3>
            </v-tab>
            <v-tab :key="1" ripple active-class="primary white--text">
              <v-icon class="mr-3">payment</v-icon>
              <h3>{{ $t('player_detail_tab_balance') }}</h3>
            </v-tab>
            <v-tab :key="2" ripple active-class="primary white--text">
              <v-icon class="mr-3">calculate</v-icon>
              <h3>{{ $t('player_detail_tab_transfer') }}</h3>
            </v-tab>
            <v-tab :key="3" ripple active-class="primary white--text">
              <v-icon class="mr-3">sports_soccer</v-icon>
              <h3>{{ $t('player_detail_tab_gamelogs') }}</h3>
            </v-tab>
            <v-tab :key="4" ripple active-class="primary white--text">
              <v-icon class="mr-3">add_task</v-icon>
              <h3>{{ $t('player_detail_tab_turnover') }}</h3>
            </v-tab>
            <v-tab :key="5" ripple active-class="primary white--text">
              <v-icon class="mr-3">assignment</v-icon>
              <h3>{{ $t('player_detail_tab_changelog') }}</h3>
            </v-tab>

            <!-- 個人信息 出入金 餘額紀錄 遊戲紀錄 流水任務 信息變更紀錄-->
            <v-tab-item v-if="userId" class="ma-0 pa-0 blue-grey lighten-5" style="min-height: 500px">
              <Profile
                ref="profile"
                :user-id.sync="userId"
                :player.sync="curPlayer"
                @showPassword="showPasswordDialog"
                @openAgentEdit="openAgentEdit"
                @updatePlayer="updatePlayer"
                @updateBanks="updateBanks"
              ></Profile>
            </v-tab-item>
            <v-tab-item class="ma-0 pa-0 blue-grey lighten-5" style="min-height: 500px">
              <Balance ref="balance" :user-id.sync="userId" :export-x-l-s-x="exportXLSX" :shortcuts="shortcuts" :player.sync="curPlayer"></Balance>
            </v-tab-item>
            <v-tab-item class="ma-0 pa-0 blue-grey lighten-5" style="min-height: 500px">
              <Transfer ref="transfer" :user-id.sync="userId" :export-x-l-s-x="exportXLSX" :shortcuts="shortcuts" :player.sync="curPlayer"></Transfer>
            </v-tab-item>
            <v-tab-item class="ma-0 pa-0 blue-grey lighten-5" style="min-height: 500px">
              <GameLogs ref="gamelogs" :user-id.sync="userId" :export-x-l-s-x="exportXLSX" :shortcuts="shortcuts" :player.sync="curPlayer"></GameLogs>
            </v-tab-item>
            <v-tab-item class="ma-0 pa-0 blue-grey lighten-5" style="min-height: 500px">
              <Tasks ref="tasks" :user-id.sync="userId" :s2f="s2f" :export-x-l-s-x="exportXLSX" :shortcuts="shortcuts" :player.sync="curPlayer" />
            </v-tab-item>
            <v-tab-item class="ma-0 pa-0 blue-grey lighten-5" style="min-height: 500px">
              <Info ref="info" :user-id.sync="userId" :export-x-l-s-x="exportXLSX" :shortcuts="shortcuts" :player.sync="curPlayer"></Info>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
      </v-card>
    </v-dialog>
    <Password v-model="showPassword" :password="password"></Password>
    <AgentEdit v-model="showAgentEdit" :user-id.sync="userId" :player.sync="curPlayer" @update="agentMsgUpdate"></AgentEdit>
  </div>
</template>
<script>
import Profile from './detail/Profile';
import Balance from './detail/Balance';
import Transfer from './detail/Transfer';
import GameLogs from './detail/GameLogs';
import Tasks from './detail/Tasks';
import Info from './detail/Info';
import Password from './detail/Password';
import AgentEdit from './detail/AgentEdit';
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import ImgInputer from 'vue-img-inputer';
import 'vue-img-inputer/dist/index.css';
import { formatDate, money, hiddenPhoneNumber } from '../filters/custom';

export default {
  name: 'PlayerDetail',
  components: {
    Profile,
    Balance,
    Transfer,
    GameLogs,
    Tasks,
    Info,
    Password,
    AgentEdit,
    // ImgInputer,
  },
  data() {
    return {
      /* 上传身份证start*/
      // file1: null,
      // file2: null,
      // profile: {
      //     Cardstr: [],
      // },
      /* 上传身份证end*/
      exportXLSX,
      showPassword: false,
      loading: false,
      curPlayer: {},
      gameTypes: {},
      editedItem: {},
      shortcuts,
      showAgentEdit: false,
      password: '',
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    userId: {
      get() {
        if (this.$store.getters.playerId == 0) {
          Object.assign(this.$data, this.$options.data());
        }
        return Number(this.$store.getters.playerId);
      },
      set() {
        this.$store.commit('PLAYER', this.userId);
      },
    },
    player() {
      return this.curPlayer;
    },
    active: {
      get() {
        return this.$store.getters.playerDetailActiveIndex;
      },
      set(val) {
        this.$store.commit('PLAYERDETAILACTIVE', val);
      },
    },
  },
  watch: {
    active(n) {
      this.showTab(n);
    },
    userId(n) {
      if (n > 0) {
        if (this.$refs.balance) {
          this.$refs.balance.resetOptions();
        }
        if (this.$refs.transfer) {
          this.$refs.transfer.resetOptions();
        }
        if (this.$refs.gamelogs) {
          this.$refs.gamelogs.resetOptions();
        }
      }
    },
  },
  created() {
    this.showTab(this.active);
  },
  methods: {
    showTab(n) {
      if (this.userId > 0) {
        if (n == 0 && this.$refs.profile) {
          // this.$refs.profile.getTrades(this.userId, 1);
          this.$refs.profile.getTags();
          this.$refs.profile.getPlayer(this.userId);
          this.$refs.profile.getPlayerLimit(this.userId);
          this.$refs.profile.showDetail();
          this.$refs.profile.loadBanks();
          this.$forceUpdate();
        } else if (n == 1 && this.$refs.balance) {
          this.$refs.balance.loadData(1);
          this.$refs.balance.pagination = {
            length: 0,
            itemsPerPage: 10,
            sortBy: ['created'],
            sortDesc: [true],
            summary: {},
            page: 1,
          };
        } else if (n == 2 && this.$refs.transfer) {
          this.$refs.transfer.loadData(1);
        } else if (n == 3 && this.$refs.gamelogs) {
          this.$refs.gamelogs.loadData(1);
          this.$refs.gamelogs.loadGames();
        } else if (n == 4 && this.$refs.tasks) {
          this.$refs.tasks.loadData(1);
        } else if (n == 5 && this.$refs.info) {
          this.$refs.info.loadData(1);
        }
      }
    },
    closeDetail() {
      // this.$emit('close');
      this.$store.commit('PLAYER', 0);
      this.$store.commit('PLAYERDETAILACTIVE', null);
    },
    parseJson(d) {
      return JSON.parse(d);
    },
    parseLen(arg) {
      return Number(arg);
    },
    s2f(s) {
      if (s) {
        return Number(s).toFixed(2);
      }
      return 0.0;
    },
    detailFmt(str) {
      const obj = JSON.parse(str);
      return obj.PlayValue ? `${this.titleMap.PlayValue}:${obj.PlayValue}` : '';
    },
    updatePlayer(payload) {
      this.curPlayer = payload;
    },
    updateBanks(payload) {
      this.curPlayer.banks = payload;
    },
    agentMsgUpdate() {
      this.$refs.profile.getPlayer(this.userId);
      this.$refs.profile.getPlayerLimit(this.userId);
    },
    openAgentEdit() {
      this.showAgentEdit = true;
    },
    showPasswordDialog(password) {
      this.showPassword = true;
      this.password = password;
    },
  },
};
</script>
<style>
.v-select-for-search .v-select {
  padding-top: 0px;
}
.game-record-table th,
.game-record-table td {
  word-break: keep-all;
}
</style>
