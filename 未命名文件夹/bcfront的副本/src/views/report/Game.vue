<template>
  <div class="Game">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 下載 展開按鈕 -->
      <div>
        <v-checkbox
          v-model="searchOption.include"
          solo
          hide-details
          class="shrink mr-2"
          :label="$t('report_game_textfield_includingSub')"
        ></v-checkbox>
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
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.name"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('g_text_field_username')"
              :placeholder="$t('g_text_field_placeholder_username')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.affname"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('report_game_textfield_affiliateName')"
              :placeholder="$t('report_game_textfield_affiliateName_placeholder')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-select
              v-model="searchOption.group"
              solo
              hide-details
              clearable
              :items="[
                { label: $t('report_game_textfield_byPlatform'), value: 'p' },
                { label: $t('report_game_textfield_byGame'), value: 'g' },
              ]"
              item-text="label"
              item-value="value"
              :label="$t('report_game_textfield_group')"
              single-line
            ></v-select>
          </v-col>
          <v-col cols="3">
            <datetime-range
              start-placeholder="结算开始时间"
              end-placeholder="结束时间"
              v-model="searchOption.date" />
          </v-col>
        </v-row>
      </v-card>

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
          <template #item="{ item, index }">
            <tr>
              <td class="text-left text-no-wrap">{{ index + 1 }}</td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary">{{ item.system_code }}</v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.game_name }}</td>
              <td class="text-left text-no-wrap">{{ item.act_users }}</td>
              <td class="text-left text-no-wrap">{{ item.users }}</td>
              <td class="text-left text-no-wrap">{{ item.bet | money }}</td>
              <td class="text-left text-no-wrap">{{ item.win | money }}</td>
              <td class="text-left text-no-wrap">{{ item.lose | money }}</td>
              <td class="text-left text-no-wrap" :inner-html.prop="item.result | moneyColor"></td>
              <td class="text-left text-no-wrap">{{ ((parseFloat(item.result) / parseFloat(item.bet)) * 100) | money }}%</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <!-- <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination> -->
          <!-- <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div> -->
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { money, formatDate } from '@/filters/custom';
import _ from 'lodash'

export default {
  name: 'Game',
  data() {
    return {
      shortcuts,
      datePickerOptions: {
        shortcuts,
      },
      searchShow: true,
      loading: false,
      desserts: [],
      searchOption: {
        date: [],
        created: [],
      },
      summary: {},
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },
      headers: [
        {
          lang: 'g_table_column_sn',
          text: '#',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_platform',
          text: '游戏平台',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_game',
          text: '游戏名称',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_act_users',
          text: '活跃玩家',
          value: 'act_users',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_users',
          text: '总计玩家',
          value: 'users',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_bet',
          text: '总投注',
          value: 'bet',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_win',
          text: '总赢',
          value: 'win',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_lose',
          text: '总输',
          value: 'lose',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_result',
          text: '总毛利',
          value: 'result',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'report_game_header_benefitRate',
          text: '盈利率',
          value: 'regip',
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
    player() {
      return this.$store.getters.playerId;
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
  },
  watch: {
    'pagination.page'(n, v) {
      this.loadData(n);
    },
    // selectItem(newVal) {
    //   this.pagination.itemsPerPage = newVal;
    //   this.pagination.page = 1;
    //   this.loadData(this.pagination.page, this.Status);
    // },
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
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      const $this = this;
      $this.loading = true;
      $this.searchOption.page = p;
      $this.searchOption.num = $this.pagination.itemsPerPage;
      $this.searchOption.sort = $this.pagination.sortBy;
      $this.searchOption.asc = !$this.pagination.sortDesc;
      const params = { ...$this.searchOption };
      if (params.date && params.date.length > 0) {
        params.ds = params.date[0];
        params.de = params.date[1];
      }
      api
        .get('/report/game', params)
        .then(data => {
          $this.desserts = data.players ? data.players : [];
          $this.pagination.length = Math.ceil(data.players.length / $this.pagination.itemsPerPage);
          $this.pagination.totalItems = data.players.length;
          $this.loading = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    _export(evt) {
      if (this.searchOption.date.length > 0) {
        this.searchOption.ds = this.searchOption.date[0];
        this.searchOption.de = this.searchOption.date[1];
      }
      api
        .get('/report/game', this.searchOption)
        .then(data => {
          if (data.players == null) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const _export = [];
            const cols = [];
            this.headers.forEach(v => {
              cols.push(v.text);
            });
            _export.push(cols);
            data.players.forEach((v, i) => {
              const tmp = [];
              tmp.push(i);
              tmp.push(v.system_code);
              tmp.push(v.game_name);
              tmp.push(v.act_users);
              tmp.push(v.users);
              tmp.push(parseFloat(money(v.bet, false)));
              tmp.push(parseFloat(money(v.win, false)));
              tmp.push(parseFloat(money(v.lose, false)));
              tmp.push(parseFloat(money(v.result, false)));
              tmp.push(parseFloat(money((parseFloat(v.result) / parseFloat(v.bet)) * 100, false)));
              _export.push(tmp);
            });
            exportXLSX(_export, this.$t(`sidebar_${this.$route.name}`));
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
