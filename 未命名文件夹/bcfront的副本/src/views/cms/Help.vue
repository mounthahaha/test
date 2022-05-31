<template>
  <div class="Help">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="createSingle({})">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_help_add_item') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :no-data-text="$t('g_text_noData')"
          :headers="headerComputed"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :items="desserts"
          :loading="loading"
          :disable-sort="loading"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <!-- 操作 -->
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="loadSingle(item)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-if="item.status == 0"
                      icon
                      color="green"
                      v-bind="attrs"
                      @click="mergeStatus(item.id, item.status == 0 ? 1 : 0)"
                      v-on="on"
                    >
                      <v-icon> remove_red_eye</v-icon>
                    </v-btn>
                    <v-btn v-else icon color="red" v-bind="attrs" @click="mergeStatus(item.id, item.status == 0 ? 1 : 0)" v-on="on">
                      <v-icon>do_not_disturb_on</v-icon>
                    </v-btn>
                  </template>
                  <span v-if="item.status == 0">{{ $t('g_btn_enable') }}</span>
                  <span v-else>{{ $t('g_btn_disable') }}</span>
                </v-tooltip>
              </td>
              <td class="text-left text-no-wrap">
                {{ i18nItemsMap.has(item.language_code) ? i18nItemsMap.get(item.language_code).value : item.language_code }}
              </td>
              <td class="text-center">
                <v-chip label outlined small :color="item.status == 1 ? `green` : `red`">
                  {{ item.status == 1 ? $t('g_btn_enable') : $t('g_btn_disable') }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ codeMap.has(item.code) ? codeMap.get(item.code) : item.code }}</td>
              <td class="text-left text-no-wrap">{{ item.title }}</td>
              <td class="text-left text-no-wrap">{{ item.update_time | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.name }}</td>
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

    <v-dialog v-model="infoBox" persistent width="80%" eager>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline ml-2">{{ isNewData ? $t('cms_help_add_item') : helpObject.title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap align-center>
                <v-flex xs2>{{ $t('cms_help_columns_title') }}</v-flex>
                <v-flex xs10><v-text-field v-model="helpObject.title"></v-text-field></v-flex>
                <v-flex xs2>{{ $t('cms_help_columns_code') }}</v-flex>
                <v-flex xs10><v-select v-model="helpObject.code" :items="codeSelectItems" :readonly="!isNewData"></v-select></v-flex>
                <v-flex xs2>{{ $t('cms_help_language') }}</v-flex>
                <v-flex xs10><v-select v-model="helpObject.language_code" :items="i18nSelectItems"></v-select></v-flex>
                <v-flex xs2>{{ $t('cms_help_content') }}</v-flex>
                <v-flex xs10>
                  <editor
                    v-if="infoBox"
                    v-model="helpObject.content"
                    :value="helpObject.content"
                    :api-key="$store.getters.tinymceKey"
                    :init="initTinyMceSetting"
                  ></editor>
                </v-flex>
                <v-flex xs2>{{ $t('g_table_column_status') }}</v-flex>
                <v-flex xs10>
                  <v-switch v-model="status" hide-details :label="status == 0 ? $t('g_btn_disable') : $t('g_btn_enable')"></v-switch
                ></v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="confirmEvent()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import Editor from '@tinymce/tinymce-vue';
import i18nMixin from '../../mixin/i18nMixin.js';

const codeData = [
  {
    code: 'about',
    name: '关于我们',
  },
  {
    code: 'problem',
    name: '常见问题',
  },
  {
    code: 'features',
    name: '功能介绍',
  },
  {
    code: 'terms',
    name: '使用条款',
  },
  {
    code: 'disclaimer',
    name: '免责声明',
  },
  {
    code: 'policies',
    name: '隐私及COOKIE政策',
  },
  {
    code: 'rules',
    name: '优惠活动条款与规则',
  },
  {
    code: 'agreement',
    name: '客户协议',
  },
];

export default {
  name: 'Help',
  components: {
    Editor,
  },
  mixins: [i18nMixin],
  data() {
    return {
      isNewData: false,
      contentType: null,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      valid: true,
      loading: false,
      searchOption: { date: [], enable: null, isMarquee: null, isHomePagePopup: null },
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['Created'],
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
          lang: 'cms_help_language',
          text: '语系',
          value: 'language_code',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'status',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_help_columns_code',
          text: '欄位',
          value: 'code',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_help_columns_title',
          text: '帮助中心标题',
          value: 'title',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_help_columns_updagteTime',
          text: '更新时间',
          value: 'update_time',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_help_columns_operator',
          text: '操作者',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      infoBox: false,
      initTinyMceSetting: {
        selector: 'textarea',
        height: 300,
        max_height: 350,
        min_height: 300,
        language: 'zh_CN',
        fontsize_formats: '8px 10px 12px 14px 18px 24px 36px',
        toolbar:
          'code | fontsizeselect | forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent ',
      },
      helpObject: {
        content: '',
      },
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
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
    status: {
      get() {
        return this.helpObject.status == 1;
      },
      set(val) {
        this.helpObject.status = Number(val);
      },
    },
    codeMap() {
      return new Map(codeData.map(({ code, name }) => [code, name]));
    },
    codeSelectItems() {
      return codeData.map(({ code, name }) => ({ value: code, text: name }));
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
      };
      api
        .get('/cms/helper/list', params)
        .then(data => {
          this.desserts = data.result ?? [];
          this.pagination.length = data.pageNum;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    loadSingle(obj) {
      this.isNewData = false;
      api
        .get(`/cms/helper/${obj.id}`)
        .then(data => {
          this.helpObject = {
            ...data.result,
            ...obj,
          };
          this.infoBox = true;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    mergeStatus(id, status) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: `${status == 0 ? this.$t('cms_help_check_item_disable') : this.$t('cms_help_check_item_enable')}`,
        ok() {
          api
            .put(`/cms/helper/${id}`, { status })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadData(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    confirmEvent() {
      return this.isNewData ? this.postData() : this.mergeData();
    },
    mergeData() {
      const $this = this;
      if (this.$refs.form.validate()) {
        const url = `/cms/helper/${$this.helpObject.id}`;
        api
          .put(url, {
            title: this.helpObject.title,
            code: this.helpObject.code,
            language_code: this.helpObject.language_code,
            content: this.helpObject.content ?? '',
            status: this.helpObject.status * 1,
          })
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadData();
            $this.infoBox = false;
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
          });
      }
    },
    createSingle() {
      this.helpObject = {
        content: '',
      };
      this.isNewData = true;
      this.infoBox = true;
    },
    postData() {
      const $this = this;
      if (this.$refs.form.validate()) {
        const url = `/cms/helper`;
        api
          .post(url, {
            title: this.helpObject.title,
            code: this.helpObject.code,
            language_code: this.helpObject.language_code,
            content: this.helpObject.content ?? '',
            status: this.helpObject.status * 1,
          })
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadData();
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
          })
          .finally(() => {
            $this.infoBox = false;
            $this.isNewData = false;
          });
      }
    },
  },
};
</script>
