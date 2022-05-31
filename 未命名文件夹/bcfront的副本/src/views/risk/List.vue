<template>
  <div class="RiskList">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> security </v-icon>
      <v-toolbar-title> {{ $t('sidebar_riskList') }}</v-toolbar-title>
      <!-- <v-toolbar-title> {{ $t('sidebar_riskList') }} - {{ $t(riskType[status].lang) }}</v-toolbar-title> -->
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 展開按鈕 -->
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
          <v-col v-if="status == 0 || status == 1" cols="6">
            <v-text-field
              v-model="riskType[status].searchOption.name"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('g_text_field_username')"
              :placeholder="$t('g_text_field_placeholder_username')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col v-if="status == 1" cols="6">
            <v-select
              v-model="riskType[status].searchOption.alarm_type"
              :items="typesComputed"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('g_select_alarmType')"
            ></v-select>
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense>
        <v-col v-for="(item, index) in riskType" :key="index" @click="$router.push(`/risk/list/${routes[index] ? routes[index] : ''}`)">
          <v-alert dense dark :color="riskType[index].label" border="left">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="mx-2">person</v-icon>{{ $t(item.lang) || item.name }} </span>
              <span class="text-h5 font-weight-bold ml-10">{{ riskType[index].summary ? riskType[index].summary : 0 }}</span>
              <v-spacer></v-spacer>
              <v-btn dark small icon> <v-icon>loop</v-icon> </v-btn>
            </div>
            <div class="d-flex align-center justify-space-between mt-2">
              <span class="d-flex align-center"> <v-icon class="mx-2">schedule</v-icon> {{ $t('g_updated') }} </span>
              <span v-if="notifications[riskType[index].key]">
                {{ notifications[riskType[index].key].record_update_time | formatDate }}
              </span>
              <span v-else class="text-h5 font-weight-bold">--</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="riskType[status].data"
          :loading="riskType[status].loading"
          :disable-sort="riskType[status].loading"
          :page.sync="riskType[status].pagination.page"
          :items-per-page.sync="riskType[status].pagination.itemsPerPage"
          :sort-desc.sync="riskType[status].pagination.sortDesc"
          :sort-by.sync="riskType[status].pagination.sortBy"
          :footer-props="{
            'items-per-page-options': [10, 25, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item, index }">
            <tr>
              <!-- 出入金异常 -->
              <template v-if="status == 0">
                <!-- 操作 -->
                <td class="text-center text-no-wrap" nowrap>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="red lighten-2" v-bind="attrs" v-on="on" @click="kick(item.user_id)">
                        <v-icon>public_off</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('player_detail_profile_btnKick') }}</span>
                  </v-tooltip>

                  <v-tooltip v-if="item.w_status == 1" bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="red lighten-2" v-bind="attrs" v-on="on" @click="setWithdrawStatus(item.user_id, 0)">
                        <v-icon>money_off</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('player_detail_profile_textfield_banWithdraw') }}</span>
                  </v-tooltip>

                  <v-tooltip v-else bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="setWithdrawStatus(item.user_id, 1)">
                        <v-icon>attach_money</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_allowWithdraw') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="setPlayerTag(item.user_id, item.name, item.tags)">
                        <v-icon>label</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('player_detail_profile_btnSetPlayerTags') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="showDetail(item.user_id)">
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_expand') }}</span>
                  </v-tooltip>
                </td>
                <!-- 啟用帳戶 -->
                <td class="text-center text-no-wrap" nowrap>
                  <v-switch v-model="item.enable" class="pa-0" color="primary" @click="setStatus(item.user_id, Number(!item.enable), index)" />
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
                </td>
                <td v-if="item.tags != ''" class="text-left" style="min-width: 300px">
                  <v-chip
                    v-for="id in formatTag(item.tags)"
                    :key="id"
                    :color="tags[id] ? tags[id]['color'] : ''"
                    label
                    small
                    class="white--text mr-1 d-inline-block"
                  >
                    {{ tags[id] ? tags[id]['name'] : '--' }}
                  </v-chip>
                </td>
                <td v-else class="text-left text-no-wrap"><v-chip label outlined small color="primary">--</v-chip></td>
                <td class="text-left text-no-wrap">{{ item.request_withdrawal_amount | money }}</td>
                <td class="text-left text-no-wrap">{{ item.total_deposit_amount | money }}</td>
                <td class="text-left text-no-wrap">{{ item.total_withdrawal_amount | money }}</td>
                <td class="text-left text-no-wrap">{{ item.alarm_amount | money }}</td>
                <td class="text-left text-no-wrap">{{ item.last_deposit_time | formatDate }}</td>
                <td class="text-left text-no-wrap">{{ item.request_time | formatDate }}</td>
              </template>
              <!-- 盈利异常 -->
              <template v-if="status == 1">
                <!-- 操作 -->
                <td class="text-center text-no-wrap" nowrap>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="red lighten-2" v-bind="attrs" v-on="on" @click="kick(item.user_id)">
                        <v-icon>public_off</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('player_detail_profile_btnKick') }}</span>
                  </v-tooltip>

                  <v-tooltip v-if="item.w_status == 1" bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="red lighten-2" v-bind="attrs" v-on="on" @click="setWithdrawStatus(item.user_id, 0)">
                        <v-icon>money_off</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('player_detail_profile_textfield_banWithdraw') }}</span>
                  </v-tooltip>

                  <v-tooltip v-else bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="setWithdrawStatus(item.user_id, 1)">
                        <v-icon>attach_money</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_allowWithdraw') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="setPlayerTag(item.user_id, item.name, item.tags)">
                        <v-icon>label</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('player_detail_profile_btnSetPlayerTags') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="showDetail(item.user_id)">
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_expand') }}</span>
                  </v-tooltip>
                </td>
                <!-- 啟用帳戶 -->
                <td class="text-center text-no-wrap" nowrap>
                  <v-switch v-model="item.enable" class="pa-0" color="primary" @click="setStatus(item.user_id, Number(!item.enable), index)" />
                </td>
                <td class="text-left text-no-wrap">
                  {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
                </td>
                <td class="text-center text-no-wrap">
                  <v-chip label outlined small color="primary">{{ _.find(typesComputed, d => d.value == item.alarm_type).text }}</v-chip>
                </td>
                <td v-if="item.tags != ''" class="text-left" style="min-width: 300px">
                  <template v-for="id in formatTag(item.tags)">
                    <v-chip v-if="tags[id]" :key="id" lbel :color="tags[id] ? tags[id]['color'] : ''" label small class="white--text mr-1">
                      {{ tags[id] ? tags[id]['name'] : '--' }}
                    </v-chip>
                  </template>
                </td>
                <td v-else class="text-left text-no-wrap"><v-chip label outlined small color="primary">--</v-chip></td>
                <td class="text-left text-no-wrap">{{ item.alarm_begin_time | formatDate }} - {{ item.alarm_end_time | formatDate }}</td>
                <td class="text-left text-no-wrap">{{ item.total_bet_amount | money }}</td>
                <td class="text-left text-no-wrap">{{ item.total_payout_amount | money }}</td>
                <td class="text-left text-no-wrap">{{ item.total_result_amount | money }}</td>
              </template>

              <!-- 操作异常 -->
              <template v-if="status == 2">
                <td class="text-left text-no-wrap">{{ item.ip }} ({{ item.ip_region }})</td>
                <td class="text-left text-no-wrap">
                  <a href="javascript:" class="text-decoration-none" @click="$router.push(`/player/list/${item.ip}`)">{{ item.num }}</a>
                </td>
                <td class="text-left text-no-wrap">{{ item.created }}</td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="d-flex align-center justify-space-between mx-5">
          <!-- 條件 -->
          <div>
            <v-row dense>
              <!-- eslint-disable vue/no-v-html -->
              <v-icon color="red"> privacy_tip </v-icon>
              <v-col
                v-if="status == 0 && settings.payment_alarm"
                xs12
                py-5
                v-html="
                  $t('risk_list_conditions_description1', {
                    times: highlightHtml(settings.payment_alarm.withdrawal_greater_than_deposit_times),
                  })
                "
              ></v-col>
              <v-col
                v-if="status == 1 && settings.profit_alarm"
                xs12
                py-5
                v-html="
                  $t('risk_list_conditions_description2', {
                    days: highlightHtml(settings.profit_alarm.accumulated.gain_continuation_days),
                    amount: highlightHtml(money(settings.profit_alarm.accumulated.gain_amount_greater_than)),
                    times: highlightHtml(settings.profit_alarm.profit_greater_than_bet_times),
                  })
                "
              ></v-col>
              <v-col
                v-if="status == 2 && settings.operation_alarm"
                xs12
                py-5
                v-html="
                  $t('risk_list_conditions_description3', {
                    sameDevice: settings.operation_alarm.is_restrict_same_device ? $t('risk_list_conditions_description3_sameDevice') : '',
                    loginCount: highlightHtml(settings.operation_alarm.same_ip_count),
                  })
                "
              ></v-col>
            </v-row>
          </div>
          <!-- 頁數 -->
          <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
            <v-pagination
              v-model="riskType[status].pagination.page"
              :length="riskType[status].pagination.length"
              :total-visible="15"
              :disabled="riskType[status].loading"
            ></v-pagination>
            <div class="diy-page">
              {{ $t('g_pagination_rows') }}&nbsp;&nbsp;
              <v-select v-model="riskType[status].pagination.itemsPerPage" class="diy-page-select" :items="selectItems"> </v-select>
            </div>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 編輯標籤彈窗 -->
    <v-dialog v-model="setTag.show" persistent width="80%">
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ $t('player_detail_profile_playerTags') }}</v-list-item-title>
              <v-list-item-subtitle>{{ $t('player_detail_profile_textfield_user') }}{{ player.name }} {{ setTag.tags }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn class="primary--text" icon>
                <v-icon>favorite</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-card class="transparent">
          <v-card-text class="py-0">
            <v-layout wrap>
              <v-flex v-for="(r, index) in tags" :key="`tags_${index}`" xs4>
                <v-checkbox v-model="setTag.tags" :label="r.name" color="primary" :value="index"></v-checkbox>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text class="x-small" @click="setTag.show = false">{{ $t('g_btn_cancel') }}</v-btn>
          <v-btn color="primary" depressed class="x-small" @click="saveTag(player.id)">{{ $t('g_btn_save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { money, formatDate } from '../../filters/custom';
import { mapGetters } from 'vuex';

export default {
  name: 'RiskList',
  components: {},
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      searchShow: true,
      loading: false,
      status: 0,
      setTag: {
        tags: [],
        show: false,
      },
      player: {},
      settings: {},
      tags: [],
      routes: ['payment', 'profit', 'operation'],
      riskType: [
        {
          lang: 'risk_list_riskType_payment',
          apiUrl: '/system/risk_alarm/payment',
          name: '出入金异常',
          label: 'orange',
          tlabel: 'orange lighten-3',
          key: 'payment_alarm',
          summary: '-',
          updated: null,
          loading: false,
          data: [],
          searchOption: {},
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: [],
            sortDesc: [],
          },
          headers: [
            {
              lang: 'g_table_column_action',
              text: '操作',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'center',
            },
            {
              lang: 'risk_list_riskType_payment_header_btnEnable',
              text: '启用帐户',
              sortable: false,
              value: 'block_status',
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_usernameId',
              text: '用户名(ID)',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_payment_header_tags',
              text: '玩家标签',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_payment_header_withdrawRequest',
              text: '申请出金金额',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_payment_header_totalDeposit',
              text: '总入金',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_payment_header_totalWithdrawal',
              text: '总出金',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_payment_header_alarmAmount',
              text: '示警水位标准',
              value: 'created',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_payment_header_lastRequest',
              text: '最后入金时间',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_payment_header_requestTime',
              text: '申请时间',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
          ],
        },
        {
          lang: 'risk_list_riskType_profit',
          apiUrl: '/system/risk_alarm/profit',
          name: '盈利异常',
          label: 'green',
          tlabel: 'green lighten-3',
          key: 'profit_alarm',
          summary: '-',
          updated: null,
          loading: false,
          data: [],
          searchOption: {},
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: [],
            sortDesc: [],
          },
          types: [
            {
              value: 1,
              text: '累積天數',
              lang: 'risk_list_riskType_profit_types_days',
            },
            {
              value: 2,
              text: '倍數',
              lang: 'risk_list_riskType_profit_types_times',
            },
          ],
          headers: [
            {
              lang: 'g_table_column_action',
              text: '操作',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'center',
            },
            {
              lang: 'risk_list_riskType_payment_header_btnEnable',
              text: '启用帐户',
              sortable: false,
              value: 'block_status',
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_usernameId',
              text: '用户名(ID)',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_profit_types',
              text: '异常类型',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'center',
            },
            {
              lang: 'risk_list_riskType_profit_header_tags',
              text: '玩家标签',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_profit_header_duration',
              text: '异常区间',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_profit_header_totalBet',
              text: '总投注',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_profit_header_totalPayout',
              text: '总派彩',
              value: 'amount',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_profit_header_totalWinLoss',
              text: '总输赢',
              value: 'created',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
          ],
        },
        {
          lang: 'risk_list_riskType_operation',
          apiUrl: '/system/risk_alarm/operation',
          name: '操作异常',
          label: 'grey',
          tlabel: 'grey lighten-3',
          key: 'operation_alarm',
          summary: '-',
          updated: null,
          loading: false,
          data: [],
          searchOption: {},
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['created'],
            sortDesc: [true],
          },
          headers: [
            {
              lang: 'risk_list_riskType_operation_header_IP',
              text: '登录IP',
              value: '',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_operation_header_Count',
              text: '人數',
              value: 'num',
              sortable: true,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'risk_list_riskType_operation_header_LastLogin',
              text: '最后登录时间',
              value: 'created',
              sortable: true,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
          ],
        },
      ],
    };
  },
  computed: {
    ...mapGetters({ notifications: 'notifications' }),
    config() {
      return this.$store.getters.config;
    },
    headerComputed() {
      const headerComputed = _.each(this.riskType[this.status].headers, item => {
        item.text = this.$t(item.lang);
      });
      return headerComputed;
    },
    paymentRisk() {
      return this.riskType[0];
    },
    profitRisk() {
      return this.riskType[1];
    },
    operationRisk() {
      return this.riskType[2];
    },
    typesComputed() {
      const typesComputed = _.each(this.riskType[this.status].types, item => {
        item.text = this.$t(item.lang);
      });
      return typesComputed;
    },
  },
  watch: {
    'paymentRisk.pagination.page'(n) {
      this.loadData(n);
    },
    'profitRisk.pagination.page'(n) {
      this.loadData(n);
    },
    'operationRisk.pagination.page'(n) {
      this.loadData(n);
    },
    'operationRisk.pagination.sortDesc'(desc) {
      if (desc != null) {
        this.operationRisk.pagination.page = 1;
        this.loadData(this.operationRisk.pagination.page);
      }
    },
    'operationRisk.pagination.sortBy'(by) {
      if (by != null) {
        this.operationRisk.pagination.page = 1;
        this.loadData(this.operationRisk.pagination.page);
      }
    },
    'paymentRisk.pagination.itemsPerPage'(newVal) {
      const current = this.riskType[this.status];
      current.pagination.page = 1;
      this.loadData(current.pagination.page);
    },
    'profitRisk.pagination.itemsPerPage'(newVal) {
      const current = this.riskType[this.status];
      current.pagination.page = 1;
      this.loadData(current.pagination.page);
    },
    'operationRisk.pagination.itemsPerPage'(newVal) {
      const current = this.riskType[this.status];
      current.pagination.page = 1;
      this.loadData(current.pagination.page);
    },
    status() {
      this.loadData(1);
    },
    '$route.params.type'(t) {
      if (t) {
        this.status = _.findIndex(this.routes, item => item == t);
      } else {
        this.status = 0;
      }
    },
  },
  created() {
    this.loadData(1);
    this.loadStatistics();
    if (this.$route.params.type) {
      this.status = _.findIndex(this.routes, item => item == this.$route.params.type);
    }
    this.getTags();
    this.getRiskSettings();
  },
  methods: {
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    loadStatistics() {
      api
        .get('system/risk_alarm/total')
        .then(resp => {
          this.riskType[0].summary = resp.result.withdrawal;
          this.riskType[1].summary = resp.result.profit;
          this.riskType[2].summary = resp.result.operation;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    loadData(p, status) {
      const current = this.riskType[status || this.status];
      if (current.loading) {
        return;
      }
      current.loading = true;
      current.pagination.page = p;
      const params = {
        ...current.searchOption,
        page: p,
        num: current.pagination.itemsPerPage,
        status: current.status,
        sort: current.pagination.sortBy[0],
        asc: !current.pagination.sortDesc[0],
      };
      api
        .get(current.apiUrl, params)
        .then(resp => {
          if (!status || status == this.status) {
            current.data = resp.result.datas ?? [];
          }
          current.pagination.length = resp.result.pageNums;
          current.pagination.totalItems = resp.result.total;
          current.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    resetOptions() {
      const current = this.riskType[this.status];
      _.each(current.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          current.searchOption[i] = [];
        } else {
          current.searchOption[i] = null;
        }
      });
    },
    setStatus(id, block, index) {
      const current = this.riskType[this.status];
      if (current.loading) {
        return;
      }
      current.loading = true;
      this.$store.commit('Confirm', {
        ok: () => {
          api
            .post(`/player/status/${id}/${block}`)
            .then(data => {
              this.$store.commit('MsgOk', this.$t('g_msgSet'));
              current.loading = false;
              this.loadData(1);
            })
            .catch(error => {
              current.loading = false;
              this.$store.commit('MsgError', error.error);
            });
        },
        cancel: () => {
          this.riskType[this.status].data[index].enable = !!block;
          current.loading = false;
        },
      });
    },
    kick(id) {
      const current = this.riskType[this.status];
      if (current.loading) {
        return;
      }
      current.loading = true;
      this.$store.commit('Confirm', {
        ok: () => {
          api
            .get(`/player/logout/${id}`, {
              Status: 1,
            })
            .then(data => {
              this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
              current.loading = false;
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
              current.loading = false;
            });
        },
        cancel: () => {
          current.loading = false;
        },
      });
    },
    setWithdrawStatus(id, status) {
      const current = this.riskType[this.status];
      if (current.loading) {
        return;
      }
      current.loading = true;
      this.$store.commit('Confirm', {
        ok: () => {
          api
            .put(`/player/withdrawstatus/${id}?status=${status}`)
            .then(data => {
              this.player.w_status = status;
              this.$store.commit('MsgOk', this.$t('g_msgSet'));
              current.loading = false;
              this.loadData(1);
            })
            .catch(error => {
              this.player.w_status = Number(!status);
              current.loading = false;
              this.$store.commit('MsgError', error.error);
            });
        },
        cancel: () => {
          current.loading = false;
        },
      });
    },
    setPlayerTag(id, name, tags) {
      this.player = { id, name, tags };
      this.setTag.tags = tags.split(',');
      this.setTag.show = true;
    },
    saveTag(id) {
      const current = this.riskType[this.status];
      if (current.loading) {
        return;
      }
      current.loading = true;
      const ids = this.setTag.tags;
      api
        .post(`/player/tag/${id}`, { Ids: ids })
        .then(data => {
          // this.player.tagArr = this.setTag.tags;
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.setTag.show = false;
          current.loading = false;
          this.loadData(1);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
          current.loading = false;
        });
    },
    getTags() {
      api
        .get('/player/tagkv')
        .then(data => {
          this.tags = data;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    formatTag(tags) {
      return tags.split(',');
    },
    getRiskSettings() {
      api
        .get('/system/risk_control_setting')
        .then(resp => {
          this.settings = resp;
        })
        .catch(error => {});
    },
    money(num) {
      return money(num);
    },
    highlightHtml(str) {
      return `<span class="red--text">${str}</span>`;
    },
  },
};
</script>
