<template>
  <div>
    <v-dialog v-model="model" persistent width="1000px" :retain-focus="false" eager>
      <v-overlay absolute :value="loading"></v-overlay>
      <v-toolbar dark color="primary">
        <v-toolbar-title class="headline">{{ isInsert ? $t('cms_promotion_add_promotion') : $t('cms_promotion_edit_promotion') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click.native="closeDialog">
              <v-icon>close</v-icon>
            </v-btn>
          </template>
        </v-menu>
      </v-toolbar>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card style="overflow: scroll" :loading="loading" height="750px" tile>
          <v-card-text v-if="!fetchLoading">
            <v-row class="ma-0">
              <!--活动類型-->
              <v-col class="text-right" align-self="center" cols="2">
                <span>{{ $t('cms_promotion_dialog_type') }}：</span>
              </v-col>
              <v-col v-if="isDefaultItem" cols="10">
                <v-row no-gutters align="center">
                  <v-col class="grey darken-1 white--text text-center d-flex align-center justify-center" style="height: 38px" cols="5">
                    <strong>{{ $t('cms_promotion_dialog_first_charge') }}</strong>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-else cols="10">
                <v-btn-toggle v-model.number="inputPost.promotion_type" class="blue-btn-group" tile mandatory @change="defaultContentChange">
                  <v-btn
                    v-for="(item, key) in options.promotion_type"
                    :key="`promotion_type_${key}`"
                    small
                    depressed
                    :value="Number(key)"
                    height="38px"
                    tile
                  >
                    <span class="px-4">{{ item }}</span>
                  </v-btn>
                </v-btn-toggle>
              </v-col>
              <!--活动名稱-->
              <v-col class="text-right" cols="2">
                <p class="mt-2">{{ $t('cms_promotion_dialog_promotion_name') }}：</p>
              </v-col>
              <v-col class="pb-0" cols="9">
                <v-text-field
                  ref="title"
                  v-model="inputPost.title"
                  type="text"
                  :label="$t('cms_promotion_dialog_placeholder_promotion_name')"
                  :rules="[rules.emptyCheck]"
                  error
                  solo
                  dense
                >
                </v-text-field>
              </v-col>
              <!--一次性優惠-->
              <template v-if="isDefaultItem">
                <v-col class="text-right text-no-wrap" cols="2">
                  <p class="mt-2">{{ $t('cms_promotion_dialog_one_time_discount') }}：</p>
                </v-col>
                <v-col class="pb-0" cols="9">
                  <v-row no-gutters>
                    <v-col cols="5">
                      <v-text-field
                        ref="gain_rate"
                        v-model.number="inputPost.gain_rate"
                        class="v-input-number-box"
                        type="number"
                        :label="$t('cms_promotion_dialog_turnover_multiple')"
                        :rules="[rules.emptyCheck, rules.positiveFloat]"
                        :suffix="'%'"
                        solo
                        dense
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </template>
              <template v-if="isConditionsNotEmpty">
                <!--活动時間-->
                <v-col class="text-right" cols="2">
                  <p class="mt-2">{{ $t('cms_promotion_dialog_promotion_time') }}：</p>
                </v-col>
                <v-col class="pb-0 text-no-wrap" cols="10">
                  <v-row no-gutters>
                    <v-col cols="5">
                      <el-date-picker
                        v-model="inputPost.start_time"
                        type="datetime"
                        :placeholder="$t('g_selector_time')"
                        class="el-date-editor-vuetify-text-field small"
                        :disabled="disabled"
                        :clearable="false"
                        :picker-options="startPickerOptions"
                        default-time="08:00:00"
                        @change="inputPost.end_time = null"
                      >
                      </el-date-picker>
                    </v-col>
                    <v-col class="text-center" cols="1">
                      <p class="mt-2">～</p>
                    </v-col>
                    <v-col cols="5">
                      <el-date-picker
                        v-model="inputPost.end_time"
                        type="datetime"
                        :placeholder="$t('g_selector_time')"
                        class="el-date-editor-vuetify-text-field small"
                        :disabled="disabled"
                        :clearable="false"
                        :picker-options="endPickerOptions"
                        default-time="08:00:00"
                      >
                      </el-date-picker>
                    </v-col>
                  </v-row>
                </v-col>
                <!--活动方式-->
                <v-col class="text-right" cols="2">
                  <p class="mt-2">{{ $t('cms_promotion_dialog_promotion_time') }}：</p>
                </v-col>
                <v-col class="pb-0" cols="9">
                  <v-btn-toggle v-model.number="inputPost.calc_type" class="blue-btn-group" tile mandatory @change="defaultContentChange">
                    <v-btn v-for="(item, key) in options.ct" :key="`calc_type_${key}`" small depressed :value="Number(key)" height="38px" tile>
                      <span class="px-4">{{ item }}</span>
                    </v-btn>
                  </v-btn-toggle>
                </v-col>
                <!--適用等級-->
                <v-col class="text-right" cols="2">
                  <p class="mt-2">{{ $t('cms_promotion_dialog_level') }}：</p>
                </v-col>
                <v-col class="pb-0" cols="10">
                  <v-btn-toggle v-model="inputPost.vip_level" class="blue-border-btn-group" tile multiple>
                    <v-btn
                      v-for="item in $store.state.sys.vip"
                      :key="`promotion_type_${item.vipLv}`"
                      class="mr-1 pa-0"
                      :value="item.vipLv"
                      height="38px"
                      width="42px"
                      tile
                      depressed
                    >
                      <span>{{ item.vipLvDesc }}</span>
                    </v-btn>
                  </v-btn-toggle>
                </v-col>
                <!--贈金方式-->
                <v-col class="text-right" cols="2">
                  <p class="mt-2">{{ $t('贈金方式') }}：</p>
                </v-col>
                <v-col class="pb-0" cols="9">
                  <v-btn-toggle v-model.number="inputPost.unit" class="blue-btn-group" tile mandatory @change="defaultContentChange">
                    <v-btn
                      v-for="(item, key) in ['自定義金額', '百分比']"
                      :key="`unit_type_${key}`"
                      small
                      :value="Number(key)"
                      height="38px"
                      tile
                      depressed
                    >
                      <span class="px-4">{{ item }}</span>
                    </v-btn>
                  </v-btn-toggle>
                </v-col>
                <!--赠送金额 區塊-->
                <v-col class="py-0 text-no-wrap" cols="2">
                  <v-row>
                    <v-col class="text-right" cols="12">
                      <p class="mt-2">
                        {{
                          inputPost.promotion_type === 2 ? $t('cms_promotion_dialog_turnover_recharge') : $t('cms_promotion_dialog_turnover_amount')
                        }}：
                      </p>
                    </v-col>
                    <v-col class="text-right" cols="12">
                      <p class="mt-2">{{ $t('cms_promotion_dialog_credit') }}：</p>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col class="py-0" cols="10">
                  <v-row class="grey lighten-3 py-3 pl-3" no-gutters>
                    <template v-for="condition in inputPost.conditions">
                      <v-col :key="condition.rank" class="mr-1" style="flex: 0 0 9.3% !important">
                        <v-row no-gutters>
                          <v-col :cols="Number(condition.rank) + 1 === inputPost.conditions.length ? 11 : 12">
                            <v-text-field
                              :ref="`amount_${condition.rank}`"
                              v-model.number="condition.amount"
                              class="v-input-number-box--tiny v-input-number-box"
                              type="number"
                              :rules="[rules.emptyCheck, compareLeft(condition)]"
                              solo
                              dense
                              hide-details
                            />
                          </v-col>
                          <v-col
                            v-if="Number(condition.rank) + 1 === inputPost.conditions.length"
                            class="text-no-wrap pl-1"
                            align-self="center"
                            cols="1"
                          >
                            <span>{{ $t('cms_promotion_dialog_above') }}</span>
                          </v-col>
                          <v-col class="pt-8" :cols="Number(condition.rank) + 1 === inputPost.conditions.length ? 11 : 12">
                            <v-text-field
                              :ref="`gain_${condition.rank}`"
                              v-model.number="condition.gain"
                              class="v-input-number-box--tiny v-input-number-box"
                              type="number"
                              :rules="[rules.emptyCheck]"
                              solos
                              dense
                              error
                              hide-details
                            />
                          </v-col>
                          <v-col
                            v-if="Number(condition.rank) + 1 === inputPost.conditions.length"
                            class="pt-8 pl-1 text-no-wrap"
                            align-self="center"
                            cols="1"
                          >
                            <span>{{ inputPost.unit == 0 ? $t('cms_promotion_dialog_dollar') : `%` }}</span>
                          </v-col>
                        </v-row>
                      </v-col>
                    </template>
                    <v-col class="pl-4" cols="1" align-self="center">
                      <v-btn
                        v-if="inputPost.conditions.length < 9"
                        class="ma-2"
                        color="primary"
                        fab
                        small
                        dark
                        depressed
                        @click="conditionEvent('increase')"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="inputPost.conditions.length !== 1"
                        class="ma-2"
                        color="error"
                        fab
                        small
                        dark
                        depressed
                        @click="conditionEvent('decrease')"
                      >
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col v-if="amountMessage !== ''" class="pa-0 pl-4" cols="12" offset="2">
                  <span class="error--text">
                    {{ inputPost.promotion_type === 2 ? $t('cms_promotion_dialog_recharge') : $t('cms_promotion_dialog_turnover') }}
                    {{ amountMessage }}
                  </span>
                </v-col>
              </template>
              <!--流水倍数-->
              <v-col class="text-right" cols="2">
                <p class="mt-2">{{ $t('cms_promotion_dialog_turnover_multiple') }}：</p>
              </v-col>
              <v-col class="pb-0" cols="3">
                <v-btn-toggle v-model.number="inputPost.bet_multiple_type" class="blue-btn-group" tile mandatory>
                  <v-btn v-for="(item, key) in options.bt" :key="`bet_multiple_type_${key}`" small depressed :value="Number(key)" height="38px" tile>
                    <span class="px-4">{{ item }}</span>
                  </v-btn>
                </v-btn-toggle>
              </v-col>
              <v-col class="pb-0" cols="7">
                <v-row v-if="inputPost.bet_multiple_type" no-gutters>
                  <v-col cols="4">
                    <v-text-field
                      ref="gain_rate"
                      v-model.number="inputPost.bet_multiple"
                      class="v-input-number-box"
                      type="number"
                      :label="$t('cms_promotion_dialog_turnover_multiple')"
                      :rules="[rules.emptyCheck, rules.positiveFloat]"
                      :suffix="'%'"
                      solo
                      dense
                    >
                    </v-text-field
                  ></v-col>
                  <v-col class="pl-2 pt-2" cols="8">
                    <span class="error--text">{{ $t('cms_promotion_dialog_100_multiple') }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <!--状态-->
              <v-col class="text-right" cols="2">
                <p class="mt-2">{{ $t('g_table_column_status') }}：</p>
              </v-col>
              <v-col class="pb-0" cols="9">
                <v-btn-toggle v-model.number="inputPost.is_enabled" class="blue-btn-group" tile mandatory>
                  <v-btn
                    v-for="(item, key) in options.is_enabled"
                    :key="`is_enabled_${key}`"
                    small
                    depressed
                    :value="Boolean(Number(key))"
                    height="38px"
                    tile
                  >
                    <span class="px-4">{{ item() }}</span>
                  </v-btn>
                </v-btn-toggle>
              </v-col>
              <!--排序-->
              <v-col class="text-right" cols="2">
                <p class="mt-2">{{ $t('g_table_column_sort') }}：</p>
              </v-col>
              <v-col class="pb-0 mr-auto" cols="2">
                <v-text-field
                  ref="sort"
                  v-model.number="inputPost.sort"
                  class="v-input-number-box"
                  type="number"
                  :label="$t('g_table_column_sort')"
                  :rules="[rules.emptyCheck, rules.numberCheck, inputPost.sort <= 999 || $t('cms_promotion_dialog_rules_sort_tips')]"
                  solo
                  dense
                >
                </v-text-field>
              </v-col>
              <v-col class="pl-0" cols="8">
                <div class="pt-2">
                  <small>{{ $t('cms_promotion_dialog_sort_tips') }}</small>
                </div>
              </v-col>
              <!--备注-->
              <v-col class="text-right" cols="2">
                <p class="mt-2">{{ $t('g_table_column_remarks') }}：</p>
              </v-col>
              <v-col class="pb-0 mr-auto" cols="9">
                <v-text-field v-model="inputPost.remark" type="text" :label="$t('g_table_column_remarks')" solo dense> </v-text-field>
              </v-col>
              <!--圖片區域-->
              <template v-for="(img, key) in images">
                <v-col :key="`title_${key}`" class="text-right" cols="2">
                  <p class="mt-2">{{ img.text }}：</p>
                </v-col>
                <!-- <v-col v-if="inputPost[key]" :key="`preview_${key}`" cols="2">
                  <el-image v-if="inputPost[key]" :src="inputPost[key]" :preview-src-list="[inputPost[key]]">
                    <div slot="placeholder" style="width:132px;">
                      加载中<span class="dot">...</span>
                    </div>
                  </el-image>
                </v-col> -->
                <v-col :key="`img_btn${key}`" class="pb-0 mr-auto" style="display:flex;align-item:center;" :cols="10">
                  <el-image v-show="activityImage[key]" style="width:200px;" :src="activityImage[key]" :preview-src-list="[inputPost[key]]">
                    <div slot="placeholder" style="width:200px;">
                      加载中<span class="dot">...</span>
                    </div>
                  </el-image>
                  <vue-core-image-upload
                    style="height:60px"
                    class="v-btn blue-grey white--text pa-3"
                    :crop="false"
                    :max-file-size="4096 * 4096"
                    text=""
                    url="/api/global/file"
                    :headers="uploadHeader"
                    @imageuploaded="imageUploaded($event, key)"
                  >
                    {{ $t('cms_promotion_dialog_upload_image') }}
                    <v-icon right dark>cloud_upload</v-icon>
                  </vue-core-image-upload>
                  <small class="pl-4">{{ img.remark }}</small>
                </v-col>
              </template>
              <!--活动內容-->
              <!-- <v-col class="text-right" cols="2">
                <p class="mt-2">{{ $t('cms_promotion_dialog_content') }}：</p>
              </v-col>
              <v-col cols="10">
                <keep-alive>
                  <editor v-model="inputPost.content" :api-key="$store.getters.tinymceKey" :init="initTinyMceSetting" :disabled="disabled"></editor>
                </keep-alive>
              </v-col> -->
              <!--手机活动內容-->
              <!-- <template v-if="Number(config.Show_Mobile_Event_Content)">
                <v-col class="text-right" cols="2">
                  <p class="mt-2">手机{{ $t('cms_promotion_dialog_content') }}：</p>
                </v-col>
                <v-col cols="10">
                  <keep-alive>
                    <editor
                      v-model="inputPost.mobileContent"
                      :api-key="$store.getters.tinymceKey"
                      :init="initTinyMceSetting"
                      :disabled="disabled"
                    ></editor>
                  </keep-alive>
                </v-col>
              </template> -->
              <v-col class="py-0" offset="2" cols="10">
                <v-btn color="primary" depressed small @click="changeContent">{{ $t('cms_promotion_dialog_example') }}</v-btn>
              </v-col>
              <v-col offset="2" cols="10">
                <v-sheet color="grey lighten-3 pa-2">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span v-html="defaultContent"></span>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card tile>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="red lighten-1" color="error" depressed :loading="loading" @click="closeDialog">
              {{ !disabled ? $t('g_btn_cancel') : $t('g_btn_exit') }}
            </v-btn>
            <v-btn color="primary" depressed :loading="loading" @click="submit">{{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';
import { GET_CMS_PROMOTION, POST_CMS_PROMOTION, PUT_CMS_PROMOTION, DELETE_CMS_PROMOTION } from '@/api/Uri';
import dialog from '@/components/mixins/dialog.js';
import { GET_FAKE_CSM_PROMOTION_1, GET_FAKE_CSM_PROMOTION_2 } from '@/api/fake';
// import Editor from '@tinymce/tinymce-vue';
import { promotionsDefaultContent } from './config';
import { formatDate } from '@/filters/custom';
export default {
  name: 'PromotionsDialog',
  components: {
    VueCoreImageUpload,
    // Editor,
  },
  mixins: [dialog],
  props: {},
  data() {
    return {
      fetchLoading: false,
      field: {},
      initInputPost: {
        bet_multiple_type: 0,
        bet_multiple: 100,
        promotion_type: 2,
        calc_type: 0,
        unit: 0,
        is_enabled: true,
        sort: 0,
        gain_rate: 0,
        vip_level: [],
        title: '',
        remark: '',
        content: '',
        mobileContent: '',
        start_time: null,
        end_time: null,
        pc_image_url: '',
        mobile_image_url: '',
        conditions: [{ rank: 0, amount: 0, gain: 0 }],
      },
      inputPost: {
        content: null,
      },
      images: {},
      initImages: {
        pc_list_image: {
          text: 'PC活动列表图',
          remoteStatus: false,
          remark: '建议图片尺寸为：800 X 1540，1M 以下',
        },
        pc_image_url: {
          text: 'PC活动内容图',
          remoteStatus: false,
          remark: '建议图片尺寸为：800 X 1540，1M 以下',
        },
        mobile_list_image: {
          text: '手机活动列表图',
          remoteStatus: false,
          remark: '建议图片尺寸为：335 X 140，1M 以下',
        },
        mobile_image_url: {
          text: '手机活动内容图',
          remoteStatus: false,
          remark: '建议图片尺寸为：375 X 1500，1M 以下',
        },
      },
      startPickerOptions: {
        disabledDate: time => {
          return time.getTime() < Date.now();
        },
      },
      endPickerOptions: {
        disabledDate: time => {
          const endTime = _.isDate(this.inputPost.start_time) ? this.inputPost.start_time : Date.now();
          return time.getTime() < endTime;
        },
      },
      initTinyMceSetting: {
        selector: 'textarea',
        language: 'zh_CN',
        height: 300,
        max_height: 350,
        min_height: 300,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste imagetools wordcount',
        ],
        fontsize_formats: '8px 10px 12px 14px 18px 24px 36px',
        toolbar:
          'insertfile undo redo | link | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent ',
      },
      amountMessage: '',
      defaultContent: '',
      activityImage: {
        pc_list_image: '',
        pc_image_url: '',
        mobile_list_image: '',
        mobile_image_url: ''
      }
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
    isDefaultItem() {
      return this.item.id && this.item.promotion_type === 1;
    },
    isConditionsNotEmpty() {
      return !_.isEmpty(this.inputPost.conditions) && this.inputPost.promotion_type !== 1;
    },
  },
  watch: {
    model: {
      handler(val) {
        if (val) {
          this.init();
          this.isInsert || this.getPromotions(this.item.id);
        }
      },
    },
  },
  created() {
    this.init();
    this.defaultContentChange();
    this.isInsert || this.getPromotions(this.item.id);
  },
  methods: {
    init() {
      this.inputPost = _.cloneDeep(this.initInputPost);
      this.images = _.cloneDeep(this.initImages);
    },
    imageUploaded(res, type = 'pc_image_url') {
      if (res.result != '') {
        this.$store.commit('MsgOk', this.$t('cms_promotion_dialog_upload_success'));
        this.activityImage[type] = res.result[0];
        // this.testImage(type);
        // this.picErrorPc = false;
      } else {
        _.$store.commit('MsgError', res.error);
      }
    },
    // 檢查圖片新的位置是有效
    testImage(type) {
      const tester = new Image();
      this.images[type].remoteStatus = false;
      tester.onload = () => {
        this.images[type].remoteStatus = true;
      };
      tester.src = this.inputPost[type];
    },
    // 推增
    conditionEvent(type = 'increase') {
      const defaultCon = { rank: this.inputPost.conditions.length, amount: 0, gain: 0 };
      switch (type) {
        case 'increase':
          this.inputPost.conditions.push(defaultCon);
          break;
        case 'decrease':
          this.inputPost.conditions.pop();
          break;
        default:
          return false;
      }
    },
    submit() {
      let flag = true;
      ['title', 'sort', 'gain_rate'].forEach(item => {
        if (this.$refs[item] && Object.keys(this.$refs[item]).length !== 0) {
          if (!this.$refs[item].validate(true)) {
            flag = false;
          }
        }
      });
      this.amountMessage = '';
      this.inputPost.conditions?.forEach(item => {
        const refKey = `amount_${item.rank}`;
        if (this.$refs[refKey] && Object.keys(this.$refs[refKey]).length !== 0) {
          // console.log(refKey, this.$refs[refKey][0].validate(true), this.$refs[refKey][0]);
          if (!this.$refs[refKey][0].validate(true)) {
            flag = false;
            this.amountMessage = this.$t('cms_promotion_dialog_amount_range', { rank: item.rank + 1 });
            // `金额 第${item.rank + 1}列，需大于等于左侧值`;
          }
        }
      });
      if (flag) {
        this.loading = true;
        const post = {
          ...this.inputPost,
          ...this.activityImage,
          start_time: _.isDate(this.inputPost.start_time) ? new Date(this.inputPost.start_time) : null,
          end_time: _.isDate(this.inputPost.end_time) ? new Date(this.inputPost.end_time) : null,
        };
        // console.log(`start_time:${this.inputPost.start_time}`, _.isDate(this.inputPost.start_time), post.start_time);
        // console.log(`end_time:${this.inputPost.end_time}`, _.isDate(this.inputPost.end_time), post.end_time);
        api
          .post(this.isInsert ? POST_CMS_PROMOTION : PUT_CMS_PROMOTION, post)
          .then(data => {
            this.$store.commit('MsgOk', `${this.isInsert ? this.$t('g_msgInsert') : this.$t('g_msgEditSuccess')}`);
            this.updateDialog(true);
            this.loading = false;
          })
          .catch(error => {
            this.loading = false;
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    // 驗證 流水ㄥ充值金额 ，不可大於等於左側值
    compareLeft(nowConditions) {
      return val => {
        let temp = true;
        _.forEach(this.inputPost.conditions, item => {
          if (item.rank < nowConditions.rank && item.amount > nowConditions.amount) {
            temp = false;
            // this.amountMessage = `金额 第${nowConditions.rank + 1}列，不可大於左側值`;
          }
        });
        return temp;
      };
    },
    defaultContentChange() {
      const promotionDictionary = { 2: 'recharge', 4: 'serial' };
      const calcDictionary = { 0: 'Period', 1: 'Daily' };
      const key = promotionDictionary[this.inputPost.promotion_type] + calcDictionary[this.inputPost.calc_type];
      // if (this.inputPost.content === '') {
      //   this.inputPost.content = promotionsDefaultContent[key];
      // }
      this.defaultContent = promotionsDefaultContent[key];
    },
    changeContent(id) {
      this.$store.commit('Confirm', {
        text: this.$t('cms_promotion_dialog_notice_tiny_mac'),
        ok: () => {
          this.inputPost.content = this.defaultContent;
        },
      });
    },
    async getPromotions(id) {
      this.fetchLoading = true;
      await api
        .get(GET_CMS_PROMOTION.replace('{id}', id))
        .then(response => {
          this.field = response.result;
          const {mobile_image_url, mobile_list_image, pc_image_url, pc_list_image} = response.result
          this.activityImage = {mobile_image_url, mobile_list_image, pc_image_url, pc_list_image}
          this.inputPost = _.assignIn(this.inputPost, this.field);
          ['pc_image_url', 'mobile_image_url'].forEach(key => this.testImage(key));
          this.inputPost.end_time = this.checkDBIsDate(this.inputPost.end_time) ? new Date(this.inputPost.end_time) : '';
          this.inputPost.start_time = this.checkDBIsDate(this.inputPost.start_time) ? new Date(this.inputPost.start_time) : '';
          this.fetchLoading = false;
        })
        .catch(error => {
          // const response = GET_FAKE_CSM_PROMOTION_1;
          // this.field = response.result;
          // this.inputPost = _.assignIn(this.inputPost, this.field);
          this.$store.commit('MsgError', error.error);
          this.fetchLoading = false;
        });
    },
    checkDBIsDate(date) {
      return !!date && date !== '0001-01-01T00:00:00Z' && _.isDate(new Date(date));
    },
  },
};
</script>
