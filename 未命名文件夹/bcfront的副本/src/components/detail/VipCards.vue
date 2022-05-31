<template>
  <div class="IdCards">
    <v-overlay absolute :value="loading"></v-overlay>
    <v-toolbar elevation="0" class="pl-2 rounded-lg">
      <v-icon class="mr-2">account_box</v-icon>
      <v-toolbar-title>{{ $t('g_vip_info') }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" icon depressed fab dark small class="mx-5" @click="showDetail = !showDetail">
        <v-icon>{{ showDetail ? `keyboard_arrow_up` : `keyboard_arrow_down` }}</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- 列表 -->
    <v-container v-if="showDetail" fluid class="pa-0">
      <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
        <v-row dense wrap>
          <!-- 上傳圖片 -->
          <v-col cols="2" class="">{{ $t('g_vip_level') }}</v-col>
          <!-- 顯示圖片 -->
          <v-col cols="4">{{ vipMap.has(vipNumber) ? vipMap.get(vipNumber) : value }}</v-col>
          <v-col cols="2" class="">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn v-bind="attrs" color="primary" small icon v-on="on" @click="openDialog">
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('g_btn_modify') }}</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card>
    </v-container>

    <!-- 圖片詳情彈窗 -->
    <v-dialog v-model="showZoomImg" persistent width="1000" :retain-focus="false">
      <v-toolbar dark color="primary">
        <v-toolbar-title class="headline ml-2">{{ $t('g_vip_adjustment') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" color="white" icon v-on="on" @click.native="showZoomImg = false">
              <v-icon>close</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('g_btn_close') }}</span>
        </v-tooltip>
      </v-toolbar>
      <v-card white align="center" class="pa-5">
        <v-container class="pb-8">
          <v-row>
            <v-col cols="2"
              ><span>{{ $t('g_vip_level') }}</span></v-col
            >
            <v-spacer></v-spacer>
          </v-row>
          <v-row justify="space-between">
            <template v-for="vipLv in vipList">
              <v-btn :key="vipLv" class="mx-2" :color="vipLv === selectVip ? 'green' : 'primary'" @click="() => changeVipNumber(vipLv)">
                {{ vipMap.get(vipLv) }}
              </v-btn>
            </template>
          </v-row>
          <v-row>
            <template v-if="showIsSendRewards">
              <v-col cols="6">
                <v-checkbox v-model="isSendRewards" :label="$t('g_vip_upgrade_w_rewards')"></v-checkbox>
              </v-col>
            </template>
            <template v-if="showIsRepeatSendRewards">
              <v-col cols="6">
                <v-checkbox v-model="isRepeatSendRewards" :label="$t('g_vip_upgrade_wout_rewards')"></v-checkbox>
              </v-col>
            </template>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <el-input type="textarea" placeholder="请输入备注内容" rows="3" v-model="remark" style="width:400px" maxlength="50" show-word-limit />
          <v-spacer></v-spacer>
          <v-btn color="primary" outlined @click="() => cancelEvent()"> {{ $t('g_btn_cancel') }} </v-btn>
          <v-btn color="primary" :disabled="oldVipLevel===selectVip" @click="() => confirmEvent()"> {{ $t('g_btn_confirm') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { PUT_PLAYER_VIP_SETTINGS } from '@/api/Uri';

export default {
  name: 'VipCards',
  props: {
    userId: {
      type: Number,
      default: () => 0,
    },
    // vip 等級代號
    value: {
      type: String,
      default: '0',
    },
  },
  data() {
    return {
      loading: false,
      showDetail: true,
      showZoomImg: false,
      selectVip: 0,
      oldVipLevel: 0,
      isSendRewards: false,
      isRepeatSendRewards: false,
      remark: ''
    };
  },
  computed: {
    vipMap() {
      return new Map(this.$store.state.sys.vip.map(vipData => [vipData.vipLv, vipData.vipLvDesc]));
    },
    vipList() {
      return this.$store.state.sys.vip.map(vipData => vipData.vipLv);
    },
    vipNumber() {
      return parseInt(this.value, 10);
    },
    isVipLevelUp() {
      return this.selectVip > this.vipNumber;
    },
    showIsSendRewards() {
      return this.isVipLevelUp;
    },
    showIsRepeatSendRewards() {
      return this.isVipLevelUp && this.isSendRewards;
    },
  },
  watch: {
    isVipLevelUp(newValue, oldValue) {
      if (!newValue) {
        this.isSendRewards = false;
        this.isRepeatSendRewards = false;
      } else {
        this.isSendRewards = true;
        this.isRepeatSendRewards = true;
      }
    },
  },
  created() {
    // 載入vip資料
    this.$store.dispatch('VIP_CONFIG');
  },
  methods: {
    openDialog() {
      this.oldVipLevel = parseInt(this.value, 10);
      this.selectVip = parseInt(this.value, 10);
      this.showZoomImg = true;
    },
    changeVipNumber(number) {
      this.selectVip = number;
    },
    confirmEvent() {
      if (!this.remark) {
        return this.$store.commit('MsgError', '请输入备注！');
      }
      const post = {
        userId: this.userId,
        vipLv: this.selectVip,
        isSendRewards: this.isSendRewards,
        isRepeatSendRewards: this.isRepeatSendRewards === true ? false : true,
        note: this.remark
      };
      api
        .post(PUT_PLAYER_VIP_SETTINGS, post)
        .then(_ => {
          this.$emit('input', String(this.selectVip));
        })
        .catch(error => {
          this.$store.commit('MsgError', `VIP_SETTING ERROR:${error.error}`);
        })
        .finally(() => {
          this.showZoomImg = false;
        });
    },
    cancelEvent() {
      this.showZoomImg = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.img-inputer {
  width: auto;
}
</style>
