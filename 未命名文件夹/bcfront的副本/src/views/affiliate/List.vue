<template>
  <div class="AffiliateList">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> group </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 新增代理 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1)">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="resetOptions()">
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_reset') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="_export">
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_export') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="addAffiliate">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('affiliate_list_create') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-if="searchShow" v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_less</v-icon>
          </v-btn>
          <v-btn v-else v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_more</v-icon>
          </v-btn>
        </template>
        <span v-if="searchShow">{{ $t('g_btn_searchHide') }}</span>
        <span v-else>{{ $t('g_btn_searchExpand') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 搜尋 -->
      <v-card v-if="searchShow" elevation="0" class="pa-3 mb-3 rounded-lg" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.refer_id"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_list_search_fields_id')"
              :placeholder="$t('affiliate_list_search_fields_id_placeholder')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.refer_name"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_list_search_fields_name')"
              :placeholder="$t('affiliate_list_search_fields_name_placeholder')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.code"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_list_search_fields_code')"
              :placeholder="$t('affiliate_list_search_fields_code_placeholder')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :disable-sort="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          :server-items-length="pagination.totalItems"
          :footer-props="{
            'items-per-page-options': [10, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template slot="headerCell" slot-scope="props">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <span v-on="on"> {{ props.header.text }} <v-icon v-if="props.header.tips" small>help</v-icon> </span>
              </template>
              <span v-if="props.header.tips"> {{ props.header.tips }} </span>
              <span v-else> {{ props.header.text }} </span>
            </v-tooltip>
          </template>
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <!-- 登录代理 调整余额按鈕 重置密码 清除验证 -->
              <td class="text-center text-no-wrap">
                <div class="d-flex align-center justify-start">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="loginAs(item.id)" v-on="on">
                        <v-icon>login</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('affiliate_list_loginAsAffiliate') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="showNote(item, $event)" v-on="on">
                        <v-icon>monetization_on</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('affiliate_list_modifyBalance') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="showPassword(item, $event)" v-on="on">
                        <v-icon>vpn_key</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('affiliate_list_resetPassword') }}</span>
                  </v-tooltip>

                  <v-tooltip v-if="item.authed == 1" bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="clearGoogle(item)" v-on="on">
                        <v-icon>phonelink_lock</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('affiliate_list_clearGoogle') }}</span>
                  </v-tooltip>
                </div>
              </td>
              <td class="text-left text-no-wrap">{{ item.id }}</td>
              <td class="text-left text-no-wrap">{{ item.name }}</td>
              <td class="text-left text-no-wrap">{{ item.nickname }}</td>
              <td class="text-left text-no-wrap">{{ item.code }}</td>
              <td class="text-left text-no-wrap">{{ item.affs ? item.affs : '--' }}</td>
              <td class="text-left text-no-wrap">
                <v-chip v-if="item.status == 2" label outlined small color="orange"> {{ $t('affiliate_list_status_frozen') }} </v-chip>
                <v-chip v-if="item.status == 1" label outlined small color="green"> {{ $t('affiliate_list_status_normal') }} </v-chip>
                <v-chip v-if="item.status == 0" label outlined small color="primary"> {{ $t('affiliate_list_status_notFinishActive') }} </v-chip>
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small color="primary"> {{ item.level ? item.level : '--' }}</v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.total_players }}</td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.deposit | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.withdrawal | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.effective_trading_amount | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.effective_trading_amount_sub | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.result | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.commission_result | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.commission | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.bonus | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.commission_result2 | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.final_commission | moneyColor"></td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.eff_result | moneyColor"></td>
              <td class="text-left text-no-wrap">
                <font :color="parseFloat(item.guest_loss) > parseFloat(item.final_commission) ? 'red' : 'green'">
                  {{ (parseFloat(item.guest_loss) - parseFloat(item.final_commission)) | money }}
                </font>
              </td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.balance | moneyColor"></td>
              <td class="text-left text-no-wrap">
                <v-chip v-if="item.authed == 0" label outlined small color="primary"> {{ $t('affiliate_list_google_status_notActive') }} </v-chip>
                <v-chip v-if="item.authed == 1" label outlined small color="green"> {{ $t('affiliate_list_google_status_active') }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>

      <!-- 重置密碼彈窗 -->
      <v-menu
        v-model="resetPW.show"
        :close-on-content-click="false"
        :nudge-width="500"
        right
        :nudge-bottom="25"
        :nudge-left="50"
        :position-x="resetPW.x"
        :position-y="resetPW.y"
        absolute
        offset-y
        persistent
      >
        <v-card elevation="2" class="pa-3 px-5 rounded-lg">
          <v-card-text>
            <h4>
              {{ $t('g_modifyPassword') }} <span>{{ aff.name }}</span>
            </h4>
          </v-card-text>
          <v-card-text>
            <v-row wrap>
              <v-col cols="12">
                <v-text-field
                  v-model="resetPW.password"
                  :label="$t('g_password')"
                  :placeholder="$t('g_newPassword')"
                  type="text"
                  append-outer-icon="sync"
                  outlined
                  @click:append-outer="refresh(resetPW, 'password')"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-2 mt-0 pt-0">
            <v-spacer></v-spacer>
            <v-btn small outlined color="primary" @click="resetPW.show = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn small color="primary" @click="resetPassword(aff.id)">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <!-- 調整餘額彈窗 -->
      <v-menu
        v-model="note.show"
        :close-on-content-click="false"
        :nudge-width="500"
        right
        :nudge-bottom="25"
        :nudge-left="50"
        :position-x="note.x"
        :position-y="note.y"
        absolute
        offset-y
        persistent
      >
        <v-card elevation="2" class="pa-3 px-5 rounded-lg">
          <v-card-text>
            <h4>
              {{ $t('finance_deposit_list_remarks') }} <span>{{ aff.name }}</span>
            </h4>
          </v-card-text>
          <v-card-text>
            <v-row wrap>
              <v-col cols="12">
                <v-radio-group v-model="reviseOpt.direction" row>
                  <v-radio :label="$t('g_increase')" value="1"></v-radio>
                  <v-radio :label="$t('g_decrease')" value="2"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model.number="reviseOpt.amount" :label="$t('g_quota')" :placeholder="$t('g_msgQuota')" type="number"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="reviseOpt.remark" value="" hide-details :placeholder="$t('g_input_remark')"></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-2 mt-3">
            <v-spacer></v-spacer>
            <v-btn small outlined color="primary" @click="note.show = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn small color="primary" @click="saveNote">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-container>

    <!-- 新增代理彈窗 -->
    <v-dialog v-model="infoBox" persistent width="800px" :retain-focus="false">
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2">{{ $t('affiliate_list_create') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="infoBox = false"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>

        <v-container grid-list-md class="py-5 px-10">
          <v-row wrap align="baseline">
            <v-col cols="12">
              <v-text-field v-model="affiliateInfo.Name" :label="$t('g_table_column_usernameId')" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="affiliateInfo.Nickname" :label="$t('g_table_column_nickname')" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="affiliateInfo.Passwd"
                :label="$t('g_password')"
                append-outer-icon="sync"
                @click:append-outer="refresh(affiliateInfo, 'Passwd')"
              />
            </v-col>
          </v-row>
        </v-container>

        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed @click.native="save">{{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { money, moneyColor, formatDate } from '@/filters/custom';
import _ from 'lodash'
// import Search from '../../components/Search.vue';
// import Detail from './Detail.vue'

export default {
  name: 'Playerlist',
  components: {
    // Search,
    // Detail
  },
  data() {
    return {
      searchOption: {
        date: [],
      },
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      shortcuts,
      searchShow: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['level'],
        sortDesc: [],
      },
      resetPW: {
        show: false,
        x: 0,
        y: 0,
      },
      datePickerOptions: {
        shortcuts,
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
          lang: 'affiliate_balanceHistory_affiliateId',
          text: '代理 ID',
          value: 'id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_usernameId',
          text: '用户名(ID)',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_nickname',
          text: '昵称',
          value: 'nickname',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_referCode',
          text: '推荐码',
          value: 'code',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_affs',
          text: '上级',
          value: 'affs',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'block_status',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_list_header_level',
          text: '级别',
          value: 'level',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_list_header_total_players',
          text: '用户数',
          value: 'total_players',
          sortable: true,
          tips: '用户数为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_deposit',
          text: '入金数',
          value: 'deposit',
          sortable: true,
          tips: '用户数为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_withdrawal',
          text: '出金数',
          value: 'withdrawal',
          sortable: true,
          tips: '用户数为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_effective_trading_amount',
          text: '直属交易额',
          value: 'effective_trading_amount',
          sortable: true,
          tips: '交易额为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_effective_trading_amount_sub',
          text: '下级代理交易额',
          value: 'effective_trading_amount_sub',
          sortable: true,
          tips: '交易额为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_result',
          text: '流水收益',
          value: 'result',
          sortable: true,
          tips: '流水收益为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_commission_result',
          text: '利润收益',
          value: 'commission_result',
          sortable: true,
          tips: '利润收益为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_commission',
          text: '实际收益',
          value: 'commission',
          sortable: true,
          tips: '实际收益为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_bonus',
          text: '游戏返水',
          value: 'bonus',
          sortable: true,
          tips: '实际收益为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_commission_result2',
          text: 'A+B结算（2级）',
          value: 'commission_result2',
          sortable: true,
          tips: '结算为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_final_commission',
          text: '最终结算',
          value: 'final_commission',
          sortable: true,
          tips: '结算为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_eff_result',
          text: '总客损',
          value: 'eff_result',
          sortable: true,
          tips: '结算为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_eff_result2',
          text: '贡献值',
          value: 'eff_result',
          sortable: true,
          tips: '结算为统计数据晚一天',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        // {
        //   lang: '手机',
        //   text: '手机',
        //   value: 'phone',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        // },
        {
          lang: 'affiliate_list_header_balance',
          text: '余额',
          value: 'balance',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_list_header_authed',
          text: 'google验证',
          value: 'authed',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      aff: {},
      data: ['SheetJS'.split(''), '1234567'.split(''), '1234567'.split(''), '1234567'.split('')],
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      reviseOpt: {},
      infoBox: false,
      affiliateInfo: {},
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang) || item.text;
        return item;
      });
    },
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage < this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadData(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
    'pagination.sortDesc'(desc) {
      if (desc != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
    'pagination.sortBy'(by) {
      if (by != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    _export(evt) {
      if (this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0];
        this.searchOption.e = this.searchOption.date[1];
      }
      api
        .get('/affiliate/list', {...this.searchOption, page:1, num: this.pagination.totalItems})
        .then(data => {
          if (data.result == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headerComputed.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);

            data.result.forEach(v => {
              const tmp = [];
              tmp.push(v.action);
              tmp.push(v.name);
              tmp.push(v.nickname);
              tmp.push(v.code);
              tmp.push(v.affs);
              if (v.status != 1) {
                tmp.push('冻结');
              } else {
                tmp.push('正常');
              }
              tmp.push(v.level);
              tmp.push(v.total_players);
              tmp.push(parseFloat(money(v.deposit, false)));
              tmp.push(parseFloat(money(v.withdrawal, false)));
              tmp.push(parseFloat(money(v.effective_trading_amount, false)));
              tmp.push(parseFloat(money(v.effective_trading_amount_sub, false)));
              tmp.push(parseFloat(money(v.result, false)));
              tmp.push(parseFloat(money(v.commission_result, false)));
              tmp.push(parseFloat(money(v.commission, false)));
              tmp.push(parseFloat(money(v.bonus, false)));
              tmp.push(parseFloat(money(v.commission_result2, false)));
              tmp.push(parseFloat(money(v.final_commission, false)));
              tmp.push(parseFloat(money(v.eff_result, false)));
              tmp.push(parseFloat(money(parseFloat(v.guest_loss) - parseFloat(v.final_commission), false)));
              tmp.push(parseFloat(money(v.balance, false)));
              if (v.authed == 1) {
                tmp.push(' 开启 ');
              } else {
                tmp.push(' 未开启 ');
              }
              tmp.push(formatDate(v.created));
              _export.push(tmp);
            });
            exportXLSX(_export, '代理列表');
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    showPassword(item, e) {
      e.preventDefault();
      this.resetPW.show = false;
      this.resetPW.x = e.clientX;
      this.resetPW.y = e.clientY;
      this.$nextTick(() => {
        this.aff = item;
        this.resetPW.show = true;
      });
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      this.searchOption.sort = this.pagination.sortBy[0];
      this.searchOption.asc = !this.pagination.sortDesc[0];

      if (this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0];
        this.searchOption.e = this.searchOption.date[1];
      }
      api
        .get('/affiliate/list', this.searchOption)
        .then(data => {
          this.desserts = data.result.players == null ? [] : data.result.players;
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    loginAs(id) {
      api
        .get(`/affiliate/login/${id}`)
        .then(data => {
          window.open(data.result);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    resetPassword(id) {
      if (this.resetPW.password == undefined || this.resetPW.password.length < 6 || this.resetPW.password.length > 16) {
        this.$store.commit('MsgError', '请输入新的密码');
        return false;
      }
      this.resetPW.show = false;
      this.$store.commit('Confirm', {
        text: `是否确认重置用户 [${this.aff.name}] 的密码？`,
        ok: () => {
          api
            .post(`/affiliate/password/${id}`, {
              password: this.resetPW.password,
            })
            .then(data => {
              this.$store.commit('MsgOk', '修改成功');
              this.resetPW.password = '';
              this.resetPW.show = false;
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
        cancel: () => {
          this.resetPW.password = '';
        },
      });
    },
    refresh(target, field) {
      const rand = Math.random().toString();
      this.$set(target, field, rand.slice(-6));
    },
    showNote(item, e, cfm) {
      e.preventDefault();
      this.note.show = false;
      this.note.x = e.clientX;
      this.note.y = e.clientY;
      this.$nextTick(() => {
        this.aff = item;
        this.note.show = true;
      });
    },
    saveNote() {
      const $this = this;
      if ($this.reviseOpt.direction == undefined) {
        $this.$store.commit('MsgError', '请选择调整方式');
        return false;
      }
      if ($this.reviseOpt.amount == undefined || $this.reviseOpt.amount == 0) {
        $this.$store.commit('MsgError', '请输入正确的金额');
        return false;
      }
      if ($this.reviseOpt.remark == undefined && $this.reviseOpt.remark == '') {
        $this.$store.commit('MsgError', '请输入备注信息');
        return false;
      }
      $this.note.show = false;
      $this.$store.commit('Confirm', {
        text: '确认进行余额调整？',
        ok() {
          api
            .post(`/affiliate/balance/${$this.aff.id}`, $this.reviseOpt)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.reviseOpt = {};
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
              $this.note.show = true;
            });
        },
        cancel() {
          $this.note.show = true;
        },
      });
    },
    clearGoogle(item) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '确认清除此代理Google认证信息？',
        ok() {
          api
            .get(`/affiliate/google/${item.id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              item.authed = 0;
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    addAffiliate() {
      this.affiliateInfo = {};
      this.infoBox = true;
    },
    save() {
      api
        .post('/affiliate/add', this.affiliateInfo)
        .then(res => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.loadData(1);
          this.infoBox = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {});
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else {
          this.searchOption[i] = null;
        }
      });
    },
  },
};
</script>
