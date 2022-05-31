<template>
  <div class="Balance">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 展開按鈕 -->
      <div class="mt-6">
        <v-checkbox v-model="searchOption.include" class="mr-3" solo clearable :label="$t('player_balance_lowerAffiliate')"></v-checkbox>
      </div>
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
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.uname"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('player_balance_username')"
              :placeholder="$t('player_balance_placeholder_EnterUsername')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.uid"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('player_balance_userId')"
              :placeholder="$t('player_balance_placeholder_userId')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="searchOption.affname"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('player_balance_affiliateName')"
              :placeholder="$t('player_balance_placeholder_affiliateName')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="searchOption.type"
              solo
              clearable
              hide-details
              persistent-hint
              single-line
              :items="types"
              :label="$t('player_balance_adjustmentType')"
            ></v-select>
          </v-col>
          <v-col cols="4">
            <datetime-range
              v-model="searchOption.date"
              range-separator="player_balance_to"
              start-placeholder="player_balance_startDate"
              end-placeholder="player_balance_endStart"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- 統計 -->
      <v-row dense>
        <template v-for="(item, i) in summary">
          <v-col :key="i">
            <v-alert dense dark :color="i == 0 ? 'red' : 'green'" border="left" class="pr-8">
              <div class="d-flex align-center justify-space-between">
                <span class="d-flex align-center">
                  <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ item.total > 0 ? $t('player_balance_increase') : $t('player_balance_decrease') }}
                </span>
                <span v-if="item.total" class="text-h5 font-weight-bold">{{ item.total | money }}</span>
                <span v-else class="text-h5 font-weight-bold">--</span>
              </div>
            </v-alert>
          </v-col>
        </template>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          v-model="selected"
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :disable-sort="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left text-no-wrap">
                {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
              </td>
              <td class="text-left text-no-wrap">{{ item.username }}</td>
              <td class="text-left text-no-wrap">{{ item.affs }}</td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.amount | moneyColor"></td>
              <td class="text-center">
                <v-chip label outlined small :color="item.type == 5 ? 'red' : item.type == 6 ? 'green' : 'warning'">
                  {{ logtypes[item.type] }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip label outlined small :color="item.eff_id > 0 ? 'red' : 'green'">
                  {{ item.eff_id > 0 ? $t('g_btn_yes') : $t('g_btn_no') }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <!--table list tags info-->
              <td class="text-left" style="min-width: 300px">
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
              <td class="text-left" style="min-width: 200px">
                <span class="mr-3"> {{ item.remark }}</span>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn x-small depressed outlined icon color="primary" v-bind="attrs" v-on="on" @click="updateNote(item, $event)">
                      <v-icon x-small>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_modify') }}</span>
                </v-tooltip>
              </td>
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
        :nudge-width="800"
        right
        :nudge-bottom="25"
        :nudge-left="350"
        :position-x="note.x"
        :position-y="note.y"
        absolute
        offset-y
        persistent
      >
        <v-card elevation="2" class="pa-3 px-5 rounded-lg">
          <v-card-text>
            <h4>{{ $t('finance_deposit_list_remarks') }}</h4>
          </v-card-text>
          <v-card-text>
            <v-textarea
              v-model="record.note"
              value=""
              dense
              outlined
              clearable
              hide-details
              auto-grow
              :placeholder="$t('finance_deposit_enterRemarks')"
            ></v-textarea>
          </v-card-text>
          <v-card-actions class="pa-2 mt-3">
            <v-spacer></v-spacer>
            <v-btn small outlined color="primary" @click="note.show = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn small color="primary" @click="saveNote">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { formatDate } from '@/filters/custom';
import _ from 'lodash'

export default {
  name: 'Deposit',
  data() {
    return {
      menuSearchDate: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      record: {
        note: '',
      },
      order: {},
      tags: {},
      SelectedTags: [],
      searchShow: true,
      loading: false,
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['id'],
        sortDesc: [true],
      },
      datePickerOptions: {
        shortcuts,
      },
      headers: [
        {
          lang: 'g_table_column_usernameId',
          text: '用户名(ID)',
          value: 'id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_customerName',
          text: '客戶名',
          value: 'username',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_balance_column_affiliateInfo',
          text: '代理信息',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_balance_column_amount',
          text: '金额',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_balance_column_adjustmentType',
          text: '调整类型',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },

        {
          lang: 'player_balance_column_affectEettlement',
          text: '影响代理结算',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_balance_column_requestTime',
          text: '请求时间',
          value: 'created',
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
          lang: 'g_table_column_remarks',
          text: '备注',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      logtype: {},
      logtypes: {},
      statistics: [
        {
          name: '调高',
          label: 'orange',
          tlabel: 'orange lighten-3',
        },
        {
          name: '调低',
          label: 'green',
          tlabel: 'green lighten-3',
        },
        {
          name: '合计',
          label: 'grey',
          tlabel: 'grey lighten-3',
        },
      ],
      today: {},
      all: {},
      selected: [],
      summary: [],
      status: 0,
      searchOption: {
        date: [],
        type: ''
      },
      shortcuts,
      confirm: '',
      accounts: [],
    };
  },
  computed: {
    types() {
      return _.map(this.logtype, (item, i) => ({ text: item, value: i }));
    },
    config() {
      return this.$store.getters.config;
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang);
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
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    this.loadData(1);
    this.getTags();
  },
  methods: {
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    toggleAll() {
      if (this.selected.length) {
        this.selected = [];
      } else {
        this.selected = this.desserts.slice();
      }
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    loadData(p) {
      if (this.loading) {
        return;
      }

      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      this.searchOption.status = this.status;
      this.searchOption.sort = this.pagination.sortBy[0];
      this.searchOption.asc = !this.pagination.sortDesc[0];
      const params = { ...this.searchOption };
      if (params.date && params.date.length > 0) {
        params.s = params.date[0];
        params.e = params.date[1];
      }
      api
        .get('/finance/balance', params)
        .then(data => {
          this.desserts = data.result.history;
          this.summary = data.result.summary;
          this.logtype = data.result.logtype;
          this.logtypes = data.result.logtypes;
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      this.searchOption.page = 1;
      // this.searchOption.num = this.pagination.itemsPerPage;
      this.searchOption.status = this.status;
      this.searchOption.sort = this.pagination.sortBy[0];
      this.searchOption.asc = !this.pagination.sortDesc[0];
      const params = { ...this.searchOption, num: this.pagination.totalItems };
      if (params.date && params.date.length > 0) {
        params.s = params.date[0];
        params.e = params.date[1];
      }
      
      api
        .get('/finance/balance', params)
        .then(data => {
          if (data.result.history == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.result.history.forEach(v => {
              const tmp = [];
              tmp.push(`${v.name}(${v.user_id})`);
              tmp.push(v.username);
              tmp.push(v.affs);
              tmp.push(parseFloat(v.amount));
              if (v.amount > 0) {
                tmp.push('系統加值');
              } else {
                tmp.push('系統扣除');
              }
              if (v.eff_id > 0) {
                tmp.push('是');
              } else {
                tmp.push('否');
              }
              tmp.push(formatDate(v.created));
              tmp.push(v.remark);
              _export.push(tmp);
            });
            exportXLSX(_export, '玩家余额调整历史');
          }
        })
        .catch(error => {
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
    updateNote(item, e) {
      this.record = {
        id: item.id,
        note: '',
      };
      this.note.show = true;
      this.note.x = e.clientX;
      this.note.y = e.clientY;
    },
    saveNote() {
      api
        .post(`/player/balance/note/${this.record.id}`, {
          note: this.record.note,
        })
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.note.show = false;
          this.record.note = '';
          this.loadData(this.pagination.page);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
          this.note.show = false;
        });
    },
  },
};
</script>
