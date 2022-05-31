<template>
  <div class="Announcement">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 新增按鈕 -->
      <!-- <v-tooltip bottom>
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
      </v-tooltip> -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="add">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_announcement_add_anno') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          no-data-text="暂无结果"
          :headers="headerComputed"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :items="listData"
          :loading="loading"
          :disable-sort="loading"
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
                    <v-btn icon color="primary" v-bind="attrs" @click="edit(item)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="deleteItem(item.id)" v-on="on">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_delete') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn v-if="item.status == 0" icon color="red" v-bind="attrs" @click="setStatus(item.id, 1)" v-on="on">
                      <v-icon>do_not_disturb_on</v-icon>
                    </v-btn>
                    <v-btn v-else icon color="green" v-bind="attrs" @click="setStatus(item.id, 0)" v-on="on">
                      <v-icon>remove_red_eye</v-icon>
                    </v-btn>
                  </template>
                  <span v-if="item.status == 0">{{ $t('g_btn_disable') }}</span>
                  <span v-else>{{ $t('g_btn_enable') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="copy(item)" v-on="on">
                      <v-icon>copy</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_copy') }}</span>
                </v-tooltip>
              </td>
              <td class="text-left text-no-wrap">{{ item.id }}</td>
              <!-- <td class="text-left text-no-wrap">
                <v-chip label outlined small :color="typeColors[item.Type]"> {{ $t(`cms_announcement_${types[item.Type]}`) }} </v-chip>
              </td> -->
              <td class="text-left">
                {{ item.title.length > 20 ? `${item.title.substr(0, 20)}...` : item.title }}
                <v-tooltip bottom max-width="600px">
                  <template #activator="{ on }">
                    <span v-on="on">
                      <v-btn text color="primary" x-small depressed><v-icon small>open_in_new</v-icon></v-btn>
                    </span>
                  </template>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span v-html="pureHtml(item.content || '')"></span>
                </v-tooltip>
              </td>
              <td class="text-left text-no-wrap" nowrap>
                {{ item.startTime ? new Date(item.startTime).Format('yyyy-MM-dd') : '' }} ~
                {{ item.endTime ? new Date(item.endTime).Format('yyyy-MM-dd') : '' }}
              </td>
              <td class="text-left text-no-wrap">{{ item.sort }}</td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="item.status == 1 ? `red` : `green`">
                  {{ item.status == 1 ? $t('g_btn_disable') : $t('g_btn_enable') }}
                </v-chip>
              </td>
              <td class="text-center text-no-wrap">
                <img v-if="item.pictures.pc.loaded" width="101" :src="item.pictures.pc.src" />
              </td>
              <td class="text-center text-no-wrap">
                <img v-if="item.pictures.mobile.loaded" width="101" :src="item.pictures.mobile.src" />
              </td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.createBy }}</td>
              <td class="text-left text-no-wrap">{{ item.updated | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.updateBy || `--` }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;
            <v-select v-model="pagination.itemsPerPage" class="diy-page-select" :items="selectItems"> </v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 新增文章彈窗 -->
    <v-dialog v-model="editBox" persistent width="60%" eager>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2"> {{ $t(`sidebar_${$route.name}`) }} </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="editBox = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap align="baseline">
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_announcement_announcement_title') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field
                  v-model="newItem.title"
                  type="text"
                  :label="$t('cms_announcement_text_title')"
                  :placeholder="$t('cms_announcement_placeholder_title2')"
                  :rules="[v => !!v || $t('cms_announcement_rules_title')]"
                >
                </v-text-field>
              </v-col>
              <template v-for="(picture, i) in newItem.pictures">
                <v-col :key="`label_${i}`" cols="2" class="d-flex align-center justify-start">
                  <v-icon small color="red" class="mr-1">star</v-icon>
                  <v-label> {{ $t(picture.label) }} </v-label>
                </v-col>
                <v-col :key="`picture_${i}`" cols="10">
                  <vue-core-image-upload
                    class="v-btn blue-grey white--text ma-1 pa-1"
                    :crop="false"
                    :max-file-size="4096 * 4096"
                    text=""
                    url="/api/global/file"
                    :headers="uploadHeader"
                    @imageuploaded="res => imageuploaded(res, picture)"
                    @errorhandle="imageError($event, picture)"
                  >
                    {{ $t('cms_announcement_uploadPic') }}
                    <v-icon right dark>cloud_upload</v-icon>
                  </vue-core-image-upload>
                  <small>{{ $t('cms_announcement_pcPicRecomm') }}</small>
                  <v-card style="display: flex; justify-content: center; align-items: center">
                    <v-img v-if="picture.loaded" :height="picture.loaded ? `200px` : `auto`" :src="picture.src"></v-img>
                  </v-card>
                </v-col>
              </template>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('cms_announcement_announcement_content') }} </v-label>
              </v-col>
              <v-col cols="10">
                <editor
                  v-if="editBox"
                  v-model="newItem.editor.content"
                  :value="newItem.editor.content"
                  :api-key="$store.getters.tinymceKey"
                  :init="initTinyMceSetting"
                ></editor>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('cms_announcement_during_the_shelves') }} </v-label>
              </v-col>
              <v-col cols="10">
                <datetime-range v-model="newItem.duration" range-separator="g_datePick_to2" />
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('g_table_column_sort') }}</v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field v-model.number="newItem.sort" type="number" :placeholder="$t('cms_announcement_sort_tips')"> </v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="save()"> {{ $t('g_btn_confirm') }}</v-btn>
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
import { pureHtml, formatDate } from '@/filters/custom';

export default {
  name: 'Article',
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
    Editor,
  },
  data() {
    const defaultItem = {
      editor: {
        content: '',
      },
      pictures: {
        pc: {
          loaded: false,
          src: '',
          label: 'cms_announcement_pcPic',
        },
        mobile: {
          loaded: false,
          src: '',
          label: 'cms_announcement_mobilePic',
        },
      },
    };
    return {
      selectItems: [10, 25, 50, 100],
      valid: true,
      searchShow: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: [],
        sortDesc: [],
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
          value: 'id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_column_announcement_title',
          text: '标题',
          value: 'title',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_column_during_loading_and_unloading',
          text: '上下架期间',
          value: 'duration',
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
          lang: 'g_table_column_status',
          text: '状态',
          value: 'deleted',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_announcement_pcPic',
          text: 'PC版图片',
          value: 'pcImageUrl',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_announcement_mobilePic',
          text: '手机版图片',
          value: 'mobileImageUrl',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_createdBy',
          text: '創建人',
          value: 'createBy',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_updated',
          text: '更新時間',
          value: 'updated',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_announcement_column_operator',
          text: '操作者',
          value: 'updatedby',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        // {
        //   lang: 'cms_announcement_column_status',
        //   text: 'deleted',
        //   value: 'deleted',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        // },
      ],
      listData: [],
      editBox: false,
      newItem: defaultItem,
      initTinyMceSetting: {
        selector: 'textarea',
        height: 300,
        max_height: 350,
        min_height: 300,
        language: 'zh_CN',
        // plugins: 'advcode',
        fontsize_formats: '8px 10px 12px 14px 18px 24px 36px',
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste imagetools wordcount',
        ],
        toolbar:
          'insertfile undo redo | link | code | fontsizeselect | forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent ',
        // content_css: '//www.tiny.cloud/css/codepen.min.css',
        // images_upload_url: '/api/global/file',
        images_upload_handler: this.imagesUploadHandler,
        automatic_uploads: true,
      },
      duration: [],
      defaultItem,
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
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    imagesUploadHandler(blobInfo, success, failure) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/global/file');
      xhr.setRequestHeader('Authorization', this.uploadHeader.Authorization); // manually set header
      xhr.onload = () => {
        if (xhr.status !== 200) {
          failure(`HTTP Error: ${xhr.status}`);
          return;
        }
        const json = JSON.parse(xhr.responseText);
        if (!json || typeof json.result[0] !== 'string') {
          failure(`Invalid JSON: ${xhr.responseText}`);
          return;
        }
        success(json.result[0]);
      };
      const formData = new FormData();
      formData.append('files', blobInfo.blob(), blobInfo.filename());
      xhr.send(formData);
    },
    imageuploaded(res, obj) {
      obj.loaded = false;
      this.$forceUpdate();
      if (res.result != '') {
        this.$store.commit('MsgOk', this.$t('cms_announcement_upload_pic_success'));
        obj.src = res.result[0];
        this.testImage(obj);
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    testImage(obj) {
      const tester = new Image();
      obj.loaded = false;
      tester.onload = () => {
        obj.loaded = true;
        this.$forceUpdate();
      };
      tester.src = obj.src;
    },
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
        // sort: this.pagination.sortBy[0],
        // asc: !this.pagination.sortDesc[0],
      };
      api
        .get('/cms/articles', params)
        .then(data => {
          this.listData =
            data.result.map(item => {
              item.duration = [item.startTime, item.endTime];
              item.editor = {
                content: item.content,
              };
              item.pictures = {
                pc: {
                  src: item.pcImageUrl,
                },
                mobile: {
                  src: item.mobileImageUrl,
                },
              };
              this.testImage(item.pictures.pc);
              this.testImage(item.pictures.mobile);
              return item;
            }) ?? [];
          this.pagination.totalItems = data.total;
          this.pagination.length = data.result.length ? Math.ceil(data.total / this.pagination.itemsPerPage) : 0;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    add() {
      this.newItem = _.cloneDeep(this.defaultItem);
      this.editBox = true;
    },
    edit(item) {
      this.newItem = _.cloneDeep(item);
      this.newItem.duration = [formatDate(Date(item.startTime)), formatDate(Date(item.endTime))];
      this.editBox = true;
    },
    copy(item) {
      this.newItem = _.cloneDeep(item);
      delete this.newItem.id;
      this.save();
    },
    setStatus(id, status) {
      this.$store.commit('Confirm', {
        text: this.$t('cms_announcement_check_disable'),
        ok: () => {
          api
            .put(`cms/article/status/${id}`, { status })
            .then(() => {
              this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
              this.loadData(1);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    deleteItem(id) {
      this.$store.commit('Confirm', {
        text: this.$t('cms_announcement_check_delete'),
        ok: () => {
          api
            .delete(`/cms/article/${id}`)
            .then(() => {
              this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
              this.loadData(1);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    save() {
      this.newItem.content = this.newItem.editor.content;
      if (!this.newItem.duration || this.newItem.duration.length != 2) {
        this.newItem.duration = [new Date(), new Date(new Date() * 1 + (365 * 10 + 2) * 60 * 60 * 24 * 1000)];
      }
      this.newItem.startTime = new Date(this.newItem.duration[0]);
      this.newItem.endTime = new Date(this.newItem.duration[1]);
      this.newItem.pcImageUrl = this.newItem.pictures.pc.src;
      this.newItem.mobileImageUrl = this.newItem.pictures.mobile.src;
      if (this.$refs.form && this.$refs.form.validate()) {
        if (!this.newItem.title) {
          this.$store.commit('MsgError', this.$t('cms_announcement_msg_titleNoEmpty'));
          return;
        } else if (!this.newItem.content) {
          this.$store.commit('MsgError', this.$t('cms_announcement_msg_contentNoEmpty'));
          return;
        } else if (!this.newItem.pcImageUrl || !this.newItem.mobileImageUrl) {
          this.$store.commit('MsgError', this.$t('cms_announcement_upload_no_empty'));
          return;
        }
        delete this.newItem.duration;
        delete this.newItem.pictures;
        delete this.newItem.editor;
      }
      const url = `/cms/article${this.newItem.id ? `/${this.newItem.id}` : ''}`;
      api[this.newItem.id ? 'put' : 'post'](url, this.newItem)
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.loadData();
          this.editBox = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
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
    pureHtml,
  },
};
</script>
