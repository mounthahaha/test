<template>
  <div class="Banks">
    <v-toolbar elevation="0" class="pl-2 rounded-lg">
      <v-icon class="mr-2">account_balance_wallet</v-icon>
      <v-toolbar-title>{{ $t('player_detail_bank_title') }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" depressed fab dark small v-on="on" @click="showAdd">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('player_detail_bankinfo_addBankcardInfo') }}</span>
      </v-tooltip>
      <v-btn color="primary" icon depressed fab dark small class="mx-5" @click="expand = !expand">
        <v-icon>{{ expand ? `keyboard_arrow_up` : `keyboard_arrow_down` }}</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- 列表 -->
    <v-container v-if="expand" fluid class="pa-0">
      <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
        <v-data-table
          disable-pagination
          :headers="headerComputed"
          :loading="loading"
          :items="banks.filter(item => !['topay', 'okpay', 'usdt'].includes(item.Bank.toLowerCase()))"
          hide-default-footer
        >
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left">{{ countryList[item.Locale || 'cn'].name }}</td>
              <td class="text-left">{{ item.Bank }}</td>
              <td class="text-left">
                <span :class="item.WarningExist ? 'warning' : ''">
                  {{ item.Card }}
                </span>
              </td>
              <td class="text-left">{{ item.Branch }}</td>
              <td class="text-center">
                <v-chip v-if="item.Deleted == false" label outlined small class="white--text" color="green"> {{ $t('g_btn_enable') }} </v-chip>
                <v-chip v-else label outlined small class="white--text" color="red"> {{ $t('g_btn_disable') }} </v-chip>
              </td>
              <td class="text-center">
                <v-btn color="primary ma-1" small dark depressed class="x-small" @click="showEdit(item)">{{ $t('g_btn_edit') }}</v-btn>
                <v-btn v-if="item.Deleted == false" color="red ma-1" small dark depressed class="x-small" @click="setBankStatus(item)">
                  {{ $t('g_btn_disable') }}
                </v-btn>
                <v-btn v-else color="green ma-1" small dark depressed class="x-small" @click="setBankStatus(item)">{{ $t('g_btn_enable') }}</v-btn>
                <v-btn color="red ma-1" small dark depressed class="x-small" @click="deleteCard(item)">
                  {{ $t('g_btn_delete') }}
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <v-toolbar elevation="0" class="pl-2 rounded-lg">
      <v-icon class="mr-2">qr_code</v-icon>
      <v-toolbar-title> {{ `USDT ${$t('g_wallet')} ${$t('g_list')}` }} </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" depressed fab dark small v-on="on" @click="showUsdtAdd">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ `${$t('g_btn_add')} USDT ${$t('g_wallet')}` }}</span>
      </v-tooltip>
    </v-toolbar>
    
    <!-- USDT 钱包列表 -->
    <v-container v-if="expand" fluid class="pa-0">
      <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
        <v-data-table
          disable-pagination
          :headers="headerUsdtComputed"
          :loading="loading"
          :items="banks.filter(item => item.Bank.toLowerCase() == 'usdt')"
          hide-default-footer
        >
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left">{{ item.Locale }}</td>
              <td class="text-center">
                <vue-qr :text="item.Card" :size="100" :margin="10"></vue-qr>
                <h5 class="mb-2">{{ item.Card }}</h5>
              </td>
              <td class="text-center">
                <v-chip v-if="item.Deleted == false" label outlined small class="white--text" color="green"> {{ $t('g_btn_enable') }} </v-chip>
                <v-chip v-else label outlined small class="white--text" color="red"> {{ $t('g_btn_disable') }} </v-chip>
              </td>
              <td class="text-center">
                <v-btn color="primary ma-1" small dark depressed class="x-small" @click="showUsdtEdit(item)">{{ $t('g_btn_edit') }}</v-btn>
                <v-btn v-if="item.Deleted == false" color="red ma-1" small dark depressed class="x-small" @click="setBankStatus(item)">
                  {{ $t('g_btn_disable') }}
                </v-btn>
                <v-btn v-else color="green ma-1" small dark depressed class="x-small" @click="setBankStatus(item)">{{ $t('g_btn_enable') }}</v-btn>
                <v-btn color="red ma-1" small dark depressed class="x-small" @click="deleteCard(item)">
                  {{ $t('g_btn_delete') }}
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- 其他钱包 -->
    <v-toolbar elevation="0" class="pl-2 rounded-lg">
      <v-icon class="mr-2">qr_code</v-icon>
      <v-toolbar-title> {{ `其他${$t('g_wallet')}${$t('g_list')}` }} </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" depressed fab dark small v-on="on" @click="showOtherWalletEdit">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ `${$t('g_btn_add')}其他${$t('g_wallet')}` }}</span>
      </v-tooltip>
    </v-toolbar>
    <!-- 其他钱包列表 -->
    <v-container fluid class="pa-0">
      <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
        <el-table
          :data="banks.filter(item => ['topay', 'okpay'].includes(item.Bank.toLowerCase()))"
          style="width: 100%">
          <el-table-column
            prop="Bank"
            label="APP">
          </el-table-column>
          <el-table-column
            prop="Card"
            label="钱包地址">
          </el-table-column>
          <el-table-column prop="name" label="状态">
            <template v-slot="{row}">
              <v-chip v-if="row.Deleted == false" label outlined small class="white--text" color="green"> {{ $t('g_btn_enable') }} </v-chip>
              <v-chip v-else label outlined small class="white--text" color="red"> {{ $t('g_btn_disable') }} </v-chip>
            </template>
          </el-table-column>
          <el-table-column
            prop="address"
            label="操作">
            <template v-slot="{row}">
              <v-btn color="primary ma-1" small dark depressed class="x-small" @click="showOtherWalletEdit(row)">{{ $t('g_btn_edit') }}</v-btn>
              <v-btn v-if="row.Deleted == false" color="red ma-1" small dark depressed class="x-small" @click="setBankStatus(row)">
                {{ $t('g_btn_disable') }}
              </v-btn>
              <v-btn v-else color="green ma-1" small dark depressed class="x-small" @click="setBankStatus(row)">{{ $t('g_btn_enable') }}</v-btn>
              <v-btn color="red ma-1" small dark depressed class="x-small" @click="deleteCard(row)">
                {{ $t('g_btn_delete') }}
              </v-btn>
            </template>
          </el-table-column>
        </el-table>
      </v-card>
    </v-container>

    <v-dialog v-model="infoBox" persistent width="500px">
      <v-card>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">{{ $t('player_detail_bankinfo_bankcardInfo') }}</v-toolbar-title>
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
                <v-flex xs12>
                  <v-select
                    v-model="bank.Locale"
                    :label="$t('g_table_column_locale')"
                    outlined
                    dense
                    :items="locales"
                    :placeholder="$t('g_table_column_locale')"
                  >
                  </v-select>
                  <v-autocomplete
                    ref="autocomplete"
                    v-model="bank.Bank"
                    :rules="[val => !!val || $t('player_detail_bankinfo_msgBank')]"
                    :items.sync="items"
                    outlined
                    dense
                    color="blue-grey lighten-2"
                    :label="$t('player_detail_bankinfo_bank')"
                    hide-details
                  >
                    <template slot="selection" slot-scope="data">
                      {{ data.item.text }}
                    </template>
                    <template slot="item" slot-scope="data"> {{ data.item.text }} </template>
                    <template slot="no-data">
                      <span class="pl-3">{{ $t('g_text_noData') }}</span>
                    </template>
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model="bank.Card"
                    type="text"
                    hide-details
                    :label="$t('player_detail_bankinfo_number')"
                    :rules="[v => !!v || $t('player_detail_bankinfo_msgNumber')]"
                    @keyup.native="bank.Card = bank.Card.replace(/\s+/g, '')"
                  >
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="bank.Branch" type="text" hide-details :label="$t('player_detail_bankinfo_branch')"> </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeBank()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- USDT钱包 -->
    <v-dialog v-model="usdtBox" persistent width="500px">
      <v-card>
        <v-form ref="form" v-model="usdtvalid" lazy-validation>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">{{ `USDT ${$t('g_wallet')}` }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="usdtBox = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap>
                <v-flex xs12>
                  <v-select
                    v-model="usdt.Locale"
                    :items="channels"
                    item-value="text"
                    :label="$t('g_choose_channel')"
                    :rules="[v => !!v || $t('g_choose_channel')]"
                  ></v-select>
                </v-flex>
                <v-flex xs12 mt-5 text-center>
                  <vue-qr :text="usdt.Card" :size="200" :margin="20"></vue-qr>
                </v-flex>
                <v-flex xs12 mt-5 text-center>
                  <v-text-field
                    v-model="usdt.Card"
                    :label="`${$t('g_upload')} ${$t('g_qrcode')}`"
                    :rules="[v => !!v || `${$t('g_upload')} ${$t('g_qrcode')}`]"
                    type="text"
                    single-line
                    required
                    @click.prevent="$refs.qrInput.$el.click()"
                  >
                    <template slot="append">
                      <v-btn
                        icon
                        :color="qrInputHover ? `primary` : `default`"
                        @mouseenter="qrInputHover = true"
                        @mouseleave="qrInputHover = false"
                        @dragover.prevent
                        @click.prevent="$refs.qrInput.$el.click()"
                        ><v-icon>cloud_upload</v-icon></v-btn
                      >
                      <!-- <qrcode-capture v-show="false" ref="qrInput" @detect="qrDetect"></qrcode-capture> -->
                      <image-barcode-reader v-show="false" ref="qrInput" @decode="qrDetect" @error="qrError"></image-barcode-reader>
                    </template>
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeUsdt()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 其他钱包 -->
    <v-dialog v-model="otherWalletBox" persistent width="500px">
      <v-card>
        <v-form ref="other-form" v-model="otherWallet" lazy-validation>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">{{ `其他${$t('g_wallet')}` }}</v-toolbar-title>
             <v-menu bottom right>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="otherWalletBox = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap>
                 <v-flex xs12>
                  <v-select
                    v-model="otherWalletModel.Bank"
                    :items="[
                      {text:'淘币', value: 'TOPAY'},
                      {text:'欧币', value: 'OKPAY'},
                    ]"
                    item-value="value"
                    label="请选择钱包类型"
                    :rules="[v => !!v || '请选择钱包类型']"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap>
                <!-- <v-flex xs12>
                  钱包地址
                </v-flex> -->
                 <v-flex xs12>
                  <v-text-field
                    v-model="otherWalletModel.Card"
                    type="text"
                    hide-details
                    label="钱包地址"
                    :rules="[v => !!v || '请输入钱包地址']"
                    @keyup.native="otherWalletModel.Card = otherWalletModel.Card.replace(/[^a-zA-Z0-9,]/ig, '')"
                  >
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="gray" depressed :disabled="!valid" @click="otherWalletBox=false"> {{ $t('g_btn_cancel') }}</v-btn>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeOtherWallet()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { mapGetters } from 'vuex';
import { getConfigByCode, decodeConfigAPIValue } from '@/lib/configAPI';
import _ from 'lodash';
import VueQr from 'vue-qr';
import { ImageBarcodeReader } from 'vue-barcode-reader';
export default {
  name: 'PlayerBanks',
  components: {
    VueQr,
    ImageBarcodeReader,
  },
  props: {
    userId: {
      type: Number,
      default: 0,
    },
    banks: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      bank: {},
      usdt: { Card: '' },
      expand: true,
      infoBox: false,
      valid: true,
      usdtBox: false,
      usdtvalid: true,
      qrInputHover: false,
      bankHeader: [
        {
          lang: 'g_table_column_locale',
          text: '地区',
          value: 'Locale',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'APP',
          text: 'APP',
          value: 'Locale',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
          usdt: true,
        },
        {
          lang: 'player_detail_bankinfo_headers_bank',
          text: '银行',
          value: 'Bank',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_bankinfo_headers_number',
          text: '卡号',
          value: 'Card',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_wallet_address',
          text: 'USDT钱包位址',
          value: 'Card',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
          usdt: true,
        },
        {
          lang: 'player_detail_bankinfo_headers_branch',
          text: '支行',
          value: 'Branch',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'Deleted',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      itemsRaw: null,
      channelConfig: null,
      otherWalletBox: false,
      otherWallet: true,
      otherWalletModel: {}
    };
  },
  computed: {
    ...mapGetters({ locale: 'i18n/locale', langItem: 'i18n/langItem' }),
    headerComputed() {
      return this.bankHeader
        .map(item => {
          item.text = this.$t(item.lang);
          return item;
        })
        .filter(item => !item.usdt);
    },
    headerUsdtComputed() {
      return this.bankHeader
        .map(item => {
          item.text = this.$t(item.lang);
          return item;
        })
        .filter(item => item.usdt || ['g_table_column_status', 'g_table_column_action'].includes(item.lang));
    },
    items() {
      const locale = this.locale.replace('zh-', '').toLowerCase();
      return (this.itemsRaw ? decodeConfigAPIValue(this.itemsRaw) : [])
        .map(item => {
          item.order = item.order || 0;
          item.text = `${item[locale] || item.cn}`;
          item.locale = item.locale || 'cn';
          return item;
        })
        .filter(item => item.locale == this.bank.Locale)
        .sort((a, b) => {
          if (a.order < b.order) {
            return 1;
          } else if (a.order > b.order) {
            return -1;
          } else {
            return 0;
          }
        });
    },
    countryList() {
      return this.$t('globalCountryList');
    },
    locales() {
      return _.filter(this.countryList, (item, index) => {
        return true;
        // ['cn', 'hk', 'mo', 'my', 'sg'].includes(index);
      }).map(item => {
        return { text: item.name, value: item.alpha2 };
      });
    },
    channels() {
      const settings = JSON.parse(this.channelConfig || '[]');
      const lagacyChannels = ['火幣網', '比特派', ' ZB', ' ImToken', '歐易'];

      let channels = lagacyChannels.map((key, i) => {
        let c = {
          value: i,
          text: key,
          fallback: i + 1,
        };
        const mapping = settings.find(item => item.fallback == c.fallback);
        if (mapping) {
          c = {
            text: this.locale == 'en' ? mapping.labelEN : mapping.labelZH,
            value: Number(mapping.fallback),
            ...mapping,
          };
        }
        return c;
      });
      channels = channels.concat(
        settings
          .filter(
            item =>
              !channels.find(c => {
                return item.fallback == c.fallback;
              }),
          )
          .map(item => {
            return {
              text: this.locale == 'en' ? item.labelEN : item.labelZH,

              ...item,
            };
          }),
      );
      return channels;
    },
  },
  mounted() {
    getConfigByCode({ code: 'bank_list' }).then(data => {
      this.itemsRaw = data.result.Val;
      this.$forceUpdate();
    });
    getConfigByCode({ code: 'usdthelper_list_settings' }).then(data => {
      this.channelConfig = data.result.Val;
    });
  },
  methods: {
    showAdd() {
      this.infoBox = true;
      this.bank = {};
    },
    showUsdtAdd() {
      this.usdtBox = true;
      this.usdt = { Card: '' };
    },
    showEdit(item) {
      this.infoBox = true;
      this.bank = _.cloneDeep(item);
      this.bank.Locale = this.bank.Locale || 'cn';
    },
    showUsdtEdit(item) {
      this.usdtBox = true;
      this.usdt = _.cloneDeep(item);
    },
    showOtherWalletEdit(item) {
      this.otherWalletBox = true;
      this.otherWalletModel = _.cloneDeep(item);
    },
    setBankStatus(item) {
      this.$store.commit('Confirm', {
        text: this.$t('g_msg_sureDo'),
        ok: () => {
          api
            .post(`/player/bank/status/${item.Id}/${item.UserId}`)
            .then(data => {
              this.$store.commit('MsgOk', this.$t('g_msgSet'));
              item.Deleted = !item.Deleted;
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    mergeBank() {
      if (this.$refs.form.validate()) {
        let url = `/player/bank/${this.userId}`;
        if (this.bank.Id > 0) {
          url += `/${this.bank.Id}`;
        }
        api
          .post(url, this.bank)
          .then(res => {
            this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            this.bank = {};
            this.infoBox = false;
            this.$emit('loadBanks');
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    mergeUsdt() {
      if (this.$refs.form.validate()) {
        let url = `/player/bank/${this.userId}`;
        if (this.usdt.Id) {
          url += `/${this.usdt.Id}`;
        }
        this.usdt.Bank = 'USDT';
        api
          .post(url, this.usdt)
          .then(res => {
            this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            this.usdt = {};
            this.usdtBox = false;
            this.$emit('loadBanks');
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    mergeOtherWallet() {
      const Bank = this.otherWalletModel.Bank
      const card = this.otherWalletModel.Card
      if (Bank === 'OKPAY' && card.length !== 16) {
        return this.$store.commit('MsgError', '钱包地址长度只能为16位')
      }
      if (Bank === 'TOPAY') {
        const reg = /^tp.*/
        if (!reg.test(card) || card.length !== 18) {
          return this.$store.commit('MsgError', '钱包地址须为以tp开头的18位英文数字组合')
        }
      }
      const regs = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]/ig
      if  (!regs.test(card)) {
        return this.$store.commit('MsgError',`钱包地址不能为纯英文或者纯数字！`)
      }
      if (this.$refs['other-form'].validate()) {
        let url = `/player/bank/${this.userId}`;
        if (this.otherWalletModel.Id) {
          url += `/${this.otherWalletModel.Id}`;
        }
        // this.usdt.Bank = this.otherWalletModel.Bank;
        api
          .post(url, this.otherWalletModel)
          .then(res => {
            this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            this.otherWalletModel = {};
            this.otherWalletBox = false;
            this.$emit('loadBanks');
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    deleteCard(item) {
      this.$store.commit('Confirm', {
        text: this.$t('g_msg_sureDo'),
        ok: () => {
          api
            .delete(`/player/bank/${item.UserId}/${item.Id}`)
            .then(() => {
              this.$store.commit('MsgOk', this.$t('g_msgSet'));
              this.$emit('loadBanks');
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    qrDetect(content) {
      if (content) {
        this.usdt.Card = content;
        this.$refs.qrInput.$el.value = '';
      } else {
        this.SET_MESSAGE({ message: this.textFilter('msg', { msg: '' }), type: 'warning' });
      }
    },
    qrError(error) {
      console.log(error);
      this.$store.commit('MsgError', '格式错误');
    },
  },
};
</script>
