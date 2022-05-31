<template>
  <div class="PayAPI">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增支付 API -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="addPayAPI">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>新增支付 API</span>
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
                <td class="text-left text-no-wrap">
                  <v-chip label outlined small :color="item.Deleted ? `red` : `green`">
                    {{ item.Deleted ? $t('g_btn_disable') : $t('g_btn_enable') }}
                  </v-chip>
                </td>
                <td class="text-left text-no-wrap">{{ item.Id }}</td>
                <td class="text-left text-no-wrap">{{ item.Name }}</td>
                <td class="text-left text-no-wrap">
                  <v-chip v-if="(item.Usage & 1) != 0" label outlined small color="green" class="mr-2"> {{ $t('payApi_chip_deposit') }} </v-chip>
                  <v-chip v-if="(item.Usage & 2) != 0" label outlined small color="red"> {{ $t('payApi_chip_withdrawal') }} </v-chip>
                </td>
                <td class="text-left text-no-wrap">{{ item.RealRequrl }}</td>
                <td class="text-left text-no-wrap">{{ item.RealAccount }}</td>
                <td class="text-left text-no-wrap">{{ item.Created | formatDate }}</td>
                <td class="text-left text-no-wrap">{{ item.Remark }}</td>
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

    <!-- 新增支付 API 彈窗 -->
    <v-dialog v-model="infoBox" persistent width="30%">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-5">{{ $t('payApi_editAccount') }}</v-toolbar-title>
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
                <v-text-field
                  v-model="account.Name"
                  type="text"
                  hide-details
                  :label="$t('payApi_channelName')"
                  :rules="[v => !!v || $t('payApi_rules_text_channel')]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="account.RealRequrl"
                  type="text"
                  hide-details
                  :label="$t('payApi_requestAddress')"
                  :rules="[v => !!v || $t('payApi_rules_text_address')]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="account.RealAccount" type="text" hide-details :label="$t('payApi_accountAccount')"> </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="account.RealKey" type="text" hide-details label="API Key"> </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="account.RealSecret" type="text" hide-details :label="$t('payApi_apiKey')"> </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="account.Code" type="text" hide-details :label="$t('payApi_systemCode')"> </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model.number="account.Fee" type="text" hide-details :label="$t('payApi_handlingFee')"> </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="account.RealParams"
                  :label="$t('payApi_systemParameters')"
                  :hint="$t('payApi_systemParameters')"
                  hide-details
                ></v-textarea>
              </v-col>
              <v-col xs12>
                <v-textarea
                  v-model="account.AttachedParam"
                  :label="$t('payApi_additionalParameters')"
                  :hint="$t('payApi_additionalParameters')"
                  hide-details
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="account.Remark" :label="$t('payApi_remarks')" :hint="$t('payApi_remarks')" hide-details></v-textarea>
              </v-col>
              <v-col cols="8">
                <v-row dense class="align-center">
                  <v-col cols="4">
                    <v-checkbox v-model="account.Usaged" :label="$t('payApi_deposit')" color="primary" value="1" hide-details></v-checkbox>
                  </v-col>
                  <v-col cols="4">
                    <v-checkbox v-model="account.Usaged" :label="$t('payApi_withdrawal')" color="primary" value="2" hide-details></v-checkbox>
                  </v-col>
                </v-row>
              </v-col>
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

export default {
  name: 'Payment',
  components: {},
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
      },
      headers: [
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'action',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'payApi_column_status',
          text: '状态',
          value: 'status',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payApi_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payApi_column_channelName',
          text: '渠道名称',
          value: 'channelName',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },

        {
          lang: 'payApi_column_UsedFor',
          text: '用于',
          value: 'UsedFor',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payApi_column_requestAddress',
          text: '请求地址',
          value: 'requestAddres',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payApi_column_account',
          text: '账户',
          value: 'account',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'payApi_column_builtIn',
          text: '创建于',
          value: 'builtIn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },

        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'remarks',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      account: { Usaged: [] },
      infoBox: false,
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadPayments(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadPayments(this.pagination.page);
    },
  },
  created() {
    this.loadPayments(1);
  },
  methods: {
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
        .get('/system/payment/apis', params)
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
    addPayAPI(i) {
      this.account = { Usaged: [] };
      this.infoBox = true;
    },
    updateAccount(i) {
      const Usaged = [];
      for (const x of [1, 2]) {
        if ((this.desserts[i].Usage & x) != 0) {
          Usaged.push(`${x}`);
        }
      }
      // this.desserts[i]["Usaged"] = Usaged
      this.account = this.desserts[i];
      this.$set(this.account, 'Usaged', Usaged);
      this.infoBox = true;
    },
    mergeAccount() {
      if (this.$refs.form.validate()) {
        const $this = this;
        let url = '/system/payment/api';
        if ($this.account.Id > 0) {
          url += `/${$this.account.Id}`;
        }
        let usage = 0;
        if ($this.account.Usaged.length > 0) {
          $this.account.Usaged.forEach(v => {
            usage += parseInt(v);
          });
        }
        $this.account.Usage = usage;
        api
          .post(url, $this.account)
          .then(res => {
            $this.$store.commit('MsgOk', $this.$t('g_msgSaved'));
            $this.account = {};
            $this.infoBox = false;
            $this.loadPayments(1);
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
          });
      }
    },
    setStatus(id, status) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '',
        ok() {
          api
            .post(`/system/payment/api/status/${id}`, { status })
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
