<template>
  <div class="Payment">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增支付設置 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="addPayment">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>新增支付設置</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <!-- 操作 -->
                <td class="text-center text-no-wrap">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="updateAccount(index)" v-on="on">
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_edit') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn v-if="item.Deleted == false" icon color="red" v-bind="attrs" @click="setStatus(item.Id, 1)" v-on="on">
                        <v-icon>do_not_disturb_on</v-icon>
                      </v-btn>
                      <v-btn v-else icon color="green" v-bind="attrs" @click="setStatus(item.Id, 0)" v-on="on">
                        <v-icon>add_circle</v-icon>
                      </v-btn>
                    </template>
                    <span v-if="item.Deleted == false">{{ $t('g_btn_disable') }}</span>
                    <span v-else>{{ $t('g_btn_enable') }}</span>
                  </v-tooltip>
                </td>
                <td class="text-center">
                  <v-chip label outlined small :color="item.Deleted ? `red` : `green`">
                    {{ item.Deleted ? $t('g_btn_disable') : $t('g_btn_enable') }}
                  </v-chip>
                </td>
                <td class="text-left text-no-wrap">{{ item.Id }}</td>
                <td class="text-left text-no-wrap">
                  <v-chip label outlined small color="primary"> {{ types[item.Type] ? types[item.Type] : '--' }} </v-chip>
                </td>
                <td class="text-left text-no-wrap">{{ item.Bank }}</td>
                <td class="text-left text-no-wrap">{{ item.Name }}</td>
                <td class="text-left text-no-wrap">{{ item.Card }}</td>
                <td class="text-left text-no-wrap">{{ item.Branch }}</td>
                <td class="text-left text-no-wrap">{{ item.ThirdType }}</td>
                <td class="text-center text-no-wrap">
                  <v-img v-if="item.Qrcode" :src="item.Qrcode" height="50px"></v-img>
                  <v-icon v-else> qr_code_2 </v-icon>
                </td>
                <td class="text-left text-no-wrap">{{ item.Order }}</td>
                <td class="text-left text-no-wrap">{{ item.UpdateByName }}</td>
                <td class="text-left text-no-wrap">{{ item.Updated | formatDate }}</td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 新增支付設置彈窗 -->
    <v-dialog v-model="infoBox" persistent width="40%" eager>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-5">{{ $t('payment_editAccount') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon @click.native="infoBox = false" v-on="on"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap align="center">
              <v-col cols="12">
                <v-select v-model.number="account.Type" :items="paymentTypeItems"> </v-select>
              </v-col>
              <template v-for="(field, i) in fields">
                <v-col v-show="field.visible" :key="i" :cols="field.cols || 12">
                  <v-select v-if="field.ftype === 'select'" v-model.number="account[field.name]" :items="field.items" :multiple="field.multiple">
                  </v-select>
                  <v-text-field
                    v-else-if="field.ftype === 'text'"
                    v-model="account[field.name]"
                    type="text"
                    :label="$t(field.label)"
                    :placeholder="$t(field.placeholder)"
                    :rules="field.rules"
                  >
                  </v-text-field>
                  <v-text-field
                    v-else-if="field.ftype === 'number'"
                    v-model.number="account[field.name]"
                    type="number"
                    :label="$t(field.label)"
                    :placeholder="$t(field.placeholder)"
                    :rules="field.rules"
                  >
                  </v-text-field>
                  <v-textarea
                    v-else-if="field.ftype === 'textarea'"
                    v-model="account[field.name]"
                    :label="$t(field.label)"
                    :placeholder="$t(field.placeholder)"
                    :rules="field.rules"
                  >
                  </v-textarea>
                  <template v-else-if="field.ftype === 'editor' && infoBox">
                    <h3 class="mb-5">
                      <strong>{{ field.title }}</strong>
                    </h3>
                    <editor
                      v-model="account[field.name]"
                      :value="account[field.name]"
                      :api-key="$store.getters.tinymceKey"
                      :init="initTinyMceSetting"
                    ></editor>
                    <small class="error--text">{{ field.hint }}</small>
                  </template>
                  <v-checkbox
                    v-else-if="field.ftype === 'checkbox'"
                    v-model="account[field.name]"
                    :label="$t(field.label)"
                    :disabled="field.disabled"
                    :value="field.value"
                  ></v-checkbox>
                </v-col>
              </template>
            </v-row>
          </v-container>
          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeAccount()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { isJSON } from '@/filters/custom';
import Editor from '@tinymce/tinymce-vue';

export default {
  name: 'Payment',
  components: { Editor },
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      valid: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortDesc: [],
        sortBy: [],
      },
      headers: [
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'operate',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'payment_column_status',
          text: '状态',
          value: 'Deleted',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'payment_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_category',
          text: '类型',
          value: 'Type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_name',
          text: '名称',
          value: 'Bank',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_payee',
          text: '收款人',
          value: 'Name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_account',
          text: '帐号',
          value: 'Card',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_branch',
          text: '支行',
          value: 'Branch',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_channel',
          text: '渠道編號',
          value: 'ThirdType',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_QRCode',
          text: '二维码',
          value: 'Qrcode',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_sort',
          text: '排序',
          sortable: false,
          value: 'Order',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_updateByName',
          text: '操作者',
          value: 'UpdateByName',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payment_column_updateTime',
          text: '更新时间',
          value: 'Updated',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      types: {},
      apis: null,
      account: {
        ApiId: 0,
        Type: 0,
        Qrcode: '',
        ThirdType: '0',
        Usaged: [],
        Readonly: false,
      },
      infoBox: false,
      thirdTypes: null,
      readonly: false,
      selects: [],
      selectedBanks: [],
      editor: {
        content: '',
      },
      initTinyMceSetting: {
        selector: 'textarea',
        height: 300,
        max_height: 350,
        min_height: 300,
        language: 'zh_CN',
        fontsize_formats: '8px 10px 12px 14px 18px 24px 36px',
        toolbar:
          'code | fontsizeselect | forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent ',
        placeholder: `{depositchannel} 存款说明：  \r\n
 1.单笔单次最低存款金额 {min}元, 单笔单次最高存款金额  {max} 元，不限次数。  \r\n
 2.输入正确的银行卡号及卡密后，需要您的银行卡预留手机号码可接收银行发送的短信验证码，即可即时充值。   \r\n
 3.如有金额错误或未自动到账，请联系在线客服咨询。  \r\n`,
      },
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    likesAllFruit() {
      return this.selectedBanks.length === this.selects.length;
    },
    likesSomeFruit() {
      return this.selectedBanks.length > 0 && !this.likesAllFruit;
    },
    icon() {
      if (this.likesAllFruit) {
        return 'check_box';
      }
      if (this.likesSomeFruit) {
        return 'indeterminate_check_box';
      }
      return 'check_box_outline_blank';
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
    paymentTypeItems() {
      return [
        {
          value: 0,
          text: `==${this.$t('g_selector_default_categoryOption')}==`,
        },
        ..._.map(this.types, (item, i) => ({ text: item, value: Number(i) })),
      ];
    },
    paymentType() {
      // 在线支付
      const online = this.account.Type === 4;
      // USDT虚拟货币
      const usdt = this.account.Type === 5;
      // MYR货币
      const myr = this.account.Type === 6;
      // 虚拟货币在线支付
      const virtual = this.account.Type === 7;
      return {
        ...(online && { online }),
        ...(usdt && { usdt }),
        ...(myr && { myr }),
        ...(virtual && { virtual }),
      };
    },
    apiItems() {
      return [
        {
          value: 0,
          text: `==${this.$t('g_selector_api')}==`,
        },
        ..._.map(this.apis, (item, i) => ({ text: item.name, value: Number(i) })),
      ];
    },
    thirdTypeItems() {
      return [
        {
          value: 0,
          text: `==${this.$t('g_selector_default_categoryOption')}==`,
        },
        ..._.map(this.thirdTypes, (item, i) => ({ text: item, value: Number(i) })),
      ];
    },
    bankItems() {
      return [
        {
          value: 0,
          text: `==${this.$t('g_selector_api')}==`,
        },
        ..._.map(this.selects, (item, i) => ({ text: item, value: Number(i) })),
      ];
    },
    fields() {
      return [
        {
          name: 'ApiId', // api 類型
          ftype: 'select', // field type
          items: this.apiItems,
          visible: this.paymentType.online || this.paymentType.virtual,
        },
        {
          name: 'ThirdType', // api
          ftype: 'select', // field type
          items: this.thirdTypeItems,
          visible: ['online'].reduce((flag, ty) => flag && Boolean(this.paymentType[ty]), true),
        },
        {
          name: 'selectedBanks', // 好像都沒用到
          ftype: 'select', // field type
          multiple: true,
          items: this.selects,
          visible: ['online'].reduce((flag, ty) => flag && Boolean(this.paymentType[ty]), true) && this.selects.length,
        },
        {
          name: 'Bank', // 好像都沒用到
          ftype: 'text', // field type
          visible: true,
          label: 'payment_name',
          placeholder: 'payment_name',
          rules: [v => !!v || this.$t('payment_rules_text_name')],
        },
        {
          name: 'Name',
          ftype: 'text', // field type
          label: this.paymentType.usdt ? 'payment_payeeAccount' : 'payment_payee',
          placeholder: this.paymentType.usdt ? 'payment_payeeAccount' : 'payment_payee',
          visible: true,
        },
        {
          name: 'Card',
          ftype: 'text', // field type
          label: this.paymentType.usdt ? 'payment_walletAddress' : 'payment_bankCardNumber',
          placeholder: this.paymentType.usdt ? 'payment_walletAddress' : 'payment_bankCardNumber',
          visible: !this.paymentType.myr,
        },
        {
          name: 'Branch',
          ftype: 'text', // field type
          label: this.paymentType.usdt ? 'payment_appName' : 'payment_branchAddress',
          placeholder: this.paymentType.usdt ? 'payment_appName' : 'payment_branchAddress',
          visible: !this.paymentType.myr,
        },
        {
          name: 'SysParams',
          ftype: 'textarea', // field type
          label: 'payApi_systemParameters',
          placeholder: 'payApi_systemParameters',
          visible: true,
        },
        {
          name: 'DepositInstruction',
          ftype: 'editor', // field type
          title: '存款說明',
          hint: '最小入金金额变数为【{min}】，最大入金金额变数为【{max}】，金流渠道名为【{depositchannel}】',
          visible: true,
        },
        {
          name: 'Order',
          ftype: 'number', // field type
          label: 'payment_sort',
          placeholder: 'g_placeholder_sort',
          visible: true,
        },
        {
          cols: 6,
          name: 'Min',
          ftype: 'number', // field type
          label: 'payment_singleMini',
          placeholder: 'payment_placeholder_min',
          visible: true,
        },
        {
          cols: 6,
          name: 'Max',
          ftype: 'number', // field type
          label: 'payment_singleMax',
          placeholder: 'payment_placeholder_max',
          visible: true,
        },
        {
          name: 'Predefined',
          ftype: 'text', // field type
          label: 'payment_reservationRightQuick',
          placeholder: 'payment_placeholder_onlyReceive',
          visible: true,
        },
        {
          name: 'ThirdType',
          ftype: 'text', // field type
          label: 'payment_channelNumber',
          placeholder: 'payment_placeholder_channel',
          visible: !this.paymentType.myr,
        },
        {
          name: 'Readonly',
          ftype: 'checkbox', // field type
          label: 'payment_onlyReceive',
          visible: !this.paymentType.myr,
          disabled: this.readonly,
        },
        {
          cols: 3,
          name: 'Usaged',
          ftype: 'checkbox', // field type
          label: 'payment_pc',
          value: '1',
          visible: true,
          disabled: this.readonly,
        },
        {
          cols: 9,
          name: 'Usaged',
          ftype: 'checkbox', // field type
          label: 'payment_mobilePhone',
          value: '2',
          visible: true,
          disabled: this.readonly,
        },
        {
          cols: 12,
          name: 'UseFor',
          ftype: 'text', // field type
          label: 'payment_testerId',
          value: 0,
          visible: this.paymentType.online,
          // visible: true,
          disabled: this.readonly,
        },
      ];
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadPayments(n);
    },
    'account.Type'(n) {
      if (n == 4) {
        this.loadPaymentsApis();
      } else {
        // this.account.ApiId = 0;
        // this.account.ThirdType = '0';
      }
    },
    'account.ApiId'(n) {
      if (n > 0) {
        const curParam = this.apis[n].param;
        this.thirdTypes = curParam.banks;
        if (curParam.readonly == 'true') {
          this.readonly = true;
          this.account.Readonly = true;
        }
        if (curParam.select) {
          this.selects = curParam.select;
        } else {
          this.selects = [];
          this.selectedBanks = [];
        }
      } else {
        this.selects = [];
        this.readonly = false;
        this.account.Readonly = false;
        this.thirdTypes = null;
        this.account.ThirdType = '0';
      }
    },
    'account.DepositInstruction'(inst) {
      if (!inst) {
        this.account.DepositInstruction = `
            {depositchannel} 存款说明： <br />
            <ol>
              <li>单笔单次最低存款金额 {min}元, 单笔单次最高存款金额 {max} 元，不限次数。</li>
              <li>输入正确的银行卡号及卡密后，需要您的银行卡预留手机号码可接收银行发送的短信验证码，即可即时充值。</li>
              <li>如有金额错误或未自动到账，请联系在线客服咨询。</li>
            </ol>`;
      }
    },
    infoBox(v) {
      if (v == false) {
        this.readonly = false;
      }
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadPayments(this.pagination.page);
    },
  },
  beforeMount() {
    this.loadPaymentTypes();
    this.loadPaymentsApis();
  },
  created() {
    this.loadPayments(1);
  },
  methods: {
    toggle() {
      this.$nextTick(() => {
        if (this.likesAllFruit) {
          this.selectedBanks = [];
        } else {
          this.selectedBanks = this.selects.slice();
        }
      });
    },
    loadPaymentsApis() {
      if (this.apis == null) {
        api
          .get('system/payment/api')
          .then(data => {
            _.map(data.result, item => {
              item.param = isJSON(item.param) ? JSON.parse(item.param) : '';
            });
            this.apis = data.result;
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    loadPaymentTypes() {
      api
        .get('/system/payment/types')
        .then(data => {
          this.types = data;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    loadPayments(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
      };
      api
        .get('/system/payments', params)
        .then(data => {
          if (data.result) {
            this.desserts = data.result.payments;
            this.pagination.length = data.result.pageNums;
            this.pagination.totalItems = data.result.total;
          } else {
            this.desserts = [];
            this.pagination.length = 0;
            this.pagination.totalItems = 0;
          }
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    addPayment(i) {
      this.account = { ApiId: 0, Type: 0, Qrcode: '', ThirdType: '0', Usaged: [] };
      this.infoBox = true;
    },
    updateAccount(i) {
      const Usaged = [];
      for (const x of [1, 2]) {
        if ((this.desserts[i].Used & x) != 0) {
          Usaged.push(`${x}`);
        }
      }
      this.account = this.desserts[i];
      this.$set(this.account, 'Usaged', Usaged);
      this.selectedBanks = this.account.Banks ? JSON.parse(this.account.Banks) : [];
      this.infoBox = true;
    },
    mergeAccount() {
      if (this.$refs.form.validate()) {
        let url = '/system/payment/account';
        if (this.account.Id > 0) {
          url += `/${this.account.Id}`;
        }
        if (this.selects.length > 0 && this.selectedBanks.length <= 0) {
          this.$store.commit('MsgError', '请选择支持的银行');
          return false;
        }
        this.account.UseFor = this.account.UseFor ? parseInt(this.account.UseFor) : 0;
        this.account.Min = this.account.Min ? this.account.Min : 0;
        this.account.Max = this.account.Max ? this.account.Max : 0;
        this.account.Banks = JSON.stringify(this.selectedBanks);

        let usage = 0;
        if (this.account.Usaged.length > 0) {
          this.account.Usaged.forEach(v => {
            usage += parseInt(v);
          });
        }
        if (!this.account.apiId) {
          delete this.account.apiId;
        }
        this.account.Used = usage;
        api
          .post(url, this.account)
          .then(res => {
            this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            this.account = { ApiId: 0, Type: 0, Qrcode: '', ThirdType: '0' };
            this.infoBox = false;
            this.loadPayments(1);
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    setStatus(id, status) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '',
        ok() {
          api
            .post(`/system/payment/status/${id}`, { status })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadPayments(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
  },
};
</script>
