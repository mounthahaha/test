<template>
  <div class="Domain">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
    </v-toolbar>
    <v-progress-linear :active="loading" :indeterminate="loading" color="primary"></v-progress-linear>

    <template v-for="(el, domainIndex) in domainTypes">
      <v-card :key="domainIndex" class="ma-5 px-5 pt-2 pb-5 rounded-lg">
        <v-card-title>
          <h4>{{ el.text() }}</h4>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                color="primary"
                class="elevation-0 ml-4 mr-2"
                fab
                dark
                small
                medium
                depressed
                v-on="on"
                @click="openDialogModel(el.type, domainIndex)"
              >
                <v-icon>add</v-icon>
              </v-btn>
            </template>
            <span>新增域名</span>
          </v-tooltip>
        </v-card-title>

        <v-card-text>
          <v-data-table
            ref="dataTable"
            :headers="el.type == '2' ? headerComputed2 : headerComputed"
            :items="el.dataList"
            :loading="el.loading"
            class="elevation-2"
            :page.sync="el.pagination.page"
            :items-per-page.sync="el.pagination.itemsPerPage"
            hide-default-footer
          >
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="no-data"> {{ $t('g_text_noData') }} </template>
            <template #item="{ item }">
              <tr>
                <td class="text-center text-no-wrap">{{ item.id }}</td>
                <td class="text-left text-no-wrap">{{ item.link }}</td>
                <td class="text-left text-no-wrap">{{ item.note | emptyToBeDash }}</td>
                <td class="text-left text-no-wrap">{{ item.note2 | emptyToBeDash }}</td>
                <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
                <td class="text-center text-no-wrap">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        color="primary"
                        v-bind="attrs"
                        :disabled="loading || el.dataList.length == 1"
                        @click="deleteItem(item.id, item.type, domainIndex)"
                        v-on="on"
                      >
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_delete') }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </template>
          </v-data-table>
          <v-divider></v-divider>
          <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
            <v-pagination v-model="el.pagination.page" :length="el.pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
            <div class="diy-page">
              {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select
                v-model="el.pagination.itemsPerPage"
                class="diy-page-select"
                :items="selectItems"
              ></v-select>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <!-- 新增域名彈窗 -->
    <DomainDialog v-if="dialogModel" v-model="dialogModel" :current-type="currentDomainType" @submit="postNewItem"></DomainDialog>
  </div>
</template>

<script>
import api from '@/api';
import DomainDialog from './components/domain/DomainDialog';
import { GET_SYSTEM_URL, DELETE_SYSTEM_URL, POST_SYSTEM_URL } from '@/api/Uri';
export default {
  name: 'Promotions',
  components: { DomainDialog },
  data() {
    return {
      dialogModel: false,
      loading: false,
      // 線路
      headers: [
        {
          lang: 'g_table_column_sn',
          text: 'SN',
          value: 'sn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'system_domain_column_domain',
          text: '域名',
          value: 'domain',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'remarks',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_domain_route',
          text: '線路',
          value: 'route',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_domain_column_create',
          text: '创建日期',
          value: 'create',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'action',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      // 備註2
      headers2: [
        {
          lang: 'g_table_column_sn',
          text: 'SN',
          value: 'sn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_domain_column_domain',
          text: '域名',
          value: 'domain',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'remarks',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_remarks2',
          text: '备注2',
          value: 'remarks2',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_domain_column_create',
          text: '创建日期',
          value: 'create',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'action',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      domainTypes: [
        {
          text: () => this.$t('system_domain_options_domainType_main'),
          type: 5,
          dataList: [],
          loading: false,
          pagination: {
            page: 1,
            length: 1,
            itemsPerPage: 10,
            totalItems: 0,
          },
        }, // 線路
        {
          text: () => this.$t('system_domain_options_domainType_agency'),
          type: 1,
          dataList: [],
          loading: false,
          pagination: {
            page: 1,
            length: 1,
            itemsPerPage: 10,
            totalItems: 0,
          },
        }, // 線路
        {
          text: () => this.$t('system_domain_options_domainType_app'),
          type: 2,
          dataList: [],
          loading: false,
          pagination: {
            page: 1,
            length: 1,
            itemsPerPage: 10,
            totalItems: 0,
          },
        }, // 備註2
      ],
      currentDomainType: null,
      currentDomainIndex: null,
      selectItems: [10, 25, 50, 100],
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
    headerComputed2() {
      return this.headers2.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
  },
  created() {
    this.loadAllLogs();
  },
  methods: {
    loadAllLogs() {
      this.loading = true;
      Promise.all(this.domainTypes.map(el => this.fetchData(el.type)))
        .then(res => {
          this.domainTypes.forEach((el, i) => {
            el.dataList = [...res[i]];
            el.pagination.totalItems = el.dataList.length;
            el.pagination.length = Math.ceil(el.dataList.length / el.pagination.itemsPerPage) || 1;
          });
        })
        .catch(err => {
          this.$store.commit('MsgError', err.msg);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // api 取得模組
    fetchData(type) {
      return new Promise((resolve, reject) => {
        api
          .get(GET_SYSTEM_URL, { page: 1, page_num: 9999, type })
          .then(res => {
            resolve(res.result);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      });
    },
    loadLogs: (page, type, _this) => {
      return new Promise((resolve, reject) => {
        api
          .get(GET_SYSTEM_URL, {
            page,
            page_num: _this.pagination.itemsPerPage,
            type,
          })
          .then(data => {
            _this.logs = data.result === null ? [] : data.result;
            _this.pageEvent(data);
            resolve();
          })
          .catch(error => {
            console.log(error);
            _this.$store.commit('MsgError', error.error);
            reject(error);
          });
      });
    },
    postNewItem(postObj) {
      this.domainTypes[this.currentDomainIndex].loading = true;
      api
        .post(POST_SYSTEM_URL, postObj)
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgInsert'));
          this.fetchData(this.currentDomainType).then(res => {
            this.domainTypes[this.currentDomainIndex].dataList = [...res];
            this.dialogModel = false;
            this.domainTypes[this.currentDomainIndex].loading = false;
          });
        })
        .catch(error => {
          this.domainTypes[this.currentDomainIndex].loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    // 刪除
    deleteItem(id, type, domainIndex) {
      this.$store.commit('Confirm', {
        text: this.$t('g_dialog_confirm_deleteInfo'),
        ok: () => {
          this.domainTypes[domainIndex].loading = true;
          api
            .delete(DELETE_SYSTEM_URL.replace('{id}', id))
            .then(() => {
              this.$store.commit('MsgOk', this.$t('system_domain_confirm_delete_success'));
              this.fetchData(type).then(res => {
                this.domainTypes[domainIndex].dataList = [...res];
                this.domainTypes[domainIndex].loading = false;
              });
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
              this.domainTypes[domainIndex].loading = false;
            });
        },
      });
    },
    openDialogModel(type, index) {
      this.currentDomainType = type;
      this.currentDomainIndex = index;
      this.dialogModel = true;
    },
  },
};
</script>
