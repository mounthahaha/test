<template>
  <div class="RiskSetting">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
    </v-toolbar>

    <!-- 出入金示警设置 -->
    <v-card :key="domainIndex" class="ma-5 px-5 pt-2 pb-5 rounded-lg">
      <v-progress-linear :active="modify.payment.loading" color="blue" indeterminate />
      <v-card-title>
        <v-flex>{{ $t('system_riskControlSetting_title_payment') }}</v-flex>
        <v-spacer />
        <v-flex text-right>
          <v-btn v-if="modify.payment.readonly" class="d-inline-block" icon @click="modify.payment.readonly = !modify.payment.readonly">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn v-else class="d-inline-block" icon @click="savePaymentSetting()"><v-icon>save</v-icon></v-btn>
        </v-flex>
      </v-card-title>
      <v-card-text>
        {{ $t('system_riskControlSetting_description_payment1') }}
        <v-text-field
          v-if="settings.payment_alarm"
          v-model="settings.payment_alarm.withdrawal_greater_than_deposit_times"
          type="number"
          hide-details
          class="ma-2 d-inline-block risk-setting"
          dense
          outlined
          color="primary"
          :disabled="modify.payment.readonly"
          :readonly="modify.payment.readonly"
        >
        </v-text-field>
        {{ $t('system_riskControlSetting_description_payment2') }}
      </v-card-text>
    </v-card>

    <!-- 盈利示警设置 -->
    <v-card :key="domainIndex" class="ma-5 px-5 pt-2 pb-5 rounded-lg">
      <v-progress-linear :active="modify.profit.loading" color="blue" indeterminate />
      <v-card-title>
        <v-flex>{{ $t('system_riskControlSetting_title_profit') }}</v-flex>
        <v-spacer />
        <v-flex text-right>
          <v-btn v-if="modify.profit.readonly" class="d-inline-block" icon @click="modify.profit.readonly = !modify.profit.readonly">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn v-else class="d-inline-block" icon @click="saveProfitSetting()"><v-icon>save</v-icon></v-btn>
        </v-flex>
      </v-card-title>
      <v-card-text>
        {{ $t('system_riskControlSetting_description_profit1') }}
        <v-text-field
          v-if="settings.profit_alarm"
          v-model="settings.profit_alarm.accumulated.gain_continuation_days"
          type="number"
          hide-details
          class="ma-2 d-inline-block risk-setting"
          dense
          outlined
          color="primary"
          :disabled="modify.profit.readonly"
          :readonly="modify.profit.readonly"
        />
        {{ $t('system_riskControlSetting_description_profit2') }}
        <v-text-field
          v-if="settings.profit_alarm"
          v-model="settings.profit_alarm.accumulated.gain_amount_greater_than"
          type="number"
          hide-details
          class="ma-2 d-inline-block risk-setting"
          dense
          outlined
          color="primary"
          :disabled="modify.profit.readonly"
          :readonly="modify.profit.readonly"
        />
        <br />
        {{ $t('system_riskControlSetting_description_profit3') }}
        <v-text-field
          v-if="settings.profit_alarm"
          v-model="settings.profit_alarm.profit_greater_than_bet_times"
          type="number"
          hide-details
          class="ma-2 d-inline-block risk-setting"
          dense
          outlined
          color="primary"
          :disabled="modify.profit.readonly"
          :readonly="modify.profit.readonly"
        />
        {{ $t('system_riskControlSetting_description_profit4') }}
      </v-card-text>
    </v-card>

    <!-- 操作示警配置 -->
    <v-card :key="domainIndex" class="ma-5 px-5 pt-2 pb-5 rounded-lg">
      <v-progress-linear :active="modify.operation.loading" color="blue" indeterminate />
      <v-card-title>
        <v-flex>{{ $t('system_riskControlSetting_title_operation') }}</v-flex>
        <v-spacer />
        <v-flex text-right>
          <v-btn v-if="modify.operation.readonly" class="d-inline-block" icon @click="modify.operation.readonly = !modify.operation.readonly">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn v-else class="d-inline-block" icon @click="saveOperationSetting()"><v-icon>save</v-icon></v-btn>
        </v-flex>
      </v-card-title>
      <v-card-text>
        {{ $t('system_riskControlSetting_description_operation1') }}
        <v-text-field
          v-if="settings.operation_alarm"
          v-model="settings.operation_alarm.same_ip_count"
          type="number"
          hide-details
          class="ma-2 d-inline-block risk-setting"
          dense
          outlined
          color="primary"
          :disabled="modify.operation.readonly"
          :readonly="modify.operation.readonly"
        >
        </v-text-field>
        {{ $t('system_riskControlSetting_description_operation2') }}
        <v-checkbox
          v-if="settings.operation_alarm"
          v-model="is_restrict_same_device"
          :label="$t('system_riskControlSetting_description_operation3')"
          color="primary"
          class="d-inline-block"
          hide-details
          outlined
          :disabled="modify.operation.readonly"
          :readonly="modify.operation.readonly"
          :value="Boolean(settings.operation_alarm.is_restrict_same_device)"
        >
        </v-checkbox>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from '@/api';
export default {
  name: 'RiskSetting',
  components: {},
  data() {
    return {
      loading: false,
      settings: {},
      modify: {
        payment: {
          readonly: true,
          loading: false,
        },
        profit: {
          readonly: true,
          loading: false,
        },
        operation: {
          readonly: true,
          loading: false,
        },
      },
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    is_restrict_same_device: {
      get() {
        return this.settings.operation_alarm.is_restrict_same_device;
      },
      set(val) {
        this.settings.operation_alarm.is_restrict_same_device = Boolean(val);
      },
    },
  },
  watch: {},
  created() {
    this.getRiskSettings();
  },
  methods: {
    getRiskSettings() {
      this.modify.payment.loading = this.modify.profit.loading = this.modify.operation.loading = true;
      api
        .get('/system/risk_control_setting')
        .then(resp => {
          this.settings = resp;
          this.modify.payment.loading = this.modify.profit.loading = this.modify.operation.loading = false;
        })
        .catch(error => {});
    },
    savePaymentSetting() {
      let { withdrawal_greater_than_deposit_times } = this.settings.payment_alarm;
      withdrawal_greater_than_deposit_times = Number(withdrawal_greater_than_deposit_times);
      if (this.modify.payment.loading) {
        return;
      }
      this.modify.payment.loading = true;
      api
        .patch('/system/risk_control_setting/payment-alarm', {
          withdrawal_greater_than_deposit_times,
        })
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.modify.payment.readonly = true;
          this.modify.payment.loading = false;
        })
        .catch(error => {
          this.modify.payment.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    saveProfitSetting() {
      const { accumulated } = this.settings.profit_alarm;
      let { profit_greater_than_bet_times } = this.settings.profit_alarm;
      profit_greater_than_bet_times = Number(profit_greater_than_bet_times);
      accumulated.gain_continuation_days = Number(accumulated.gain_continuation_days);
      accumulated.gain_amount_greater_than = Number(accumulated.gain_amount_greater_than);
      console.log(accumulated, profit_greater_than_bet_times);
      if (this.modify.profit.loading) {
        return;
      }
      this.modify.profit.loading = true;
      api
        .patch('/system/risk_control_setting/profit-alarm', {
          accumulated,
          profit_greater_than_bet_times,
        })
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.modify.profit.readonly = true;
          this.modify.profit.loading = false;
        })
        .catch(error => {
          this.modify.profit.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    saveOperationSetting() {
      let { is_restrict_same_device, same_ip_count } = this.settings.operation_alarm;
      is_restrict_same_device = Boolean(is_restrict_same_device);
      same_ip_count = Number(same_ip_count);
      if (this.modify.operation.loading) {
        return;
      }
      this.modify.operation.loading = true;
      api
        .patch('/system/risk_control_setting/operation-alarm', {
          is_restrict_same_device,
          same_ip_count,
        })
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.modify.operation.readonly = true;
          this.modify.operation.loading = false;
        })
        .catch(error => {
          this.modify.operation.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
<style lang="scss">
.risk-setting.v-input input {
  text-align: center;
  width: 4em;
}
</style>
