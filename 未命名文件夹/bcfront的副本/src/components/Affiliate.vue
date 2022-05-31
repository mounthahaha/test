<template>
  <div>
    <v-dialog v-model="affiliateId" persistent fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click.native="closeDetail">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('affiliatedetail_title') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn class="w-auto" text dark depressed @click.native="refresh">
            {{ $t('affiliatedetail_btn_fresh') }}
            <v-icon>refresh</v-icon>
          </v-btn>
          <v-btn icon dark @click.native="closeDetail">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-card>
            <v-card-title class="title mb-1"> <v-icon>group</v-icon>{{ $t('affiliatedetail_info_title') }} </v-card-title>
            <v-card-text>
              <v-progress-linear :active="profile.loading" color="blue" indeterminate></v-progress-linear>
              <v-layout row wrap pa-5>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_username') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.username }} / {{ profile.userId }} / {{ profile.promoteCode }}</v-flex>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_mobile') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.mobile }}</v-flex>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_regTime') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.regtime | formatDate }}</v-flex>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_lastTime') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.lastrime | formatDate }}</v-flex>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_regIP') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.regip }}</v-flex>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_lastIP') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.lastip }}</v-flex>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_balance') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.balance | money }}</v-flex>
                <v-flex py-2 xs2>{{ $t('affiliatedetail_info_parent') }}</v-flex>
                <v-flex py-2 xs4 class="title grey--text lighten-3">{{ profile.parentname }}/{{ profile.parentId_promoteCode }}</v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-text class="pt-4">
          <v-card>
            <v-card-title class="title mb-1"> <v-icon>timeline</v-icon>{{ $t('affiliatedetail_statistics_title') }} </v-card-title>
            <v-card-text>
              <v-layout row wrap pa-5>
                <v-flex py-2 xs12>
                  <v-data-table
                    :items="statistics.items"
                    :no-data-text="$t('affiliatedetail_nodata')"
                    :loading="statistics.loading"
                    :disable-sort="true"
                    :headers="statistics.headers"
                    hide-default-footer
                  >
                    <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                    <template slot="no-data"> {{ $t('affiliatedetail_nodata') }} </template>
                    <template #item="{ item }">
                      <tr>
                        <td class="text-center">{{ item.teamagentcount }}</td>
                        <td class="text-center">{{ item.subagentcount }}</td>
                        <td class="text-center">{{ item.totalrebate | money }}</td>
                        <td class="text-center">{{ item.totalcommission | money }}</td>
                        <td class="text-center">{{ item.totalamount | money }}</td>
                      </tr>
                    </template>
                  </v-data-table>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-text class="pt-4">
          <v-card>
            <v-card-title class="title mb-1"> <v-icon>timeline</v-icon>{{ $t('affiliatedetail_report_title') }} </v-card-title>
            <v-tabs v-model="tab">
              <v-tab v-for="item in tabs" :key="item">{{ $t(`affiliatedetail_report_tab_${item}`) }}</v-tab>
              <v-tab-item>
                <v-layout row wrap pa-5>
                  <v-flex xs2>
                    <datetime-range
                      v-model="team.searchOptions.date"
                      range-separator="affiliatedetail_dateRangeSeparator"
                      start-placeholder="affiliatedetail_startDate"
                      end-placeholder="affiliatedetail_endDate"
                    />
                  </v-flex>
                  <v-flex xs2>
                    <v-btn color="primary" depressed :loading="team.loading" class="ma-1" @click="loadData(1)">
                      {{ $t('affiliatedetail_search') }}
                    </v-btn>
                  </v-flex>
                </v-layout>
                <v-layout row wrap pa-5>
                  <v-flex py-2 xs12>
                    <v-data-table
                      :items="team.items"
                      :no-data-text="$t('affiliatedetail_nodata')"
                      :loading="team.loading"
                      :disable-sort="true"
                      :headers="team.headers"
                      :page.sync="team.pagination.page"
                      :items-per-page.sync="team.pagination.itemsPerPage"
                      :sort-desc.sync="team.pagination.sortDesc"
                      :sort-by.sync="team.pagination.sortBy"
                      hide-default-footer
                    >
                      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                      <template slot="no-data"> {{ $t('affiliatedetail_nodata') }} </template>
                      <template #item="{ item }">
                        <tr>
                          <td class="text-center">{{ item.Created | formatDate }}</td>
                          <td class="text-center">{{ item.NewSubAgentCount }}</td>
                          <td class="text-center">{{ item.TotalSubAgentValidBet }}</td>
                          <td class="text-center">{{ item.TotalSubAgentProfitAndLoss }}</td>
                          <td class="text-center">{{ item.NewTeamAgentCount }}</td>
                          <td class="text-center">{{ item.TotalTeamValidBet }}</td>
                          <td class="text-center">{{ item.TotalTeamProfitAndLoss }}</td>
                        </tr>
                      </template>
                    </v-data-table>
                    <v-pagination
                      v-model="team.pagination.page"
                      :length="team.pagination.length"
                      :total-visible="15"
                      :disabled="team.loading"
                    ></v-pagination>
                  </v-flex>
                </v-layout>
              </v-tab-item>
              <v-tab-item>
                <v-layout row wrap pa-5>
                  <v-flex xs2>
                    <datetime-range
                      v-model="rebate.searchOptions.date"
                      range-separator="affiliatedetail_dateRangeSeparator"
                      start-placeholder="affiliatedetail_startDate"
                      end-placeholder="affiliatedetail_endDate"
                    />
                  </v-flex>
                  <v-flex xs2>
                    <v-text-field
                      v-model="rebate.searchOptions.name"
                      :label="$t('affiliatedetail_textfield_subAffiliate')"
                      clearable
                      hide-details
                      solo
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs2>
                    <v-btn color="primary" depressed :loading="rebate.loading" class="ma-1" @click="loadData(1)">
                      {{ $t('affiliatedetail_search') }}
                    </v-btn>
                  </v-flex>
                </v-layout>
                <v-layout row wrap pa-5>
                  <v-flex py-2 xs12>
                    <v-data-table
                      :items="rebate.items"
                      :no-data-text="$t('affiliatedetail_nodata')"
                      :loading="rebate.loading"
                      :disable-sort="true"
                      :headers="rebate.headers"
                      :page.sync="rebate.pagination.page"
                      :items-per-page.sync="rebate.pagination.itemsPerPage"
                      :sort-desc.sync="rebate.pagination.sortDesc"
                      :sort-by.sync="rebate.pagination.sortBy"
                      hide-default-footer
                    >
                      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                      <template slot="no-data"> {{ $t('affiliatedetail_nodata') }} </template>
                      <template #item="{ item }">
                        <tr>
                          <td class="text-center">{{ item.Created | formatDate }}</td>
                          <td class="text-center">{{ item.Name }}</td>
                          <td class="text-center">{{ item.TotalSubAgentValidBet }}</td>
                          <td class="text-center">{{ item.Rebate | money }}</td>
                          <td class="text-center">
                            <a class="text-decoration-none" @click.prevent="checkGamelogs({ username: item.Name, date: item.Created })">
                              {{ $t('affiliatedetail_btn_check') }}
                            </a>
                          </td>
                        </tr>
                      </template>
                    </v-data-table>
                    <v-pagination
                      v-model="rebate.pagination.page"
                      :length="rebate.pagination.length"
                      :total-visible="15"
                      :disabled="rebate.loading"
                    ></v-pagination>
                  </v-flex>
                </v-layout>
              </v-tab-item>
              <v-tab-item>
                <v-layout row wrap pa-5>
                  <v-flex xs2>
                    <datetime-range
                      v-model="commission.searchOptions.date"
                      range-separator="affiliatedetail_dateRangeSeparator"
                      start-placeholder="affiliatedetail_startDate"
                      end-placeholder="affiliatedetail_endDate"
                    />
                  </v-flex>
                  <v-flex xs2>
                    <v-select
                      v-model="commission.searchOptions.type"
                      :items="commission.types"
                      :disabled="commission.loading"
                      item-value="value"
                      item-text="text"
                      label="类型"
                      clearable
                      hide-details
                      solo
                    ></v-select>
                  </v-flex>
                  <v-flex xs2>
                    <v-btn color="primary" depressed :loading="commission.loading" class="ma-1" @click="loadData(1)">
                      {{ $t('affiliatedetail_search') }}
                    </v-btn>
                  </v-flex>
                </v-layout>
                <v-layout row wrap pa-5>
                  <v-flex py-2 xs12>
                    <v-data-table
                      :items="commission.items"
                      :no-data-text="$t('affiliatedetail_nodata')"
                      :loading="commission.loading"
                      :disable-sort="true"
                      :headers="commission.headers"
                      :page.sync="commission.pagination.page"
                      :items-per-page.sync="commission.pagination.itemsPerPage"
                      :sort-desc.sync="commission.pagination.sortDesc"
                      :sort-by.sync="commission.pagination.sortBy"
                      hide-default-footer
                    >
                      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                      <template slot="no-data"> {{ $t('affiliatedetail_nodata') }} </template>
                      <template #item="{ item }">
                        <tr>
                          <td class="text-center">{{ item.created | formatDate }}</td>
                          <td class="text-center">{{ findType(commission.types, item.ctype) }}</td>
                          <td class="text-center">
                            {{ item.name }}
                            (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
                          </td>
                          <td class="text-center">{{ item.commission }}</td>
                          <td class="text-center">
                            <a class="text-decoration-none" @click.prevent="checkGamelogs({ username: item.name, date: item.created })">
                              {{ $t('affiliatedetail_btn_check') }}
                            </a>
                          </td>
                        </tr>
                      </template>
                    </v-data-table>
                    <v-pagination
                      v-model="commission.pagination.page"
                      :length="commission.pagination.length"
                      :total-visible="15"
                      :disabled="commission.loading"
                    ></v-pagination>
                  </v-flex>
                </v-layout>
              </v-tab-item>
              <v-tab-item>
                <v-layout row wrap pa-5>
                  <v-flex xs2>
                    <datetime-range
                      v-model="balance.searchOptions.date"
                      range-separator="affiliatedetail_dateRangeSeparator"
                      start-placeholder="affiliatedetail_startDate"
                      end-placeholder="affiliatedetail_endDate"
                    />
                  </v-flex>
                  <v-flex xs2>
                    <v-select
                      v-model="balance.searchOptions.type"
                      :items="balance.types"
                      :disabled="balance.loading"
                      item-value="value"
                      item-text="text"
                      label="类型"
                      clearable
                      hide-details
                      solo
                    ></v-select>
                  </v-flex>
                  <v-flex xs2>
                    <v-btn color="primary" depressed :loading="balance.loading" class="ma-1" @click="loadData(1)">
                      {{ $t('affiliatedetail_search') }}
                    </v-btn>
                  </v-flex>
                </v-layout>
                <v-layout row wrap pa-5>
                  <v-flex py-2 xs12>
                    <v-data-table
                      :items="balance.items"
                      :no-data-text="$t('affiliatedetail_nodata')"
                      :loading="balance.loading"
                      :disable-sort="true"
                      :headers="balance.headers"
                      :page.sync="balance.pagination.page"
                      :items-per-page.sync="balance.pagination.itemsPerPage"
                      :sort-desc.sync="balance.pagination.sortDesc"
                      :sort-by.sync="balance.pagination.sortBy"
                      hide-default-footer
                    >
                      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                      <template slot="no-data"> {{ $t('affiliatedetail_nodata') }} </template>
                      <template #item="{ item }">
                        <tr>
                          <td class="text-center">{{ item.Created | formatDate }}</td>
                          <td class="text-center">{{ findType(balance.types, item.Type) }}</td>
                          <td class="text-center">{{ item.BeforeAmount | money }}</td>
                          <td class="text-center">{{ item.ChangeAmount | money }}</td>
                          <td class="text-center">{{ item.AfterAmount | money }}</td>
                        </tr>
                      </template>
                    </v-data-table>
                    <v-pagination
                      v-model="balance.pagination.page"
                      :length="balance.pagination.length"
                      :total-visible="15"
                      :disabled="balance.loading"
                    ></v-pagination>
                  </v-flex>
                </v-layout>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
export default {
  name: 'AffiliateDetail',
  components: {},
  data() {
    return {
      profile: { loading: false },
      tab: 0,
      tabs: ['team', 'rebate', 'commission', 'balance'],
      teamData: {
        loading: false,
        apiUrl: '/agent/team/list',
        searchOptions: {
          date: [],
        },
        pagination: {
          totalItems: 0,
          page: 1,
          length: 0,
          itemsPerPage: 10,
          sortBy: ['Created'],
          sortDesc: [true],
        },
      },
      rebateData: {
        loading: false,
        apiUrl: '/agent/rebate/list',
        searchOptions: {
          date: [],
          type: null,
        },
        pagination: {
          totalItems: 0,
          page: 1,
          length: 0,
          itemsPerPage: 10,
          sortBy: ['Created'],
          sortDesc: [true],
        },
      },
      commissionData: {
        loading: false,
        apiUrl: '/agent/commission/list',
        searchOptions: {
          date: [],
          type: null,
        },
        pagination: {
          totalItems: 0,
          page: 1,
          length: 0,
          itemsPerPage: 10,
          sortBy: ['created'],
          sortDesc: [true],
        },
      },
      balanceData: {
        loading: false,
        apiUrl: '/agent/blance/list',
        searchOptions: {
          date: [],
          type: null,
        },
        pagination: {
          totalItems: 0,
          page: 1,
          length: 0,
          itemsPerPage: 10,
          sortBy: ['Created'],
          sortDesc: [true],
        },
      },
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    affiliateId: {
      get() {
        return Number(this.$store.getters.affiliateId);
      },
      set(val) {
        this.$store.commit('AFFILIATE', this.affiliateId);
      },
    },
    statistics() {
      return {
        loading: false,
        headers: [
          {
            text: this.$t('affiliatedetail_statistics_header_team'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_statistics_header_subAffiliate'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_statistics_header_rebate'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_statistics_header_commission'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_statistics_header_revenue'),
            align: 'center',
          },
        ],
      };
    },
    team() {
      return {
        ...this.teamData,
        headers: [
          {
            text: this.$t('affiliatedetail_report_team_header_date'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_team_header_newSub'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_team_header_subEffective'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_team_header_subWinloss'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_team_header_newMembers'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_team_header_teamEffective'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_team_header_teamWinloss'),
            align: 'center',
          },
        ],
      };
    },
    rebate() {
      return {
        ...this.rebateData,
        headers: [
          {
            text: this.$t('affiliatedetail_report_rebate_header_date'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_rebate_header_sub'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_rebate_header_effective'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_rebate_header_revenue'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_rebate_header_action'),
            align: 'center',
          },
        ],
      };
    },
    commission() {
      return {
        ...this.commissionData,
        headers: [
          {
            text: this.$t('affiliatedetail_report_commission_header_date'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_commission_header_type'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_commission_header_source'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_commission_header_revenue'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_commission_header_action'),
            align: 'center',
          },
        ],
        types: [
          {
            value: null,
            text: this.$t('affiliatedetail_report_commission_type_all'),
          },
          {
            value: 1,
            text: this.$t('affiliatedetail_report_commission_type_direct'),
          },
          {
            value: 2,
            text: this.$t('affiliatedetail_report_commission_type_partial'),
          },
        ],
      };
    },
    balance() {
      return {
        ...this.balanceData,
        headers: [
          {
            text: this.$t('affiliatedetail_report_balance_header_datetime'),
            align: 'center',
            value: 'Created',
          },
          {
            text: this.$t('affiliatedetail_report_balance_header_type'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_balance_header_beforeAmount'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_balance_header_amount'),
            align: 'center',
          },
          {
            text: this.$t('affiliatedetail_report_balance_header_afterAmount'),
            align: 'center',
          },
        ],
        types: [
          {
            value: null,
            text: this.$t('affiliatedetail_report_balance_type_all'),
          },
          {
            value: 1,
            text: this.$t('affiliatedetail_report_balance_type_transferIn'),
          },
          {
            value: 2,
            text: this.$t('affiliatedetail_report_balance_type_transferOut'),
          },
        ],
      };
    },
    activeTab() {
      return this[this.tabs[this.tab]];
    },
  },
  watch: {
    affiliateId(n) {
      if (n != 0) {
        this.refresh();
        this.tab = 0;
      }
    },
    'balance.pagination.page'(n) {
      this.loadData(n);
    },
    'rebate.pagination.page'(n) {
      this.loadData(n);
    },
    'commission.pagination.page'(n) {
      this.loadData(n);
    },
    activeTab(tab) {
      tab.loading = false;
      this.loadData(1);
    },
  },
  mounted() {
    if (this.affiliateId != 0) {
      this.refresh();
    }
  },
  methods: {
    closeDetail() {
      // this.$emit('close');
      this.$store.commit('AFFILIATE', 0);
    },
    loadProfile() {
      if (!this.profile.loading) {
        this.profile.loading = true;
        api
          .get(`/agent/${this.affiliateId}`)
          .then(data => {
            data.loading = false;
            this.profile = data;
          })
          .catch(error => {
            this.profile.loading = false;
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    loadStatistics() {
      if (!this.statistics.loading) {
        this.statistics.loading = true;
        api
          .get(`/agent/statistics/${this.affiliateId}`)
          .then(data => {
            this.statistics.items = [data];
            this.statistics.loading = false;
          })
          .catch(error => {
            this.statistics.loading = false;
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    loadData(p) {
      const current = this.activeTab;
      // console.log(this.activeTab);
      if (current && !current.loading) {
        current.loading = true;
        this.$forceUpdate();
        current.pagination.page = p;
        const params = {
          ...current.searchOptions,
          ...current.pagination,
          id: this.affiliateId,
        };
        if (current.searchOptions.date && current.searchOptions.date.length == 2) {
          params.s = current.searchOptions.date[0];
          params.e = current.searchOptions.date[1];
        } else {
          current.searchOptions.date = [new Date(new Date() * 1 - 1000 * 60 * 60 * 24 * 30).Format('yyyy-MM-dd'), new Date().Format('yyyy-MM-dd')];
          // current.searchOptions.date = ['2020-08-01', '2020-09-05'];
          params.s = current.searchOptions.date[0];
          params.e = current.searchOptions.date[1];
        }
        api
          .get(current.apiUrl, params)
          .then(data => {
            current.items = data.list || [];
            current.pagination.totalItems = data.count;
            // current.pagination.length = data.pageNums > 0 ? data.pageNums : 1;
            current.pagination.length = Math.ceil(data.count / current.pagination.itemsPerPage);
            current.loading = false;
            this.$forceUpdate();
          })
          .catch(error => {
            current.loading = false;
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    refresh() {
      this.loadProfile();
      this.loadStatistics();
      this.loadData(1);
    },
    checkGamelogs(item) {
      const dateStr = new Date(item.date).Format('yyyy-MM-dd');
      this.$router.push({
        name: 'reportGameLogs2',
        params: {
          username: item.username,
          date: dateStr,
        },
      });
      this.$store.commit('AFFILIATE', null);
    },
    findType(types, type) {
      const obj = _.find(types, obj => {
        return obj.value == type;
      });
      return obj ? obj.text : '--';
    },
    showDetail(id) {
      this.$store.commit('AFFILIATE', null);
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
  },
};
</script>
