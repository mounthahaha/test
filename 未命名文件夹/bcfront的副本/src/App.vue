<template>
  <div>
    <v-app v-if="isLogin" id="inspire">
      <MyFrame></MyFrame>
      <v-main class="blue-grey lighten-5">
        <v-container fluid grid-list-md class="pa-0">
          <router-view></router-view>
        </v-container>
      </v-main>
      <div class="text-center">
        <v-dialog v-model="StandBy" hide-overlay persistent width="300">
          <v-card color="primary" dark>
            <v-card-text>
              正在打开，请稍候
              <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
      <PlayerDetail />
      <AffiliateDetail />
      <Snackbar></Snackbar>
    </v-app>
    <v-app v-else id="inspire">
      <Login></Login>
      <Snackbar></Snackbar>
    </v-app>
    <Dialog></Dialog>
  </div>
</template>

<script>
import MyFrame from './components/Frame.vue';
import Login from './components/Login.vue';
import Snackbar from './components/Snackbar.vue';
import Dialog from './components/Dialog.vue';
import PlayerDetail from './components/Detail.vue';
import AffiliateDetail from './components/Affiliate.vue';
import { mapGetters } from 'vuex';
import ws from './ws';

export default {
  name: 'App',
  components: {
    MyFrame,
    Login,
    Snackbar,
    Dialog,
    PlayerDetail,
    AffiliateDetail,
  },
  data() {
    return {
      version: process.env.VUE_APP_GIT_VERSION,
      commithash: process.env.VUE_APP_GIT_COMMITHASH,
      branch: process.env.VUE_APP_GIT_BRANCH,
      tag: process.env.VUE_APP_GIT_TAG,
      soundFiles: {
        withdrawal: {
          url: 'play.mp3',
        },
        deposit: { url: 'play_deposit.mp3' },
        alert: { url: 'play_alert.mp3' },
        bet_alarm: { url: 'play_bet_alarm.mp3' },
      },
    };
  },
  computed: {
    ...mapGetters(['notifications', 'soundSwitch']),
    StandBy() {
      return this.$store.getters.modalBox == 'standby';
    },
    isLogin() {
      return !!(this.$store.getters.token && Object.keys(this.$store.getters.user).length != 0);
    },
    playerId() {
      return this.$store.getters.playerId;
    },
    config() {
      return this.$store.getters.config;
    },
    timestamp() {
      return new Date() * 1;
    },
    token() {
      return this.$store.getters.token;
    },
    apiVersion() {
      return this.$store.getters.version;
    },
    packageVersion() {
      return this.$store.getters.packageVersion;
    },
  },
  watch: {
    token(t) {
      ws.initWebSocket();
    },
    notifications(notifications) {
      // console.log(this.notifications);
    },
    'notifications.user_deposit_confirm.count'(count) {
      console.log(`待入金：${count}, 聲音通知開關：${this.soundSwitch.deposit.value}`);
      if (this.soundSwitch.deposit.value && count) {
        // this.play(this.audio[1]);
        this.play('deposit');
      }
    },
    'notifications.user_withdrawal_confirm.count'(count) {
      console.log(`待出金：${count}, 聲音通知開關：${this.soundSwitch.withdrawal.value}`);
      if (this.soundSwitch.withdrawal.value && count) {
        // this.play(this.audio[0]);
        this.play('withdrawal');
      }
    },
    'notifications.operation_alarm.count'(count) {
      console.log(`操作異常：${count}, 聲音通知開關：${this.soundSwitch.alert.value}`);
      if (this.soundSwitch.alert.value && count) {
        // this.play(this.audio[2]);
        this.play('alert');
      }
    },
    'notifications.payment_alarm.count'(count) {
      console.log(`出入金異常：${count}, 聲音通知開關：${this.soundSwitch.alert.value}`);
      if (this.soundSwitch.alert.value && count) {
        // this.play(this.audio[2]);
        this.play('alert');
      }
    },
    'notifications.profit_alarm.count'(count) {
      console.log(`營利異常：${count}, 聲音通知開關：${this.soundSwitch.alert.value}`);
      if (this.soundSwitch.alert.value && count) {
        // this.play(this.audio[2]);
        this.play('alert');
      }
    },
    'notifications.bet_alarm.count'(count) {
      console.log(`投注异常：${count}, 聲音通知開關：${this.soundSwitch.alert.value}`);
      if (this.soundSwitch.alert.value && count) {
        this.play('bet_alarm');
      }
    },
    packageVersion(version) {
      version &&
        Object.keys(version).forEach(key => {
          switch (key) {
            case 'GIT_COMMITDETAIL':
              break;
            case 'DEPLOY_TIME':
              console.log(key, new Date(version[key]));
              break;
            default:
              console.log(key, version[key]);
          }
        });
    },
  },
  beforeMount() {
    this.$store.commit('ShowGlobal', 'standby');
    this.$store.dispatch('GET_VERSION');
    this.$store.dispatch('GET_PACKAGE_VERSION');
    this.$store.dispatch('CheckUserLogin');
    if (this.isLogin) {
      this.$store.dispatch('CONFIGURE');
    }
  },
  mounted() {
    this.$store.commit('ShowGlobal', '');
    this.loadMp3Bytes();
  },
  methods: {
    play(sound) {
      // const playPromise = audioElement.play();
      // if (playPromise !== undefined) {
      //   playPromise
      //     .then(() => {})
      //     .catch(error => {
      //       console.log(error);
      //     });
      // }

      const context = new AudioContext() || new webkitAudioContext();
      const bufferSource = context.createBufferSource();
      if (this.soundFiles[sound] || this.soundFiles[sound].buffer) {
        bufferSource.buffer = this.soundFiles[sound].buffer;
        bufferSource.connect(context.destination);
        if (bufferSource.context.state !== 'running') {
          bufferSource.context.resume();
        }
        bufferSource.start();
        // console.log(bufferSource.buffer);
      } else {
        throw new Exception('找不到音效');
      }
    },
    loadMp3Bytes() {
      const timeStamp = new Date() * 1;
      const context = new AudioContext() || new webkitAudioContext();
      _.each(this.soundFiles, file => {
        const request = new XMLHttpRequest();
        request.open('GET', `${file.url}?ts=${timeStamp}`, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
          context.decodeAudioData(request.response, buffer => {
            file.buffer = buffer;
          });
        };
        request.send();
      });
    },
  },
};
</script>
<style>
.x-small {
  min-width: unset !important;
}
.hands {
  cursor: pointer;
}
.v-application {
  font-family: 'Open Sans', 'Noto Sans', 'microsoft yahei', 'Verdana', 'arial', 'sans-serif';
}
.material-icons:before {
  display: none;
}
</style>
