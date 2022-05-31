<template>
  <div class="RiskSetting">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
    </v-toolbar>

    <!-- 未参加优惠活动设置 -->
    <template v-for="(code, i) in codes">
      <div :key="i">
        <v-card class="ma-5 px-5 pt-2 pb-5 rounded-lg">
          <v-card-title>
            <v-flex>
              {{ titles[code] }}
              <v-btn v-if="!settings[code].isEditing" class="d-inline-block" icon @click="settings[code].isEditing = !settings[code].isEditing">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn
                v-else
                color="primary"
                :disabled="
                  code == 'sportPromotionFlow'
                    ? !forms[code] || !settings[code].config.Val.date || settings[code].config.Val.date.length != 2
                    : !forms[code]
                "
                class="d-inline-block"
                icon
                @click.prevent="save(code)"
                ><v-icon>save</v-icon></v-btn
              >

              <v-tooltip v-if="code === 'sportPromotionFlow'" bottom>
                <template #activator="{ on, attrs }">
                  <v-btn color="primary" icon depressed fab dark small class="mx-2" v-bind="attrs" v-on="on" @click.prevent="reset">
                    <v-icon>loop</v-icon>
                  </v-btn>
                </template>
                <span>活动重置</span>
              </v-tooltip>
            </v-flex>
            <v-spacer />
            <v-flex text-right>
              <!-- 有效流水計算條件開關 -->
              <v-chip v-if="settings[code].config.Val" :class="settings[code].switchOnOff ? 'green white--text' : 'grey white--text'">
                <span>{{ `有效流水计算条件${settings[code].switchOnOff ? '开启' : '关闭'}` }}</span>
                <v-switch
                  v-model="settings[code].switchOnOff"
                  color="white"
                  depressed
                  fab
                  dark
                  small
                  class="mx-2 d-inline-block"
                  @click.prevent="save(code)"
                >
                </v-switch>
              </v-chip>
            </v-flex>
          </v-card-title>
          <v-card-text v-if="settings[code].config.Val">
            <v-progress-linear :active="loading" color="blue" indeterminate />
            <v-form :ref="`form${code}`" v-model="forms[code]" lazy-validation>
              <v-row v-if="code === 'sportPromotionFlow'" class="mb-2">
                <v-col cols="4">
                  <datetime-range
                    v-model="settings[code].config.Val.date"
                    :disabled="!settings[code].isEditing"
                    :readonly="!settings[code].isEditing"
                    required
                    type="daterange"
                  />
                </v-col>
              </v-row>
              欧洲盘赔率
              <v-text-field
                v-model.number="settings[code].config.Val.min"
                v-bind="textfieldOptions"
                :disabled="!settings[code].isEditing"
                :readonly="!settings[code].isEditing"
                min="0.50"
                step="0.05"
                :rules="[rules.compare[code].min, rules.minimum, rules.nonNegative]"
              />
              -
              <v-text-field
                v-model.number="settings[code].config.Val.max"
                v-bind="textfieldOptions"
                :disabled="!settings[code].isEditing"
                :readonly="!settings[code].isEditing"
                min="0.50"
                step="0.05"
                :rules="[rules.compare[code].max, rules.minimum, rules.nonNegative]"
              />
              ，有效投注流水以盈利金额计算，未盈利以投注金额计算。<br />欧洲盘赔率
              <v-text-field v-model="settings[code].config.Val.max" v-bind="textfieldOptions" :disabled="true" :readonly="true" />
              以上，有效投注流水以投注金额计算。<br />欧洲盘赔率
              <v-text-field v-model="settings[code].config.Val.min" v-bind="textfieldOptions" :disabled="true" :readonly="true" />
              以下，为无效投注流水。<br /><br />总输赢为0时，不计算投注有效流水。
            </v-form>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script>
import api from '@/api';
import { postConfigByCode, getConfigByCode, decodeConfigAPIValue, encodeConfigAPIValue } from '@/lib/configAPI';

export default {
  name: 'TurnoverSetting',
  components: {},
  data() {
    const codes = ['sportFlow', 'sportPromotionFlow'];
    const settings = {};
    const forms = {};
    codes.forEach(code => {
      settings[code] = {
        isEditing: false,
        switchOnOff: false,
        config: {
          Used: 0,
        },
      };
      forms[code] = false;
    });
    return {
      forms,
      textfieldOptions: {
        type: 'number',
        class: 'ma-2 d-inline-block turnover-setting',
        dense: true,
        outlined: true,
        color: 'primary',
      },
      codes,
      titles: {
        sportFlow: '未参加优惠活动设置',
        sportPromotionFlow: '参加优惠活动设置',
      },
      loading: false,
      raw: {},
      settings,

      // 1－1。赔率未输入，无法储存并提示：请完整输入赔率。

      // 2－1。低于0.50时，送出后无法储存并提示：数值不能小于0.50。

      // 3－1。前者高于后者时，送出后无法储存并提示：低赔率数值不能高于高赔率。

      // 4－1。数值输入为负数时，送出后无法储存并提示：数值不能为负数。
      // 错误提示：

      // 1－1。赔率未输入，无法储存并提示：请完整输入赔率。

      // // 1－2。活动日期未设置，无法储存并提示：请选择活动日期。
      // 错误提示：

      // 1－1。日期格式选择错误，无法储存并提示：日期格式错误。
      rules: {
        compare: {
          sportFlow: {
            min: val => val < this.settings.sportFlow.config.Val.max || '低赔率数值不能高于高赔率。',
            max: val => this.settings.sportFlow.config.Val.min < val || '低赔率数值不能高于高赔率。',
          },
          sportPromotionFlow: {
            min: val => val < this.settings.sportPromotionFlow.config.Val.max || '低赔率数值不能高于高赔率。',
            max: val => this.settings.sportPromotionFlow.config.Val.min < val || '低赔率数值不能高于高赔率。',
          },
        },
        nonNegative: val => val > 0 || '数值不能为负数。',
        minimum: val => val >= 0.5 || '数值不能小于0.50。',
      },
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  created() {
    this.loading = true;
    this.codes.forEach(code => {
      this.getSettings(code);
    });
  },
  methods: {
    save(code) {
      const { Val } = this.settings[code].config;
      const { switchOnOff } = this.settings[code];
      const used = switchOnOff ? 3 : 0;
      this.loading = true;
      if (Val.date.length == 2) {
        Val.startDate = Val.date[0];
        Val.endDate = Val.date[1];
        delete Val.date;
      }
      postConfigByCode({
        code,
        used,
        val: JSON.stringify(Val),
      }).then(data => {
        this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
        this.loading = false;
        this.settings[code].isEditing = false;
        this.getSettings(code);
      });
    },
    getSettings(code) {
      getConfigByCode({ code }).then(data => {
        data.result.Val = JSON.parse(data.result.Val || '{}');
        const { startDate, endDate } = data.result.Val;
        data.result.Val.date = startDate && endDate ? [startDate, endDate] : [];
        this.settings[code].config = data.result;
        this.settings[code].switchOnOff = data.result.Used === 3;
        this.loading = false;
      });
    },
    reset() {
      this.$store.commit('Confirm', {
        text: '是否确认重置资料，确认后无法回复！',
        ok: () => {
          api
            .delete('/player/joinActivity')
            .then(result => {
              this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
            })
            .catch(e => {
              this.$store.commit('MsgError', e.error);
            })
            .finally(() => {
              this.loading = false;
            });
        },
        cancel: () => {},
      });
    },
    check(val) {
      console.log(val);
    },
  },
};
</script>
<style lang="scss">
.turnover-setting.v-input input {
  text-align: center;
  width: 4em;
}
</style>
