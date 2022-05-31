<template>
  <div>
    <v-card>
      <v-toolbar elevation="1" class="pl-2">
        <v-icon class="mr-2"> list </v-icon>
        <v-toolbar-title>赠金活动</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="addApi">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <v-data-table :headers="headers" :items="promotions" :loading="loading" class="elevation-1" :options.sync="pagination">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template slot="items" slot-scope="props">
            <td class="text-left text-no-wrap">{{ props.item.Id }}</td>
            <td class="text-left text-no-wrap">{{ props.item.Title }}</td>
            <td class="text-left text-no-wrap">
              <v-chip v-if="props.item.IsEnabled == 1" color="green" label outlined small> 启用 </v-chip>
              <v-chip v-else label outlined small> 停用 </v-chip>
            </td>
            <td class="text-left text-no-wrap">{{ props.item.StartTime | formatDate }}</td>
            <td class="text-left text-no-wrap">{{ props.item.CreateTime | formatDate }}</td>
            <td class="text-left text-no-wrap">{{ props.item.UpdateTime | formatDate }}</td>
            <td class="text-left text-no-wrap">{{ props.item.CreateBy }}</td>
            <td class="text-left text-no-wrap">
              <v-btn class="x-small" small depressed color="primary" @click="updateApi(props.index)">详情</v-btn>
              <v-btn v-if="props.item.Deleted == false" class="x-small" small depressed color="error" @click="offline(props.item.Id)">停止活动</v-btn>
              <v-btn v-else class="x-small" small depressed color="error" disabled>已下線</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="infoBox" persistent width="50%">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">添加活动</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap>
                <!-- 基本信息 -->
                <v-flex xs12>
                  <v-card class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">基本信息</h1>
                    </v-card-title>
                    <v-layout wrap>
                      <v-flex xs6>
                        <v-select v-model="promotion.Type" :disabled="promotion.Id > 0" :items="types" label="活动类型"></v-select>
                      </v-flex>
                      <v-flex xs6>
                        <v-select
                          v-model="promotion.VerifyType"
                          :disabled="promotion.Id > 0"
                          :items="[
                            { text: '人工验证', value: 0 },
                            { text: '系统验证', value: 1 },
                          ]"
                          label="验证方式"
                        ></v-select>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field v-model="promotion.Title" type="text" label="活动标题" :rules="[v => !!v || '请填写活动标题!']"> </v-text-field>
                      </v-flex>
                      <v-flex xs6>
                        <date-picker
                          v-model="promotion.StartTime"
                          :disabled="promotion.Id > 0"
                          placeholder="活动开始时间"
                          :shortcuts="shortcuts"
                          format="YYYY-MM-DD"
                          width="270"
                          :class="`v-input v-text-field`"
                        ></date-picker>
                      </v-flex>
                      <v-flex xs6>
                        <date-picker
                          v-model="promotion.EndTime"
                          placeholder="活动结束时间"
                          :shortcuts="shortcuts"
                          format="YYYY-MM-DD"
                          width="270"
                          :class="`v-input v-text-field`"
                        ></date-picker>
                      </v-flex>
                      <v-flex xs12>
                        <vue-core-image-upload
                          class="v-btn blue-grey white--text"
                          :crop="false"
                          :max-file-size="4096 * 4096"
                          text=""
                          url="/api/global/file"
                          :headers="uploadHeader"
                          @imageuploaded="imageuploaded"
                        >
                          上传图片
                          <v-icon right dark>cloud_upload</v-icon>
                        </vue-core-image-upload>
                        <span v-show="picError" class="red--text">请上传图片</span>
                      </v-flex>
                      <v-flex v-show="!!promotion.Image" xs12>
                        <v-card>
                          <img height="200" width="100%" :src="config.image_url + promotion.Image" alt="" />
                        </v-card>
                      </v-flex>
                      <v-flex xs6>
                        <v-switch
                          v-model="promotion.IsAuto"
                          :disabled="promotion.Id > 0"
                          :label="`主动申请: ${promotion.IsAuto ? '是' : '否'}`"
                        ></v-switch>
                      </v-flex>
                      <v-flex xs6>
                        <v-select
                          v-model="promotion.IsEnabled"
                          :items="[
                            {
                              text: '即刻发布',
                              value: 1,
                            },
                            {
                              text: '到期发布',
                              value: 0,
                            },
                          ]"
                          label="前端发布"
                        ></v-select>
                      </v-flex>
                      <v-flex v-show="false" xs12>
                        <v-select
                          v-model="promotion.FeedNow"
                          :items="[
                            { text: '前置赠金', value: 1 },
                            { text: '后置赠金', value: 0 },
                          ]"
                          label="赠金类型"
                        ></v-select>
                      </v-flex>
                      <v-flex xs12>
                        活动内容:
                        <tinymce-editor
                          v-model="promotion.Details"
                          api-key="$store.getters.tinymceKey"
                          :init="{ plugins: 'wordcount' }"
                        ></tinymce-editor>
                      </v-flex>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-spacer></v-spacer>
                <!-- 参与条件 -->
                <v-flex xs12>
                  <v-card class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">申请条件</h1>
                    </v-card-title>
                    <v-layout wrap>
                      <v-flex v-show="promotion.Type == 1" xs6>
                        <header>验证字段</header>
                        <v-checkbox v-model="Apply.PhoneCheck" class="mx-2" label="手机号码"></v-checkbox>
                        <v-checkbox v-model="Apply.IDCheck" class="mx-2" label="身份证号"></v-checkbox>
                      </v-flex>
                      <v-flex xs6>
                        <header>限制条件</header>
                        <v-checkbox v-model="Apply.SingleIP" class="mx-2" label="独立IP"></v-checkbox>
                        <v-checkbox v-model="Apply.SingleDevice" class="mx-2" label="独立设备"></v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-spacer></v-spacer>
                <!-- 赠金设置（前置赠金，后置赠金） -->
                <v-flex xs12>
                  <!-- 前置赠金 -->
                  <v-card v-if="promotion.FeedNow == 1" class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">赠金设置</h1>
                    </v-card-title>
                    <v-layout wrap>
                      <!-- 固定赠金金额 -->
                      <v-flex xs12>
                        <v-text-field v-model="Amount" type="text" label="赠金金额" :rules="[v => !!v || '请填写赠金金额!']"> </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-card>
                  <!-- 后置赠金 -->
                  <v-card v-else class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">赠金设置</h1>
                    </v-card-title>
                    <v-flex xs12>
                      <v-text-field v-model="Amount" type="text" label="赠金金额" :rules="[v => !!v || '请填写赠金金额!']"> </v-text-field>
                    </v-flex>
                    <!-- 后置赠金条件 -->
                    <!-- <v-flex xs12>
                                            <v-layout wrap>
                                                <v-checkbox v-model="Task.ip" value="" label="体育流水"></v-checkbox>
                                                <v-text-field type="text" :rules="[v => !!v || '请填写游戏名称!']" v-model="promotion.Name"> </v-text-field>
                                                <v-checkbox v-model="promotion.ip" label="限定赔率"></v-checkbox>
                                                <v-text-field type="text" :rules="[v => !!v || '请填写游戏名称!']" v-model="promotion.Name"> </v-text-field>
                                            </v-layout>
                                        </v-flex> -->
                  </v-card>
                </v-flex>
                <!-- 出金条件 -->
                <v-flex xs12>
                  <v-card class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">流水任务</h1>
                    </v-card-title>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-card>
                          <v-tabs v-model="taskType" background-color="cyan" grow>
                            <v-tab v-for="item in items" :key="item">
                              {{ item }}
                            </v-tab>
                          </v-tabs>
                          <v-tabs-items v-model="taskType">
                            <v-tab-item :key="'所有游戏流水'">
                              <v-card class="pa-2">
                                <v-layout wrap>
                                  <v-flex xs6>
                                    <v-text-field v-model="All.Times" type="text" label="赠金流水倍数"> </v-text-field>
                                  </v-flex>
                                  <v-flex xs6>
                                    <v-text-field v-model="All.Days" type="text" label="任务失效天数"> </v-text-field>
                                  </v-flex>
                                </v-layout>
                              </v-card>
                            </v-tab-item>
                            <v-tab-item :key="'指定游戏流水'">
                              <v-card class="pa-4">
                                <v-flex xs12>
                                  <v-layout v-for="(platform, k) in GamePlatforms" :key="k" wrap>
                                    <v-checkbox v-model="AssignGames[k].GameID" :label="platform.SystemCode" :value="platform.Id"></v-checkbox>
                                    <v-text-field v-model="AssignGames[k].Times" type="text" label="赠金流水倍数"> </v-text-field>
                                    <v-text-field v-model="AssignGames[k].GameOdds" type="text" label="指定赔率(>=)"> </v-text-field>
                                    <v-text-field v-model="AssignGames[k].Days" type="text" label="任务失效天数"> </v-text-field>
                                  </v-layout>
                                </v-flex>
                              </v-card>
                            </v-tab-item>
                          </v-tabs-items>
                        </v-card>
                      </v-flex>
                      <v-flex xs12>
                        任务失效处理：
                        <v-radio-group v-model="EndProcess" :mandatory="false">
                          <v-radio label="赠金归零，用户再次参与活动无效" value="1"></v-radio>
                          <v-radio label="赠金归零，用户再次参与活动有效，活动条件需再次达成" value="2"></v-radio>
                        </v-radio-group>
                        成本归属:
                        <v-layout wrap>
                          <!-- <v-radio v-model="promotion.CostBy" class="mx-2" label="平台"></v-radio> -->
                          <v-select
                            v-model="promotion.CostBy"
                            :items="[
                              {
                                text: '整个平台',
                                value: 1,
                              },
                              {
                                text: '招商部门',
                                value: 2,
                              },
                              {
                                text: '推广部门',
                                value: 3,
                              },
                            ]"
                            :rules="[v => !!v || '请填写附加参数!']"
                          ></v-select>
                          <!-- <v-radio v-model="promotion.IsPlatform" class="mx-2" label="代理ID"></v-radio> -->
                          <!-- <v-text-field type="text" :rules="[v => !!v || '请填写代理ID!']" v-model="promotion.Name"> </v-text-field> -->
                        </v-layout>
                      </v-flex>
                    </v-layout>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="merge()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
import api from '@/api';
import Editor from '@tinymce/tinymce-vue';
import DatePicker from 'vue2-datepicker';
import { shortcuts } from '@/utils';
import VueCoreImageUpload from 'vue-core-image-upload';
export default {
  name: 'Promotion',
  components: {
    DatePicker,
    'tinymce-editor': Editor,
    'vue-core-image-upload': VueCoreImageUpload,
  },
  data() {
    return {
      typeId: 1,
      shells: ['', 'UserRegFeedBack', 'APPFeedBack', 'UserInviteFeedback'],
      shortcuts,
      pushed: {
        Picture: '',
      },
      pusheds: [],
      picError: false,
      tab: null,
      items: ['所有游戏流水', '指定游戏流水'],
      valid: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
      },
      types: [
        {
          text: '注册赠金',
          value: 6,
        },
        {
          text: '下载赠金',
          value: 5,
        },
      ],
      AssignGames: [{ GameID: 0, Odds: 0, Amount: 0, EndTime: '' }],
      All: {
        Times: 0,
        EndTime: '',
      },
      taskType: 1,
      Amount: 0,
      EndProcess: 1,
      Apply: {
        Times: 1,
        SingleIP: false,
        SingleDevice: false,
        PhoneCheck: false,
        IDCheck: false,
      },
      headers: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
        },
        {
          text: '活动标题',
          sortable: false,
          value: 'Title',
        },
        {
          text: '活动状态',
          value: 'Created',
        },
        {
          text: '活动时间',
          sortable: false,
          value: 'StartTime',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'Created',
        },
        {
          text: '修改时间',
          value: 'Updated',
        },
        {
          text: '操作人',
          sortable: false,
          value: '',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          sortable: false,
          value: '',
        },
      ],
      radios: [],
      promotions: [],
      promotion: {
        IsAuto: 1,
        Type: 4,
        FeedNow: 1,
        VerifyType: 1,
        CostBy: 1,
      },
      infoBox: false,
      model: 'tab-2',
      GamePlatforms: [],
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
    shell() {
      return this.shells[this.promotion.Type];
    },
    Task() {
      const obj = {};
      obj.Type = this.taskType;

      if (obj.Type == 1) {
        obj.AssignGames = this.AssignGames;
      } else {
        obj.All = this.All;
      }

      return obj;
    },
    RuleAdditionalParameters() {
      return {
        Apply: this.Apply,
        Amount: this.Amount,
        Task: this.Task,
        EndProcess: this.EndProcess,
      };
    },
  },
  watch: {},
  mounted() {
    this.loadApis(1);
    this.loadPlatforms();
  },
  methods: {
    loadApis(p) {
      this.loading = true;
      api
        .get(`/promotion/list/${this.typeId}`)
        .then(data => {
          this.promotions = data.result;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    loadPlatforms(p) {
      api
        .get('/games/platforms')
        .then(data => {
          this.GamePlatforms = data.result;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    addApi() {
      this.promotion = {};
      this.infoBox = true;
    },
    updateApi(i) {
      this.promotion = this.promotions[i];
      const obj = JSON.parse(this.promotion.RuleAdditionalParameters);
      // console.log(obj);
      this.Apply = obj.Apply;
      this.Amount = obj.Amount;
      this.taskType = obj.Task.Type;
      if (this.taskType == 1) {
        this.AssignGames = obj.Task.AssignGames;
      } else {
        this.All = obj.Task.All;
      }
      this.EndProcess = obj.EndProcess;
      this.infoBox = true;
    },
    offline(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '是否确认将此活動停用',
        ok() {
          api
            .post(`/promotion/offline/${id}`, {
              status,
            })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadApis(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    merge() {
      const $this = this;
      this.promotion.RuleAdditionalParameters = JSON.stringify(this.RuleAdditionalParameters);
      this.promotion.RuleShell = this.shell;
      this.promotion.IsAuto = this.promotion.IsAuto * 1;
      if (this.$refs.form.validate()) {
        let url = '/promotion/';
        if ($this.promotion.Id > 0) {
          url += $this.promotion.Id;
        }
        api
          .post(url, this.promotion)
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadApis();
            $this.infoBox = false;
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
          });
      }
    },
    imageuploaded(res) {
      const $this = this;
      if (res.result != '') {
        $this.$store.commit('MsgOk', '上传图片成功');
        this.$set(this.promotion, 'Image', res.result[0]);
        $this.picError = false;
      } else {
        $this.$store.commit('MsgError', res.error);
      }
    },
  },
};
</script>
