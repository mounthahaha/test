<template>
  <div class="AffiliateDaily">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> group </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadDaily(1)">
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
              v-model="searchOption.id"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_daily_textfield_affiliateId')"
              :placeholder="$t('affiliate_daily_textfield_affiliateId')"
              @keydown.enter="loadDaily(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.name"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_daily_textfield_affiliateName')"
              :placeholder="$t('affiliate_daily_textfield_affiliateName')"
              @keydown.enter="loadDaily(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.code"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_daily_textfield_affiliateInfo')"
              :placeholder="$t('affiliate_daily_textfield_affiliateInfo')"
              @keydown.enter="loadDaily(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <!-- <date-picker
              v-model="searchOption.date"
              :placeholder="$t('g_selector_dateRange')"
              :shortcuts="shortcuts"
              range
              format="YYYY-MM-DD"
              width="270"
              :class="`v-input v-text-field`"
            ></date-picker> -->
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="green" style="cursor: pointer" @click="searchOption.status = 0">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t('affiliate_monthly_unsettled') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary[0] ? summary[0] : '--' }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="red" style="cursor: pointer" @click="searchOption.status = 1">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t('affiliate_monthly_settled') }}</span>
              <span class="text-h5 font-weight-bold">{{ summary[1] ? summary[1] : '--' }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

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
          <template #item="{ item }">
            <tr>
              <!-- 確認 拒绝 备注 -->
              <td class="text-center text-no-wrap">
                <div class="d-flex align-center justify-center">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        v-if="item.paid_flag == 0 && item.aff_status == 1"
                        icon
                        color="primary"
                        v-bind="attrs"
                        @click="confirmDaily(item)"
                        v-on="on"
                      >
                        <v-icon>calculate</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('affiliate_monthly_settle') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="showNote(item, $event)" v-on="on">
                        <v-icon>monetization_on</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('affiliate_monthly_settlement') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn v-if="item.paid_flag == 0" icon color="primary" v-bind="attrs" @click="rejectWithdrawal(item)" v-on="on">
                        <v-icon>highlight_off</v-icon>
                      </v-btn>
                    </template>
                    <span>拒绝</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="showNote(item, $event)" v-on="on">
                        <v-icon>note_add</v-icon>
                      </v-btn>
                    </template>
                    <span>备注</span>
                  </v-tooltip>
                </div>
              </td>

              <!-- <td class="text-left text-no-wrap">
                  <v-list v-if="item.paid_flag == 0 && item.aff_status == 1">
                    <v-list-item @click="confirmDaily(item)">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="green lighten-1 white--text">check_circle_outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>{{ $t('affiliate_monthly_settle') }}</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="showNote(item, $event)">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="error lighten-1 white--text">check_circle_outline</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>{{ $t('affiliate_monthly_settlement') }}</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="rejectWithdrawal(item)" v-if="item.paid_flag == 0">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="error lighten-1 white--text">highlight_off</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>拒绝</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="showNote(item, $event)">
                      <v-list-item-avatar size="23">
                        <v-icon size="23" class="info lighten-1 white--text">note_add</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>备注</v-list-item-title>
                    </v-list-item>

                  </v-list>
              </td> -->
              <td class="text-left text-no-wrap">{{ item.name }}({{ item.aid }})</td>
              <td class="text-left text-no-wrap">{{ item.year_month_day | formatDay }}</td>
              <td class="text-left text-no-wrap">{{ item.total_players }}</td>
              <td class="text-left text-no-wrap">{{ item.total_player_deposit | money }}</td>
              <td class="text-left text-no-wrap">{{ item.total_player_withdrawal | money }}</td>
              <td class="text-left text-no-wrap">{{ item.total_trading | money }}</td>
              <!-- <td class="text-left text-no-wrap">{{ item.effective_trading_amount_sub | money }}</td> -->
              <td class="text-left text-no-wrap">{{ item.bonus | money }}</td>
              <td class="text-left text-no-wrap">
                <template v-if="parseFloat(item.result) > 0">
                  <a href="javascript:;" class="text-decoration-none" @click="showDetail(item)"> {{ item.result | money }} </a>
                </template>
                <template v-else> {{ item.result | money }} </template>
              </td>
              <td class="text-center text-no-wrap">
                <v-chip v-if="item.paid_flag == 0" label outlined small color="orange">
                  {{ $t('affiliate_daily_status_unsettled') }}
                </v-chip>
                <v-chip v-if="item.paid_flag == 1" label outlined small color="green">
                  {{ $t('affiliate_daily_status_settled') }}
                </v-chip>
              </td>
              <td class="text-center text-no-wrap">
                <v-chip v-if="item.aff_status == 0" label outlined small color="orange">
                  {{ $t('affiliate_daily_status_disabled') }}
                </v-chip>
                <v-chip v-if="item.aff_status == 1" label outlined small color="green">
                  {{ $t('affiliate_daily_status_normal') }}
                </v-chip>
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <!-- <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div> -->
        </div>
      </v-card>

      <v-menu
        v-model="note.show"
        :close-on-content-click="false"
        :nudge-width="300"
        right
        :nudge-left="50"
        :position-x="note.x"
        :position-y="note.y"
        absolute
        offset-y
      >
        <v-card>
          <v-list>
            <v-list-item avatar>
              <v-list-item-content>
                <v-list-item-title>{{ $t('affiliate_monthly_settlement') }}</v-list-item-title>
                <v-list-item-subtitle>{{ order.name }} （{{ order.year_month_day | formatDay }}）</v-list-item-subtitle>
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
                <v-flex md12>
                  <v-text-field v-model="order.result" :label="$t('g_amount')" hide-details></v-text-field>
                </v-flex>
                <v-flex md12>
                  <v-textarea v-model="order.note" value="" hide-details :placeholder="$t('g_input_remark')"></v-textarea>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text class="x-small" @click="note.show = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn color="primary" depressed class="x-small" text @click="saveNote">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-container>

    <!-- 玩家詳情彈窗 -->
    <v-dialog v-model="detail" persistent width="90%">
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-icon class="mr-2"> list </v-icon>
          <v-toolbar-title>{{ $t('affiliate_daily_search_result_title') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click.native="detail = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-container fluid class="pa-10">
          <!-- 統計 -->
          <v-row dense class="mb-3">
            <v-col cols="4" class="pt-0 mb-2">
              <v-alert color="primary" text border="left" class="mb-0 pr-8">
                <div class="d-flex align-start mb-0">
                  <span>{{ $t('affiliate_daily_search_result_totalDeposits') }}</span>
                </div>
                <div class="d-flex align-end justify-end">
                  <span v-if="summaryC.deposit" class="text-h5 font-weight-bold">{{ summaryC.deposit | money }}</span>
                  <span v-else class="text-h5 font-weight-bold">--</span>
                </div>
              </v-alert>
            </v-col>

            <v-col cols="4" class="pt-0 mb-2">
              <v-alert color="primary" text border="left" class="mb-0 pr-8">
                <div class="d-flex align-start mb-0">
                  <span>{{ $t('affiliate_daily_search_result_totalWithdrawals') }}</span>
                </div>
                <div class="d-flex align-end justify-end">
                  <span v-if="summaryC.withdrawal" class="text-h5 font-weight-bold">{{ summaryC.withdrawal | money }}</span>
                  <span v-else class="text-h5 font-weight-bold">--</span>
                </div>
              </v-alert>
            </v-col>

            <v-col cols="4" class="pt-0 mb-2">
              <v-alert color="primary" text border="left" class="mb-0 pr-8">
                <div class="d-flex align-start mb-0">
                  <span>{{ $t('affiliate_daily_search_result_totalBet') }}</span>
                </div>
                <div class="d-flex align-end justify-end">
                  <span v-if="summaryC.bet_amount" class="text-h5 font-weight-bold">{{ summaryC.bet_amount | money }}</span>
                  <span v-else class="text-h5 font-weight-bold">--</span>
                </div>
              </v-alert>
            </v-col>

            <v-col cols="4" class="pt-0 mb-2">
              <v-alert color="primary" text border="left" class="mb-0 pr-8">
                <div class="d-flex align-start mb-0">
                  <span>{{ $t('affiliate_daily_search_result_totalPayout') }}</span>
                </div>
                <div class="d-flex align-end justify-end">
                  <span v-if="summaryC.payout_amount" class="text-h5 font-weight-bold">{{ summaryC.payout_amount | money }}</span>
                  <span v-else class="text-h5 font-weight-bold">--</span>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="4" class="pt-0 mb-2">
              <v-alert color="primary" text border="left" class="mb-0 pr-8">
                <div class="d-flex align-start mb-0">
                  <span>{{ $t('affiliate_daily_search_result_totalWinLoss') }}</span>
                </div>
                <div class="d-flex align-end justify-end">
                  <span v-if="summaryC.result_amount" class="text-h5 font-weight-bold">{{ summaryC.result_amount | money }}</span>
                  <span v-else class="text-h5 font-weight-bold">--</span>
                </div>
              </v-alert>
            </v-col>

            <v-col cols="4" class="pt-0 mb-2">
              <v-alert color="primary" text border="left" class="mb-0 pr-8">
                <div class="d-flex align-start mb-0">
                  <span>{{ $t('affiliate_daily_search_result_totalPlayers') }}</span>
                </div>
                <div class="d-flex align-end justify-end">
                  <span v-if="summaryC.users" class="text-h5 font-weight-bold">{{ summaryC.users }}</span>
                  <span v-else class="text-h5 font-weight-bold">--</span>
                </div>
              </v-alert>
            </v-col>

            <!-- <template slot="footer">
            <td colspan="100%">
              <v-chip label outlined small color="pink">
                {{ $t('affiliate_daily_search_result_totalDeposits') }} : {{ summaryC.deposit | money }}
              </v-chip>
              <v-chip label outlined small color="pink">
                {{ $t('affiliate_daily_search_result_totalWithdrawals') }} : {{ summaryC.withdrawal | money }}
              </v-chip>
              <v-chip label outlined small color="pink">
                {{ $t('affiliate_daily_search_result_totalBet') }} : {{ summaryC.bet_amount | money }}
              </v-chip>
              <v-chip label outlined small color="pink">
                {{ $t('affiliate_daily_search_result_totalPayout') }} : {{ summaryC.payout_amount | money }}
              </v-chip>
              <v-chip label outlined small color="pink">
                {{ $t('affiliate_daily_search_result_totalWinLoss') }} : {{ summaryC.result_amount | money }}
              </v-chip>
              <v-chip label outlined small color="pink">
                {{ $t('affiliate_daily_search_result_totalPlayers') }} : {{ summaryC.users }}
              </v-chip>
            </td>
          </template> -->
          </v-row>

          <!-- 列表 -->
          <v-card elevation="2" class="pa-5 rounded-lg">
            <v-data-table
              :headers="detailHeadersComputed"
              :items="detailDesserts"
              :loading="loading"
              :disable-sort="loading"
              :page.sync="paginationC.page"
              :items-per-page.sync="paginationC.itemsPerPage"
              :sort-desc.sync="paginationC.sortDesc"
              :sort-by.sync="paginationC.sortBy"
              :server-items-length="paginationC.totalItems"
              :footer-props="{
                'items-per-page-options': [10, 50, 100, 150, 200],
                'items-per-page-text': $t('g_pagination_rows'),
              }"
              class="elevation-0"
              hide-default-footer
            >
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="no-data"> {{ $t('g_text_noData') }} </template>
              <template #item="{ item }">
                <tr>
                  <td class="text-left text-no-wrap">{{ index + 1 }}</td>
                  <td class="text-left text-no-wrap">
                    {{ item.name }}
                    (<a href="#" class="text-decoration-none" @click.prevent="$store.commit('PLAYER', item.user_id)"> {{ item.user_id }} </a>)
                    <template v-if="item.username != item.name">- {{ item.username }}</template>
                  </td>
                  <td class="text-left text-no-wrap">{{ item.affs }}</td>
                  <td class="text-left text-no-wrap">{{ item.deposit | money }}</td>
                  <td class="text-left text-no-wrap">{{ item.withdrawal | money }}</td>
                  <td class="text-left text-no-wrap">{{ item.bet_amount | money }}</td>
                  <td class="text-left text-no-wrap">{{ item.payout_amount | money }}</td>
                  <td class="text-left text-no-wrap">
                    <font v-if="item.result_amount > 0" color="red"> {{ item.result_amount | money }} </font>
                    <font v-else-if="item.result_amount < 0" color="green">{{ item.result_amount | money }}</font>
                    <font v-else>{{ item.result_amount | money }}</font>
                  </td>
                </tr>
              </template>
            </v-data-table>
            <v-divider></v-divider>
            <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
              <v-pagination v-model="paginationC.page" :length="paginationC.length" :total-visible="15" :disabled="loading"></v-pagination>
              <!-- <div class="diy-page">
              {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
            </div> -->
            </div>
          </v-card>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { money, formatDate, formatDay } from '@/filters/custom';

export default {
  name: 'Daily',
  data() {
    return {
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      searchShow: true,
      loading: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },
      desserts: [],
      order: {},
      searchOption: {
        status: 0,
        date: [],
      },
      searchCOption: {},
      summary: {},
      detail: false,
      detailDesserts: [],
      paginationC: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: ['deposit'],
        sortDesc: [],
      },
      summaryC: {},
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
          lang: 'affiliate_daily_header_name',
          text: '代理名字',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_header_date',
          text: '日期',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_header_newMembers',
          text: '当日新增用户',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_header_deposits',
          text: '总入金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_header_withdrawals',
          text: '总出金',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_header_rewards',
          text: '流水奖励',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        // {
        //   lang: 'affiliate_daily_header_sonRewards',
        //   text: '子代理流水奖励',
        //   value: '',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'center',
        // },
        {
          lang: 'affiliate_daily_header_rebate',
          text: '返水',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_header_summary',
          text: '结算金额',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_header_status',
          text: '状态',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_daily_header_affiliateStatus',
          text: '代理状态',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      detailHeaders: [
        {
          lang: 'affiliate_daily_result_header_sn',
          text: '序号',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_result_header_username',
          text: '用户帐号',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_result_header_affiliate',
          text: '代理',
          value: 'affs',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_result_header_deposits',
          text: '总存款',
          value: 'deposit',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_result_header_withdrawals',
          text: '总取款',
          value: 'withdrawal',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_result_header_bet',
          text: '总投注',
          value: 'bet_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_result_header_payout',
          text: '总派彩',
          value: 'payout_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'affiliate_daily_result_header_winloss',
          text: '总输赢(投-派)',
          value: 'result_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    // selectItem(newVal) {
    //   this.pagination.itemsPerPage = newVal;
    //   this.pagination.page = 1;
    //   this.loadDaily(this.pagination.page);
    // },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang) || item.text;
        return item;
      });
    },
    detailHeadersComputed() {
      return this.detailHeaders.map(item => {
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
      this.loadDaily(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadDaily(this.pagination.page);
    },
    'searchOption.status'(i) {
      this.loadDaily(1);
    },
    'paginationC.descending'(n, v) {
      if (n != null) {
        this.loadData(1);
      }
    },
    'paginationC.page'(n) {
      this.loadData(n);
    },
    'paginationC.sortDesc'(desc) {
      if (desc != null) {
        this.paginationC.page = 1;
        this.loadData(this.paginationC.page);
      }
    },
    'paginationC.sortBy'(by) {
      if (by != null) {
        this.paginationC.page = 1;
        this.loadData(this.paginationC.page);
      }
    },
  },
  beforeMount() {},
  created() {
    this.loadDaily(1);
  },
  methods: {
    showDetail(item) {
      const $this = this;
      $this.searchCOption.ds = `${formatDay(item.year_month_day)} 00:00:00`;
      $this.searchCOption.de = `${formatDay(item.year_month_day)} 23:59:59`;
      $this.searchCOption.aid = item.aid;
      $this.loadData(1);
      $this.detail = true;
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      const $this = this;
      $this.loading = true;
      $this.searchCOption.page = p;
      $this.searchCOption.num = $this.paginationC.itemsPerPage;
      $this.searchCOption.sort = $this.paginationC.sortBy;
      $this.searchCOption.asc = !$this.paginationC.descending;
      api
        .get('/report/player', this.searchCOption)
        .then(data => {
          $this.detailDesserts = data.players ? data.players : [];
          $this.paginationC.length = data.pageNums;
          $this.paginationC.totalItems = data.total;
          $this.summaryC = data.total_amount;
          $this.summaryC.users = data.total;
          $this.loading = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    showNote(item, e) {
      e.preventDefault();
      this.note.show = false;
      this.note.x = e.clientX;
      this.note.y = e.clientY;
      this.$nextTick(() => {
        this.order = item;
        this.note.show = true;
      });
    },
    saveNote() {
      const $this = this;
      api
        .post(`/affiliate/daily/note/${$this.order.id}`, {
          note: $this.order.note,
          result: parseFloat($this.order.result),
        })
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.note.show = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    loadDaily(p) {
      if (this.loading) {
        return;
      }
      const $this = this;
      $this.loading = true;
      let param = {
        page: p,
        num: $this.pagination.itemsPerPage,
      };
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0] ? this.searchOption.date[0] : '';
        this.searchOption.e = this.searchOption.date[1] ? this.searchOption.date[1] : '';
      }
      param = Object.assign(param, $this.searchOption);
      api
        .get('/affiliate/daily', param)
        .then(data => {
          $this.desserts = data.result.daily;
          $this.pagination.length = data.result.pageNums;
          $this.pagination.totalItems = data.result.total;
          $this.loading = false;
          $this.summary = data.result.summary;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    confirmDaily(item) {
      const $this = this;
      this.$store.commit('Confirm', {
        text: this.$t('g_msgAuditConfirm'),
        ok() {
          api
            .post(`/affiliate/daily/${item.id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgAudited'));
              item.paid_flag = 1;
              $this.loadDaily(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    _export(evt) {
      const $this = this;
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0] ? this.searchOption.date[0] : '';
        this.searchOption.e = this.searchOption.date[1] ? this.searchOption.date[1] : '';
      }
      api
        .get('/affiliate/daily/export', this.searchOption)
        .then(data => {
          if (data.result.daily == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.result.daily.forEach(v => {
              const tmp = [];
              tmp.push('');
              tmp.push(v.name);
              tmp.push(v.year_month_day);
              tmp.push(v.total_players);
              tmp.push(parseFloat(money(v.total_player_deposit, false)));
              tmp.push(parseFloat(money(v.total_player_withdrawal, false)));
              tmp.push(parseFloat(money(v.total_trading, false)));
              tmp.push(parseFloat(money(v.bonus, false)));
              tmp.push(parseFloat(money(v.result, false)));
              if (v.paid_flag == 0) {
                tmp.push(this.$t('g_status_unaudited'));
              } else {
                tmp.push(this.$t('g_status_audited'));
              }
              if (v.aff_status == 0) {
                tmp.push(this.$t('g_aff_status_disabled'));
              } else {
                tmp.push(this.$t('g_aff_status_normal'));
              }
              _export.push(tmp);
            });
            exportXLSX(_export, this.$t('affiliate_daily_export_filename'));
          }
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
