<template>
  <div>
    <v-menu v-model="show" open-on-hover close-delay="300" offset-y nudge-top="-10px" nudge-right="-30px">
      <template #activator="{ on }">
        <v-btn :disabled="!webSocketStatus" icon large v-on="on">
          <!-- <v-icon dark>notifications_active</v-icon>
          <v-avatar v-if="!show && Boolean(total)" class="x-small error white--text">{{ total }}</v-avatar> -->
          <v-badge :color="webSocketStatus && total ? 'red' : 'transparent'" :content="total" offset-y="10">
            <v-icon dark>notifications_active</v-icon>
          </v-badge>
        </v-btn>
      </template>
      <v-list v-if="notifications.online_user">
        <template v-for="(item, i) in list">
          <v-list-item v-if="item.isShow" :key="i" @click="$router.push(item.route)">
            <v-list-item-title>{{ $t(item.lang) }} </v-list-item-title>
            <v-avatar v-if="notifications[item.key] && notifications[item.key].count" :class="isLighten(notifications[item.key].count)">
              {{ notifications[item.key].count }}
            </v-avatar>
          </v-list-item>
        </template>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import _ from 'lodash';
export default {
  name: 'Notifications',
  data: () => ({
    total: 0,
    show: false,
  }),
  computed: {
    ...mapGetters({ notifications: 'notifications', webSocketStatus: 'webSocketStatus' }),
    is_bet() {
      return this.$store.getters.config.is_bet === '1';
    },
    list() {
      return [
        {
          route: '/player/online',
          lang: 'risk_notification_onlinePlayers',
          key: 'online_user',
          isShow: true,
        },
        // {
        //   route: '/player/online',
        //   lang: 'risk_notification_feedback',
        //   key: 'feedback',
        // },
        {
          route: '/finance/withdrawal',
          lang: 'risk_notification_withdrawRequests',
          key: 'user_withdrawal_confirm',
          isShow: true,
        },
        {
          route: '/finance/deposit',
          lang: 'risk_notification_depositRequests',
          key: 'user_deposit_confirm',
          isShow: true,
        },
        {
          route: '/risk/list/payment',
          lang: 'risk_notification_paymentAlarm',
          key: 'payment_alarm',
          isShow: true,
        },
        {
          route: '/risk/list/profit',
          lang: 'risk_notification_profitAlarm',
          key: 'profit_alarm',
          isShow: true,
        },
        {
          route: '/risk/list/operation',
          lang: 'risk_notification_operationAlarm',
          key: 'operation_alarm',
          isShow: true,
        },
        {
          route: '/report/gamelogs',
          lang: 'risk_notification_betAlarm',
          key: 'bet_alarm',
          isShow: this.is_bet,
        },
      ];
    },
  },
  watch: {
    notifications(payload) {
      this.updateNotifications();
    },
  },
  created() {
    // console.log('notifications', this.notifications);
    this.updateNotifications();
  },
  methods: {
    updateNotifications() {
      // console.log('notifications', this.notifications);
      let total = 0;
      _.each(this.notifications, (item, label) => {
        // if (label == 'online_user') {
        //   total += item.data.online;
        // } else {
        total += item.count;
        // }
      });
      this.total = total;
    },
    isLighten(count) {
      if (!count) {
        return 'small error white--text lighten-3';
      } else {
        return 'small error white--text';
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.v-avatar.x-small {
  width: 2em !important;
  height: 2em !important;
  min-width: 2em !important;
  margin-top: -1em;
  right: 0;
  position: absolute;
}
.v-avatar.small {
  width: 2em !important;
  height: 2em !important;
  min-width: 2em !important;
  margin-left: 0.3em;
  font-size: 0.75em;
}
</style>
