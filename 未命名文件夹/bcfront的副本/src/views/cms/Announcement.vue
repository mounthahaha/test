<template>
  <div class="Announcement">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 新增公告 展開按鈕 -->
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
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="addAnnouncement">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_announcement_add_anno') }}</span>
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
              v-model="searchOption.title"
              clearable
              hide-details
              solo
              persistent-hint
              :placeholder="$t('cms_announcement_placeholder_title')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.enable"
              hide-details
              solo
              persistent-hint
              :items="[
                { text: $t('g_selector_status'), value: null },
                { text: $t('g_btn_enable'), value: 0 },
                { text: $t('g_btn_disable'), value: 1 },
              ]"
            ></v-select>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.isMarquee"
              hide-details
              solo
              persistent-hint
              :items="[
                { text: $t('cms_announcement_options_marquee'), value: null },
                { text: $t('g_btn_yes'), value: true },
                { text: $t('g_btn_no'), value: false },
              ]"
            ></v-select>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.isBulletinBoard"
              hide-details
              solo
              persistent-hint
              :items="[
                { text: $t('cms_announcement_options_home_page_popup'), value: null },
                { text: $t('g_btn_yes'), value: true },
                { text: $t('g_btn_no'), value: false },
              ]"
            ></v-select>
          </v-col>
          <v-col>
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          no-data-text="暂无结果"
          :headers="headerComputed"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :items="desserts"
          :loading="loading"
          :disable-sort="loading"
          class="elevation-0"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
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
                    <v-btn icon color="primary" v-bind="attrs" @click="updateAnnouncement(item)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="deleteItem(item.Id)" v-on="on">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_delete') }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn v-if="item.Deleted == false" icon color="red" v-bind="attrs" @click="offline(item.Id)" v-on="on">
                      <v-icon>do_not_disturb_on</v-icon>
                    </v-btn>
                    <v-btn v-else icon color="green" v-bind="attrs" @click="online(item.Id)" v-on="on">
                      <v-icon>remove_red_eye</v-icon>
                    </v-btn>
                  </template>
                  <span v-if="item.Deleted == false">{{ $t('g_btn_disable') }}</span>
                  <span v-else>{{ $t('g_btn_enable') }}</span>
                </v-tooltip>
              </td>
              <td class="text-left text-no-wrap">{{ item.Id }}</td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small :color="typeColors[item.Type]"> {{ $t(`cms_announcement_${types[item.Type]}`) }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">
                {{ i18nItemsMap.has(item.LanguageCode) ? i18nItemsMap.get(item.LanguageCode).value : item.LanguageCode }}
              </td>
              <td class="text-left" style="max-width: 180px">
                {{ item.Title }}
                <v-tooltip bottom max-width="600px">
                  <template #activator="{ on }">
                    <span v-on="on">
                      <v-btn text color="primary" x-small depressed><v-icon small>open_in_new</v-icon></v-btn>
                    </span>
                  </template>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span v-html="pureHtml(item.Content)"></span>
                </v-tooltip>
              </td>
              <td class="text-left text-no-wrap">{{ item.PriorityOrder }}</td>
              <td class="text-left text-no-wrap" nowrap>
                {{ item.StartTime ? new Date(item.StartTime).Format('yyyy-MM-dd') : '' }} ~
                {{ item.EndTime ? new Date(item.EndTime).Format('yyyy-MM-dd') : '' }}
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="item.Deleted ? `red` : `green`">
                  {{ item.Deleted ? $t('g_btn_disable') : $t('g_btn_enable') }}
                </v-chip>
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="item.IsMarquee ? `green` : `red`">
                  {{ item.IsMarquee ? $t('g_btn_yes') : $t('g_btn_no') }}
                </v-chip>
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="item.IsBulletinBoard ? `green` : `red`">
                  {{ item.IsBulletinBoard ? $t('g_btn_yes') : $t('g_btn_no') }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.Created | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.CreatebyDesc }}</td>
              <td class="text-left text-no-wrap">{{ item.Updated | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.UpdateName || `--` }}</td>
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

    <!-- 新增公告彈窗 -->
    <v-dialog v-model="infoBox" persistent width="60%" eager>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2"> {{ $t(`sidebar_${$route.name}`) }} </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap align="baseline">
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('cms_announcement_announcement_category') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-radio-group v-model="announcement.Type" row>
                  <v-radio
                    v-for="(item, i) in types"
                    :key="i"
                    :label="$t(`cms_announcement_${types[i]}`)"
                    :color="typeColors[i]"
                    :value="i"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_announcement_language_title') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-select v-model="announcement.LanguageCode" :items="i18nSelectItems"></v-select>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_announcement_announcement_title') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field
                  v-model="announcement.Title"
                  type="text"
                  :label="$t('cms_announcement_text_title')"
                  :placeholder="$t('cms_announcement_placeholder_title2')"
                  :rules="[v => !!v || $t('cms_announcement_rules_title')]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('cms_announcement_announcement_content') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-tabs slot="extension" v-model="contentType" class="pb-2">
                  <v-tabs-slider color="primary"></v-tabs-slider>
                  <v-tab
                    v-for="(tabLabel, index) in [$t('cms_announcement_text'), $t('cms_announcement_picture')]"
                    :key="index"
                    color="#f5f5f5"
                    @mousedown="contentTypeClick"
                    @change="contentTypeChange(index)"
                  >
                    {{ tabLabel }}
                  </v-tab>
                </v-tabs>
                <v-tabs-items v-model="contentType">
                  <v-tab-item>
                    <editor
                      v-if="contentType == 0 && infoBox"
                      v-model="editor.content"
                      :value="editor.content"
                      :api-key="$store.getters.tinymceKey"
                      :init="initTinyMceSetting"
                    ></editor>
                  </v-tab-item>
                  <v-tab-item>
                    <v-layout wrap align-center>
                      <v-col cols="2" class="d-flex align-center justify-start">
                        <v-icon small color="red" class="mr-1">star</v-icon>
                        <v-label> {{ $t('cms_announcement_pcPic') }} </v-label>
                      </v-col>
                      <v-col cols="10">
                        <vue-core-image-upload
                          class="v-btn blue-grey white--text ma-1 pa-1"
                          :crop="false"
                          :max-file-size="4096 * 4096"
                          text=""
                          url="/api/global/file"
                          :headers="uploadHeader"
                          @imageuploaded="imageuploadedPc"
                          @errorhandle="imageError($event, 0)"
                        >
                          {{ $t('cms_announcement_uploadPic') }}
                          <v-icon right dark>cloud_upload</v-icon>
                        </vue-core-image-upload>
                        <small>{{ $t('cms_announcement_pcPicRecomm') }}</small>
                        <v-card style="display: flex; justify-content: center; align-items: center">
                          <v-img v-if="trace.pc" :height="trace.pc ? `200px` : `auto`" :src="announcement.PicturePc"></v-img>
                        </v-card>
                      </v-col>
                      <v-col cols="2" class="d-flex align-center justify-start">
                        <v-icon small color="red" class="mr-1">star</v-icon>
                        <v-label> {{ $t('cms_announcement_mobilePic') }} </v-label>
                      </v-col>
                      <v-col cols="10" mt-5>
                        <vue-core-image-upload
                          class="v-btn blue-grey white--text ma-1 pa-1"
                          :crop="false"
                          :max-file-size="4096 * 4096"
                          text=""
                          url="/api/global/file"
                          :headers="uploadHeader"
                          @imageuploaded="imageuploadedMobile"
                          @errorhandle="imageError($event, 1)"
                        >
                          {{ $t('cms_announcement_uploadPic') }}
                          <v-icon right dark>cloud_upload</v-icon>
                        </vue-core-image-upload>
                        <small>{{ $t('cms_announcement_mobilePicRecomm') }}</small>
                        <v-card style="display: flex; justify-content: center; align-items: center">
                          <v-img v-if="trace.mobile" :height="trace.mobile ? `200px` : `auto`" :src="announcement.PictureMobile"> </v-img>
                        </v-card>
                      </v-col>
                    </v-layout>
                  </v-tab-item>
                </v-tabs-items>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('cms_announcement_during_the_shelves') }} </v-label>
              </v-col>
              <v-col cols="10">
                <datetime-range v-model="duration" />
              </v-col>
              <v-col v-if="announcement.marqueeEditable" cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('cms_announcement_marquee_settings') }}</v-label>
              </v-col>
              <v-col v-if="announcement.marqueeEditable" cols="10">
                <v-radio-group v-model="announcement.IsMarquee" hide-details class="d-inline-block" row>
                  <v-radio :label="$t('g_btn_yes')" color="red" :value="true"></v-radio>
                  <v-radio :label="$t('g_btn_no')" color="red" :value="false"></v-radio>
                </v-radio-group>
                <span v-if="announcement.IsMarquee" class="error--text">{{ $t('cms_announcement_marquee_tips') }}</span>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_announcement_column_home_page_popup_setting') }}</v-label>
              </v-col>
              <v-col cols="10">
                <v-radio-group v-model="announcement.isBulletinBoard" hide-details class="d-inline-block" row>
                  <v-radio :label="$t('g_btn_yes')" color="red" :value="true"></v-radio>
                  <v-radio :label="$t('g_btn_no')" color="red" :value="false"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('g_table_column_sort') }}</v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field v-model.number="announcement.PriorityOrder" type="number" :placeholder="$t('cms_announcement_sort_tips')">
                </v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeAnnouncement()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';
import Editor from '@tinymce/tinymce-vue';
import { pureHtml } from '@/filters/custom';
import { shortcuts } from '@/utils';
import i18nMixin from '../../mixin/i18nMixin.js';

export default {
  name: 'Announcement',
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
    Editor,
  },
  mixins: [i18nMixin],
  data() {
    return {
      contentType: null,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      valid: true,
      searchShow: true,
      loading: false,
      searchOption: { date: [], enable: null, isMarquee: null, isBulletinBoard: null },
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: [],
        sortDesc: [],
      },
      types: ['system', 'maintain', 'deposit_and_withdrawal', 'news'],
      typeColors: ['primary', 'secondary', 'success', 'warning'],
      datePickerOptions: {
        shortcuts,
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
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_column_announcement_category',
          text: '公告类别',
          value: 'type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_language_title',
          text: '语系',
          value: 'LanguageCode',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_column_announcement_title',
          text: '公告标题',
          value: 'title',
          width: '500px',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_sort',
          text: '排序',
          value: 'PriorityOrder',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_column_during_loading_and_unloading',
          text: '上下架期间',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'deleted',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_announcement_column_marquee_setting',
          text: '跑马灯设置',
          value: 'isMarquee',
          sortable: false,
          width: `10em`,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_announcement_column_home_page_popup_setting',
          text: '布告栏设置', // 首页盖台弹窗设置
          value: 'IsBulletinBoard',
          sortable: false,
          width: `10em`,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'Created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_createdBy',
          text: '創建人',
          value: 'CreatebyDesc',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_updated',
          text: '更新時間',
          value: 'Updated',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_column_operator',
          text: '操作者',
          value: 'UpdatebyName',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      infoBox: false,
      trace: {
        mobile: false,
        pc: false,
      },
      announcement: {
        PicturePc: '',
        PictureMobile: '',
      },
      editor: {
        content: '',
      },
      initTinyMceSetting: {
        selector: 'textarea',
        height: 300,
        max_height: 350,
        min_height: 300,
        language: 'zh_CN',
        // plugins: 'advcode',
        fontsize_formats: '8px 10px 12px 14px 18px 24px 36px',
        toolbar:
          'code | fontsizeselect | forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent ',
        // content_css: '//www.tiny.cloud/css/codepen.min.css',
      },
      duration: [],
      tmceInitialized: false,
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
    // this.infoBox = false;
  },
  methods: {
    imageuploadedPc(res) {
      const $this = this;
      if (res.result != '') {
        $this.$store.commit('MsgOk', $this.$t('cms_announcement_upload_pic_success'));
        $this.announcement.PicturePc = res.result[0];
        $this.testImage();
        $this.picErrorPc = false;
      } else {
        $this.$store.commit('MsgError', res.error);
      }
    },
    imageuploadedMobile(res) {
      const $this = this;
      if (res.result != '') {
        $this.$store.commit('MsgOk', $this.$t('cms_announcement_upload_pic_success'));
        $this.announcement.PictureMobile = res.result[0];
        $this.testImage();
        $this.picErrorMobile = false;
      } else {
        $this.$store.commit('MsgError', res.error);
      }
    },
    testImage() {
      const tester = new Image();
      const testerPC = new Image();
      const $this = this;
      $this.traceMobile = $this.tracePc = false;
      tester.onload = () => {
        $this.trace.mobile = true;
      };
      tester.src = $this.announcement.PictureMobile;

      testerPC.onload = () => {
        $this.trace.pc = true;
      };
      testerPC.src = $this.announcement.PicturePc;
    },
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
      if (this.searchOption.date && this.searchOption.date.length) {
        params.startTime = this.searchOption.date[0];
        params.endTime = this.searchOption.date[1];
      }
      api
        .get('/cms/announcements', params)
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
    addAnnouncement() {
      this.announcement = {
        PicturePc: '',
        PictureMobile: '',
      };
      this.duration = [new Date(), new Date(new Date() * 1 + (365 * 10 + 2) * 60 * 60 * 24 * 1000)];
      this.contentType = 0;
      this.announcement.PicturePc = this.announcement.PictureMobile = '';
      this.announcement.tracePc = this.announcement.traceMobile = false;
      this.announcement.marqueeEditable = true;
      this.infoBox = true;
      this.editor.content = '';
    },
    updateAnnouncement(item) {
      this.announcement = {
        PicturePc: '',
        PictureMobile: '',
      };
      this.announcement = _.cloneDeep(item);
      this.duration = [item.StartTime, item.EndTime];
      if (!this.announcement.Content) {
        this.contentType = 1;
        this.announcement.PicturePc = this.announcement.PicturePc ?? '';
        this.announcement.PictureMobile = this.announcement.PictureMobile ?? '';
        this.testImage(this.announcement);
        this.announcement.marqueeEditable = false;
      } else {
        this.contentType = 0;
        this.announcement.marqueeEditable = true;
      }
      this.announcement.isBulletinBoard = item.IsBulletinBoard;
      this.contentTypeChange(this.contentType);
      this.infoBox = true;
      this.editor.content = this.announcement.Content;
    },
    offline(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('cms_announcement_check_disable'),
        ok() {
          api
            .post(`/cms/announcement/offline/${id}`, { status })
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
    online(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('cms_announcement_check_enable'),
        ok() {
          api
            .post(`/cms/announcement/online/${id}`, { status })
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
    deleteItem(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('cms_announcement_check_delete'),
        ok() {
          api
            .post(`/cms/announcement/delete/${id}`)
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
    mergeAnnouncement() {
      const $this = this;
      $this.announcement.Content = $this.editor.content;
      if (this.$refs.form.validate()) {
        let url = '/cms/announcement';
        if ($this.announcement.Id > 0) {
          url += `/${$this.announcement.Id}`;
        }
        if (!$this.announcement.Title) {
          $this.$store.commit('MsgError', this.$t('cms_announcement_msg_titleNoEmpty'));
          return;
        } else if (!$this.announcement.Content && $this.contentType == 0) {
          $this.$store.commit('MsgError', this.$t('cms_announcement_msg_contentNoEmpty'));
          return;
        } else if ($this.contentType == 1 && (!$this.announcement.PicturePc || !$this.announcement.PictureMobile)) {
          $this.$store.commit('MsgError', this.$t('cms_announcement_upload_no_empty'));
          return;
          // } else if (!$this.duration[0] || !$this.duration[1]) {
          //   $this.$store.commit('MsgError', '请选择上架时间');
          //   return;
        }
        if (!$this.duration || $this.duration.length != 2) {
          // $this.$store.commit('MsgError', '启用时间不可为空');
          // return;
          $this.duration = [new Date(), new Date(new Date() * 1 + (365 * 10 + 2) * 60 * 60 * 24 * 1000)];
        }
        $this.announcement.StartTime = new Date($this.duration[0]);
        $this.announcement.EndTime = new Date($this.duration[1]);
        api
          .post(url, this.announcement)
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
    contentTypeChange(type) {
      this.contentType = type;
      switch (type) {
        case 0:
          this.announcement.PicturePc = this.announcement.PictureMobile = '';
          this.announcement.tracePc = this.announcement.traceMobile = false;
          this.announcement.marqueeEditable = true;
          break;

        default:
          this.editor.content = '';
          this.announcement.Content = '';
          this.announcement.IsMarquee = false;
          this.announcement.marqueeEditable = false;
          break;
      }
    },
    contentTypeClick($event) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('cms_announcement_only_pic'),
        ok() {
          $this.contentTypeChange($this.contentType == 1 ? 0 : 1);
        },
        cancel() {},
      });
      $event.preventDefault();
      $event.stopPropagation();
      return false;
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
    imageError(error, PcOrMobile) {
      if (PcOrMobile == 'pc') {
        document.querySelectorAll('input[type=file]')[0].value = '';
      } else {
        document.querySelectorAll('input[type=file]')[1].value = '';
      }
      const isSizeExceed = /FILE IS TOO LARGER/gi.test(error);
      this.$store.commit('MsgError', isSizeExceed ? this.$t('cms_announcement_upload_to_big') : '');
    },
    pureHtml(str) {
      return pureHtml(str);
    },
  },
};
</script>
