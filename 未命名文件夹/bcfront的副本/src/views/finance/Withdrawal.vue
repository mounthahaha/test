<template>
  <div class="Withdrawal">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> payment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 可視化欄位  -->
      <div class="d-flex align-center mr-4">
        <FieldFilter :storage-tag="storageTag" :header-map.sync="headerMap" @updateInfo="items => (headerMap = items)" />
      </div>
      <!--  搜尋 重置 下載 提款日設置 出金音效提示開關  展開按鈕 -->
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
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="showWeekdayDrawer">
            <v-icon>build</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('finance_withdrawal_withdrawalDaySetting') }}</span>
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
              :placeholder="$t('finance_withdrawal_placeholder_enterName')"
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
              placeholder="订单号或后四位"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <datetime-range v-model="searchOption.createdDate" range-separator="g_datePick_to2" start-placeholder="finance_withdrawal_applyTime" />
          </v-col>
          <v-col cols="4">
            <datetime-range v-model="searchOption.updatedDate" range-separator="g_datePick_to2" start-placeholder="finance_withdrawal_dealTime" />
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.pay_type"
              solo
              :items="payTypes"
              :item-text="payTypes.text"
              :item-value="payTypes.value"
              label="申请出款渠道"
              persistent-hint
              single-line
              clearable
              hide-details
            ></v-select>
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense>
        <v-col
          v-for="(item, index) in withdrawalTypes"
          :key="index"
          flex
          cols="12"
          xl="4"
          lg="4"
          @click="
            selectStatus(index);
            loadData(1);
          "
        >
          <v-alert dense dark class="my-0" border="left" :color="withdrawalTypes[index].label" style="cursor: pointer">
            <div class="d-flex justify-space-between">
              <div class="d-flex">
                <v-icon class="ml-2">person</v-icon>
                <span class="align-self-start ml-2 mr-5">{{ $t(item.lang) }}</span>
                <span class="text-h5 font-weight-bold mr-5">{{ statistics.all[index] ? statistics.all[index] : 0 }}</span>
              </div>
              <div class="d-flex">
                <span class="align-self-start ml-2 mr-5">{{ $t('finance_deposit_today') }}</span>
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
        <v-col v-for="(sum, currency) in withdrawalTypes[status].summaryMap" :key="currency">
          <v-alert dense colored-border :color="withdrawalTypes[status].label" border="left" class="pr-8">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t(withdrawalTypes[status].lang) }}{{ currency }}</span
              >
              <span v-if="sum" class="text-h5 font-weight-bold"> {{ sum | money }} </span>
              <span v-else class="text-h5 font-weight-bold">--</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
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
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <template v-for="(col, i) in headerArr">
                <td v-if="/actions/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="permissions.operation">
                    <v-tooltip v-if="item.status == 0" bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="green lighten-1" v-bind="attrs" v-on="on" @click="showNote(item, $event, 'cw')">
                          <v-icon large>check_circle</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('g_btn_confirm') }}</span>
                    </v-tooltip>

                    <v-tooltip v-if="item.status == 0" bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="red lighten-1" v-bind="attrs" v-on="on" @click="showNote(item, $event, 'rw')">
                          <v-icon large>remove_circle</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('finance_withdrawal_refuse') }}</span>
                    </v-tooltip>

                    <v-tooltip v-if="item.status == 0 && WithdrawalApi.length > 0 && parseInt(item.api) == 0" bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="primary lighten-1" v-bind="attrs" v-on="on" @click="showThird(item)">
                          <v-icon large>account_balance_wallet</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('finance_withdrawal_3thWithdrawal') }}</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn class="mr-2" icon color="primary lighten-1" v-bind="attrs" v-on="on" @click="showNote(item, $event, 'note')">
                          <v-icon large>note_add</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('finance_withdrawal_remarks') }}</span>
                    </v-tooltip>
                  </template>
                  <template v-else>-</template>
                </td>
                <td v-else-if="col.value == 'uname'" :key="i" class="text-left text-no-wrap">
                  {{ item.uname }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
                </td>
                <td v-else-if="col.value == 'infoChange'" :key="i" class="text-left text-no-wrap">
                  <v-chip label small outlined color="blue" class="white--text mr-1" @click="showPlayerDetailInforChange(item.user_id)">
                    查看
                  </v-chip>
                </td>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <td v-else-if="col.value == 'accountInfo'" :key="i" class="text-left" style="min-width: 200px" v-html="formatAccount(item)"></td>
                <td v-else-if="/created|updated/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item[col.value] | formatDate }}
                </td>
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
                <td v-else-if="/^status$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip label outlined small :color="withdrawalTypes[item.status]['label']">
                    <template v-if="item.status == 0 && parseInt(item.api) > 0"> 三方处理中... </template>
                    <template v-else> {{ $t(withdrawalTypes[item.status].lang) }} </template>
                  </v-chip>
                </td>                
                <td v-else-if="/affs/.test(col.value)" :key="i" class="text-left" style="min-width: 200px">{{ item.affs }}</td>
                <td v-else-if="/total_cost_time/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item.total_cost_time | timediff }}</td>
                <!--申请金额、出款usdt、出款法币金额、CNY余数、 实际总额-->
                <td v-else-if="/^(amount|cny|credit_note|paidtotal)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item.amount > 0 || status == 0"> {{ item[col.value] | money }} </template>
                  <template v-else>--</template>
                </td>
                <!--申请U金额-->
                <td v-else-if="/^(usdt_amount)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <!-- <template v-if="item.pay_type==7"> {{ item.unit }} </template>
                  <template v-else>/</template> -->
                  <span v-if="item.pay_type==7">{{item.usdt_amount}}</span>
                  <span v-else>/</span>
                </td>
                <!--申请人民币金额-->
                <td v-else-if="/^(amount)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <!-- <template v-if="item.pay_type==7"> {{ item.usdt_amount1 | money }} </template>
                  <template v-else> {{ item.amount | money }}</template> -->
                  {{item.amount}}
                </td>
                <!--申请出款渠道-->
                <td v-else-if="/^pay_type$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <v-chip label outlined small :color="item.pay_type==7?'red':'orange'">
                    {{payTypesText(item.pay_type)}}
                  </v-chip>
                </td>

                <!--USDT汇率-->
                <td v-else-if="/^cny_exchange_rate$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item.pay_type==7">{{item.cny_exchange_rate || '0.00'}}</template>
                  <template v-else>/</template>
                </td>

                
                <!--盈虧比例-->
                <td
                  v-else-if="/^(profitLossRatio)$/.test(col.value)"
                  :key="i"
                  class="text-center text-no-wrap"
                  :inner-html.prop="item[col.value] | ratioColor"
                ></td>
                <!--未核销usdt (待出金)-->
                <td v-else-if="/^usdt_amount$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item.usdt_amount > 0"> {{ item[col.value] | money }} </template>
                  <template v-else>--</template>
                </td>
                <!--汇率-->
                <td v-else-if="/^(exchan_gerate)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item.usdt_amount > 0"> {{ item[col.value] }} </template>
                  <template v-else>--</template>
                </td>
                <td v-else-if="/note/.test(col.value)" :key="i" class="text-left" style="min-width: 200px">{{ item.note }}</td>
                <td v-else-if="/withdrawalCode/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ config.withdrawalCode }}
                </td>
                <td v-else :key="i" class="text-left text-no-wrap">{{ item[col.value] || '--' }}</td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <div class="text-center py-2 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 玩家提款日設置 -->
    <Weekday
      :title="$t('finance_withdrawal_placeholder_playerWithdrawalDaySetting')"
      :show.sync="showWeekday"
      @cancel="showWeekday = false"
      @ok="saveWeekday(1)"
    >
      <v-container grid-list-md class="py-5 px-10">
        <v-row dense class="d-flex align-center justify-center">
          <v-col cols="12">
            <v-btn @click="withdrawSetAll">{{ $t('finance_withdrawal_all') }}</v-btn>
            <v-btn class="mx-2" @click="withdrawSetWeekday">{{ $t('finance_withdrawal_weekdays') }}</v-btn>
            <v-btn @click="withdrawSetHoliday">{{ $t('finance_withdrawal_holiday') }}</v-btn>
          </v-col>
        </v-row>
        <v-row v-for="(item, i) in weekDaySettings" :key="item.weekDay" dense class="align-center">
          <v-col cols="3"> <v-checkbox v-model="weekDaySettings[i].checked"></v-checkbox> </v-col>
          <v-col cols="3"> {{ $t(weekdayCh[weekDaySettings[i].weekDay]) }} </v-col>
          <v-col cols="6">
            <el-time-picker
              v-model.lazy="weekDaySettings[i].range"
              class="max100"
              format="HH:mm"
              :picker-options="{
                start: '00:00',
                end: '23:59',
              }"
              :is-range="true"
            ></el-time-picker>
          </v-col>
        </v-row>
      </v-container>
    </Weekday>

    <!-- 新增備註彈窗-->
    <v-dialog v-model="note.show" persistent width="800px" class="rounded-lg">
      <v-toolbar dark elevation="0" color="primary">
        <v-toolbar-title class="headline ml-2"> {{ order.sn }} </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click.native="note.show = false"> <v-icon>close</v-icon> </v-btn>
          </template>
        </v-menu>
      </v-toolbar>

      <v-card elevation="0" class="pa-3">
        <v-form v-model="usdtValid">
          <template v-if="confirm == 'cw' && Number(config.USDT_withdrawal_rule)">
            <v-card-text>
              <v-layout ma-0 wrap row align="center">
                <v-flex pa-2 xs6>{{ $t('finance_withdrawal_applyForWithdrawalAmount') }}</v-flex>
                <v-flex pa-2 xs6>{{ order.amount | money }}</v-flex>
                <v-flex pa-2 xs6>{{ $t('finance_withdrawal_walletAddress') }}</v-flex>
                <v-flex pa-2 xs6>{{ order.usdtwali }}</v-flex>
              </v-layout>
            </v-card-text>
          </template>
          <template v-else-if="confirm == 'cw' && order.has_usdt_account == 1 && order.detail">
            <v-card-title>{{ $t('finance_withdrawal_notYetWrittenOff') }} USDT: {{ order.detail.remaining_usdt_amount | money }}</v-card-title>
            <v-card-text>
              <v-layout ma-0 wrap row align="center">
                <v-flex pa-2 xs6>{{ $t('finance_withdrawal_applyForWithdrawalAmount') }}</v-flex>
                <v-flex pa-2 xs6>{{ order.amount | money }}</v-flex>
                <v-flex pa-2 xs6>{{ $t('finance_withdrawal_walletAddress') }}</v-flex>
                <v-flex pa-2 xs6>{{ order.detail.usdt_account }}</v-flex>
                <v-flex pa-2 xs6>{{ $t('finance_withdrawal_exchangeRate') }}</v-flex>
                <v-flex pa-2 xs6>{{ config.usdt_selling_rate }}</v-flex>
                <v-flex pa-2 xs6>{{ $t('finance_withdrawal_recommendedPayment') }}</v-flex>
                <v-flex pa-2 xs6>
                  USDT: {{ order.detail.recommended.usdt | money }}<br />
                  CNY:{{ order.detail.recommended.cny | money }}
                </v-flex>
              </v-layout>
            </v-card-text>
          </template>
          <template v-if="(confirm == 'cw' && Number(config.USDT_withdrawal_rule)) || (order.has_usdt_account == 1 && order.detail)">
            <v-divider></v-divider>
            <v-card-title>{{ $t('finance_withdrawal_actualWithdrawalDistribution') }}</v-card-title>
            <v-card-text>
              <v-layout row wrap>
                <v-flex pa-2 xs12
                  ><v-text-field
                    ref="usdt"
                    v-model="order.usdt_amount"
                    :rules="[rules.required, rules.maximum, rules.minimum, rules.nan, rules.nofloat]"
                    dense
                    label="USDT"
                    type="number"
                    min="0"
                    :hint="$t('finance_withdrawal_pleaseActualPayment')"
                  ></v-text-field
                ></v-flex>
                <v-flex pa-2 xs12
                  ><v-text-field
                    ref="cny"
                    v-model="order.cny_amount"
                    :rules="[rules.required, rules.maximum, rules.minimum, rules.nan]"
                    dense
                    label="CNY"
                    type="number"
                    min="0"
                    :hint="$t('finance_withdrawal_pleaseActualPayment')"
                  ></v-text-field
                ></v-flex>
                <v-flex pa-2 xs12
                  ><v-text-field
                    :value="config.usdt_selling_rate"
                    dense
                    :label="$t('finance_withdrawal_exchangeRate')"
                    type="number"
                    readonly
                  ></v-text-field
                ></v-flex>
              </v-layout>
            </v-card-text>
          </template>
          <div class="pa-5 pb-0">
            <h2>{{ $t('finance_withdrawal_remarks') }}</h2>
            <v-row dense wrap>
              <v-col cols="12">
                <v-checkbox v-model="order.view" :label="$t('finance_withdrawal_whetherPlayerisVisible')" value="1"></v-checkbox>
              </v-col>
              <v-col v-if="status == 0" cols="12">
                <v-text-field v-model="order.add_time" type="number" :label="$t('finance_withdrawal_adjustOrder')" value="0"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="order.note"
                  value=""
                  outlined
                  hide-details
                  :placeholder="$t('finance_withdrawal_placeholderRejectionReason')"
                ></v-textarea>
              </v-col>
            </v-row>
          </div>
          <v-card-actions class="pa-5 mt-5">
            <v-spacer></v-spacer>
            <v-btn outlined color="primary" @click="note.show = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn color="primary" :disabled="!usdtValid" @click="saveNote">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 第三方出金彈窗-->
    <v-dialog v-model="infoBox" persistent width="800px">
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2">{{ $t('finance_withdrawal_choose3thWith') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="infoBox = false"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-card-text class="d-flex align-center">
          <v-container grid-list-md pa-5>
            <v-layout wrap class="d-flex align-center">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>{{ $t('finance_withdrawal_3thPayment') }}</th>
                    <th>{{ $t('finance_withdrawal_withdrawalBank') }}</th>
                    <th>{{ $t('finance_withdrawal_3thCorr') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(v, i) in filterWithdrawalApi" :key="i">
                    <td class="text-center">
                      <v-checkbox
                        v-model="third"
                        class="ma-0 pa-0 d-inline-block white--text"
                        hide-details
                        :value="v.id"
                        :disabled="!isEnable(v.attached_param.withdrawal_limited, showItem.amount)"
                      ></v-checkbox>
                    </td>
                    <td class="text-center">{{ v.name }} {{ v.attached_param.withdrawal_limited ? v.attached_param.withdrawal_limited : '' }}</td>
                    <td class="text-center">{{ showItem.bank }}/ {{ showItem.amount | money }}</td>
                    <td class="text-center">
                      <v-select
                        v-model="code[v.id]"
                        :items="format4select(v.attached_param.banks)"
                        item-text="val"
                        item-value="key"
                        :label="$t('finance_withdrawal_chooseBank')"
                        persistent-hint
                        single-line
                        solo
                        dense
                      ></v-select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="thirdWithdrawal()"> {{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import Weekday from './components/Weekday';
import { money, formatDate, timediff } from '@/filters/custom';
import { dateRange, deepClone, shortcuts, exportXLSX } from '@/utils';
import FieldFilter from '@/components/FieldFilter';
import { mapGetters, mapMutations } from 'vuex';
import _ from 'lodash'

export default {
  name: 'Withdrawal',
  components: {
    Weekday,
    FieldFilter,
  },
  beforeRouteUpdate(to, from, next) {
    this.loadData(1);
    next();
  },
  data() {
    return {
      types: {},
      today: {},
      all: {},
      order: {},
      status: 0,
      shortcuts,
      confirm: '',
      summary: [],
      usdtSummary: {
        label: 'orange',
        langCredit: 'finance_withdrawal_creditTotal',
        langAmount: 'finance_withdrawal_amountTotal',
      },
      tags: {},
      SelectedTags: [],
      WithdrawalApi: [],
      infoBox: false,
      showItem: {},
      third: 0,
      code: {},
      searchShow: true,
      usdtValid: false,
      daterange: dateRange,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      showSearch: false,
      showWeekday: false,
      weekDaySettings: [],
      weekdayCh: {
        Monday: 'g_weekday_monday',
        Tuesday: 'g_weekday_tuesday',
        Wednesday: 'g_weekday_wednesday',
        Thursday: 'g_weekday_thursday',
        Friday: 'g_weekday_friday',
        Saturday: 'g_weekday_saturday',
        Sunday: 'g_weekday_sunday',
      },
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      // 統計
      statistics: {
        today: {},
        all: {},
      },
      searchOption: {
        createdDate: [],
        updatedDate: [],
        nameQueryMode: 1,
        // pay_type: ''
      },
      datePickerOptions: {
        shortcuts,
      },
      payTypes: [
        {
          text: '不限',
          value: ''
        },
        {
          text: 'USDT',
          value: 7
        },
        {
          text: '银行卡',
          value: 4
        },
        {
          text: '淘币',
          value: 8
        },
        {
          text: '欧币',
          value: 9
        },
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
          lang: 'g_table_column_username',
          text: '用户名',
          value: 'uname',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_tag',
          text: '标签',
          value: 'tags',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_agentAttributes',
          text: '代理属性',
          value: 'affs',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_orderNumber',
          text: '订单号',
          value: 'sn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_RMB_amount',
          text: '申请人民币金额',
          value: 'amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_balance_headers_USDT_amount',
          text: '申请U金额',
          value: 'usdt_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_accountInformation',
          text: '账户信息',
          value: 'accountInfo',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_amount',
          text: '申请金额',
          value: 'amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_applyTime',
          text: '申请时间',
          value: 'created',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'status',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_processingTime',
          text: '处理时间',
          value: 'updated',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_timeSpent',
          text: '花費時間',
          value: 'total_cost_time',
          sortable: false,
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
          lang: 'finance_withdrawal_lastOperator',
          text: '最后操作人',
          value: 'update_by',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_usdtunit',
          text: '尚未核销USDT',
          value: 'usdtunit',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_USDTWallet',
          text: 'USDT钱包地址',
          value: 'usdtwali',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_USDTAmount',
          text: '出款USDT',
          value: 'usdt_amount',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_resultExchangeRate',
          text: '出款汇率',
          value: 'exchan_gerate',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_resultAmount',
          text: '出款金额',
          value: 'cny',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_resultTotal',
          text: '实际总额',
          value: 'paidtotal',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_withdrawal_remainCNY',
          text: 'CNY余数',
          value: 'credit_note',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_list_column_profitLossRatio',
          text: '盈亏比',
          value: 'profitLossRatio',
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
          lang: 'finance_info_Change',
          text: '信息变更纪录',
          value: 'infoChange',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'USDT汇率',
          text: 'USDT汇率',
          value: 'cny_exchange_rate',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: '实际金额',
          text: '实际金额',
          value: 'unit',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: '币别',
          text: '币别',
          value: 'currency',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_detail_balance_headers_RMB_amount',
          text: '申请人民币金额',
          value: 'amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_detail_balance_headers_USDT_amount',
          text: '申请U金额',
          value: 'usdt_amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: '申请出款渠道',
          text: '申请出款渠道',
          value: 'pay_type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      withdrawalTypes: [
        {
          api: '/finance/withdrawal/accountspayable',
          apiExport: '/finance/withdrawal/accountspayable/export',
          lang: 'finance_withdrawal_pendingWithdrawal',
          name: '待出金',
          label: 'orange',
          tlabel: 'orange',
          loading: false,
          statistics: [],
          listData: [],
          storageTag: 'withdrawal_pending_list',
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['created'],
            sortDesc: [true],
          },
          headerMap: [
            { lang: 'g_table_column_action', canHide: false, show: true },
            { lang: 'g_table_column_username', canHide: true, show: true },
            { lang: 'finance_info_Change', canHide: true, show: true },
            { lang: 'g_table_column_remarks', canHide: true, show: true },
            { lang: 'finance_withdrawal_agentAttributes', canHide: true, show: true },
            { lang: 'finance_withdrawal_accountInformation', canHide: true, show: true },
            { lang: 'finance_withdrawal_orderNumber', canHide: true, show: true },
            { lang: 'player_detail_balance_headers_RMB_amount', canHide: true, show: true },
            { lang: 'player_detail_balance_headers_USDT_amount', canHide: true, show: true },
            { lang: '申请出款渠道', canHide: true, show: true },
            { lang: 'player_list_column_profitLossRatio', canHide: true, show: true },
            { lang: 'finance_withdrawal_applyTime', canHide: true, show: true },
            { lang: 'g_table_column_status', canHide: true, show: true },
            { lang: 'finance_withdrawal_tag', canHide: true, show: true },
            { lang: 'finance_withdrawal_usdtunit', canHide: true, show: true },
            { lang: 'finance_withdrawal_USDTWallet', canHide: true, show: true },
            { lang: 'USDT汇率', canHide: true, show: true },
            { lang: '实际金额', canHide: true, show: true },
            { lang: '币别', canHide: true, show: true },
            { lang: 'finance_withdrawal_lastOperator', canHide: true, show: true },
          ],
        },
        {
          api: '/finance/withdrawal/paid',
          apiExport: '/finance/withdrawal/paid/export',
          lang: 'finance_withdrawal_hasBeenWithdrawal',
          name: '已出金',
          label: 'green',
          tlabel: 'green',
          loading: false,
          listData: [],
          storageTag: 'withdrawal_has_list',
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['updated'],
            sortDesc: [true],
          },
          headerMap: [
            { lang: 'g_table_column_action', canHide: false, show: true },
            { lang: 'g_table_column_username', canHide: true, show: true },
            { lang: 'finance_info_Change', canHide: true, show: true },
            { lang: 'g_table_column_remarks', canHide: true, show: true },
            { lang: 'finance_withdrawal_agentAttributes', canHide: true, show: true },
            { lang: 'finance_withdrawal_accountInformation', canHide: true, show: true },
            { lang: 'finance_withdrawal_orderNumber', canHide: true, show: true },
            { lang: 'player_detail_balance_headers_RMB_amount', canHide: true, show: true },
            { lang: 'player_detail_balance_headers_USDT_amount', canHide: true, show: true },
            // { lang: 'finance_withdrawal_amount', canHide: true, show: true },
            { lang: '申请出款渠道', canHide: true, show: true },
            { lang: 'player_list_column_profitLossRatio', canHide: true, show: true },
            { lang: 'finance_withdrawal_resultAmount', canHide: true, show: true },
            { lang: 'finance_withdrawal_resultTotal', canHide: true, show: true },
            { lang: 'finance_withdrawal_remainCNY', canHide: true, show: true },
            { lang: 'finance_withdrawal_resultExchangeRate', canHide: true, show: true },
            { lang: 'finance_withdrawal_USDTAmount', canHide: true, show: true },
            { lang: 'USDT汇率', canHide: true, show: true },
            { lang: '实际金额', canHide: true, show: true },
            { lang: '币别', canHide: true, show: true },
            { lang: 'finance_withdrawal_applyTime', canHide: true, show: true },
            { lang: 'finance_withdrawal_processingTime', canHide: true, show: true },
            { lang: 'finance_withdrawal_timeSpent', canHide: true, show: true },
            { lang: 'g_table_column_status', canHide: true, show: true },
            { lang: 'finance_withdrawal_tag', canHide: true, show: true },
            { lang: 'finance_withdrawal_lastOperator', canHide: true, show: true },
          ],
        },
        {
          api: '/finance/withdrawal',
          apiExport: '/finance/withdrawal/export',
          lang: 'finance_withdrawal_rejected',
          name: '已拒绝',
          label: 'red',
          tlabel: 'red',
          loading: false,
          listData: [],
          storageTag: 'withdrawal_rejected_list',
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 25,
            sortBy: ['updated'],
            sortDesc: [true],
          },
          headerHide: [],
          headerMap: [
            { lang: 'g_table_column_action', canHide: false, show: true },
            { lang: 'g_table_column_username', canHide: true, show: true },
            { lang: 'finance_info_Change', canHide: true, show: true },
            { lang: 'g_table_column_remarks', canHide: true, show: true },
            { lang: 'finance_withdrawal_agentAttributes', canHide: true, show: true },
            { lang: 'finance_withdrawal_accountInformation', canHide: true, show: true },
            { lang: 'finance_withdrawal_orderNumber', canHide: true, show: true },
            { lang: 'player_detail_balance_headers_RMB_amount', canHide: true, show: true },
            { lang: 'player_detail_balance_headers_USDT_amount', canHide: true, show: true },
            // { lang: 'finance_withdrawal_amount', canHide: true, show: true },
            { lang: '申请出款渠道', canHide: true, show: true },
            { lang: 'USDT汇率', canHide: true, show: true },
            { lang: '实际金额', canHide: true, show: true },
            { lang: '币别', canHide: true, show: true },
            { lang: 'player_list_column_profitLossRatio', canHide: true, show: true },
            { lang: 'finance_withdrawal_applyTime', canHide: true, show: true },
            { lang: 'finance_withdrawal_processingTime', canHide: true, show: true },
            { lang: 'finance_withdrawal_timeSpent', canHide: true, show: true },
            { lang: 'g_table_column_status', canHide: true, show: true },
            { lang: 'finance_withdrawal_tag', canHide: true, show: true },
            { lang: 'finance_withdrawal_lastOperator', canHide: true, show: true },
          ],
        },
      ],
      rules: {
        required: value => value !== '' || '栏位为必填.',
        maximum: value => {
          this.$forceUpdate();
          if (this.$refs.cny && this.$refs.usdt) {
            const rate = this.config.usdt_selling_rate || this.order.detail.exchange_rate;
            // console.log('this.order.detail.exchange_rate', this.order.detail.exchange_rate);
            // console.log('this.order.usdt_amount', this.order.usdt_amount);
            // console.log('rate', rate);
            // console.log('this.order.cny_amount', this.order.cny_amount);
            const orderSummary = Number((1 * (this.order.usdt_amount || 0) * rate + 1 * (this.order.cny_amount || 0)).toPrecision(12));
            const maximumValid = orderSummary <= Number(this.order.amount);
            const { cny, usdt } = this.$refs;
            cny.errorMessages.pop();
            usdt.errorMessages.pop();
            if (!maximumValid) {
              cny.errorMessages.push(`不可大於出款申请金额(${orderSummary} > ${this.order.amount})`);
              usdt.errorMessages.push(`不可大於出款申请金额(${orderSummary} > ${this.order.amount})`);
              return false;
            }
          }
          return true;
        },
        minimum: value => value >= 0 || '不可小於0',
        nan: value => {
          return !isNaN(value) || '格式错误';
        },
        nofloat: value => !/\d\.\d/.test(Number(value)) || 'USDT 必须为整数',
      },
      permissions: {
        operation: false,
      },
    };
  },
  computed: {
    ...mapGetters(['soundSwitch']),
    filterWithdrawalApi() {      
      if ( this.showItem && this.showItem.pay_type == 7 ) {
        return this.WithdrawalApi.filter(ele=>ele.type == '2')
      } else {
        return this.WithdrawalApi.filter(ele=>ele.type != '2')
      }
    },
    config() {
      return this.$store.getters.config;
    },
    adminUser() {
      return this.$store.getters.user;
    },
    headerMap: {
      get() {
        const field = { lang: 'finance_withdrawal_withdrawalCode', canHide: false, show: true };

        //  config 載入成功後(型別為object 載入前為native function) 判斷是否依設定 新增或刪除平台編碼欄位
        const isShow = Boolean(typeof this.config === 'object' ? this.config.withdrawalCode : true);

        const map = this.withdrawalTypes[this.status].headerMap;
        const existIndex = map.findIndex(item => item.lang == 'finance_withdrawal_withdrawalCode');

        if (existIndex > 0 && !isShow) {
          const d = map.splice(existIndex, 1);
        }
        return map.concat(isShow && !(existIndex > 0) ? field : []);
      },
      set(val) {
        this.withdrawalTypes[this.status].headerMap = val;
      },
    },
    headerArr() {
      return this.headerMap
        .map(item => {
          const show = item.show;
          console.log(item)
          item = this.headers.find(header => item.lang == header.lang);
          item.show = show;
          item.text = item.lang ? this.$t(item.lang) : item.text;
          return item;
        })
        .filter(item => item.show);
    },
    headerHide: {
      get() {
        return this.withdrawalTypes[this.status].headerHide;
      },
      set(val) {
        this.withdrawalTypes[this.status].headerHide = val;
      },
    },
    pagination() {
      return this.withdrawalTypes[this.status].pagination;
    },
    loading: {
      get() {
        return this.withdrawalTypes[this.status].loading;
      },
      set(val) {
        this.withdrawalTypes[this.status].loading = val;
      },
    },
    listData: {
      get() {
        return this.withdrawalTypes[this.status].listData;
      },
      set(val) {
        this.withdrawalTypes[this.status].listData = val;
      },
    },
    url() {
      return this.withdrawalTypes[this.status].api;
    },
    exportUrl() {
      return this.withdrawalTypes[this.status].apiExport;
    },
    storageTag() {
      return this.withdrawalTypes[this.status].storageTag;
    },
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage < this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
    soundSwitchOnOff: {
      get() {
        return this.soundSwitch.withdrawal.value;
      },
      set(val) {
        this.setSoundSwitch({ sound: 'withdrawal', val });
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
        this.withdrawalTypes[this.status].pagination.page = 1;
        this.loadData(this.withdrawalTypes[this.status].pagination.page);
      }
    },
    'pagination.sortBy'(by) {
      if (by != null) {
        this.withdrawalTypes[this.status].pagination.page = 1;
        this.loadData(this.withdrawalTypes[this.status].pagination.page);
      }
    },
    'pagination.itemsPerPage'(newVal) {
      this.withdrawalTypes[this.status].pagination.itemsPerPage = newVal;
      this.withdrawalTypes[this.status].pagination.page = 1;
      this.loadData(this.withdrawalTypes[this.status].pagination.page);
    },
  },
  beforeMount() {
    // this.loadPaymentTypes()
  },
  created() {
    this.loadData(1);
    this.getTags();
    this.loadWithdrawalApi();
    this.checkPermissions();
  },
  methods: {
    // 申请出款渠道
    payTypesText(type) {
      console.log(type)
      const typeItem = this.payTypes.find(el => el.value === Number(type))
      if (!typeItem) return ''
      return typeItem.text
    },
    ...mapMutations(['setSoundSwitch']),
    // 模糊(1)精準(2)查詢
    clickNameQueryMode() {
      if (this.searchOption.nameQueryMode == 1) {
        return (this.searchOption.nameQueryMode = 2);
      } else if (this.searchOption.nameQueryMode == 2) {
        return (this.searchOption.nameQueryMode = 1);
      }
    },
    selectStatus(index) {
      this.status = index;
    },
    isEnable(area, money) {
      if (area) {
        area = area.split(',');
        if ((parseFloat(area[1]) >= parseFloat(money) || parseFloat(area[1]) == 0) && parseFloat(area[0]) <= money) {
          return true;
        }
        return false;
      }
      return true;
    },
    format4select(item) {
      const ret = [];
      for (const i in item) {
        ret.push({
          key: i,
          val: item[i],
        });
      }
      return ret;
    },
    showThird(item) {      
      this.showItem = item;
      this.infoBox = true;
    },
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    showNote(item, e, cfm) {
      e.preventDefault();
      this.note.show = false;
      this.note.x = e.clientX;
      this.note.y = e.clientY;
      this.$nextTick(() => {
        if (cfm == 'cw' && Number(this.config.USDT_withdrawal_rule) !== 1) {
          api
            .get(`/finance/withdrawal/details/${item.tid}`)
            .then(detail => {
              item.detail = detail.result;
              item.usdt_amount = item.cny_amount = 0;
              this.order = deepClone(item);
              this.note.show = true;
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
              this.note.show = false;
              this.confirm = '';
            });
        } else {
          this.order = deepClone(item);
          this.note.show = true;
        }
      });
      this.confirm = cfm;
    },
    saveNote() {
      let text = '';
      if (this.confirm == 'cw') {
        text = '是否确认出金？';
      } else if (this.confirm == 'rw') {
        text = '是否确认拒绝出金？';
      }
      const rejectWithdrawal = () => {
        api
          .post(`/finance/withdrawal/reject/${this.order.tid}`, {
            note: this.order.note,
            view: this.order.view,
            confirm: this.confirm,
          })
          .then(() => {
            this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
            this.note.show = false;
            this.confirm = '';
            this.loadData(this.pagination.page);
            this.loadStatistics();
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
            this.note.show = false;
            this.confirm = '';
          });
      };
      const usdt = {
        usdt_amount: Number(this.order.usdt_amount),
        cny_amount: Number(this.order.cny_amount),
        exchange_rate: Number(this.config.usdt_selling_rate),
      };
      const doSave = () => {
        api
          .post(`/finance/note/${this.order.tid}`, {
            note: this.order.note,
            view: this.order.view,
            confirm: this.confirm,
            add_time: this.order.add_time,
            ...((Number(this.config.USDT_withdrawal_rule) || this.order.has_usdt_account == 1) && usdt),
          })
          .then(() => {
            this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
            this.note.show = false;
            this.confirm = '';
            this.loadData(this.pagination.page);
            this.loadStatistics();
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
            this.note.show = false;
            this.confirm = '';
          });
      };
      if (text == '') {
        doSave();
      } else if (this.confirm == 'rw') {
        this.$store.commit('Confirm', {
          text,
          ok() {
            rejectWithdrawal();
          },
        });
      } else {
        this.$store.commit('Confirm', {
          text,
          ok() {
            doSave();
          },
        });
      }
    },
    formatAccount(rowobj, hideHtml) {
      // if (rowobj.update_by == this.adminUser.id || rowobj.status != 0) {
      if (rowobj.bank) {
        return `${rowobj.name}/${rowobj.bank}${hideHtml ? `\r\n` : `<br>`} ${rowobj.card} / ${rowobj.branch}`;
      } else {
        return `${rowobj.name} / ${rowobj.card}`;
      }
      // } else {
      // return "锁定后可见"
      // }
    },
    loadPaymentTypes() {
      api
        .get('/system/payment/types')
        .then(data => {
          this.types = data;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    loadWithdrawalApi() {
      api
        .get('/system/withrawal/api')
        .then(data => {
          if (data.result != null) {
            data.result.forEach(item => {
              if (item.attached_param) {
                try {
                  item.attached_param = JSON.parse(item.attached_param);
                } catch (e) {
                  item.attached_param = null;
                }
              }
            });
            const names = data.result
              .filter(item => item.attached_param === null)
              .map(item => item.name)
              .join('","');
            if (names) {
              this.$store.commit('MsgError', `支付 API："${names}", 附加参数设置有误`);
            }
            this.WithdrawalApi = data.result.filter(item => item.attached_param !== null);
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    thirdWithdrawal() {
      if (this.third == null || this.third == 0) {
        this.$store.commit('MsgError', '请选择第三方支付，如无法选择，请注意金额范围。');
        return;
      }
      if (this.code[this.third] == '' || this.code[this.third] == undefined) {
        this.$store.commit('MsgError', '请对应银行名称');
        return;
      }
      const $this = this;

      this.$store.commit('Confirm', {
        text: '是否确认使用第三方支付出金？',
        ok() {
          api
            .post(`/finance/third/${$this.showItem.tid}`, {
              api: $this.third,
              code: $this.code[$this.third],
            })
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              if (data.result != '') {
                const b = window.open(data.result);
                if (!b) {
                  $this.$store.commit('Confirm', {
                    text: `请复制[${data.result}]在浏览器中打开，完成操作`,
                    ok() {
                      window.open(data.result);
                    },
                  });
                }
              }
              $this.infoBox = false;
              $this.code = {};
              $this.third = 0;
              $this.loadData($this.pagination.page);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
              $this.infoBox = false;
              $this.code = {};
              $this.third = 0;
            });
        },
      });
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loadStatistics();
      this.loading = true;
      const params = {
        ...this.searchOption,
        page: this.pagination.page,
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
        .get(this.url, params)
        .then(data => {
          this.listData = data.result.withdrawals;
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.summary = data.result.summary;
          this.withdrawalTypes[this.status].summaryMap = data.result.summaryMap || data.result.otherMap;
          if (data.result.otherTotal) {
            const { credit_notetotal, usdt_amounttotal } = data.result.otherTotal[0];
            this.usdtSummary.credit_notetotal = credit_notetotal;
            this.usdtSummary.usdt_amounttotal = usdt_amounttotal;
          }
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    lockWithdrawal(item) {
      api
        .get(`/finance/withdrawal/${item.tid}`)
        .then(data => {
          this.$store.commit('MsgOk', '锁定成功');
          this.loadData(this.searchOption.page);
        })
        .catch(error => {
          this.loadData(this.searchOption.page);
          this.$store.commit('MsgError', error.error);
        });
    },
    loadStatistics() {
      const $this = this;
      api
        .get('/finance/withdrawal/statistics')
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
        page:1,
        num: this.pagination.totalItems
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
        .get(this.url, params)
        .then(data => {
          if (data.result.withdrawals == null) {
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
            data.result.withdrawals.forEach(row => {
              const tmp = [];
              this.headerArr.forEach(col => {
                if (col.value == 'actions') {
                  return true;
                } else if (/accountInfo/.test(col.value)) {
                  tmp.push(this.formatAccount(row, true));
                } else if (/status/.test(col.value)) {
                  tmp.push(this.$t(this.withdrawalTypes[row.status].lang));
                } else if (/updated|created/.test(col.value)) {
                  tmp.push(formatDate(row[col.value]));
                } else if (/total_cost_time/.test(col.value)) {
                  tmp.push(timediff(row.total_cost_time));
                } else if (/^\d+\.\d+$/.test(row[col.value])) {
                  tmp.push(parseFloat(row[col.value]));
                } else if (/usdt_amount/.test(row[col.value])) {
                  if (row.pay_type==7) {
                    tmp.push(row[col.value]);
                  } else {
                    tmp.push('-')
                  }
                  
                } else if (/pay_type/.test(col.value)) {
                  const type = this.payTypesText(row[col.value])
                  tmp.push(type)
                } else if (/tags/.test(col.value)) {
                  if (row.tags) {
                    tmp.push(
                      row.tags
                        .split(',')
                        .map(tag => (this.tags[tag] ? this.tags[tag].name : ''))
                        .join(','),
                    );
                  } else {
                    tmp.push('-');
                  }
                } else {
                  console.log(col.value, row[col.value])
                  tmp.push(row[col.value] || '-');
                }
              });
              _export.push(tmp);
            });
            exportXLSX(_export, '玩家出金列表');
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
    getWeekdaySettings() {
      let settings = this.config.withdrawal_allow_time;
      if (typeof settings == 'string') {
        settings = JSON.parse(settings);
      }
      const today = new Date();
      for (const i in settings) {
        settings[i].range = [];
        const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), settings[i].startHour, settings[i].startMin);
        const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), settings[i].endHour, settings[i].endMin);
        settings[i].range.push(new Date(startTime));
        settings[i].range.push(new Date(endTime));
      }
      return _.cloneDeep(settings);
    },
    saveWeekday() {
      const settings = this.weekDaySettings;
      const $this = this;
      for (const i in settings) {
        const item = settings[i].range;
        if (item != null && item.length == 2) {
          settings[i].startHour = item[0].getHours();
          settings[i].startMin = item[0].getMinutes();
          settings[i].endHour = item[1].getHours();
          settings[i].endMin = item[1].getMinutes();
        }
      }
      api
        .post('/finance/withdrawal/allowtime', settings)
        .then(response => {
          const newConfig = _.cloneDeep(this.config);
          newConfig.withdrawal_allow_time = settings;
          this.$store.commit('setConfig', newConfig);
          this.showWeekday = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
          $this.note.show = false;
          $this.confirm = '';
        });
    },
    showWeekdayDrawer() {
      this.weekDaySettings = this.getWeekdaySettings();
      this.showWeekday = true;
    },
    withdrawSetAll() {
      const today = new Date();
      this.weekDaySettings.map((item, i) => {
        item.checked = true;
        return item;
      });
    },
    withdrawSetWeekday() {
      const today = new Date();
      this.weekDaySettings.map((item, i) => {
        // const item = settings[i];
        switch (item.weekDay) {
          case 'Monday':
          case 'Tuesday':
          case 'Wednesday':
          case 'Thursday':
          case 'Friday':
            // item.range = [new Date(`${today.Format('yyyy-MM-dd')} 00:00:00`), new Date(`${today.Format('yyyy-MM-dd')} 23:59:00`)];
            item.checked = true;
            break;
          default:
            item.checked = false;
            break;
        }
        return true;
      });
    },
    withdrawSetHoliday() {
      const today = new Date();
      this.weekDaySettings.map((item, i) => {
        // const item = settings[i];
        switch (item.weekDay) {
          case 'Saturday':
          case 'Sunday':
            // item.range = [new Date(`${today.Format('yyyy-MM-dd')} 00:00:00`), new Date(`${today.Format('yyyy-MM-dd')} 23:59:00`)];
            item.checked = true;
            break;
          default:
            item.checked = false;
            break;
        }
        return true;
      });
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else {
          this.searchOption[i] = null;
        }
      });
      this.$forceUpdate();
    },
    checkDateRange(date) {
      if (date && date.length == 2 && date[0] > date[1]) {
        const tmp = date[0];
        date[0] = date[1];
        date[1] = tmp;
      }
    },
    triggerChange(ref) {
      if (this.$refs[ref]) {
        this.$refs[ref].$emit('change');
      }
    },
    showPlayerDetailInforChange(id) {
      this.$store.commit('PLAYERDETAILACTIVE', 5);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    checkPermissions() {
      api
        .post(`/finance/note/0`, {
          note: 'test',
          view: '0',
          confirm: 'cw',
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
