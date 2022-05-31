<template>
  <div class="Online">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
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
        <v-form ref="searchForm" v-model="valid" :lazy-validation="true">
          <v-row dense class="d-flex align-center justify-space-between">
            <v-col>
              <v-text-field
                v-model="searchOption.name"
                clearable
                hide-details
                solo
                persistent-hint
                :label="$t('player_online_username')"
                :placeholder="$t('player_online_placeholder_username')"
                @keydown.enter="loadData(1)"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                ref="uid"
                v-model="searchOption.id"
                :rules="[v => !v || /^\d+$/.test(v) || $t('player_online_rules_userId')]"
                clearable
                hide-details
                solo
                persistent-hint
                :label="$t('player_online_userId')"
                :placeholder="$t('player_online_placeholder_userId')"
                @keydown.enter="loadData(1)"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-center text-no-wrap">
                <!-- 踢線 -->
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="kick(item, $event, 0)">
                      <v-icon>voice_over_off</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('player_online_options_kick') }}</span>
                </v-tooltip>
                <!-- 踢線 + 停用 -->
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="kick(item, $event, 1)">
                      <v-icon>public_off</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('player_online_options_kAndD') }}</span>
                </v-tooltip>
              </td>
              <td class="text-left text-no-wrap">
                {{ item.name }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.id)"> {{ item.id }} </a>)
              </td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary"> {{ item.vip_lv ? `VIP ${item.vip_lv}` : `--` }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.aff_name }}</td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.lastime | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.ip }} ( {{ item.lastip }} )</td>
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
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { formatDate } from '@/filters/custom';

export default {
  name: 'Online',
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      note: {
        show: false,
        x: 0,
        y: 0,
      },
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
          lang: 'player_online_column_username',
          text: '用戶名',
          value: 'id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_online_column_vipLevel',
          text: 'VIP等级',
          value: 'vipLevel',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_online_column_superAgent',
          text: '上级代理',
          value: 'superAgent',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_online_column_regTime',
          text: '注册时间',
          value: 'regTime',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_online_column_operationTime',
          text: '最后操作时间',
          value: 'operationTime',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_online_column_loginIp',
          text: '登录IP',
          value: 'loginIp',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      searchOption: {},
      valid: false,
    };
  },
  computed: {
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
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    this.loadData(1);
  },
  methods: {
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
      const $this = this;
      $this.loading = true;
      $this.searchOption.transferType = $this.transferType;
      $this.searchOption.page = p;
      $this.searchOption.num = $this.pagination.itemsPerPage;
      $this.searchOption.sort = $this.pagination.sortBy[0];
      $this.searchOption.asc = !$this.pagination.sortDesc[0];
      api
        .get(`/player/onlinelist`, $this.searchOption)
        .then(data => {
          $this.desserts = data.result.players ?? [];
          $this.platform = data.platform;
          $this.logtype = [];
          $this.pagination.length = data.result.pageNums;
          $this.pagination.totalItems = data.result.total;
          $this.loading = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
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
    kick(item, e, status) {
      const $this = this;
      const doSave = () => {
        api
          .get(`/player/logout/${item.id}`, { Status: status })
          .then(data => {
            if (status == 1) {
              api
                .post(`/player/status/${item.id}/${status}`)
                .then(data => {
                  $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
                  $this.note.show = false;
                  $this.loadData($this.pagination.page);
                })
                .catch(error => {
                  $this.$store.commit('MsgError', error.error);
                  $this.note.show = false;
                });
            } else {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.note.show = false;
              $this.loadData($this.pagination.page);
            }
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
            $this.note.show = false;
          });
      };
      const text = this.$t(`player_online_confirm_kick${status ? 'AndDeactivate' : ''}`, { name: item.name, id: item.id });
      // `确认对${item.name}(${item.id})踢线${status ? `并停用` : ``}`;
      $this.$store.commit('Confirm', {
        text,
        ok() {
          doSave();
        },
      });
    },
  },
};
</script>
