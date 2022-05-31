<template>
  <v-dialog v-model="model" persistent width="700px">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title class="headline">{{
            $t("player_vip_editDialog_editLevelConf")
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="model = false">
                <v-icon>close</v-icon>
              </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-card-text>
          <v-layout wrap>
            <template v-for="(element, index) in dataStructure">
              <v-flex
                :key="`title_${element.model}_${index}`"
                xs3
                text-xs-right
                mt-3
              >
                <span class="">{{ $t(element.title) }}</span>
              </v-flex>
              <v-flex :key="`input_${element.model}_${index}`" xs4>
                <v-card flat>
                  <v-card-text
                    v-if="element.disable"
                    class="py-3 mb-4 grey lighten-1 text-center"
                    >VIP{{ field[element.model] }}</v-card-text
                  >
                  <v-card-text
                    v-else-if="checkOnlyRead(element.model)"
                    class="py-3 mb-4 grey lighten-1 text-center"
                  >
                    －
                  </v-card-text>
                  <v-text-field
                    v-else-if="element.type === 'text'"
                    :ref="element.model"
                    v-model="field[element.model]"
                    :rules="element.rules.map((rule) => rule())"
                    :label="element.label"
                    solo
                  >
                  </v-text-field>
                  <v-text-field
                    v-else-if="element.type === 'number'"
                    :ref="element.model"
                    v-model.number="field[element.model]"
                    :type="element.type"
                    :rules="element.rules.map((rule) => rule())"
                    :label="element.label"
                    :suffix="element.suffix"
                    solo
                  >
                  </v-text-field>
                </v-card>
              </v-flex>
              <v-flex
                :key="`tips_${element.model}_${index}`"
                xs5
                text-left
                mt-3
                pl-2
              >
                <span
                  v-if="!checkOnlyRead(element.model)"
                  :class="element.tipsColor"
                  >{{ $t(element.tips) }}</span
                >
              </v-flex>
            </template>
            <!-- 進階設定按鍵 -->
            <template v-if="!showAdvanceStructure">
              <v-flex xs3 text-xs-right mt-3></v-flex>
              <v-flex xs4
                ><v-btn
                  color="primary"
                  class="x-small"
                  depressed
                  @click="() => (showAdvanceStructure = true)"
                  >进阶设定</v-btn
                ></v-flex
              >
              <v-flex xs5 text-left mt-3 pl-2></v-flex>
            </template>
            <!-- 進階設定 -->
            <template v-else>
              <!-- 晉級紅利 -->
              <v-flex xs3 text-xs-right mt-3>
                <span class="">{{
                  $t("player_vip_column_promotionBonus")
                }}</span>
              </v-flex>
              <v-flex xs4>
                <v-text-field
                  ref="promotionRewards"
                  v-model.number="field.promotionRewards"
                  type="number"
                  label="promotionRewards"
                  :rules="[emptyCheck(), positiveInteger()]"
                  solo
                >
                </v-text-field>
              </v-flex>
              <v-flex xs5 text-left mt-3 pl-2></v-flex>
              <!-- 紅利流水 -->
              <v-flex xs3 text-xs-right mt-3>
                <span class="">紅利流水</span>
              </v-flex>
              <v-flex xs4>
                <v-text-field
                  ref="betMultiple"
                  v-model.number="field.betMultiple"
                  type="number"
                  label="betMultiple"
                  :rules="[emptyCheck(), positiveInteger()]"
                  suffix="%"
                  solo
                >
                </v-text-field>
              </v-flex>
              <v-flex xs5 text-left mt-3 pl-2></v-flex>
              <!-- 紅利領取截止 -->
              <v-flex xs3 text-xs-right mt-3>
                <span class="">红利领取截止</span>
              </v-flex>
              <v-flex xs1 text-xs-right mt-3>
                <span class="">发送后</span>
              </v-flex>
              <v-flex xs4>
                <v-text-field
                  ref="betMultiple"
                  v-model.number="field.promotionRewardsPeriod"
                  type="number"
                  label="betMultiple"
                  :rules="[emptyCheck(), nonNegativeInteger()]"
                  solo
                >
                </v-text-field>
              </v-flex>
              <v-flex xs4 text-xs-right mt-3 pl-3>
                <span class="">天</span>
              </v-flex>
              <!-- 渠道配置 -->
              <v-flex xs3 text-xs-right mt-3>
                <span class="">{{ $t("player_vip_column_pay_channels") }}</span>
              </v-flex>
              <v-flex xs9>
                <el-select v-model="field.channelIDs" multiple :placeholder="$t('g_placeholder_choose')">
                  <el-option
                    v-for="item in paymentChannels"
                    :key="item.Id"
                    :label="item.Name"
                    :value="item.Id"
                  >
                  </el-option>
                </el-select>
              </v-flex>
            </template>
          </v-layout>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            class="x-small"
            outlined
            :loading="loading"
            @click="model = false"
            >{{ $t("g_btn_cancel") }}</v-btn
          >
          <v-btn
            color="primary"
            class="x-small"
            depressed
            :loading="loading"
            @click="submit"
            >{{ $t("g_btn_confirm") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import api from "@/api";
import { PUT_VIP_LEVEL_SETTINGS } from "@/api/Uri";
export default {
  name: "VIPEditDialog",
  model: {
    prop: "active",
    event: "update",
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => {},
    },
    paymentChannels:{
       type: Array,
       default: () => [],
    }
  },
  data() {
    return {
      valid: false,
      errorMessages: "",
      field: {},
      showAdvanceStructure: false,
      dataStructure: [
        {
          title: "player_vip_editDialog_level",
          model: "vipLv",
          label: "",
          type: "text",
          disable: true,
          tips: "",
        },
        {
          title: "player_vip_editDialog_name",
          model: "vipLvDesc",
          label: "限制四个字元",
          type: "text",
          rules: [this.emptyCheck, this.limitMaxFour],
          tips: "player_vip_editDialog_tips_required",
          tipsColor: "red--text",
        },
        // 充值条件：
        {
          title: "player_vip_column_promoDeposit",
          model: "rechargeConditions",
          label: "",
          type: "number",
          rules: [this.emptyCheck],
          tips: "player_vip_editDialog_tips_requiredLevel",
          tipsColor: "red--text",
        },
        // 流水条件：
        {
          title: "player_vip_column_promoRollover",
          model: "flowConditions",
          label: "",
          type: "number",
          rules: [this.emptyCheck],
          tips: "player_vip_editDialog_tips_requiredLevel",
          tipsColor: "red--text",
        },
        // 充值优惠：
        {
          title: "player_vip_column_relegationDeposit",
          model: "keepRechargeConditions",
          label: "",
          type: "number",
          rules: [this.emptyCheck, this.numberCheck],
          suffix: "%",
          // tips: 'player_vip_editDialog_tips_zero',
        },
        // 充值优惠：
        {
          title: "player_vip_column_relegationRollover",
          model: "keepFlowConditions",
          label: "",
          type: "number",
          rules: [this.emptyCheck, this.numberCheck],
          suffix: "%",
          // tips: 'player_vip_editDialog_tips_zero',
        },
        // 反水比例：
        {
          title: "player_vip_column_rebatePromotion",
          model: "rebate_multiple",
          label: "",
          type: "number",
          rules: [this.emptyCheck, this.numberCheck],
          suffix: "%",
          tips: "player_vip_editDialog_tips_required",
          tipsColor: "red--text",
        },
      ],
      loading: false,
    };
  },
  computed: {
    model: {
      get() {
        if (this.active) {
          this.init();
        }
        return this.active;
      },
      set(value) {
        if (typeof value === "boolean") {
          this.$emit("update", value);
        }
      },
    },
  },
  methods: {
    init() {
      this.showAdvanceStructure = false;
      this.field = {
        ...this.item,
        promotionRewardsPeriod: this.filterPromotionRewardsPeriod(
          this.item.promotionRewardsPeriod
        ),
      };
    },
    // 文字轉成數字
    filterPromotionRewardsPeriod(str = "1D") {
      if (str.endsWith("D")) {
        // 日
        return parseInt(str.slice(0, -1), 10);
      } else if (str.endsWith("W")) {
        // 週
        return parseInt(str.slice(0, -1), 10) * 7;
      } else if (str.endsWith("M")) {
        // 月
        return parseInt(str.slice(0, -1), 10) * 30;
      } else {
        return parseInt(str, 10);
      }
    },
    submit() {
      let flag = true;
      // TODO: 這段有時間要優化
      this.dataStructure.forEach((item) => {
        if (
          this.$refs[item.model] &&
          Object.keys(this.$refs[item.model]).length !== 0
        ) {
          if (!this.$refs[item.model][0].validate(true)) {
            flag = false;
          }
        }
      });
      if (flag) {
        this.loading = true;
        const post = {
          ...this.field,
          promotionRewardsPeriod: `${this.field.promotionRewardsPeriod}D`,
        };
        api
          .post(PUT_VIP_LEVEL_SETTINGS, post)
          .then((data) => {
            this.$store.commit("MsgOk", "编辑成功");
            this.$store.dispatch("VIP_CONFIG");
            this.model = false;
          })
          .catch((error) => {
            this.$store.commit("MsgError", error.error);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    numberCheck() {
      return (val) => !isNaN(Number(val)) || "必须为数字";
    },
    // 須為正整數  但可以 為空  為null
    positiveInteger() {
      return (val) =>
        /^[0-9]*[1-9][0-9]*$/.test(val) ||
        val === "" ||
        val === null ||
        "必须为正整数.";
    },
    // 須為非负整数 0 1 2 3 4 5  但可以 為空  為null
    nonNegativeInteger() {
      return (val) =>
        /^[0-9]+$/.test(val) || val === "" || val === null || "必须为非负整数.";
    },
    positiveFloat() {
      return (val) =>
        /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/.test(
          val
        ) || "必须为正数";
    },
    emptyCheck() {
      return (val) => val !== "" || "必填栏位";
    },
    limitMaxFour() {
      return (val) => (!!val && val.length <= 4) || "限制最多四个字元";
    },
    checkOnlyRead(key) {
      return (
        this.field.vip_lv === 0 &&
        ["recharge_conditions", "promotion_rewards"].includes(key)
      );
    },
  },
};
</script>

<style scoped lang="scss">
.el-select {
  width: 100%;
      box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
      ::v-deep input {
          border: none !important;
      }
     ::v-deep .is-focus {
       input {
        border: 1px solid #000 !important;
      }
      }
       
}

</style>
