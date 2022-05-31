<template>
  <div class="AllList">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> group </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 新增全民代理 展開按鈕 -->
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

      <!-- <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="_export">
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_export') }}</span>
      </v-tooltip> -->

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="showSetting()">
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('alllist_btn_settings') }}</span>
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
              v-model="searchOption.username"
              hide-details
              solo
              :label="$t('alllist_textfield_username')"
              :placeholder="$t('alllist_textfield_username')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.promote_code"
              hide-details
              solo
              :label="$t('alllist_textfield_promotionCode')"
              :placeholder="$t('alllist_textfield_promotionCode')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.parent_id"
              hide-details
              solo
              :label="$t('alllist_textfield_parent_id')"
              :placeholder="$t('alllist_textfield_parent_id')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.root_id"
              hide-details
              solo
              :label="$t('alllist_textfield_root_id')"
              :placeholder="$t('alllist_textfield_root_id')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.team_agent_count_gte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_teamMember')}>=`"
              :placeholder="`${$t('alllist_textfield_teamMember')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.team_agent_count_lte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_teamMember')}<=`"
              :placeholder="`${$t('alllist_textfield_teamMember')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.sub_agent_count_gte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_subAffiate')}>=`"
              :placeholder="`${$t('alllist_textfield_subAffiate')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.sub_agent_count_lte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_subAffiate')}<=`"
              :placeholder="`${$t('alllist_textfield_subAffiate')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.total_rebate_gte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_rebate')}>=`"
              :placeholder="`${$t('alllist_textfield_rebate')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.total_rebate_lte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_rebate')}<=`"
              :placeholder="`${$t('alllist_textfield_rebate')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.total_commission_gte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_commission')}>=`"
              :placeholder="`${$t('alllist_textfield_commission')}>=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="searchOption.total_commission_lte"
              hide-details
              solo
              :label="`${$t('alllist_textfield_commission')}<=`"
              :placeholder="`${$t('alllist_textfield_commission')}<=`"
              @keydown.enter="loadData(1)"
            ></v-text-field>
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
          <template slot="no-data"> {{ $t('alllist_nodata') }} </template>
          <template v-if="Boolean(root)" slot="body.prepend">
            <tr>
              <td class="text-left text-no-wrap">
                {{ root.Username }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(root.UserId)"> {{ root.UserId }} </a>)
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small color="primary"> {{ root.PromoteCode }}</v-chip>
              </td>
              <td class="text-left text-no-wrap">--</td>
              <td class="text-left text-no-wrap">--</td>
              <td class="text-left text-no-wrap">{{ root.TeamAgentCount }}</td>
              <td class="text-left text-no-wrap">{{ root.SubAgentCount }}</td>
              <td class="text-left text-no-wrap">--</td>
              <td class="text-left text-no-wrap">--</td>
              <td class="text-left text-no-wrap">--</td>
              <td class="text-left text-no-wrap">--</td>
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click.prevent="showAffiliateDetail(root.UserId)" v-on="on">
                      <v-icon small>open_in_new</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('alllist_btn_check') }}</span>
                </v-tooltip>
              </td>
            </tr>
          </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left text-no-wrap">
                {{ item.Username }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.UserId)"> {{ item.UserId }} </a>)
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small color="primary"> {{ item.PromoteCode }}</v-chip>
              </td>
              <td class="text-left text-no-wrap">
                <template v-if="item.ParentId">
                  {{ item.ParentName }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.ParentId)"> {{ item.ParentId }} </a
                  >)
                </template>
                <v-flex v-else>--</v-flex>
              </td>
              <td class="text-left text-no-wrap">
                <template v-if="item.AncestorID">
                  {{ item.AncestorName }}
                  (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.AncestorID)"> {{ item.AncestorID }} </a>)
                </template>
                <template v-else>--</template>
              </td>
              <td class="text-left text-no-wrap">{{ item.TeamAgentCount }}</td>
              <td class="text-left text-no-wrap">{{ item.SubAgentCount }}</td>
              <td class="text-left text-no-wrap">{{ item.TotalRebate | money }}</td>
              <td class="text-left text-no-wrap">{{ item.TotalCommission | money }}</td>
              <td class="text-left text-no-wrap">{{ item.TotalAmount | money }}</td>
              <td class="text-left text-no-wrap">{{ item.Balance | money }}</td>
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click.prevent="showAffiliateDetail(item.UserId)" v-on="on">
                      <v-icon small>open_in_new</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('alllist_btn_check') }}</span>
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
    </v-container>

    <!-- 新增全民代理彈窗 -->
    <v-dialog v-model="showSettingsDialog" persistent width="800px">
      <v-form v-model="settings.isValid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2">{{ $t('alllist_settings_title') }} </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="showSettingsDialog = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap align="baseline">
              <v-col cols="4" py-5 px-2>{{ $t('alllist_settings_rebate_commission') }}</v-col>
              <v-col cols="4" py-5 px-2>{{ $t('alllist_settings_rebate') }}</v-col>
              <v-col cols="4" py-5 px-2>{{ $t('alllist_settings_commission') }}</v-col>
              <template v-for="(item, i) in settings">
                <v-col :key="`name_${i}`" cols="4" py-5 px-2>{{ item.name }}</v-col>
                <v-col :key="`rebate_${i}`" cols="4" py-5 px-2>
                  <v-text-field v-model="item.rebate" solo dense hide-details type="number" min="0" class="text-center text-no-wrap">
                    <template slot="append">%</template>
                  </v-text-field>
                </v-col>
                <v-col :key="`commission_${i}`" cols="4" py-5 px-2>
                  <v-text-field v-model="item.commission" solo dense hide-details type="number" min="0" class="text-center text-no-wrap">
                    <template slot="append">%</template>
                  </v-text-field>
                </v-col>
              </template>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click="showSettingsDialog = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn color="primary" depressed :loading="loading" @click="saveSettings">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'AllList',
  components: {},
  data() {
    return {
      contentType: null,
      selectItem: 10,
      selectItems: [10, 25, 50, 100],
      valid: true,
      searchShow: true,
      loading: false,
      advancedSearch: false,
      searchOption: {},
      settings: {
        isValid: false,
        chess: {},
        slot: {},
        live: {},
        fish: {},
        sports: {},
        lotto: {},
      },
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },
      desserts: [],
      showSettingsDialog: false,
      root: null,
      headers: [
        {
          lang: 'alllist_list_header_username',
          text: '用户名 / ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_promotionCode',
          text: '推广码',
          value: 'PromoteCode',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'alllist_list_header_parentAffiliate',
          text: '上级代理',
          value: 'ParentId',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_topAffiliate',
          text: '最上级代理',
          value: 'RootId',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_teamMember',
          text: '团队人数',
          value: 'TeamAgentCount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_subAffiliate',
          text: '直推人数',
          value: 'SubAgentCount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_totalRebate',
          text: '累计返点收益',
          value: 'TotalRebate',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_totalCommission',
          text: '累计返佣收益',
          value: 'TotalCommission',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_totalRevenue',
          text: '总收益',
          value: 'TotalAmount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_totalBalance',
          text: '代理钱包余额',
          value: 'Balance',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'alllist_list_header_actions',
          text: '操作',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
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
  mounted() {
    this.loadData(1);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        ...this.searchOption,
      };
      api
        .get('/agent/list', params)
        .then(data => {
          this.desserts = data.list ?? [];
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.count;
          this.root = data.root;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    showAffiliateDetail(id) {
      this.$store.commit('AFFILIATE', id);
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
    showSetting() {
      api.get('/agent/gameplatform/reward/list').then(resp => {
        this.settings = resp.list;
        this.showSettingsDialog = true;
      });
    },
    saveSettings() {
      this.loading = true;
      const params = {};
      params.data = this.settings.map(item => {
        return {
          id: item.id * 1,
          commission: item.commission * 1,
          rebate: item.rebate * 1,
        };
      });
      api
        .put('/agent/gameplatform/reward', params)
        .then(resp => {
          console.log(resp);
          this.loading = this.showSettingsDialog = false;
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
