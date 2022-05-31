<template>
  <div class="Warning">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> security </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 下載 新增 展開按鈕 -->
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
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="$refs.uploader.click()">
            <v-icon>file_upload</v-icon>
          </v-btn>
        </template>
        <span>批量添加</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="addWarning">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_add') }}</span>
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
          <template v-for="(col, index) in editItems">
            <v-col :key="`label_${index}`" cols="4">
              <v-text-field
                v-model="searchOption[col.value.toLowerCase()]"
                solo
                clearable
                hide-details
                persistent-hint
                :label="$t(col.lang)"
                @keydown.enter="loadData(1)"
              />
            </v-col>
          </template>
        </v-row>
      </v-card>

      <!-- 表格 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          v-model="selected"
          :headers="headerComputed"
          :items="listData"
          :loading="loading"
          :page.sync="pagination.page"
          :sort-by.sync="pagination.sortBy"
          :sort-desc.sync="pagination.sortDesc"
          :items-per-page.sync="pagination.itemsPerPage"
          :footer-props="{
            'items-per-page-options': [10, 25, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <template v-for="(col, i) in headerComputed">
                <td v-if="/^(Card|Wechat|Qq)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                  <template v-if="item[col.value].split(',').length > 1">
                    <div>
                      {{ item[col.value].split(',')[0] }}
                      <v-btn color="primary" icon small class="x-small" @click="showDetail(item[col.value], col)">
                        <v-icon small>open_in_new</v-icon>
                      </v-btn>
                    </div>
                  </template>
                  <template v-else> {{ item[col.value] }} </template>
                </td>
                <td v-else-if="/^(Ip)$/.test(col.value) && item[col.value].length > 10" :key="i" class="text-left text-no-wrap">
                  <template v-if="item[col.value].split(',').length > 1">
                    <div>
                      {{ item[col.value].split(',')[0] }}
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn icon color="primary" v-bind="attrs" @click.prevent="showDetail(item[col.value], col)" v-on="on">
                            <v-icon small>open_in_new</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('g_detail') }}</span>
                      </v-tooltip>
                    </div>
                  </template>
                  <template v-else> {{ item[col.value] }} </template>
                </td>
                <td v-else-if="/^(Note)$/.test(col.value) && item[col.value].length > 10" :key="i" class="text-left text-no-wrap">
                  <div>
                    {{ item[col.value].slice(0, 9) }}
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn icon color="primary" v-bind="attrs" @click.prevent="showDetail(item[col.value], col)" v-on="on">
                          <v-icon small>open_in_new</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('g_detail') }}</span>
                    </v-tooltip>
                  </div>
                </td>
                <td v-else-if="/^(Deposit|Withdrawal|Result)$/i.test(col.value)" :key="i" class="text-left text-no-wrap">
                  {{ item[col.value] | money }}
                </td>
                <td v-else-if="/^(Created)$/.test(col.value)" :key="i" class="text-left text-no-wrap">{{ item[col.value] | formatDate }}</td>
                <td v-else-if="/^(actions)$/.test(col.value)" :key="i" class="text-center text-no-wrap">
                  <v-btn :disabled="!item.IsEdit" class="x-small ma-1" small depressed color="primary" @click="edit(item)">
                    {{ $t('g_btn_edit') }}
                  </v-btn>
                  <v-btn :disabled="!item.IsEdit" class="x-small ma-1" small depressed color="error" @click="deleteItem(item.Id)">
                    {{ $t('g_btn_delete') }}
                  </v-btn>
                </td>
                <td v-else :key="i" class="text-left text-no-wrap">{{ item[col.value] }}</td>
              </template>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
        </div>
      </v-card>
    </v-container>

    <!-- 新增彈窗 -->
    <v-dialog v-model="infoBox" persistent width="800px" :retain-focus="false">
      <v-toolbar dark color="primary">
        <v-toolbar-title class="headline">{{ warning.id ? $t('編輯') : $t('新增') }}{{ $t('示警用户名单') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip class="pa-1" color="transparent" @click.native="infoBox = false">
          <v-icon>close</v-icon>
        </v-chip>
      </v-toolbar>
      <v-card flat tile>
        <v-row class="px-6">
          <v-col v-for="(col, index) in editItems" :key="index" cols="6">
            <template v-if="col.joinList">
              <v-text-field v-model="col.feed" :label="$t(col.lang)" />
              <v-btn dense color="primary" depressed :disabled="!col.feed" @click="pushTo(col.feed, warning[`${col.value}List`], col)">{{
                $t('g_btn_add')
              }}</v-btn>
              <v-card>
                <v-list v-if="warning[`${col.value}List`].length" dense>
                  <template v-for="(item, i) in warning[`${col.value}List`]">
                    <v-list-item :key="i">
                      <v-list-item-content> {{ item }}</v-list-item-content>
                      <v-list-item-icon> <v-icon @click="spliceFrom(i, warning[`${col.value}List`])">delete</v-icon></v-list-item-icon>
                    </v-list-item>
                    <v-divider v-if="i < warning[`${col.value}List`].length - 1" :key="`divider_${i}`"></v-divider>
                  </template>
                </v-list>
              </v-card>
            </template>
            <template v-else>
              <v-text-field v-model="warning[col.value]" :label="$t(col.lang)" />
            </template>
          </v-col>
        </v-row>
        <v-card-actions class="d-flex justify-end">
          <v-btn color="primary" depressed @click.native="save">{{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 詳細彈窗 -->
    <v-dialog v-model="detailBox" persistent width="800px" :retain-focus="false">
      <v-toolbar dark color="primary">
        <v-toolbar-title class="headline">{{ detail.col ? $t(detail.col.lang) : `` }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip class="pa-1" color="transparent" @click.native="detailBox = false">
          <v-icon>close</v-icon>
        </v-chip>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-list v-if="detail.data" dense>
            <template v-for="(item, i) in detail.data.split(',').map(item => unescape(item))">
              <v-list-item :key="i">
                <v-list-item-content> {{ item }}</v-list-item-content>
              </v-list-item>
              <v-divider v-if="i < detail.data.split(',').length - 1" :key="`divider_${i}`"></v-divider>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 批量添加彈窗 -->
    <v-dialog v-model="buckAdd.show" persistent width="650px">
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2"> 批量添加 </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon @click.native="buckAdd.show = false" v-on="on"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>

        <v-container grid-list-md class="py-5 px-10">
          <div class="d-flex align-center justify-center mb-5">
            <v-btn class="mx-1" color="primary" depressed :loading="buckAdd.loading" @click="$refs.uploader.click()"> 选择其它档案 </v-btn>
            <v-spacer></v-spacer>
            <v-btn class="mr-2" color="error" outlined @click="resetImportFile()">{{ $t('g_btn_cancel') }}</v-btn>

            <v-btn color="primary" depressed :disabled="!buckAdd.items.length" :loading="buckAdd.loading" @click="saveBuckAdd($event)"
              >{{ $t('g_btn_send') }}
            </v-btn>
          </div>
          <v-divider></v-divider>
          <v-data-table
            :items-per-page.sync="buckAdd.items.length"
            :headers="headerComputed.filter(h => h.editable)"
            :items="buckAdd.items"
            :loading="buckAdd.loading"
            class="elevation-1"
            hide-default-footer
          >
            <template slot="no-data">
              {{ $t('system_blacklist_clickBtn') }}
            </template>
            <template #item="{ item }">
              <tr>
                <template v-for="(col, i) in headerComputed.filter(h => h.editable)">
                  <td v-if="/^(Card|Wechat|Qq)$/.test(col.defaultText)" :key="i" class="text-left text-no-wrap">
                    <template v-if="item[col.defaultText] && item[col.defaultText].split(',').length > 1">
                      <div>
                        {{ item[col.defaultText].split(',')[0] }}
                        <v-btn color="primary" icon small class="x-small" @click="showDetail(item[col.defaultText], col)">
                          <v-icon small>open_in_new</v-icon>
                        </v-btn>
                      </div>
                    </template>
                    <template v-else> {{ item[col.defaultText] }} </template>
                  </td>
                  <td
                    v-else-if="/^(Ip)$/.test(col.defaultText) && item[col.defaultText] && item[col.defaultText].length > 10"
                    :key="i"
                    class="text-left text-no-wrap"
                  >
                    <template v-if="item[col.defaultText].split(',').length > 1">
                      <div>
                        {{ item[col.defaultText].split(',')[0] }}
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-btn icon color="primary" v-bind="attrs" @click.prevent="showDetail(item[col.defaultText], col)" v-on="on">
                              <v-icon small>open_in_new</v-icon>
                            </v-btn>
                          </template>
                          <span>{{ $t('g_detail') }}</span>
                        </v-tooltip>
                      </div>
                    </template>
                    <template v-else> {{ item[col.defaultText] }} </template>
                  </td>
                  <td
                    v-else-if="/^(Note)$/.test(col.defaultText) && item[col.defaultText] && item[col.defaultText].length > 10"
                    :key="i"
                    class="text-left text-no-wrap"
                  >
                    <div>
                      {{ item[col.defaultText].slice(0, 9) }}
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn icon color="primary" v-bind="attrs" @click.prevent="showDetail(item[col.defaultText], col)" v-on="on">
                            <v-icon small>open_in_new</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('g_detail') }}</span>
                      </v-tooltip>
                    </div>
                  </td>
                  <td v-else :key="i" class="text-left text-no-wrap">{{ item[col.defaultText] }}</td>
                </template>
              </tr>
            </template>
          </v-data-table>
        </v-container>
      </v-card>
    </v-dialog>
    <input ref="uploader" class="d-none" type="file" accept=".xlsx" @change="onFileChanged" />
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import XLSX from 'xlsx';
import { money, formatDate } from '@/filters/custom';
import { mapGetters } from 'vuex';

const defaultHeaders = [
  {
    lang: 'g_table_column_id',
    text: 'ID',
    value: 'Id',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: false,
    joinList: false,
    sortable: false,
  },
  {
    lang: 'g_table_column_name',
    text: 'name',
    value: 'Name',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: false,
    sortable: false,
  },
  {
    lang: 'player_list_column_reaName',
    text: 'userName',
    value: 'Username',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: false,
    sortable: false,
  },
  {
    lang: 'g_table_column_mobile',
    text: 'mobile',
    value: 'Mobile',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: false,
    sortable: false,
  },
  {
    lang: 'g_table_column_card',
    text: 'card',
    value: 'Card',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: true,
    sortable: false,
  },
  {
    lang: 'g_table_column_wechat',
    text: 'wechat',
    value: 'Wechat',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: true,
    sortable: false,
  },
  {
    lang: 'g_table_column_qq',
    text: 'qq',
    value: 'Qq',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: true,
    sortable: false,
  },
  {
    lang: 'g_table_column_ip',
    text: 'ip',
    value: 'Ip',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: true,
    sortable: true,
  },
  {
    lang: 'g_table_column_note',
    text: 'note',
    value: 'Note',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: true,
    joinList: false,
    sortable: false,
  },
  {
    lang: 'g_table_column_created',
    text: 'Created',
    value: 'Created',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'left',
    editable: false,
    joinList: false,
    sortable: false,
  },
  {
    lang: '总入金',
    text: 'Deposit',
    value: 'Deposit',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'right',
    editable: false,
    joinList: false,
    sortable: true,
  },
  {
    lang: '总出金',
    text: 'Withdrawal',
    value: 'Withdrawal',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'right',
    editable: false,
    joinList: false,
    sortable: true,
  },
  {
    lang: '总输赢',
    text: 'Result',
    value: 'Result',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'right',
    editable: false,
    joinList: false,
    sortable: true,
  },
  {
    lang: 'g_table_column_action',
    text: 'actions',
    value: 'actions',
    class: 'text-no-wrap blue-grey lighten-5',
    align: 'center',
    editable: false,
    joinList: false,
    sortable: false,
  },
];
export default {
  name: 'Deposit',
  components: {},
  data() {
    return {
      searchShow: true,
      loading: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      selected: [],
      defaultHeaders,
      headers: JSON.parse(JSON.stringify(defaultHeaders)),
      editItems: this.getEditItems(defaultHeaders),
      infoBox: false,
      detailBox: false,
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['Created'],
        sortDesc: [true],
      },
      searchOption: {},
      warning: {},
      listData: [],
      detail: {},
      buckAdd: {
        show: false,
        type: null,
        loading: false,
        items: [],
      },
    };
  },
  computed: {
    headerComputed() {
      return this.headers.map(item => {
        item.defaultText = item.text;
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
    infoBox(v) {
      if (!v) {
        this.editItems = this.getEditItems(this.defaultHeaders);
      }
    },
    'pagination.itemsPerPage'(val) {
      this.pagination.length = Math.ceil(this.pagination.totalItems / val);
    },
    'pagination.page'(p) {
      this.loadData(p);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    this.emptyWarning();
    this.loadData(1);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const { itemsPerPage, sortBy, sortDesc } = this.pagination;
      const params = {
        page: p,
        num: itemsPerPage,
        sort: sortBy[0],
        asc: !sortDesc[0],
        ...this.searchOption,
      };
      api
        .get('/system/warnings', params)
        .then(data => {
          this.listData = data.result ?? [];
          this.pagination.length = Math.ceil(data.total / this.pagination.itemsPerPage);
          this.pagination.totalItems = data.total;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addWarning() {
      this.emptyWarning();
      this.infoBox = true;
    },
    edit(item) {
      this.emptyWarning(item);
      this.infoBox = true;
    },
    emptyWarning(edit) {
      const warning = edit ? edit : {};
      this.headers
        .filter(item => item.joinList)
        .forEach(item => {
          warning[`${item.value}List`] = warning[item.value] ? warning[item.value].split(',').map(item => unescape(item)) : [];
        });
      this.warning = warning;
    },
    save() {
      let url = '/system/warning';
      this.headers.forEach(item => {
        this.warning[item.value.toLowerCase()] = this.warning[item.value];
      });
      this.headers
        .filter(item => item.joinList)
        .forEach(item => {
          this.warning[item.value.toLowerCase()] = this.warning[`${item.value}List`].map(item => escape(item)).join(',');
        });
      let promise;
      if (!this.warning.id) {
        promise = api.post(url, this.warning);
      } else {
        url = `/system/warning/${this.warning.id}`;
        promise = api.put(url, this.warning);
      }
      promise
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
    pushTo(item, arr, col) {
      arr.push(item);
      col.feed = '';
      this.$forceUpdate();
    },
    spliceFrom(i, arr) {
      arr.splice(i, 1);
      this.$forceUpdate();
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else if (i.toLocaleLowerCase().indexOf('type') >= 0) {
          this.searchOption[i] = 0;
        } else {
          this.searchOption[i] = null;
        }
      });
    },
    showDetail(data, col) {
      this.detail = {
        data,
        col,
      };
      this.detailBox = true;
    },
    getEditItems(defaultHeaders) {
      return JSON.parse(JSON.stringify(defaultHeaders))
        .filter(item => item.editable)
        .map(item => {
          item.text = this.$t(item.lang);
          return item;
        });
    },
    deleteItem(id) {
      this.$store.commit('Confirm', {
        text: this.$t('g_dialog_confirm_delete'),
        ok: () => {
          api
            .delete(`system/warning/delete/${id}`)
            .then(() => {
              this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
              this.loadData(1);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    unescape,
    _export(evt) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const { itemsPerPage, sortBy, sortDesc } = this.pagination;
      const params = {
        sort: sortBy[0],
        asc: !sortDesc[0],
        ...this.searchOption,
      };
      api
        .get('/system/warnings/export', params)
        .then(data => {
          if (data == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            let cols = [];
            this.headerComputed
              .filter(col => !/actions/i.test(col.value))
              .forEach(h => {
                cols.push(h.text);
              });
            const listData = data.result ?? [];
            const logExports = [];
            logExports.push(cols);
            listData.forEach(item => {
              cols = [];
              this.headerComputed
                .filter(col => !/actions/i.test(col.value))
                .forEach(col => {
                  if (/created/i.test(col.value)) {
                    cols.push(formatDate(item[col.value]));
                  } else if (/^(withdrawal|deposit|result)$/i.test(col.value)) {
                    cols.push(money(item[col.value]));
                  } else {
                    cols.push(item[col.value]);
                  }
                });
              logExports.push(cols);
            });
            exportXLSX(logExports, `示警用户名单`);
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onFileChanged(file) {
      if (this.buckAdd.loading) {
        return;
      }
      this.buckAdd.loading = true;
      const reader = new FileReader();
      reader.onload = this.onFileLoad;
      reader.onerror = this.onFileError;
      reader.readAsBinaryString(file.target.files[0]);
      this.$refs.uploader.value = '';
    },
    onFileError(ex) {
      this.$store.commit('MsgError', '档案有误');
    },
    onFileLoad(e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary',
      });

      const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]]);

      this.buckAdd.items = XL_row_object.map(row => {
        const ret = {};
        this.headerComputed
          .filter(h => h.editable)
          .forEach(h => {
            ret[h.defaultText] = String(row[h.defaultText] || row[h.text] || row[h.value] || '');
          });
        return ret;
      }).filter(item => item.name && item.userName && item.mobile);
      this.buckAdd.show = true;
      this.buckAdd.loading = false;
    },
    saveBuckAdd() {
      api
        .post('/system/warning/bulkAdd', { data: this.buckAdd.items })
        .then(res => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.loadData(1);
          this.buckAdd.show = false;
          this.buckAdd.items = [];
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {});
    },
  },
};
</script>
