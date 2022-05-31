<template>
  <div class="Promotions">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增活動 -->
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
            @click="insertAndEditClick({})"
          >
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_promotion_add_promotion') }}</span>
      </v-tooltip>
      <!-- 上傳形象圖 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="openUploadDialog({})">
            <v-icon>add_photo_alternate</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_promotion_add_promotion_pic') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          ref="dataTable"
          :headers="headerComputed"
          :items="dataList"
          :loading="loading"
          :disable-sort="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <!--操作-->
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="insertAndEditClick(item)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn v-if="item.promotion_type !== 1" icon color="primary" v-bind="attrs" @click="deleteItem(item.id)" v-on="on">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_delete') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn v-if="item.is_enabled" icon color="red" v-bind="attrs" @click="enableApi(item.id, false)" v-on="on">
                      <v-icon>do_not_disturb_on</v-icon>
                    </v-btn>
                    <v-btn v-else icon color="green" v-bind="attrs" @click="enableApi(item.id, true)" v-on="on">
                      <v-icon>remove_red_eye</v-icon>
                    </v-btn>
                  </template>
                  <span v-if="item.is_enabled">{{ $t('g_btn_disable') }}</span>
                  <span v-else>{{ $t('g_btn_enable') }}</span>
                </v-tooltip>
              </td>
              <td class="text-center">
                <v-chip label outlined small :color="item.is_enabled ? ` green` : `red`">
                  {{ item.is_enabled ? $t('g_btn_enable') : $t('g_btn_disable') }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.title }}</td>
              <td class="text-left text-no-wrap">{{ selectorOption.pt[item.promotion_type] }}</td>
              <td class="text-left text-no-wrap">
                <span class="text-no-wrap">{{ item.start_time | formatDate }}</span> ~
                <span class="text-no-wrap">{{ item.end_time | formatDate }}</span>
              </td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary"> {{ item.levelText }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.sort }}</td>
              <td class="text-left text-no-wrap">{{ item.remark | emptyToBeDash }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 新增活動彈窗 -->
    <PromotionsDialog
      v-if="promotionsDialog"
      v-model="promotionsDialog"
      :item="logDetail"
      :options="selectorOption"
      @close="logDetail = {}"
      @update="promotionsDialogUpdate"
    ></PromotionsDialog>

    <!-- 上傳活動圖彈窗 -->
    <ImagePicUploadDialog v-model="imagePicUploadDialog"></ImagePicUploadDialog>
  </div>
</template>

<script>
import api from '@/api';
import PromotionsDialog from './components/promotions/PromotionsDialog';
import ImagePicUploadDialog from './components/promotions/ImagePicUploadDialog';
import { GET_CMS_PROMOTION_LIST, PATCH_CMS_PROMOTION_ENABLE, DELETE_CMS_PROMOTION } from '@/api/Uri';

export default {
  name: 'Promotions',
  components: { PromotionsDialog, ImagePicUploadDialog },
  data() {
    return {
      imagePicUploadDialog: false,
      promotionsDialog: false,
      menu: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      valid: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortDesc: [],
        sortBy: [],
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
          lang: 'g_table_column_status',
          text: '状态',
          value: 'total_read_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_promotion_columns_name',
          text: '活动名称',
          value: 'type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_promotion_columns_type',
          text: '活动类型',
          value: 'title',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_promotion_columns_from_date',
          text: '起迄日期',
          value: 'send_group_type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_promotion_columns_level',
          text: '适用等级',
          value: 'users',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'total_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_sort',
          text: '排序',
          value: 'total_send_count',
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
      ],
      logs: [],
      logDetail: {},
      selectorOption: {
        promotion_type: {}, // from api bt
        is_enabled: { 0: () => this.$t('g_btn_close'), 1: () => this.$t('g_switch_open') },
        bt: {},
        ct: {},
        pt: {},
      },
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    vipMap() {
      return new Map(this.$store.state.sys.vip.map(vipData => [vipData.vipLv, vipData.vipLvDesc]));
    },
    dataList() {
      return this.logs.map(data => {
        return {
          ...data,
          levelText: data.vip_level.map(vipNumber => (this.vipMap.has(vipNumber) ? this.vipMap.get(vipNumber) : vipNumber)).join(','),
        };
      });
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
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
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
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
  },
  mounted() {
    this.loadData(1);
    // 載入vip資料
    this.$store.dispatch('VIP_CONFIG');
  },
  methods: {
    async loadData(page) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const param = {
        page,
        page_num: this.pagination.itemsPerPage,
        // sort: this.pagination.sortBy[0],
        // asc: !this.pagination.sortDesc[0],
      };
      await api
        .get(GET_CMS_PROMOTION_LIST, { ...param })
        .then(data => {
          this.logs = data.result.list === null ? [] : data.result.list;
          this.pageEvent(data.result);
          this.loading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
          this.loading = false;
        });
    },
    pageEvent(result) {
      this.pagination.length = Math.ceil((result.count ?? 1) / this.pagination.itemsPerPage);
      this.pagination.totalItems = result.count ?? 1;
      this.selectorOption.bt = result.bt;
      this.selectorOption.ct = result.ct;
      this.selectorOption.pt = result.pt;
      this.selectorOption.promotion_type = { 2: result.pt[2], 4: result.pt[4] };
    },
    insertAndEditClick(item) {
      this.logDetail = item;
      this.promotionsDialog = true;
    },
    enableApi(id, is_enabled) {
      this.$store.commit('Confirm', {
        text: this.$t('cms_promotion_check_status'),
        ok: () => {
          this.loading = true;
          api
            .post(PATCH_CMS_PROMOTION_ENABLE, { id, is_enabled })
            .then(data => {
              this.$store.commit('MsgOk', this.$t('cms_promotion_has_been_update'));
              this.loading = false;
              this.loadData(this.pagination.page);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
              this.loading = false;
            });
        },
      });
    },
    deleteItem(id) {
      console.log(id)
      this.$store.commit('Confirm', {
        text: this.$t('cms_promotion_check_delete'),
        ok: () => {
          this.loading = true;
          api
            .post(DELETE_CMS_PROMOTION, { id })
            .then(data => {
              this.$store.commit('MsgOk', this.$t('cms_promotion__has_been_delete'));
              this.loading = false;
              this.loadData(this.pagination.page);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
              this.loading = false;
            });
        },
      });
    },
    promotionsDialogUpdate(event) {
      if (event.refresh) {
        this.loadData(this.pagination.page);
      }
      this.logDetail = {};
    },
    openUploadDialog() {
      this.imagePicUploadDialog = true;
    },
  },
};
</script>
