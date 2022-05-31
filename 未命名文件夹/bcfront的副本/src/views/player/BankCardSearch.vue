<template>
  <div class="BankCardSearch">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1, true)">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search2') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="initSelector">
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
        <v-row dense class="d-flex align-center justify-space-between">
          <v-col>
            <v-text-field
              v-model="searchOption.card"
              clearable
              hide-details
              solo
              persistent-hint
              required
              :placeholder="$t('player_bank_placeholder_cardNumber')"
              @keydown.enter="loadData(1, true)"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.status"
              hide-details
              solo
              persistent-hint
              required
              single-line
              :items="[
                { text: $t('g_selector_default_optionAll'), value: '' },
                { text: $t('g_btn_disable'), value: 1 },
                { text: $t('g_btn_enable'), value: 0 },
              ]"
              :label="$t('g_selector_status')"
            ></v-select>
          </v-col>
        </v-row>
      </v-card>

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
                <template v-for="(header, colIndex) in headers">
                  <td v-if="header.colType === 'normal'" :key="`list_col_normal_${colIndex}`" class="text-left text-no-wrap">
                    {{ item[header.value] }}
                  </td>
                  <td v-else-if="header.colType === 'user'" :key="`list_col_user_${colIndex}`" class="text-left text-no-wrap">
                    {{ item.Username }} (<a href="#" class="text-decoration-none" @click.prevent="showDetail(item.UserId)"> {{ item.UserId }} </a>)
                  </td>
                  <td v-else-if="header.colType === 'status'" :key="`list_col_status_${colIndex}`" class="text-left text-no-wrap">
                    <v-chip label outlined small :color="item[header.value] ? `` : `green`">
                      {{ item[header.value] ? $t('g_btn_disable') : $t('g_btn_enable') }}
                    </v-chip>
                  </td>
                </template>
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
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'BankCardSearch',
  data() {
    return {
      searchShow: true,
      loading: false,
      searchOption: {
        card: '',
        status: '',
      },
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
      },
      headers: [
        {
          lang: 'g_table_column_usernameId',
          text: '用戶名(ID)',
          sortable: false,
          value: 'Username',
          colType: 'user',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_bank_bank',
          text: '银行',
          sortable: false,
          value: 'Bank',
          colType: 'normal',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_bank_cardNumber',
          text: '卡号',
          sortable: false,
          value: 'Card',
          colType: 'normal',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_bank_branch',
          text: '支行',
          sortable: false,
          value: 'Branch',
          colType: 'normal',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          sortable: false,
          value: 'Deleted',
          colType: 'status',
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      desserts: [],
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
      this.loadData(n);
    },
  },
  methods: {
    loadData(p) {
      if (this.searchOption.card == '') {
        this.$store.commit('MsgError', this.$t('player_bank_cardCantEmpty'));
        return false;
      }
      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      api
        .get('/player/bank/search', this.searchOption)
        .then(data => {
          this.desserts = (data && data.result) || [];
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    initSelector() {
      Object.keys(this.searchOption).forEach(key => {
        this.searchOption[key] = '';
      });
    },
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit('PLAYERDETAILACTIVE', 0);
      this.$nextTick(() => {
        this.$store.commit('PLAYER', id);
      });
    },
  },
};
</script>
