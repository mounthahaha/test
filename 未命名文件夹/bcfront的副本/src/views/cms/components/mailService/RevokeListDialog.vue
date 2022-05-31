<template>
  <v-dialog v-model="model" persistent width="800px" :retain-focus="false">
    <v-toolbar dark color="primary">
      <v-toolbar-title class="headline">{{ $t('cms_revoke_list_title') }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip class="pa-1" color="transparent" @click.native="closeDialog">
        <v-icon>close</v-icon>
      </v-chip>
    </v-toolbar>
    <v-card flat tile>
      <v-card-text>
        <v-row>
          <v-col class="pt-8 pb-0 d-flex" cols="12">
            <strong class="title green--text text--darken-3 pr-4">{{ $t('cms_revoke_list_received') }}： {{ isReceive }}</strong>
            <strong class="title error--text">{{ $t('cms_revoke_list_reclaimed') }}: {{ isRevoked }}</strong>
            <v-spacer></v-spacer>
            <v-btn class="green darken-2 white--text" @click="exportToXLSX">{{ $t('g_export') }}</v-btn>
          </v-col>
          <v-col cols="12">
            <v-simple-table fixed-header height="540px">
              <template #default>
                <thead>
                  <tr>
                    <th v-for="header in headers" :key="header.value" :class="header.class">{{ $t(header.lang) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in dataList" :key="`${index}${item.username}`" class="text-center">
                    <td>
                      <span>{{ item.no }}</span>
                    </td>
                    <td>
                      <span>{{ item.username }}</span>
                    </td>
                    <td>
                      <span v-if="item.is_revoked" class="error--text">{{ $t('cms_revoke_list_reclaimed') }}</span>
                      <span v-else>{{ $t('cms_revoke_list_received') }}</span>
                    </td>
                    <td>
                      <span v-if="item.is_revoked">{{ item.revoked_time | formatDate }}</span>
                      <span v-else> - </span>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card tile>
      <v-card-actions class="d-flex justify-center">
        <v-btn color="primary" depressed @click.native="closeDialog">{{ $t('g_btn_confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/api';
import { formatDate } from '@/filters/custom';
import { exportXLSX } from '@/utils';
import dialog from '@/components/mixins/dialog.js';
import { GET_STATION_REVOKE_LIST } from '@/api/Uri';
// import { GET_REVOKE_LIST } from '@/api/fake';
// import { money } from '../../../filters/custom';
export default {
  name: 'RevokeListDialog',
  mixins: [dialog],
  data() {
    return {
      valid: true,
      loading: false,
      logs: [],
      headers: [
        {
          lang: 'cms_revoke_list_columns_item',
          text: '项次',
          sortable: false,
          value: 'id',
          align: 'center',
          class: 'primary white--text dark-header text-no-wrap text-center',
        },
        {
          lang: 'g_table_column_username',
          text: '用户名',
          sortable: false,
          value: 'name',
          align: 'center',
          class: 'primary white--text dark-header text-no-wrap text-center',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          sortable: false,
          value: 'status',
          align: 'center',
          class: 'primary white--text dark-header text-no-wrap text-center',
        },
        {
          lang: 'cms_revoke_list_columns_recovery_time',
          text: '回收时间',
          sortable: false,
          value: 'time',
          align: 'center',
          class: 'primary white--text dark-header text-no-wrap text-center',
        },
      ],
    };
  },
  computed: {
    dataList() {
      return this.logs;
    },
    isRevoked() {
      return _.filter(this.logs, val => val.is_revoked).length;
    },
    isReceive() {
      return _.filter(this.logs, val => !val.is_revoked).length;
    },
  },
  watch: {
    model: {
      handler(val) {
        if (val === true) {
          this.init();
          this.getList();
        }
      },
    },
  },
  created() {
    this.fetchLoading = true;
    this.init();
    setTimeout(() => {
      this.fetchLoading = false;
    }, 2000);
  },
  methods: {
    init() {
      this.logs = [];
    },
    pageEvent(result) {
      this.pagination.length = parseInt((result.count ?? 1) / this.pagination.itemsPerPage + 1);
      this.pagination.totalItems = result.count ?? 1;
      this.pagination.page = result.page ?? 1;
      this.selectorOption.bt = result.bt;
      this.selectorOption.ct = result.ct;
      this.selectorOption.pt = result.pt;
    },
    exportToXLSX() {
      const _export = [];
      const cols = [];
      this.headers.forEach(v => {
        cols.push(v.text);
      });
      _export.push(cols);
      this.logs.forEach(item => {
        const tmp = [];
        tmp.push(item.no);
        tmp.push(item.username);
        tmp.push(item.is_revoked ? this.$t('cms_revoke_list_reclaimed') : this.$t('cms_revoke_list_received'));
        tmp.push(item.is_revoked ? formatDate(item.revoked_time) : ' - ');
        _export.push(tmp);
      });
      exportXLSX(_export, '活动金收回清單列表');
    },
    async getList() {
      this.loading = true;
      await api
        .get(GET_STATION_REVOKE_LIST, { id: this.item.id })
        .then(data => {
          this.logs = data.result.list;
          this.loading = false;
          // 新的搜尋選項
        })
        .catch(error => {
          // this.logs = GET_REVOKE_LIST.result.list;
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
