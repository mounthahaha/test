<template>
  <div class="Transfer">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> payment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!--  搜尋 重置 展開按鈕 -->
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
          <v-col>
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
          <v-col>
            <v-select
              v-model="searchOption.type"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('finance_transfer_transferType')"
              :placeholder="$t('finance_transfer_selectTransferType')"
              :items="type"
            ></v-select>
          </v-col>
          <v-col v-if="transferType === 0">
            <v-select
              v-model="searchOption.status"
              class="ma-0 pa-0"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('g_table_column_status')"
              :placeholder="$t('g_selector_status')"
              :items="transferFailedStatusComputed"
            ></v-select>
          </v-col>
          <v-col>
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" start-placeholder="finance_transfer_transferTime" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col
          v-for="(item, index) in statistics"
          :key="index"
          flex
          md6
          class="hands"
          @click="
            transferType = item.value;
            loadStatistics();
            loadData(1);
          "
        >
          <v-alert dense dark class="my-0" border="left" :color="statistics[index].label" style="cursor: pointer">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex">
                <v-icon class="ml-2">person</v-icon>
                <span class="align-self-start ml-2 mr-5">{{ $t(item.lang) }}</span>
                <span class="text-h5 font-weight-bold mr-5">{{ item.total ? item.total : 0 }}</span>
              </div>
              <div class="d-flex">
                <span class="align-self-start mr-5">{{ $t('finance_transfer_today') }}</span>
                <span class="text-h5 font-weight-bold mr-5">{{ item.today ? item.today : 0 }}</span>
              </div>
              <div class="mr-5">
                <v-btn dark small icon> <v-icon>loop</v-icon> </v-btn>
              </div>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          v-model="selected"
          :headers="headerArr"
          :items="desserts"
          :loading="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          class="elevation-0"
          show-all
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left text-no-wrap">{{ item.id }}</td>
              <td class="text-left text-no-wrap">
                {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
              </td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary"> {{ platform[item.from_pid] }}至{{ platform[item.to_pid] }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ Math.abs(item.amount) | money }}</td>
              <td class="text-center text-no-wrap">
                <v-chip v-if="transferType" label outlined small :color="`green`"> 成功 </v-chip>
                <v-chip v-if="transferFailedStaus[item.status]" label outlined small :color="transferFailedStaus[item.status].color">
                  {{ `${item.status != 0 ? `已` : ``}${transferFailedStaus[item.status].text}` }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td v-if="transferType == 0" class="text-left text-no-wrap">{{ item.updated_by }}</td>
              <td v-if="transferType == 0" class="text-left text-no-wrap">{{ item.updated | formatDate }}</td>
              <td v-if="transferType == 0" class="text-center text-no-wrap">
                <v-tooltip v-if="item.status == 0" bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary lighten-1" v-bind="attrs" v-on="on" @click="updateStatus(item, $event, 1)">
                      <v-icon>post_add</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('finance_transfer_replenishment') }}</span>
                </v-tooltip>
                <v-tooltip v-if="item.status == 0" bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary lighten-1" v-bind="attrs" v-on="on" @click="updateStatus(item, $event, 2)">
                      <v-icon>remove_circle</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('finance_transfer_ignore') }}</span>
                </v-tooltip>
              </td>
            </tr>
          </template>
          <template slot="footer">
            <td colspan="100%">
              <v-chip v-for="(item, i) in summary" :key="i" label color="blue" text-color="white">
                当前&nbsp;<code> {{ item.total > 0 ? '增加' : '减少' }} </code>&nbsp;余额：<code> {{ item.total | money }} </code>
              </v-chip>
            </td>
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
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { formatDate } from '@/filters/custom';
import { dateRange, shortcuts, exportXLSX } from '@/utils';
import { mapGetters } from 'vuex';

export default {
  name: 'Transfer',
  data() {
    return {
      desserts: [],
      logtype: [],
      platform: {},
      daterange: dateRange,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      transferType: 1,
      selected: [],
      summary: [],
      status: 0,
      searchOption: {
        date: [],
        nameQueryMode: 1,
      },
      datePickerOptions: {
        shortcuts,
      },
      confirm: '',
      accounts: [],
      menuCreatedDate: false,
      type: [],
      order: {},
      searchShow: true,
      loading: false,
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
          lang: 'finance_transfer_orderId',
          text: '订单号',
          value: 'id',
          sortable: false,
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
          lang: 'finance_transfer_transferType',
          text: '转帐类型',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_transfer_amountType',
          text: '金额',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'finance_transfer_transferTime',
          text: '转帐时间',
          value: 'created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_transfer_operator',
          text: '操作人',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'finance_transfer_operatingTime',
          text: '操作时间',
          value: 'updated',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
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
      statistics: [
        {
          lang: 'finance_transfer_success',
          name: '成功',
          label: 'success',
          tlabel: 'success lighten-3',
          value: 1,
          total: null,
          today: null,
        },
        {
          lang: 'finance_transfer_fail',
          name: '失败',
          label: 'error',
          tlabel: 'error lighten-3',
          value: 0,
          total: null,
          today: null,
        },
      ],
      transferFailedStaus: [
        {
          lang: 'finance_transfer_fail',
          text: '失败',
          value: 0,
          color: 'error',
        },
        {
          lang: 'finance_transfer_replenishment',
          text: '补单',
          value: 1,
          color: 'green',
        },
        {
          lang: 'finance_transfer_ignore',
          text: '忽略',
          value: 2,
          color: 'grey',
        },
      ],
    };
  },
  computed: {
    ...mapGetters({ locale: 'i18n/locale' }),
    config() {
      return this.$store.getters.config;
    },
    transferFailedStatusComputed() {
      this.transferFailedStaus.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
      return this.transferFailedStaus;
    },
    headerArr() {
      this.headers.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
      let ret = null;
      switch (this.transferType) {
        case 1:
          ret = this.headers.slice(0, 6);
          break;
        default:
          ret = this.headers;
          break;
      }
      return ret;
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
      this.loadStatistics();
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    this.loadData(1);
    this.loadStatistics();
  },
  methods: {
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
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        ...this.searchOption,
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
        transferType: this.transferType,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
      };
      if (this.searchOption.type != null) {
        const ty = this.type[this.searchOption.type];
        params.from_pid = ty.from;
        params.to_pid = ty.to;
      }
      const { date } = params;
      if (date && date.length > 0) {
        params.s = date[0] || '';
        params.e = date[1] || '';
      }
      api
        .get(`/report/alltransfer`, params)
        .then(data => {
          this.desserts = data.transfers ?? [];
          // $this.summary = data.result.summary;
          this.platform = data.platform;
          this.logtype = [];
          _.each(data.platform, (item, i) => {
            if (i > 0) {
              this.type.push({
                text: `${data.platform[0]} 转至 ${data.platform[i]}`,
                value: this.type.length,
                from: 0,
                to: i * 1,
              });
              this.type.push({
                text: `${data.platform[i]} 转至 ${data.platform[0]}`,
                value: this.type.length,
                from: i * 1,
                to: 0,
              });
            }
          });
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          // _.find(this.statistics, { value: this.transferType }).total = data.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    loadStatistics() {
      const $this = this;
      api
        .get(`/report/alltransfer/statistics`)
        .then(data => {
          _.find($this.statistics, { value: 0 }).total = data.result.all.fail ?? 0;
          _.find($this.statistics, { value: 0 }).today = data.result.today.fail ?? 0;
          _.find($this.statistics, { value: 1 }).total = data.result.all.success ?? 0;
          _.find($this.statistics, { value: 1 }).today = data.result.today.success ?? 0;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    updateStatus(item, e, status) {
      const $this = this;
      const doSave = () => {
        api
          .post(`/report/updatefailtransfer/${item.id}`, {
            Status: status,
          })
          .then(data => {
            $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
            $this.note.show = false;
            $this.loadData($this.pagination.page);
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
            $this.note.show = false;
          });
      };
      const text = `确认${$this.transferFailedStaus[status].label}，订单号(${item.id})`;
      $this.$store.commit('Confirm', {
        text,
        ok() {
          doSave();
        },
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
    },
  },
};
</script>
