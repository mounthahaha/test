<template>
  <div class="Tasks">
    <v-container fluid class="pa-0 ma-0">
      <!-- 搜尋 -->
      <v-card dense elevation="0" class="pa-3 mb-3 d-flex justify-end" color="blue-grey lighten-4">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="taskDialog = true">
              <v-icon>add</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('player_detail_task_addNew') }}</span>
        </v-tooltip>
      </v-card>

      <!-- 統計 -->
      <v-row dense class="mb-3">
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="green">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t('player_detail_task_statistics_complete') }}
              </span>
              <span class="text-h5 font-weight-bold">{{ (s2f(tasksTotals.finished) ? s2f(tasksTotals.finished) : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="red">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t('player_detail_task_statistics_incomplete') }}
              </span>
              <span class="text-h5 font-weight-bold">{{ (s2f(tasksTotals.not_finished) ? s2f(tasksTotals.not_finished) : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert dense dark class="my-0" border="left" color="blue">
            <div class="d-flex align-center justify-space-between">
              <span class="d-flex align-center">
                <v-icon class="ml-2 mr-1">attach_money</v-icon> {{ $t('player_detail_task_statistics_requirements') }}
              </span>
              <span class="text-h5 font-weight-bold">{{ (s2f(tasksTotals.all) ? s2f(tasksTotals.all) : 0) | money }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="tasks"
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
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <td class="text-left text-no-wrap">{{ item.Deposit }}</td>
                <td class="text-left text-no-wrap">{{ item.MinTrade }}</td>
                <td class="text-left text-no-wrap" v-text="item.FinishAmount < 0 ? 0 : item.FinishAmount"></td>
                <td class="text-center text-no-wrap">
                  <v-chip v-if="item.Finished == 1" label outlined small color="green"> {{ $t('player_detail_task_turnover_complete') }} </v-chip>
                  <v-chip v-else label outlined small color="red"> {{ $t('player_detail_task_turnover_incomplete') }} </v-chip>
                </td>
                <td class="text-left text-no-wrap">{{ item.Created | formatDate }}</td>
                <td class="text-left text-no-wrap">{{ item.Note }}</td>
                <td class="text-center text-no-wrap">
                  <v-btn v-show="item.Finished == 0" :disabled="loading" small color="error" depressed @click="FinishTask(item.Id)">
                    {{ $t('player_detail_task_turnover_close') }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :disabled="loading" :length="pagination.length" :total-visible="15"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 新增任務彈窗 -->
    <v-dialog v-model="taskDialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2"> {{ $t('player_detail_task_addNew') }} </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="taskDialog = false"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-container grid-list-md class="py-5 px-10">
          <v-row wrap>
            <v-col cols="12">
              <v-text-field v-model="task.MinTrade" type="number" :label="$t('player_detail_task_turnover')"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="task.Note" outlined :label="$t('g_table_column_remarks')"></v-textarea>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" outlined @click.native="taskDialog = !taskDialog">{{ $t('g_btn_cancel') }}</v-btn>
          <v-btn color="primary" @click.native="SaveTask(userId)">{{ $t('g_btn_save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { formatDate, money, hiddenPhoneNumber } from '@/filters/custom';

import qs from 'qs';
export default {
  name: 'Refunds',
  props: {
    userId: {
      type: Number,
      default: 0,
    },
    player: {
      type: Object,
      default: null,
    },
    s2f: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['created'],
        sortDesc: [true],
      },
      tasksTotals: {},
      task: {},
      tasks: [],
      taskDialog: false,
      headers: [
        {
          lang: 'player_detail_task_headers_depositAmount',
          text: '充值金额 ',
          value: 'Deposit',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_task_headers_turnoverTask',
          text: '流水任务',
          value: ' MinTrade',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_task_headers_turnoverAmount',
          text: '完成流水',
          value: 'FinishAmount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_task_headers_Complete',
          text: '是否完成',
          value: 'Fininshed',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_detail_task_headers_depositTime',
          text: '充值时间',
          value: 'Created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'Note',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'Opera',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
    };
  },
  computed: {
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
        this.loadData(1);
      }
    },
    'pagination.sortBy'(by) {
      if (by != null) {
        this.pagination.page = 1;
        this.loadData(1);
      }
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    this.loadData(this.pagination.page);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.pagination.page = p;
      this.loading = true;
      api
        .get(`/player/tasks/${this.userId}`, {
          page: p,
          num: this.pagination.itemsPerPage,
          sort: this.pagination.sortBy[0],
          asc: !this.pagination.sortDesc[0],
        })
        .then(data => {
          this.tasks = data.tasks;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.tasksTotals = data.totalItems;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    SaveTask(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: `${$this.$t('player_detail_task_headers_msgAddNew')}${$this.player.name}${$this.$t('player_detail_task_headers_msgAddNew2')}`,
        ok() {
          api
            .post(
              `/player/task/${id}`,
              qs.stringify({
                MinTrade: $this.task.MinTrade,
                Note: $this.task.Note,
              }),
            )
            .then(data => {
              $this.taskDialog = false;
              $this.loadData(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    FinishTask(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: $this.$t('player_detail_task_headers_msgClose'),
        ok() {
          api
            .put(
              `/player/task/finished/${id}`,
              qs.stringify({
                MinTrade: $this.task.MinTrade,
                Note: $this.task.Note,
              }),
            )
            .then(data => {
              $this.taskDialog = false;
              $this.loadData($this.pagination.page);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
  },
};
</script>
