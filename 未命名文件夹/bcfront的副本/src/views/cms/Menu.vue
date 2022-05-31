<template>
  <div class="Menu">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 展開按鈕 -->

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData()">
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
        <v-row dense class="align-center">
          <v-col>
            <v-select
              v-model="searchOption.group"
              hide-details
              solo
              label="分組"
              placeholder="分組"
              :items="[
                { value: 'pc_main_menu', text: 'PC' },
                { value: 'h5_main_menu', text: 'Mobile' },
              ]"
            >
            </v-select>
          </v-col>
          <v-col>
            <v-select v-model="searchOption.languageCode" hide-details solo label="语系" placeholder="语系" :items="i18nSelectItems"> </v-select>
          </v-col>
          <v-col>
            <v-text-field
              v-model="searchOption.title"
              clearable
              hide-details
              solo
              persistent-hint
              label="名称"
              placeholder="名称"
              @keydown.enter="loadData()"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              v-model="searchOption.showtitle"
              clearable
              hide-details
              solo
              persistent-hint
              label="显示名称"
              placeholder="显示名称"
              @keydown.enter="loadData()"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.showfront"
              hide-details
              solo
              clearable
              label="前台显示"
              placeholder="前台显示"
              :items="[
                { value: null, text: '不选择' },
                { value: 1, text: '显示' },
                { value: 0, text: '不显示' },
              ]"
            >
            </v-select>
          </v-col>
        </v-row>
      </v-card>

      <!-- 前台目录显示方式 PC Mobile -->
      <v-card elevation="0" class="pa-3 mb-3 rounded-lg" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <!-- <v-col cols="6"> <h4>前台目录显示方式 : 1.文字 2.icon 3.图片 4.文字 + 图片 5.文字 + icon</h4> </v-col> -->
          <v-col class="d-flex align-center">
            <template v-if="menuConfig.pc_menu_type">
              <h2>PC显示方式</h2>
              <v-col> <v-select v-model="menuConfig.pc_menu_type.Val" :items="menutypeSelectItems"></v-select> </v-col>
              <v-col>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      color="primary"
                      class="elevation-0"
                      fab
                      dark
                      small
                      medium
                      depressed
                      v-on="on"
                      @click="updateConfig(menuConfig.pc_menu_type)"
                    >
                      <v-icon>save</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('system_configure_updateConfig') }}</span>
                </v-tooltip>
              </v-col>
            </template>
          </v-col>
          <v-col class="d-flex align-center">
            <template v-if="menuConfig.h5_menu_type">
              <h2>Mobile显示方式</h2>
              <v-col> <v-select v-model="menuConfig.h5_menu_type.Val" :items="menutypeSelectItems"></v-select> </v-col>
              <v-col>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      color="primary"
                      class="elevation-0"
                      fab
                      dark
                      small
                      medium
                      depressed
                      v-on="on"
                      @click="updateConfig(menuConfig.h5_menu_type)"
                    >
                      <v-icon>save</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('system_configure_updateConfig') }}</span>
                </v-tooltip>
              </v-col>
            </template>
          </v-col>
        </v-row>
      </v-card>

      <!-- 表格 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table :headers="headerComputed" :items="desserts" :loading="loading" :options.sync="pagination" class="elevation-0">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left text-no-wrap">{{ item.Id }}</td>
              <td class="text-left text-no-wrap">
                {{ item.Title }}
              </td>
              <td class="text-left text-no-wrap">
                <v-text-field v-model="item.ShowTitle" type="text" label="" :rules="[v => !!v || '请填写内容']"> </v-text-field>
              </td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary">
                  {{ { pc_main_menu: 'PC 版', h5_main_menu: 'Mobile 版' }[item.Group] }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">
                {{ i18nItemsMap.has(item.LanguageCode) ? i18nItemsMap.get(item.LanguageCode).value : item.LanguageCode }}
              </td>
              <td class="text-left text-no-wrap">
                <div class="d-flex align-center justify-start">
                  <img v-if="item.Pic" :src="item.Pic" style="max-width: 150px" class="mr-2" />
                  <vue-core-image-upload
                    ref="uploaderFavicon"
                    class="v-btn blue-grey white--text pa-1"
                    :crop="false"
                    :max-file-size="4096 * 4096"
                    text=""
                    url="/api/global/file"
                    :headers="uploadHeader"
                    @imageuploaded="res => imageUploaded(res, item)"
                    @errorhandle="imageError($event, i)"
                  >
                    <v-icon dark>cloud_upload</v-icon>
                  </vue-core-image-upload>
                </div>
              </td>
              <td class="text-left text-no-wrap">
                <v-text-field v-model="item.Icon" type="text" label="" :rules="[v => !!v || '请填写内容']"> </v-text-field>
              </td>
              <td class="text-left text-no-wrap">
                <template v-if="item.IsEdit">
                  <v-text-field v-model="item.Action" type="text" label="" :rules="[v => !!v || '请填写内容']"> </v-text-field>
                </template>
                <template v-else> {{ item.Action }} </template>
              </td>
              <td class="text-left text-no-wrap">
                <v-text-field v-model="item.Order" type="text" label="" :rules="[v => !!v || '请填写内容']"> </v-text-field>
              </td>
              <td class="text-left text-no-wrap">
                <v-switch v-model="item.ShowFront" color="primary" :loading="item.loading"></v-switch>
              </td>
              <td class="text-left text-no-wrap">
                <v-switch v-model="item.Blank" color="primary" :loading="item.loading"></v-switch>
              </td>
              <td class="text-center">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="updateMenu(item)">
                      <v-icon>save</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_update') }}</span>
                </v-tooltip>
              </td>
            </tr>
          </template>
        </v-data-table>
        <!-- <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div> -->
      </v-card>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';
import i18nMixin from '../../mixin/i18nMixin.js';

const menutypeList = [
  ['1', '文字'],
  ['4', '文字 + 图片'],
];

export default {
  name: 'MyMenu',
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
  },
  mixins: [i18nMixin],
  data() {
    const defaultSearchOption = { group: 'pc_main_menu' };
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      valid: true,
      searchShow: true,
      loading: false,
      defaultSearchOption,
      searchOption: defaultSearchOption,
      infoBox: false,
      menu: {},
      headers: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          editable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_name',
          text: '名称',
          value: 'Title',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_menu_column_showTitle',
          text: '显示名称',
          value: 'ShowTitle',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_menu_column_group',
          text: '组别',
          value: 'Group',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_help_language',
          text: '语系',
          value: 'LanguageCode',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_menu_column_Pic',
          text: '图片',
          value: 'Pic',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'icon',
          text: 'icon',
          value: 'Icon',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_menu_column_link',
          text: '链接',
          value: 'Action',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_sort',
          text: '排序',
          value: 'Order',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_menu_column_showFront',
          text: '前台显示',
          value: 'ShowFront',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_menu_column_Blank',
          text: '是否另開',
          value: 'Blank',
          sortable: false,
          editable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'actions',
          sortable: false,
          editable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      desserts: [],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 15,
        sortBy: [],
        sortDesc: [],
      },
      menuConfig: {},
    };
  },
  computed: {
    menutypeMap() {
      return new Map(menutypeList);
    },
    menutypeSelectItems() {
      return menutypeList.map(([value, text]) => ({ text, value }));
    },
    config() {
      return this.$store.getters.config;
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
  },
  created() {
    this.loadData();
    this.loadConfig();
  },
  methods: {
    loadData() {
      this.loading = true;
      const { group, title, showtitle, showfront, languageCode } = this.searchOption;
      const params = {
        ...(group != null && { group }),
        ...(showfront != null && { showfront }),
        ...(title && { title }),
        ...(showtitle && { showtitle }),
        ...(languageCode && { languageCode }),
      };
      api
        .get('/system/menus', params)
        .then(data => {
          this.desserts = data.result;
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    loadConfig() {
      api
        .get(`/system/configs`)
        .then(data => {
          const conf = {
            pc_menu_type: data.result.find(item => item.Code == 'pc_menu_type'),
            h5_menu_type: data.result.find(item => item.Code == 'h5_menu_type'),
          };
          this.menuConfig = conf;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    updateMenu(item) {
      api
        .put(`/system/menu/${item.Id}`, {
          title: item.Title,
          showtitle: item.ShowTitle,
          group: item.Group,
          pic: item.Pic,
          icon: item.Icon,
          action: item.Action,
          order: item.Order * 1,
          showfront: Number(item.ShowFront),
          blank: item.Blank,
        })
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.loadData();
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    save() {
      api
        .put(`/system/menu/`, {
          title: this.menu.Title,
          showtitle: this.menu.ShowTitle,
          group: this.menu.Group,
          pic: this.menu.Pic,
          icon: this.menu.Icon,
          action: this.menu.Action,
          order: Number(this.menu.Order),
          showfront: Number(this.menu.ShowFront),
        })
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.loadData();
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    toggle(item) {
      api
        .put(`/system/menu/${item.Id}`, {
          title: item.Title,
          showtitle: item.ShowTitle,
          group: item.Group,
          pic: item.Pic,
          action: item.Action,
          order: item.Order * 1,
          showfront: Number(item.ShowFront),
        })
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.loadData();
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    imageUploaded(res, item) {
      if (res.result != '' && !/500 Internal Server Error/gi.test(res)) {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        item.Pic = res.result[0];
        this.$forceUpdate();
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    imageError(error, index) {
      if (index) {
        document.querySelectorAll('input[type=file]')[index].value = '';
      }
      const isSizeExceed = /FILE IS TOO LARGER/gi.test(error);
      this.$store.commit('MsgError', isSizeExceed ? this.$t('cms_spotlight_msg_fileToBig1M') : '');
    },
    resetOptions() {
      this.searchOption = this.defaultSearchOption;
    },
    addMenu() {
      this.menu = {};
      this.infoBox = true;
    },
    updateConfig(setting) {
      api
        .post(`system/config/${setting.Code}`, setting)
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.loadConfig();
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
