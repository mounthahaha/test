<template>
  <div>
    <v-card>
      <v-toolbar elevation="1" class="pl-2">
        <v-icon class="mr-2"> list </v-icon>
        <v-toolbar-title>好友推薦活动</v-toolbar-title>
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
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="infoBox" persistent width="50%">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">好友推薦活动</v-toolbar-title>
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
                      <v-flex xs12>
                        <v-text-field v-model="promotion.Title" type="text" label="活动标题" :rules="[v => !!v || '请填写活动标题!']"> </v-text-field>
                      </v-flex>
                      <v-flex xs6>
                        <date-picker
                          v-model="promotion.StartTime"
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
                      <v-flex xs6>
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
                          :init="{
                            plugins: 'wordcount table',
                            menubar: 'table',
                            toolbar:
                              'table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                          }"
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
                      <h1 class="font-weight-bold display-1 basil--text">邀请条件</h1>
                    </v-card-title>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-text-field v-model="apply.DepositTotal" type="text" label="累計最低存款金额" :rules="[v => !!v || '最低存款金额!']">
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs12>
                  <v-card class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">赠金设置</h1>
                    </v-card-title>
                    <v-flex xs12 sm6 d-flex>
                      <v-select
                        v-model="pay.method"
                        :items="[
                          { text: '單一式獎勵', value: 1 },
                          { text: '階梯式獎勵', value: 2 },
                        ]"
                        label="奖励模式"
                        solo
                      ></v-select>
                    </v-flex>
                    <v-layout v-if="pay.method == 1" wrap>
                      <v-flex xs6>
                        <v-text-field v-model="pay.top" type="text" label="最大推荐奖励人数" :rules="[v => !!v || '最大推荐奖励人数!']">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs6>
                        <v-text-field v-model="pay.amount" type="text" label="单一任务赠金奖励" :rules="[v => !!v || '请填写赠金金额!']">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        赠金派彩方式:
                        <v-radio-group v-model="pay.payType" :mandatory="false">
                          <v-radio label="单一推荐任务完成即奖励" value="1"></v-radio>
                          <v-radio label="所有推荐任务完成后统一派奖" value="2"></v-radio>
                        </v-radio-group>
                      </v-flex>
                    </v-layout>
                    <v-layout v-else wrap>
                      <v-flex xs12>
                        <v-text-field v-model="Top" type="text" label="最大推荐奖励人数" :rules="[v => !!v || '最大推荐奖励人数!']"> </v-text-field>
                        <v-btn class="mx-2" fab dark small color="primary" @click="addLevel">
                          <v-icon dark>add</v-icon>
                        </v-btn>
                      </v-flex>
                      <template v-for="(level, k) in levelPay">
                        <v-flex :key="k" xs5>
                          <v-text-field v-model="level.total" type="text" label="推荐数量<="> </v-text-field>
                        </v-flex>
                        <v-flex :key="k" xs5>
                          <v-text-field v-model="level.amount" type="text" label="赠金金额"> </v-text-field>
                        </v-flex>
                        <v-flex :key="k" xs2>
                          <v-btn fab small color="primary" @click="removeLevel(k)">
                            <v-icon dark>remove</v-icon>
                          </v-btn>
                        </v-flex>
                      </template>
                    </v-layout>
                  </v-card>
                </v-flex>
                <v-flex xs12>
                  <v-card class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">被推荐人任务</h1>
                    </v-card-title>
                    <v-layout wrap>
                      <v-flex xs6>
                        <v-text-field v-model="invitedUser.TotalCharge" type="text" label="充值金额门槛"> </v-text-field>
                      </v-flex>
                      <v-flex xs6>
                        <v-text-field v-model="invitedUser.BetAmount" type="text" label="有效流水任务"> </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-card>
                </v-flex>
                <!-- 出金条件 -->
                <v-flex xs12>
                  <v-card class="pa-4" color="#F9F9F9" outlined>
                    <v-card-title class="text-center justify-center py-6">
                      <h1 class="font-weight-bold display-1 basil--text">流水任务</h1>
                    </v-card-title>
                    <v-layout wrap>
                      <v-flex xs6>
                        <v-radio-group v-model="task.Need" row>
                          <v-radio label="无，可直接出金" value="0"></v-radio>
                          <v-radio label="赠金流水倍数" value="1"></v-radio>
                        </v-radio-group>
                      </v-flex>
                      <v-flex v-show="task.Need == 1" xs6>
                        <v-text-field v-model="task.Times" type="text" label="赠金流水倍数"> </v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        成本归属:
                        <v-layout wrap>
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
      typeId: 4,
      shells: ['', 'UserRegFeedBack', 'APPFeedBack', 'UserInviteFeedback'],
      shortcuts,
      pushed: {
        Picture: '',
      },
      picError: false,
      valid: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
      },
      Feed: {
        Type: 1,
        FeedType: 1,
      },
      apply: {
        DepositTotal: 0,
        // DepositTimes:0,
      },
      pay: {
        method: 1, // 1:固定金額，2:階梯式
        top: 10, // 邀請上限，0 無上限
        feedType: 1, // 1:逐一派送，2:統一派送
        amount: 0,
      },
      levelPay: [{ total: 0, amount: 0 }],
      task: {},
      FeedAmount: 0,
      FeedType: 1,
      EndProcess: 1,
      ChargeAmount: 0,
      Top: 10,
      invitedUser: {
        TotalCharge: 0,
        BetAmount: 0,
      },
      withdrawLimit: {
        Need: 0,
        Times: 1,
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
      promotions: [],
      promotion: {
        IsAuto: 1,
        Type: 3,
        FeedNow: 1,
        VerifyType: 1,
        CostBy: 1,
      },
      infoBox: false,
      model: 'tab-2',
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
    RuleAdditionalParameters() {
      return {
        Apply: this.apply,
        PayMethod: this.pay,
        InviterTask: this.task,
        InvitedTask: this.invitedUser,
        FrontEndTemp: 'inviteProgress',
        EndProcess: this.EndProcess,
      };
    },
  },
  watch: {
    levelPay: {
      deep: true,
      handler(val, oldVal) {
        this.$set(this.pay, 'levelPay', val);
      },
    },
  },
  mounted() {
    this.loadApis(1);
  },
  methods: {
    parseParams(params) {},
    addLevel() {
      this.levelPay.push({ total: 0, amount: 0 });
    },
    removeLevel(k) {
      this.levelPay.shift(k);
    },
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
    addApi() {
      this.promotion = {};
      this.infoBox = true;
    },
    updateApi(i) {
      this.promotion = this.promotions[i];
      const obj = JSON.parse(this.promotion.RuleAdditionalParameters);
      this.apply = obj.Apply;
      this.pay = obj.PayMethod;
      this.task = obj.InviterTask;
      this.levelPay = obj.PayMethod.levelPay;
      this.invitedUser = obj.InvitedTask;
      this.EndProcess = obj.EndProcess;
      this.FrontEndTemp = 'inviteProgress';
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
        let url = '/promotion';
        if ($this.promotion.Id > 0) {
          url += `/${$this.promotion.Id}`;
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
