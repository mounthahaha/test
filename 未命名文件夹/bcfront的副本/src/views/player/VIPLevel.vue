<template>
  <div class="VIPLevel">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <v-card
        elevation="0"
        class="pa-3 mb-3 rounded-lg"
        color="blue-grey lighten-4"
      >
        <v-row dense class="d-flex align-center justify-space-between">
          <v-col cols="4" class="d-flex align-center justify-center">
            <span class="px-3">用户VIP</span>
            <template v-for="item in vipEnableList">
              <v-btn
                :key="item.value"
                class="mx-1"
                :color="
                  item.value === vipSetting.vipEnable ? 'green' : 'primary'
                "
                @click="changeSetting('vipEnable', item.value)"
              >
                {{ item.content }}
              </v-btn>
            </template>
          </v-col>
          <!-- <v-col class="d-flex align-center justify-center">
            <span class="px-3">保级模式</span>
            <template v-for="item in vipModeList">
              <v-btn
                :key="item.value"
                class="mx-1"
                :color="item.value === vipSetting.vipMode ? 'green' : 'primary'"
                @click="changeSetting('vipMode', item.value)"
              >
                {{ item.content }}
              </v-btn>
            </template>
          </v-col> -->
          <!-- <v-col  cols="4" class="d-flex align-center justify-center">
            <span class="px-3">保级天数：</span>{{vipSetting.vip_period_day}}天
            <template v-for="item in vipCalcPeriodList">
              <v-btn
                :key="item.value"
                class="mx-1"
                :color="item.value === vipSetting.vipCalcPeriod ? 'green' : 'primary'"
                @click="changeSetting('vipCalcPeriod', item.value)"
              >
                {{ item.content }}
              </v-btn>
            </template> 
          </v-col> -->
        </v-row>
      </v-card>

      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          ref="dataTable"
          :headers="headerComputed"
          :items.sync="dataList"
          :loading="loading"
          class="elevation-1"
          :options="pagination"
          :server-items-length="pagination.totalItems"
        >
          <v-progress-linear
            slot="progress"
            color="blue"
            indeterminate
          ></v-progress-linear>
          <template slot="no-data"> {{ $t("g_text_noData") }} </template>
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <td class="text-left blue-grey lighten-5">
                  VIP{{ item.vipLv }}
                </td>
                <td class="text-left text-no-wrap">
                  <v-chip small outlined color="primary">
                    {{ item.vipLvDesc }}
                  </v-chip>
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.rechargeConditions | empty_to_dash }}
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.flowConditions | empty_to_dash }}
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.keepRechargeConditions | percent | empty_to_dash }}
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.keepFlowConditions | empty_to_dash }}
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.promotionRewards | empty_to_dash }}
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.rebate_multiple | percent | empty_to_dash }}
                </td>
                <td class="text-left text-no-wrap">
                  <div class="pay-channel-wrapper">
                    <div
                      class="pay-channel-item"
                      v-for="item in handlePayChannels(item.channelIDs)"
                      :key="item"
                    >
                      {{ item }}
                    </div>
                  </div>
                </td>
                <td class="text-center text-no-wrap">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        color="primary"
                        v-bind="attrs"
                        @click="editBtn(item)"
                        v-on="on"
                      >
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t("g_btn_edit") }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
        <!-- <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
        </div> -->
        <!-- 溫馨提醒 -->
        <v-row no-gutters class="body-2 mt-5 error--text">
          <v-col class="body-1 font-weight-bold my-2" cols="12">
            {{ $t("player_vip_reminder") }}
          </v-col>
          <v-col cols="12">{{ $t("player_vip_reminder1") }}</v-col>
          <v-col cols="12">{{ $t("player_vip_reminder2") }}</v-col>
          <v-col cols="12">{{ $t("player_vip_reminder3") }}</v-col>
          <v-col cols="12">{{ $t("player_vip_reminder4") }}</v-col>
        </v-row>
      </v-card>
    </v-container>

    <!-- VIP 彈窗 -->
    <VIPEditDialog
      v-if="Object.keys(editItem).length !== 0"
      v-model="editDialog"
      :item="editItem"
      :paymentChannels="paymentChannels"
    ></VIPEditDialog>
  </div>
</template>

<script>
import api from "@/api";
import VIPEditDialog from "./components/vip/VIPEditDialog";
import Vue from "vue";
import {
  GET_VIP_LIST_SETTINGS,
  GET_PATMENT_CHANNELS_LIST,
  PUT_VIP_SETTINGS,
} from "@/api/Uri";

export default {
  name: "VIPLevel",
  components: {
    VIPEditDialog,
  },
  data() {
    return {
      editDialog: false,
      settingDialog: false,
      editItem: {},
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
      },
      headers: [
        {
          lang: "player_vip_column_level",
          text: "等级",
          value: "vipLv",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_name",
          text: "名稱",
          value: "vipLvDesc",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_promoDeposit",
          text: "晉級存款條件",
          value: "rechargeConditions",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_promoRollover",
          text: "晉級流水條件",
          value: "flowConditions",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_relegationDeposit",
          text: "保級存款条件",
          value: "keepRechargeConditions",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_relegationRollover",
          text: "保級流水条件（元）",
          value: "keepFlowConditions",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_promotionBonus",
          text: "晉級獎勵金",
          value: "promotionRewards",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_rebatePromotion",
          text: "反水比例",
          value: "rebatePromotion",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "player_vip_column_pay_channels",
          text: "渠道配置",
          value: "channelIDs",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "left",
        },
        {
          lang: "g_table_column_action",
          text: "操作",
          value: "action",
          sortable: false,
          class: "text-no-wrap blue-grey lighten-5",
          align: "center",
        },
      ],
      vipSetting: {
        // vipCalcPeriod: null,
        vipEnable: null,
        vip_period_day: "",
        // vipMode: null,
      },
      paymentChannels: [],
    };
  },
  computed: {
    dataList() {
      return this.$store.state.sys.vip;
    },
    headerComputed() {
      return this.headers.map((item) => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
    vipEnableList() {
      return [
        {
          value: 1,
          content: "开启",
        },
        {
          value: 0,
          content: "关闭",
        },
      ];
    },
    // vipModeList() {
    //   return [
    //     {
    //       value: 1,
    //       content: '升降',
    //     },
    //     {
    //       value: 0,
    //       content: '固定',
    //     },
    //   ];
    // },
    vipCalcPeriodList() {
      return [
        {
          value: "1D",
          content: "每日",
        },
        {
          value: "1W",
          content: "每周",
        },
        {
          value: "1M",
          content: "每月",
        },
      ];
    },
  },
  mounted() {
    // this.loadData();
    // 載入vip資料
    this.$store.dispatch("VIP_CONFIG");
    this.loadPaymentChannels();
    this.loadVipSetting();
  },
  methods: {
    editBtn(item) {
      this.editItem = item;
      this.editDialog = true;
    },
    loadVipSetting() {
      api
        .get(GET_VIP_LIST_SETTINGS)
        .then(({ result }) => {
          this.vipSetting = result;
        })
        .catch((error) => {
          this.$store.commit("MsgError", `VIP_CONFIG ERROR:${error.error}`);
        });
    },
    loadPaymentChannels() {
      api
        .get(GET_PATMENT_CHANNELS_LIST)
        .then(({ result }) => {
          this.paymentChannels = result.list;
        })
        .catch((error) => {
          this.$store.commit("MsgError", `VIP_CONFIG ERROR:${error.error}`);
        });
    },
    changeSetting(type = "", value) {
      const post = {
        ...this.vipSetting,
        [type]: value,
      };
      api
        .post(PUT_VIP_SETTINGS, post)
        .then((_) => {
          this.loadVipSetting();
        })
        .catch((error) => {
          this.$store.commit("MsgError", `VIP_CONFIG ERROR:${error.error}`);
        });
    },
    handlePayChannels(Channels) {
      if (!Array.isArray(Channels) || !Channels.length) return;
      return Channels.map((item) => {
        return this.paymentChannels.find((item1) => item1.Id === item).Name;
      });
    },
  },
};
Vue.filter("empty_to_dash", (val) => {
  return val === null ? `－` : val;
});
Vue.filter("percent", (val) => {
  return isNaN(Number(val)) ? val : `${val}%`;
});
</script>


<style lang="scss">
.v-btn {
  &.radius {
    border-radius: 4px;
  }
}
.pay-channel-wrapper {
  display: flex;
  .pay-channel-item {
    background-color: #9d9fa3;
    color: #fff;
    margin-left: 5px;
    padding: 5px;
  }
}
</style>
