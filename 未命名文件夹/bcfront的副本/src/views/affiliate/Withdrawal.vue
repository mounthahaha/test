<template>
  <div class="AffiliateWithdrawal">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> group </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 展開按鈕 -->
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
              :label="$t('g_text_field_userId')"
              :placeholder="$t('g_text_field_placeholder_userId')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.name"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_withdraw_field_name')"
              :placeholder="$t('affiliate_withdraw_field_name')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.card"
              clearable
              hide-details
              solo
              persistent-hint
              :label="$t('affiliate_withdraw_field_debitCard')"
              :placeholder="$t('affiliate_withdraw_field_debitCard')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col
          v-for="(item, index) in statisticsComputed"
          :key="index"
          cols="4"
          @click="
            searchOption.status = index;
            loadData(1);
          "
        >
          <v-alert dense dark class="my-0" border="left" :color="statisticsComputed[index].label" style="cursor: pointer">
            <div class="d-flex justify-space-between">
              <div class="d-flex">
                <v-icon class="ml-2">person</v-icon>
                <span class="align-self-start ml-2 mr-5">{{ $t(item.lang) }}</span>
                <span class="text-h5 font-weight-bold">{{ all[index] ? all[index] : 0 }}</span>
              </div>
              <div class="d-flex">
                <span class="align-self-start ml-2 mr-5">{{ $t('affiliate_withdraw_today') }}</span>
                <span class="text-h5 font-weight-bold mr-5">{{ today[index] ? today[index] : 0 }}</span>
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
                      <v-btn v-if="item.status == 0" icon color="primary" v-bind="attrs" @click="confirmWithdrawal(item)" v-on="on">
                        <v-icon>check_circle_outline</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_confirm') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn v-if="item.status == 0" icon color="primary" v-bind="attrs" @click="rejectWithdrawal(item)" v-on="on">
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
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="statistics[item.status]['label']"> {{ statistics[item.status]['text'] }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.name }}({{ item.aid }})</td>
              <td class="text-left text-no-wrap">{{ item.sn }}</td>
              <td class="text-left text-no-wrap">{{ formatAccount(item) }}</td>
              <td class="text-left text-no-wrap">{{ item.amount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.processed_on | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.admin }}</td>
              <td class="text-left text-no-wrap">{{ item.remark }}</td>
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
        v-model="note.show"
        :close-on-content-click="false"
        :nudge-width="300"
        left
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
                <v-list-item-title>备注</v-list-item-title>
                <v-list-item-subtitle>{{ order.sn }}</v-list-item-subtitle>
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
                  <v-textarea v-model="order.remark" value="" hide-details :placeholder="$t('g_input_remark_reject')"></v-textarea>
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
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { money, formatDate } from '@/filters/custom';
import _ from 'lodash'

export default {
  name: 'Withdrawal',
  components: {},
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      note: { show: false, x: 0, y: 0 },
      searchShow: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: [],
        sortDesc: [],
      },
      desserts: [],
      types: {},
      today: {},
      all: {},
      order: {},
      playerId: 0,
      detail: false,
      searchOption: { status: 0, date: [] },
      statistics: [
        {
          lang: 'g_withdraw_type_await',
          text: '待出金',
          label: 'orange',
          tlabel: 'orange',
        },
        {
          lang: 'g_withdraw_type_done',
          text: '已出金',
          label: 'green',
          tlabel: 'green',
        },
        {
          lang: 'g_withdraw_type_rejected',
          text: '已拒绝',
          label: 'red',
          tlabel: 'red',
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
          lang: 'g_table_column_status',
          text: '状态',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'affiliate_withdraw_affiliate_name',
          text: '代理用户名',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_orderno',
          text: '订单号',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_accountInfo',
          text: '账户信息',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_amount',
          text: '金额',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_requestTime',
          text: '请求时间',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_processTime',
          text: '处理时间',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_processBy',
          text: '处理人',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: '',
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
    statisticsComputed() {
      return this.statistics.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
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
    // 'pagination.sortDesc'(desc) {
    //   if (desc != null) {
    //     this.pagination.page = 1;
    //     this.loadData(this.pagination.page);
    //   }
    // },
    // 'pagination.sortBy'(by) {
    //   if (by != null) {
    //     this.pagination.page = 1;
    //     this.loadData(this.pagination.page);
    //   }
    // },
    'searchOption.status'(i) {
      this.loadData(1);
    },
  },
  beforeMount() {},
  created() {
    this.loadData(1);
    // this.loadStatistics()
  },
  methods: {
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
        .post(`/affiliate/note/${$this.order.id}`, { note: $this.order.remark })
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_remarkSuccess'));
          $this.note.show = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    formatAccount(rowobj) {
      if (rowobj.bank_name) {
        return `${rowobj.agency_name} / ${rowobj.bank_name} / ${rowobj.bank_account} / ${rowobj.bank_branch}`;
      } else {
        return `${rowobj.agency_name} / ${rowobj.bank_name} / ${rowobj.bank_account}`;
      }
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loadStatistics();
      const $this = this;
      $this.loading = true;
      let param = {
        page: p,
        num: $this.pagination.itemsPerPage,
      };
      if (this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0] ? this.searchOption.date[0] : '';
        this.searchOption.e = this.searchOption.date[1] ? this.searchOption.date[1] : '';
      }
      param = Object.assign(param, $this.searchOption);
      api
        .get('/affiliate/withdrawal', param)
        .then(data => {
          $this.desserts = data.result.withdrawal;
          $this.pagination.length = data.result.pageNums;
          $this.pagination.totalItems = data.result.total;
          $this.loading = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    loadStatistics() {
      const $this = this;
      api.get('/affiliate/withdrawal/statistics').then(data => {
        $this.today = data.result.today;
        $this.all = data.result.all;
      });
    },
    confirmWithdrawal(item) {
      const $this = this;
      this.$store.commit('Confirm', {
        text: this.$t('g_msgWithdraw'),
        ok() {
          api
            .post(`/affiliate/withdrawal/${item.id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$.t('g_msgSuccess'));
              item.status = 1;
              $this.loadStatistics();
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    rejectWithdrawal(item) {
      const $this = this;
      this.$store.commit('Confirm', {
        text: this.$t('g_msgRejectWithdraw'),
        ok() {
          api
            .post(`/affiliate/withdrawal/reject/${item.id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              item.status = 2;
              $this.loadStatistics();
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    _export(evt) {
      const $this = this;
      if (this.searchOption.date.length > 0) {
        this.searchOption.s = this.searchOption.date[0] ? this.searchOption.date[0] : '';
        this.searchOption.e = this.searchOption.date[1] ? this.searchOption.date[1] : '';
      }
      api
        .get('/affiliate/withdrawal/export', this.searchOption)
        .then(data => {
          if (data.result.withdrawal == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.result.withdrawal.forEach(v => {
              const tmp = [];
              tmp.push(v.action);
              tmp.push($this.statistics[v.status].name);
              tmp.push(v.name);
              tmp.push(v.sn);
              tmp.push($this.formatAccount(v));
              tmp.push(parseFloat(money(v.amount, false)));
              tmp.push(formatDate(v.created));
              tmp.push(formatDate(v.processed_on));
              tmp.push(v.admin);
              tmp.push(v.remark);
              _export.push(tmp);
            });
            exportXLSX(_export, this.$t('affiliate_withdraw_export_filename'));
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
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
