<template>
  <div class="Deposit">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> payment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 可視化欄位  -->
      <div class="d-flex align-center mr-4">
        <FieldFilter :storage-tag="storageTag" :header-map="headerMap" @updateInfo="items => (headerMap = items)" />
      </div>
      <!-- 搜尋 重置 下載 批量上分 入金音效提醒設置 展開按鈕 -->
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
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="showNote(null, $event, 'cdselected')">
            <v-icon>thumb_up</v-icon>
          </v-btn>
        </template>
        <span>批量上分</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            :color="soundSwitchOnOff ? 'green' : 'primary'"
            depressed
            fab
            dark
            small
            class="mx-2"
            v-on="on"
            @click.stop="soundSwitchOnOff = !soundSwitchOnOff"
          >
            <v-icon>campaign</v-icon>
          </v-btn>
        </template>
        <span v-if="soundSwitchOnOff">{{ $t('g_reminder_switch_open') }}</span>
        <span v-else>{{ $t('g_reminder_switch_close') }}</span>
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
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.name"
              :append-icon="searchOption.nameQueryMode == 1 ? 'gps_off' : 'location_searching'"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('g_text_field_username')"
              :placeholder="$t('g_text_field_placeholder_username')"
              @click:append="clickNameQueryMode"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <!-- <v-col cols="2">
            <v-radio-group v-model="searchOption.nameQueryMode" row>
              <v-radio :value="1" label="模糊查詢"></v-radio>
              <v-radio :value="2" label="精準查詢"></v-radio>
            </v-radio-group>
          </v-col> -->
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.id"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('g_text_field_userId')"
              :placeholder="$t('g_text_field_placeholder_userId')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.order"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('finance_deposit_orderNumber')"
              :placeholder="$t('finance_deposit_placeholder_orderNumber')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.aid"
              solo
              :items="accounts"
              :item-text="accounts.text"
              :item-value="accounts.value"
              :label="$t('finance_deposit_choosePayType')"
              persistent-hint
              single-line
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="4">
            <datetime-range v-model="searchOption.createdDate" range-separator="g_datePick_to2" start-placeholder="finance_deposit_applyTime" />
          </v-col>
          <v-col cols="4">
            <datetime-range v-model="searchOption.updatedDate" range-separator="g_datePick_to2" start-placeholder="finance_deposit_dealTime" />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.channel_name"
              hide-details
              solo
              persistent-hint
              :label="$t('finance_deposit_column_deposit_channel')"
              :placeholder="$t('finance_deposit_column_deposit_channel')"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense>
        <v-col
          v-for="(item, index) in depositTypes"
          :key="index"
          flex
          cols="12"
          xl="3"
          lg="6"
          @click="
            status = index;
            loadData(1);
          "
        >
          <v-alert dense dark class="my-0" border="left" :color="depositTypes[index].label" style="cursor: pointer">
            <div class="d-flex justify-space-between">
              <div class="d-flex">
                <v-icon class="ml-2">person</v-icon>
                <span class="align-self-start ml-2 mr-5">{{ $t(item.lang) }}</span>
                <span class="text-h5 font-weight-bold mr-5">{{ statistics.all[index] ? statistics.all[index] : 0 }}</span>
              </div>
              <div class="d-flex">
                <span class="align-self-start mr-5">{{ $t('finance_deposit_today') }}</span>
                <span class="text-h5 font-weight-bold mr-5">{{ statistics.today[index] ? statistics.today[index] : 0 }}</span>
              </div>
              <div class="mr-5">
                <v-btn dark small icon> <v-icon>loop</v-icon> </v-btn>
              </div>
            </div>
          </v-alert>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col v-for="(item, i) in depositTypes[status].summary" :key="i">
          <v-alert dense colored-border :color="depositTypes[status].label" border="left" class="pr-8">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center"> <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ item.text }}</span>
              <span v-if="item.value" class="text-h5 font-weight-bold"> {{ item.value | money }} </span>
              <span v-else class="text-h5 font-weight-bold">--</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-progress-linear
          v-if="bar.progressing"
          color="success"
          :value="selected.length ? (bar.gothrough / selected.length) * 100 : 100"
        ></v-progress-linear>
        <v-data-table
          v-model="selected"
          :headers="headerArr"
          :items="listData"
          :loading="loading"
          :disable-sort="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          class="elevation-0"
          show-all
          hide-default-footer
          :show-select="status == 0 && permissions.operation"
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item, isSelected, select }">
            <tr>
              <td v-if="status == 0 && permissions.operation"><v-checkbox :value="isSelected" @change="select"></v-checkbox></td>
              <template v-for="(col, i) in headerArr">
                <!-- 操作 -->
                <td v-if="/actions/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="permissions.operation">
                    <v-tooltip v-if="item.status == 0" bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="green lighten-1" v-bind="attrs" v-on="on" @click="showNote(item, $event, 'cd')">
                          <v-icon large>thumb_up</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('finance_deposit_list_upperPoints') }}</span>
                    </v-tooltip>

                    <v-tooltip v-if="item.status == 0" bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="primary lighten-1" v-bind="attrs" v-on="on" @click="showNote(item, $event, 'abnormal')">
                          <v-icon large>error</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('finance_deposit_list_abnormalOrder') }}</span>
                    </v-tooltip>

                    <v-tooltip v-if="item.status == 0" bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="primary lighten-1" v-bind="attrs" v-on="on" @click="showNote(item, $event, 'unpaid')">
                          <v-icon large>unpublished</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('finance_deposit_list_unpaid') }}</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="primary lighten-1" v-bind="attrs" v-on="on" @click="showNote(item, $event, 'note')">
                          <v-icon large>note_add</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('finance_deposit_list_remarks') }}</span>
                    </v-tooltip> </template
                  ><template v-else>-</template>
                </td>
                <td v-else-if="/uname/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
                </td>
                <td v-else-if="/payment/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip label outlined small color="primary"> {{ item.bank_name }} </v-chip>
                </td>
                <td v-else-if="/channel_name/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item.channel_name }} <br> <span v-if="item.third_type">({{item.third_type}}) </span>
                </td>
                <td v-else-if="/total_cost_time/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.total_cost_time | timediff }}</td>
                <td v-else-if="/deposit_name/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.deposit_name || '--' }}</td>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <td v-else-if="/sn/.test(col.value)" :key="i" class="text-left text-no-wrap" v-html="formatSn(item.sn)"></td>
                <td v-else-if="/aff_name/.test(col.value)" :key="i" class="text-left" style="min-width: 200px">{{ item.aff_name }}</td>
                <!--table list tags info-->
                <td v-else-if="col.value == 'tags'" :key="i" class="text-left" style="min-width: 300px">
                  <template v-if="item.tags != ''">
                    <v-chip
                      v-for="id in formatTag(item.tags)"
                      :key="id"
                      :color="tags[id] ? tags[id]['color'] : ''"
                      label
                      small
                      class="white--text mr-1"
                    >
                      {{ tags[id] ? tags[id]['name'] : '--' }}
                    </v-chip>
                  </template>
                  <template v-else>
                    <v-chip label outlined small color="primary">--</v-chip>
                  </template>
                </td>
                <td v-else-if="/status/.test(col.value)" :key="i" class="text-center text-no-wrap">
                  <v-chip label outlined small :color="depositTypes[item.status].label">
                    {{ $t(depositTypes[item.status].lang) }}
                    <template v-if="item.status == 1 && item.external_param == ''"> {{ $t('finance_deposit_hand') }} </template>
                  </v-chip>
                </td>
                <td v-else-if="/^(amount)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item[col.value] | money }}</td>
                <td v-else-if="/^(unit)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item.unit || item.usdt_amount">
                    {{ currencyCode(item.bank_name) }} {{ item.unit || item.usdt_amount | money }}
                  </template>
                  <template v-else>--</template>
                </td>
                <td v-else-if="/^(cny_exchange_rate)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item.unit || item.usdt_amount"> {{ item.cny_exchange_rate || item.exchan_gerate }} </template>
                  <template v-else>--</template>
                </td>
                <td v-else-if="/^(result_amount)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ config.unit }} {{ item.amount | money }}
                </td>
                <td v-else-if="/created|updated/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item[col.value] | formatDate }}
                </td>
                <!-- 交易結果 -->
                <td v-else-if="/result/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-menu v-if="item.pay_type == 5" top offset-y left :close-on-content-click="false">
                    <template #activator="{ on }">
                      <v-btn small depressed class="text-capitalize" :class="item.transaction_hash ? `success` : `default`" v-on="on">
                        {{ $t('finance_deposit_TransactionResult') }}
                      </v-btn>
                    </template>
                    <div class="white px-9 pt-8">
                      <h3>{{ $t('finance_deposit_tranDetails') }}</h3>
                      <span>{{ item.sn }}</span>
                    </div>
                    <v-list class="white pa-5" width="500">
                      <v-list-item v-for="(f, index) in detailFields" :key="index">
                        <v-list-item-icon>{{ $t(f.lang) }} :</v-list-item-icon>
                        <v-list-item-content v-if="f.ismoney" class="d-block text-right">{{ item[f.field] | money }}</v-list-item-content>
                        <v-list-item-content
                          v-else-if="item[f.field] && /^(from|transaction_hash)$/.test(f.field)"
                          class="d-block text-left"
                          style="word-break: break-all"
                        >
                          {{ item[f.field] || '--' }}

                          <div><vue-qr v-if="f.field === 'from'" :text="item[f.field]" :size="100" :margin="10"></vue-qr></div>
                        </v-list-item-content>
                        <v-list-item-content v-else class="d-block text-right">{{ item[f.field] || '--' }}</v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <p v-else class="text-center">--</p>
                </td>
                <td v-else-if="/withdrawalCode/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ config.withdrawalCode }}
                </td>
                <td v-else :key="i" class="text-left text-no-wrap">{{ item[col.value] || '--' }}</td>
              </template>
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

      <!-- 備註彈窗 -->
      <v-menu
        v-model="note.show"
        :close-on-content-click="false"
        :nudge-width="500"
        right
        :nudge-bottom="35"
        :nudge-left="50"
        :position-x="note.x"
        :position-y="note.y"
        absolute
        offset-y
        persistent
      >
        <v-card elevation="2" class="pa-3 px-5 rounded-lg">
          <v-card-text>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <h4>{{ $t('finance_deposit_list_remarks') }} <span v-html="order.sn"></span></h4>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <v-checkbox v-model="order.view" :label="$t('finance_deposit_playerVisible')" value="1"></v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="order.note" value="" outlined hide-details :placeholder="$t('finance_deposit_enterRemarks')"></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-2 mt-2">
            <v-spacer></v-spacer>
            <v-btn small outlined color="primary" @click="note.show = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn small color="primary" @click="saveNote()">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { money, formatDate, timediff } from '@/filters/custom';
import { dateRange, deepClone, shortcuts, exportXLSX } from '@/utils';
import FieldFilter from '@/components/FieldFilter';
import { mapGetters, mapMutations } from 'vuex';
import VueQr from 'vue-qr';
import _ from 'lodash'

export default {
  name: 'Deposit',
  components: { FieldFilter, VueQr },
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      searchOption: {
        createdDate: [],
        updatedDate: [],
        nameQueryMode: 1,
        channel_name: ''
      },
      datePickerOptions: {
        shortcuts,
      },
      order: {},
      types: {},
      shortcuts,
      searchShow: true,
      daterange: dateRange,
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      today: {},
      all: {},
      selected: [],
      summary: 0.0,
      tags: {},
      SelectedTags: [],
      status: 0,
      confirm: '',
      accounts: [],
      bar: {
        progressing: false,
        gothrough: 0,
        failed: 0,
        success: 0,
      },
      // 統計
      statistics: {
        today: {},
        all: {},
      },
      detailFields: [
        {
          lang: 'finance_deposit_transactionNumber',
          label: '交易单号',
          field: 'transaction_hash',
          ismoney: false,
        },
        // {
        //   lang: 'finance_deposit_blockNum',
        //   label: 'Block 编号',
        //   field: 'block_number',
        //   ismoney: false,
        // },
        {
          lang: 'finance_deposit_withdrawUSDT',
          label: '入金 USDT',
          field: 'unit',
          ismoney: true,
        },
        {
          lang: 'finance_deposit_exchangeRate',
          label: '汇率',
          field: 'cny_exchange_rate',
          ismoney: false,
        },
        // {
        //   lang: 'finance_deposit_withdrawalWalletAddress',
        //   label: '玩家 USDT 钱包地址',
        //   field: 'from',
        //   ismoney: false,
        // },
      ],
      // 全部欄位
      headers: [
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'actions',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_usernameId',
          text: '用户名(ID)',
          value: 'uname',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_list_column_playerTag',
          text: '标签',
          value: 'tags',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_agentAttributes',
          text: '代理属性',
          value: 'aff_name',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_deposit_name',
          text: '付款人',
          value: 'deposit_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_order_number',
          text: '订单号',
          value: 'sn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_paymentType',
          text: '支付类型',
          value: 'payment',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_deposit_channel',
          text: '入金渠道',
          value: 'channel_name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_collectionInformation',
          text: '收款信息',
          value: 'card',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_amount',
          text: '实际金额',
          value: 'amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_resultAmount',
          text: '实际金额',
          value: 'amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_currency',
          text: '申请金额',
          value: 'unit',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_exchangeRate',
          text: '汇率',
          value: 'cny_exchange_rate',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_resultExchangeRate',
          text: '汇率',
          value: 'cny_exchange_rate',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_withdrawalCode',
          text: '平台编码',
          value: 'withdrawalCode',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'finance_deposit_column_applyTime',
          text: '申请时间',
          value: 'created',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_column_tradingResults',
          text: '交易結果',
          value: 'result',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'status',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'finance_deposit_processTime',
          text: '处理时间',
          value: 'updated',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'note',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_deposit_operator',
          text: '操作者',
          value: 'update_by',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      depositTypes: [
        {
          api: '/finance/deposit',
          apiExport: '/finance/deposit/export',
          lang: 'finance_deposit_waitPoint',
          name: '待上分',
          label: 'orange',
          tlabel: 'orange lighten-3',
          summary: '-',
          loading: false,
          storageTag: 'deposit_pending_list',
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['created'],
            sortDesc: [true],
          },
          listData: [],
          headerMap: [
            { lang: 'g_table_column_action', show: true, canHide: false },
            { lang: 'g_table_column_usernameId', show: true, canHide: true },
            { lang: 'g_table_column_remarks', show: true, canHide: true },
            { lang: 'finance_deposit_column_paymentType', show: true, canHide: true },
            { lang: 'finance_deposit_column_deposit_channel', show: true, canHide: true },
            { lang: 'finance_deposit_agentAttributes', show: true, canHide: true },
            { lang: 'finance_deposit_column_deposit_name', show: true, canHide: true },
            { lang: 'finance_deposit_column_order_number', show: true, canHide: true },
            { lang: 'finance_deposit_column_collectionInformation', show: true, canHide: true },
            { lang: 'finance_deposit_column_applyTime', show: true, canHide: true },
            { lang: 'finance_deposit_column_tradingResults', show: true, canHide: true },
            { lang: 'g_table_column_status', show: true, canHide: true },
            { lang: 'player_list_column_playerTag', canHide: true, show: true },
            { lang: 'finance_deposit_column_currency', show: true, canHide: true },
            { lang: 'finance_deposit_column_exchangeRate', show: true, canHide: true },
            { lang: 'finance_deposit_column_amount', show: true, canHide: true },
            { lang: 'finance_deposit_operator', show: true, canHide: true },
          ],
        },
        {
          api: '/finance/deposit',
          apiExport: '/finance/deposit/export',
          lang: 'finance_deposit_completed',
          name: '已完成',
          label: 'green',
          tlabel: 'green lighten-3',
          summary: '-',
          loading: false,
          storageTag: 'deposit_completed_list',
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['updated'],
            sortDesc: [true],
          },
          headerHide: [],
          listData: [],
          headerMap: [
            { lang: 'g_table_column_action', show: true, canHide: false },
            { lang: 'g_table_column_usernameId', show: true, canHide: true },
            { lang: 'g_table_column_remarks', show: true, canHide: true },
            { lang: 'finance_deposit_column_paymentType', show: true, canHide: true },
            { lang: 'finance_deposit_column_deposit_channel', show: true, canHide: true },
            { lang: 'finance_deposit_agentAttributes', show: true, canHide: true },
            { lang: 'finance_deposit_column_order_number', show: true, canHide: true },
            { lang: 'finance_deposit_column_collectionInformation', show: true, canHide: true },
            { lang: 'finance_deposit_column_applyTime', show: true, canHide: true },
            { lang: 'finance_deposit_processTime', show: true, canHide: true },
            { lang: 'finance_deposit_column_tradingResults', show: true, canHide: true },
            { lang: 'g_table_column_status', show: true, canHide: true },
            { lang: 'player_list_column_playerTag', canHide: true, show: true },
            { lang: 'finance_deposit_column_currency', show: true, canHide: true },
            { lang: 'finance_deposit_column_exchangeRate', show: true, canHide: true },
            { lang: 'finance_deposit_column_resultAmount', show: true, canHide: true },
            { lang: 'finance_deposit_operator', show: true, canHide: true },
          ],
        },
        {
          api: '/finance/deposit',
          apiExport: '/finance/deposit/export',
          lang: 'finance_deposit_unpaid',
          name: '未支付',
          label: 'grey',
          tlabel: 'grey lighten-3',
          summary: '-',
          loading: false,
          storageTag: 'deposit_unpaid_list',
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['updated'],
            sortDesc: [true],
          },
          headerHide: [],
          listData: [],
          headerMap: [
            { lang: 'g_table_column_action', show: true, canHide: false },
            { lang: 'g_table_column_usernameId', show: true, canHide: true },
            { lang: 'g_table_column_remarks', show: true, canHide: true },
            { lang: 'finance_deposit_column_paymentType', show: true, canHide: true },
            { lang: 'finance_deposit_column_deposit_channel', show: true, canHide: true },
            { lang: 'finance_deposit_agentAttributes', show: true, canHide: true },
            { lang: 'finance_deposit_column_order_number', show: true, canHide: true },
            { lang: 'finance_deposit_column_resultAmount', show: true, canHide: true },
            { lang: 'finance_deposit_column_collectionInformation', show: true, canHide: true },
            { lang: 'finance_deposit_column_applyTime', show: true, canHide: true },
            { lang: 'finance_deposit_processTime', show: true, canHide: true },
            { lang: 'finance_deposit_column_tradingResults', show: true, canHide: true },
            { lang: 'g_table_column_status', show: true, canHide: true },
            { lang: 'player_list_column_playerTag', canHide: true, show: true },
            { lang: 'finance_deposit_operator', show: true, canHide: true },
          ],
        },
        {
          api: '/finance/deposit',
          apiExport: '/finance/deposit/export',
          lang: 'finance_deposit_abnormalOrder',
          name: '异常订单',
          label: 'red',
          tlabel: 'red lighten-3',
          summary: '-',
          loading: false,
          storageTag: 'deposit_abnormal_list',
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['updated'],
            sortDesc: [true],
          },
          headerHide: [],
          listData: [],
          headerMap: [
            { lang: 'g_table_column_action', show: true, canHide: false },
            { lang: 'g_table_column_usernameId', show: true, canHide: true },
            { lang: 'g_table_column_remarks', show: true, canHide: true },
            { lang: 'finance_deposit_column_paymentType', show: true, canHide: true },
            { lang: 'finance_deposit_column_deposit_channel', show: true, canHide: true },
            { lang: 'finance_deposit_agentAttributes', show: true, canHide: true },
            { lang: 'finance_deposit_column_order_number', show: true, canHide: true },
            { lang: 'finance_deposit_column_resultAmount', show: true, canHide: true },
            { lang: 'finance_deposit_column_collectionInformation', show: true, canHide: true },
            { lang: 'finance_deposit_column_applyTime', show: true, canHide: true },
            { lang: 'finance_deposit_processTime', show: true, canHide: true },
            { lang: 'finance_deposit_column_tradingResults', show: true, canHide: true },
            { lang: 'g_table_column_status', show: true, canHide: true },
            { lang: 'player_list_column_playerTag', canHide: true, show: true },
            { lang: 'finance_deposit_operator', show: true, canHide: true },
          ],
        },
      ],
      permissions: {
        operation: true,
      },
    };
  },
  computed: {
    ...mapGetters(['soundSwitch']),
    config() {
      return this.$store.getters.config;
    },
    headerMap: {
      get() {
        const field = { lang: 'finance_withdrawal_withdrawalCode', canHide: false, show: true };

        //  config 載入成功後(型別為object 載入前為native function) 判斷是否依設定 新增或刪除平台編碼欄位
        const isShow = Boolean(typeof this.config === 'object' ? this.config.withdrawalCode : true);

        const map = this.depositTypes[this.status].headerMap;
        const existIndex = map.findIndex(item => item.lang == 'finance_withdrawal_withdrawalCode');

        if (existIndex > 0 && !isShow) {
          const d = map.splice(existIndex, 1);
        }
        return map.concat(isShow && !(existIndex > 0) ? field : []);
        // return this.depositTypes[this.status].headerMap;
      },
      set(val) {
        this.depositTypes[this.status].headerMap = val;
      },
    },
    headerArr() {
      return this.headerMap
        .map(item => {
          const show = item.show;
          const findItem = this.headers.find(header => item.lang == header.lang)
          item = findItem;
          item.show = show;
          item.text = item.lang ? this.$t(item.lang) : item.text;
          return item;
        })
        .filter(item => item.show);
    },
    pagination() {
      return this.depositTypes[this.status].pagination;
    },
    loading: {
      get() {
        return this.depositTypes[this.status].loading;
      },
      set(val) {
        this.depositTypes[this.status].loading = val;
      },
    },
    listData: {
      get() {
        return this.depositTypes[this.status].listData;
      },
      set(val) {
        this.depositTypes[this.status].listData = val;
      },
    },
    apiUrl() {
      return this.depositTypes[this.status].api;
    },
    apiExportUrl() {
      return this.depositTypes[this.status].apiExport;
    },
    storageTag() {
      return this.depositTypes[this.status].storageTag;
    },
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage < this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
    soundSwitchOnOff: {
      get() {
        return this.soundSwitch.deposit.value;
      },
      set(val) {
        this.setSoundSwitch({ sound: 'deposit', val });
      },
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
    'pagination.itemsPerPage'(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
    status() {
      // this.loadData(1)
    },
  },
  beforeMount() {
    this.loadPayments();
    this.loadPaymentAccount();
  },
  created() {
    this.loadData(1);
    this.getTags();
    this.checkPermissions();
  },
  methods: {
    ...mapMutations(['setSoundSwitch']),
    // 模糊(1)精準(2)查詢
    clickNameQueryMode() {
      if (this.searchOption.nameQueryMode == 1) {
        return (this.searchOption.nameQueryMode = 2);
      } else if (this.searchOption.nameQueryMode == 2) {
        return (this.searchOption.nameQueryMode = 1);
      }
    },
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    isCheck(item) {
      return !item.canHide || this.headerHide.includes(item);
    },
    moveToUnpaid(id) {
      const selected = [id];
      if (selected.length === 0) {
        return;
      }
      this.$store.commit('Confirm', {
        text: '是否确认移动到未支付订单？',
        ok: () => {
          api
            .post('/finance/unpaid', { Data: selected })
            .then(data => {
              this.selected = [];
              this.$store.commit('MsgOk', '移动成功');
              this.loadData(this.pagination.page);
              this.loadStatistics();
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    moveToAbnormal(id) {
      const selected = [id];
      if (selected.length === 0) {
        return;
      }
      this.$store.commit('Confirm', {
        text: '是否确认移动到异常订单？',
        ok: () => {
          api
            .post('/finance/abnormal', { Data: selected })
            .then(data => {
              this.selected = [];
              this.$store.commit('MsgOk', '移动成功');
              this.loadData(this.pagination.page);
              this.loadStatistics();
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    showNote(item, e, cfm) {
      e.preventDefault();
      this.note.show = false;
      this.note.x = e.clientX;
      this.note.y = e.clientY;
      this.$nextTick(() => {
        if (item != null) {
          this.order = deepClone(item);
        } else {
          this.order = {
            sn: this.selected.map(item => item.sn).join(',<br>'),
          };
        }
        this.note.show = true;
      });
      this.confirm = cfm;
    },
    async saveNote() {
      let text = '';
      if (this.confirm == 'cd' || this.confirm == 'cdselected') {
        text = '是否确认上分？';
      } else if (this.confirm == 'abnormal') {
        this.moveToAbnormal(this.order.id);
      } else if (this.confirm == 'unpaid') {
        this.moveToUnpaid(this.order.id);
      }
      const ok = () => {
        if (this.confirm !== 'cdselected') {
          this.selected = [this.order];
        }
        this.selected.forEach(item => {
          this.bar.progressing = true;
          api
            .post(`/finance/note/${item.id}`, {
              note: this.order.note,
              view: this.order.view,
              confirm: this.confirm == 'cdselected' ? 'cd' : this.confirm,
              ...(this.confirm == 'cdselected' && { batch: 1 }),
            })
            .then(data => {
              this.bar.success++;
            })
            .catch(error => {
              this.bar.failed++;
              this.$store.commit('MsgError', error.error);
            })
            .finally(() => {
              this.bar.gothrough++;
              if (this.bar.gothrough == this.selected.length) {
                this.bar = {
                  progressing: false,
                  gothrough: 0,
                  failed: 0,
                  success: 0,
                };
                this.note.show = false;
                this.confirm = '';
                this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
                this.note.show = false;
                this.confirm = '';
                this.selected = [];
                this.loadData(this.pagination.page);
                this.loadStatistics();
              }
            });
        });
      };
      if (text == '') {
        ok();
      } else if (this.confirm == 'cd' || this.confirm == 'cdselected') {
        this.$store.commit('Confirm', {
          text,
          ok,
        });
      }
    },
    formatSn(sn) {
      return `${sn.substring(0, sn.length - 4)}<code>${sn.slice(-4)}</code>`;
    },
    loadPaymentTypes() {
      const $this = this;
      api
        .get('/system/payment/types')
        .then(data => {
          $this.types = data;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    loadPayments() {
      const params = {
        page: 1,
        num: 9999,
      };
      api
        .get('/system/payments', params)
        .then(data => {
          if (data.result) {
            this.payments = data.result.payments;
          }
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    loadPaymentAccount() {
      const $this = this;
      api
        .get('/system/payment/account')
        .then(data => {
          $this.accounts = data.result.map(({ accountId, accountName }) => ({ text: accountName, value: accountId }));
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loadStatistics();
      this.loading = true;
      this.pagination.page = p;
      const params = {
        ...this.searchOption,
        page: p,
        num: this.pagination.itemsPerPage,
        status: this.status,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
      };
      const { createdDate, updatedDate } = params;
      if (createdDate && createdDate.length > 0) {
        params.s = createdDate[0] || '';
        params.e = createdDate[1] || '';
      }
      if (updatedDate && updatedDate.length > 0) {
        params.us = updatedDate[0] || '';
        params.ue = updatedDate[1] || '';
      }
      api
        .get(this.apiUrl, params)
        .then(data => {
          this.listData = data.result.deposits ?? [];
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.depositTypes[this.status].summary = this.summaryMap(data.result.summaryMap, data.result.summary);
          // this.depositTypes[this.status].usdtSummary = data.result.usdtSummary;
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error || error);
        });
    },
    summaryMap(map, total) {
      const result = [];
      const lang = this.depositTypes[this.status].lang;
      result.push();
      _.forEach(map, (summary, currency) => {
        switch (currency) {
          case 'CNY':
            result.push({
              text: this.$t(`${lang}Total`),
              value: total,
            });
            break;
          default:
            result.push({
              text: this.$t(`${lang}USDTTotal`).replace(/usdt/gi, currency),
              value: summary,
            });
            break;
        }
      });
      return result;
    },
    loadStatistics() {
      api
        .get('/finance/deposit/statistics')
        .then(data => {
          this.statistics = data.result;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      const $this = this;
      const params = {
        ...$this.searchOption,
        status: $this.status,
        sort: $this.pagination.sortBy[0],
        asc: !$this.pagination.sortDesc[0],
        num: this.pagination.totalItems,
        page: 1
      };
      const { createdDate, updatedDate } = params;
      if (createdDate && createdDate.length > 0) {
        params.s = createdDate[0] || '';
        params.e = createdDate[1] || '';
      }
      if (updatedDate && updatedDate.length > 0) {
        params.us = updatedDate[0] || '';
        params.ue = updatedDate[1] || '';
      }
      api
        .get(this.apiUrl, params)
        .then(data => {
          if (data.result.deposits == null) {
            $this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headerArr.forEach(col => {
              if (col.value !== 'actions') {
                cols.push(`${this.$t(col.lang)}`);
              }
            });
            _export.push(cols);
            data.result.deposits.forEach(row => {
              const tmp = [];
              this.headerArr.forEach(col => {
                if (col.value == 'actions') {
                  return true;
                } else if (/uname/.test(col.value)) {
                  tmp.push(row.name);
                } else if (/payment/.test(col.value)) {
                  tmp.push(row.bank_name);
                } else if (/channel_name/.test(col.value)) {
                  tmp.push(`${row.channel_name}${row.third_type?`(${row.third_type})`:''}`);
                } else if (/status/.test(col.value)) {
                  tmp.push(this.depositTypes[row.status].name + (row.status == 1 && row.external_param == '' ? this.$t('finance_deposit_hand') : ''));
                } else if (/updated|created/.test(col.value)) {
                  tmp.push(formatDate(row[col.value]));
                } else if (/total_cost_time/.test(col.value)) {
                  tmp.push(timediff(row.total_cost_time));
                } else if (/tags/.test(col.value)) {
                  if (row.tags) {
                    tmp.push(
                      row.tags
                        .split(',')
                        // .map(tag => $this.tags[tag].name)
                        .map(tag => (this.tags[tag] ? this.tags[tag].name : ''))
                        .join(','),
                    );
                  } else {
                    tmp.push('-');
                  }
                } else if (/result_.*/.test(col.value)) {
                  tmp.push(row[col.value.replace(/result_/, '')]);
                } else if (/^\d+\.\d+$/.test(row[col.value])) {
                  tmp.push(parseFloat(row[col.value]));
                } else {
                  tmp.push(row[col.value] || '-');
                }
              });
              _export.push(tmp);
            });
            exportXLSX(_export, '玩家入金列表');
          }
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    getTags() {
      api
        .get('/player/tagkv')
        .then(data => {
          this.tags = data;
          const SelectedTags = [];
          for (const i in data) {
            SelectedTags.push({
              value: i,
              name: data[i].name,
            });
          }
          this.SelectedTags = SelectedTags;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    formatTag(tags) {
      return tags.split(',');
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
    checkDateRange(date) {
      if (date && date.length == 2 && date[0] > date[1]) {
        const tmp = date[0];
        date[0] = date[1];
        date[1] = tmp;
      }
    },
    currencyCode(bank) {
      const payment = this.payments?.find(item => item.bank == bank);
      return payment?.sysParams.currencyCode || '';
    },
    checkPermissions() {
      this.permissions.operation = true;
      api
        .post('/finance/note/0', {
          note: 'test',
          view: '0',
          confirm: 'cd',
          usdt_amount: 0,
          cny_amount: null,
          exchange_rate: null,
        })
        .then(() => {
          this.permissions.operation = true;
        })
        .catch(error => {
          this.permissions.operation = error.status != 403;
        });
    },
  },
};
</script>
