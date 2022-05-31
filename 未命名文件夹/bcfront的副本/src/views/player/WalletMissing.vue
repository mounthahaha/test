<template>
  <div class="WalletMissing">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :options.sync="pagination"
          :server-items-length="pagination.totalItems"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <td class="text-left text-no-wrap">{{ item.id }}</td>
                <td class="text-left text-no-wrap">
                  {{ item.username }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.user_id)"> {{ item.user_id }} </a>)
                </td>
                <td class="text-left text-no-wrap">{{ item.amount | money }}</td>
                <td class="text-left text-no-wrap">从{{ platform[item.from_pid] }}{{ $t('player_missing_to') }}{{ platform[item.to_pid] }}</td>
                <td class="text-left text-no-wrap">{{ item.reason }}</td>
                <td class="text-left text-no-wrap">
                  <v-chip label outlined small color="primary"> {{ item.status }} </v-chip>
                </td>
                <!-- <td class="text-left text-no-wrap">--</td> -->
              </tr>
            </tbody>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
        </div>
      </v-card>
    </v-container>

    <!-- 搜尋欄位 -->
    <!-- <Search :title="$t('player_missing_searchPlayer')" :show.sync="showSearch" @cancel="showSearch = false" @ok="loadPlayers(1)">
      <v-container>
        <v-layout row wrap>
          <v-flex xs12 sm6>
            <v-text-field
              v-model="searchOption.id"
              clearable
              :label="$t('g_text_field_userId')"
              :placeholder="$t('g_text_field_placeholder_userId')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
              v-model="searchOption.name"
              clearable
              :label="$t('g_text_field_username')"
              :placeholder="$t('player_missing_placeholder_enterUsernme')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
              v-model="searchOption.refer_id"
              clearable
              :label="$t('player_missing_affiliateId')"
              :placeholder="$t('player_missing_placeholder_affiliateId')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
              v-model="searchOption.refer_name"
              clearable
              :label="$t('player_missing_affiliateName')"
              :placeholder="$t('player_missing_placeholder_affiliateName')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field
              v-model="searchOption.refer_code"
              clearable
              :label="$t('player_missing_affiliateCode')"
              :placeholder="$t('player_missing_placeholder_affiliateCode')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6>
            <date-picker
              v-model="searchOption.date"
              :placeholder="$t('player_missing_slectOpenDate')"
              :shortcuts="shortcuts"
              range
              format="YYYY-MM-DD"
              width="270"
              :class="`v-input v-text-field`"
            ></date-picker>
          </v-flex>
          <v-flex xs12 sm6>
            <v-text-field v-model="searchOption.card" clearable label="银行卡号" placeholder="输入取款银行卡号"></v-text-field>
          </v-flex>
        </v-layout>
      </v-container>
    </Search> -->
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts } from '@/utils';
// import Search from '@/components/Search.vue';

export default {
  name: 'PlayerList',
  components: {
    // Search,
  },
  data() {
    return {
      searchOption: {
        date: [],
      },
      shortcuts,
      showSearch: false,
      loading: false,
      pagination: {
        length: 0,
        itemsPerPage: 10,
      },
      headers: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_usernameId',
          text: '用户名(ID)',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_missing_transferAmount',
          text: '转账金额',
          value: 'amount',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_missing_process',
          text: '过程',
          value: 'process',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_missing_reason',
          text: '原因',
          value: 'reason',
          sortable: false,
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
        // {
        //   lang: 'g_table_column_action',
        //   text: '操作',
        //   value: 'action',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'center',
        // },
      ],
      desserts: [],
      platform: {},
      // playerId: 0,
      // detail: false,
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
  },
  watch: {
    'pagination.page'(n) {
      this.loadWalletMiss(n);
    },
  },
  mounted() {
    this.loadWalletMiss(1);
  },
  methods: {
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
    loadWalletMiss(p) {
      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      const params = { ...this.searchOption };
      if (params.date.length > 0) {
        params.s = params.date[0] ? params.date[0] : '';
        params.e = params.date[1] ? params.date[1] : '';
      }
      params.sort = 'created';
      params.asc = 'false';
      api
        .get('/player/miss', params)
        .then(data => {
          this.desserts = data.miss == null ? [] : data.miss;
          this.platform = data.platform;
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
